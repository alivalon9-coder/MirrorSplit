// app/api/upload/route.ts
export async function POST(req: Request) {
  try {
    return new Response(JSON.stringify({ ok: true, msg: "test ok" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ ok: false, err: (err as any).message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
