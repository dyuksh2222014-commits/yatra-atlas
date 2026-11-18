import {
  DESTINATIONS,
  Destination,
  MONTHS_SHORT,
  MONTHLY_FESTIVALS,
  formatMoney,
  type BudgetTier,
  type HubCity,
  type TransportMode,
} from '../data/destinations.ts';
import { computeTripEstimate } from './tripEngine.ts';

export interface GeneratedItinerary {
  tripTitle: string;
  seasonSuitability: string;
  recommendedTransit: string;
  recommendedStayNote: string;
  totalEstimatedInr: number;
  costPerPersonInr: number;
  budgetBreakdown: {
    intercityTransitInr: number;
    accommodationInr: number;
    foodAndDiningInr: number;
    localTransportAndGuidesInr: number;
    ticketsAndExperiencesInr: number;
  };
  days: Array<{
    dayNumber: number;
    headline: string;
    morning: string;
    afternoon: string;
    evening: string;
    estimatedGroupSpendInr: number;
  }>;
  mustTryDishes: string[];
  packingAndSavingTips: string[];
}

function detectHub(text: string): HubCity {
  const lower = text.toLowerCase();
  if (lower.includes('mumbai') || lower.includes('pune') || lower.includes('bom')) return 'Mumbai';
  if (lower.includes('bengaluru') || lower.includes('bangalore') || lower.includes('chennai') || lower.includes('hyderabad')) {
    return 'Bengaluru';
  }
  if (lower.includes('kolkata') || lower.includes('calcutta') || lower.includes('ccu')) return 'Kolkata';
  return 'Delhi';
}

function matchDestinationsFromText(text: string): Destination[] {
  const lower = text.toLowerCase();
  const matches: Destination[] = [];

  for (const d of DESTINATIONS) {
    const tokens = [
      d.id,
      d.name.toLowerCase(),
      d.state.toLowerCase(),
      ...d.name.toLowerCase().split(/\s+/),
    ];
    if (tokens.some((tok) => tok.length > 3 && lower.includes(tok))) {
      matches.push(d);
    }
  }

  // Regional / keyword hints
  if (matches.length === 0) {
    if (lower.includes('northwest') || lower.includes('punjab') || lower.includes('kashmir') || lower.includes('himachal')) {
      matches.push(
        ...DESTINATIONS.filter((d) => d.region === 'Northwest India')
      );
    } else if (lower.includes('rajasthan') || lower.includes('golden triangle') || lower.includes('haveli')) {
      matches.push(
        ...DESTINATIONS.filter((d) => ['jaipur', 'udaipur', 'jaisalmer'].includes(d.id))
      );
    } else if (lower.includes('south') || lower.includes('beach') || lower.includes('backwater') || lower.includes('island')) {
      matches.push(
        ...DESTINATIONS.filter((d) => d.region === 'South India')
      );
    } else if (lower.includes('monsoon') || lower.includes('july') || lower.includes('august')) {
      matches.push(
        ...DESTINATIONS.filter((d) => d.monthConditions[6] === 'Peak' || d.monthConditions[6] === 'Pleasant')
      );
    }
  }

  return matches;
}

function detectMonthIndex(text: string): number | null {
  const fullMonths = [
    'january', 'february', 'march', 'april', 'may', 'june',
    'july', 'august', 'september', 'october', 'november', 'december',
  ];
  const lower = text.toLowerCase();
  for (let i = 0; i < 12; i++) {
    if (lower.includes(fullMonths[i]) || new RegExp(`\\b${MONTHS_SHORT[i].toLowerCase()}\\b`).test(lower)) {
      return i;
    }
  }
  return null;
}

