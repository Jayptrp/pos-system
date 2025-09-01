import db from "@/lib/db";
import { NextResponse } from "next/server";
import { inventoryLogSchema } from "@/lib/validation";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const log = await db.inventoryLog.findUnique({ where: { id: Number(params.id) } });
  if (!log) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(log);
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json();
  const parsed = inventoryLogSchema.partial().safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(parsed.error.format(), { status: 400 });
  }
  const updated = await db.inventoryLog.update({
    where: { id: Number(params.id) },
    data: parsed.data,
  });
  return NextResponse.json(updated);
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  await db.inventoryLog.delete({ where: { id: Number(params.id) } });
  return NextResponse.json({}, { status: 204 });
}
