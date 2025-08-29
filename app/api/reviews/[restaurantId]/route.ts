import { NextResponse } from "next/server";
import sql from "@/lib/db";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ restaurantId: string }> }
) {
  const { restaurantId } = await params;

  if (!restaurantId) {
    return NextResponse.json(
      { message: "Restaurant ID is required" },
      { status: 400 }
    );
  }

  try {
    const reviews = await sql`
      SELECT id, title, reviewer_name, is_gourmet_meister, body, created_at
      FROM reviews
      WHERE restaurant_id = ${restaurantId}
      ORDER BY created_at DESC;
    `;

    return NextResponse.json(reviews);
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
