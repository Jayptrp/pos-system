import db from "@/lib/db";
import { NextResponse } from "next/server";
import { menuItemSchema } from "@/lib/validation";

export async function GET() {
  const menuItems = await db.menuItem.findMany({
    include: { category: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(menuItems);
}

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = menuItemSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(parsed.error.format(), { status: 400 });
  }

  const newItem = await db.menuItem.create({
    data: parsed.data,
  });
  return NextResponse.json(newItem, { status: 201 });
}
