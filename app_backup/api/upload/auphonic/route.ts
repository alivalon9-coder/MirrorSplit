// app/api/auphonic/route.ts
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const apiKey = process.env.AUPHONIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Missing AUPHONIC_API_KEY env variable" }, { status: 500 });
    }

    // مثال: نرسل طلب لإنشاء Production جديد (تعديل body حسب حاجتك)
    const body = await request.json();

    const res = await fetch("https://auphonic.com/api/productions.json", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.ok ? 200 : res.status });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || String(err) }, { status: 500 });
  }
}
