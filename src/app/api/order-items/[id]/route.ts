import db from "@/lib/db";
import { NextRequest } from "next/server";
import { orderItemSchema } from "@/lib/validation";
import { success, failure } from "@/lib/apiResponse";
import { handlePrismaError } from "@/lib/errorHandler";
import { z } from "zod";

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: rawId } = await params;
    const id = Number(rawId);

    if (isNaN(id)) {
      return failure("INVALID_ID", "ID must be a number", 400);
    }

    const item = await db.orderItem.findUnique({
      where: { id },
      include: { menuItem: true },
    });

    if (!item) {
      return failure("ORDER_ITEM_NOT_FOUND", "Order item not found", 404);
    }

    return success(item);
  } catch (error) {
    return handlePrismaError(error);
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: rawId } = await params;
    const id = Number(rawId);

    if (isNaN(id)) {
      return failure("INVALID_ID", "ID must be a number", 400);
    }

    const body = await req.json();
    const parsed = orderItemSchema.partial().safeParse(body);

    if (!parsed.success) {
      return failure("VALIDATION_ERROR", "Invalid input", 400, z.treeifyError(parsed.error));
    }

    const updated = await db.orderItem.update({
      where: { id },
      data: parsed.data,
    });

    return success(updated);
  } catch (error) {
    return handlePrismaError(error);
  }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: rawId } = await params;
    const id = Number(rawId);

    if (isNaN(id)) {
      return failure("INVALID_ID", "ID must be a number", 400);
    }

    await db.orderItem.delete({ where: { id } });
    return success({ id });
  } catch (error) {
    return handlePrismaError(error);
  }
}
