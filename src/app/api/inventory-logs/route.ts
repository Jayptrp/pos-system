import db from "@/lib/db";
import { NextRequest } from "next/server";
import { inventoryLogSchema } from "@/lib/validation";
import { success, failure } from "@/lib/apiResponse";
import { handlePrismaError } from "@/lib/errorHandler";

export async function GET() {
  try {
    const logs = await db.inventoryLog.findMany({ orderBy: { createdAt: "desc" } });
    return success(logs);
  } catch (error) {
    return handlePrismaError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = inventoryLogSchema.safeParse(body);
    if (!parsed.success) {
      return failure("VALIDATION_ERROR", "Invalid input", 400);
    }

    // Business Rule: Inventory stock cannot go below 0
    if (parsed.data.changeType === "DECREASE") {
      const logs = await db.inventoryLog.findMany({
        where: { itemName: parsed.data.itemName },
      });

      const currentStock = logs.reduce((acc, log) => {
        return log.changeType === "INCREASE" ? acc + log.quantity : acc - log.quantity;
      }, 0);

      if (currentStock < parsed.data.quantity) {
        return failure("INSUFFICIENT_STOCK", `Not enough stock. Current: ${currentStock}`, 400);
      }
    }

    const log = await db.inventoryLog.create({ data: parsed.data });
    return success(log, 201);
  } catch (error) {
    return handlePrismaError(error);
  }
}