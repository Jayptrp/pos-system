import db from "@/lib/db";
import { NextResponse } from "next/server";
import { createOrderCompositeSchema } from "@/lib/validation";
import { success, failure } from "@/lib/apiResponse";
import { handlePrismaError } from "@/lib/errorHandler";

// GET All Orders
export async function GET() {
  try {
    const orders = await db.order.findMany({
      include: { orderItems: true, payments: true },
      orderBy: { createdAt: "asc" },
    });
    // Wrap the result in the standard success format expected by your fetcher
    return success(orders);
  } catch (error) {
    return handlePrismaError(error);
  }
}

// CREATE Order (Composite Transaction)
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = createOrderCompositeSchema.safeParse(body);

    if (!parsed.success) {
      return failure("VALIDATION_ERROR", "Invalid input", 400, parsed.error.format());
    }

    const { tableNumber, items, paymentMethod } = parsed.data;

    // 1. Fetch prices to calculate total (Secure calculation on backend)
    const itemIds = items.map((i) => i.menuItemId);
    const menuItems = await db.menuItem.findMany({
      where: { id: { in: itemIds } },
    });

    let totalAmount = 0;
    const orderItemsData = items.map((item) => {
      const product = menuItems.find((m) => m.id === item.menuItemId);
      if (product) {
        totalAmount += product.price * item.quantity;
      }
      return {
        menuItemId: item.menuItemId,
        quantity: item.quantity,
      };
    });

    // 2. Transactional Create
    const newOrder = await db.order.create({
      data: {
        tableNumber,
        status: "PENDING",
        orderItems: {
          create: orderItemsData,
        },
        // If payment method is provided, create the payment record immediately
        payments: paymentMethod
          ? {
              create: {
                amount: totalAmount,
                method: paymentMethod,
              },
            }
          : undefined,
      },
      include: {
        orderItems: true,
        payments: true,
      },
    });

    return success(newOrder, 201);
  } catch (error) {
    console.error("Order creation error:", error);
    return handlePrismaError(error);
  }
}