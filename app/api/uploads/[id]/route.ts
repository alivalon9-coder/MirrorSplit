import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

function getClient() {
  if (!supabaseUrl || !supabaseKey) return null;
  return createClient(supabaseUrl, supabaseKey, { auth: { persistSession: false } });
}

export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const client = getClient();

  if (!client) {
    return NextResponse.json(
      { error: "Supabase environment not configured" },
      { status: 500 }
    );
  }

  try {
    const { data, error } = await client
      .from("uploads")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("GET upload by id error:", error);
      return NextResponse.json(
        { error: "Upload not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ item: data }, { status: 200 });
  } catch (err) {
    console.error("GET /api/uploads/[id] error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const client = getClient();

  if (!client) {
    return NextResponse.json(
      { error: "Supabase environment not configured" },
      { status: 500 }
    );
  }

  try {
    const body = await req.json().catch(() => ({} as any));
    const update: Record<string, any> = {};

    if (typeof body.title === "string") update.title = body.title;
    if (typeof body.artist === "string") update.artist = body.artist;
    if (typeof body.price === "string") update.price = body.price;

    if (Object.keys(update).length === 0) {
      return NextResponse.json(
        { error: "No valid fields to update" },
        { status: 400 }
      );
    }

    const { data, error } = await client
      .from("uploads")
      .update(update)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("PATCH upload error:", error);
      return NextResponse.json(
        { error: "Failed to update upload" },
        { status: 500 }
      );
    }

    return NextResponse.json({ item: data }, { status: 200 });
  } catch (err) {
    console.error("PATCH /api/uploads/[id] error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const client = getClient();

  if (!client) {
    return NextResponse.json(
      { error: "Supabase environment not configured" },
      { status: 500 }
    );
  }

  try {
    // Get fileName first so we can delete from storage
    const { data: track, error: fetchError } = await client
      .from("uploads")
      .select("fileName")
      .eq("id", id)
      .single();

    if (fetchError) {
      console.error("Fetch track error:", fetchError);
    }

    if (track?.fileName) {
      const { error: storageError } = await client.storage
        .from("uploads")
        .remove([track.fileName]);

      if (storageError) {
        console.error("Storage delete error:", storageError);
      }
    }

    const { error: dbError } = await client
      .from("uploads")
      .delete()
      .eq("id", id);

    if (dbError) {
      console.error("DB delete error:", dbError);
      return NextResponse.json(
        { error: "Failed to delete track" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, id }, { status: 200 });
  } catch (err) {
    console.error("DELETE /api/uploads error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}