import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const fallbackIP =
      process.env.NODE_ENV === "development" ? "8.8.8.8" : "127.0.0.1";
    const rawIp =
      req.headers.get("x-forwarded-for")?.split(",")[0] ||
      req.headers.get("x-real-ip") ||
      fallbackIP;

    const ip = ["127.0.0.1", "::1"].includes(rawIp) ? "8.8.8.8" : rawIp;

    const response = await fetch(
      `http://ip-api.com/json/${ip}?fields=8413187`,
      {
        headers: {
          "User-Agent": "Payne App/1.0",
        },
        cache: "no-store",
      }
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: `Geo API error: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching geolocation data:", error);
    return NextResponse.json(
      { error: "Failed to fetch geolocation data" },
      { status: 500 }
    );
  }
}
