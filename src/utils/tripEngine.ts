import {
  DESTINATIONS,
  TRANSPORT_MODE_LABELS,
  type BudgetTier,
  type HubCity,
  type TransportMode,
} from '../data/destinations.ts';

export interface TripStopInput {
  destinationId: string;
  days: number;
}

export interface EstimateRequestBody {
  stops: TripStopInput[];
  originHub: HubCity;
  travelers: number;
  stayTier: BudgetTier;
  transportMode: TransportMode;
  includeContingency: boolean;
}

export interface TransitLegResult {
  destinationId: string;
  destinationName: string;
  requestedMode: TransportMode;
  appliedModeLabel: string;
  serviceName: string;
  duration: string;
  roundtripPerPersonInr: number;
  groupLegCostInr: number;
  fallbackApplied: boolean;
  notes: string;
}

export interface TripEstimateResult {
  totalDays: number;
  travelers: number;
  originHub: HubCity;
  stayTier: BudgetTier;
  transportMode: TransportMode;
  stayTotalInr: number;
  intercityTransitInr: number;
  foodTotalInr: number;
  localTransportInr: number;
  activitiesTotalInr: number;
  contingencyInr: number;
  grandTotalInr: number;
  perPersonInr: number;
  recommendedHotels: Array<{
    destinationName: string;
    hotelName: string;
    neighborhood: string;
    nightlyRateInr: number;
  }>;
  transitLegs: TransitLegResult[];
}

export interface SavedTripRecord {
  id: string;
  title: string;
  createdAt: string;
  request: EstimateRequestBody;
  estimate: TripEstimateResult;
}

export function computeTripEstimate(input: EstimateRequestBody): TripEstimateResult {
  const validHubs: HubCity[] = ['Delhi', 'Mumbai', 'Bengaluru', 'Kolkata'];
  const originHub: HubCity = validHubs.includes(input.originHub) ? input.originHub : 'Delhi';
  const travelers = Math.min(Math.max(Math.round(Number(input.travelers) || 2), 1), 10);
  const stayTier: BudgetTier =
    input.stayTier === 'backpacker' || input.stayTier === 'luxury' ? input.stayTier : 'comfort';
  const transportMode: TransportMode =
    input.transportMode in TRANSPORT_MODE_LABELS ? input.transportMode : 'train_3ac';
  const includeContingency = Boolean(input.includeContingency);

  const stops = Array.isArray(input.stops) ? input.stops.slice(0, 6) : [];

  let totalDays = 0;
  let stayTotalInr = 0;
  let intercityTransitInr = 0;
  let foodTotalInr = 0;
  let localTransportInr = 0;
  let activitiesTotalInr = 0;

  const recommendedHotels: TripEstimateResult['recommendedHotels'] = [];
  const transitLegs: TransitLegResult[] = [];

  stops.forEach((stop, index) => {
    const dest = DESTINATIONS.find((d) => d.id === stop.destinationId);
    if (!dest) return;

    const days = Math.min(Math.max(Math.round(Number(stop.days) || dest.idealDays), 1), 21);
    const roomsNeeded = stayTier === 'backpacker' ? travelers : Math.ceil(travelers / 2);
    const daily = dest.budgets[stayTier];
    const matchedHotel = dest.hotelOptions.find((h) => h.tier === stayTier) ?? dest.hotelOptions[0];

    const nightlyRate = matchedHotel ? matchedHotel.pricePerNightInr : daily.stay;
    const stayForStop =
      stayTier === 'backpacker'
        ? nightlyRate * days * travelers
        : nightlyRate * days * roomsNeeded;

    totalDays += days;
    stayTotalInr += stayForStop;
    foodTotalInr += daily.food * days * travelers;
    localTransportInr += daily.localTransport * days * Math.ceil(travelers / 2);
    activitiesTotalInr += daily.activities * days * travelers;

    if (matchedHotel) {
      recommendedHotels.push({
        destinationName: dest.name,
        hotelName: matchedHotel.name,
        neighborhood: matchedHotel.neighborhood,
        nightlyRateInr: matchedHotel.pricePerNightInr,
      });
    }

    const hubOptions = dest.transportByHub[originHub];
    const legMultiplier = index === 0 ? 1 : 0.7;

    let roundtripPerPerson = 0;
    let appliedLabel = TRANSPORT_MODE_LABELS[transportMode].label;
    let serviceName = '';
    let duration = '';
    let notes = '';
    let fallbackApplied = false;

    if (transportMode === 'flight_economy') {
      if (hubOptions.flight.available) {
        roundtripPerPerson =
          (hubOptions.flight.economyAvgInr * 2 + hubOptions.flight.lastMileTransferInr * 2) *
          legMultiplier;
        serviceName = hubOptions.flight.route;
        duration = hubOptions.flight.duration;
        notes = hubOptions.flight.notes;
      } else {
        fallbackApplied = true;
        appliedLabel = 'Train — 3AC (Fallback)';
        roundtripPerPerson = hubOptions.train.ac3Inr * 2 * legMultiplier;
        serviceName = hubOptions.train.trainName;
        duration = hubOptions.train.duration;
        notes = hubOptions.train.notes;
      }
    } else if (transportMode === 'bus_road') {
      if (hubOptions.road.available && hubOptions.road.busFareInr > 0) {
        roundtripPerPerson = hubOptions.road.busFareInr * 2 * legMultiplier;
        serviceName = hubOptions.road.service;
        duration = hubOptions.road.duration;
        notes = hubOptions.road.notes;
      } else if (hubOptions.train.available) {
        fallbackApplied = true;
        appliedLabel = 'Train — 3AC (No direct bus)';
        roundtripPerPerson = hubOptions.train.ac3Inr * 2 * legMultiplier;
        serviceName = hubOptions.train.trainName;
        duration = hubOptions.train.duration;
        notes = `${hubOptions.road.notes} Switched to rail: ${hubOptions.train.notes}`;
      } else {
        fallbackApplied = true;
        appliedLabel = 'Airplane — Economy (Required)';
        roundtripPerPerson =
          (hubOptions.flight.economyAvgInr * 2 + hubOptions.flight.lastMileTransferInr * 2) *
          legMultiplier;
        serviceName = hubOptions.flight.route;
        duration = hubOptions.flight.duration;
        notes = hubOptions.flight.notes;
      }
    } else {
      if (hubOptions.train.available) {
        const oneWay =
          transportMode === 'train_sleeper'
            ? hubOptions.train.sleeperInr
            : transportMode === 'train_2ac'
              ? hubOptions.train.ac2Inr
              : hubOptions.train.ac3Inr;
        roundtripPerPerson = oneWay * 2 * legMultiplier;
        serviceName = hubOptions.train.trainName;
        duration = hubOptions.train.duration;
        notes = hubOptions.train.notes;
      } else if (hubOptions.flight.available) {
        fallbackApplied = true;
        appliedLabel = 'Airplane — Economy (No direct rail)';
        roundtripPerPerson =
          (hubOptions.flight.economyAvgInr * 2 + hubOptions.flight.lastMileTransferInr * 2) *
          legMultiplier;
        serviceName = hubOptions.flight.route;
        duration = hubOptions.flight.duration;
        notes = `${hubOptions.train.notes} Estimated using airfare: ${hubOptions.flight.notes}`;
      }
    }

    const roundedPerPerson = Math.round(roundtripPerPerson);
    const groupLegCost = roundedPerPerson * travelers;
    intercityTransitInr += groupLegCost;

    transitLegs.push({
      destinationId: dest.id,
      destinationName: dest.name,
      requestedMode: transportMode,
      appliedModeLabel: appliedLabel,
      serviceName,
      duration,
      roundtripPerPersonInr: roundedPerPerson,
      groupLegCostInr: groupLegCost,
      fallbackApplied,
      notes,
    });
  });

  const subtotal =
    stayTotalInr + intercityTransitInr + foodTotalInr + localTransportInr + activitiesTotalInr;
  const contingencyInr = includeContingency ? Math.round(subtotal * 0.1) : 0;
  const grandTotalInr = subtotal + contingencyInr;
  const perPersonInr = travelers > 0 ? Math.round(grandTotalInr / travelers) : grandTotalInr;

  return {
    totalDays,
    travelers,
    originHub,
    stayTier,
    transportMode,
    stayTotalInr,
    intercityTransitInr,
    foodTotalInr,
    localTransportInr,
    activitiesTotalInr,
    contingencyInr,
    grandTotalInr,
    perPersonInr,
    recommendedHotels,
    transitLegs,
  };
}

