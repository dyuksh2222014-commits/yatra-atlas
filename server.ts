import express from 'express';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';
import type { Request, Response } from 'express';
import {
  DESTINATIONS,
  MONTHS_SHORT,
  TRANSPORT_MODE_LABELS,
  type BudgetTier,
  type HubCity,
  type TransportMode,
} from './src/data/destinations.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = Number(process.env.PORT) || 3000;
const TRIPS_STORE_PATH = path.resolve(__dirname, '.yatra-trips.json');


interface TripStopInput {
  destinationId: string;
  days: number;
}

interface EstimateRequestBody {
  stops: TripStopInput[];
  originHub: HubCity;
  travelers: number;
  stayTier: BudgetTier;
  transportMode: TransportMode;
  includeContingency: boolean;
}

interface TransitLegResult {
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

interface TripEstimateResult {
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

// Persistent JSON trip store with in-memory fallback
const memoryTrips = new Map<string, SavedTripRecord>();

function loadTripsFromDisk(): void {
  try {
    if (fs.existsSync(TRIPS_STORE_PATH)) {
      const raw = fs.readFileSync(TRIPS_STORE_PATH, 'utf-8');
      const parsed = JSON.parse(raw) as SavedTripRecord[];
      if (Array.isArray(parsed)) {
        parsed.forEach((item) => {
          if (item && item.id) memoryTrips.set(item.id, item);
        });
      }
    }
  } catch (err) {
    console.warn('Could not read saved trips file, using memory store:', err);
  }
}

function persistTripsToDisk(): void {
  try {
    const list = Array.from(memoryTrips.values()).slice(0, 50);
    fs.writeFileSync(TRIPS_STORE_PATH, JSON.stringify(list, null, 2), 'utf-8');
  } catch {
    // Non-fatal in read-only environments; memory store remains active
  }
}

loadTripsFromDisk();

function computeTripEstimate(input: EstimateRequestBody): TripEstimateResult {
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

    // Authoritative transport calculation from originHub (multi-stop leg factor 0.7 for subsequent hops)
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
      // Train modes
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

function getAiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured in the server environment.');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

async function withRetry<T>(fn: () => Promise<T>, retries = 2): Promise<T> {
  let lastErr: unknown;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      const msg = err instanceof Error ? err.message : String(err);
      const isTransient = msg.includes('429') || msg.includes('503') || msg.includes('UNAVAILABLE');
      if (!isTransient || attempt === retries) break;
      await new Promise((r) => setTimeout(r, 600 * Math.pow(2, attempt)));
    }
  }
  throw lastErr;
}

const DESTINATION_CATALOG_BRIEF = DESTINATIONS.map(
  (d) =>
    `${d.name} (${d.state}, Best: ${d.bestMonthsLabel}, Backpacker ₹${d.budgets.backpacker.total}/d, Comfort ₹${d.budgets.comfort.total}/d, Luxury ₹${d.budgets.luxury.total}/d, Hotels: ${d.hotelOptions.map((h) => `${h.name} ₹${h.pricePerNightInr}`).join('; ')})`
).join('\n');

const TRAVEL_SYSTEM_INSTRUCTION = `You are the Yatra Atlas AI Travel Concierge — an expert, grounded specialist on travelling across India (including Northwest, Himalayan, Rajasthan, Western, Southern, and Northeastern states) across every budget tier, rail class, flight corridor, and accommodation style.
Your guidance must be practical, accurate, culturally respectful, and transparent about real-world costs strictly in Indian Rupees (INR, ₹).

Reference Catalog Baselines:
${DESTINATION_CATALOG_BRIEF}

When answering user questions:
- Compare realistic transportation modes when asked: Indian Railways Sleeper (SL), 3AC, 2AC, Vande Bharat Express Chair Car, economy domestic flights, and Volvo AC buses.
- Suggest concrete hotel/homestay neighborhoods and nightly INR price bands (hostels/homestays ₹650–₹1,400, comfort boutiques ₹2,800–₹4,500, heritage palaces/resorts ₹12,500–₹22,500).
- Note seasonal suitability (winter peak Oct–Mar, Himalayan summer May–Sep, monsoon considerations Jun–Sep).
- Keep formatting clean and scannable using short paragraphs, numbered days, or clear bullet points.`;

const app = express();
app.use(express.json({ limit: '1mb' }));

// Health check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    destinationsCount: DESTINATIONS.length,
    savedTripsCount: memoryTrips.size,
    aiConfigured: Boolean(process.env.GEMINI_API_KEY),
  });
});

