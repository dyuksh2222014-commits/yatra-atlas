import { useState, useEffect, useCallback, useMemo } from 'react';
import { Plus, Trash2, Copy, Check, Sparkles, Bookmark, FolderOpen, Train, Plane, Bus } from 'lucide-react';
import {
  DESTINATIONS,
  BudgetTier,
  HubCity,
  TransportMode,
  TRANSPORT_MODE_LABELS,
  formatMoney,
} from '../data/destinations';
import {
  computeTripEstimate,
  loadLocalTrips,
  saveLocalTrip,
  deleteLocalTrip,
  type SavedTripRecord,
  type TripStopInput,
} from '../utils/tripEngine';

export type TripStop = TripStopInput;

interface TripBudgetCalculatorProps {
  stops: TripStop[];
  onAddStop: (destinationId: string) => void;
  onRemoveStop: (destinationId: string) => void;
  onUpdateStopDays: (destinationId: string, days: number) => void;
  onReplaceStops: (stops: TripStop[]) => void;
  onAskAiPlanCircuit: (summaryPrompt: string) => void;
}

export function TripBudgetCalculator({
  stops,
  onAddStop,
  onRemoveStop,
  onUpdateStopDays,
  onReplaceStops,
  onAskAiPlanCircuit,
}: TripBudgetCalculatorProps) {
  const [tier, setTier] = useState<BudgetTier>('comfort');
  const [transportMode, setTransportMode] = useState<TransportMode>('train_3ac');
  const [travelers, setTravelers] = useState<number>(2);
  const [originHub, setOriginHub] = useState<HubCity>('Delhi');
  const [includeContingency, setIncludeContingency] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);

  // Browser-computed estimate & localStorage/server saved trips state
  const [tripNameInput, setTripNameInput] = useState<string>('');
  const [savedTrips, setSavedTrips] = useState<SavedTripRecord[]>(() => loadLocalTrips());
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const selectedDestinations = stops
    .map((stop) => ({
      stop,
      dest: DESTINATIONS.find((d) => d.id === stop.destinationId),
    }))
    .filter((item): item is { stop: TripStop; dest: (typeof DESTINATIONS)[number] } => Boolean(item.dest));

  const availableToAdd = DESTINATIONS.filter(
    (d) => !stops.some((s) => s.destinationId === d.id)
  );

  const fetchSavedTrips = useCallback(async () => {
    const local = loadLocalTrips();
    setSavedTrips(local);
    try {
      const res = await fetch('/api/trips');
      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('application/json')) {
        const data = (await res.json()) as { trips?: SavedTripRecord[] };
        if (Array.isArray(data.trips) && data.trips.length > 0) {
          const merged = new Map<string, SavedTripRecord>();
          data.trips.forEach((t) => merged.set(t.id, t));
          local.forEach((t) => merged.set(t.id, t));
          setSavedTrips(
            Array.from(merged.values()).sort(
              (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            )
          );
        }
      }
    } catch {
      // Pure static mode: localStorage stays authoritative
    }
  }, []);

  useEffect(() => {
    void fetchSavedTrips();
  }, [fetchSavedTrips]);

  const estimate = useMemo(
    () =>
      computeTripEstimate({
        stops,
        originHub,
        travelers,
        stayTier: tier,
        transportMode,
        includeContingency,
      }),
    [stops, originHub, travelers, tier, transportMode, includeContingency]
  );

  const stayTotal = estimate?.stayTotalInr ?? 0;
  const intercityTotal = estimate?.intercityTransitInr ?? 0;
  const foodTotal = estimate?.foodTotalInr ?? 0;
  const localTransitTotal = estimate?.localTransportInr ?? 0;
  const activitiesTotal = estimate?.activitiesTotalInr ?? 0;
  const contingency = estimate?.contingencyInr ?? 0;
  const grandTotal = estimate?.grandTotalInr ?? 0;
  const perPerson = estimate?.perPersonInr ?? 0;
  const totalDays = estimate?.totalDays ?? stops.reduce((acc, s) => acc + s.days, 0);

  const segments = [
    { label: 'Hotels & Stays', value: stayTotal, color: 'bg-[#1E3A8A]' },
    { label: 'Train / Flight / Bus', value: intercityTotal, color: 'bg-[#9A3412]' },
    { label: 'Food & Chai', value: foodTotal, color: 'bg-[#44403C]' },
    { label: 'Local Rides', value: localTransitTotal, color: 'bg-[#78716C]' },
    { label: 'Tickets & Buffer', value: activitiesTotal + contingency, color: 'bg-[#A8A29E]' },
  ];

  const handleSaveTrip = async () => {
    if (stops.length === 0 || isSaving) return;
    setIsSaving(true);
    setSaveMessage(null);
    const requestPayload = {
      stops,
      originHub,
      travelers,
      stayTier: tier,
      transportMode,
      includeContingency,
    };

    try {
      const savedLocal = saveLocalTrip(tripNameInput, requestPayload);
      setTripNameInput('');
      setSaveMessage(`Saved "${savedLocal.title}"`);
      setSavedTrips(loadLocalTrips());

      // Best-effort sync if backend API is active
      try {
        const res = await fetch('/api/trips', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: savedLocal.title,
            request: requestPayload,
          }),
        });
        const contentType = res.headers.get('content-type') || '';
        if (res.ok && contentType.includes('application/json')) {
          await fetchSavedTrips();
        }
      } catch {
        // Running statically in browser — localStorage already persisted the trip
      }

      setTimeout(() => setSaveMessage(null), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleLoadTrip = (record: SavedTripRecord) => {
    setOriginHub(record.request.originHub);
    setTravelers(record.request.travelers);
    setTier(record.request.stayTier);
    setTransportMode(record.request.transportMode);
    setIncludeContingency(record.request.includeContingency);
    onReplaceStops(record.request.stops);
  };

  const handleDeleteTrip = async (id: string) => {
    const remaining = deleteLocalTrip(id);
    setSavedTrips(remaining);
    try {
      await fetch(`/api/trips/${id}`, { method: 'DELETE' });
    } catch {
      // Static mode: already removed from localStorage
    }
  };

  const handleCopySummary = async () => {
    const routeText = selectedDestinations
      .map(({ dest, stop }) => `${dest.name} (${stop.days}d)`)
      .join(' -> ');
    const summary = `Yatra Atlas Budget Estimate (${tier.toUpperCase()} · ${TRANSPORT_MODE_LABELS[transportMode].label})
Route: ${routeText || 'None selected'} from ${originHub}
Travelers: ${travelers} · Total Days: ${totalDays}
Hotels & Stays: ${formatMoney(stayTotal)}
Intercity Transit: ${formatMoney(intercityTotal)}
Food & Chai: ${formatMoney(foodTotal)}
Local Transport: ${formatMoney(localTransitTotal)}
Activities & Contingency: ${formatMoney(activitiesTotal + contingency)}
Total Estimated Budget: ${formatMoney(grandTotal)} (${formatMoney(perPerson)} per person)`;
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard blocked
    }
  };

  return (
    <section
      id="budget-calculator"
      className="max-w-7xl mx-auto px-6 py-16 border-b border-[#D5C7AE]"
    >
      <div className="max-w-2xl mb-10">
        <p className="text-xs font-semibold text-[#9A3412] tracking-[0.04em]">
          <span className="chapter-num text-sm mr-1.5">02.</span> Multi-City Transport & Stay Calculator
        </p>
        <h2 className="editorial-display text-3xl sm:text-4xl font-semibold text-[#1C1917] mt-2 text-balance">
          Compare trains, flights, buses & hotel tiers across your route
        </h2>
        <p className="text-sm sm:text-base text-[#57534E] mt-3 leading-[1.68]">
          Select up to four stops, switch between Indian Railways classes, economy airfare, or Volvo
          buses, match curated accommodations, and save itineraries to your workspace.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Controls & Leg-by-Leg Details */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-[#FAF6EE] border border-[#D5C7AE] rounded-xl p-6 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pb-6 border-b border-[#E6DAC4]">
              <div>
                <label htmlFor="calc-hub" className="block text-xs font-medium text-[#57534E] mb-1.5">
                  Departure Hub
                </label>
                <select
                  id="calc-hub"
                  value={originHub}
                  onChange={(e) => setOriginHub(e.target.value as HubCity)}
                  className="w-full px-3 py-2 text-xs bg-[#FBF9F5] border border-[#D6CEBE] rounded-lg text-[#1C1917]"
                >
                  <option value="Delhi">New Delhi (DEL / NDLS)</option>
                  <option value="Mumbai">Mumbai (BOM / CSMT)</option>
                  <option value="Bengaluru">Bengaluru (BLR / SBC)</option>
                  <option value="Kolkata">Kolkata (CCU / HWH)</option>
                </select>
              </div>

              <div>
                <label htmlFor="calc-transport" className="block text-xs font-medium text-[#57534E] mb-1.5">
                  Intercity Transport
                </label>
                <select
                  id="calc-transport"
                  value={transportMode}
                  onChange={(e) => setTransportMode(e.target.value as TransportMode)}
                  className="w-full px-3 py-2 text-xs bg-[#FBF9F5] border border-[#D6CEBE] rounded-lg text-[#1C1917]"
                >
                  {(Object.keys(TRANSPORT_MODE_LABELS) as TransportMode[]).map((mode) => (
                    <option key={mode} value={mode}>
                      {TRANSPORT_MODE_LABELS[mode].label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#57534E] mb-1.5">
                  Travelers ({travelers})
                </label>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setTravelers((n) => Math.max(1, n - 1))}
                    className="w-9 h-9 rounded-lg border border-[#D6CEBE] text-sm font-medium hover:bg-[#F4EFE6]"
                    aria-label="Decrease travelers"
                  >
                    −
                  </button>
                  <span className="flex-1 text-center digit-tabular text-sm font-semibold text-[#1C1917]">
                    {travelers}
                  </span>
                  <button
                    type="button"
                    onClick={() => setTravelers((n) => Math.min(8, n + 1))}
                    className="w-9 h-9 rounded-lg border border-[#D6CEBE] text-sm font-medium hover:bg-[#F4EFE6]"
                    aria-label="Increase travelers"
                  >
                    +
                  </button>
                </div>
              </div>

              <div>
                <span className="block text-xs font-medium text-[#57534E] mb-1.5">
                  Hotel Tier
                </span>
                <div className="grid grid-cols-3 p-1 bg-[#F4EFE6] rounded-lg">
                  {(['backpacker', 'comfort', 'luxury'] as BudgetTier[]).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTier(t)}
                      className={`py-1.5 text-[11px] font-medium rounded-md transition-colors capitalize ${
                        tier === t
                          ? 'bg-white text-[#1C1917] shadow-sm'
                          : 'text-[#57534E] hover:text-[#1C1917]'
                      }`}
                    >
                      {t === 'backpacker' ? 'Budget' : t}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Active Stops */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-[#1C1917]">
                  Route Stops (<span className="digit-tabular">{selectedDestinations.length}/4</span>)
                </h3>
                <span className="text-xs digit-tabular text-[#78716C]">
                  {totalDays} total days
                </span>
              </div>

              {selectedDestinations.length === 0 ? (
                <div className="border border-dashed border-[#D6CEBE] rounded-lg p-6 text-center text-sm text-[#78716C]">
                  Add one or more Indian destinations below to calculate your itemized route cost.
                </div>
              ) : (
                <div className="divide-y divide-[#EFEAE0] border border-[#E5DEC9] rounded-lg">
                  {selectedDestinations.map(({ dest, stop }, idx) => {
                    const hotel = dest.hotelOptions.find((h) => h.tier === tier) ?? dest.hotelOptions[0];
                    const leg = estimate?.transitLegs.find((l) => l.destinationId === dest.id);
                    return (
                      <div
                        key={dest.id}
                        className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                      >
                        <div className="min-w-0">
                          <p className="text-xs text-[#78716C]">
                            <span className="chapter-num text-sm text-[#9A3412] mr-1">
                              0{idx + 1}
                            </span>{' '}
                            · {dest.state}
                          </p>
                          <p className="editorial-display text-xl font-semibold text-[#1C1917]">
                            {dest.name}
                          </p>
                          {hotel && (
                            <p className="text-xs text-[#44403C] mt-0.5 truncate">
                              Stay: <strong>{hotel.name}</strong> (
                              <span className="digit-tabular">
                                {formatMoney(hotel.pricePerNightInr)}
                              </span>
                              /nt)
                            </p>
                          )}
                          {leg && (
                            <p className="text-xs text-[#1E3A8A] mt-0.5 flex items-center gap-1.5">
                              {leg.appliedModeLabel.includes('Airplane') ? (
                                <Plane className="w-3.5 h-3.5 shrink-0" />
                              ) : leg.appliedModeLabel.includes('Bus') ? (
                                <Bus className="w-3.5 h-3.5 shrink-0" />
                              ) : (
                                <Train className="w-3.5 h-3.5 shrink-0" />
                              )}
                              <span className="truncate">
                                {leg.appliedModeLabel}: {leg.serviceName} ({leg.duration}) ·{' '}
                                <span className="digit-tabular font-medium">
                                  {formatMoney(leg.groupLegCostInr)}
                                </span>
                              </span>
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          <div className="flex items-center border border-[#D6CEBE] rounded-lg bg-[#FBF9F5]">
                            <button
                              type="button"
                              onClick={() => onUpdateStopDays(dest.id, Math.max(1, stop.days - 1))}
                              className="w-9 h-9 text-sm hover:bg-[#EFEAE0] rounded-l-lg"
                              aria-label={`Fewer days in ${dest.name}`}
                            >
                              −
                            </button>
                            <span className="px-3 text-xs digit-tabular font-semibold text-[#1C1917]">
                              {stop.days}d
                            </span>
                            <button
                              type="button"
                              onClick={() => onUpdateStopDays(dest.id, Math.min(14, stop.days + 1))}
                              className="w-9 h-9 text-sm hover:bg-[#EFEAE0] rounded-r-lg"
                              aria-label={`More days in ${dest.name}`}
                            >
                              +
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={() => onRemoveStop(dest.id)}
                            aria-label={`Remove ${dest.name}`}
                            className="w-9 h-9 flex items-center justify-center rounded-lg border border-[#E5DEC9] text-[#78716C] hover:text-[#9A3412] hover:border-[#9A3412]/40 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Quick Add Bar */}
              {stops.length < 4 && availableToAdd.length > 0 && (
                <div className="pt-2">
                  <p className="text-xs font-medium text-[#78716C] mb-2">Add a stop to your route</p>
                  <div className="flex flex-wrap gap-2">
                    {availableToAdd.map((dest) => (
                      <button
                        key={dest.id}
                        type="button"
                        onClick={() => onAddStop(dest.id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-[#F4EFE6] hover:bg-[#E5DEC9] text-[#1C1917] rounded-lg transition-colors whitespace-nowrap"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        {dest.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-[#EFEAE0] flex flex-wrap items-center justify-between gap-3">
              <label className="flex items-center gap-2 text-xs text-[#44403C] cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeContingency}
                  onChange={(e) => setIncludeContingency(e.target.checked)}
                  className="rounded border-[#D6CEBE] accent-[#1E3A8A]"
                />
                Include 10% buffer for rickshaws, tips & weather delays
              </label>
            </div>
          </div>

          {/* Saved Trip Plans (Backend Persistence) */}
          <div className="bg-[#FAF6EE] border border-[#D5C7AE] rounded-xl p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold text-[#1C1917]">
                  Save & Reload Trip Plans
                </h3>
                <p className="text-xs text-[#78716C]">
                  Save custom multi-city estimates in your browser to compare scenarios later.
                </p>
              </div>
              {saveMessage && (
                <span className="text-xs font-medium text-[#1E3A8A]">{saveMessage}</span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={tripNameInput}
                onChange={(e) => setTripNameInput(e.target.value)}
                placeholder="Name this itinerary (e.g., Nov Rajasthan & Punjab Rail Loop)..."
                className="flex-1 px-3 py-2 text-xs bg-[#EFE6D5]/60 border border-[#C9B99B] rounded-lg text-[#1C1917] placeholder:text-[#78716C]"
              />
              <button
                type="button"
                disabled={stops.length === 0 || isSaving}
                onClick={handleSaveTrip}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium bg-[#1C1917] text-white rounded-lg hover:bg-[#292524] disabled:opacity-40 whitespace-nowrap"
              >
                <Bookmark className="w-3.5 h-3.5" />
                Save Trip
              </button>
            </div>

            {savedTrips.length > 0 && (
              <div className="divide-y divide-[#E6DAC4] border border-[#E6DAC4] rounded-lg">
                {savedTrips.map((trip) => (
                  <div
                    key={trip.id}
                    className="px-3.5 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs"
                  >
                    <div className="min-w-0">
                      <p className="font-medium text-[#1C1917] truncate">{trip.title}</p>
                      <p className="text-[#78716C] digit-tabular">
                        {formatMoney(trip.estimate.grandTotalInr)} ·{' '}
                        {TRANSPORT_MODE_LABELS[trip.request.transportMode]?.short ?? 'Train'} ·{' '}
                        {trip.estimate.travelers} travelers
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleLoadTrip(trip)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium bg-[#E6DAC4] hover:bg-[#D9CBB1] text-[#1C1917] rounded"
                      >
                        <FolderOpen className="w-3 h-3" />
                        Load
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteTrip(trip.id)}
                        aria-label={`Delete ${trip.title}`}
                        className="p-1 text-[#78716C] hover:text-[#9A3412]"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Cost Summary Card */}
        <div className="lg:col-span-5 bg-[#FAF6EE] border border-[#C9B99B] rounded-xl p-6 space-y-6">
          <div className="pb-5 border-b border-[#E6DAC4]">
            <p className="text-xs font-medium text-[#78716C]">Itemized Trip Estimate (INR ₹)</p>
            <div className="flex flex-wrap items-baseline justify-between gap-4 mt-1.5">
              <p className="digit-display text-4xl sm:text-5xl font-semibold text-[#1C1917] leading-none">
                {formatMoney(grandTotal)}
              </p>
              <p className="digit-display text-base sm:text-lg text-[#1E3A8A] font-semibold">
                {formatMoney(perPerson)}
                <span className="font-sans text-xs font-medium text-[#57534E]"> / traveler</span>
              </p>
            </div>
          </div>

          {/* Horizontal Cost Share Bar */}
          {grandTotal > 0 && (
            <div className="space-y-2">
              <div className="h-3 w-full rounded-full overflow-hidden flex bg-[#E6DAC4]">
                {segments.map((seg) => {
                  const pct = (seg.value / grandTotal) * 100;
                  if (pct <= 0) return null;
                  return (
                    <div
                      key={seg.label}
                      style={{ width: `${pct}%` }}
                      className={`${seg.color} h-full transition-all duration-200`}
                      title={`${seg.label}: ${Math.round(pct)}%`}
                    />
                  );
                })}
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-[#57534E]">
                {segments.map((seg) => (
                  <span key={seg.label} className="inline-flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-xs ${seg.color}`} aria-hidden="true" />
                    {seg.label}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Itemized Ledger */}
          <dl className="divide-y divide-[#E6DAC4] text-sm">
            <div className="py-2.5 flex justify-between">
              <dt className="text-[#57534E]">
                Hotels / Stays ({tier === 'backpacker' ? `${travelers} beds` : `${Math.ceil(travelers / 2)} room/s`})
              </dt>
              <dd className="digit-tabular font-medium text-[#1C1917]">
                {formatMoney(stayTotal)}
              </dd>
            </div>
            <div className="py-2.5 flex justify-between">
              <dt className="text-[#57534E]">
                {TRANSPORT_MODE_LABELS[transportMode].short} from {originHub}
              </dt>
              <dd className="digit-tabular font-medium text-[#1C1917]">
                {formatMoney(intercityTotal)}
              </dd>
            </div>
            <div className="py-2.5 flex justify-between">
              <dt className="text-[#57534E]">Meals, Chai & Bottled Water</dt>
              <dd className="digit-tabular font-medium text-[#1C1917]">
                {formatMoney(foodTotal)}
              </dd>
            </div>
            <div className="py-2.5 flex justify-between">
              <dt className="text-[#57534E]">Local Autos, Cabs & Scooters</dt>
              <dd className="digit-tabular font-medium text-[#1C1917]">
                {formatMoney(localTransitTotal)}
              </dd>
            </div>
            <div className="py-2.5 flex justify-between">
              <dt className="text-[#57534E]">Monuments, Boats & Guides</dt>
              <dd className="digit-tabular font-medium text-[#1C1917]">
                {formatMoney(activitiesTotal)}
              </dd>
            </div>
            {includeContingency && (
              <div className="py-2.5 flex justify-between">
                <dt className="text-[#57534E]">10% Contingency Buffer</dt>
                <dd className="digit-tabular font-medium text-[#1C1917]">
                  {formatMoney(contingency)}
                </dd>
              </div>
            )}
          </dl>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              type="button"
              onClick={handleCopySummary}
              disabled={selectedDestinations.length === 0}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-medium border border-[#C9B99B] rounded-lg text-[#1C1917] hover:bg-[#EFE6D5] disabled:opacity-40 transition-colors whitespace-nowrap"
            >
              {copied ? <Check className="w-4 h-4 text-[#1E3A8A]" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Summary Copied' : 'Copy Summary'}
            </button>
            <button
              type="button"
              disabled={selectedDestinations.length === 0}
              onClick={() => {
                const routeDesc = selectedDestinations
                  .map(({ dest, stop }) => `${dest.name} (${stop.days} days)`)
                  .join(', ');
                onAskAiPlanCircuit(
                  `Optimize this multi-city India route departing ${originHub} via ${TRANSPORT_MODE_LABELS[transportMode].label} for ${travelers} traveler(s) staying in ${tier} hotels: ${routeDesc}. Estimated total is ${formatMoney(grandTotal)}. Suggest exact train numbers/flight windows and neighborhood hotels.`
                );
              }}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-medium bg-[#1E3A8A] text-white rounded-lg hover:bg-[#1E3A8A]/90 disabled:opacity-40 transition-colors whitespace-nowrap"
            >
              <Sparkles className="w-4 h-4" />
              Optimize Route with AI
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
