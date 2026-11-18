export type Region =
  | 'Northwest India'
  | 'North & Himalayas'
  | 'Rajasthan & West'
  | 'South India'
  | 'East & Northeast';

export type TravelVibe =
  | 'Heritage & Royal'
  | 'Mountains & Passes'
  | 'Backwaters & Coast'
  | 'Spiritual & Cultural';

export type BudgetTier = 'backpacker' | 'comfort' | 'luxury';

export type TransportMode =
  | 'train_sleeper'
  | 'train_3ac'
  | 'train_2ac'
  | 'flight_economy'
  | 'bus_road';

export type HubCity = 'Delhi' | 'Mumbai' | 'Bengaluru' | 'Kolkata';

export type MonthCondition = 'Peak' | 'Pleasant' | 'Caution';

export interface DailyBudgetBreakdown {
  stay: number;
  food: number;
  localTransport: number;
  activities: number;
  total: number;
}

export interface GalleryPhoto {
  url: string;
  caption: string;
}

export interface HotelOption {
  id: string;
  name: string;
  tier: BudgetTier;
  typeLabel: string;
  neighborhood: string;
  pricePerNightInr: number;
  rating: string;
  amenities: string[];
  bookingNote: string;
  image: string;
}

export interface HubTransportOptions {
  train: {
    available: boolean;
    trainName: string;
    duration: string;
    sleeperInr: number;
    ac3Inr: number;
    ac2Inr: number;
    notes: string;
  };
  flight: {
    available: boolean;
    route: string;
    duration: string;
    economyAvgInr: number;
    lastMileTransferInr: number;
    notes: string;
  };
  road: {
    available: boolean;
    service: string;
    duration: string;
    busFareInr: number;
    notes: string;
  };
}

export interface LocalDish {
  name: string;
  description: string;
  typicalPriceInr: number;
}

export interface DayPlan {
  day: number;
  title: string;
  morning: string;
  afternoon: string;
  evening: string;
  estimatedSpendInr: number;
}

export interface Destination {
  id: string;
  name: string;
  state: string;
  region: Region;
  vibe: TravelVibe;
  tagline: string;
  summary: string;
  image: string;
  imageCaption: string;
  gallery: GalleryPhoto[];
  idealDays: number;
  bestMonthsLabel: string;
  avgTempPeak: string;
  nearestAirport: string;
  nearestRailhead: string;
  intercityFromHubsInr: Record<HubCity, number>;
  transportByHub: Record<HubCity, HubTransportOptions>;
  hotelOptions: HotelOption[];
  budgets: Record<BudgetTier, DailyBudgetBreakdown>;
  monthConditions: MonthCondition[]; // Jan (0) -> Dec (11)
  highlights: string[];
  localDishes: LocalDish[];
  dayByDay: DayPlan[];
  moneySavingTips: string[];
  permitAndEntryNotes: string;
}

export const MONTHS_SHORT = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
] as const;

export const TRANSPORT_MODE_LABELS: Record<TransportMode, { label: string; short: string }> = {
  train_sleeper: { label: 'Train — Sleeper (SL)', short: 'Sleeper Train' },
  train_3ac: { label: 'Train — 3AC / Chair Car', short: '3AC Train' },
  train_2ac: { label: 'Train — 2AC', short: '2AC Train' },
  flight_economy: { label: 'Airplane — Economy', short: 'Flight' },
  bus_road: { label: 'Volvo / Overnight Bus', short: 'Bus / Road' },
};

export function formatMoney(amountInr: number): string {
  return `₹${Math.round(amountInr).toLocaleString('en-IN')}`;
}

export const MONTHLY_FESTIVALS: Record<number, { seasonNote: string; events: string }> = {
  0: {
    seasonNote: 'Crisp winter skies across plains, desert & islands; high Himalayan passes snowbound.',
    events: 'Jaipur Literature Festival · Rann Utsav · Pongal',
  },
  1: {
    seasonNote: 'Prime dry weather across Rajasthan, Kutch, Kerala, Goa, Andaman, and Varanasi.',
    events: 'Desert Festival (Jaisalmer) · Taj Mahotsav · Rann Full Moon',
  },
  2: {
    seasonNote: 'Warming days; golden light in the hills and pleasant mornings nationwide.',
    events: 'Holi in North India · International Yoga Festival (Rishikesh)',
  },
  3: {
    seasonNote: 'Plains turn hot; ideal time to pivot toward Darjeeling, Rishikesh, and Meghalaya.',
    events: 'Baisakhi · Vishu in Kerala · Spring Tea Harvest',
  },
  4: {
    seasonNote: 'Peak summer in lowlands; Ladakh highways open late May; mountain valleys shine.',
    events: 'Buddha Purnima · Summer escapes to Himalayas & Northeast',
  },
  5: {
    seasonNote: 'Southwest monsoon reaches Kerala, Andaman & Meghalaya; Ladakh enters peak clarity.',
    events: 'Hemis Festival (Ladakh) · Monsoon Ayurveda retreats',
  },
  6: {
    seasonNote: 'Lush green waterfalls in Meghalaya & Kerala; Ladakh dry and vibrant.',
    events: 'Monsoon backwater retreats · Ladakh Polo & monastery fairs',
  },
  7: {
    seasonNote: 'Mid-monsoon lushness across Konkan & Western Ghats; Ladakh stays clear.',
    events: 'Nehru Trophy Boat Race (Alleppey) · Independence Day',
  },
  8: {
    seasonNote: 'Monsoon retreats late September; crisp post-rain visibility returns.',
    events: 'Onam Harvest Festival (Kerala) · Post-monsoon Meghalaya',
  },
  9: {
    seasonNote: 'Nationwide sweet spot: clear skies, emerald hills, comfortable warmth.',
    events: 'Durga Puja · Dussehra · Rishikesh rafting season opens',
  },
  10: {
    seasonNote: 'Peak cultural & heritage travel month across almost every region.',
    events: 'Dev Deepawali (Varanasi) · Rann Utsav begins · Shillong Cherry Blossom',
  },
  11: {
    seasonNote: 'Festive coastal season in Goa, Andaman & Kerala; crisp touring in Rajasthan & Kutch.',
    events: 'Rann Utsav Peak · Kochi-Muziris Art season · Christmas in Goa',
  },
};

const IMG_RAIL = '/src/assets/images/gallery_indian_railways_1795006092349.jpg';
const IMG_HAVELI = '/src/assets/images/gallery_heritage_haveli_1795006093054.jpg';
const IMG_KERALA_STAY = '/src/assets/images/gallery_kerala_homestay_1795006093618.jpg';