// Queryable Destinations Catalog API
app.get('/api/destinations', (req: Request, res: Response) => {
  const { region, vibe, q, month, maxComfortInr } = req.query as Record<string, string | undefined>;

  let results = [...DESTINATIONS];

  if (region && region !== 'All') {
    results = results.filter((d) => d.region.toLowerCase() === region.toLowerCase());
  }
  if (vibe && vibe !== 'All') {
    results = results.filter((d) => d.vibe.toLowerCase() === vibe.toLowerCase());
  }
  if (maxComfortInr && !Number.isNaN(Number(maxComfortInr))) {
    const cap = Number(maxComfortInr);
    results = results.filter((d) => d.budgets.comfort.total <= cap);
  }
  if (month) {
    const monthIndex = MONTHS_SHORT.findIndex(
      (m) => m.toLowerCase() === month.slice(0, 3).toLowerCase()
    );
    if (monthIndex >= 0) {
      results = results.filter((d) => d.monthConditions[monthIndex] !== 'Caution');
    }
  }
  if (q && q.trim()) {
    const term = q.trim().toLowerCase();
    results = results.filter((d) =>
      `${d.name} ${d.state} ${d.region} ${d.vibe} ${d.tagline}`.toLowerCase().includes(term)
    );
  }

  res.json({
    count: results.length,
    destinations: results,
  });
});

app.get('/api/destinations/:id', (req: Request, res: Response) => {
  const found = DESTINATIONS.find((d) => d.id === req.params.id);
  if (!found) {
    res.status(404).json({ error: 'Destination not found.' });
    return;
  }
  res.json(found);
});

// Authoritative Multi-City & Transport Mode Trip Estimate API
app.post('/api/trip/estimate', (req: Request, res: Response) => {
  const body = req.body as Partial<EstimateRequestBody>;
  if (!body || !Array.isArray(body.stops)) {
    res.status(400).json({ error: 'stops array is required.' });
    return;
  }

  const estimate = computeTripEstimate({
    stops: body.stops,
    originHub: (body.originHub as HubCity) ?? 'Delhi',
    travelers: Number(body.travelers) || 2,
    stayTier: (body.stayTier as BudgetTier) ?? 'comfort',
    transportMode: (body.transportMode as TransportMode) ?? 'train_3ac',
    includeContingency: body.includeContingency ?? true,
  });

  res.json(estimate);
});

