import { NextRequest } from "next/server";
import db from "@/lib/db";
import { menuItemSchema } from "@/lib/validation";
import { success, failure } from "@/lib/apiResponse";
import { handlePrismaError } from "@/lib/errorHandler";
import { z } from "zod";

// GET all menu items
export async function GET() {
  try {
    const menuItems = await db.menuItem.findMany({
      include: { category: true },
      orderBy: { createdAt: "desc" },
    });

    return success(menuItems);
  } catch (error) {
    return handlePrismaError(error);
  }
}

// CREATE a menu item
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = menuItemSchema.safeParse(body);

    if (!parsed.success) {
      return failure("VALIDATION_ERROR", "Invalid input", 400, z.treeifyError(parsed.error));
    }

    const newItem = await db.menuItem.create({
      data: parsed.data,
    });

    return success(newItem);
  } catch (error) {
    return handlePrismaError(error);
  }
}
