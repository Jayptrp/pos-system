import db from "@/lib/db";
import { NextResponse } from "next/server";
import { inventoryLogSchema } from "@/lib/validation";

export async function GET() {
  const logs = await db.inventoryLog.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(logs);
}

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = inventoryLogSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(parsed.error.format(), { status: 400 });
  }
  const log = await db.inventoryLog.create({ data: parsed.data });
  return NextResponse.json(log, { status: 201 });
}