export function generateLocalChatReply(
  message: string,
  _history: Array<{ role: 'user' | 'model'; text: string }>,
  contextDestination?: string | null
): string {
  const combinedContext = `${message} ${contextDestination ?? ''}`;
  const hub = detectHub(message);
  let matched = matchDestinationsFromText(message);
  if (matched.length === 0 && contextDestination) {
    matched = matchDestinationsFromText(contextDestination);
  }

  const lower = combinedContext.toLowerCase();
  const monthIdx = detectMonthIndex(lower);
  const asksMonsoon = lower.includes('monsoon') || monthIdx === 6 || monthIdx === 7;
  const asksHotels = lower.includes('hotel') || lower.includes('stay') || lower.includes('haveli') || lower.includes('hostel');
  const asksTransit = lower.includes('train') || lower.includes('flight') || lower.includes('bus') || lower.includes('3ac') || lower.includes('sleeper') || lower.includes('vande bharat');
  const asksBudget = lower.includes('under') || lower.includes('budget') || lower.includes('cheap') || lower.includes('cost') || lower.includes('rupee') || lower.includes('₹');

  // Monsoon / seasonal matrix answer
  if (asksMonsoon && matched.length === 0) {
    const idx = monthIdx ?? 6;
    const peakJuly = DESTINATIONS.filter((d) => d.monthConditions[idx] === 'Peak');
    const pleasantJuly = DESTINATIONS.filter((d) => d.monthConditions[idx] === 'Pleasant');
    return [
      `**Best Destinations in ${MONTHS_SHORT[idx]}** — ${MONTHLY_FESTIVALS[idx].seasonNote}`,
      '',
      ...peakJuly.map(
        (d) =>
          `- **${d.name} (${d.state})** [Peak]: Comfort budget **${formatMoney(d.budgets.comfort.total)}/day**, Backpacker **${formatMoney(d.budgets.backpacker.total)}/day**. ${d.tagline}`
      ),
      ...pleasantJuly.slice(0, 3).map(
        (d) =>
          `- **${d.name} (${d.state})** [Pleasant]: Comfort budget **${formatMoney(d.budgets.comfort.total)}/day**. ${d.bestMonthsLabel} (${d.avgTempPeak}).`
      ),
      '',
      '- Avoid coastal Goa, Andaman ferries, and steep valley treks during heavy July–August monsoon bursts when landslides or sea swells disrupt schedules.',
    ].join('\n');
  }

  // General hotel search (e.g., under ₹4,000/night)
  if (asksHotels && matched.length > 0) {
    const lines: string[] = [
      `**Curated Stays & Neighborhoods (${matched.slice(0, 3).map((d) => d.name).join(', ')})**`,
      '',
    ];
    matched.slice(0, 3).forEach((d) => {
      lines.push(`**${d.name}, ${d.state}**`);
      d.hotelOptions.forEach((h) => {
        lines.push(
          `- **${h.name}** (${h.typeLabel} · ${h.neighborhood}) — **${formatMoney(h.pricePerNightInr)}/night** (${h.rating}). ${h.bookingNote}`
        );
      });
      lines.push('');
    });
    return lines.join('\n').trim();
  }

  // Destination-focused response (up to 2 matched destinations)
  if (matched.length > 0) {
    const targets = matched.slice(0, 2);
    const sections: string[] = [];

    targets.forEach((d) => {
      const transit = d.transportByHub[hub];
      const budgetHotel = d.hotelOptions.find((h) => h.tier === 'backpacker') ?? d.hotelOptions[0];
      const comfortHotel = d.hotelOptions.find((h) => h.tier === 'comfort') ?? d.hotelOptions[1];
      const luxuryHotel = d.hotelOptions.find((h) => h.tier === 'luxury') ?? d.hotelOptions[2];

      sections.push(`**${d.name}, ${d.state}** · Ideal stay: ${d.idealDays} days · Best: ${d.bestMonthsLabel}`);
      sections.push(
        `- **Daily Budgets (INR):** Backpacker **${formatMoney(d.budgets.backpacker.total)}/d**, Comfort **${formatMoney(d.budgets.comfort.total)}/d**, Luxury **${formatMoney(d.budgets.luxury.total)}/d**.`
      );

      if (asksTransit || !asksHotels) {
        const trainLine = transit.train.available
          ? `**Train (${transit.train.trainName}, ${transit.train.duration}):** Sleeper ${formatMoney(transit.train.sleeperInr)}, 3AC ${formatMoney(transit.train.ac3Inr)}, 2AC ${formatMoney(transit.train.ac2Inr)} one-way.`
          : `**Train:** ${transit.train.notes}`;
        const flightLine = transit.flight.available
          ? `**Flight (${transit.flight.route}, ${transit.flight.duration}):** ~${formatMoney(transit.flight.economyAvgInr)} + ${formatMoney(transit.flight.lastMileTransferInr)} transfer.`
          : `**Flight:** ${transit.flight.notes}`;
        sections.push(`- **From ${hub}:** ${trainLine}`);
        sections.push(`- ${flightLine}`);
        if (transit.road.available) {
          sections.push(`- **Bus / Road:** ${transit.road.service} (${transit.road.duration}) · ~${formatMoney(transit.road.busFareInr)}.`);
        }
      }

      sections.push(
        `- **Hotel Picks:** Budget — *${budgetHotel?.name}* (${budgetHotel?.neighborhood}, **${formatMoney(budgetHotel?.pricePerNightInr ?? 900)}/nt**); Comfort — *${comfortHotel?.name}* (${comfortHotel?.neighborhood}, **${formatMoney(comfortHotel?.pricePerNightInr ?? 3200)}/nt**); Luxury — *${luxuryHotel?.name}* (**${formatMoney(luxuryHotel?.pricePerNightInr ?? 14000)}/nt**).`
      );
      sections.push(
        `- **Money-Saving Tip:** ${d.moneySavingTips[0] ?? 'Book IRCTC 3AC and ASI monument QR passes early.'}`
      );
      sections.push('');
    });

    if (targets.length === 2) {
      const est = computeTripEstimate({
        stops: targets.map((d) => ({ destinationId: d.id, days: d.idealDays })),
        originHub: hub,
        travelers: 2,
        stayTier: asksBudget ? 'backpacker' : 'comfort',
        transportMode: 'train_3ac',
        includeContingency: true,
      });
      sections.push(
        `**Combined ${est.totalDays}-Day Estimate (2 travelers from ${hub}, ${asksBudget ? 'Backpacker' : 'Comfort'} + 3AC Rail):** **${formatMoney(est.grandTotalInr)}** total (**${formatMoney(est.perPersonInr)}/person** including stays, food, local transit & 10% buffer).`
      );
    }

    return sections.join('\n').trim();
  }

  // Budget-focused broad India guide
  if (asksBudget) {
    const affordable = [...DESTINATIONS]
      .sort((a, b) => a.budgets.backpacker.total - b.budgets.backpacker.total)
      .slice(0, 5);
    return [
      '**Best Value Indian Destinations (Rupee Budgets)**',
      '',
      ...affordable.map(
        (d) =>
          `- **${d.name} (${d.state})**: Backpacker **${formatMoney(d.budgets.backpacker.total)}/day** · Comfort **${formatMoney(d.budgets.comfort.total)}/day** · 3AC from ${hub}: ${
            d.transportByHub[hub].train.available
              ? formatMoney(d.transportByHub[hub].train.ac3Inr)
              : `Flight ${formatMoney(d.transportByHub[hub].flight.economyAvgInr)}`
          }`
      ),
      '',
      '- **Rail Savings:** Book Indian Railways 3AC or Sleeper 60 days out on IRCTC, and stay near old-town walking zones to trim auto fares.',
    ].join('\n');
  }

  // Default comprehensive overview
  return [
    `**Yatra Atlas Quick Guide (Departing ${hub})**`,
    '',
    '- **Northwest & Himalayan Loops:** Combine **Amritsar** (Comfort ₹3,350/d), **Dharamshala** (Comfort ₹3,600/d), and **Srinagar** (Comfort ₹4,950/d) via Vande Bharat + Kangra/Kashmir flights.',
    '- **Rajasthan & Heritage Rail:** **Jaipur** + **Udaipur** + **Varanasi** connect smoothly on overnight 3AC trains (₹820–₹1,480/leg) with heritage havelis between ₹2,900–₹4,200/night.',
    '- **Backwaters, Ruins & Islands:** **Hampi** (Backpacker ₹1,400/d) and **Alleppey** (Comfort ₹4,600/d) pair well from Bengaluru/Mumbai, while **Andaman** requires flights from Kolkata/Bengaluru/Mumbai.',
    '',
    'Ask me about any specific city, train class vs flight comparison, month of travel, or hotel budget in INR (₹)!',
  ].join('\n');
}

