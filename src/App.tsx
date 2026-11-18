import { useState, useMemo, useEffect } from 'react';
import {
  Search,
  Plus,
  Check,
  ArrowLeftRight,
  MessageSquare,
  ArrowUpRight,
  Train,
  Plane,
} from 'lucide-react';
import {
  DESTINATIONS,
  Destination,
  Region,
  formatMoney,
} from './data/destinations';
import { ResilientImage } from './components/ResilientImage';
import { DestinationDossierModal } from './components/DestinationDossierModal';
import { ComparisonPanel } from './components/ComparisonPanel';
import { TripBudgetCalculator, TripStop } from './components/TripBudgetCalculator';
import { SeasonalMatrix } from './components/SeasonalMatrix';
import { AiTravelConcierge } from './components/AiTravelConcierge';

type RegionFilter = 'All' | Region;
type DailyCapFilter = 'all' | 'shoestring' | 'midrange' | 'splurge';

const REGION_OPTIONS: RegionFilter[] = [
  'All',
  'Northwest India',
  'North & Himalayas',
  'Rajasthan & West',
  'South India',
  'East & Northeast',
];

export default function App() {
  const [destinations, setDestinations] = useState<Destination[]>(DESTINATIONS);
  const [regionFilter, setRegionFilter] = useState<RegionFilter>('All');
  const [budgetFilter, setBudgetFilter] = useState<DailyCapFilter>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [selectedDossier, setSelectedDossier] = useState<Destination | null>(null);
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [tripStops, setTripStops] = useState<TripStop[]>([
    { destinationId: 'jaipur', days: 3 },
    { destinationId: 'udaipur', days: 3 },
  ]);

  const [aiContextDest, setAiContextDest] = useState<string | null>(null);
  const [externalAiPrompt, setExternalAiPrompt] = useState<string | null>(null);

  // Sync catalog from backend REST endpoint
  useEffect(() => {
    let active = true;
    fetch('/api/destinations')
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { destinations?: Destination[] } | null) => {
        if (active && data?.destinations && data.destinations.length > 0) {
          setDestinations(data.destinations);
        }
      })
      .catch(() => {
        // Retain static bundle catalog if offline
      });
    return () => {
      active = false;
    };
  }, []);

  const filteredDestinations = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return destinations.filter((dest) => {
      if (regionFilter !== 'All' && dest.region !== regionFilter) return false;
      const comfortDaily = dest.budgets.comfort.total;
      if (budgetFilter === 'shoestring' && dest.budgets.backpacker.total > 2000) return false;
      if (budgetFilter === 'midrange' && (comfortDaily < 3000 || comfortDaily > 5000)) return false;
      if (budgetFilter === 'splurge' && comfortDaily <= 5000) return false;

      if (query) {
        const haystack = `${dest.name} ${dest.state} ${dest.region} ${dest.vibe} ${dest.tagline}`.toLowerCase();
        if (!haystack.includes(query)) return false;
      }
      return true;
    });
  }, [destinations, regionFilter, budgetFilter, searchQuery]);

  const comparedDestinations = useMemo(
    () =>
      compareIds
        .map((id) => destinations.find((d) => d.id === id))
        .filter((d): d is Destination => Boolean(d)),
    [compareIds, destinations]
  );

  const handleToggleCompare = (id: string) => {
    setCompareIds((prev) => {
      if (prev.includes(id)) return prev.filter((item) => item !== id);
      if (prev.length >= 3) return [...prev.slice(1), id];
      return [...prev, id];
    });
  };

  const handleToggleTripStop = (id: string) => {
    const exists = tripStops.some((s) => s.destinationId === id);
    if (exists) {
      setTripStops((prev) => prev.filter((s) => s.destinationId !== id));
    } else if (tripStops.length < 4) {
      const dest = destinations.find((d) => d.id === id);
      setTripStops((prev) => [...prev, { destinationId: id, days: dest?.idealDays ?? 3 }]);
    }
  };

  const handleAddTripStop = (id: string) => {
    if (tripStops.some((s) => s.destinationId === id) || tripStops.length >= 4) return;
    const dest = destinations.find((d) => d.id === id);
    setTripStops((prev) => [...prev, { destinationId: id, days: dest?.idealDays ?? 3 }]);
  };

  const handleUpdateStopDays = (id: string, days: number) => {
    setTripStops((prev) =>
      prev.map((s) => (s.destinationId === id ? { ...s, days } : s))
    );
  };

  const scrollToConcierge = (destinationName?: string, prompt?: string) => {
    if (destinationName) {
      setAiContextDest(destinationName);
      setExternalAiPrompt(
        prompt ??
          `Give me a crisp budget breakdown, train vs flight comparison, and 3 hotel neighborhood recommendations for ${destinationName}.`
      );
    } else if (prompt) {
      setExternalAiPrompt(prompt);
    }
    const el = document.getElementById('ai-concierge');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#EFE6D5] text-[#1C1917]">
      {/* Strict 3-Zone Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-[#EFE6D5]/95 backdrop-blur-sm border-b border-[#D5C7AE]">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-8">
          <a
            href="#top"
            className="editorial-display text-2xl font-semibold text-[#1C1917] whitespace-nowrap shrink-0"
          >
            Yatra <span className="italic font-medium text-[#9A3412]">Atlas</span>
          </a>

          <nav
            aria-label="Primary navigation"
            className="hidden md:flex items-center gap-7 text-sm font-medium text-[#57534E]"
          >
            <a
              href="#destinations"
              className="hover:text-[#1C1917] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              Destinations
            </a>
            <a
              href="#budget-calculator"
              className="hover:text-[#1C1917] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              Budget Planner
            </a>
            <a
              href="#seasonal-guide"
              className="hover:text-[#1C1917] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              Seasonal Guide
            </a>
            <a
              href="#ai-concierge"
              className="hover:text-[#1C1917] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              AI Concierge
            </a>
          </nav>

          <div className="flex items-center shrink-0">
            <a
              href="#ai-concierge"
              className="px-4 py-2 text-xs font-medium text-white bg-[#1E3A8A] rounded-lg hover:bg-[#1E3A8A]/90 transition-colors whitespace-nowrap shrink-0"
            >
              Plan Trip
            </a>
          </div>
        </div>
      </header>

      <main id="top" className="flex-1">
        {/* Split-Screen Editorial Hero */}
        <section className="bg-gradient-to-b from-[#F5EDE0] via-[#EFE6D5] to-[#EFE6D5] border-b border-[#D5C7AE]">
          <div className="max-w-7xl mx-auto px-6 pt-10 pb-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-stretch">
            <div className="lg:col-span-5 flex flex-col justify-between py-2">
              <div>
                <p className="text-xs font-semibold text-[#9A3412] tracking-[0.04em]">
                  <span className="chapter-num mr-1.5">Ed. IV</span> India Travel, Transit & Stay Monograph
                </p>
                <h1 className="editorial-display text-4xl sm:text-5xl font-semibold text-[#1C1917] leading-[1.08] mt-3 text-balance">
                  Explore India with{' '}
                  <em className="italic font-medium text-[#9A3412]">honest daily budgets</em>,
                  trains, flights & stays
                </h1>
                <p className="text-[15px] text-[#44403C] leading-[1.68] mt-5 max-w-prose">
                  From <span className="digit-tabular font-medium text-[#1C1917]">₹1,400/day</span>{' '}
                  granite ruins in Hampi and Amritsar sarais to Kashmir valleys, Ladakh passes, and
                  Andaman reefs. Compare rail vs flights, inspect curated stays, and plan routes in
                  Indian Rupees.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-4 mt-8">
                <a
                  href="#ai-concierge"
                  className="inline-flex items-center gap-2 px-5 py-3 text-xs font-semibold text-white bg-[#1E3A8A] rounded-lg hover:bg-[#1E3A8A]/90 transition-colors whitespace-nowrap"
                >
                  Open AI Concierge
                  <ArrowUpRight className="w-4 h-4" />
                </a>
                <a
                  href="#destinations"
                  className="inline-flex items-center px-4 py-3 text-xs font-semibold text-[#1C1917] bg-[#FAF6EE]/70 border border-[#C9B99B] rounded-lg hover:bg-[#FAF6EE] transition-colors whitespace-nowrap"
                >
                  Browse <span className="digit-tabular mx-1">{destinations.length}</span> Destinations
                </a>
              </div>
            </div>

            <div className="lg:col-span-7 flex flex-col">
              <div className="w-full h-[300px] sm:h-[380px] lg:h-[430px] rounded-xl overflow-hidden border border-[#D5C7AE] bg-[#E6DAC4] shadow-sm">
                <ResilientImage
                  src="/src/assets/images/hero_udaipur_palace_1795005098318.jpg"
                  alt="City Palace and Lake Pichola in Udaipur at golden hour"
                  title="Udaipur, Rajasthan"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2 mt-2.5 text-xs text-[#57534E]">
                <span className="font-serif italic">
                  Fig. 01 — City Palace & Lake Pichola, Udaipur, Rajasthan
                </span>
                <span className="digit-tabular font-medium text-[#1C1917]">
                  Comfort avg {formatMoney(4800)}/day
                </span>
              </div>
            </div>
          </div>

          {/* 4-Column Operational Summary Strip */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mt-10 pt-8 border-t border-[#D5C7AE]">
            <div>
              <p className="digit-display text-3xl sm:text-4xl font-semibold text-[#1C1917] leading-none">
                {destinations.length}
              </p>
              <p className="text-xs font-semibold text-[#1C1917] mt-2">
                Iconic Destinations
              </p>
              <p className="text-xs text-[#57534E] mt-0.5 leading-relaxed">
                Northwest, Himalayas, Rajasthan, Kutch, Andaman, South & Northeast
              </p>
            </div>
            <div>
              <p className="digit-display text-3xl sm:text-4xl font-semibold text-[#1C1917] leading-none">
                05
              </p>
              <p className="text-xs font-semibold text-[#1C1917] mt-2">
                Transit Modes Compared
              </p>
              <p className="text-xs text-[#57534E] mt-0.5 leading-relaxed">
                Sleeper, 3AC, 2AC rail, Economy Flights & Volvo buses
              </p>
            </div>
            <div>
              <p className="digit-display text-3xl sm:text-4xl font-semibold text-[#1C1917] leading-none">
                {destinations.length * 3}
              </p>
              <p className="text-xs font-semibold text-[#1C1917] mt-2">
                Curated Stays & Havelis
              </p>
              <p className="text-xs text-[#57534E] mt-0.5 leading-relaxed">
                Hostels, houseboats, boutique havelis & heritage palaces
              </p>
            </div>
            <div>
              <p className="digit-display text-3xl sm:text-4xl font-semibold text-[#1C1917] leading-none">
                04
              </p>
              <p className="text-xs font-semibold text-[#1C1917] mt-2">
                Regional Hubs Modelled
              </p>
              <p className="text-xs text-[#57534E] mt-0.5 leading-relaxed">
                Delhi, Mumbai, Bengaluru & Kolkata departures in INR (₹)
              </p>
            </div>
          </div>
          </div>
        </section>

        {/* Section 1: Curated Destination Atlas & Budget Directory */}
        <section
          id="destinations"
          className="max-w-7xl mx-auto px-6 py-16 border-b border-[#D5C7AE]"
        >
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold text-[#9A3412] tracking-[0.04em]">
                <span className="chapter-num text-sm mr-1.5">01.</span> Curated Destination Atlas
              </p>
              <h2 className="editorial-display text-3xl sm:text-4xl font-semibold text-[#1C1917] mt-2 text-balance">
                Iconic places in India, stays & transit fares
              </h2>
            </div>

            <p className="text-xs text-[#57534E] digit-tabular self-start lg:self-end">
              Showing {filteredDestinations.length} of {destinations.length} destinations · All fares in ₹ INR
            </p>
          </div>

          {/* Filter Toolbar */}
          <div className="bg-[#FAF6EE] border border-[#D5C7AE] rounded-xl p-4 mb-8 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-1.5">
              {REGION_OPTIONS.map((region) => (
                <button
                  key={region}
                  type="button"
                  onClick={() => setRegionFilter(region)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                    regionFilter === region
                      ? 'bg-[#1E3A8A] text-white'
                      : 'bg-[#E6DAC4] text-[#44403C] hover:bg-[#D9CBB1]'
                  }`}
                >
                  {region === 'All' ? 'All India' : region}
                </button>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <select
                aria-label="Filter by daily budget tier"
                value={budgetFilter}
                onChange={(e) => setBudgetFilter(e.target.value as DailyCapFilter)}
                className="px-3 py-2 text-xs bg-[#EFE6D5]/60 border border-[#C9B99B] rounded-lg text-[#1C1917]"
              >
                <option value="all">All Daily Budgets</option>
                <option value="shoestring">Shoestring (Under ₹2,000/d)</option>
                <option value="midrange">Midrange Comfort (₹3,000–₹5,000/d)</option>
                <option value="splurge">Premium Comfort (₹5,000+/d)</option>
              </select>

              <div className="relative">
                <Search
                  className="w-4 h-4 text-[#78716C] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                  aria-hidden="true"
                />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search city or state..."
                  className="w-full sm:w-52 pl-9 pr-3 py-2 text-xs bg-[#EFE6D5]/60 border border-[#C9B99B] rounded-lg text-[#1C1917] placeholder:text-[#78716C] focus:outline-none focus:border-[#1E3A8A]"
                />
              </div>
            </div>
          </div>

          {/* Destination Cards Grid */}
          {filteredDestinations.length === 0 ? (
            <div className="bg-[#FAF6EE] border border-[#D5C7AE] rounded-xl p-12 text-center">
              <p className="font-serif text-xl text-[#1C1917]">No destinations match those filters</p>
              <button
                type="button"
                onClick={() => {
                  setRegionFilter('All');
                  setBudgetFilter('all');
                  setSearchQuery('');
                }}
                className="mt-4 px-4 py-2 text-xs font-medium bg-[#1C1917] text-white rounded-lg"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDestinations.map((dest) => {
                const inTrip = tripStops.some((s) => s.destinationId === dest.id);
                const isCompared = compareIds.includes(dest.id);
                const delhiTransit = dest.transportByHub.Delhi;

                return (
                  <article
                    key={dest.id}
                    className="bg-[#FAF6EE] border border-[#D5C7AE] rounded-xl overflow-hidden flex flex-col justify-between transition-shadow hover:shadow-md"
                  >
                    <div>
                      <button
                        type="button"
                        onClick={() => setSelectedDossier(dest)}
                        className="block w-full aspect-[4/3] overflow-hidden bg-[#E6DAC4] text-left group"
                      >
                        <ResilientImage
                          src={dest.image}
                          alt={dest.imageCaption}
                          title={dest.name}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                        />
                      </button>

                      <div className="p-5">
                        {/* Unboxed Metadata Line (Zero Pills) */}
                        <p className="text-xs text-[#78716C]">
                          {dest.state} <span aria-hidden="true">·</span> {dest.bestMonthsLabel}{' '}
                          <span aria-hidden="true">·</span>{' '}
                          <span className="digit-tabular">{dest.idealDays}d</span> ideal{' '}
                          <span aria-hidden="true">·</span>{' '}
                          <span className="digit-tabular">{dest.gallery.length}</span> photos
                        </p>

                        <button
                          type="button"
                          onClick={() => setSelectedDossier(dest)}
                          className="text-left mt-1.5 block group"
                        >
                          <h3 className="editorial-display text-[26px] font-semibold text-[#1C1917] leading-tight group-hover:text-[#1E3A8A] transition-colors">
                            {dest.name}
                          </h3>
                        </button>

                        <p className="text-sm text-[#57534E] mt-2 leading-[1.6]">
                          {dest.tagline}
                        </p>

                        {/* Tabular 3-Tier Daily Budget Grid */}
                        <div className="grid grid-cols-3 gap-2 items-end mt-5 pt-4 border-t border-[#E6DAC4]">
                          <div>
                            <span className="text-[11px] font-medium text-[#78716C] block">
                              Backpacker
                            </span>
                            <span className="digit-tabular text-sm font-medium text-[#1C1917]">
                              {formatMoney(dest.budgets.backpacker.total)}
                            </span>
                          </div>
                          <div>
                            <span className="text-[11px] font-medium text-[#78716C] block">
                              Comfort
                            </span>
                            <span className="digit-display text-lg font-semibold text-[#1E3A8A] leading-none">
                              {formatMoney(dest.budgets.comfort.total)}
                            </span>
                          </div>
                          <div>
                            <span className="text-[11px] font-medium text-[#78716C] block">
                              Luxury
                            </span>
                            <span className="digit-tabular text-sm font-medium text-[#1C1917]">
                              {formatMoney(dest.budgets.luxury.total)}
                            </span>
                          </div>
                        </div>

                        {/* Quick Transit Fares Snapshot (from Delhi baseline) */}
                        <div className="mt-3 pt-3 border-t border-[#E6DAC4] flex items-center justify-between text-[11px] text-[#57534E]">
                          <span className="inline-flex items-center gap-1 digit-tabular">
                            <Train className="w-3.5 h-3.5 text-[#78716C]" />
                            {delhiTransit.train.available
                              ? `3AC ${formatMoney(delhiTransit.train.ac3Inr)}`
                              : 'Air / Hwy'}
                          </span>
                          <span className="inline-flex items-center gap-1 digit-tabular">
                            <Plane className="w-3.5 h-3.5 text-[#78716C]" />
                            {delhiTransit.flight.available
                              ? `Flight ${formatMoney(delhiTransit.flight.economyAvgInr)}`
                              : 'Rail / Bus'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Card Action Row */}
                    <div className="px-5 py-3.5 bg-[#F2E9D9] border-t border-[#E6DAC4] flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedDossier(dest)}
                        className="text-xs font-semibold text-[#1C1917] hover:text-[#1E3A8A] transition-colors whitespace-nowrap"
                      >
                        Fares & Hotels
                      </button>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleToggleTripStop(dest.id)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-md border transition-colors whitespace-nowrap ${
                            inTrip
                              ? 'bg-[#1E3A8A] text-white border-[#1E3A8A]'
                              : 'bg-[#FAF6EE] text-[#44403C] border-[#C9B99B] hover:bg-[#E6DAC4]'
                          }`}
                          title="Add to Trip Budget Calculator"
                        >
                          {inTrip ? <Check className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                          {inTrip ? 'In Route' : 'Route'}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleToggleCompare(dest.id)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-md border transition-colors whitespace-nowrap ${
                            isCompared
                              ? 'bg-[#9A3412] text-white border-[#9A3412]'
                              : 'bg-[#FAF6EE] text-[#44403C] border-[#C9B99B] hover:bg-[#E6DAC4]'
                          }`}
                          title="Compare side by side"
                        >
                          <ArrowLeftRight className="w-3 h-3" />
                          Compare
                        </button>

                        <button
                          type="button"
                          onClick={() => scrollToConcierge(dest.name)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-md bg-[#1C1917] text-white hover:bg-[#292524] transition-colors whitespace-nowrap"
                          title={`Ask AI about ${dest.name}`}
                        >
                          <MessageSquare className="w-3 h-3" />
                          AI
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        {/* Editorial Visual Showcase: Transit & Stay Standards Across India */}
        <section className="max-w-7xl mx-auto px-6 py-14 border-b border-[#D5C7AE]">
          <div className="max-w-2xl mb-8">
            <p className="text-xs font-semibold text-[#9A3412] tracking-[0.04em]">
              <span className="chapter-num text-sm mr-1.5">Field Notes</span> Transit & Accommodations
            </p>
            <h2 className="editorial-display text-2xl sm:text-3xl font-semibold text-[#1C1917] mt-1.5 text-balance">
              How India moves and stays across every budget band
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <figure className="bg-[#FAF6EE] border border-[#D5C7AE] rounded-xl overflow-hidden">
              <div className="aspect-[4/3] bg-[#E6DAC4]">
                <ResilientImage
                  src="/src/assets/images/gallery_indian_railways_1795006092349.jpg"
                  alt="Indian passenger train gliding across an arched stone viaduct"
                  title="Indian Railways & Scenic Corridors"
                  className="w-full h-full object-cover"
                />
              </div>
              <figcaption className="p-5">
                <p className="text-xs text-[#78716C] digit-tabular">
                  Rail & Air Corridors · {formatMoney(260)} – {formatMoney(7600)}
                </p>
                <h3 className="font-serif text-lg font-semibold text-[#1C1917] mt-1">
                  Overnight 3AC Trains vs Nonstop Flights
                </h3>
                <p className="text-xs text-[#57534E] mt-1.5 leading-relaxed">
                  Overnight AC trains connect Delhi–Udaipur, Delhi–Amritsar, Mumbai–Goa, and
                  Bengaluru–Hampi while saving a hotel night; flights bridge Ladakh, Kashmir & Andaman.
                </p>
              </figcaption>
            </figure>

            <figure className="bg-[#FAF6EE] border border-[#D5C7AE] rounded-xl overflow-hidden">
              <div className="aspect-[4/3] bg-[#E6DAC4]">
                <ResilientImage
                  src="/src/assets/images/gallery_heritage_haveli_1795006093054.jpg"
                  alt="Restored sandstone heritage haveli courtyard hotel in Rajasthan"
                  title="Heritage Havelis & Courtyards"
                  className="w-full h-full object-cover"
                />
              </div>
              <figcaption className="p-5">
                <p className="text-xs text-[#78716C] digit-tabular">
                  Boutique Havelis · {formatMoney(2800)} – {formatMoney(4200)}/nt
                </p>
                <h3 className="font-serif text-lg font-semibold text-[#1C1917] mt-1">
                  Restored Mansion Stays in Old Cities
                </h3>
                <p className="text-xs text-[#57534E] mt-1.5 leading-relaxed">
                  Independent 18th-century havelis in Udaipur, Jaipur, Amritsar, and Bhuj offer
                  hand-carved stone courtyards and rooftop breakfasts at a fraction of palace rates.
                </p>
              </figcaption>
            </figure>

            <figure className="bg-[#FAF6EE] border border-[#D5C7AE] rounded-xl overflow-hidden">
              <div className="aspect-[4/3] bg-[#E6DAC4]">
                <ResilientImage
                  src="/src/assets/images/gallery_kerala_homestay_1795006093618.jpg"
                  alt="Timber and terracotta-roofed Kerala heritage homestay veranda"
                  title="Homestays & Eco Villas"
                  className="w-full h-full object-cover"
                />
              </div>
              <figcaption className="p-5">
                <p className="text-xs text-[#78716C] digit-tabular">
                  Homestays & Cottages · {formatMoney(700)} – {formatMoney(3800)}/nt
                </p>
                <h3 className="font-serif text-lg font-semibold text-[#1C1917] mt-1">
                  Licensed Coastal & Hill Homestays
                </h3>
                <p className="text-xs text-[#57534E] mt-1.5 leading-relaxed">
                  From Kainakary canal bungalows in Kerala to Nigeen Lake houseboats in Kashmir and
                  Dharamkot pine cottages, community stays include home-cooked regional meals.
                </p>
              </figcaption>
            </figure>
          </div>
        </section>

        {/* Side-by-Side Comparison Section */}
        <ComparisonPanel
          destinations={comparedDestinations}
          onRemove={(id) => setCompareIds((prev) => prev.filter((item) => item !== id))}
          onClear={() => setCompareIds([])}
          onOpenDossier={(dest) => setSelectedDossier(dest)}
        />

        {/* Section 2: Interactive Multi-City & Transport Mode Trip Calculator */}
        <TripBudgetCalculator
          stops={tripStops}
          onAddStop={handleAddTripStop}
          onRemoveStop={(id) => setTripStops((prev) => prev.filter((s) => s.destinationId !== id))}
          onUpdateStopDays={handleUpdateStopDays}
          onReplaceStops={(newStops) => setTripStops(newStops)}
          onAskAiPlanCircuit={(prompt) => scrollToConcierge(undefined, prompt)}
        />

        {/* Section 3: 12-Month Climate & Festival Matrix */}
        <SeasonalMatrix
          onSelectDestination={(dest) => setSelectedDossier(dest)}
        />

        {/* Section 4: AI Travel Concierge & Structured Itinerary Studio */}
        <AiTravelConcierge
          externalPrompt={externalAiPrompt}
          contextDestination={aiContextDest}
          onClearExternalPrompt={() => setExternalAiPrompt(null)}
        />

        {/* Practical India Travel Essentials Strip */}
        <section className="bg-[#E5D9C3] border-t border-[#D5C7AE]">
          <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="font-serif text-lg font-semibold text-[#1C1917]">
                Indian Railways Classes
              </h3>
              <p className="text-xs text-[#44403C] mt-2 leading-relaxed">
                <strong>Sleeper (SL)</strong> is open-window budget travel (~₹350–₹850 overnight).{' '}
                <strong>3AC / 3E</strong> offers air-conditioned comfort and good value
                (~₹950–₹2,200). <strong>Vande Bharat</strong> day chair-cars link major hubs in
                4–8 hours.
              </p>
            </div>
            <div>
              <h3 className="font-serif text-lg font-semibold text-[#1C1917]">
                Digital Payments & Cash
              </h3>
              <p className="text-xs text-[#44403C] mt-2 leading-relaxed">
                UPI QR payments work everywhere from chai stalls to mountain homestays (foreign
                travelers can activate UPI One World at major airports). Keep ₹2,000–₹3,000 in small
                notes for Ladakh, Meghalaya villages, and Andaman ferries.
              </p>
            </div>
            <div>
              <h3 className="font-serif text-lg font-semibold text-[#1C1917]">
                Monument & Park Bookings
              </h3>
              <p className="text-xs text-[#44403C] mt-2 leading-relaxed">
                Book ASI heritage sites online to skip morning queues and pay lower QR-ticket rates.
                Remember that several royal monuments (city palaces) are privately managed trusts
                with separate entrance fees.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Quiet Editorial Footer */}
      <footer className="border-t border-[#D5C7AE] bg-[#EFE6D5]">
        <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-[#57534E]">
          <div className="flex items-center gap-4">
            <span className="editorial-display text-lg font-semibold text-[#1C1917]">
              Yatra <span className="italic font-medium text-[#9A3412]">Atlas</span>
            </span>
            <span>Curated India destination budgets in INR (₹), transit fares, hotels & AI planner.</span>
          </div>
          <p>All daily figures reflect typical domestic rail, air, hotel & monument tariffs.</p>
        </div>
      </footer>

      {/* Destination Dossier Modal */}
      <DestinationDossierModal
        destination={selectedDossier}
        isInTrip={Boolean(
          selectedDossier && tripStops.some((s) => s.destinationId === selectedDossier.id)
        )}
        isCompared={Boolean(selectedDossier && compareIds.includes(selectedDossier.id))}
        onClose={() => setSelectedDossier(null)}
        onToggleTrip={handleToggleTripStop}
        onToggleCompare={handleToggleCompare}
        onAskAi={(name) => scrollToConcierge(name)}
      />
    </div>
  );
}
