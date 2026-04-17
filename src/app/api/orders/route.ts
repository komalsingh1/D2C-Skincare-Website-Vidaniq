/**
 * Orders API – backend route handler
 *
 * In server/Vercel mode these routes persist orders in memory (swap out for a
 * real DB like Prisma/Postgres in production).
 * On GitHub Pages (static export) these routes are excluded from the build;
 * the Zustand localStorage store acts as the client-side backend.
 */

import { NextRequest, NextResponse } from "next/server";
import { Order } from "@/lib/types";

// In-memory store – replace with a database in production
const ordersDB: Order[] = [];

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get("email");

  const results = email
    ? ordersDB.filter((o) => o.address.email === email)
    : ordersDB;

  return NextResponse.json({ orders: results, total: results.length });
}

export async function POST(request: NextRequest) {
  try {
    const order: Order = await request.json();

    // Basic validation
    if (!order.id || !order.items?.length || !order.address) {
      return NextResponse.json(
        { error: "Invalid order payload" },
        { status: 400 }
      );
    }

    // Check for duplicate
    const exists = ordersDB.find((o) => o.id === order.id);
    if (!exists) {
      ordersDB.push(order);
    }

    return NextResponse.json({ success: true, orderId: order.id }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }
}