export function generateLocalItinerary(params: {
  destination: string;
  originCity?: string;
  days?: number;
  travelers?: number;
  budgetTier?: string;
  transportPreference?: string;
  travelMonth?: string;
  interests?: string;
}): GeneratedItinerary {
  const tripDays = Math.min(Math.max(Math.round(Number(params.days) || 4), 2), 10);
  const groupCount = Math.min(Math.max(Math.round(Number(params.travelers) || 2), 1), 8);
  const originHub = detectHub(params.originCity || 'New Delhi');
  const monthLabel = params.travelMonth || 'November';
  const monthIdx = detectMonthIndex(monthLabel) ?? 10;

  const tierLower = (params.budgetTier || 'comfort').toLowerCase();
  const stayTier: BudgetTier = tierLower.includes('backpacker')
    ? 'backpacker'
    : tierLower.includes('luxury')
      ? 'luxury'
      : 'comfort';

  const transitLower = (params.transportPreference || '').toLowerCase();
  const transportMode: TransportMode = transitLower.includes('flight')
    ? 'flight_economy'
    : transitLower.includes('sleeper') || transitLower.includes('bus')
      ? transitLower.includes('bus')
        ? 'bus_road'
        : 'train_sleeper'
      : transitLower.includes('2ac')
        ? 'train_2ac'
        : 'train_3ac';

  let matched = matchDestinationsFromText(params.destination);
  if (matched.length === 0) {
    matched = [DESTINATIONS[0]]; // Udaipur fallback
  }
  const activeDests = matched.slice(0, Math.min(3, Math.max(1, Math.floor(tripDays / 2))));

  // Distribute tripDays across activeDests
  const baseDaysPerStop = Math.max(1, Math.floor(tripDays / activeDests.length));
  let remainder = tripDays - baseDaysPerStop * activeDests.length;
  const stops = activeDests.map((d) => {
    const extra = remainder > 0 ? 1 : 0;
    if (remainder > 0) remainder--;
    return { destinationId: d.id, days: baseDaysPerStop + extra };
  });

  const estimate = computeTripEstimate({
    stops,
    originHub,
    travelers: groupCount,
    stayTier,
    transportMode,
    includeContingency: false,
  });

  const primary = activeDests[0];
  const monthCond = primary.monthConditions[monthIdx] ?? 'Pleasant';
  const seasonNote =
    monthCond === 'Peak'
      ? `Peak season in ${monthLabel} — crisp skies and comfortable daytime exploring (${primary.avgTempPeak}).`
      : monthCond === 'Pleasant'
        ? `Pleasant shoulder window in ${monthLabel} — lighter crowds and favorable hotel availability.`
        : `Caution window in ${monthLabel} — expect seasonal weather swings (monsoon rain or peak heat/snow); keep buffer time in transit.`;

  const transitSummary = estimate.transitLegs
    .map((l) => `${l.destinationName}: ${l.appliedModeLabel} via ${l.serviceName} (${l.duration})`)
    .join(' · ');

  const staySummary = estimate.recommendedHotels
    .map((h) => `${h.hotelName} (${h.neighborhood}, ${formatMoney(h.nightlyRateInr)}/nt)`)
    .join(' · ');

  // Build day-by-day plan across stops
  const days: GeneratedItinerary['days'] = [];
  let currentDay = 1;
  stops.forEach((stop) => {
    const dest = DESTINATIONS.find((d) => d.id === stop.destinationId)!;
    const dailyGroupCost = Math.round(
      ((dest.budgets[stayTier].total * groupCount) +
        (estimate.intercityTransitInr / tripDays)) *
        0.95
    );

    for (let i = 0; i < stop.days; i++) {
      const template = dest.dayByDay[i % dest.dayByDay.length];
      const isArrival = currentDay === 1;
      const isDeparture = currentDay === tripDays;

      days.push({
        dayNumber: currentDay,
        headline: `${dest.name} — ${template.title}`,
        morning: isArrival
          ? `Arrive in ${dest.name} from ${params.originCity || originHub}, check into ${
              dest.hotelOptions.find((h) => h.tier === stayTier)?.name ?? 'your stay'
            }, and begin with: ${template.morning}`
          : template.morning,
        afternoon: template.afternoon,
        evening: isDeparture
          ? `${template.evening} Collect bags and board evening ${
              transportMode === 'flight_economy' ? 'return flight' : 'return train'
            } to ${params.originCity || originHub}.`
          : template.evening,
        estimatedGroupSpendInr: dailyGroupCost,
      });
      currentDay++;
    }
  });

  const mustTryDishes = activeDests
    .flatMap((d) => d.localDishes.slice(0, 2).map((dish) => `${dish.name} (~${formatMoney(dish.typicalPriceInr)}) — ${d.name}`))
    .slice(0, 5);

  const packingAndSavingTips = [
    ...activeDests.flatMap((d) => d.moneySavingTips.slice(0, 2)),
    activeDests[0].permitAndEntryNotes,
  ].slice(0, 5);

  return {
    tripTitle: `${tripDays}-Day ${activeDests.map((d) => d.name).join(' & ')} (${
      stayTier.charAt(0).toUpperCase() + stayTier.slice(1)
    })`,
    seasonSuitability: `${seasonNote} ${MONTHLY_FESTIVALS[monthIdx]?.events ? `Festivals: ${MONTHLY_FESTIVALS[monthIdx].events}.` : ''}`,
    recommendedTransit: transitSummary,
    recommendedStayNote: staySummary,
    totalEstimatedInr: estimate.grandTotalInr,
    costPerPersonInr: estimate.perPersonInr,
    budgetBreakdown: {
      intercityTransitInr: estimate.intercityTransitInr,
      accommodationInr: estimate.stayTotalInr,
      foodAndDiningInr: estimate.foodTotalInr,
      localTransportAndGuidesInr: estimate.localTransportInr,
      ticketsAndExperiencesInr: estimate.activitiesTotalInr,
    },
    days,
    mustTryDishes,
    packingAndSavingTips,
  };
}
