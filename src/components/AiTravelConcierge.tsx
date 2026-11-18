import { useState, useRef, useEffect } from 'react';
import { Send, Loader2, RotateCcw, Copy, Check, Sparkles, Calendar } from 'lucide-react';
import { DESTINATIONS, MONTHS_SHORT, formatMoney } from '../data/destinations';
import {
  generateLocalChatReply,
  generateLocalItinerary,
  type GeneratedItinerary,
} from '../utils/localConcierge';

interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
}

interface AiTravelConciergeProps {
  externalPrompt: string | null;
  contextDestination: string | null;
  onClearExternalPrompt: () => void;
}

const STARTER_QUESTIONS = [
  'Compare 3AC overnight train vs flight from Delhi to Udaipur & Jaipur',
  'Best heritage haveli hotels in Rajasthan under ₹4,000/night',
  'Where in India has the clearest weather during July monsoon?',
  'Plan a 5-day Rishikesh & Varanasi rail trip under ₹20,000',
];

function renderFormattedLines(text: string) {
  const lines = text.split('\n');
  return lines.map((line, i) => {
    const trimmed = line.trim();
    if (!trimmed) {
      return <div key={i} className="h-2" />;
    }
    const parts = line.split(/(\*\*[^*]+\*\*)/g);
    const formatted = parts.map((part, idx) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={idx} className="font-semibold text-[#1C1917]">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return part;
    });

    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      return (
        <div key={i} className="flex gap-2 pl-2">
          <span className="text-[#9A3412] select-none">•</span>
          <span>{formatted.map((p) => (typeof p === 'string' ? p.replace(/^[-*]\s*/, '') : p))}</span>
        </div>
      );
    }

    return (
      <p key={i} className="leading-relaxed">
        {formatted}
      </p>
    );
  });
}