// Saved Trips CRUD API
app.get('/api/trips', (_req: Request, res: Response) => {
  const trips = Array.from(memoryTrips.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  res.json({ trips });
});

app.get('/api/trips/:id', (req: Request, res: Response) => {
  const trip = memoryTrips.get(req.params.id);
  if (!trip) {
    res.status(404).json({ error: 'Saved trip plan not found.' });
    return;
  }
  res.json(trip);
});

app.post('/api/trips', (req: Request, res: Response) => {
  const { title, request: tripRequest } = req.body as {
    title?: string;
    request?: EstimateRequestBody;
  };

  if (!tripRequest || !Array.isArray(tripRequest.stops) || tripRequest.stops.length === 0) {
    res.status(400).json({ error: 'Select at least one destination stop before saving.' });
    return;
  }

  const estimate = computeTripEstimate(tripRequest);
  const stopNames = tripRequest.stops
    .map((s) => DESTINATIONS.find((d) => d.id === s.destinationId)?.name)
    .filter(Boolean)
    .join(' · ');

  const record: SavedTripRecord = {
    id: crypto.randomUUID().slice(0, 8),
    title: (title && title.trim()) || `${stopNames || 'India Route'} (${estimate.totalDays}d)`,
    createdAt: new Date().toISOString(),
    request: tripRequest,
    estimate,
  };

  memoryTrips.set(record.id, record);
  persistTripsToDisk();
  res.status(201).json(record);
});

app.delete('/api/trips/:id', (req: Request, res: Response) => {
  if (!memoryTrips.has(req.params.id)) {
    res.status(404).json({ error: 'Saved trip plan not found.' });
    return;
  }
  memoryTrips.delete(req.params.id);
  persistTripsToDisk();
  res.json({ deleted: true, id: req.params.id });
});

interface ChatTurnInput {
  role: 'user' | 'model';
  text: string;
}

// Streaming AI Travel Concierge
app.post('/api/assistant/chat', async (req: Request, res: Response) => {
  const { message, history, contextDestination } = req.body as {
    message?: string;
    history?: ChatTurnInput[];
    contextDestination?: string;
  };

  if (!message || typeof message !== 'string' || !message.trim()) {
    res.status(400).json({ error: 'A travel question is required.' });
    return;
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  try {
    const ai = getAiClient();
    const matchedDest = contextDestination
      ? DESTINATIONS.find((d) => d.name.toLowerCase() === contextDestination.toLowerCase())
      : undefined;

    const systemPrompt = matchedDest
      ? `${TRAVEL_SYSTEM_INSTRUCTION}\n\nActive Destination Focus: ${matchedDest.name}, ${matchedDest.state}. Curated hotels: ${matchedDest.hotelOptions.map((h) => `${h.name} (${h.neighborhood}, ₹${h.pricePerNightInr}/nt)`).join(', ')}. Prioritize train/flight/hotel guidance for this destination when relevant.`
      : TRAVEL_SYSTEM_INSTRUCTION;

    const formattedHistory = Array.isArray(history)
      ? history
          .filter(
            (item) =>
              item &&
              (item.role === 'user' || item.role === 'model') &&
              typeof item.text === 'string' &&
              item.text.trim()
          )
          .slice(-10)
          .map((item) => ({
            role: item.role,
            parts: [{ text: item.text }],
          }))
      : [];

    const stream = await withRetry(async () => {
      const chat = ai.chats.create({
        model: 'gemini-4-hydrogen',
        config: {
          systemInstruction: systemPrompt,
        },
        history: formattedHistory,
      });
      return chat.sendMessageStream({
        message: message.trim(),
      });
    });

    for await (const chunk of stream) {
      if (chunk.text) {
        res.write(`data: ${JSON.stringify({ text: chunk.text })}\n\n`);
      }
    }

    res.write(`data: [DONE]\n\n`);
    res.end();
  } catch (err: unknown) {
    const messageText = err instanceof Error ? err.message : 'Unable to reach Gemini travel service.';
    console.error('Chat stream error:', err);
    res.write(`data: ${JSON.stringify({ error: messageText })}\n\n`);
    res.end();
  }
});

// Structured AI Itinerary & Hotel/Transport Planner
app.post('/api/assistant/itinerary', async (req: Request, res: Response) => {
  const { destination, originCity, days, travelers, budgetTier, transportPreference, travelMonth, interests } =
    req.body as {
      destination?: string;
      originCity?: string;
      days?: number;
      travelers?: number;
      budgetTier?: string;
      transportPreference?: string;
      travelMonth?: string;
      interests?: string;
    };

  if (!destination || typeof destination !== 'string') {
    res.status(400).json({ error: 'Destination is required to build an itinerary.' });
    return;
  }

  const tripDays = Math.min(Math.max(Number(days) || 4, 2), 10);
  const groupCount = Math.min(Math.max(Number(travelers) || 2, 1), 8);
  const tierLabel = budgetTier || 'Comfort';
  const transitPref = transportPreference || 'Train (3AC / Vande Bharat) or Economy Flight';
  const startCity = originCity || 'New Delhi';
  const month = travelMonth || 'November';
  const interestFocus = interests || 'Culture, heritage, and local cuisine';

  try {
    const ai = getAiClient();
    const prompt = `Build a realistic, detailed ${tripDays}-day India trip itinerary to ${destination} departing from ${startCity} in ${month} for ${groupCount} traveler(s) at a "${tierLabel}" budget tier, preferring "${transitPref}" transportation. Interests: ${interestFocus}.
Include specific hotel/neighborhood suggestions, train/flight fare estimates, and realistic INR costs per category and per day.`;

    const response = await withRetry(() =>
      ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: prompt,
        config: {
          systemInstruction: TRAVEL_SYSTEM_INSTRUCTION,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              tripTitle: { type: Type.STRING },
              seasonSuitability: { type: Type.STRING },
              recommendedTransit: { type: Type.STRING },
              recommendedStayNote: { type: Type.STRING },
              totalEstimatedInr: { type: Type.INTEGER },
              costPerPersonInr: { type: Type.INTEGER },
              budgetBreakdown: {
                type: Type.OBJECT,
                properties: {
                  intercityTransitInr: { type: Type.INTEGER },
                  accommodationInr: { type: Type.INTEGER },
                  foodAndDiningInr: { type: Type.INTEGER },
                  localTransportAndGuidesInr: { type: Type.INTEGER },
                  ticketsAndExperiencesInr: { type: Type.INTEGER },
                },
                required: [
                  'intercityTransitInr',
                  'accommodationInr',
                  'foodAndDiningInr',
                  'localTransportAndGuidesInr',
                  'ticketsAndExperiencesInr',
                ],
              },
              days: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    dayNumber: { type: Type.INTEGER },
                    headline: { type: Type.STRING },
                    morning: { type: Type.STRING },
                    afternoon: { type: Type.STRING },
                    evening: { type: Type.STRING },
                    estimatedGroupSpendInr: { type: Type.INTEGER },
                  },
                  required: ['dayNumber', 'headline', 'morning', 'afternoon', 'evening', 'estimatedGroupSpendInr'],
                },
              },
              mustTryDishes: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              packingAndSavingTips: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
            },
            required: [
              'tripTitle',
              'seasonSuitability',
              'recommendedTransit',
              'recommendedStayNote',
              'totalEstimatedInr',
              'costPerPersonInr',
              'budgetBreakdown',
              'days',
              'mustTryDishes',
              'packingAndSavingTips',
            ],
          },
        },
      })
    );

    const rawText = (response.text ?? '{}').trim();
    const parsed = JSON.parse(rawText);
    res.json(parsed);
  } catch (err: unknown) {
    const messageText = err instanceof Error ? err.message : 'Unable to generate custom itinerary.';
    console.error('Itinerary generation error:', err);
    res.status(500).json({ error: messageText });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Yatra Atlas server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
