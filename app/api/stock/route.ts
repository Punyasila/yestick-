import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get('symbol');

  if (!symbol) {
    return NextResponse.json({ error: 'Symbol is required' }, { status: 400 });
  }

  try {
    const response = await fetch(`https://finnhub.io/api/v1/quote?symbol=${symbol}&token=dae4ad1r01ql3jf8p2n0dae4ad1r01ql3jf8p2ng`);
    const data = await response.json();

    if (data.c && data.c > 0) {
      // 'c' is current price, 'd' is change, 'dp' is percent change
      return NextResponse.json({ symbol, price: data.c, change: data.d, changePercent: data.dp });
    } else {
      return NextResponse.json({ error: 'Symbol not found' }, { status: 404 });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch price' }, { status: 500 });
  }
}