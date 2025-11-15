import { NextRequest } from "next/server";
import db from "@/lib/db";
import { menuItemSchema } from "@/lib/validation";
import { success, failure } from "@/lib/apiResponse";
import { handlePrismaError } from "@/lib/errorHandler";
import { z } from "zod";

// GET one menu item
export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const param = await params;
  const id = Number(param.id);
  if (isNaN(id)) {
    return failure("INVALID_ID", "Invalid ID", 400);
  }

  try {
    const item = await db.menuItem.findUnique({
      where: { id },
      include: { category: true },
    });

    if (!item) {
      return failure("MENU_ITEM_NOT_FOUND", "Menu item not found", 404);
    }

    return success(item);
  } catch (error) {
    return handlePrismaError(error);
  }
}

// UPDATE (PATCH) menu item
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const param = await params;
  const id = Number(param.id);
  if (isNaN(id)) {
    return failure("INVALID_ID", "Invalid ID", 400);
  }

  try {
    const body = await req.json();
    const parsed = menuItemSchema.partial().safeParse(body);

    if (!parsed.success) {
      return failure("VALIDATION_ERROR", "Invalid input", 400, z.treeifyError(parsed.error));
    }

    const updated = await db.menuItem.update({
      where: { id },
      data: parsed.data,
    });

    return success(updated);
  } catch (error) {
    return handlePrismaError(error);
  }
}

// DELETE menu item
export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const param = await params;
  const id = Number(param.id);
  if (isNaN(id)) {
    return failure("INVALID_ID", "Invalid ID", 400);
  }

  try {
    await db.menuItem.delete({ where: { id } });
    return success({ id });
  } catch (error) {
    return handlePrismaError(error);
  }
}
