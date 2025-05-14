import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // The API key is safely accessed from environment variables on the server
    const apiKey = process.env.EXCHANGE_RATE_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key is not configured' },
        { status: 500 }
      );
    }

    const response = await fetch(
      `https://v6.exchangerate-api.com/v6/${apiKey}/latest/USD`,
      { next: { revalidate: 3600 } } // Cache for 1 hour
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: `Exchange rate API error: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    if (data.result !== "success") {
      return NextResponse.json(
        { error: "Exchange rate API returned unsuccessful response" },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching exchange rates:", error);
    return NextResponse.json(
      { error: "Failed to fetch exchange rates" },
      { status: 500 }
    );
  }
}