const LOCAL_TRIPS_KEY = 'yatra_atlas_saved_trips_v1';

export function loadLocalTrips(): SavedTripRecord[] {
  try {
    const raw = window.localStorage.getItem(LOCAL_TRIPS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as SavedTripRecord[];
    return Array.isArray(parsed)
      ? parsed.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      : [];
  } catch {
    return [];
  }
}

export function saveLocalTrip(titleInput: string | undefined, request: EstimateRequestBody): SavedTripRecord {
  const estimate = computeTripEstimate(request);
  const stopNames = request.stops
    .map((s) => DESTINATIONS.find((d) => d.id === s.destinationId)?.name)
    .filter(Boolean)
    .join(' · ');

  const randomId =
    typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID().slice(0, 8)
      : Math.random().toString(36).slice(2, 10);

  const record: SavedTripRecord = {
    id: randomId,
    title: (titleInput && titleInput.trim()) || `${stopNames || 'India Route'} (${estimate.totalDays}d)`,
    createdAt: new Date().toISOString(),
    request,
    estimate,
  };

  try {
    const existing = loadLocalTrips().filter((t) => t.id !== record.id);
    const updated = [record, ...existing].slice(0, 30);
    window.localStorage.setItem(LOCAL_TRIPS_KEY, JSON.stringify(updated));
  } catch {
    // Ignore storage quota errors in restricted browsing modes
  }

  return record;
}

export function deleteLocalTrip(id: string): SavedTripRecord[] {
  const remaining = loadLocalTrips().filter((t) => t.id !== id);
  try {
    window.localStorage.setItem(LOCAL_TRIPS_KEY, JSON.stringify(remaining));
  } catch {
    // Ignore storage errors
  }
  return remaining;
}
