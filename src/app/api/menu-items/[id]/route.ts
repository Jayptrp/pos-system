import db from "@/lib/db";
import { NextResponse } from "next/server";
import { menuItemSchema } from "@/lib/validation";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const item = await db.menuItem.findUnique({
    where: { id: Number(params.id) },
    include: { category: true },
  });
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(item);
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json();
  const parsed = menuItemSchema.partial().safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(parsed.error.format(), { status: 400 });
  }
  const updated = await db.menuItem.update({
    where: { id: Number(params.id) },
    data: parsed.data,
  });
  return NextResponse.json(updated);
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  await db.menuItem.delete({ where: { id: Number(params.id) } });
  return NextResponse.json({}, { status: 204 });
}
