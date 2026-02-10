import { NextResponse } from 'next/server';

const QIMEN_API_KEY = process.env.QIMEN_API_KEY || '';
const QIMEN_API_URL = process.env.QIMEN_API_URL || 'https://api.yuanfenju.com/index.php/v1/Liupan/qimendunjia';

export async function POST(request: Request) {
  try {
    // Parse the incoming form data
    const text = await request.text();
    const params = new URLSearchParams(text);

    // Set API key server-side (overwriting any client-provided key)
    params.set('api_key', QIMEN_API_KEY);

    const response = await fetch(QIMEN_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      body: params
    });

    if (!response.ok) {
         const errorText = await response.text();
         return NextResponse.json({ error: `Qimen API error: ${response.status}`, details: errorText }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Qimen API error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
