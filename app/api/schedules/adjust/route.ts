import { NextResponse } from 'next/server';

// Define input data structure from the frontend
interface ScheduleRequest {
  scheduleData: { [key: string]: string }[];
  priorityUsers: string[];
}

// Define the structure for a single date's availability
interface DateAvailability {
  date: string;
  available: string[];
  maybe: string[];
  unavailable: string[];
  score: number;
}

interface AvailabilityDetails {
  available: string[];
  maybe: string[];
  unavailable: string[];
}

// --- Core Logic ---

// 1. Transform raw CSV data into a structured format by date
function transformSchedule(rawData: { [key: string]: string }[]): Map<string, AvailabilityDetails> {
  const scheduleByDate = new Map<string, AvailabilityDetails>();

  rawData.forEach(row => {
    const name = row['名前'];
    if (!name) return;

    Object.keys(row).forEach(key => {
      if (key !== '名前') {
        const date = key;
        const status = row[key];

        if (!scheduleByDate.has(date)) {
          scheduleByDate.set(date, { available: [], maybe: [], unavailable: [] });
        }

        const current = scheduleByDate.get(date)!;
        if (status === '○' || status === '◯') current.available.push(name);
        else if (status === '△') current.maybe.push(name);
        else if (status === '×') current.unavailable.push(name);
      }
    });
  });

  return scheduleByDate;
}

// 2. Score each date based on the priority logic
function scoreDates(schedule: Map<string, AvailabilityDetails>, priorityUsers: string[]): DateAvailability[] {
  const scoredDates: DateAvailability[] = [];

  schedule.forEach((details, date) => {
    let score = 0;

    // Priority 1: High bonus if all priority users are available
    const priorityUsersAvailable = priorityUsers.every(user => details.available.includes(user));
    if (priorityUsers.length > 0 && priorityUsersAvailable) {
      score += 1000;
    }

    // Priority 2: Add score based on number of available people
    score += details.available.length;

    // Priority 3: Subtract a small amount for unavailable people
    score -= details.unavailable.length * 0.1;

    scoredDates.push({ date, ...details, score });
  });

  // Sort by score, descending
  return scoredDates.sort((a, b) => b.score - a.score);
}

// 3. Fetch restaurant recommendations from Hot Pepper API
async function fetchRestaurants(attendeeCount: number) {
  if (attendeeCount === 0) return [];
  try {
    const apiKey = process.env.HOTPEPPER_API_KEY;
    if (!apiKey) throw new Error('API key is not configured');

    // Construct search URL (example: search for Izakaya in Tokyo with required capacity)
    const params = new URLSearchParams({
      key: apiKey,
      format: 'json',
      count: '5', // Get 5 recommendations
      person_num: attendeeCount.toString(),
      keyword: '沖縄県那覇市',
      genre: 'G001', // Example: Izakaya genre
    });
    const response = await fetch(`http://webservice.recruit.co.jp/hotpepper/gourmet/v1/?${params}`);
    
    if (!response.ok) throw new Error('Failed to fetch from Hot Pepper API');

    const data = await response.json();
    return data.results.shop || [];

  } catch (error) {
    console.error('Restaurant fetch error:', error);
    return []; // Return empty array on error, so it doesn't break the whole flow
  }
}

// --- API Route Handler ---

export async function POST(request: Request) {
  try {
    const body: ScheduleRequest = await request.json();
    const { scheduleData, priorityUsers } = body;

    if (!scheduleData || !Array.isArray(scheduleData)) {
      return NextResponse.json({ error: 'Invalid schedule data' }, { status: 400 });
    }

    // Execute the logic pipeline
    const transformed = transformSchedule(scheduleData);
    const rankedDates = scoreDates(transformed, priorityUsers);

    if (rankedDates.length === 0) {
      return NextResponse.json({ error: 'No valid dates found to process' }, { status: 400 });
    }

    const topOption = rankedDates[0];
    const otherOptions = rankedDates.slice(1, 4); // Return up to 3 other options

    // Fetch restaurants for the top option
    const restaurants = await fetchRestaurants(topOption.available.length);

    // Generate suggestion text
    let suggestionText = `参加人数が最も多い${topOption.date}がおすすめです。`;
    if (priorityUsers.length > 0 && priorityUsers.every(u => topOption.available.includes(u))) {
        suggestionText = `${priorityUsers.join('さん, ')}さんが参加可能で、最も人数が多い${topOption.date}がおすすめです。`;
    }

    // Construct the final rich response
    const response = {
      topRecommendation: {
        ...topOption,
        suggestionText,
        restaurants,
      },
      otherOptions,
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
