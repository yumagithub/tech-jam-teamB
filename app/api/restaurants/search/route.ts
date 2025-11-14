import { NextRequest, NextResponse } from 'next/server';
import { HotpepperClient, HotpepperApiError } from '@/lib/hotpepper/client';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  try {
    const client = new HotpepperClient();

    const results = await client.search({
      keyword: searchParams.get('keyword') || undefined,
      budget: searchParams.get('budget') || undefined,
      genre: searchParams.get('genre') || undefined,
      party_capacity: searchParams.get('party_capacity') || undefined,
      start: searchParams.get('start') || undefined,
      count: searchParams.get('count') || undefined,
    });

    return NextResponse.json(results);
  } catch (error) {
    console.error('Fetch error:', error);

    if (error instanceof HotpepperApiError) {
      return NextResponse.json(
        { message: error.message },
        { status: error.statusCode || 500 }
      );
    }

    return NextResponse.json(
      { message: 'Failed to fetch data from Hotpepper API' },
      { status: 500 }
    );
  }
}
