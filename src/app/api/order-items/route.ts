import db from "@/lib/db";
import { NextRequest } from "next/server";
import { orderItemSchema } from "@/lib/validation";
import { success, failure } from "@/lib/apiResponse";
import { handlePrismaError } from "@/lib/errorHandler";
import { z } from "zod";

export async function GET() {
  try {
    const items = await db.orderItem.findMany({ 
      include: { menuItem: true },
      orderBy: { id: "desc" } 
    });
    return success(items);
  } catch (error) {
    return handlePrismaError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = orderItemSchema.safeParse(body);
    if (!parsed.success) {
      return failure("VALIDATION_ERROR", "Invalid input", 400, z.treeifyError(parsed.error));
    }

    // Business Rule: Cannot add items to a COMPLETED or CANCELLED order
    const order = await db.order.findUnique({
      where: { id: parsed.data.orderId },
    });

    if (!order) {
      return failure("ORDER_NOT_FOUND", "Order not found", 404);
    }

    if (order.status !== "PENDING") {
      return failure("ORDER_NOT_EDITABLE", `Cannot add items to a ${order.status} order`, 400);
    }

    const item = await db.orderItem.create({ data: parsed.data });
    return success(item, 201);
  } catch (error) {
    return handlePrismaError(error);
  }
}