export function AiTravelConcierge({
  externalPrompt,
  contextDestination,
  onClearExternalPrompt,
}: AiTravelConciergeProps) {
  const [activeMode, setActiveMode] = useState<'chat' | 'itinerary'>('chat');

  // Chat state
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      text: 'Namaste. Ask me anything about travelling across India—comparing train classes vs economy flights, neighborhood hotel picks in INR, monsoon-safe destinations, or custom multi-city budgets.',
    },
  ]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);
  const chatScrollRef = useRef<HTMLDivElement | null>(null);

  // Structured itinerary generator state
  const [destChoice, setDestChoice] = useState<string>('Udaipur & Jaipur');
  const [originCity, setOriginCity] = useState<string>('New Delhi');
  const [tripDays, setTripDays] = useState<number>(4);
  const [travelers, setTravelers] = useState<number>(2);
  const [budgetTier, setBudgetTier] = useState<string>('Comfort (₹3,500–₹6,000/day)');
  const [transportPreference, setTransportPreference] = useState<string>('Indian Railways 3AC / Vande Bharat');
  const [travelMonth, setTravelMonth] = useState<string>('November');
  const [interests, setInterests] = useState<string>('Heritage havelis, local street food & scenic train rides');
  const [isGeneratingPlan, setIsGeneratingPlan] = useState<boolean>(false);
  const [planError, setPlanError] = useState<string | null>(null);
  const [generatedPlan, setGeneratedPlan] = useState<GeneratedItinerary | null>(null);
  const [copiedPlan, setCopiedPlan] = useState<boolean>(false);

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages, isStreaming]);

  const sendChatMessage = async (promptText: string) => {
    const cleanText = promptText.trim();
    if (!cleanText || isStreaming) return;

    setChatError(null);
    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      text: cleanText,
    };
    const modelMsgId = `m-${Date.now() + 1}`;
    const historyToSend = messages
      .filter((m) => m.id !== 'welcome')
      .map((m) => ({ role: m.role, text: m.text }));

    setMessages((prev) => [...prev, userMsg, { id: modelMsgId, role: 'model', text: '' }]);
    setInput('');
    setIsStreaming(true);

    let receivedRemoteStream = false;

    try {
      const response = await fetch('/api/assistant/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: cleanText,
          history: historyToSend,
          contextDestination,
        }),
      });

      const contentType = response.headers.get('content-type') || '';
      if (!response.ok || !response.body || !contentType.includes('text/event-stream')) {
        throw new Error('Static browser fallback');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const events = buffer.split('\n\n');
        buffer = events.pop() ?? '';

        for (const evt of events) {
          if (!evt.startsWith('data: ')) continue;
          const payload = evt.slice(6).trim();
          if (payload === '[DONE]') break;
          const parsed = JSON.parse(payload) as { text?: string; error?: string };
          if (parsed.error) {
            throw new Error(parsed.error);
          }
          if (parsed.text) {
            receivedRemoteStream = true;
            setMessages((prev) =>
              prev.map((m) => (m.id === modelMsgId ? { ...m, text: m.text + parsed.text } : m))
            );
          }
        }
      }

      if (!receivedRemoteStream) {
        throw new Error('Empty remote stream');
      }
    } catch {
      // Static browser mode or unavailable backend: stream deterministic curated reply locally
      const localReply = generateLocalChatReply(cleanText, historyToSend, contextDestination);
      const chunks = localReply.split(/(?<=\s)/);
      let assembled = '';
      for (let i = 0; i < chunks.length; i += 3) {
        assembled += chunks.slice(i, i + 3).join('');
        const snapshot = assembled;
        setMessages((prev) =>
          prev.map((m) => (m.id === modelMsgId ? { ...m, text: snapshot } : m))
        );
        await new Promise((r) => setTimeout(r, 12));
      }
      setChatError(null);
    } finally {
      setIsStreaming(false);
    }
  };

  useEffect(() => {
    if (externalPrompt) {
      setActiveMode('chat');
      void sendChatMessage(externalPrompt);
      onClearExternalPrompt();
    }
  }, [externalPrompt]);

  const handleGenerateItinerary = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isGeneratingPlan) return;
    setPlanError(null);
    setIsGeneratingPlan(true);

    try {
      const res = await fetch('/api/assistant/itinerary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          destination: destChoice,
          originCity,
          days: tripDays,
          travelers,
          budgetTier,
          transportPreference,
          travelMonth,
          interests,
        }),
      });
      const contentType = res.headers.get('content-type') || '';
      if (!res.ok || !contentType.includes('application/json')) {
        throw new Error('Static browser fallback');
      }
      const data = (await res.json()) as GeneratedItinerary;
      if (!data || !Array.isArray(data.days)) {
        throw new Error('Invalid remote itinerary payload');
      }
      setGeneratedPlan(data);
    } catch {
      // Pure browser fallback using Yatra Atlas deterministic transit, hotel & seasonal engine
      const localPlan = generateLocalItinerary({
        destination: destChoice,
        originCity,
        days: tripDays,
        travelers,
        budgetTier,
        transportPreference,
        travelMonth,
        interests,
      });
      setGeneratedPlan(localPlan);
      setPlanError(null);
    } finally {
      setIsGeneratingPlan(false);
    }
  };

  const handleCopyPlan = async () => {
    if (!generatedPlan) return;
    const text = `${generatedPlan.tripTitle}
Season: ${generatedPlan.seasonSuitability}
Transit: ${generatedPlan.recommendedTransit}
Hotels: ${generatedPlan.recommendedStayNote}
Total Estimate: ${formatMoney(generatedPlan.totalEstimatedInr)} (${formatMoney(generatedPlan.costPerPersonInr)} per person)

${generatedPlan.days
  .map(
    (d) =>
      `Day ${d.dayNumber}: ${d.headline} (~${formatMoney(d.estimatedGroupSpendInr)})\nMorning: ${d.morning}\nAfternoon: ${d.afternoon}\nEvening: ${d.evening}`
  )
  .join('\n\n')}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedPlan(true);
      setTimeout(() => setCopiedPlan(false), 2000);
    } catch {
      // Ignore clipboard error
    }
  };

  return (
    <section id="ai-concierge" className="max-w-7xl mx-auto px-6 py-16">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold text-[#9A3412] tracking-[0.04em]">
            <span className="chapter-num text-sm mr-1.5">04.</span> AI Travel Concierge & Route Architect
          </p>
          <h2 className="editorial-display text-3xl sm:text-4xl font-semibold text-[#1C1917] mt-2 text-balance">
            Ask real questions or generate a tailored INR itinerary
          </h2>
          <p className="text-sm sm:text-base text-[#57534E] mt-3 leading-[1.68]">
            Compare Indian Railways vs domestic flights, request neighborhood hotel recommendations,
            or compile a complete day-by-day route plan in seconds.
          </p>
        </div>

        {/* Mode Switch */}
        <div className="inline-flex p-1 bg-[#E6DAC4] rounded-lg border border-[#D5C7AE] self-start">
          <button
            type="button"
            onClick={() => setActiveMode('chat')}
            className={`px-4 py-2 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
              activeMode === 'chat'
                ? 'bg-[#1C1917] text-white shadow-sm'
                : 'text-[#44403C] hover:text-[#1C1917]'
            }`}
          >
            Conversational Concierge
          </button>
          <button
            type="button"
            onClick={() => setActiveMode('itinerary')}
            className={`px-4 py-2 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
              activeMode === 'itinerary'
                ? 'bg-[#1C1917] text-white shadow-sm'
                : 'text-[#44403C] hover:text-[#1C1917]'
            }`}
          >
            AI Itinerary & Hotel Builder
          </button>
        </div>
      </div>

      {activeMode === 'chat' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Starter Prompts Sidebar */}
          <div className="lg:col-span-4 bg-[#FAF6EE] border border-[#D5C7AE] rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-semibold text-[#1C1917]">Curated Travel Prompts</h3>
            <p className="text-xs text-[#78716C] leading-relaxed">
              Click any prompt to ask about rail classes, flight routes, hotel neighborhoods, or regional seasons.
            </p>
            <div className="space-y-2">
              {STARTER_QUESTIONS.map((q) => (
                <button
                  key={q}
                  type="button"
                  disabled={isStreaming}
                  onClick={() => void sendChatMessage(q)}
                  className="w-full text-left px-3.5 py-2.5 text-xs text-[#44403C] bg-[#EFE6D5]/55 hover:bg-[#E6DAC4] border border-[#D5C7AE] rounded-lg transition-colors leading-snug"
                >
                  {q}
                </button>
              ))}
            </div>

            {contextDestination && (
              <div className="pt-3 border-t border-[#E6DAC4]">
                <p className="text-xs text-[#78716C]">
                  Active focus: <strong className="text-[#1C1917]">{contextDestination}</strong>
                </p>
              </div>
            )}
          </div>

          {/* Chat Thread Panel */}
          <div className="lg:col-span-8 bg-[#FAF6EE] border border-[#C9B99B] rounded-xl overflow-hidden flex flex-col h-[540px]">
            <div className="px-5 py-3.5 border-b border-[#E6DAC4] flex items-center justify-between bg-[#F2E9D9]">
              <span className="text-xs font-medium text-[#57534E]">
                Yatra Atlas Travel Assistant
              </span>
              <button
                type="button"
                onClick={() => {
                  setMessages([messages[0]]);
                  setChatError(null);
                }}
                className="inline-flex items-center gap-1.5 text-xs text-[#57534E] hover:text-[#1C1917]"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset chat
              </button>
            </div>

            <div ref={chatScrollRef} className="flex-1 overflow-y-auto p-5 space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-xl px-4 py-3 text-sm ${
                      msg.role === 'user'
                        ? 'bg-[#1E3A8A] text-white'
                        : 'bg-[#F4EFE6] text-[#1C1917] border border-[#E5DEC9]'
                    }`}
                  >
                    {msg.role === 'user' ? (
                      <p>{msg.text}</p>
                    ) : msg.text ? (
                      <div className="space-y-1.5">{renderFormattedLines(msg.text)}</div>
                    ) : (
                      <div className="flex items-center gap-2 text-xs text-[#57534E]">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Checking routes, hotel tiers & current estimates...
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {chatError && (
                <div
                  role="alert"
                  className="p-3.5 rounded-lg bg-[#9A3412]/10 border border-[#9A3412]/30 text-xs text-[#9A3412]"
                >
                  {chatError}
                </div>
              )}
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                void sendChatMessage(input);
              }}
              className="p-4 border-t border-[#EFEAE0] bg-white flex items-center gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about train vs flight prices, hotel areas, or seasonal budgets..."
                className="flex-1 px-4 py-2.5 text-sm bg-[#FBF9F5] border border-[#D6CEBE] rounded-lg text-[#1C1917] placeholder:text-[#78716C] focus:outline-none focus:border-[#1E3A8A]"
              />
              <button
                type="submit"
                disabled={!input.trim() || isStreaming}
                className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-medium bg-[#1C1917] text-white rounded-lg hover:bg-[#292524] disabled:opacity-40 transition-colors whitespace-nowrap"
              >
                {isStreaming ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                Send
              </button>
            </form>
          </div>
        </div>
      ) : (
        /* Structured Itinerary Builder */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <form
            onSubmit={handleGenerateItinerary}
            className="lg:col-span-5 bg-[#FAF6EE] border border-[#D5C7AE] rounded-xl p-6 space-y-4"
          >
            <h3 className="font-serif text-xl font-semibold text-[#1C1917]">
              Custom Trip Brief
            </h3>

            <div>
              <label htmlFor="ai-dest" className="block text-xs font-medium text-[#57534E] mb-1">
                Destination or Circuit
              </label>
              <input
                id="ai-dest"
                type="text"
                list="india-dest-suggestions"
                value={destChoice}
                onChange={(e) => setDestChoice(e.target.value)}
                placeholder="e.g., Amritsar & Dharamshala, Srinagar, Udaipur"
                className="w-full px-3 py-2 text-sm bg-[#EFE6D5]/60 border border-[#C9B99B] rounded-lg"
                required
              />
              <datalist id="india-dest-suggestions">
                {DESTINATIONS.map((d) => (
                  <option key={d.id} value={`${d.name}, ${d.state}`} />
                ))}
                <option value="Northwest Loop (Amritsar, Dharamshala & Srinagar)" />
                <option value="Golden Triangle (Delhi, Agra & Jaipur)" />
                <option value="Spiti Valley & Shimla, Himachal Pradesh" />
              </datalist>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="ai-origin" className="block text-xs font-medium text-[#57534E] mb-1">
                  Origin City
                </label>
                <input
                  id="ai-origin"
                  type="text"
                  value={originCity}
                  onChange={(e) => setOriginCity(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-[#EFE6D5]/60 border border-[#C9B99B] rounded-lg"
                />
              </div>
              <div>
                <label htmlFor="ai-month" className="block text-xs font-medium text-[#57534E] mb-1">
                  Travel Month
                </label>
                <select
                  id="ai-month"
                  value={travelMonth}
                  onChange={(e) => setTravelMonth(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-[#EFE6D5]/60 border border-[#C9B99B] rounded-lg"
                >
                  {MONTHS_SHORT.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="ai-days" className="block text-xs font-medium text-[#57534E] mb-1">
                  Duration ({tripDays} days)
                </label>
                <input
                  id="ai-days"
                  type="number"
                  min={2}
                  max={10}
                  value={tripDays}
                  onChange={(e) => setTripDays(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm bg-[#EFE6D5]/60 border border-[#C9B99B] rounded-lg digit-tabular"
                />
              </div>
              <div>
                <label htmlFor="ai-group" className="block text-xs font-medium text-[#57534E] mb-1">
                  Travelers
                </label>
                <input
                  id="ai-group"
                  type="number"
                  min={1}
                  max={8}
                  value={travelers}
                  onChange={(e) => setTravelers(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm bg-[#EFE6D5]/60 border border-[#C9B99B] rounded-lg digit-tabular"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label htmlFor="ai-tier" className="block text-xs font-medium text-[#57534E] mb-1">
                  Hotel & Budget Style
                </label>
                <select
                  id="ai-tier"
                  value={budgetTier}
                  onChange={(e) => setBudgetTier(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-[#EFE6D5]/60 border border-[#C9B99B] rounded-lg"
                >
                  <option>Backpacker (₹1,400–₹2,400/day)</option>
                  <option>Comfort (₹3,500–₹6,000/day)</option>
                  <option>Heritage Luxury (₹12,000+/day)</option>
                </select>
              </div>
              <div>
                <label htmlFor="ai-transit" className="block text-xs font-medium text-[#57534E] mb-1">
                  Transport Preference
                </label>
                <select
                  id="ai-transit"
                  value={transportPreference}
                  onChange={(e) => setTransportPreference(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-[#EFE6D5]/60 border border-[#C9B99B] rounded-lg"
                >
                  <option>Indian Railways 3AC / Vande Bharat</option>
                  <option>Economy Domestic Flights</option>
                  <option>Sleeper Train & Overnight Volvo Bus</option>
                  <option>2AC Overnight Train</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="ai-interests" className="block text-xs font-medium text-[#57534E] mb-1">
                Interests & Dietary Preferences
              </label>
              <textarea
                id="ai-interests"
                rows={2}
                value={interests}
                onChange={(e) => setInterests(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-[#EFE6D5]/60 border border-[#C9B99B] rounded-lg"
              />
            </div>

            {planError && (
              <div
                role="alert"
                className="p-3 rounded-lg bg-[#9A3412]/10 border border-[#9A3412]/30 text-xs text-[#9A3412]"
              >
                {planError}
              </div>
            )}

            <button
              type="submit"
              disabled={isGeneratingPlan}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 text-xs font-medium bg-[#1E3A8A] text-white rounded-lg hover:bg-[#1E3A8A]/90 disabled:opacity-50 transition-colors"
            >
              {isGeneratingPlan ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Building custom itinerary...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Generate Day-by-Day Plan & Budget
                </>
              )}
            </button>
          </form>

          {/* Output Panel */}
          <div className="lg:col-span-7 bg-[#FAF6EE] border border-[#C9B99B] rounded-xl p-6 min-h-[480px]">
            {!generatedPlan && !isGeneratingPlan && (
              <div className="h-full flex flex-col items-center justify-center text-center py-16 px-6">
                <Calendar className="w-8 h-8 text-[#9A3412]/70 mb-3" />
                <h4 className="font-serif text-xl font-semibold text-[#1C1917]">
                  Your custom itinerary appears here
                </h4>
                <p className="text-sm text-[#57534E] max-w-md mt-2 leading-relaxed">
                  Choose any destination, preferred train or flight mode, and hotel tier to get a
                  complete rupee budget, neighborhood stays, and day-by-day schedule.
                </p>
              </div>
            )}

            {isGeneratingPlan && (
              <div className="h-full flex flex-col items-center justify-center text-center py-20">
                <Loader2 className="w-7 h-7 animate-spin text-[#1E3A8A] mb-3" />
                <p className="text-sm font-medium text-[#1C1917]">
                  Calculating train/flight fares, hotel rates, and crafting your schedule...
                </p>
              </div>
            )}

            {generatedPlan && !isGeneratingPlan && (
              <div className="space-y-6">
                <div className="flex flex-wrap items-start justify-between gap-4 pb-4 border-b border-[#E6DAC4]">
                  <div>
                    <h3 className="editorial-display text-2xl font-semibold text-[#1C1917]">
                      {generatedPlan.tripTitle}
                    </h3>
                    <p className="text-xs text-[#57534E] mt-1">{generatedPlan.seasonSuitability}</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyPlan}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-[#C9B99B] rounded-lg hover:bg-[#EFE6D5]"
                  >
                    {copiedPlan ? <Check className="w-3.5 h-3.5 text-[#1E3A8A]" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedPlan ? 'Copied' : 'Copy Plan'}
                  </button>
                </div>

                {/* Budget & Transit/Hotel Strip */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#EFE6D5]/60 border border-[#D5C7AE] rounded-lg p-4">
                  <div>
                    <p className="text-xs text-[#78716C]">Group Total</p>
                    <p className="digit-display text-2xl font-semibold text-[#1E3A8A] leading-tight mt-0.5">
                      {formatMoney(generatedPlan.totalEstimatedInr)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-[#78716C]">Per Person</p>
                    <p className="digit-display text-2xl font-semibold text-[#1C1917] leading-tight mt-0.5">
                      {formatMoney(generatedPlan.costPerPersonInr)}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs text-[#78716C]">Transit & Stay Plan</p>
                    <p className="text-xs text-[#44403C] mt-0.5 leading-snug">
                      {generatedPlan.recommendedTransit} · {generatedPlan.recommendedStayNote}
                    </p>
                  </div>
                </div>

                {/* Category Ledger */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs border-b border-[#E6DAC4] pb-4">
                  <div>
                    <span className="text-[#78716C] block">Transit</span>
                    <span className="digit-tabular font-medium text-[#1C1917]">
                      {formatMoney(generatedPlan.budgetBreakdown.intercityTransitInr)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#78716C] block">Hotels</span>
                    <span className="digit-tabular font-medium text-[#1C1917]">
                      {formatMoney(generatedPlan.budgetBreakdown.accommodationInr)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#78716C] block">Food</span>
                    <span className="digit-tabular font-medium text-[#1C1917]">
                      {formatMoney(generatedPlan.budgetBreakdown.foodAndDiningInr)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#78716C] block">Local Rides</span>
                    <span className="digit-tabular font-medium text-[#1C1917]">
                      {formatMoney(generatedPlan.budgetBreakdown.localTransportAndGuidesInr)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#78716C] block">Tickets</span>
                    <span className="digit-tabular font-medium text-[#1C1917]">
                      {formatMoney(generatedPlan.budgetBreakdown.ticketsAndExperiencesInr)}
                    </span>
                  </div>
                </div>

                {/* Days */}
                <div className="divide-y divide-[#E6DAC4]">
                  {generatedPlan.days.map((day) => (
                    <div key={day.dayNumber} className="py-3.5 space-y-1.5">
                      <div className="flex items-baseline justify-between gap-2">
                        <h4 className="editorial-display text-lg font-semibold text-[#1C1917]">
                          <span className="chapter-num text-[#9A3412] mr-1.5">
                            Day 0{day.dayNumber}.
                          </span>
                          {day.headline}
                        </h4>
                        <span className="digit-tabular text-xs text-[#57534E] shrink-0">
                          ~{formatMoney(day.estimatedGroupSpendInr)}
                        </span>
                      </div>
                      <p className="text-xs text-[#44403C]">
                        <strong>Morning:</strong> {day.morning}
                      </p>
                      <p className="text-xs text-[#44403C]">
                        <strong>Afternoon:</strong> {day.afternoon}
                      </p>
                      <p className="text-xs text-[#44403C]">
                        <strong>Evening:</strong> {day.evening}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Dishes & Tips */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-[#EFEAE0] text-xs">
                  <div>
                    <h5 className="font-semibold text-[#1C1917] mb-1.5">Must-Try Dishes</h5>
                    <ul className="space-y-1 text-[#44403C] list-disc pl-4">
                      {generatedPlan.mustTryDishes.map((dish) => (
                        <li key={dish}>{dish}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h5 className="font-semibold text-[#1C1917] mb-1.5">Packing & Savings</h5>
                    <ul className="space-y-1 text-[#44403C] list-disc pl-4">
                      {generatedPlan.packingAndSavingTips.map((tip) => (
                        <li key={tip}>{tip}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
