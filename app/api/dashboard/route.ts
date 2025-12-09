import { NextResponse } from 'next/server';

export async function GET() {
  // Sample mock stats returned by the API
  const stats = [
    { id: 'st1', label: 'Total Sales', value: 128 },
    { id: 'st2', label: 'Active Streams', value: 5421 },
    { id: 'st3', label: 'Instrumentals Live', value: 24 },
  ];

  return NextResponse.json({ stats });
}
