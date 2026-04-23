import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST() {
  try {
    // Get unique visitor count
    const allVisitors = await prisma.visitor.findMany({ select: { ip: true } });
    const uniqueIPs = new Set(allVisitors.map(v => v.ip));
    const count = uniqueIPs.size + 1; // +1 for current visitor

    // Optional: you could read IP from headers here for real tracking
    await prisma.visitor.create({ data: { ip: "unknown", userAgent: "unknown" } });

    return NextResponse.json({ count });
  } catch {
    return NextResponse.json({ count: 0 }, { status: 500 });
  }
}
