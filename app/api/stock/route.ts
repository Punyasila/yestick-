import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get('symbol');

  if (!symbol) {
    return NextResponse.json({ error: 'Symbol is required' }, { status: 400 });
  }

  try {
    const response = await fetch(`https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${process.env.FINNHUB_API_KEY}`);
    const data = await response.json();

    // 'c' is current price, 'dp' is daily percent change
    if (data.c && data.c > 0) {
      return NextResponse.json({ symbol, price: data.c, change: data.dp });
    } else {
      return NextResponse.json({ error: 'Symbol not found' }, { status: 404 });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch price' }, { status: 500 });
  }
}