import { NextRequest } from "next/server"

// Mock Hot Pepper shop lookup
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get("id")
  if (!id) {
    return new Response(JSON.stringify({ error: "id is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    })
  }

  // In production, call the real API here.
  return new Response(JSON.stringify({ id, name: `店舗 ${id}` }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  })
}
