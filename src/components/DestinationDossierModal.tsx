import { useEffect, useState } from 'react';
import { X, Plus, Check, MessageSquare, ArrowLeftRight, Train, Plane, Bus, BedDouble } from 'lucide-react';
import {
  Destination,
  BudgetTier,
  HubCity,
  TransportMode,
  MONTHS_SHORT,
  TRANSPORT_MODE_LABELS,
  formatMoney,
} from '../data/destinations';
import { ResilientImage } from './ResilientImage';

interface DestinationDossierModalProps {
  destination: Destination | null;
  isInTrip: boolean;
  isCompared: boolean;
  onClose: () => void;
  onToggleTrip: (id: string) => void;
  onToggleCompare: (id: string) => void;
  onAskAi: (destinationName: string) => void;
}

export function DestinationDossierModal({
  destination,
  isInTrip,
  isCompared,
  onClose,
  onToggleTrip,
  onToggleCompare,
  onAskAi,
}: DestinationDossierModalProps) {
  const [tier, setTier] = useState<BudgetTier>('comfort');
  const [transportMode, setTransportMode] = useState<TransportMode>('train_3ac');
  const [days, setDays] = useState<number>(3);
  const [travelers, setTravelers] = useState<number>(2);
  const [originHub, setOriginHub] = useState<HubCity>('Delhi');
  const [includeIntercity, setIncludeIntercity] = useState<boolean>(true);
  const [activePhotoIndex, setActivePhotoIndex] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<'transport' | 'hotels' | 'itinerary' | 'food'>('transport');

  useEffect(() => {
    if (destination) {
      setDays(destination.idealDays);
      setActivePhotoIndex(0);
      setActiveTab('transport');
    }
  }, [destination]);

  useEffect(() => {
    if (!destination) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [destination, onClose]);

  if (!destination) return null;

  const gallery = destination.gallery.length > 0
    ? destination.gallery
    : [{ url: destination.image, caption: destination.imageCaption }];
  const activePhoto = gallery[activePhotoIndex] ?? gallery[0];

  const daily = destination.budgets[tier];
  const matchedHotel = destination.hotelOptions.find((h) => h.tier === tier) ?? destination.hotelOptions[0];
  const nightlyRate = matchedHotel ? matchedHotel.pricePerNightInr : daily.stay;
  const roomsNeeded = tier === 'backpacker' ? travelers : Math.ceil(travelers / 2);

  const stayCost = tier === 'backpacker'
    ? nightlyRate * days * travelers
    : nightlyRate * days * roomsNeeded;
  const foodCost = daily.food * days * travelers;
  const localTransportCost = daily.localTransport * days * Math.ceil(travelers / 2);
  const activitiesCost = daily.activities * days * travelers;

  const hubTransport = destination.transportByHub[originHub];
  let roundtripPerPerson = 0;
  let activeTransitNote = '';

  if (transportMode === 'flight_economy') {
    if (hubTransport.flight.available) {
      roundtripPerPerson = (hubTransport.flight.economyAvgInr + hubTransport.flight.lastMileTransferInr) * 2;
    } else {
      roundtripPerPerson = hubTransport.train.ac3Inr * 2;
      activeTransitNote = 'Using 3AC rail (no direct flight)';
    }
  } else if (transportMode === 'bus_road') {
    if (hubTransport.road.available && hubTransport.road.busFareInr > 0) {
      roundtripPerPerson = hubTransport.road.busFareInr * 2;
    } else if (hubTransport.train.available) {
      roundtripPerPerson = hubTransport.train.ac3Inr * 2;
      activeTransitNote = 'No direct bus; modeled on 3AC train';
    } else {
      roundtripPerPerson = (hubTransport.flight.economyAvgInr + hubTransport.flight.lastMileTransferInr) * 2;
      activeTransitNote = 'Island/remote corridor; modeled on economy flight';
    }
  } else {
    if (hubTransport.train.available) {
      const oneWay =
        transportMode === 'train_sleeper'
          ? hubTransport.train.sleeperInr
          : transportMode === 'train_2ac'
            ? hubTransport.train.ac2Inr
            : hubTransport.train.ac3Inr;
      roundtripPerPerson = oneWay * 2;
    } else {
      roundtripPerPerson = (hubTransport.flight.economyAvgInr + hubTransport.flight.lastMileTransferInr) * 2;
      activeTransitNote = 'No direct rail; modeled on economy flight + transfer';
    }
  }

  const intercityCost = includeIntercity ? roundtripPerPerson * travelers : 0;
  const totalEstimatedInr =
    stayCost + foodCost + localTransportCost + activitiesCost + intercityCost;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 backdrop-blur-[2px] p-4 sm:p-6 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="dossier-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-5xl bg-[#EFE6D5] border border-[#C9B99B] rounded-xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Top Modal Header */}
        <div className="flex items-center justify-between gap-4 px-6 py-4 border-b border-[#D5C7AE] bg-[#FAF6EE] shrink-0">
          <div className="min-w-0">
            <p className="text-xs text-[#78716C] truncate">
              {destination.state} <span aria-hidden="true">·</span> {destination.region}{' '}
              <span aria-hidden="true">·</span> {destination.vibe}
            </p>
            <h2 id="dossier-title" className="editorial-display text-2xl sm:text-3xl font-semibold text-[#1C1917] truncate">
              {destination.name}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close destination dossier"
            className="w-10 h-10 flex items-center justify-center rounded-lg border border-[#E5DEC9] text-[#44403C] hover:bg-[#F4EFE6] transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto p-6 space-y-8">
          {/* Lead Visual + Thumbnail Gallery Strip & Accession Metadata */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            <div className="lg:col-span-7 flex flex-col">
              <div className="aspect-[4/3] w-full overflow-hidden rounded-lg border border-[#E5DEC9] bg-[#F4EFE6]">
                <ResilientImage
                  src={activePhoto.url}
                  alt={activePhoto.caption}
                  title={destination.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="text-xs font-serif italic text-[#57534E] mt-2">
                {activePhoto.caption}
              </p>

              {/* Multi-Photo Thumbnail Strip */}
              <div className="grid grid-cols-3 gap-2.5 mt-3">
                {gallery.map((photo, idx) => (
                  <button
                    key={`${photo.url}-${idx}`}
                    type="button"
                    onClick={() => setActivePhotoIndex(idx)}
                    className={`relative aspect-[4/3] rounded-md overflow-hidden border transition-all ${
                      activePhotoIndex === idx
                        ? 'border-[#1E3A8A] ring-2 ring-[#1E3A8A]/30'
                        : 'border-[#E5DEC9] opacity-80 hover:opacity-100'
                    }`}
                  >
                    <ResilientImage
                      src={photo.url}
                      alt={photo.caption}
                      title={destination.name}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="lg:col-span-5 flex flex-col justify-between bg-white border border-[#E5DEC9] rounded-lg p-5">
              <div>
                <p className="editorial-dropcap text-[15px] text-[#44403C] leading-[1.68]">
                  {destination.summary}
                </p>
                <dl className="mt-5 divide-y divide-[#EFEAE0] text-sm">
                  <div className="py-2.5 flex justify-between gap-4">
                    <dt className="text-[#78716C]">Best Season</dt>
                    <dd className="font-medium text-[#1C1917] text-right">
                      {destination.bestMonthsLabel} ({destination.avgTempPeak})
                    </dd>
                  </div>
                  <div className="py-2.5 flex justify-between gap-4">
                    <dt className="text-[#78716C]">Ideal Stay</dt>
                    <dd className="digit-tabular font-medium text-[#1C1917] text-right">
                      {destination.idealDays} Days
                    </dd>
                  </div>
                  <div className="py-2.5 flex justify-between gap-4">
                    <dt className="text-[#78716C]">Nearest Air</dt>
                    <dd className="font-medium text-[#1C1917] text-right">
                      {destination.nearestAirport}
                    </dd>
                  </div>
                  <div className="py-2.5 flex justify-between gap-4">
                    <dt className="text-[#78716C]">Railhead</dt>
                    <dd className="font-medium text-[#1C1917] text-right">
                      {destination.nearestRailhead}
                    </dd>
                  </div>
                </dl>
              </div>

              <div className="mt-5 pt-4 border-t border-[#EFEAE0] flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => onToggleTrip(destination.id)}
                  className={`flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border transition-colors whitespace-nowrap ${
                    isInTrip
                      ? 'bg-[#1E3A8A] text-white border-[#1E3A8A]'
                      : 'bg-white text-[#1C1917] border-[#D6CEBE] hover:bg-[#F4EFE6]'
                  }`}
                >
                  {isInTrip ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                  {isInTrip ? 'Added to Calculator' : 'Add to Calculator'}
                </button>
                <button
                  type="button"
                  onClick={() => onToggleCompare(destination.id)}
                  className={`inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border transition-colors whitespace-nowrap ${
                    isCompared
                      ? 'bg-[#9A3412] text-white border-[#9A3412]'
                      : 'bg-white text-[#1C1917] border-[#D6CEBE] hover:bg-[#F4EFE6]'
                  }`}
                >
                  <ArrowLeftRight className="w-3.5 h-3.5" />
                  {isCompared ? 'Comparing' : 'Compare'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onAskAi(destination.name);
                  }}
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg bg-[#1C1917] text-white hover:bg-[#292524] transition-colors whitespace-nowrap"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  Ask AI
                </button>
              </div>
            </div>
          </div>

          {/* Interactive Trip Budget & Transit Mode Estimator inside Dossier */}
          <section className="bg-white border border-[#E5DEC9] rounded-lg p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-5 border-b border-[#EFEAE0]">
              <div>
                <h3 className="font-serif text-xl font-semibold text-[#1C1917]">
                  Interactive {destination.name} Budget & Transit Estimator
                </h3>
                <p className="text-xs text-[#78716C] mt-1">
                  Compare rail classes, flights, and hotel tiers to calculate exact total trip cost.
                </p>
              </div>
              <div className="inline-flex p-1 bg-[#F4EFE6] rounded-lg self-start">
                {(['backpacker', 'comfort', 'luxury'] as BudgetTier[]).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTier(t)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors capitalize whitespace-nowrap ${
                      tier === t
                        ? 'bg-white text-[#1C1917] shadow-sm'
                        : 'text-[#57534E] hover:text-[#1C1917]'
                    }`}
                  >
                    {t === 'luxury' ? 'Heritage Luxury' : t}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 py-5 border-b border-[#EFEAE0]">
              <div>
                <label className="block text-xs font-medium text-[#57534E] mb-1.5">
                  Duration ({days} days)
                </label>
                <input
                  type="range"
                  min={2}
                  max={10}
                  value={days}
                  onChange={(e) => setDays(Number(e.target.value))}
                  className="w-full accent-[#1E3A8A] cursor-pointer"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#57534E] mb-1.5">
                  Travelers ({travelers})
                </label>
                <input
                  type="range"
                  min={1}
                  max={6}
                  value={travelers}
                  onChange={(e) => setTravelers(Number(e.target.value))}
                  className="w-full accent-[#1E3A8A] cursor-pointer"
                />
              </div>
              <div>
                <label htmlFor="dossier-hub" className="block text-xs font-medium text-[#57534E] mb-1.5">
                  Origin Hub
                </label>
                <select
                  id="dossier-hub"
                  value={originHub}
                  onChange={(e) => setOriginHub(e.target.value as HubCity)}
                  className="w-full px-3 py-2 text-xs bg-[#FBF9F5] border border-[#D6CEBE] rounded-lg text-[#1C1917]"
                >
                  <option value="Delhi">From New Delhi</option>
                  <option value="Mumbai">From Mumbai</option>
                  <option value="Bengaluru">From Bengaluru</option>
                  <option value="Kolkata">From Kolkata</option>
                </select>
              </div>
              <div>
                <label htmlFor="dossier-mode" className="block text-xs font-medium text-[#57534E] mb-1.5">
                  Transport Mode
                </label>
                <select
                  id="dossier-mode"
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
              <div className="flex items-end">
                <label className="flex items-center gap-2 text-xs text-[#44403C] cursor-pointer py-2">
                  <input
                    type="checkbox"
                    checked={includeIntercity}
                    onChange={(e) => setIncludeIntercity(e.target.checked)}
                    className="rounded border-[#D6CEBE] accent-[#1E3A8A]"
                  />
                  Include roundtrip transit
                </label>
              </div>
            </div>

            {activeTransitNote && includeIntercity && (
              <p className="text-xs text-[#9A3412] pt-3">{activeTransitNote}</p>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 pt-5 items-end">
              <div>
                <p className="text-xs text-[#78716C]">Stay ({matchedHotel?.typeLabel.split(' ')[0] ?? 'Hotel'})</p>
                <p className="digit-tabular text-sm font-medium text-[#1C1917] mt-1">
                  {formatMoney(stayCost)}
                </p>
              </div>
              <div>
                <p className="text-xs text-[#78716C]">Food & Chai</p>
                <p className="digit-tabular text-sm font-medium text-[#1C1917] mt-1">
                  {formatMoney(foodCost)}
                </p>
              </div>
              <div>
                <p className="text-xs text-[#78716C]">Local Rides</p>
                <p className="digit-tabular text-sm font-medium text-[#1C1917] mt-1">
                  {formatMoney(localTransportCost)}
                </p>
              </div>
              <div>
                <p className="text-xs text-[#78716C]">Tickets & Tours</p>
                <p className="digit-tabular text-sm font-medium text-[#1C1917] mt-1">
                  {formatMoney(activitiesCost)}
                </p>
              </div>
              <div>
                <p className="text-xs text-[#78716C]">
                  {TRANSPORT_MODE_LABELS[transportMode].short}
                </p>
                <p className="digit-tabular text-sm font-medium text-[#1C1917] mt-1">
                  {formatMoney(intercityCost)}
                </p>
              </div>
              <div className="bg-[#EFE6D5] rounded-lg px-3.5 py-2.5">
                <p className="text-[11px] font-medium text-[#57534E]">Total Estimate</p>
                <p className="digit-display text-2xl font-semibold text-[#1E3A8A] leading-none mt-1">
                  {formatMoney(totalEstimatedInr)}
                </p>
              </div>
            </div>
          </section>

          {/* 12-Month Weather Bar */}
          <section className="bg-white border border-[#E5DEC9] rounded-lg p-5">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <h3 className="text-sm font-semibold text-[#1C1917]">12-Month Climate Suitability</h3>
              <p className="text-xs text-[#78716C]">
                Peak = Clear dry weather · Pleasant = Shoulder · Caution = Monsoon or extreme heat/snow
              </p>
            </div>
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-12 gap-2">
              {MONTHS_SHORT.map((month, idx) => {
                const cond = destination.monthConditions[idx];
                const toneClass =
                  cond === 'Peak'
                    ? 'bg-[#1E3A8A]/10 text-[#1E3A8A] border-[#1E3A8A]/25'
                    : cond === 'Pleasant'
                      ? 'bg-[#F4EFE6] text-[#44403C] border-[#D6CEBE]'
                      : 'bg-[#9A3412]/10 text-[#9A3412] border-[#9A3412]/25';
                return (
                  <div
                    key={month}
                    className={`border rounded-md px-2 py-2 text-center ${toneClass}`}
                  >
                    <p className="text-xs font-semibold">{month}</p>
                    <p className="text-[11px] mt-0.5">{cond}</p>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Tabbed Editorial Details: Transport Fares, Hotels, Itinerary, Dishes & Tips */}
          <section className="bg-white border border-[#E5DEC9] rounded-lg p-6">
            <div className="flex flex-wrap items-center gap-2 pb-4 border-b border-[#EFEAE0]">
              <button
                type="button"
                onClick={() => setActiveTab('transport')}
                className={`px-3.5 py-2 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                  activeTab === 'transport'
                    ? 'bg-[#1C1917] text-white'
                    : 'bg-[#F4EFE6] text-[#57534E] hover:text-[#1C1917]'
                }`}
              >
                Train, Flight & Bus Fares
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('hotels')}
                className={`px-3.5 py-2 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                  activeTab === 'hotels'
                    ? 'bg-[#1C1917] text-white'
                    : 'bg-[#F4EFE6] text-[#57534E] hover:text-[#1C1917]'
                }`}
              >
                Curated Hotels & Stays ({destination.hotelOptions.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('itinerary')}
                className={`px-3.5 py-2 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                  activeTab === 'itinerary'
                    ? 'bg-[#1C1917] text-white'
                    : 'bg-[#F4EFE6] text-[#57534E] hover:text-[#1C1917]'
                }`}
              >
                Day-by-Day Blueprint
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('food')}
                className={`px-3.5 py-2 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                  activeTab === 'food'
                    ? 'bg-[#1C1917] text-white'
                    : 'bg-[#F4EFE6] text-[#57534E] hover:text-[#1C1917]'
                }`}
              >
                Food, Savings & Permits
              </button>
            </div>

            {activeTab === 'transport' && (
              <div className="pt-5 space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-xs text-[#57534E]">
                    One-way & roundtrip indicative fares departing <strong>{originHub}</strong>. Switch hub above to compare corridors.
                  </p>
                  <div className="inline-flex p-1 bg-[#F4EFE6] rounded-lg">
                    {(['Delhi', 'Mumbai', 'Bengaluru', 'Kolkata'] as HubCity[]).map((hub) => (
                      <button
                        key={hub}
                        type="button"
                        onClick={() => setOriginHub(hub)}
                        className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
                          originHub === hub ? 'bg-white text-[#1C1917] shadow-sm' : 'text-[#57534E]'
                        }`}
                      >
                        {hub}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Train Card */}
                  <div className="border border-[#E5DEC9] rounded-lg p-4 bg-[#FBF9F5] flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1E3A8A]">
                          <Train className="w-4 h-4" />
                          Indian Railways
                        </span>
                        <span className="font-mono text-xs text-[#57534E]">
                          {hubTransport.train.duration}
                        </span>
                      </div>
                      <h4 className="font-serif text-base font-semibold text-[#1C1917] mt-2">
                        {hubTransport.train.trainName}
                      </h4>
                      <p className="text-xs text-[#57534E] mt-1.5 leading-relaxed">
                        {hubTransport.train.notes}
                      </p>
                    </div>

                    {hubTransport.train.available ? (
                      <dl className="mt-4 pt-3 border-t border-[#E5DEC9] space-y-1.5 text-xs">
                        <div className="flex justify-between">
                          <dt className="text-[#78716C]">Sleeper (SL) one-way</dt>
                          <dd className="digit-tabular font-medium">
                            {formatMoney(hubTransport.train.sleeperInr)}
                          </dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-[#78716C]">AC 3 Tier (3AC) one-way</dt>
                          <dd className="digit-tabular font-semibold text-[#1E3A8A]">
                            {formatMoney(hubTransport.train.ac3Inr)}
                          </dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-[#78716C]">AC 2 Tier (2AC) one-way</dt>
                          <dd className="digit-tabular font-medium">
                            {formatMoney(hubTransport.train.ac2Inr)}
                          </dd>
                        </div>
                      </dl>
                    ) : (
                      <p className="mt-4 pt-3 border-t border-[#E5DEC9] text-xs font-medium text-[#9A3412]">
                        No direct rail terminal; see overland combo or flight.
                      </p>
                    )}
                  </div>

                  {/* Flight Card */}
                  <div className="border border-[#E5DEC9] rounded-lg p-4 bg-[#FAF6EE] flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1E3A8A]">
                          <Plane className="w-4 h-4" />
                          Domestic Flight
                        </span>
                        <span className="digit-tabular text-xs text-[#57534E]">
                          {hubTransport.flight.duration}
                        </span>
                      </div>
                      <h4 className="font-serif text-base font-semibold text-[#1C1917] mt-2">
                        {hubTransport.flight.route}
                      </h4>
                      <p className="text-xs text-[#57534E] mt-1.5 leading-relaxed">
                        {hubTransport.flight.notes}
                      </p>
                    </div>

                    {hubTransport.flight.available ? (
                      <dl className="mt-4 pt-3 border-t border-[#E5DEC9] space-y-1.5 text-xs">
                        <div className="flex justify-between">
                          <dt className="text-[#78716C]">Economy one-way avg</dt>
                          <dd className="digit-tabular font-semibold text-[#1E3A8A]">
                            {formatMoney(hubTransport.flight.economyAvgInr)}
                          </dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-[#78716C]">Airport cab/ferry transfer</dt>
                          <dd className="digit-tabular font-medium">
                            {formatMoney(hubTransport.flight.lastMileTransferInr)}
                          </dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-[#78716C]">Est. roundtrip w/ transfer</dt>
                          <dd className="digit-tabular font-medium">
                            {formatMoney(
                              (hubTransport.flight.economyAvgInr + hubTransport.flight.lastMileTransferInr) * 2
                            )}
                          </dd>
                        </div>
                      </dl>
                    ) : (
                      <p className="mt-4 pt-3 border-t border-[#E5DEC9] text-xs font-medium text-[#9A3412]">
                        No commercial airport directly on site.
                      </p>
                    )}
                  </div>

                  {/* Bus / Road Card */}
                  <div className="border border-[#E5DEC9] rounded-lg p-4 bg-[#FAF6EE] flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1E3A8A]">
                          <Bus className="w-4 h-4" />
                          Volvo / Highway Road
                        </span>
                        <span className="digit-tabular text-xs text-[#57534E]">
                          {hubTransport.road.duration}
                        </span>
                      </div>
                      <h4 className="font-serif text-base font-semibold text-[#1C1917] mt-2">
                        {hubTransport.road.service}
                      </h4>
                      <p className="text-xs text-[#57534E] mt-1.5 leading-relaxed">
                        {hubTransport.road.notes}
                      </p>
                    </div>

                    {hubTransport.road.available ? (
                      <dl className="mt-4 pt-3 border-t border-[#E5DEC9] space-y-1.5 text-xs">
                        <div className="flex justify-between">
                          <dt className="text-[#78716C]">AC Bus / Shared Sumo</dt>
                          <dd className="digit-tabular font-semibold text-[#1E3A8A]">
                            {formatMoney(hubTransport.road.busFareInr)}
                          </dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-[#78716C]">Roundtrip road total</dt>
                          <dd className="digit-tabular font-medium">
                            {formatMoney(hubTransport.road.busFareInr * 2)}
                          </dd>
                        </div>
                      </dl>
                    ) : (
                      <p className="mt-4 pt-3 border-t border-[#E5DEC9] text-xs text-[#78716C]">
                        Long-distance corridor—train or flight strongly recommended.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'hotels' && (
              <div className="pt-5 grid grid-cols-1 md:grid-cols-3 gap-5">
                {destination.hotelOptions.map((hotel) => {
                  const isActiveTier = tier === hotel.tier;
                  return (
                    <div
                      key={hotel.id}
                      className={`border rounded-xl overflow-hidden flex flex-col justify-between transition-colors ${
                        isActiveTier
                          ? 'border-[#1E3A8A] bg-[#FBF9F5]'
                          : 'border-[#E5DEC9] bg-white'
                      }`}
                    >
                      <div>
                        <div className="aspect-[4/3] w-full overflow-hidden bg-[#F4EFE6]">
                          <ResilientImage
                            src={hotel.image}
                            alt={`${hotel.name} in ${hotel.neighborhood}`}
                            title={hotel.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="p-4">
                          <p className="text-xs text-[#78716C]">
                            {hotel.typeLabel} · {hotel.rating}
                          </p>
                          <h4 className="font-serif text-lg font-semibold text-[#1C1917] mt-1">
                            {hotel.name}
                          </h4>
                          <p className="text-xs text-[#57534E] mt-0.5">
                            Area: {hotel.neighborhood}
                          </p>

                          <ul className="mt-3 space-y-1 text-xs text-[#44403C]">
                            {hotel.amenities.map((a) => (
                              <li key={a}>• {a}</li>
                            ))}
                          </ul>

                          <p className="text-xs text-[#78716C] italic mt-3 leading-snug">
                            {hotel.bookingNote}
                          </p>
                        </div>
                      </div>

                      <div className="px-4 py-3 border-t border-[#EFEAE0] bg-white flex items-center justify-between gap-2">
                        <div>
                          <span className="digit-display text-lg font-semibold text-[#1C1917]">
                            {formatMoney(hotel.pricePerNightInr)}
                          </span>
                          <span className="text-xs text-[#78716C]"> / night</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setTier(hotel.tier)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors ${
                            isActiveTier
                              ? 'bg-[#1E3A8A] text-white'
                              : 'bg-[#F4EFE6] text-[#1C1917] hover:bg-[#E5DEC9]'
                          }`}
                        >
                          <BedDouble className="w-3.5 h-3.5" />
                          {isActiveTier ? 'Selected' : 'Model Stay'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {activeTab === 'itinerary' && (
              <div className="divide-y divide-[#EFEAE0] pt-2">
                {destination.dayByDay.map((day) => (
                  <div key={day.day} className="py-4 space-y-2">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <h4 className="editorial-display text-xl font-semibold text-[#1C1917]">
                        <span className="chapter-num text-[#9A3412] mr-2">0{day.day}.</span>
                        {day.title}
                      </h4>
                      <span className="digit-tabular text-xs text-[#57534E]">
                        Est. daily spend ~{formatMoney(day.estimatedSpendInr)}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-[#44403C] pt-1 leading-[1.6]">
                      <div>
                        <span className="text-xs font-semibold text-[#78716C] block mb-1">Morning</span>
                        {day.morning}
                      </div>
                      <div>
                        <span className="text-xs font-semibold text-[#78716C] block mb-1">Afternoon</span>
                        {day.afternoon}
                      </div>
                      <div>
                        <span className="text-xs font-semibold text-[#78716C] block mb-1">Evening</span>
                        {day.evening}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'food' && (
              <div className="pt-4 space-y-6">
                <div>
                  <h4 className="text-sm font-semibold text-[#1C1917] mb-2">
                    Regional Dishes & Typical Street/Cafe Prices
                  </h4>
                  <div className="divide-y divide-[#EFEAE0] border border-[#EFEAE0] rounded-lg px-4">
                    {destination.localDishes.map((dish) => (
                      <div key={dish.name} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <p className="text-sm font-semibold text-[#1C1917]">{dish.name}</p>
                          <p className="text-xs text-[#57534E] mt-0.5">{dish.description}</p>
                        </div>
                        <span className="digit-display text-base font-semibold text-[#9A3412] shrink-0">
                          ~{formatMoney(dish.typicalPriceInr)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm font-semibold text-[#1C1917] mb-2">
                      Practical Money-Saving Notes
                    </h4>
                    <ul className="space-y-2 text-xs text-[#44403C] list-disc pl-5 leading-relaxed">
                      {destination.moneySavingTips.map((tip) => (
                        <li key={tip}>{tip}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-[#1C1917] mb-2">
                      Permits, Entry & Etiquette
                    </h4>
                    <p className="text-xs text-[#44403C] leading-relaxed">
                      {destination.permitAndEntryNotes}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
