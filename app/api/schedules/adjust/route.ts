import { NextResponse } from 'next/server';

// --- Type Definitions ---

// Frontend Request
interface ScheduleRequest {
  scheduleData: { [key: string]: string }[];
  priorityUsers: string[];
}

// Availability Calculation
interface AvailabilityDetails {
  available: string[];
  maybe: string[];
  unavailable: string[];
}

interface DateAvailability extends AvailabilityDetails {
  date: string;
  score: number;
}

// Hot Pepper API Response (Shop Object)
interface HotPepperShop {
  id: string;
  name: string;
  urls: { pc: string; };
  photo: { pc: { l: string; }; };
  budget: { name: string; };
  genre: { name: string; };
  catch: string;
  address: string;
  party_capacity: number; // Note: API returns string, but we might use number
}

// Result for each genre fetch
interface GenreFetchResult {
  genreName: string;
  genreCode: string;
  restaurants: HotPepperShop[];
}


// --- Core Logic ---

// 1. Transform raw CSV data
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

// 2. Score each date
function scoreDates(schedule: Map<string, AvailabilityDetails>, priorityUsers: string[]): DateAvailability[] {
  const scoredDates: DateAvailability[] = [];
  schedule.forEach((details, date) => {
    let score = 0;
    const priorityUsersAvailable = priorityUsers.every(user => details.available.includes(user));
    if (priorityUsers.length > 0 && priorityUsersAvailable) {
      score += 1000;
    }
    score += details.available.length;
    score -= details.unavailable.length * 0.1;
    scoredDates.push({ date, ...details, score });
  });
  return scoredDates.sort((a, b) => b.score - a.score);
}

// 3. Fetch restaurant recommendations by genre
const TARGET_GENRES = [
    { code: 'G001', name: '居酒屋' },
    { code: 'G007', name: '中華' },
    { code: 'G006', name: 'イタリアン・フレンチ' },
    { code: 'G008', name: '焼肉・ホルモン' },
    { code: 'G004', name: '和食' },
    { code: 'G005', name: '洋食' },
];

async function fetchRestaurantsByGenre(attendeeCount: number): Promise<GenreFetchResult[]> {
  if (attendeeCount === 0) return [];
  
  const apiKey = process.env.HOTPEPPER_API_KEY;
  if (!apiKey) {
    console.error('API key is not configured');
    return [];
  }

  const genrePromises = TARGET_GENRES.map(genre => {
    const params = new URLSearchParams({
      key: apiKey,
      format: 'json',
      count: '6',
      party_capacity: attendeeCount.toString(),
      keyword: '沖縄県那覇市',
      genre: genre.code,
    });
    return fetch(`http://webservice.recruit.co.jp/hotpepper/gourmet/v1/?${params}`)
      .then(res => {
        if (!res.ok) throw new Error(`Failed to fetch genre ${genre.name}`);
        return res.json();
      })
      .then(data => ({
        genreName: genre.name,
        genreCode: genre.code,
        restaurants: data.results.shop || []
      } as GenreFetchResult));
  });

  const results = await Promise.allSettled(genrePromises);

  return results
    .filter((result): result is PromiseFulfilledResult<GenreFetchResult> => 
        result.status === 'fulfilled' && result.value.restaurants.length > 0
    )
    .map(result => result.value);
}


// --- API Route Handler ---

export async function POST(request: Request) {
  try {
    const body: ScheduleRequest = await request.json();
    const { scheduleData, priorityUsers } = body;

    if (!scheduleData || !Array.isArray(scheduleData)) {
      return NextResponse.json({ error: 'Invalid schedule data' }, { status: 400 });
    }

    const transformed = transformSchedule(scheduleData);
    const rankedDates = scoreDates(transformed, priorityUsers);

    if (rankedDates.length === 0) {
      return NextResponse.json({ error: 'No valid dates found to process' }, { status: 400 });
    }

    const topOption = rankedDates[0];
    const otherOptions = rankedDates.slice(1, 4);

    const restaurantsByGenre = await fetchRestaurantsByGenre(topOption.available.length);

    let suggestionText = `参加人数が最も多い${topOption.date}がおすすめです。`;
    if (priorityUsers.length > 0 && priorityUsers.every(u => topOption.available.includes(u))) {
        suggestionText = `${priorityUsers.join('さん, ')}さんが参加可能で、最も人数が多い${topOption.date}がおすすめです。`;
    }

    const response = {
      topRecommendation: {
        ...topOption,
        suggestionText,
        restaurantsByGenre,
      },
      otherOptions,
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('API Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
