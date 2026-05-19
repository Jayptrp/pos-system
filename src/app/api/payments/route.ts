import db from "@/lib/db";
import { NextRequest } from "next/server";
import { paymentSchema } from "@/lib/validation";
import { success, failure } from "@/lib/apiResponse";
import { handlePrismaError } from "@/lib/errorHandler";
import { z } from "zod";

export async function GET() {
  try {
    const payments = await db.payment.findMany({ 
      include: { order: true },
      orderBy: { createdAt: "desc" } 
    });
    return success(payments);
  } catch (error) {
    return handlePrismaError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = paymentSchema.safeParse(body);
    if (!parsed.success) {
      return failure("VALIDATION_ERROR", "Invalid input", 400, z.treeifyError(parsed.error));
    }

    // Business Rule: Payment amount must match order total
    const order = await db.order.findUnique({
      where: { id: parsed.data.orderId },
      include: { orderItems: { include: { menuItem: true } } },
    });

    if (!order) {
      return failure("ORDER_NOT_FOUND", "Order not found", 404);
    }

    const orderTotal = order.orderItems.reduce(
      (acc, item) => acc + item.menuItem.price * item.quantity,
      0
    );

    if (parsed.data.amount < orderTotal) {
      return failure("INSUFFICIENT_PAYMENT", `Amount must be at least ${orderTotal}`, 400);
    }

    const payment = await db.payment.create({ data: parsed.data });
    
    // Auto-complete order if payment is sufficient
    await db.order.update({
      where: { id: order.id },
      data: { status: "COMPLETED" },
    });

    return success(payment, 201);
  } catch (error) {
    return handlePrismaError(error);
  }
}
