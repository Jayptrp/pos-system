import db from "@/lib/db";
import { NextResponse } from "next/server";
import { orderItemSchema } from "@/lib/validation";

export async function GET() {
  const items = await db.orderItem.findMany({ orderBy: { id: "desc" } });
  return NextResponse.json(items);
}

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = orderItemSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(parsed.error.format(), { status: 400 });
  }
  const item = await db.orderItem.create({ data: parsed.data });
  return NextResponse.json(item, { status: 201 });
}
