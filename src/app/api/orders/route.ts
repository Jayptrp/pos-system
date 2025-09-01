import db from "@/lib/db";
import { NextResponse } from "next/server";
import { orderSchema } from "@/lib/validation";

export async function GET() {
  const orders = await db.order.findMany({
    include: { orderItems: true, payments: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(orders);
}

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = orderSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(parsed.error.format(), { status: 400 });
  }
  const order = await db.order.create({ data: parsed.data });
  return NextResponse.json(order, { status: 201 });
}
