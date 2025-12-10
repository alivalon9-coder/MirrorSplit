import { NextResponse } from 'next/server';

export async function GET() {
  // Return real numbers provided by the user
  const stats = [
    { id: 'st1', label: 'Total Sales', value: 12 },
    { id: 'st2', label: 'Music Active', value: 8 },
    { id: 'st3', label: 'Instrumentals Active', value: 0 },
    { id: 'st4', label: 'Streams Active', value: 0 },
  ];

  return NextResponse.json({ stats });
}
