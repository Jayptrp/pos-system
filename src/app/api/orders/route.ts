import db from "@/lib/db";
import { NextResponse } from "next/server";
import { createOrderCompositeSchema } from "@/lib/validation";

// GET All Orders
export async function GET() {
  try {
    const orders = await db.order.findMany({
      include: { orderItems: true, payments: true },
      orderBy: { createdAt: "asc" }, // Ascending by createdAt as requested
    });
    return NextResponse.json(orders);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}

// CREATE Order (Composite Transaction)
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = createOrderCompositeSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(parsed.error.format(), { status: 400 });
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

    return NextResponse.json(newOrder, { status: 201 });
  } catch (error) {
    console.error("Order creation error:", error);
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}