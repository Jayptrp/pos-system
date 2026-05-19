import db from "@/lib/db";
import { NextRequest } from "next/server";
import { orderSchema } from "@/lib/validation";
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

    const order = await db.order.findUnique({
      where: { id },
      include: { orderItems: { include: { menuItem: true } }, payments: true },
    });

    if (!order) {
      return failure("ORDER_NOT_FOUND", "Order not found", 404);
    }

    return success(order);
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
    const parsed = orderSchema.partial().safeParse(body);

    if (!parsed.success) {
      return failure("VALIDATION_ERROR", "Invalid input", 400, z.treeifyError(parsed.error));
    }

    // Business Rule: Order can only be CANCELLED if it is PENDING
    if (parsed.data.status === "CANCELLED") {
      const existing = await db.order.findUnique({ where: { id } });
      if (existing?.status !== "PENDING") {
        return failure("INVALID_STATUS_TRANSITION", "Only PENDING orders can be cancelled", 400);
      }
    }

    const updated = await db.order.update({
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

    await db.order.delete({ where: { id } });
    return success({ id });
  } catch (error) {
    return handlePrismaError(error);
  }
}
