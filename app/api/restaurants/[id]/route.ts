import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  // const { id } = params;

  if (!id) {
    return NextResponse.json(
      { message: "Restaurant ID is required" },
      { status: 400 }
    );
  }

  const HOTPEPPER_API_KEY = process.env.HOTPEPPER_API_KEY;

  if (!HOTPEPPER_API_KEY) {
    return NextResponse.json(
      { message: "API key is not configured" },
      { status: 500 }
    );
  }
  const apiUrl = `https://webservice.recruit.co.jp/hotpepper/gourmet/v1/?key=${HOTPEPPER_API_KEY}&id=${id}&format=json`;

  try {
    const response = await fetch(apiUrl, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data.results);
  } catch (error) {
    console.error("Fetch error:", error);
    return NextResponse.json(
      { message: "Failed to fetch data from Hotpepper API" },
      { status: 500 }
    );
  }
}
