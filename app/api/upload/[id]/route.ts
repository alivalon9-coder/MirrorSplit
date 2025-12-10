import { NextResponse } from "next/server";

export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params; // Next.js 16: params is a Promise
  return NextResponse.json({ ok: true, id }, { status: 200 });
}

export async function DELETE(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  try {
    console.log("Deleting upload id:", id);

    // TODO: Supabase delete logic:
    // import { createClient } from "@supabase/supabase-js";
    // const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
    // const { data: track } = await supabase.from("uploads").select("fileName").eq("id", id).single();
    // if (track?.fileName) await supabase.storage.from("uploads").remove([track.fileName]);
    // const { error } = await supabase.from("uploads").delete().eq("id", id);
    // if (error) return NextResponse.json({ error: "Failed to delete", details: error }, { status: 500 });

    return NextResponse.json({ success: true, id }, { status: 200 });
  } catch (err) {
    console.error("DELETE /api/uploads error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}