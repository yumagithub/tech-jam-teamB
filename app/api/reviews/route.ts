
import { NextResponse } from 'next/server';
import sql from '@/lib/db'; // Assuming db connection setup is in lib/db.ts

export async function POST(request: Request) {
  try {
    const { restaurantId, title, review, reviewerName, isGourmetMeister } = await request.json();

    // Basic validation
    if (!restaurantId || !title || !review || !reviewerName) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    // Insert the review into the database
    const result = await sql`
      INSERT INTO reviews (restaurant_id, title, reviewer_name, is_gourmet_meister, body)
      VALUES (${restaurantId}, ${title}, ${reviewerName}, ${isGourmetMeister}, ${review})
      RETURNING id;
    `;

    return NextResponse.json({ message: 'Review created successfully', reviewId: result[0].id }, { status: 201 });

  } catch (error) {
    console.error('Error creating review:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
