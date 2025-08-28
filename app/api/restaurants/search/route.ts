
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const keyword = searchParams.get('keyword') || '';
  const budget = searchParams.get('budget');
  const genre = searchParams.get('genre');
  const party_capacity = searchParams.get('party_capacity');

  const HOTPEPPER_API_KEY = process.env.HOTPEPPER_API_KEY;

  if (!HOTPEPPER_API_KEY) {
    return NextResponse.json({ message: 'API key is not configured' }, { status: 500 });
  }
  const LARGE_AREA = 'Z098'; // Naha

  let apiUrl = `https://webservice.recruit.co.jp/hotpepper/gourmet/v1/?key=${HOTPEPPER_API_KEY}&large_area=${LARGE_AREA}&format=json`;

  if (keyword) {
    apiUrl += `&keyword=${encodeURIComponent(keyword)}`;
  }
  if (budget) {
    apiUrl += `&budget=${budget}`;
  }
  if (genre) {
    apiUrl += `&genre=${genre}`;
  }
  if (party_capacity) {
    apiUrl += `&party_capacity=${party_capacity}`;
  }

  try {
    const response = await fetch(apiUrl, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data.results);
  } catch (error) {
    console.error('Fetch error:', error);
    return NextResponse.json({ message: 'Failed to fetch data from Hotpepper API' }, { status: 500 });
  }
}