export const DESTINATIONS: Destination[] = [
  {
    id: 'udaipur',
    name: 'Udaipur',
    state: 'Rajasthan',
    region: 'Rajasthan & West',
    vibe: 'Heritage & Royal',
    tagline: 'Marble palaces mirrored on calm Aravalli lakes',
    summary:
      'Set around Lake Pichola and Fateh Sagar, Udaipur blends centuries-old Mewar architecture, quiet old-city havelis, and sunset ghats without the frantic pace of larger capitals.',
    image: '/src/assets/images/hero_udaipur_palace_1795005098318.jpg',
    imageCaption: 'City Palace and Lake Pichola at golden hour, Udaipur',
    gallery: [
      { url: '/src/assets/images/hero_udaipur_palace_1795005098318.jpg', caption: 'City Palace & Lake Pichola wooden boat crossing' },
      { url: IMG_HAVELI, caption: 'Restored sandstone haveli courtyard in Old Udaipur' },
      { url: IMG_RAIL, caption: 'Overnight Mewar rail links through Aravalli ridges' },
    ],
    idealDays: 3,
    bestMonthsLabel: 'Oct – Mar',
    avgTempPeak: '14°C – 27°C',
    nearestAirport: 'Maharana Pratap Airport (UDR · 22 km)',
    nearestRailhead: 'Udaipur City Junction (UDZ)',
    intercityFromHubsInr: { Delhi: 3400, Mumbai: 3800, Bengaluru: 6200, Kolkata: 6800 },
    transportByHub: {
      Delhi: {
        train: { available: true, trainName: 'Mewar SF Express / Chetak Express', duration: '12h 15m', sleeperInr: 410, ac3Inr: 1080, ac2Inr: 1550, notes: 'Overnight from Hazrat Nizamuddin; saves 1 hotel night.' },
        flight: { available: true, route: 'DEL → UDR nonstop', duration: '1h 20m', economyAvgInr: 4400, lastMileTransferInr: 650, notes: '5–7 daily nonstop flights; Dabok airport is 35 min from Pichola.' },
        road: { available: true, service: 'RSRTC / Sleeper Volvo via NH48', duration: '11h 30m', busFareInr: 1150, notes: 'Smooth 6-lane highway; overnight AC sleepers leave Dhaula Kuan.' },
      },
      Mumbai: {
        train: { available: true, trainName: 'Bandra–Udaipur SF Express', duration: '16h 10m', sleeperInr: 490, ac3Inr: 1290, ac2Inr: 1860, notes: 'Runs 3x weekly via Vadodara and Chittorgarh.' },
        flight: { available: true, route: 'BOM → UDR nonstop', duration: '1h 25m', economyAvgInr: 4600, lastMileTransferInr: 650, notes: 'Multiple morning and evening IndiGo / Air India flights.' },
        road: { available: true, service: 'Overnight AC Sleeper via Ahmedabad', duration: '14h 30m', busFareInr: 1450, notes: 'Direct private sleepers depart Borivali & Sion nightly.' },
      },
      Bengaluru: {
        train: { available: true, trainName: 'Mysuru–Udaipur Palace Queen Humsafar', duration: '36h 00m', sleeperInr: 820, ac3Inr: 2150, ac2Inr: 3050, notes: 'Weekly direct train; otherwise change at Vadodara or Jaipur.' },
        flight: { available: true, route: 'BLR → UDR nonstop', duration: '2h 25m', economyAvgInr: 6100, lastMileTransferInr: 650, notes: 'Direct flights save over 30 hours compared to rail.' },
        road: { available: false, service: 'No direct bus', duration: 'N/A', busFareInr: 0, notes: 'Fly to UDR or take a flight to Ahmedabad + 4.5h bus.' },
      },
      Kolkata: {
        train: { available: true, trainName: 'Ananya Express / Shalimar–Udaipur', duration: '34h 00m', sleeperInr: 790, ac3Inr: 2050, ac2Inr: 2950, notes: 'Weekly direct trains; book 45 days ahead.' },
        flight: { available: true, route: 'CCU → UDR (1-stop via DEL/BOM)', duration: '4h 30m', economyAvgInr: 6900, lastMileTransferInr: 650, notes: 'Morning connections via Delhi are most reliable.' },
        road: { available: false, service: 'No direct bus', duration: 'N/A', busFareInr: 0, notes: 'Flight recommended from eastern India.' },
      },
    },
    hotelOptions: [
      {
        id: 'ud-hostel',
        name: 'Lal Ghat Lakeview Hostel & Rooftop',
        tier: 'backpacker',
        typeLabel: 'Social Hostel / Guesthouse',
        neighborhood: 'Lal Ghat (Old City)',
        pricePerNightInr: 750,
        rating: '4.6/5',
        amenities: ['Lake-view rooftop', 'Walking distance to City Palace', 'Wi-Fi & lockers'],
        bookingNote: 'Private twin rooms cost ₹1,300–₹1,600; dorms ₹550–₹800.',
        image: '/src/assets/images/hero_udaipur_palace_1795005098318.jpg',
      },
      {
        id: 'ud-haveli',
        name: 'Jagat Niwas Courtyard Haveli',
        tier: 'comfort',
        typeLabel: 'Restored Heritage Haveli',
        neighborhood: 'Gangaur Ghat',
        pricePerNightInr: 3400,
        rating: '4.8/5',
        amenities: ['17th-century jharokha balconies', 'Lakeside breakfast', 'Airport pickup'],
        bookingNote: 'Book lake-facing rooms 3 weeks early for Nov–Jan.',
        image: IMG_HAVELI,
      },
      {
        id: 'ud-palace',
        name: 'Fateh Prakash & Taj Aravalli Suite',
        tier: 'luxury',
        typeLabel: 'Royal Palace Heritage',
        neighborhood: 'Lake Pichola Promenade',
        pricePerNightInr: 18500,
        rating: '4.9/5',
        amenities: ['Private jetty boat transfer', 'Courtyard pool', 'Royal Mewar dining'],
        bookingNote: 'Shoulder months (Apr & Sep) drop tariffs by 30%.',
        image: IMG_HAVELI,
      },
    ],
    budgets: {
      backpacker: { stay: 700, food: 550, localTransport: 250, activities: 300, total: 1800 },
      comfort: { stay: 2600, food: 1100, localTransport: 500, activities: 600, total: 4800 },
      luxury: { stay: 12500, food: 3200, localTransport: 1400, activities: 1400, total: 18500 },
    },
    monthConditions: ['Peak', 'Peak', 'Pleasant', 'Caution', 'Caution', 'Caution', 'Pleasant', 'Pleasant', 'Pleasant', 'Peak', 'Peak', 'Peak'],
    highlights: [
      'City Palace Museum & Crystal Gallery overlooking Lake Pichola',
      'Sunrise walk across Gangaur Ghat and Ambrai Ghat',
      'Monsoon Palace (Sajjangarh) ridge panorama at dusk',
      'Day excursion to Kumbhalgarh Fort and Ranakpur Jain Temples',
    ],
    localDishes: [
      { name: 'Dal Baati Churma', description: 'Baked wheat spheres dipped in ghee with spiced lentils and sweet churma', typicalPriceInr: 220 },
      { name: 'Pyaaz Kachori & Masala Chai', description: 'Flaky onion-filled pastry served hot at Jagdish Chowk stalls', typicalPriceInr: 65 },
      { name: 'Gatte ki Sabzi Thali', description: 'Gram-flour dumplings simmered in tangy yogurt gravy with bajra roti', typicalPriceInr: 260 },
    ],
    dayByDay: [
      {
        day: 1,
        title: 'Old City Havelis & Lake Pichola',
        morning: 'Explore the City Palace courtyards right at opening (9:30 AM) before tour groups arrive, then walk to Jagdish Temple.',
        afternoon: 'Lunch at a rooftop cafe near Lal Ghat, followed by Bagore Ki Haveli textile and miniature painting galleries.',
        evening: 'Shared sunset boat ride across Lake Pichola past Jag Mandir and Bagore Ki Haveli folk dance at 7:00 PM.',
        estimatedSpendInr: 2400,
      },
      {
        day: 2,
        title: 'Artisans, Fateh Sagar & Sajjangarh Ridge',
        morning: 'Cycle or auto-rickshaw around Fateh Sagar Lake and visit Shilpgram rural arts village.',
        afternoon: 'Explore Saheliyon-ki-Bari gardens and browse local miniature art studios in Hathi Pol.',
        evening: 'Ride up to Sajjangarh (Monsoon Palace) for panoramic Aravalli sunset views, followed by dinner at Ambrai Ghat.',
        estimatedSpendInr: 2100,
      },
      {
        day: 3,
        title: 'Kumbhalgarh & Ranakpur Day Circuit',
        morning: 'Early departure through Aravalli gorges to Ranakpur’s 1,444 carved marble pillars.',
        afternoon: 'Walk the 36 km fortification walls of Kumbhalgarh Fort overlooking Mewar valleys.',
        evening: 'Return to Udaipur old town for a relaxed lakeside thali supper.',
        estimatedSpendInr: 3200,
      },
    ],
    moneySavingTips: [
      'Stay in Lal Ghat or Hanuman Ghat guesthouses—walking distance to 80% of sights eliminates daily cab fares.',
      'Government-operated boat tickets from Rameshwar Ghat cost roughly half of private heritage hotel transfers.',
      'Book Mewar Express or Chetak Express 3AC train from Delhi overnight to save one night of hotel cost.',
    ],
    permitAndEntryNotes: 'No special permit required. City Palace Museum & boat tickets range from ₹400–₹800 for domestic visitors.',
  },
  {
    id: 'jaipur',
    name: 'Jaipur',
    state: 'Rajasthan',
    region: 'Rajasthan & West',
    vibe: 'Heritage & Royal',
    tagline: 'Pink-terracotta bazaars, hill forts & astronomical observatories',
    summary:
      'India’s planned 18th-century capital pairs monumental hilltop forts like Amer and Nahargarh with bustling block-print workshops, stepwells, and lively street-food lanes.',
    image: '/src/assets/images/dest_jaipur_amer_1795005091538.jpg',
    imageCaption: 'Amer Fort sandstone ramparts reflected in Maota Lake, Jaipur',
    gallery: [
      { url: '/src/assets/images/dest_jaipur_amer_1795005091538.jpg', caption: 'Amer Fort reflecting in Maota Lake at sunrise' },
      { url: IMG_HAVELI, caption: 'Carved sandstone boutique haveli courtyard in Bani Park' },
      { url: IMG_RAIL, caption: 'Vande Bharat & Shatabdi rail approaches from Delhi' },
    ],
    idealDays: 3,
    bestMonthsLabel: 'Oct – Mar',
    avgTempPeak: '12°C – 26°C',
    nearestAirport: 'Jaipur International Airport (JAI · 12 km)',
    nearestRailhead: 'Jaipur Junction (JP)',
    intercityFromHubsInr: { Delhi: 1400, Mumbai: 3900, Bengaluru: 6100, Kolkata: 6400 },
    transportByHub: {
      Delhi: {
        train: { available: true, trainName: 'Ajmer Shatabdi / Delhi–Jaipur Vande Bharat', duration: '4h 20m', sleeperInr: 230, ac3Inr: 590, ac2Inr: 920, notes: 'Vande Bharat Chair Car (~₹950) is fastest and cleanest.' },
        flight: { available: true, route: 'DEL → JAI nonstop', duration: '1h 00m', economyAvgInr: 3100, lastMileTransferInr: 350, notes: 'Train or highway expressway beats flying door-to-door.' },
        road: { available: true, service: 'RSRTC Goldline Volvo / NE4 Expressway', duration: '4h 45m', busFareInr: 750, notes: 'Buses depart Bikaner House & IFFCO Chowk every 30 min.' },
      },
      Mumbai: {
        train: { available: true, trainName: 'Jaipur SF Express / Aravalli Express', duration: '16h 40m', sleeperInr: 540, ac3Inr: 1420, ac2Inr: 2050, notes: 'Overnight sleeper trains depart Bandra Terminus & Mumbai Central.' },
        flight: { available: true, route: 'BOM → JAI nonstop', duration: '1h 50m', economyAvgInr: 4500, lastMileTransferInr: 350, notes: '10+ daily flights.' },
        road: { available: false, service: 'Too long by bus (20h+)', duration: '21h', busFareInr: 1800, notes: 'Prefer overnight 3AC train or short flight.' },
      },
      Bengaluru: {
        train: { available: true, trainName: 'Yesvantpur–Jaipur Garib Rath / SF', duration: '38h 00m', sleeperInr: 860, ac3Inr: 2200, ac2Inr: 3200, notes: 'Long cross-country rail; flight saves 35 hours.' },
        flight: { available: true, route: 'BLR → JAI nonstop', duration: '2h 35m', economyAvgInr: 5900, lastMileTransferInr: 350, notes: 'Frequent direct IndiGo & Akasa Air services.' },
        road: { available: false, service: 'No direct bus', duration: 'N/A', busFareInr: 0, notes: 'Fly nonstop to JAI.' },
      },
      Kolkata: {
        train: { available: true, trainName: 'Sealdah–Ajmer SF / Howrah–Jodhpur', duration: '24h 00m', sleeperInr: 650, ac3Inr: 1680, ac2Inr: 2420, notes: 'Daily trains from Howrah & Sealdah.' },
        flight: { available: true, route: 'CCU → JAI nonstop', duration: '2h 25m', economyAvgInr: 5600, lastMileTransferInr: 350, notes: 'Direct afternoon and evening flights.' },
        road: { available: false, service: 'No direct bus', duration: 'N/A', busFareInr: 0, notes: 'Use Sealdah overnight train or direct flight.' },
      },
    },
    hotelOptions: [
      {
        id: 'jp-hostel',
        name: 'Moustache & Zostel MI Road',
        tier: 'backpacker',
        typeLabel: 'Design Backpacker Hostel',
        neighborhood: 'MI Road / Hathroi',
        pricePerNightInr: 650,
        rating: '4.6/5',
        amenities: ['Steps from Sindhi Camp Metro', 'Terrace common room', 'Guided heritage walk'],
        bookingNote: 'Private rooms from ₹1,450/night; dorms ₹500–₹750.',
        image: '/src/assets/images/dest_jaipur_amer_1795005091538.jpg',
      },
      {
        id: 'jp-boutique',
        name: 'Dera Rawatsar Heritage Stay',
        tier: 'comfort',
        typeLabel: 'Family-Run Heritage Mansion',
        neighborhood: 'Bani Park',
        pricePerNightInr: 2900,
        rating: '4.7/5',
        amenities: ['Quiet garden courtyard', 'Home-style Rajasthani meals', 'Pool'],
        bookingNote: 'Great mid-budget sanctuary 10 min from Jaipur Junction.',
        image: IMG_HAVELI,
      },
      {
        id: 'jp-luxury',
        name: 'Samode Haveli & Rambagh Wing',
        tier: 'luxury',
        typeLabel: 'Royal Heritage Palace Hotel',
        neighborhood: 'Gangapole / Bhawani Singh Rd',
        pricePerNightInr: 15500,
        rating: '4.9/5',
        amenities: ['Painted dining halls', 'Heated pool', 'Butler concierge'],
        bookingNote: 'Even if staying elsewhere, reserve afternoon high tea here.',
        image: IMG_HAVELI,
      },
    ],
    budgets: {
      backpacker: { stay: 650, food: 500, localTransport: 250, activities: 250, total: 1650 },
      comfort: { stay: 2300, food: 950, localTransport: 450, activities: 500, total: 4200 },
      luxury: { stay: 10500, food: 2600, localTransport: 1100, activities: 800, total: 15000 },
    },
    monthConditions: ['Peak', 'Peak', 'Pleasant', 'Caution', 'Caution', 'Caution', 'Pleasant', 'Pleasant', 'Pleasant', 'Peak', 'Peak', 'Peak'],
    highlights: [
      'Amer Fort ramparts & Panna Meena Ka Kund stepwell',
      'Hawa Mahal facade at sunrise & Jantar Mantar UNESCO observatory',
      'Nahargarh Fort twilight ridge overlooking the Pink City',
      'Hand-block textile printing workshops in Sanganer or Bagru',
    ],
    localDishes: [
      { name: 'Lassiwala Kulhad Lassi', description: 'Thick, chilled clay-cup sweet yogurt topped with malai on MI Road', typicalPriceInr: 80 },
      { name: 'Mirchi Bada & Pyaaz Kachori', description: 'Crisp spiced chili fritter and onion pastry from Rawat Mishthan Bhandar', typicalPriceInr: 110 },
      { name: 'Rajasthani Vegetarian Thali', description: 'Ker sangri, bajra roti, dal, and churma served in brass platters', typicalPriceInr: 320 },
    ],
    dayByDay: [
      {
        day: 1,
        title: 'The Walled Pink City',
        morning: 'Photograph Hawa Mahal from Wind View Cafe at 7:30 AM, then tour City Palace and Jantar Mantar.',
        afternoon: 'Explore Johari Bazaar gem lanes and Bapu Bazaar textile stalls using the Jaipur Metro.',
        evening: 'Masala chai at Samrat and dinner in C-Scheme or Bani Park.',
        estimatedSpendInr: 2200,
      },
      {
        day: 2,
        title: 'Amer, Stepwells & Nahargarh Sunset',
        morning: 'Climb Amer Fort at 8:00 AM and walk down to Panna Meena Ka Kund geometric stepwell.',
        afternoon: 'Stop at Jal Mahal promenade and tour Jaigarh Fort’s historic foundry.',
        evening: 'Watch dusk settle over Jaipur’s grid from Nahargarh Fort ramparts.',
        estimatedSpendInr: 2500,
      },
      {
        day: 3,
        title: 'Craft Villages & Albert Hall',
        morning: 'Visit Anokhi Museum of Hand Printing or a Bagru indigo-dyeing studio.',
        afternoon: 'Tour Albert Hall Museum and Patrika Gate’s painted arches.',
        evening: 'Catch a classic Bollywood screening at Raj Mandir Cinema.',
        estimatedSpendInr: 1900,
      },
    ],
    moneySavingTips: [
      'Buy the Rajasthan Tourism composite monument ticket—covers Amer, Jantar Mantar, Nahargarh, Albert Hall, and Hawa Mahal at 40% savings.',
      'Use Jaipur Metro + Uber Auto between Badi Chaupar and C-Scheme instead of full-day hired taxis.',
      'Shatabdi or Vande Bharat trains from New Delhi take 4.5 hours for ~₹850–₹1,200.',
    ],
    permitAndEntryNotes: 'Composite heritage ticket valid for 2 days. Student discounts available with valid ID.',
  },
  {
    id: 'ladakh',
    name: 'Leh–Ladakh',
    state: 'Ladakh (UT)',
    region: 'North & Himalayas',
    vibe: 'Mountains & Passes',
    tagline: 'High-altitude turquoise lakes, monasteries & 5,000m passes',
    summary:
      'A stark trans-Himalayan desert crowned by whitewashed Buddhist gompas, braided Indus valleys, and glacial lakes like Pangong Tso and Tso Moriri.',
    image: '/src/assets/images/dest_ladakh_pangong_1795005098038.jpg',
    imageCaption: 'Pangong Tso lake and Himalayan ridges, Ladakh',
    gallery: [
      { url: '/src/assets/images/dest_ladakh_pangong_1795005098038.jpg', caption: 'Pangong Tso turquoise waters at 4,225m elevation' },
      { url: IMG_RAIL, caption: 'Overland approach via Chandigarh/Jammu railheads & Manali highway' },
      { url: '/src/assets/images/dest_darjeeling_hills_1795005092849.jpg', caption: 'Crisp high-Himalayan sunrise visibility' },
    ],
    idealDays: 6,
    bestMonthsLabel: 'May – Sep',
    avgTempPeak: '8°C – 22°C',
    nearestAirport: 'Kushok Bakula Rimpochee Airport, Leh (IXL)',
    nearestRailhead: 'Jammu Tawi / Chandigarh (followed by Manali or Srinagar highway)',
    intercityFromHubsInr: { Delhi: 7800, Mumbai: 11200, Bengaluru: 12800, Kolkata: 12500 },
    transportByHub: {
      Delhi: {
        train: { available: false, trainName: 'No rail in Leh (Train to Chandigarh/Jammu + Bus)', duration: '28h total', sleeperInr: 1850, ac3Inr: 2650, ac2Inr: 3300, notes: 'Combine overnight train to Chandigarh/Manali with HRTC bus (Jun–Sep).' },
        flight: { available: true, route: 'DEL → IXL nonstop', duration: '1h 25m', economyAvgInr: 7600, lastMileTransferInr: 500, notes: 'Book early morning windows for dramatic Himalayan aerial views.' },
        road: { available: true, service: 'HRTC Deluxe Bus / Shared Tempo (Delhi–Manali–Leh)', duration: '2 days', busFareInr: 2800, notes: 'Open late May to mid-Oct; gradual ascent aids acclimatization.' },
      },
      Mumbai: {
        train: { available: false, trainName: 'Train to Jammu/Delhi + Highway', duration: '48h+', sleeperInr: 2400, ac3Inr: 3600, ac2Inr: 4500, notes: 'Only practical if doing a slow 2-week overland expedition.' },
        flight: { available: true, route: 'BOM → IXL (1-stop via DEL)', duration: '4h 50m', economyAvgInr: 10900, lastMileTransferInr: 500, notes: 'Single-ticket morning connections via Delhi avoid weather misses.' },
        road: { available: false, service: 'No direct road service', duration: 'N/A', busFareInr: 0, notes: 'Fly into Leh or Delhi first.' },
      },
      Bengaluru: {
        train: { available: false, trainName: 'No rail to Leh', duration: 'N/A', sleeperInr: 0, ac3Inr: 0, ac2Inr: 0, notes: 'Fly via Delhi.' },
        flight: { available: true, route: 'BLR → IXL (1-stop via DEL)', duration: '5h 30m', economyAvgInr: 12400, lastMileTransferInr: 500, notes: 'Book 6–8 weeks ahead for June–August peak.' },
        road: { available: false, service: 'No direct bus', duration: 'N/A', busFareInr: 0, notes: 'Air travel strongly recommended.' },
      },
      Kolkata: {
        train: { available: false, trainName: 'Train to Jammu + Srinagar–Leh Hwy', duration: '52h+', sleeperInr: 2600, ac3Inr: 3900, ac2Inr: 4900, notes: 'Srinagar route opens earlier (April) than Manali.' },
        flight: { available: true, route: 'CCU → IXL (1-stop via DEL)', duration: '5h 15m', economyAvgInr: 11800, lastMileTransferInr: 500, notes: 'Morning flights land in Leh before afternoon crosswinds.' },
        road: { available: false, service: 'No direct bus', duration: 'N/A', busFareInr: 0, notes: 'Fly via Delhi.' },
      },
    },
    hotelOptions: [
      {
        id: 'ld-homestay',
        name: 'Changspa Eco Ladakhi Homestay',
        tier: 'backpacker',
        typeLabel: 'Family Homestay (with meals)',
        neighborhood: 'Changspa / Upper Karzoo',
        pricePerNightInr: 1100,
        rating: '4.7/5',
        amenities: ['Solar hot water', 'Home-cooked Ladakhi dinner', 'Quiet orchard garden'],
        bookingNote: 'Hostels in Fort Road start around ₹700/bed in summer.',
        image: '/src/assets/images/dest_ladakh_pangong_1795005098038.jpg',
      },
      {
        id: 'ld-boutique',
        name: 'Gomang Boutique Hotel',
        tier: 'comfort',
        typeLabel: 'Warm Timber Mountain Hotel',
        neighborhood: 'Changspa Lane',
        pricePerNightInr: 3900,
        rating: '4.8/5',
        amenities: ['Heated rooms', 'Stupa view terrace', 'Oxygen concentrator on-site'],
        bookingNote: '10-minute walk to Leh Main Market.',
        image: '/src/assets/images/dest_ladakh_pangong_1795005098038.jpg',
      },
      {
        id: 'ld-luxury',
        name: 'The Grand Dragon & Stok Palace Heritage',
        tier: 'luxury',
        typeLabel: 'Luxury Mountain Sanctuary',
        neighborhood: 'Old Road / Stok Village',
        pricePerNightInr: 12500,
        rating: '4.9/5',
        amenities: ['Central radiant heating', 'Private monastery curator', 'Royal Ladakhi suite'],
        bookingNote: 'Essential central heating if visiting in April or October.',
        image: IMG_HAVELI,
      },
    ],
    budgets: {
      backpacker: { stay: 900, food: 650, localTransport: 600, activities: 250, total: 2400 },
      comfort: { stay: 2800, food: 1200, localTransport: 1300, activities: 500, total: 5800 },
      luxury: { stay: 8800, food: 2400, localTransport: 2500, activities: 800, total: 14500 },
    },
    monthConditions: ['Caution', 'Caution', 'Caution', 'Pleasant', 'Peak', 'Peak', 'Peak', 'Peak', 'Peak', 'Pleasant', 'Caution', 'Caution'],
    highlights: [
      'Thiksey, Hemis & Diskit centuries-old Tibetan Buddhist monasteries',
      'Khardung La pass crossing into Nubra Valley sand dunes',
      'Shyok river route to Pangong Tso alpine lake',
      'Stargazing at Hanle Dark Sky Reserve',
    ],
    localDishes: [
      { name: 'Thukpa & Tingmo', description: 'Steaming hand-pulled noodle soup paired with fluffy steamed spiral bread', typicalPriceInr: 180 },
      { name: 'Skyu & Apricot Jam', description: 'Traditional Ladakhi root-vegetable pasta stew and sun-dried apricots', typicalPriceInr: 220 },
      { name: 'Gur-Gur Butter Tea', description: 'Salted yak-butter tea brewed to combat dry mountain chill', typicalPriceInr: 60 },
    ],
    dayByDay: [
      {
        day: 1,
        title: 'Leh Acclimatization (3,500m)',
        morning: 'Complete rest on arrival to adjust to altitude; hydrate well and skip strenuous climbing.',
        afternoon: 'Gentle stroll through Leh Main Market and Shanti Stupa at golden hour.',
        evening: 'Warm thukpa dinner in Changspa Lane.',
        estimatedSpendInr: 2100,
      },
      {
        day: 2,
        title: 'Indus Valley Monasteries',
        morning: 'Visit Thiksey Monastery for morning prayers, then Shey Palace.',
        afternoon: 'Continue to Hemis Monastery and Hall of Fame museum.',
        evening: 'Pick up Inner Line Permits and stock snacks for Nubra.',
        estimatedSpendInr: 3400,
      },
      {
        day: 3,
        title: 'Leh to Nubra Valley via Khardung La',
        morning: 'Cross Khardung La (5,359m) into the Shyok & Nubra river confluence.',
        afternoon: 'Visit Diskit Monastery’s giant Maitreya Buddha and Hunder dunes.',
        evening: 'Stargaze from a homestay in Hunder or Turtuk.',
        estimatedSpendInr: 4200,
      },
      {
        day: 4,
        title: 'Shyok Route to Pangong Tso',
        morning: 'Drive along the dramatic Shyok riverbed toward Tangtse.',
        afternoon: 'Arrive at Pangong Tso (4,225m) as afternoon light shifts water from cobalt to emerald.',
        evening: 'Overnight in heated cottage or homestay at Spangmik/Merak.',
        estimatedSpendInr: 4600,
      },
    ],
    moneySavingTips: [
      'Join shared cab groups via Leh taxi union noticeboards or hostels—splits ₹16,000 Nubra-Pangong loops 4 to 6 ways.',
      'Book Leh flights 8–10 weeks before May–August; last-minute Delhi–Leh fares double.',
      'Stay in family-run homestays in Hunder and Merak, which include home-cooked dinner and breakfast.',
    ],
    permitAndEntryNotes: 'Inner Line / Environment Fee (~₹400–₹600) required for Nubra, Pangong, and Hanle; issued online or in Leh. Spend 48h acclimatizing first.',
  },
  {
    id: 'kerala',
    name: 'Alleppey & Kumarakom',
    state: 'Kerala',
    region: 'South India',
    vibe: 'Backwaters & Coast',
    tagline: 'Emerald canals, coconut lagoons & slow wooden houseboats',
    summary:
      'A serene network of brackish lagoons, paddy fields below sea level, and spice-scented coastal villages connected by solar ferries and hand-tied wooden kettuvallams.',
    image: '/src/assets/images/dest_kerala_backwaters_1795005089783.jpg',
    imageCaption: 'Handcrafted wooden kettuvallam houseboat in Alleppey backwaters',
    gallery: [
      { url: '/src/assets/images/dest_kerala_backwaters_1795005089783.jpg', caption: 'Golden hour kettuvallam cruise in Alleppey' },
      { url: IMG_KERALA_STAY, caption: 'Timber & terracotta-roofed heritage homestay veranda' },
      { url: IMG_RAIL, caption: 'Coastal Konkan & Kerala rail connections' },
    ],
    idealDays: 3,
    bestMonthsLabel: 'Sep – Mar',
    avgTempPeak: '23°C – 31°C',
    nearestAirport: 'Cochin International Airport (COK · 82 km)',
    nearestRailhead: 'Alappuzha (ALLP) / Kottayam (KTYM)',
    intercityFromHubsInr: { Delhi: 6900, Mumbai: 4600, Bengaluru: 2600, Kolkata: 6400 },
    transportByHub: {
      Delhi: {
        train: { available: true, trainName: 'Kerala SF Express / Rajdhani to Ernakulam', duration: '42h 00m', sleeperInr: 950, ac3Inr: 2480, ac2Inr: 3580, notes: 'Very scenic Konkan stretch if taking Mangala/Rajdhani.' },
        flight: { available: true, route: 'DEL → COK nonstop + 1.5h cab/train', duration: '4h 40m', economyAvgInr: 6800, lastMileTransferInr: 1400, notes: 'Frequent nonstop flights to Kochi (COK).' },
        road: { available: false, service: 'Too distant for direct bus', duration: 'N/A', busFareInr: 0, notes: 'Fly to Kochi.' },
      },
      Mumbai: {
        train: { available: true, trainName: 'Netravati Express / Konkan Kanya + Ernakulam', duration: '24h 30m', sleeperInr: 680, ac3Inr: 1750, ac2Inr: 2520, notes: 'Direct rail down the lush Konkan coast into Alappuzha!' },
        flight: { available: true, route: 'BOM → COK nonstop + transfer', duration: '3h 30m', economyAvgInr: 4500, lastMileTransferInr: 1400, notes: 'Affordable short hops from Mumbai.' },
        road: { available: false, service: 'Long coastal bus', duration: '23h', busFareInr: 2100, notes: 'Train via Konkan Railway is much more comfortable.' },
      },
      Bengaluru: {
        train: { available: true, trainName: 'KSR Bengaluru–Ernakulam Intercity / Island Exp', duration: '11h 15m', sleeperInr: 390, ac3Inr: 1020, ac2Inr: 1480, notes: 'Overnight sleeper trains arrive early morning near Vembanad.' },
        flight: { available: true, route: 'BLR → COK nonstop', duration: '1h 15m', economyAvgInr: 3200, lastMileTransferInr: 1400, notes: 'Quick 70-minute hop, though bus/train saves airport transfer.' },
        road: { available: true, service: 'KSRTC Airavat / Private Sleeper Bus', duration: '10h 30m', busFareInr: 1250, notes: 'Direct overnight Volvo buses drop right in Alappuzha town.' },
      },
      Kolkata: {
        train: { available: true, trainName: 'Shalimar–Thiruvananthapuram Express', duration: '38h 00m', sleeperInr: 860, ac3Inr: 2220, ac2Inr: 3200, notes: 'Direct coastal rail along the Bay of Bengal.' },
        flight: { available: true, route: 'CCU → COK nonstop', duration: '2h 55m', economyAvgInr: 6200, lastMileTransferInr: 1400, notes: 'Daily nonstop IndiGo flights.' },
        road: { available: false, service: 'No direct bus', duration: 'N/A', busFareInr: 0, notes: 'Fly to Kochi.' },
      },
    },
    hotelOptions: [
      {
        id: 'kl-homestay',
        name: 'Kainakary Canal Garden Homestay',
        tier: 'backpacker',
        typeLabel: 'Licensed Family Homestay',
        neighborhood: 'Kainakary Island',
        pricePerNightInr: 950,
        rating: '4.7/5',
        amenities: ['Canal-front breakfast', 'Canoe dock', 'Home-cooked appam'],
        bookingNote: 'Reachable via ₹15 public ferry from Alleppey Boat Jetty.',
        image: IMG_KERALA_STAY,
      },
      {
        id: 'kl-villa',
        name: 'Ayur Vedha Heritage Backwater Villa',
        tier: 'comfort',
        typeLabel: 'Restored Timber Bungalow',
        neighborhood: 'Kumarakom / Punnamada',
        pricePerNightInr: 3800,
        rating: '4.8/5',
        amenities: ['Wrap-around wooden veranda', 'Ayurvedic spa', 'Kayaks included'],
        bookingNote: 'Pair 2 nights in a villa with a 4-hour day shikara rather than sleeping on a noisy dock.',
        image: IMG_KERALA_STAY,
      },
      {
        id: 'kl-houseboat',
        name: 'Kumarakom Lake Resort & Private Kettuvallam',
        tier: 'luxury',
        typeLabel: 'Luxury Backwater Estate',
        neighborhood: 'Vembanad Lakefront',
        pricePerNightInr: 16500,
        rating: '4.9/5',
        amenities: ['Meandering pool villas', 'Private sunset rice-barge', '24h AC bedroom suite'],
        bookingNote: 'Monsoon (Jun–Aug) rates drop up to 40%.',
        image: '/src/assets/images/dest_kerala_backwaters_1795005089783.jpg',
      },
    ],
    budgets: {
      backpacker: { stay: 750, food: 550, localTransport: 300, activities: 300, total: 1900 },
      comfort: { stay: 3000, food: 1100, localTransport: 500, activities: 800, total: 5400 },
      luxury: { stay: 11000, food: 2600, localTransport: 1100, activities: 1300, total: 16000 },
    },
    monthConditions: ['Peak', 'Peak', 'Pleasant', 'Caution', 'Caution', 'Pleasant', 'Pleasant', 'Pleasant', 'Peak', 'Peak', 'Peak', 'Peak'],
    highlights: [
      'Sunrise shikara canoe cruise through narrow Kuttanad village canals',
      'Kerala State Water Transport public ferry (₹25–₹60) across Vembanad Lake',
      'Kumarakom Bird Sanctuary boardwalk at dawn',
      'Marari Beach quiet palm shoreline 11 km north of Alleppey',
    ],
    localDishes: [
      { name: 'Appam & Coconut Stew', description: 'Lacy fermented rice pancakes with fragrant cardamom-coconut vegetable or fish stew', typicalPriceInr: 180 },
      { name: 'Karimeen Pollichathu', description: 'Pearl-spot fish marinated in shallots and spices, roasted inside a banana leaf', typicalPriceInr: 380 },
      { name: 'Kerala Sadya Lunch', description: '20-item vegetarian banana-leaf feast with parippu, avial, and payasam', typicalPriceInr: 250 },
    ],
    dayByDay: [
      {
        day: 1,
        title: 'Kuttanad Canals & Vembanad Sunset',
        morning: 'Arrive in Alleppey and check into a canal-side homestay in Kainakary or Punnamada.',
        afternoon: 'Board a 3-hour silent canoe or shikara into narrow village waterways inaccessible to large boats.',
        evening: 'Walk Marari Beach at sunset and enjoy fresh coastal curry.',
        estimatedSpendInr: 2600,
      },
      {
        day: 2,
        title: 'Houseboat Cruise or Public Ferry Loop',
        morning: 'Board a day-cruise kettuvallam (or overnight houseboat) gliding past emerald paddy bunds.',
        afternoon: 'Watch toddy-tappers and village life from the shaded upper deck with banana-leaf lunch.',
        evening: 'Dine along Alappuzha Lighthouse pier.',
        estimatedSpendInr: 4200,
      },
      {
        day: 3,
        title: 'Kumarakom Sanctuary & Fort Kochi Extension',
        morning: 'Early walk through Kumarakom Bird Sanctuary mangrove trails.',
        afternoon: 'Visit traditional coir-weaving cooperatives and spice markets.',
        evening: 'Catch a coastal train or cab up to Fort Kochi’s Chinese fishing nets.',
        estimatedSpendInr: 2400,
      },
    ],
    moneySavingTips: [
      'Skip ₹12,000+ private houseboats if solo/budget—take the Kerala Govt Vega/SWTD ferry from Alleppey to Kottayam for ₹40 and hire a ₹600/hr sunrise canoe.',
      'Travel June–August for "Monsoon Ayurveda" packages at 35–45% off winter hotel tariffs.',
      'Overnight buses or trains from Bengaluru to Ernakulam/Alleppey cost under ₹900.',
    ],
    permitAndEntryNotes: 'No permits needed. Book certified DTPC houseboats with fixed tariff charts to avoid dockside markups.',
  },
  {
    id: 'hampi',
    name: 'Hampi',
    state: 'Karnataka',
    region: 'South India',
    vibe: 'Heritage & Royal',
    tagline: '14th-century granite ruins strewn across surreal boulder hills',
    summary:
      'Once the flourishing capital of the Vijayanagara Empire, Hampi is an open-air UNESCO landscape where monolithic stone chariots and banana plantations weave between giant ochre granite tors.',
    image: '/src/assets/images/dest_hampi_ruins_1795005090244.jpg',
    imageCaption: 'Vittala Temple Stone Chariot at sunrise, Hampi',
    gallery: [
      { url: '/src/assets/images/dest_hampi_ruins_1795005090244.jpg', caption: 'Vittala Temple Stone Chariot at dawn' },
      { url: IMG_RAIL, caption: 'Overnight Hampi Express arrival at Hosapete Junction' },
      { url: IMG_HAVELI, caption: 'Heritage stone courtyard suites in Kamalapura' },
    ],
    idealDays: 3,
    bestMonthsLabel: 'Oct – Feb',
    avgTempPeak: '17°C – 29°C',
    nearestAirport: 'Jindal Vijayanagar (VDY · 38 km) / Hubballi (HBX)',
    nearestRailhead: 'Hosapete Junction (HPT · 13 km)',
    intercityFromHubsInr: { Delhi: 6400, Mumbai: 2800, Bengaluru: 1400, Kolkata: 6900 },
    transportByHub: {
      Delhi: {
        train: { available: true, trainName: 'Sampark Kranti / Hazrat Nizamuddin–Hubballi', duration: '31h 00m', sleeperInr: 780, ac3Inr: 1980, ac2Inr: 2850, notes: 'Long route; fly to Bengaluru or Hubballi instead.' },
        flight: { available: true, route: 'DEL → HBX or BLR + overnight train', duration: '5h 30m', economyAvgInr: 6400, lastMileTransferInr: 1100, notes: 'Hubballi (HBX) is 3h drive west of Hampi.' },
        road: { available: false, service: 'No direct bus', duration: 'N/A', busFareInr: 0, notes: 'Fly to Hubballi or Bengaluru.' },
      },
      Mumbai: {
        train: { available: true, trainName: 'Garib Nawaz / CSMT–Hosapete via Hubballi', duration: '15h 30m', sleeperInr: 450, ac3Inr: 1190, ac2Inr: 1710, notes: 'Overnight buses from Dadar/Borivali are often faster.' },
        flight: { available: true, route: 'BOM → HBX or VDY nonstop', duration: '1h 15m', economyAvgInr: 4200, lastMileTransferInr: 900, notes: 'Alliance Air flies to Jindal Vijayanagar (VDY) 40 min from ruins.' },
        road: { available: true, service: 'VRL / SRS Overnight Sleeper Bus', duration: '13h 30m', busFareInr: 1350, notes: 'Drops directly at Hosapete bus stand.' },
      },
      Bengaluru: {
        train: { available: true, trainName: 'Hampi Express (16592)', duration: '8h 45m', sleeperInr: 260, ac3Inr: 690, ac2Inr: 990, notes: 'Classic overnight train from KSR Bengaluru at 9:50 PM, arriving 6:45 AM.' },
        flight: { available: true, route: 'BLR → VDY (Vidyanagar)', duration: '1h 05m', economyAvgInr: 3600, lastMileTransferInr: 850, notes: 'Short hop, but overnight train is cheaper and saves a hotel night.' },
        road: { available: true, service: 'KSRTC Airavat / Sleeper Bus', duration: '7h 00m', busFareInr: 850, notes: 'Frequent overnight buses from Majestic.' },
      },
      Kolkata: {
        train: { available: true, trainName: 'Amaravati Express (18047)', duration: '28h 30m', sleeperInr: 720, ac3Inr: 1850, ac2Inr: 2680, notes: 'Direct rail straight into Hosapete Junction.' },
        flight: { available: true, route: 'CCU → HYD or BLR + overnight rail', duration: '4h+rail', economyAvgInr: 6200, lastMileTransferInr: 900, notes: 'Hyderabad (HYD) to Hampi is an easy 6.5h overnight train/bus.' },
        road: { available: false, service: 'No direct bus', duration: 'N/A', busFareInr: 0, notes: 'Take Amaravati Express or fly via Hyderabad.' },
      },
    },
    hotelOptions: [
      {
        id: 'hp-guesthouse',
        name: 'Anegundi & Sanapur Riverside Huts',
        tier: 'backpacker',
        typeLabel: 'Granite-Hill Bamboo Guesthouse',
        neighborhood: 'Sanapur / Anegundi North Bank',
        pricePerNightInr: 700,
        rating: '4.6/5',
        amenities: ['Hammocks among paddy fields', 'Scooter rental desk', 'Rooftop cafe'],
        bookingNote: 'Calm hippie-island vibe across the Tungabhadra river.',
        image: '/src/assets/images/dest_hampi_ruins_1795005090244.jpg',
      },
      {
        id: 'hp-comfort',
        name: 'Hampi’s Boulders & Heritage Resort',
        tier: 'comfort',
        typeLabel: 'Stone Cottage Boutique',
        neighborhood: 'Kamalapura / Hospet Edge',
        pricePerNightInr: 2800,
        rating: '4.7/5',
        amenities: ['Natural granite boulder cottages', 'Swimming pool', 'Bicycle fleet'],
        bookingNote: 'Ideal base 10 min from Vittala Temple gate.',
        image: IMG_HAVELI,
      },
      {
        id: 'hp-luxury',
        name: 'Evolve Back Kamalapura Palace',
        tier: 'luxury',
        typeLabel: 'Vijayanagara Palace Estate',
        neighborhood: 'Kamalapura',
        pricePerNightInr: 16500,
        rating: '4.9/5',
        amenities: ['Private plunge-pool Jal Mahal suites', 'Historian-led ruins walks', 'Fine dining'],
        bookingNote: 'Modeled on 14th-century Vijayanagara royal architecture.',
        image: IMG_HAVELI,
      },
    ],
    budgets: {
      backpacker: { stay: 550, food: 450, localTransport: 200, activities: 200, total: 1400 },
      comfort: { stay: 1900, food: 750, localTransport: 450, activities: 300, total: 3400 },
      luxury: { stay: 6800, food: 1600, localTransport: 900, activities: 500, total: 9800 },
    },
    monthConditions: ['Peak', 'Peak', 'Pleasant', 'Caution', 'Caution', 'Pleasant', 'Pleasant', 'Pleasant', 'Pleasant', 'Peak', 'Peak', 'Peak'],
    highlights: [
      'Vittala Temple musical pillars & iconic Stone Chariot',
      'Sunrise atop Matanga Hill overlooking the Tungabhadra valley',
      'Coracle round-boat ride across the Tungabhadra river',
      'Royal Enclosure, Lotus Mahal & Elephant Stables',
    ],
    localDishes: [
      { name: 'Jolada Rotti & Ennegai', description: 'North Karnataka sorghum flatbread served with stuffed brinjal curry and peanut chutney', typicalPriceInr: 140 },
      { name: 'Benne Masala Dosa', description: 'Crisp butter-roasted dosa with spiced potato filling in Hampi Bazaar', typicalPriceInr: 90 },
      { name: 'Banana Blossom Cutlets', description: 'Locally grown riverside banana cafe specialty with mint chutney', typicalPriceInr: 160 },
    ],
    dayByDay: [
      {
        day: 1,
        title: 'Sacred Center & Tungabhadra Riverside',
        morning: 'Climb Matanga Hill at 5:45 AM for sunrise, then explore Virupaksha Temple & Hemakuta Hill.',
        afternoon: 'Rent a bicycle or moped (₹350/day) to ride along the river trail to Vittala Temple.',
        evening: 'Watch sunset from Sunset Point on Hemakuta’s granite slabs.',
        estimatedSpendInr: 1500,
      },
      {
        day: 2,
        title: 'Royal Enclosure & Queen’s Bath',
        morning: 'Tour Hazara Rama Temple, Lotus Mahal, and the massive Elephant Stables.',
        afternoon: 'Explore Pushkarani stepped tank, Queen’s Bath, and the Archaeological Museum at Kamalapura.',
        evening: 'Quiet riverside dinner near Sanapur.',
        estimatedSpendInr: 1600,
      },
      {
        day: 3,
        title: 'Anegundi & Sanapur Boulders',
        morning: 'Take a coracle boat across to Anegundi’s historic village lanes and paddy terraces.',
        afternoon: 'Climb Anjanadri Hill’s 575 steps for sweeping views of the boulder valley.',
        evening: 'Overnight train back from Hosapete Junction.',
        estimatedSpendInr: 1450,
      },
    ],
    moneySavingTips: [
      'Take the Hampi Express overnight sleeper/3AC from Bengaluru to Hosapete (₹400–₹950)—arrives right at dawn.',
      'Rent a geared bicycle (₹150/day) or scooter (₹350/day) instead of hiring an auto for ₹1,500/day.',
      'One ₹40 ASI ticket covers both Vittala Temple and Zenana Enclosure on the same day.',
    ],
    permitAndEntryNotes: 'ASI monuments open sunrise to sunset. Drone flying is strictly prohibited near temples.',
  },
  {
    id: 'varanasi',
    name: 'Varanasi',
    state: 'Uttar Pradesh',
    region: 'North & Himalayas',
    vibe: 'Spiritual & Cultural',
    tagline: 'Ancient riverfront ghats, dawn boat hymns & Banarasi silk lanes',
    summary:
      'One of the world’s oldest continuously inhabited cities, Varanasi unfolds along eighty-four sandstone ghats on the Ganges—a sensory tapestry of classical music, morning rituals, and narrow heritage galis.',
    image: '/src/assets/images/dest_varanasi_ghats_1795005090163.jpg',
    imageCaption: 'Dawn wooden boats along the sandstone ghats of Varanasi',
    gallery: [
      { url: '/src/assets/images/dest_varanasi_ghats_1795005090163.jpg', caption: 'Dawn riverfront rowboats at Varanasi ghats' },
      { url: IMG_HAVELI, caption: 'Restored heritage haveli overlooking the Ganges' },
      { url: IMG_RAIL, caption: 'High-speed Vande Bharat rail corridor from Delhi' },
    ],
    idealDays: 3,
    bestMonthsLabel: 'Oct – Mar',
    avgTempPeak: '11°C – 25°C',
    nearestAirport: 'Lal Bahadur Shastri Airport (VNS · 24 km)',
    nearestRailhead: 'Varanasi Junction (BSB) / Banaras (BSBS)',
    intercityFromHubsInr: { Delhi: 2400, Mumbai: 4900, Bengaluru: 6400, Kolkata: 2200 },
    transportByHub: {
      Delhi: {
        train: { available: true, trainName: 'Vande Bharat Express / Shiv Ganga Express', duration: '8h 00m', sleeperInr: 430, ac3Inr: 1120, ac2Inr: 1620, notes: 'Vande Bharat Chair Car (₹1,750) departs 6:00 AM, arrives 2:00 PM.' },
        flight: { available: true, route: 'DEL → VNS nonstop', duration: '1h 25m', economyAvgInr: 4100, lastMileTransferInr: 600, notes: '10+ daily direct flights; Babatpur airport is 45 min from ghats.' },
        road: { available: true, service: 'UPSRTC Janrath / Purvanchal Expressway Volvo', duration: '11h 30m', busFareInr: 1350, notes: 'Smooth overnight highway via Lucknow.' },
      },
      Mumbai: {
        train: { available: true, trainName: 'Mahanagari Express / Kamayani Express', duration: '26h 30m', sleeperInr: 650, ac3Inr: 1680, ac2Inr: 2420, notes: 'Daily direct rail from Mumbai CSMT/LTT.' },
        flight: { available: true, route: 'BOM → VNS nonstop', duration: '2h 15m', economyAvgInr: 4900, lastMileTransferInr: 600, notes: 'Direct IndiGo & Air India Express flights.' },
        road: { available: false, service: 'No practical direct bus', duration: 'N/A', busFareInr: 0, notes: 'Flight or 3AC train recommended.' },
      },
      Bengaluru: {
        train: { available: true, trainName: 'Sanghamitra / Kashi Tamil Express', duration: '39h 00m', sleeperInr: 890, ac3Inr: 2290, ac2Inr: 3320, notes: 'Direct rail takes ~39 hours.' },
        flight: { available: true, route: 'BLR → VNS nonstop', duration: '2h 35m', economyAvgInr: 5800, lastMileTransferInr: 600, notes: 'Direct morning flights save over 36 hours.' },
        road: { available: false, service: 'No direct bus', duration: 'N/A', busFareInr: 0, notes: 'Fly nonstop to VNS.' },
      },
      Kolkata: {
        train: { available: true, trainName: 'Howrah–New Delhi Rajdhani / Vibhuti Express', duration: '10h 30m', sleeperInr: 390, ac3Inr: 1020, ac2Inr: 1480, notes: 'Overnight Vibhuti/Doon Express arrives fresh at dawn.' },
        flight: { available: true, route: 'CCU → VNS nonstop', duration: '1h 25m', economyAvgInr: 3600, lastMileTransferInr: 600, notes: 'Short 85-min flight.' },
        road: { available: true, service: 'NH19 Overnight Bus via Sasaram', duration: '13h 00m', busFareInr: 1100, notes: 'Overnight train is smoother and safer.' },
      },
    },
    hotelOptions: [
      {
        id: 'vns-hostel',
        name: 'Assi Ghat Wanderlust Guesthouse',
        tier: 'backpacker',
        typeLabel: 'Ghat-Side Hostel & Rooms',
        neighborhood: 'Assi Ghat',
        pricePerNightInr: 650,
        rating: '4.6/5',
        amenities: ['2-min walk to Assi morning music', 'Rooftop terrace', 'Filtered water'],
        bookingNote: 'Assi Ghat is noticeably calmer and cleaner than Dashashwamedh.',
        image: '/src/assets/images/dest_varanasi_ghats_1795005090163.jpg',
      },
      {
        id: 'vns-haveli',
        name: 'Suryauday & Guleria Kothi Ghat',
        tier: 'comfort',
        typeLabel: '18th-Century Riverfront Haveli',
        neighborhood: 'Shivala / Guleria Ghat',
        pricePerNightInr: 3600,
        rating: '4.8/5',
        amenities: ['Direct Ganga balcony views', 'Private rowboat dock', 'Classical sitar evenings'],
        bookingNote: 'Note: heritage ghat properties sit inside pedestrian galis (5-min walk from cab drop).',
        image: IMG_HAVELI,
      },
      {
        id: 'vns-palace',
        name: 'BrijRama Palace, Darbhanga Ghat',
        tier: 'luxury',
        typeLabel: 'Sandstone River Palace',
        neighborhood: 'Darbhanga Ghat',
        pricePerNightInr: 19500,
        rating: '4.9/5',
        amenities: ['Barge welcome transfer', 'Sattvic rooftop dining', 'Private morning boat'],
        bookingNote: 'Book months ahead for November Dev Deepawali.',
        image: IMG_HAVELI,
      },
    ],
    budgets: {
      backpacker: { stay: 600, food: 450, localTransport: 200, activities: 200, total: 1450 },
      comfort: { stay: 2100, food: 800, localTransport: 400, activities: 500, total: 3800 },
      luxury: { stay: 9500, food: 2200, localTransport: 900, activities: 900, total: 13500 },
    },
    monthConditions: ['Peak', 'Peak', 'Pleasant', 'Caution', 'Caution', 'Caution', 'Pleasant', 'Pleasant', 'Pleasant', 'Peak', 'Peak', 'Peak'],
    highlights: [
      'Dawn rowboat journey from Assi Ghat to Manikarnika Ghat',
      'Subah-e-Banaras morning classical music & Ganga Aarti',
      'Sarnath Buddhist Stupa & Ashokan Lion Capital museum (10 km)',
      'Handloom Banarasi silk weaving quarters in Madanpura',
    ],
    localDishes: [
      { name: 'Kachori Sabzi & Jalebi', description: 'Crisp spiced breakfast kachoris with smoky potato curry and hot syrup jalebi', typicalPriceInr: 70 },
      { name: 'Malaiyyo (Winter Only)', description: 'Cloud-light saffron milk foam whisked in morning winter dew', typicalPriceInr: 60 },
      { name: 'Tamatar Chaat & Blue Lassi', description: 'Tangy clay-cup spiced tomato chaat and fruit-topped creamy lassi', typicalPriceInr: 120 },
    ],
    dayByDay: [
      {
        day: 1,
        title: 'Southern Ghats & Evening Aarti',
        morning: 'Attend Subah-e-Banaras at Assi Ghat (5:30 AM) followed by a quiet sunrise wooden rowboat ride.',
        afternoon: 'Explore Banaras Hindu University’s Bharat Kala Bhavan museum and Ramnagar Fort.',
        evening: 'Witness the twilight Ganga Aarti at Dashashwamedh Ghat from a moored boat.',
        estimatedSpendInr: 1800,
      },
      {
        day: 2,
        title: 'Old Galis & Silk Weavers',
        morning: 'Walk the northern ghats from Chet Singh to Panchganga Ghat before midday sun.',
        afternoon: 'Guided walk through Vishwanath Gali and family-run Banarasi handloom workshops.',
        evening: 'Attend an intimate classical sitar/tabla baithak near Assi.',
        estimatedSpendInr: 1950,
      },
      {
        day: 3,
        title: 'Sarnath Heritage Excursion',
        morning: 'Take an e-rickshaw or cab to Sarnath where the Buddha gave his first sermon.',
        afternoon: 'Visit Dhamek Stupa, Chaukhandi Stupa, and the Sarnath Archaeological Museum.',
        evening: 'Final kulhad chai along Shivala Ghat before catching an evening train.',
        estimatedSpendInr: 1700,
      },
    ],
    moneySavingTips: [
      'Book Assi Ghat or Shivala Ghat guesthouses—quieter, cleaner, and easy walk to all 84 ghats without paying rickshaws.',
      'Shared sunrise rowboats cost ₹150–₹250 per person vs ₹1,200+ for solo charter boats.',
      'Vande Bharat from New Delhi or Howrah Rajdhani from Kolkata are fast, reliable rail connections.',
    ],
    permitAndEntryNotes: 'Photography is strictly prohibited at cremation ghats (Manikarnika and Harishchandra) out of respect.',
  },
  {
    id: 'meghalaya',
    name: 'Meghalaya',
    state: 'Meghalaya',
    region: 'East & Northeast',
    vibe: 'Mountains & Passes',
    tagline: 'Living root bridges, limestone caves & emerald cloud forests',
    summary:
      'Known as the Abode of Clouds, Meghalaya’s Khasi and Jaintia Hills feature century-old bio-engineered Ficus root bridges, crystal-clear Umngot rivers, and roaring plateau waterfalls.',
    image: '/src/assets/images/dest_meghalaya_falls_1795005091586.jpg',
    imageCaption: 'Living root bridge and rainforest cascade in Meghalaya',
    gallery: [
      { url: '/src/assets/images/dest_meghalaya_falls_1795005091586.jpg', caption: 'Rainforest cascade and living root bridge near Nongriat' },
      { url: IMG_KERALA_STAY, caption: 'Timber hillside eco-lodge surrounded by subtropical foliage' },
      { url: '/src/assets/images/dest_darjeeling_hills_1795005092849.jpg', caption: 'Misty morning ridges across Northeast India' },
    ],
    idealDays: 5,
    bestMonthsLabel: 'Oct – Apr',
    avgTempPeak: '10°C – 22°C',
    nearestAirport: 'Guwahati (GAU · 120 km) / Shillong (SHL)',
    nearestRailhead: 'Guwahati Railway Station (GHY)',
    intercityFromHubsInr: { Delhi: 6800, Mumbai: 7600, Bengaluru: 7400, Kolkata: 3400 },
    transportByHub: {
      Delhi: {
        train: { available: true, trainName: 'Rajdhani / North East Express to Guwahati + Sumo', duration: '30h + 3h', sleeperInr: 1120, ac3Inr: 2350, ac2Inr: 3250, notes: 'Shared Sumos from Guwahati Paltan Bazar to Shillong cost ₹400.' },
        flight: { available: true, route: 'DEL → GAU nonstop + 3h hill road', duration: '5h 45m', economyAvgInr: 6200, lastMileTransferInr: 900, notes: 'Guwahati has 15+ daily flights and costs far less than tiny Shillong airport.' },
        road: { available: false, service: 'No direct bus from Delhi', duration: 'N/A', busFareInr: 0, notes: 'Fly to GAU then shared cab or ASTC bus.' },
      },
      Mumbai: {
        train: { available: true, trainName: 'LTT–Guwahati Express + Sumo', duration: '44h + 3h', sleeperInr: 1280, ac3Inr: 2650, ac2Inr: 3650, notes: 'Very long rail; flight recommended.' },
        flight: { available: true, route: 'BOM → GAU nonstop + road', duration: '6h 15m', economyAvgInr: 7200, lastMileTransferInr: 900, notes: 'Direct morning flights let you reach Shillong before dusk.' },
        road: { available: false, service: 'No direct bus', duration: 'N/A', busFareInr: 0, notes: 'Fly to GAU.' },
      },
      Bengaluru: {
        train: { available: true, trainName: 'SMVB–Guwahati SF Express', duration: '49h + 3h', sleeperInr: 1350, ac3Inr: 2800, ac2Inr: 3850, notes: 'Weekly rail; flight is far faster.' },
        flight: { available: true, route: 'BLR → GAU nonstop + road', duration: '6h 10m', economyAvgInr: 6900, lastMileTransferInr: 900, notes: 'Daily nonstop IndiGo/Akasa flights.' },
        road: { available: false, service: 'No direct bus', duration: 'N/A', busFareInr: 0, notes: 'Fly to GAU.' },
      },
      Kolkata: {
        train: { available: true, trainName: 'Saraighat Express / Kamrup Express to GHY', duration: '17h + 3h', sleeperInr: 920, ac3Inr: 1850, ac2Inr: 2550, notes: 'Overnight Saraighat Express + morning Sumo is super budget-friendly!' },
        flight: { available: true, route: 'CCU → GAU or SHL nonstop', duration: '1h 15m + road', economyAvgInr: 3500, lastMileTransferInr: 700, notes: 'Alliance Air flies CCU–SHL directly, or frequent CCU–GAU flights.' },
        road: { available: true, service: 'Overnight Sleeper Bus CCU → Shillong', duration: '22h 00m', busFareInr: 1850, notes: 'Via Siliguri & Guwahati; train or 1h flight is easier.' },
      },
    },
    hotelOptions: [
      {
        id: 'mg-homestay',
        name: 'Serene Tyrna & Nongriat Village Stay',
        tier: 'backpacker',
        typeLabel: 'Khasi Village Homestay',
        neighborhood: 'Nongriat / Tyrna',
        pricePerNightInr: 900,
        rating: '4.7/5',
        amenities: ['Steps from Double-Decker Root Bridge', 'Wood-fire dinner', 'Natural swimming pools'],
        bookingNote: 'Pack light in a daypack—you descend 3,500 steps to reach Nongriat.',
        image: '/src/assets/images/dest_meghalaya_falls_1795005091586.jpg',
      },
      {
        id: 'mg-boutique',
        name: 'Laitumkhrah Timber Cottage & Sohra Villa',
        tier: 'comfort',
        typeLabel: 'Hillside Boutique B&B',
        neighborhood: 'Laitumkhrah, Shillong / Sohra',
        pricePerNightInr: 3200,
        rating: '4.8/5',
        amenities: ['Pine-grove terrace', 'Walking distance to Shillong cafes', 'Local guide desk'],
        bookingNote: 'Split nights: 2 in Shillong, 2 in Sohra/Cherrapunji, 1 in Shnongpdeng.',
        image: IMG_KERALA_STAY,
      },
      {
        id: 'mg-luxury',
        name: 'Ri Kynjai Serenity by the Lake',
        tier: 'luxury',
        typeLabel: 'Khasi Architectural Resort',
        neighborhood: 'Umiam Lake (Barapani)',
        pricePerNightInr: 13500,
        rating: '4.9/5',
        amenities: ['Traditional Khasi upturned boat roofs', 'Lakefront fireplace cottages', 'Khem Khasi spa'],
        bookingNote: 'Conveniently located between Guwahati Airport and Shillong.',
        image: IMG_KERALA_STAY,
      },
    ],
    budgets: {
      backpacker: { stay: 800, food: 550, localTransport: 500, activities: 250, total: 2100 },
      comfort: { stay: 2400, food: 950, localTransport: 1100, activities: 450, total: 4900 },
      luxury: { stay: 6900, food: 1800, localTransport: 2100, activities: 700, total: 11500 },
    },
    monthConditions: ['Peak', 'Peak', 'Peak', 'Pleasant', 'Pleasant', 'Caution', 'Caution', 'Caution', 'Pleasant', 'Peak', 'Peak', 'Peak'],
    highlights: [
      'Nongriat Double-Decker Living Root Bridge (3,500 forest stone steps)',
      'Dawki & Shnongpdeng crystal-clear Umngot River (best Nov–Mar)',
      'Krang Suri turquoise waterfall & Laitlum Grand Canyon',
      'Shillong cafe culture & Khasi indigenous music venues',
    ],
    localDishes: [
      { name: 'Jadoh & Dohneiiong', description: 'Fragrant Khasi rice cooked with turmeric, paired with black-sesame gravy', typicalPriceInr: 220 },
      { name: 'Sohra Smoked Pineapple & Tea', description: 'Sweet wild hill pineapple slices and local wild-flower honey tea on trek trails', typicalPriceInr: 80 },
      { name: 'Tungrymbai & Veg Putharo', description: 'Fermented soybean relish served with traditional steamed rice cakes', typicalPriceInr: 150 },
    ],
    dayByDay: [
      {
        day: 1,
        title: 'Guwahati to Shillong & Laitlum',
        morning: 'Shared sumo or cab up Umiam Lake canyon into Shillong.',
        afternoon: 'Hike the dramatic Laitlum Canyons ridge above misty valleys.',
        evening: 'Live acoustic music and dinner at Police Bazar or Laitumkhrah.',
        estimatedSpendInr: 2500,
      },
      {
        day: 2,
        title: 'Sohra (Cherrapunji) & Waterfalls',
        morning: 'Drive to Nohkalikai Falls, Wei Sawdong three-tier falls, and Mawsmai Limestone Caves.',
        afternoon: 'Check into Tyrna village homestay to prepare for the Nongriat trek.',
        evening: 'Early rest surrounded by cicadas and mist.',
        estimatedSpendInr: 2900,
      },
      {
        day: 3,
        title: 'Nongriat Double-Decker Root Bridge',
        morning: 'Descend 3,500 steps through suspension bridges to Nongriat Living Root Bridge.',
        afternoon: 'Swim in Rainbow Falls emerald pool and stay overnight in Nongriat or climb back.',
        evening: 'Home-cooked Khasi supper at village homestay.',
        estimatedSpendInr: 2200,
      },
      {
        day: 4,
        title: 'Mawlynnong & Shnongpdeng River',
        morning: 'Walk Mawlynnong’s clean bamboo pathways and skyview platform.',
        afternoon: 'Kayak or boat on crystal-clear Umngot River in Shnongpdeng.',
        evening: 'Camp or stay in riverside cottages.',
        estimatedSpendInr: 3100,
      },
    ],
    moneySavingTips: [
      'Fly into Guwahati (GAU) instead of Shillong—flights are 40–50% cheaper, and shared Sumo taxis to Shillong cost just ₹400.',
      'Stay overnight in Nongriat village (~₹900) instead of rushing up and down 7,000 steps in one exhausting day.',
      'Visit Dawki between November and March for glass-clear water; June–August monsoon turns rivers muddy.',
    ],
    permitAndEntryNotes: 'Indian and foreign visitors need no Inner Line Permit for Meghalaya (unlike Arunachal/Nagaland). Carry cash for village parking/trek fees.',
  },
  {
    id: 'goa',
    name: 'South Goa (Palolem & Agonda)',
    state: 'Goa',
    region: 'Rajasthan & West',
    vibe: 'Backwaters & Coast',
    tagline: 'Quiet crescent bays, Konkan spice estates & Portuguese chapels',
    summary:
      'Far quieter than North Goa’s party belt, South Goa’s Canacona coast blends palm-lined coves, Latin Quarter heritage lanes in Fontainhas, and laid-back Konkani-Portuguese dining.',
    image: '/src/assets/images/dest_goa_palolem_1795005091969.jpg',
    imageCaption: 'Palolem crescent bay and wooden fishing boats at dusk, South Goa',
    gallery: [
      { url: '/src/assets/images/dest_goa_palolem_1795005091969.jpg', caption: 'Palolem crescent bay with wooden outrigger boats' },
      { url: IMG_KERALA_STAY, caption: 'Shaded tropical veranda cottages near Agonda' },
      { url: IMG_RAIL, caption: 'Konkan Railway scenic Western Ghats bridge approach' },
    ],
    idealDays: 4,
    bestMonthsLabel: 'Nov – Mar',
    avgTempPeak: '22°C – 32°C',
    nearestAirport: 'Dabolim (GOI · 60 km) / Manohar Intl (GOX)',
    nearestRailhead: 'Madgaon Junction (MAO) / Canacona (CNO)',
    intercityFromHubsInr: { Delhi: 5900, Mumbai: 2400, Bengaluru: 2300, Kolkata: 6500 },
    transportByHub: {
      Delhi: {
        train: { available: true, trainName: 'Goa Express / Thiruvananthapuram Rajdhani', duration: '28h 30m', sleeperInr: 790, ac3Inr: 2050, ac2Inr: 2950, notes: 'Rajdhani terminates at Madgaon—right in South Goa!' },
        flight: { available: true, route: 'DEL → GOI (Dabolim) nonstop', duration: '2h 35m', economyAvgInr: 5800, lastMileTransferInr: 1400, notes: 'Choose Dabolim (GOI) over Mopa (GOX) for South Goa—saves 1.5h cab.' },
        road: { available: false, service: 'No direct bus', duration: 'N/A', busFareInr: 0, notes: 'Fly to GOI or take Rajdhani.' },
      },
      Mumbai: {
        train: { available: true, trainName: 'Konkan Kanya / Mandovi / Vande Bharat Express', duration: '8h 30m', sleeperInr: 360, ac3Inr: 950, ac2Inr: 1380, notes: 'CSMT–Madgaon Vande Bharat (~₹1,650) is one of India’s most scenic train rides.' },
        flight: { available: true, route: 'BOM → GOI nonstop', duration: '1h 10m', economyAvgInr: 3400, lastMileTransferInr: 1400, notes: 'Frequent quick flights.' },
        road: { available: true, service: 'Overnight AC Sleeper Bus via NH66', duration: '12h 00m', busFareInr: 1200, notes: 'Drops in Margao or Canacona.' },
      },
      Bengaluru: {
        train: { available: true, trainName: 'Vasco da Gama Express (via Dudhsagar)', duration: '14h 30m', sleeperInr: 410, ac3Inr: 1080, ac2Inr: 1550, notes: 'Passes right past Dudhsagar Waterfalls on the Western Ghats descent!' },
        flight: { available: true, route: 'BLR → GOI nonstop', duration: '1h 15m', economyAvgInr: 3300, lastMileTransferInr: 1400, notes: 'Fast 75-min flight.' },
        road: { available: true, service: 'KSRTC / Paulo Overnight Volvo', duration: '11h 30m', busFareInr: 1150, notes: 'Direct buses run straight to Palolem / Canacona.' },
      },
      Kolkata: {
        train: { available: true, trainName: 'Amaravati Express (18047)', duration: '37h 00m', sleeperInr: 860, ac3Inr: 2220, ac2Inr: 3200, notes: 'Crosses South India to Madgaon.' },
        flight: { available: true, route: 'CCU → GOI nonstop', duration: '2h 50m', economyAvgInr: 6200, lastMileTransferInr: 1400, notes: 'Direct IndiGo flights.' },
        road: { available: false, service: 'No direct bus', duration: 'N/A', busFareInr: 0, notes: 'Fly nonstop to GOI.' },
      },
    },
    hotelOptions: [
      {
        id: 'ga-hut',
        name: 'Patnem & Palolem Palm Beach Huts',
        tier: 'backpacker',
        typeLabel: 'Eco Bamboo Beach Cottage',
        neighborhood: 'Patnem / South Palolem',
        pricePerNightInr: 1100,
        rating: '4.6/5',
        amenities: ['Steps from calm swimming bay', 'Cafe Wi-Fi', 'Kayak rental'],
        bookingNote: 'Rates are ₹1,100 in Nov/Mar; spike to ₹2,800+ in late December.',
        image: '/src/assets/images/dest_goa_palolem_1795005091969.jpg',
      },
      {
        id: 'ga-villa',
        name: 'Casa Agonda Portuguese Garden Villa',
        tier: 'comfort',
        typeLabel: 'Boutique Coastal Cottage',
        neighborhood: 'Agonda Beach',
        pricePerNightInr: 3600,
        rating: '4.8/5',
        amenities: ['Shaded veranda', 'Scooter parking', 'Yoga deck'],
        bookingNote: 'Agonda is protected turtle-nesting coast—blissfully free of loud clubs.',
        image: IMG_KERALA_STAY,
      },
      {
        id: 'ga-luxury',
        name: 'Cabo Serai & Taj Exotica, Benaulim',
        tier: 'luxury',
        typeLabel: 'Cliffside & Mediterranean Beach Resort',
        neighborhood: 'Cabo de Rama / Benaulim',
        pricePerNightInr: 17500,
        rating: '4.9/5',
        amenities: ['Private Arabian Sea cliff deck', '56-acre palm estate', 'Coastal fine dining'],
        bookingNote: 'Unmatched oceanfront sunsets in South Goa.',
        image: '/src/assets/images/dest_goa_palolem_1795005091969.jpg',
      },
    ],
    budgets: {
      backpacker: { stay: 900, food: 600, localTransport: 300, activities: 200, total: 2000 },
      comfort: { stay: 3100, food: 1200, localTransport: 500, activities: 400, total: 5200 },
      luxury: { stay: 12500, food: 3100, localTransport: 1100, activities: 800, total: 17500 },
    },
    monthConditions: ['Peak', 'Peak', 'Pleasant', 'Caution', 'Caution', 'Pleasant', 'Pleasant', 'Pleasant', 'Pleasant', 'Pleasant', 'Peak', 'Peak'],
    highlights: [
      'Sunrise kayaking around Butterfly Beach & Palolem’s granite headlands',
      'Agonda’s 3 km quiet turtle-nesting shoreline',
      'Cabo de Rama Portuguese fort cliffs overlooking the Arabian Sea',
      'Fontainhas painted colonial lanes & Old Goa basilicas',
    ],
    localDishes: [
      { name: 'Goan Fish Curry Rice', description: 'Tangy coconut-kokum red curry with local kingfish and steamed red ukda rice', typicalPriceInr: 260 },
      { name: 'Ros Omelette & Poi', description: 'Fluffy omelette drenched in spicy xacuti coconut gravy served with wood-fired poi bread', typicalPriceInr: 110 },
      { name: 'Bebinca & Dodol', description: 'Traditional multi-layered coconut-jaggery Goan dessert baked slowly in clay pots', typicalPriceInr: 140 },
    ],
    dayByDay: [
      {
        day: 1,
        title: 'Palolem Bay & Kayaking',
        morning: 'Settle into a wooden beach hut or garden cottage in Palolem or Patnem.',
        afternoon: 'Rent a sea kayak to paddle out to Monkey Island and Butterfly Beach cove.',
        evening: 'Fresh grilled seafood or Konkani thali with toes in the sand.',
        estimatedSpendInr: 2900,
      },
      {
        day: 2,
        title: 'Cabo de Rama & Cola Lagoon',
        morning: 'Scooter north along coastal bends to Cabo de Rama Fort’s sea cliffs.',
        afternoon: 'Relax by Cola Beach’s freshwater lagoon meeting the Arabian Sea.',
        evening: 'Sunset stroll on quiet Agonda beach.',
        estimatedSpendInr: 2700,
      },
      {
        day: 3,
        title: 'Spice Plantation & Fontainhas Heritage',
        morning: 'Drive inland to Ponda’s organic spice groves (black pepper, cardamom, nutmeg).',
        afternoon: 'Walk Panjim’s Fontainhas Latin Quarter and Se Cathedral in Old Goa.',
        evening: 'Return south via scenic Konkan backroads.',
        estimatedSpendInr: 3200,
      },
    ],
    moneySavingTips: [
      'Rent a scooter (₹400/day) with valid license—Goa has no Uber/Ola, and local taxis charge steep flat rates.',
      'Take the overnight Konkan Kanya or Jan Shatabdi train from Mumbai to Madgaon for ₹600–₹1,200 with coastal Western Ghats scenery.',
      'Visit in late October or early March for calm sunny seas at 40% lower accommodation rates than New Year’s week.',
    ],
    permitAndEntryNotes: 'No permits required. Carry an original driving license if renting two-wheelers.',
  },
  {
    id: 'darjeeling',
    name: 'Darjeeling',
    state: 'West Bengal',
    region: 'East & Northeast',
    vibe: 'Mountains & Passes',
    tagline: 'Misty tea terraces, UNESCO toy train & Kanchenjunga sunrises',
    summary:
      'Perched at 2,040 metres along a Himalayan ridge, Darjeeling is a timeless blend of emerald single-estate tea gardens, Buddhist monasteries, and crisp views of the world’s third-highest peak.',
    image: '/src/assets/images/dest_darjeeling_hills_1795005092849.jpg',
    imageCaption: 'Terraced tea estates facing Kanchenjunga at sunrise, Darjeeling',
    gallery: [
      { url: '/src/assets/images/dest_darjeeling_hills_1795005092849.jpg', caption: 'Tea pickers and Kanchenjunga range at sunrise' },
      { url: IMG_RAIL, caption: 'UNESCO Himalayan mountain rail crossing stone arches' },
      { url: IMG_KERALA_STAY, caption: 'Colonial timber bungalow tea estate veranda' },
    ],
    idealDays: 4,
    bestMonthsLabel: 'Mar – May & Oct – Dec',
    avgTempPeak: '6°C – 18°C',
    nearestAirport: 'Bagdogra Airport (IXB · 68 km)',
    nearestRailhead: 'New Jalpaiguri (NJP · 72 km)',
    intercityFromHubsInr: { Delhi: 5800, Mumbai: 6900, Bengaluru: 7100, Kolkata: 1800 },
    transportByHub: {
      Delhi: {
        train: { available: true, trainName: 'Dibrugarh Rajdhani / North East Express to NJP', duration: '21h + 3h jeep', sleeperInr: 890, ac3Inr: 1980, ac2Inr: 2850, notes: 'From NJP station, shared Sumo jeeps climb to Darjeeling for ₹300.' },
        flight: { available: true, route: 'DEL → IXB (Bagdogra) nonstop + 3h hill road', duration: '5h 15m', economyAvgInr: 5600, lastMileTransferInr: 700, notes: 'Frequent nonstop morning flights.' },
        road: { available: false, service: 'No direct bus', duration: 'N/A', busFareInr: 0, notes: 'Fly to IXB or rail to NJP.' },
      },
      Mumbai: {
        train: { available: true, trainName: 'Karmabhoomi / LTT–Guwahati to NJP', duration: '38h + 3h', sleeperInr: 1090, ac3Inr: 2450, ac2Inr: 3450, notes: 'Fly to Bagdogra for comfort.' },
        flight: { available: true, route: 'BOM → IXB nonstop + road', duration: '5h 45m', economyAvgInr: 6700, lastMileTransferInr: 700, notes: 'Daily nonstop flights to IXB.' },
        road: { available: false, service: 'No direct bus', duration: 'N/A', busFareInr: 0, notes: 'Fly to IXB.' },
      },
      Bengaluru: {
        train: { available: true, trainName: 'Guwahati Express to NJP + jeep', duration: '42h + 3h', sleeperInr: 1180, ac3Inr: 2650, ac2Inr: 3750, notes: 'Long rail; nonstop IXB flights recommended.' },
        flight: { available: true, route: 'BLR → IXB nonstop + road', duration: '5h 50m', economyAvgInr: 6800, lastMileTransferInr: 700, notes: 'Morning nonstop flights let you reach Mall Road by afternoon.' },
        road: { available: false, service: 'No direct bus', duration: 'N/A', busFareInr: 0, notes: 'Fly to IXB.' },
      },
      Kolkata: {
        train: { available: true, trainName: 'Darjeeling Mail / Vande Bharat (HWH–NJP)', duration: '7h 30m + 3h', sleeperInr: 640, ac3Inr: 1280, ac2Inr: 1750, notes: 'Overnight Darjeeling Mail arrives NJP 8:00 AM; Vande Bharat takes 7.5h.' },
        flight: { available: true, route: 'CCU → IXB nonstop + road', duration: '4h 15m', economyAvgInr: 3400, lastMileTransferInr: 700, notes: '1h10m flight; overnight Darjeeling Mail is equally convenient.' },
        road: { available: true, service: 'NBSTC Rocket Volvo (Esplanade → Siliguri)', duration: '11h + 3h', busFareInr: 1450, notes: 'Overnight buses arrive Siliguri Tenzing Norgay bus stand.' },
      },
    },
    hotelOptions: [
      {
        id: 'dj-hostel',
        name: 'Zakir Hussain Rd Mountain Hostel',
        tier: 'backpacker',
        typeLabel: 'Ridgeline Backpacker Lodge',
        neighborhood: 'Above Chowrasta / Gandhi Rd',
        pricePerNightInr: 700,
        rating: '4.6/5',
        amenities: ['Kanchenjunga common deck', 'Heated blankets', 'Shared trek board'],
        bookingNote: 'Book heated rooms if visiting December–February.',
        image: '/src/assets/images/dest_darjeeling_hills_1795005092849.jpg',
      },
      {
        id: 'dj-boutique',
        name: 'Windamere Annex & Crescent Ridge',
        tier: 'comfort',
        typeLabel: 'Colonial Hill Heritage Inn',
        neighborhood: 'Observatory Hill / Mall Road',
        pricePerNightInr: 3100,
        rating: '4.8/5',
        amenities: ['Wood-burning hearth', 'Afternoon Darjeeling tea service', 'Valley view'],
        bookingNote: 'Car-free Mall Road access makes morning walks peaceful.',
        image: IMG_KERALA_STAY,
      },
      {
        id: 'dj-tea',
        name: 'Glenburn Tea Estate Bungalow',
        tier: 'luxury',
        typeLabel: 'Working Heritage Tea Plantation',
        neighborhood: 'Glenburn Ridge (overlooking Sikkim)',
        pricePerNightInr: 16800,
        rating: '4.9/5',
        amenities: ['All meals & private tea tasting', 'Guided river valley hikes', '1,000-acre estate'],
        bookingNote: 'One of India’s finest all-inclusive plantation stays.',
        image: '/src/assets/images/dest_darjeeling_hills_1795005092849.jpg',
      },
    ],
    budgets: {
      backpacker: { stay: 650, food: 450, localTransport: 250, activities: 250, total: 1600 },
      comfort: { stay: 2200, food: 850, localTransport: 550, activities: 500, total: 4100 },
      luxury: { stay: 8200, food: 2100, localTransport: 1400, activities: 1100, total: 12800 },
    },
    monthConditions: ['Pleasant', 'Pleasant', 'Peak', 'Peak', 'Peak', 'Caution', 'Caution', 'Caution', 'Pleasant', 'Peak', 'Peak', 'Peak'],
    highlights: [
      'Tiger Hill dawn glow over Mount Kanchenjunga (8,586m)',
      'UNESCO Darjeeling Himalayan Railway narrow-gauge steam joyride',
      'Happy Valley & Glenburn heritage first-flush tea estate tours',
      'Peace Pagoda, Ghoom Monastery & Observatory Hill trails',
    ],
    localDishes: [
      { name: 'Steamed Momos & Shapaley', description: 'Tibetan-Nepali dumplings and crisp meat/veg stuffed pies with fiery chili chutney', typicalPriceInr: 120 },
      { name: 'Keventers Classic Platter & First-Flush Tea', description: 'Historic terrace breakfast overlooking snowy peaks with muscatel Darjeeling tea', typicalPriceInr: 340 },
      { name: 'Aloo Dum & Sel Roti', description: 'Local spiced mountain potatoes with sweet fried ring bread', typicalPriceInr: 90 },
    ],
    dayByDay: [
      {
        day: 1,
        title: 'Chowrasta Ridge & Heritage Tea',
        morning: 'Ascend from NJP/Bagdogra through Kurseong’s pine bends into Darjeeling.',
        afternoon: 'Walk Chowrasta Mall Road, Padmaja Naidu Himalayan Zoo, and Himalayan Mountaineering Institute.',
        evening: 'Sip single-origin tea at Nathmulls and dine at Glenary’s.',
        estimatedSpendInr: 2300,
      },
      {
        day: 2,
        title: 'Tiger Hill Dawn & Toy Train',
        morning: '4:30 AM drive to Tiger Hill for first pink light hitting Kanchenjunga, stopping at Batasia Loop & Ghoom Monastery.',
        afternoon: 'Board the heritage steam Toy Train joyride from Darjeeling to Ghoom.',
        evening: 'Stroll Peace Pagoda trails.',
        estimatedSpendInr: 2800,
      },
      {
        day: 3,
        title: 'Happy Valley Tea Estate & Lebong',
        morning: 'Guided tasting and processing tour at Happy Valley Tea Estate (harvest Mar–Nov).',
        afternoon: 'Explore Tibetan Refugee Self-Help Centre crafts and quiet Lebong valley views.',
        evening: 'Warm Nepali thali supper with gundruk soup.',
        estimatedSpendInr: 2100,
      },
    ],
    moneySavingTips: [
      'Share a jeep from Siliguri/NJP Junction to Darjeeling for ₹250–₹350 per seat instead of ₹3,000 private cab.',
      'Overnight Darjeeling Mail or Padatik Express trains from Kolkata Sealdah take 10 hours for ₹600–₹1,200.',
      'Check clear-sky forecasts for Oct–Nov and Mar–Apr; June–August clouds hide mountain views.',
    ],
    permitAndEntryNotes: 'No permits needed for Darjeeling town. Foreign nationals require a Restricted Area Permit only if trekking Singalila border ridges into Sikkim.',
  },
  {
    id: 'rishikesh',
    name: 'Rishikesh',
    state: 'Uttarakhand',
    region: 'North & Himalayas',
    vibe: 'Spiritual & Cultural',
    tagline: 'Emerald Himalayan Ganga rapids, suspension bridges & ashram bells',
    summary:
      'Where the Ganges emerges crystal-clear from the Garhwal Himalayas, Rishikesh pairs quiet riverside yoga sanctuaries and sunset Triveni Aarti with Class III white-water rafting and forest trails.',
    image: '/src/assets/images/dest_rishikesh_ganga_1795006089660.jpg',
    imageCaption: 'Suspension bridge and riverside temples above the emerald Ganga, Rishikesh',
    gallery: [
      { url: '/src/assets/images/dest_rishikesh_ganga_1795006089660.jpg', caption: 'Ganga footbridge and hillside shrines in morning mist' },
      { url: IMG_RAIL, caption: 'Shatabdi / Vande Bharat corridor to Haridwar & Yog Nagari Rishikesh' },
      { url: IMG_KERALA_STAY, caption: 'Peaceful timber retreat cottages near Tapovan' },
    ],
    idealDays: 3,
    bestMonthsLabel: 'Sep – Apr',
    avgTempPeak: '12°C – 26°C',
    nearestAirport: 'Jolly Grant Airport, Dehradun (DED · 21 km)',
    nearestRailhead: 'Haridwar (HW · 24 km) / Yog Nagari Rishikesh (YNRK)',
    intercityFromHubsInr: { Delhi: 1500, Mumbai: 5400, Bengaluru: 6600, Kolkata: 5900 },
    transportByHub: {
      Delhi: {
        train: { available: true, trainName: 'Dehradun Shatabdi / Vande Bharat to Haridwar', duration: '4h 30m', sleeperInr: 220, ac3Inr: 580, ac2Inr: 920, notes: 'From Haridwar Junction, shared Vikram/auto to Rishikesh costs ₹60.' },
        flight: { available: true, route: 'DEL → DED (Dehradun) nonstop', duration: '1h 00m', economyAvgInr: 3600, lastMileTransferInr: 700, notes: 'Jolly Grant airport is just 30 minutes from Tapovan.' },
        road: { available: true, service: 'UTC Volvo / Sleeper via Delhi–Haridwar Hwy', duration: '5h 30m', busFareInr: 820, notes: 'Hourly AC buses from Kashmiri Gate ISBT.' },
      },
      Mumbai: {
        train: { available: true, trainName: 'Dehradun Express / Bandra–Haridwar AC SF', duration: '24h 00m', sleeperInr: 680, ac3Inr: 1750, ac2Inr: 2520, notes: 'Direct weekly AC Superfast to Haridwar.' },
        flight: { available: true, route: 'BOM → DED nonstop', duration: '2h 20m', economyAvgInr: 5400, lastMileTransferInr: 700, notes: 'Daily direct IndiGo flights.' },
        road: { available: false, service: 'No direct bus', duration: 'N/A', busFareInr: 0, notes: 'Fly to DED.' },
      },
      Bengaluru: {
        train: { available: true, trainName: 'Yog Nagari Rishikesh Express (via Delhi)', duration: '42h 00m', sleeperInr: 940, ac3Inr: 2420, ac2Inr: 3480, notes: 'Direct long-haul rail straight into YNRK station.' },
        flight: { available: true, route: 'BLR → DED nonstop', duration: '2h 50m', economyAvgInr: 6400, lastMileTransferInr: 700, notes: 'Direct flights save nearly 40 hours.' },
        road: { available: false, service: 'No direct bus', duration: 'N/A', busFareInr: 0, notes: 'Fly to DED.' },
      },
      Kolkata: {
        train: { available: true, trainName: 'Upasana / Kumbha / Doon Express to Haridwar', duration: '26h 30m', sleeperInr: 690, ac3Inr: 1790, ac2Inr: 2590, notes: 'Overnight+day train directly into Haridwar.' },
        flight: { available: true, route: 'CCU → DED nonstop', duration: '2h 20m', economyAvgInr: 5800, lastMileTransferInr: 700, notes: 'Daily nonstop flights.' },
        road: { available: false, service: 'No direct bus', duration: 'N/A', busFareInr: 0, notes: 'Fly to DED or take Doon Express.' },
      },
    },
    hotelOptions: [
      {
        id: 'rk-hostel',
        name: 'Tapovan Ganga River Hostel & Ashram',
        tier: 'backpacker',
        typeLabel: 'Yoga Hostel / Ashram Room',
        neighborhood: 'Tapovan / Swarg Ashram',
        pricePerNightInr: 650,
        rating: '4.7/5',
        amenities: ['Morning drop-in yoga deck', 'Cafe balcony', 'Co-working Wi-Fi'],
        bookingNote: 'Parmarth Niketan ashram rooms start around ₹800–₹1,200 with simple sattvic meals.',
        image: '/src/assets/images/dest_rishikesh_ganga_1795006089660.jpg',
      },
      {
        id: 'rk-boutique',
        name: 'Aloha & Divine Ganga Cottage',
        tier: 'comfort',
        typeLabel: 'Riverside Boutique Retreat',
        neighborhood: 'Tapovan Riverside',
        pricePerNightInr: 3400,
        rating: '4.8/5',
        amenities: ['Infinity river pool', 'Sound-healing sessions', 'Private Ganga stairs'],
        bookingNote: 'Close to cafes while keeping quiet mountain views.',
        image: IMG_KERALA_STAY,
      },
      {
        id: 'rk-luxury',
        name: 'Taj Rishikesh & Roseate Ganges',
        tier: 'luxury',
        typeLabel: 'Himalayan Riverfront Sanctuary',
        neighborhood: 'Singthali / Shivpuri Gorge',
        pricePerNightInr: 18500,
        rating: '4.9/5',
        amenities: ['Private boulder-beach Ganga access', 'Forest ayurveda spa', 'Garhwali architecture'],
        bookingNote: '35 min upstream from town bustle in forested canyon.',
        image: IMG_KERALA_STAY,
      },
    ],
    budgets: {
      backpacker: { stay: 600, food: 450, localTransport: 200, activities: 300, total: 1550 },
      comfort: { stay: 2500, food: 900, localTransport: 400, activities: 600, total: 4400 },
      luxury: { stay: 12000, food: 2600, localTransport: 1100, activities: 1300, total: 17000 },
    },
    monthConditions: ['Pleasant', 'Peak', 'Peak', 'Peak', 'Pleasant', 'Caution', 'Caution', 'Caution', 'Peak', 'Peak', 'Peak', 'Pleasant'],
    highlights: [
      '16 km Shivpuri–Rishikesh white-water rafting (₹600–₹1,000)',
      'Triveni Ghat & Parmarth Niketan evening Ganga Aarti',
      'Beatles Ashram (Chaurasi Kutia) forest murals inside Rajaji Reserve',
      'Sunrise hike to Kunjapuri Temple overlooking snowy Garhwal peaks',
    ],
    localDishes: [
      { name: 'Garhwali Thali & Aloo Ke Gutke', description: 'Pahadi spiced potatoes, black-soybean bhatt ki churkani, and mandua millet roti', typicalPriceInr: 220 },
      { name: 'Chotiwala Sattu Kachori & Lassi', description: 'Classic Swarg Ashram vegetarian lunch plate near Ram Jhula', typicalPriceInr: 140 },
      { name: 'Ayurvedic Ginger-Lemon Honey Bowl', description: 'Warm Tapovan yoga-cafe breakfast bowl with Himalayan honey and millet granola', typicalPriceInr: 190 },
    ],
    dayByDay: [
      {
        day: 1,
        title: 'Ram Jhula, Beatles Ashram & Aarti',
        morning: 'Cross Ram Jhula footbridge into Swarg Ashram’s serene vehicle-free lanes.',
        afternoon: 'Explore Beatles Ashram’s domed meditation pods and Rajaji forest edge.',
        evening: 'Attend sunset Ganga Aarti at Parmarth Niketan.',
        estimatedSpendInr: 1700,
      },
      {
        day: 2,
        title: 'Ganga Rapids & Waterfall Hike',
        morning: 'Raft 16 km from Shivpuri down Class III rapids (Roller Coaster & Golf Course).',
        afternoon: 'Hike up to Neer Garh Waterfall for a cool dip.',
        evening: 'Riverside acoustic dinner in Tapovan.',
        estimatedSpendInr: 2300,
      },
      {
        day: 3,
        title: 'Kunjapuri Dawn & Yoga Morning',
        morning: '5:00 AM cab to Kunjapuri Temple ridge for snowy Gangotri/Bandarpunch peak views.',
        afternoon: 'Relaxed afternoon tea & café hopping along Laxman Jhula.',
        evening: 'Catch Shatabdi / Volvo back from Haridwar or Rishikesh.',
        estimatedSpendInr: 1900,
      },
    ],
    moneySavingTips: [
      'Rafting is closed July–mid September for monsoon safety; book directly at Tapovan union counters (₹600–₹800 for 16 km).',
      'Rishikesh is strictly vegetarian and alcohol-free within municipal/ashram zones—local thalis are remarkably inexpensive.',
      'Use shared green Vikram auto-rickshaws along Badrinath Road for ₹20–₹30 per ride.',
    ],
    permitAndEntryNotes: 'Beatles Ashram entry is ₹150 (Indian) / ₹600 (foreigner). Carry cash for rafting gear photos and ashram donations.',
  },
  {
    id: 'kutch',
    name: 'Rann of Kutch',
    state: 'Gujarat',
    region: 'Rajasthan & West',
    vibe: 'Heritage & Royal',
    tagline: 'Endless white salt desert, Bhunga mud-art villages & full-moon nights',
    summary:
      'Every winter after the monsoon waters evaporate, the Great Rann transforms into a surreal mirror of hexagonal salt crystals framed by Kutchi craft villages, Rogan-art weavers, and Harappan ruins at Dholavira.',
    image: '/src/assets/images/dest_kutch_salt_1795006091019.jpg',
    imageCaption: 'Hexagonal salt flat crust of the Great Rann of Kutch at twilight',
    gallery: [
      { url: '/src/assets/images/dest_kutch_salt_1795006091019.jpg', caption: 'White Rann geometric salt flats at sunset' },
      { url: IMG_HAVELI, caption: 'Carved Kutchi sandstone palace & heritage courtyard in Bhuj' },
      { url: IMG_RAIL, caption: 'Overnight rail arrival at Bhuj Junction' },
    ],
    idealDays: 3,
    bestMonthsLabel: 'Nov – Feb',
    avgTempPeak: '10°C – 26°C',
    nearestAirport: 'Bhuj Airport (BHJ · 82 km from White Rann)',
    nearestRailhead: 'Bhuj Railway Station (BHUJ)',
    intercityFromHubsInr: { Delhi: 5600, Mumbai: 2600, Bengaluru: 6800, Kolkata: 7200 },
    transportByHub: {
      Delhi: {
        train: { available: true, trainName: 'Ala Hazrat / Bareilly–Bhuj Express', duration: '21h 30m', sleeperInr: 580, ac3Inr: 1520, ac2Inr: 2180, notes: 'Daily direct rail via Jaipur and Ahmedabad.' },
        flight: { available: true, route: 'DEL → BHJ (via BOM or nonstop seasonal)', duration: '2h 10m', economyAvgInr: 5800, lastMileTransferInr: 1200, notes: 'Winter Rann Utsav season adds extra direct flights.' },
        road: { available: false, service: 'No direct bus', duration: 'N/A', busFareInr: 0, notes: 'Rail or flight to Bhuj/Ahmedabad.' },
      },
      Mumbai: {
        train: { available: true, trainName: 'Kutch Express / Sayaji Nagari Express', duration: '15h 00m', sleeperInr: 450, ac3Inr: 1180, ac2Inr: 1690, notes: 'Kutch Express from Bandra Terminus arrives in Bhuj at 8:30 AM.' },
        flight: { available: true, route: 'BOM → BHJ nonstop', duration: '1h 20m', economyAvgInr: 3900, lastMileTransferInr: 1200, notes: 'Quick 80-minute Alliance/Air India hop.' },
        road: { available: true, service: 'GSRTC / Patel Overnight Volvo', duration: '14h 30m', busFareInr: 1350, notes: 'Direct luxury sleepers depart Borivali nightly.' },
      },
      Bengaluru: {
        train: { available: true, trainName: 'Pune–Bhuj Express', duration: '34h 00m', sleeperInr: 820, ac3Inr: 2150, ac2Inr: 3100, notes: 'Fly to Ahmedabad (AMD) + 5.5h Vande Metro/bus to Bhuj.' },
        flight: { available: true, route: 'BLR → AMD + Namo Bharat Rapid Rail to Bhuj', duration: '2h + 5h', economyAvgInr: 5900, lastMileTransferInr: 800, notes: 'Cheaper than flying directly into Bhuj.' },
        road: { available: false, service: 'No direct bus', duration: 'N/A', busFareInr: 0, notes: 'Fly via Ahmedabad or Mumbai.' },
      },
      Kolkata: {
        train: { available: true, trainName: 'Shalimar–Bhuj SF Express', duration: '38h 00m', sleeperInr: 880, ac3Inr: 2290, ac2Inr: 3320, notes: 'Weekly direct train.' },
        flight: { available: true, route: 'CCU → AMD or BOM → BHJ', duration: '5h 30m', economyAvgInr: 6800, lastMileTransferInr: 1200, notes: 'Morning connections via Mumbai work smoothly.' },
        road: { available: false, service: 'No direct bus', duration: 'N/A', busFareInr: 0, notes: 'Fly via Mumbai/Ahmedabad.' },
      },
    },
    hotelOptions: [
      {
        id: 'kc-bhunga',
        name: 'Hodka Shaam-e-Sarhad Village Bhungas',
        tier: 'backpacker',
        typeLabel: 'Traditional Kutchi Mud-Mirror Cottages',
        neighborhood: 'Hodka Village (15 km from White Rann)',
        pricePerNightInr: 1400,
        rating: '4.7/5',
        amenities: ['Hand-painted mud walls', 'Community-owned eco stay', 'Evening folk music'],
        bookingNote: 'Far more authentic and 70% cheaper than commercial luxury tent cities.',
        image: '/src/assets/images/dest_kutch_salt_1795006091019.jpg',
      },
      {
        id: 'kc-comfort',
        name: 'Bhuj Heritage & Dhordo Desert Resort',
        tier: 'comfort',
        typeLabel: 'Craft-Village Boutique Stay',
        neighborhood: 'Dhordo / Bhujodi',
        pricePerNightInr: 3800,
        rating: '4.7/5',
        amenities: ['En-suite heated tents/rooms', 'Guided artisan village tours', 'Kutchi thali'],
        bookingNote: 'Stay 1 night near Bhuj for palaces/crafts and 2 nights near Dhordo.',
        image: IMG_HAVELI,
      },
      {
        id: 'kc-luxury',
        name: 'Rann Utsav Luxury Tent City (Rajwadi)',
        tier: 'luxury',
        typeLabel: 'Full-Board Royal Desert Camp',
        neighborhood: 'Dhordo White Rann Gateway',
        pricePerNightInr: 15500,
        rating: '4.8/5',
        amenities: ['All-inclusive meals & desert shuttles', 'Cultural amphitheater', 'Full-moon Rann access'],
        bookingNote: 'Book 2–3 months in advance for full-moon dates (Sharad Purnima to Feb).',
        image: '/src/assets/images/dest_kutch_salt_1795006091019.jpg',
      },
    ],
    budgets: {
      backpacker: { stay: 1000, food: 500, localTransport: 450, activities: 250, total: 2200 },
      comfort: { stay: 3200, food: 950, localTransport: 950, activities: 500, total: 5600 },
      luxury: { stay: 11500, food: 2200, localTransport: 1800, activities: 1000, total: 16500 },
    },
    monthConditions: ['Peak', 'Peak', 'Pleasant', 'Caution', 'Caution', 'Caution', 'Caution', 'Caution', 'Caution', 'Pleasant', 'Peak', 'Peak'],
    highlights: [
      'Full-moon night walk across the glowing salt expanse at Dhordo',
      'Kalo Dungar (Black Hill) panorama over the Indo-Pak salt horizon',
      'Dholavira Indus Valley Civilization archaeological site via Road to Heaven',
      'Nirona Rogan art, Ajrakhpur block printing & Bhujodi weavers',
    ],
    localDishes: [
      { name: 'Kutchi Dabeli', description: 'Original Bhuj spiced potato bun with pomegranate seeds, roasted peanuts & tamarind chutney', typicalPriceInr: 35 },
      { name: 'Bajra Rotlo & Ringan Bharta', description: 'Smoky millet flatbread with roasted eggplant mash, white butter & garlic chutney', typicalPriceInr: 180 },
      { name: 'Khaman & Khaja Sweets', description: 'Steamed savory chickpea cakes and flaky local sweet squares', typicalPriceInr: 90 },
    ],
    dayByDay: [
      {
        day: 1,
        title: 'Bhuj Palaces & Craft Villages',
        morning: 'Tour Aina Mahal (Hall of Mirrors) and Prag Mahal clocktower in Bhuj.',
        afternoon: 'Visit Bhujodi weaving studios and Ajrakhpur natural indigo printing workshops.',
        evening: 'Drive 80 km north to Hodka or Dhordo desert camp.',
        estimatedSpendInr: 2900,
      },
      {
        day: 2,
        title: 'Kalo Dungar & White Rann Sunset',
        morning: 'Visit Nirona village to see 300-year-old Rogan castor-oil painting and copper bell makers.',
        afternoon: 'Climb Kalo Dungar (462m), Kutch’s highest point overlooking the infinite salt sea.',
        evening: 'Walk onto the White Rann salt flats for sunset and moonrise.',
        estimatedSpendInr: 3100,
      },
      {
        day: 3,
        title: 'Road to Heaven & Dholavira',
        morning: 'Drive the dramatic Khavda–Dholavira causeway flanked by turquoise-white salt water.',
        afternoon: 'Explore the 4,500-year-old Harappan reservoirs and citadel of Dholavira.',
        evening: 'Catch night Kutch Express train back from Bhuj.',
        estimatedSpendInr: 3400,
      },
    ],
    moneySavingTips: [
      'Stay in Bhuj or Hodka community Bhungas (₹1,400–₹2,400) rather than Tent City packages—you get the exact same White Rann access.',
      'Rent a scooter or share a Bolero cab from Bhuj with 3–4 travelers for Kalo Dungar and Dholavira.',
      'The Rann is flooded May–September; only visit November–February when the salt crust dries solid.',
    ],
    permitAndEntryNotes: 'White Rann Entry Permit (₹100 Indian / ₹500 foreigner) is required at Bhirandiyara checkpost; apply online via rannpermit.com with photo ID.',
  },
  {
    id: 'andaman',
    name: 'Havelock Island, Andaman',
    state: 'Andaman & Nicobar (UT)',
    region: 'South India',
    vibe: 'Backwaters & Coast',
    tagline: 'Powdery white sands, coral reefs & bioluminescent bays',
    summary:
      'Swaraj Dweep (Havelock Island) lies a two-hour catamaran ride off Port Blair—home to Asia’s acclaimed Radhanagar Beach, gentle lagoon snorkeling at Elephant Beach, and tranquil rainforest eco-lodges.',
    image: '/src/assets/images/dest_andaman_beach_1795006092539.jpg',
    imageCaption: 'Radhanagar Beach white sands and tropical forest edge, Havelock Island',
    gallery: [
      { url: '/src/assets/images/dest_andaman_beach_1795006092539.jpg', caption: 'Radhanagar Beach calm turquoise shoreline at dusk' },
      { url: IMG_KERALA_STAY, caption: 'Tropical timber eco-cottages tucked beneath coconut palms' },
      { url: '/src/assets/images/dest_goa_palolem_1795005091969.jpg', caption: 'Quiet island fishing boats at low tide' },
    ],
    idealDays: 5,
    bestMonthsLabel: 'Nov – Apr',
    avgTempPeak: '24°C – 30°C',
    nearestAirport: 'Veer Savarkar Intl, Port Blair (IXZ) + 90m Ferry',
    nearestRailhead: 'No rail (Air + Makruzz/Nautika high-speed ferry from Port Blair)',
    intercityFromHubsInr: { Delhi: 11800, Mumbai: 12200, Bengaluru: 8900, Kolkata: 8400 },
    transportByHub: {
      Delhi: {
        train: { available: false, trainName: 'Island territory — Air + Sea Ferry only', duration: 'N/A', sleeperInr: 0, ac3Inr: 0, ac2Inr: 0, notes: 'No railway bridge to Andaman; fly into Port Blair (IXZ).' },
        flight: { available: true, route: 'DEL → IXZ + Makruzz Ferry to Havelock', duration: '5h + 90m ferry', economyAvgInr: 10400, lastMileTransferInr: 1800, notes: 'Book ferry (Makruzz / Nautika ~₹1,500) aligned with morning arrival.' },
        road: { available: false, service: 'Island territory', duration: 'N/A', busFareInr: 0, notes: 'Air + ferry required.' },
      },
      Mumbai: {
        train: { available: false, trainName: 'Island territory — Air + Sea Ferry only', duration: 'N/A', sleeperInr: 0, ac3Inr: 0, ac2Inr: 0, notes: 'Fly to Port Blair via Chennai/Bengaluru.' },
        flight: { available: true, route: 'BOM → IXZ + Catamaran Ferry', duration: '5h + 90m ferry', economyAvgInr: 10900, lastMileTransferInr: 1800, notes: 'Land in Port Blair before 1:00 PM to catch same-day afternoon ferry.' },
        road: { available: false, service: 'Island territory', duration: 'N/A', busFareInr: 0, notes: 'Air + ferry required.' },
      },
      Bengaluru: {
        train: { available: false, trainName: 'Island territory — Air + Sea Ferry only', duration: 'N/A', sleeperInr: 0, ac3Inr: 0, ac2Inr: 0, notes: 'Nonstop flights from Bengaluru are among the cheapest.' },
        flight: { available: true, route: 'BLR → IXZ nonstop + Catamaran Ferry', duration: '2h 35m + 90m', economyAvgInr: 7600, lastMileTransferInr: 1600, notes: 'Frequent direct flights over the Bay of Bengal.' },
        road: { available: false, service: 'Island territory', duration: 'N/A', busFareInr: 0, notes: 'Air + ferry required.' },
      },
      Kolkata: {
        train: { available: false, trainName: 'Island territory — Air + Sea Ferry only', duration: 'N/A', sleeperInr: 0, ac3Inr: 0, ac2Inr: 0, notes: 'Kolkata has the shortest flights to Port Blair (~2h 15m).' },
        flight: { available: true, route: 'CCU → IXZ nonstop + Catamaran Ferry', duration: '2h 15m + 90m', economyAvgInr: 7200, lastMileTransferInr: 1600, notes: 'Cheapest mainland gateway to the Andaman Islands.' },
        road: { available: false, service: 'Island territory', duration: 'N/A', busFareInr: 0, notes: 'Air + ferry required.' },
      },
    },
    hotelOptions: [
      {
        id: 'an-hut',
        name: 'Govind Nagar Bamboo Eco Huts',
        tier: 'backpacker',
        typeLabel: 'Simple Island Garden Huts',
        neighborhood: 'Beach No. 2 / Govind Nagar',
        pricePerNightInr: 1200,
        rating: '4.5/5',
        amenities: ['Short walk to sunrise beach', 'Scooter hire', 'Dive center nearby'],
        bookingNote: 'AC rooms cost ~₹2,200; non-AC fan huts ₹1,000–₹1,400.',
        image: '/src/assets/images/dest_andaman_beach_1795006092539.jpg',
      },
      {
        id: 'an-resort',
        name: 'Barefoot Scuba & Vijaynagar Beach Villas',
        tier: 'comfort',
        typeLabel: 'Forest-to-Shore Eco Cottages',
        neighborhood: 'Vijaynagar Beach (No. 5)',
        pricePerNightInr: 4500,
        rating: '4.8/5',
        amenities: ['PADI dive school on-site', 'Shaded palm hammocks', 'Breakfast included'],
        bookingNote: 'Vijaynagar offers calm turquoise lagoons and sunrise views.',
        image: IMG_KERALA_STAY,
      },
      {
        id: 'an-luxury',
        name: 'Taj Exotica Resort & Spa, Andamans',
        tier: 'luxury',
        typeLabel: 'Rainforest Luxury Villas',
        neighborhood: 'Radhanagar Beach (No. 7)',
        pricePerNightInr: 22500,
        rating: '4.9/5',
        amenities: ['Private 46-acre rainforest reserve', 'Direct Radhanagar access', 'Zero single-use plastic'],
        bookingNote: 'One of India’s premier island eco-luxury estates.',
        image: '/src/assets/images/dest_andaman_beach_1795006092539.jpg',
      },
    ],
    budgets: {
      backpacker: { stay: 1100, food: 650, localTransport: 350, activities: 400, total: 2500 },
      comfort: { stay: 3900, food: 1300, localTransport: 600, activities: 900, total: 6700 },
      luxury: { stay: 15500, food: 3500, localTransport: 1500, activities: 2000, total: 22500 },
    },
    monthConditions: ['Peak', 'Peak', 'Peak', 'Pleasant', 'Caution', 'Caution', 'Caution', 'Caution', 'Caution', 'Pleasant', 'Peak', 'Peak'],
    highlights: [
      'Radhanagar Beach (No. 7) sunset swim framed by towering Dipterocarpus trees',
      'Discover Scuba Diving or reef snorkeling at Nemo Reef & Elephant Beach',
      'Sunrise stroll along Kalapathar Beach’s black-coral shoreline',
      'Cellular Jail light-and-sound history walk in Port Blair',
    ],
    localDishes: [
      { name: 'Grilled Reef Fish & Coconut Curry', description: 'Line-caught red snapper or barracuda seared with curry leaves and tamarind', typicalPriceInr: 420 },
      { name: 'Andaman Crab Masala & Rice', description: 'Sweet mangrove crab simmered with black pepper and coastal spices', typicalPriceInr: 550 },
      { name: 'Island Banana Flower & Veg Thali', description: 'Simple roadside dhaba meal along Havelock market road', typicalPriceInr: 180 },
    ],
    dayByDay: [
      {
        day: 1,
        title: 'Port Blair Ferry & Vijaynagar Shore',
        morning: 'Land at Port Blair and board the 90-minute high-speed catamaran to Havelock Island.',
        afternoon: 'Rent a scooter (₹500/day) and check into Vijaynagar beach.',
        evening: 'Fresh coastal dinner under palm lanterns.',
        estimatedSpendInr: 3600,
      },
      {
        day: 2,
        title: 'Nemo Reef Scuba & Radhanagar Sunset',
        morning: 'Morning beginner dive or snorkeling off Nemo Reef (clear 15m visibility Nov–Apr).',
        afternoon: 'Rest during midday tropical heat.',
        evening: 'Arrive at Radhanagar Beach at 4:00 PM for swimming and sunset.',
        estimatedSpendInr: 4200,
      },
      {
        day: 3,
        title: 'Kalapathar Dawn & Elephant Beach Trek',
        morning: 'Catch 5:30 AM sunrise at quiet Kalapathar Beach.',
        afternoon: 'Guided 45-min forest trek (or short boat) to Elephant Beach coral flats.',
        evening: 'Evening night-kayaking through bioluminescent mangroves (new moon weeks).',
        estimatedSpendInr: 3400,
      },
    ],
    moneySavingTips: [
      'Government DSS ferries between Port Blair and Havelock cost ₹550 vs ₹1,550 for private catamarans (book 3–4 days ahead at Port Blair Phoenix Bay).',
      'Mobile network is patchy outside main beaches; download offline maps and carry cash for scooters and small shacks.',
      'Avoid late May–September monsoon when rough seas cancel ferries and suspend water sports.',
    ],
    permitAndEntryNotes: 'No Restricted Area Permit needed for Indian or foreign visitors to Port Blair, Havelock, and Neil Island; passport/ID stamped on arrival.',
  },
  {
    id: 'amritsar',
    name: 'Amritsar',
    state: 'Punjab',
    region: 'Northwest India',
    vibe: 'Spiritual & Cultural',
    tagline: 'Gilded Harmandir Sahib sanctum, Wagah border dusk & tandoori dhaba alleys',
    summary:
      'Punjab’s spiritual and culinary heart revolves around the calm Amrit Sarovar pool surrounding the Golden Temple, Partition history at Town Hall, and century-old kulcha-tandoor lanes inside the Walled City.',
    image: '/src/assets/images/dest_amritsar_temple_1795007561938.jpg',
    imageCaption: 'Golden Temple (Harmandir Sahib) reflected on the Amrit Sarovar at sunrise, Amritsar',
    gallery: [
      { url: '/src/assets/images/dest_amritsar_temple_1795007561938.jpg', caption: 'Dawn reflection at Harmandir Sahib, Amritsar' },
      { url: IMG_HAVELI, caption: 'Restored brick courtyard heritage hotel near Hall Gate' },
      { url: IMG_RAIL, caption: 'Morning Shatabdi & Vande Bharat rail corridor from New Delhi' },
    ],
    idealDays: 3,
    bestMonthsLabel: 'Oct – Mar',
    avgTempPeak: '10°C – 24°C',
    nearestAirport: 'Sri Guru Ram Dass Jee Intl (ATQ · 11 km)',
    nearestRailhead: 'Amritsar Junction (ASR)',
    intercityFromHubsInr: { Delhi: 1200, Mumbai: 5600, Bengaluru: 6900, Kolkata: 6400 },
    transportByHub: {
      Delhi: {
        train: { available: true, trainName: 'Amritsar Shatabdi / Vande Bharat Express', duration: '5h 45m', sleeperInr: 295, ac3Inr: 790, ac2Inr: 1180, notes: 'Shatabdi & Vande Bharat Chair Car run ~₹1,150–₹1,350 with meals.' },
        flight: { available: true, route: 'DEL → ATQ nonstop', duration: '1h 10m', economyAvgInr: 3600, lastMileTransferInr: 450, notes: 'Fast, though Shatabdi rail from NDLS is often comparable door-to-door.' },
        road: { available: true, service: 'PRTC / Volvo AC via GT Road (NH44)', duration: '8h 00m', busFareInr: 950, notes: 'Frequent day and overnight AC coaches from Kashmiri Gate ISBT.' },
      },
      Mumbai: {
        train: { available: true, trainName: 'Paschim Express / Golden Temple Mail', duration: '28h 30m', sleeperInr: 720, ac3Inr: 1890, ac2Inr: 2720, notes: 'Classic overnight-plus-day trunk route through Kota and Delhi.' },
        flight: { available: true, route: 'BOM → ATQ nonstop', duration: '2h 40m', economyAvgInr: 5600, lastMileTransferInr: 450, notes: '3–4 daily nonstops avoid a long rail transit.' },
        road: { available: false, service: 'No direct bus', duration: 'N/A', busFareInr: 0, notes: 'Fly nonstop or take Rajdhani to Delhi + Shatabdi.' },
      },
      Bengaluru: {
        train: { available: false, trainName: 'No convenient fast rail (44h+)', duration: 'N/A', sleeperInr: 0, ac3Inr: 0, ac2Inr: 0, notes: 'Fly nonstop BLR → ATQ.' },
        flight: { available: true, route: 'BLR → ATQ nonstop', duration: '3h 15m', economyAvgInr: 6800, lastMileTransferInr: 450, notes: 'Direct flights operate daily.' },
        road: { available: false, service: 'No direct bus', duration: 'N/A', busFareInr: 0, notes: 'Fly to Amritsar.' },
      },
      Kolkata: {
        train: { available: true, trainName: 'Akal Takht / Amritsar Mail', duration: '29h 45m', sleeperInr: 710, ac3Inr: 1850, ac2Inr: 2680, notes: 'Direct rail link across the Gangetic plains.' },
        flight: { available: true, route: 'CCU → ATQ nonstop / 1-stop', duration: '2h 50m', economyAvgInr: 6300, lastMileTransferInr: 450, notes: 'Direct evening flights available several days weekly.' },
        road: { available: false, service: 'No direct bus', duration: 'N/A', busFareInr: 0, notes: 'Train or flight recommended.' },
      },
    },
    hotelOptions: [
      {
        id: 'atq-hostel',
        name: 'Guru Nanak Niwas & Walled City Backpackers',
        tier: 'backpacker',
        typeLabel: 'Temple-Quarter Hostel / Sarai',
        neighborhood: 'Heritage Street, Hall Bazaar',
        pricePerNightInr: 750,
        rating: '4.6/5',
        amenities: ['4-minute walk to Golden Temple', '24h hot water', 'Lockers & chai terrace'],
        bookingNote: 'Note: SGPC pilgrim sarais also offer clean rooms for ₹300–₹600 with advance online booking.',
        image: '/src/assets/images/dest_amritsar_temple_1795007561938.jpg',
      },
      {
        id: 'atq-boutique',
        name: 'Ranjit Heritage Haveli & Suites',
        tier: 'comfort',
        typeLabel: 'Boutique Punjabi Haveli',
        neighborhood: 'Ranjit Avenue / Near Town Hall',
        pricePerNightInr: 3200,
        rating: '4.7/5',
        amenities: ['Courtyard breakfast included', 'Quiet tree-lined avenue', 'Airport pickup desk'],
        bookingNote: 'Ranjit Avenue gives quiet evenings only 12 minutes by auto from the Old City.',
        image: IMG_HAVELI,
      },
      {
        id: 'atq-luxury',
        name: 'Taj Swarna, Amritsar',
        tier: 'luxury',
        typeLabel: 'Luxury Urban Retreat',
        neighborhood: 'Basant Avenue',
        pricePerNightInr: 11800,
        rating: '4.9/5',
        amenities: ['J Wellness Circle spa', 'Punjabi royal dining room', 'Private temple escort service'],
        bookingNote: 'Refined base 15 minutes from Harmandir Sahib with heated pool.',
        image: '/src/assets/images/dest_amritsar_temple_1795007561938.jpg',
      },
    ],
    budgets: {
      backpacker: { stay: 700, food: 400, localTransport: 200, activities: 250, total: 1550 },
      comfort: { stay: 2800, food: 950, localTransport: 450, activities: 450, total: 4650 },
      luxury: { stay: 10800, food: 2400, localTransport: 1200, activities: 1100, total: 15500 },
    },
    monthConditions: ['Peak', 'Peak', 'Peak', 'Pleasant', 'Caution', 'Caution', 'Caution', 'Caution', 'Pleasant', 'Peak', 'Peak', 'Peak'],
    highlights: [
      '4:30 AM Palki Sahib ceremony & free community Langar at Harmandir Sahib',
      'Partition Museum inside historic Town Hall & Jallianwala Bagh',
      'Attari–Wagah Border retreat ceremony at dusk (30 km west)',
      'Heritage Walled City breakfast crawl through Katra Jaimal Singh',
    ],
    localDishes: [
      { name: 'Amritsari Kulcha & Chole', description: 'Crisp tandoor-baked potato-paneer stuffed flatbread brushed with white butter', typicalPriceInr: 130 },
      { name: 'Kesar Malai Lassi (Kulhad)', description: 'Thick churned yogurt topped with clotted cream and saffron strands', typicalPriceInr: 90 },
      { name: 'Dal Makhani & Tandoori Paneer', description: 'Slow-simmered 24-hour black lentils at classic Lawrence Road dhabas', typicalPriceInr: 360 },
    ],
    dayByDay: [
      {
        day: 1,
        title: 'Harmandir Sahib, Sarovar & Langar',
        morning: 'Enter the Golden Temple marble parikrama at sunrise and visit the Akal Takht.',
        afternoon: 'Explore the Partition Museum and Jallianwala Bagh memorial nearby.',
        evening: 'Return to see the temple illuminated gold against night water, followed by Langar.',
        estimatedSpendInr: 1550,
      },
      {
        day: 2,
        title: 'Old City Culinary Trail & Attari–Wagah Border',
        morning: 'Walk Katra Ahluwalia bazaars and sample hot kulchas and jalebi.',
        afternoon: 'Visit Gobindgarh Fort museum and Maharaja Ranjit Singh Panorama.',
        evening: 'Arrive at Attari–Wagah Border by 3:45 PM for the sunset lowering-of-flags ceremony.',
        estimatedSpendInr: 2200,
      },
      {
        day: 3,
        title: 'Ram Bagh Gardens & Pul Kanjari',
        morning: 'Stroll the heritage summer palace at Ram Bagh.',
        afternoon: 'Shop hand-embroidered Phulkari textiles and juttis around Hall Bazaar.',
        evening: 'Catch an evening Shatabdi train or onward flight to Dharamshala.',
        estimatedSpendInr: 1650,
      },
    ],
    moneySavingTips: [
      'Take shared e-rickshaws (₹20/seat) along Heritage Street rather than private cabs inside congested old lanes.',
      'Shared tourist tempo travellers to Wagah Border depart Golden Temple Gate for ₹180–₹250 roundtrip vs ₹1,400 private taxi.',
      'Experience at least one community meal at the Golden Temple Langar—respectfully cover your head and remove shoes.',
    ],
    permitAndEntryNotes: 'Headscarf required inside Harmandir Sahib (complimentary scarves available at cloakrooms). Carry original photo ID for Attari–Wagah border gallery entry.',
  },
  {
    id: 'dharamshala',
    name: 'Dharamshala & McLeod Ganj',
    state: 'Himachal Pradesh',
    region: 'Northwest India',
    vibe: 'Mountains & Passes',
    tagline: 'Cedar pine ridges, Tibetan monasteries & Dhauladhar snow walls',
    summary:
      'Perched in Himachal Pradesh’s upper Kangra Valley beneath sheer 4,500m granite peaks, Dharamshala, McLeod Ganj, and upper Dharamkot pair Tibetan monastic culture with cedar-shaded trails, tea estates, and cozy wood-stove cafes.',
    image: '/src/assets/images/dest_himachal_dharamshala_1795007561814.jpg',
    imageCaption: 'McLeod Ganj cedar slopes beneath snow-capped Dhauladhar peaks, Himachal Pradesh',
    gallery: [
      { url: '/src/assets/images/dest_himachal_dharamshala_1795007561814.jpg', caption: 'Dhauladhar range towering above McLeod Ganj, Himachal Pradesh' },
      { url: IMG_KERALA_STAY, caption: 'Cedar and slate-roofed mountain guesthouse veranda in Dharamkot' },
      { url: IMG_RAIL, caption: 'Kangra Valley narrow-gauge & Pathankot foothills corridor' },
    ],
    idealDays: 4,
    bestMonthsLabel: 'Mar – Jun & Sep – Nov',
    avgTempPeak: '11°C – 24°C',
    nearestAirport: 'Kangra / Gaggal Airport (DHM · 15 km)',
    nearestRailhead: 'Pathankot Cantt (PTK · 85 km · 2.5h hill cab/bus)',
    intercityFromHubsInr: { Delhi: 1850, Mumbai: 6800, Bengaluru: 8200, Kolkata: 7600 },
    transportByHub: {
      Delhi: {
        train: { available: true, trainName: 'Jammu Mail / Uttar Sampark Kranti to Pathankot + Cab', duration: '8h 30m + 2.5h', sleeperInr: 420, ac3Inr: 1050, ac2Inr: 1490, notes: 'Add ₹350 for HRTC bus or ₹1,800 shared cab from Pathankot to McLeod Ganj.' },
        flight: { available: true, route: 'DEL → DHM (Gaggal) nonstop', duration: '1h 25m', economyAvgInr: 5200, lastMileTransferInr: 900, notes: 'Dramatic landing below Dhauladhar peaks; 35 min cab up to McLeod Ganj.' },
        road: { available: true, service: 'HRTC Himsuta Volvo Overnight (Majnu ka Tilla / ISBT)', duration: '10h 30m', busFareInr: 1350, notes: 'Most seamless direct option from Delhi straight to McLeod Ganj square.' },
      },
      Mumbai: {
        train: { available: true, trainName: 'Swaraj Express to Pathankot + Hill Bus', duration: '26h + 2.5h', sleeperInr: 790, ac3Inr: 1990, ac2Inr: 2850, notes: 'Direct rail to Pathankot Cantt on select days.' },
        flight: { available: true, route: 'BOM → DHM (via Delhi)', duration: '4h 30m', economyAvgInr: 7200, lastMileTransferInr: 900, notes: 'Or fly to Chandigarh/Amritsar and take a 5-hour hill bus.' },
        road: { available: false, service: 'No direct bus', duration: 'N/A', busFareInr: 0, notes: 'Fly via Delhi or train to Pathankot.' },
      },
      Bengaluru: {
        train: { available: false, trainName: 'No convenient fast rail', duration: 'N/A', sleeperInr: 0, ac3Inr: 0, ac2Inr: 0, notes: 'Fly to DHM via Delhi or ATQ/IXC.' },
        flight: { available: true, route: 'BLR → DHM (1-stop via DEL)', duration: '5h 30m', economyAvgInr: 8200, lastMileTransferInr: 900, notes: 'Check Chandigarh (IXC) flights too if Gaggal fares spike.' },
        road: { available: false, service: 'No direct bus', duration: 'N/A', busFareInr: 0, notes: 'Air + hill cab recommended.' },
      },
      Kolkata: {
        train: { available: true, trainName: 'Himgiri Express to Pathankot + Cab', duration: '31h + 2.5h', sleeperInr: 780, ac3Inr: 1980, ac2Inr: 2820, notes: 'Direct mountain-foothill rail link.' },
        flight: { available: true, route: 'CCU → DHM (via DEL)', duration: '5h 00m', economyAvgInr: 7800, lastMileTransferInr: 900, notes: 'Smooth morning connections via Delhi.' },
        road: { available: false, service: 'No direct bus', duration: 'N/A', busFareInr: 0, notes: 'Flight or train recommended.' },
      },
    },
    hotelOptions: [
      {
        id: 'hp-hostel',
        name: 'Upper Dharamkot Cedar Hostel',
        tier: 'backpacker',
        typeLabel: 'Mountain Pine Hostel',
        neighborhood: 'Upper Dharamkot',
        pricePerNightInr: 800,
        rating: '4.7/5',
        amenities: ['Dhauladhar ridge balcony', 'Wood-fired common room', 'Trailhead 2 min away'],
        bookingNote: 'Vehicle-free upper village ideal for hikers and remote workers.',
        image: '/src/assets/images/dest_himachal_dharamshala_1795007561814.jpg',
      },
      {
        id: 'hp-cottage',
        name: 'Norbu House & Kangra Slate Cottages',
        tier: 'comfort',
        typeLabel: 'Boutique Himalayan Lodge',
        neighborhood: 'Naddi / Bhagsu Ridge',
        pricePerNightInr: 3600,
        rating: '4.8/5',
        amenities: ['Sunlit valley veranda', 'Heated blankets & kettle', 'Local Kangri breakfast'],
        bookingNote: 'Naddi ridge gives uninterrupted sunset views over Kangra Valley.',
        image: IMG_KERALA_STAY,
      },
      {
        id: 'hp-luxury',
        name: 'Hyatt Regency Dharamshala Resort',
        tier: 'luxury',
        typeLabel: 'Deodar Forest Sanctuary',
        neighborhood: 'Dharamkot Forest Edge',
        pricePerNightInr: 15500,
        rating: '4.9/5',
        amenities: ['6-acre cedar estate', 'Heated indoor pool', 'Guided forest bath walks'],
        bookingNote: 'Quiet forest luxury tucked above the bustle of McLeod Ganj.',
        image: '/src/assets/images/dest_himachal_dharamshala_1795007561814.jpg',
      },
    ],
    budgets: {
      backpacker: { stay: 750, food: 450, localTransport: 200, activities: 200, total: 1600 },
      comfort: { stay: 3200, food: 950, localTransport: 450, activities: 500, total: 5100 },
      luxury: { stay: 12800, food: 2600, localTransport: 1200, activities: 1400, total: 18000 },
    },
    monthConditions: ['Caution', 'Pleasant', 'Peak', 'Peak', 'Peak', 'Peak', 'Caution', 'Caution', 'Peak', 'Peak', 'Peak', 'Pleasant'],
    highlights: [
      'Tsuglagkhang Complex (Dalai Lama Temple) & morning Kora forest path',
      'Day hike up to Triund Ridge (2,850m) facing the vertical Dhauladhar wall',
      'Norbulingka Institute Tibetan thangka & woodcraft workshops',
      'Palampur tea gardens & Masroor monolithic rock-cut temples',
    ],
    localDishes: [
      { name: 'Himachali Kangri Dham Platter', description: 'Festive platter of madra (yogurt chickpea curry), rajma & meetha chawal', typicalPriceInr: 280 },
      { name: 'Steamed Mutton / Veg Momos & Thukpa', description: 'Hand-folded Tibetan dumplings paired with warming noodle broth', typicalPriceInr: 160 },
      { name: 'Kangra First-Flush Orthodox Tea & Pie', description: 'Locally grown Himalayan black tea served at Dharamkot bakeries', typicalPriceInr: 220 },
    ],
    dayByDay: [
      {
        day: 1,
        title: 'Tsuglagkhang Kora & McLeod Ganj',
        morning: 'Walk the prayer-wheel Kora trail around Tsuglagkhang monastery complex.',
        afternoon: 'Visit the Tibet Museum and St. John in the Wilderness stone church.',
        evening: 'Sunset viewpoint at Naddi and thukpa dinner in Jogiwara Road.',
        estimatedSpendInr: 1800,
      },
      {
        day: 2,
        title: 'Triund Ridge Day Trek',
        morning: 'Start 7:00 AM from Gallu Devi temple along oak and rhododendron switchbacks (4h up).',
        afternoon: 'Lunch at Triund crest overlooking Kangra plains and snow glaciers.',
        evening: 'Descend before dusk for wood-oven pizza and rest in Dharamkot.',
        estimatedSpendInr: 1600,
      },
      {
        day: 3,
        title: 'Norbulingka & Palampur Tea Estates',
        morning: 'Tour the Norbulingka artisans workshops and Japanese-style gardens.',
        afternoon: 'Drive to Palampur Wah Tea Estate for a garden walk and tasting.',
        evening: 'Kangri Dham dinner back in Lower Dharamshala.',
        estimatedSpendInr: 2400,
      },
    ],
    moneySavingTips: [
      'Book HRTC Himsuta Volvo buses directly on hrtchp.com from Delhi ISBT (₹1,350) to save ₹4,000+ over Gaggal flights.',
      'Walk between McLeod Ganj, Bhagsu, and Dharamkot along scenic forest footpaths—cabs on narrow hill roads cost ₹350+ per hop.',
      'Carry refillable bottles and pack a fleece layer even in May—evenings drop quickly after sunset.',
    ],
    permitAndEntryNotes: 'No special permit required for Indian or foreign visitors around Dharamshala and Triund day hike; forest checkpost charges a small ₹50–₹200 trail conservation fee.',
  },
  {
    id: 'srinagar',
    name: 'Srinagar & Pahalgam',
    state: 'Jammu & Kashmir',
    region: 'Northwest India',
    vibe: 'Mountains & Passes',
    tagline: 'Glassy Dal Lake houseboats, Chinar gardens & saffron alpine valleys',
    summary:
      'Framed by the Zabarwan mountains, Kashmir’s summer capital floats on cedar-carved shikaras and heritage houseboats across Dal and Nigeen lakes, linking Mughal terraced gardens with emerald pine meadows in Pahalgam and Gulmarg.',
    image: '/src/assets/images/dest_kashmir_srinagar_1795007561372.jpg',
    imageCaption: 'Wooden shikara and heritage houseboats on Dal Lake, Srinagar, Jammu & Kashmir',
    gallery: [
      { url: '/src/assets/images/dest_kashmir_srinagar_1795007561372.jpg', caption: 'Golden hour shikara crossing past Nigeen & Dal Lake houseboats' },
      { url: IMG_KERALA_STAY, caption: 'Carved walnut-wood veranda of a traditional Kashmiri stay' },
      { url: '/src/assets/images/dest_himachal_dharamshala_1795007561814.jpg', caption: 'Lidder Valley and pine alpine meadows near Pahalgam' },
    ],
    idealDays: 5,
    bestMonthsLabel: 'Apr – Jun & Sep – Nov',
    avgTempPeak: '10°C – 26°C',
    nearestAirport: 'Sheikh ul-Alam Intl, Srinagar (SXR · 12 km)',
    nearestRailhead: 'Jammu Tawi (JAT) / Katra + NH44 Highway Cab',
    intercityFromHubsInr: { Delhi: 4800, Mumbai: 6900, Bengaluru: 8400, Kolkata: 7900 },
    transportByHub: {
      Delhi: {
        train: { available: true, trainName: 'Vande Bharat / Rajdhani to Jammu Tawi + Cab', duration: '6h + 6h mountain', sleeperInr: 490, ac3Inr: 1280, ac2Inr: 1850, notes: 'Overnight train to Jammu/Katra + shared Sumo/cab (₹900) through Banihal tunnel.' },
        flight: { available: true, route: 'DEL → SXR nonstop', duration: '1h 25m', economyAvgInr: 4600, lastMileTransferInr: 650, notes: '15+ daily flights; flying over the Pir Panjal range saves a full mountain travel day.' },
        road: { available: true, service: 'JKSRTC / Overnight Sleeper to Jammu + Shared Cab', duration: '16h total', busFareInr: 1650, notes: 'Weather-dependent along Ramban stretch during winter snow.' },
      },
      Mumbai: {
        train: { available: true, trainName: 'Swaraj / Vivek Express to Jammu + Cab', duration: '28h + 6h', sleeperInr: 860, ac3Inr: 2250, ac2Inr: 3150, notes: 'Very long overland journey; flying BOM → SXR is strongly preferred.' },
        flight: { available: true, route: 'BOM → SXR nonstop / 1-stop', duration: '2h 50m', economyAvgInr: 6800, lastMileTransferInr: 650, notes: 'Daily direct morning flights.' },
        road: { available: false, service: 'No direct bus', duration: 'N/A', busFareInr: 0, notes: 'Fly to Srinagar (SXR).' },
      },
      Bengaluru: {
        train: { available: false, trainName: 'No practical direct rail', duration: 'N/A', sleeperInr: 0, ac3Inr: 0, ac2Inr: 0, notes: 'Fly nonstop or 1-stop to Srinagar (SXR).' },
        flight: { available: true, route: 'BLR → SXR (nonstop / via DEL)', duration: '3h 30m', economyAvgInr: 8200, lastMileTransferInr: 650, notes: 'Book 4–6 weeks ahead for May–June peak tulip/summer weeks.' },
        road: { available: false, service: 'No direct bus', duration: 'N/A', busFareInr: 0, notes: 'Fly to SXR.' },
      },
      Kolkata: {
        train: { available: true, trainName: 'Himgiri / Jammu Tawi Express + Cab', duration: '35h + 6h', sleeperInr: 890, ac3Inr: 2290, ac2Inr: 3250, notes: 'Requires onward Jammu–Srinagar mountain transfer.' },
        flight: { available: true, route: 'CCU → SXR (via DEL)', duration: '5h 15m', economyAvgInr: 7600, lastMileTransferInr: 650, notes: 'Reliable daily 1-stop connections.' },
        road: { available: false, service: 'No direct bus', duration: 'N/A', busFareInr: 0, notes: 'Flight recommended.' },
      },
    },
    hotelOptions: [
      {
        id: 'jk-homestay',
        name: 'Zabarwan Orchard Homestay & Hostel',
        tier: 'backpacker',
        typeLabel: 'Local Kashmiri Guesthouse',
        neighborhood: 'Nishat / Boulevard Road',
        pricePerNightInr: 1100,
        rating: '4.6/5',
        amenities: ['Home-cooked wazwan options', 'Kahwa welcome tea', 'Garden walnut trees'],
        bookingNote: 'Stay in Nishat or Nigeen side for peaceful mornings away from main traffic.',
        image: '/src/assets/images/dest_kashmir_srinagar_1795007561372.jpg',
      },
      {
        id: 'jk-houseboat',
        name: 'Butt’s Clermont Heritage Cedar Houseboat',
        tier: 'comfort',
        typeLabel: 'Carved Deodar Lake Houseboat',
        neighborhood: 'Nigeen Lake',
        pricePerNightInr: 4200,
        rating: '4.8/5',
        amenities: ['Hand-carved walnut lounge', 'Complimentary shikara crossings', 'Breakfast & Kashmiri dinner'],
        bookingNote: 'Nigeen Lake houseboats are noticeably quieter and cleaner than bustling Dal Gate.',
        image: '/src/assets/images/dest_kashmir_srinagar_1795007561372.jpg',
      },
      {
        id: 'jk-palace',
        name: 'The LaLiT Grand Palace Srinagar',
        tier: 'luxury',
        typeLabel: '1910 Maharajah Palace Estate',
        neighborhood: 'Gupkar Road (above Dal Lake)',
        pricePerNightInr: 18500,
        rating: '4.9/5',
        amenities: ['Centuries-old Chinar lawns', 'Palace dining hall', 'Dal Lake panorama'],
        bookingNote: 'Former royal palace of Maharaja Pratap Singh overlooking the lake.',
        image: IMG_HAVELI,
      },
    ],
    budgets: {
      backpacker: { stay: 1000, food: 550, localTransport: 400, activities: 400, total: 2350 },
      comfort: { stay: 3800, food: 1200, localTransport: 850, activities: 850, total: 6700 },
      luxury: { stay: 15500, food: 3200, localTransport: 2000, activities: 1800, total: 22500 },
    },
    monthConditions: ['Caution', 'Caution', 'Pleasant', 'Peak', 'Peak', 'Peak', 'Pleasant', 'Pleasant', 'Peak', 'Peak', 'Pleasant', 'Caution'],
    highlights: [
      '5:30 AM floating vegetable market & sunset shikara ride on Dal & Nigeen lakes',
      'Mughal terraced gardens: Nishat Bagh, Shalimar Bagh & Chashme Shahi',
      'Day excursion to Pahalgam’s Lidder River & Betaab Valley (or Gulmarg Gondola)',
      'Old City wooden mosques: Jamia Masjid (370 deodar pillars) & Shah-e-Hamdan',
    ],
    localDishes: [
      { name: 'Kashmiri Rogan Josh & Yakhni Pulao', description: 'Slow-braised lamb or lotus stem in saffron, fennel & cardamom yogurt gravy', typicalPriceInr: 420 },
      { name: 'Saffron Kahwa & Sheermal', description: 'Green tea infused with Pampore saffron, crushed almonds & crisp sweet bread', typicalPriceInr: 120 },
      { name: 'Nadru (Lotus Stem) & Haak Saag', description: 'Crisp Kashmiri greens and spiced lotus stem eaten with steamed red rice', typicalPriceInr: 240 },
    ],
    dayByDay: [
      {
        day: 1,
        title: 'Nigeen Houseboat & Mughal Gardens',
        morning: 'Land in Srinagar, cross by cedar shikara to your Nigeen Lake houseboat.',
        afternoon: 'Tour Nishat Bagh and Shalimar Bagh terraced Chinar gardens.',
        evening: 'Golden hour shikara paddle across quiet back-canals with saffron kahwa.',
        estimatedSpendInr: 3200,
      },
      {
        day: 2,
        title: 'Floating Vegetable Market & Old City Heritage',
        morning: '5:30 AM dawn shikara boat to the floating flower and vegetable market.',
        afternoon: 'Visit Jamia Masjid, Khanqah-e-Moula, and Shankaracharya Hill viewpoint.',
        evening: 'Traditional Kashmiri dinner on the houseboat veranda.',
        estimatedSpendInr: 2600,
      },
      {
        day: 3,
        title: 'Pahalgam Lidder Valley & Saffron Fields',
        morning: 'Drive past Pampore saffron fields (bloom in Oct–Nov) to Pahalgam pine valleys.',
        afternoon: 'Walk alongside the glacial Lidder River to Aru or Betaab Valley.',
        evening: 'Return to Srinagar or overnight in a Pahalgam riverside cottage.',
        estimatedSpendInr: 3500,
      },
    ],
    moneySavingTips: [
      'Always agree on official Tourism Department shikara tariff cards (around ₹700/hour for the whole boat) before boarding.',
      'Prepaid SIM cards from outside J&K do not roam in Kashmir—buy a postpaid SIM or local Wi-Fi-enabled eSIM/hotel connection.',
      'Split day-trip cabs to Pahalgam or Gulmarg (₹2,800–₹3,400/car) with fellow houseboat guests.',
    ],
    permitAndEntryNotes: 'Postpaid SIM cards work nationwide in J&K (prepaid from other states do not). Keep photo ID handy at airport and valley checkposts.',
  },
];
