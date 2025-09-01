import db from "@/lib/db";
import { NextResponse } from "next/server";
import { orderSchema } from "@/lib/validation";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const order = await db.order.findUnique({
    where: { id: Number(params.id) },
    include: { orderItems: true, payments: true },
  });
  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(order);
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json();
  const parsed = orderSchema.partial().safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(parsed.error.format(), { status: 400 });
  }
  const updated = await db.order.update({
    where: { id: Number(params.id) },
    data: parsed.data,
  });
  return NextResponse.json(updated);
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  await db.order.delete({ where: { id: Number(params.id) } });
  return NextResponse.json({}, { status: 204 });
}
