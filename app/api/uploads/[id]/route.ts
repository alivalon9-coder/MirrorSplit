import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

function fromDbRow(row: any) {
  return {
    id: row.id,
    title: row.title ?? "",
    artist: row.artist ?? "",
    price: row.price ?? "",
    section: row.section ?? "unknown",
    fileName: row.file_path ?? row.file_name ?? row.filename ?? row.fileName ?? null,
    url: row.url ?? null,
    createdAt: row.created_at ?? row.createdat ?? row.createdAt ?? new Date().toISOString(),
  };
}

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

    return NextResponse.json({ item: fromDbRow(data) }, { status: 200 });
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
    if (typeof body.price === "string") {
      const cleaned = body.price.trim();
      if (!cleaned) {
        update.price = null;
      } else {
        const num = Number(cleaned.replace(/[^0-9.]/g, ""));
        update.price = Number.isFinite(num) ? num : null;
      }
    }

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

    return NextResponse.json({ item: data ? fromDbRow(data) : null }, { status: 200 });
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
      .select("filename")
      .eq("id", id)
      .single();

    if (fetchError) {
      console.error("Fetch track error:", fetchError);
    }

    const fileKey = track?.filename;
    if (fileKey) {
      const { error: storageError } = await client.storage
        .from("uploads")
        .remove([fileKey]);

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