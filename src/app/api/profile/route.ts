/**
 * User Profile API – backend route handler
 *
 * In server/Vercel mode these routes persist profiles in memory (swap out for
 * a real DB in production). On GitHub Pages (static export) these routes are
 * excluded from the build; the Zustand localStorage store acts as the
 * client-side backend.
 */

import { NextRequest, NextResponse } from "next/server";
import { UserProfile } from "@/lib/types";

// In-memory store – replace with a database in production
const profilesDB: Map<string, UserProfile> = new Map();

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get("email");

  if (!email) {
    return NextResponse.json({ error: "email query param required" }, { status: 400 });
  }

  const profile = profilesDB.get(email);
  if (!profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  return NextResponse.json({ profile });
}

export async function PUT(request: NextRequest) {
  try {
    const body: Partial<UserProfile> = await request.json();

    if (!body.email) {
      return NextResponse.json({ error: "email is required" }, { status: 400 });
    }

    const existing = profilesDB.get(body.email) || {
      name: "",
      email: body.email,
      phone: "",
      addresses: [],
    };

    const updated: UserProfile = { ...existing, ...body };
    profilesDB.set(body.email, updated);

    return NextResponse.json({ success: true, profile: updated });
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const profile: UserProfile = await request.json();

    if (!profile.email) {
      return NextResponse.json({ error: "email is required" }, { status: 400 });
    }

    profilesDB.set(profile.email, profile);
    return NextResponse.json({ success: true, profile }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }
}
