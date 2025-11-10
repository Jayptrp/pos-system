import { NextResponse } from "next/server";
import db from "@/lib/db";
import { menuItemSchema } from "@/lib/validation";

// GET all menu items
export async function GET() {
  try {
    const menuItems = await db.menuItem.findMany({
      include: { category: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(menuItems);
  } catch (error) {
    console.error("Error fetching menu items:", error);
    return NextResponse.json(
      { error: "Failed to fetch menu items" },
      { status: 500 }
    );
  }
}

// CREATE a menu item
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = menuItemSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(parsed.error.format(), { status: 400 });
    }

    const newItem = await db.menuItem.create({
      data: parsed.data,
    });

    return NextResponse.json(newItem, { status: 201 });
  } catch (error) {
    console.error("Error creating menu item:", error);
    return NextResponse.json(
      { error: "Failed to create menu item" },
      { status: 500 }
    );
  }
}
