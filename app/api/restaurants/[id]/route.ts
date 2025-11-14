import { NextRequest, NextResponse } from "next/server";
import { HotpepperClient, HotpepperApiError } from "@/lib/hotpepper/client";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const client = new HotpepperClient();
    const results = await client.getById(id);

    return NextResponse.json(results);
  } catch (error) {
    console.error("Fetch error:", error);

    if (error instanceof HotpepperApiError) {
      return NextResponse.json(
        { message: error.message },
        { status: error.statusCode || 500 }
      );
    }

    return NextResponse.json(
      { message: "Failed to fetch data from Hotpepper API" },
      { status: 500 }
    );
  }
}
