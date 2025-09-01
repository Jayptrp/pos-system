import db from "@/lib/db";
import { NextResponse } from "next/server";
import { paymentSchema } from "@/lib/validation";

export async function GET() {
  const payments = await db.payment.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(payments);
}

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = paymentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(parsed.error.format(), { status: 400 });
  }
  const payment = await db.payment.create({ data: parsed.data });
  return NextResponse.json(payment, { status: 201 });
}
