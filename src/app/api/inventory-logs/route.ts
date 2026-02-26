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
    console.error("Error fetching inventory logs:", error);
    return failure("FETCHING_ERROR", "Failed to fetch inventory logs", 500);
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = inventoryLogSchema.safeParse(body);
  if (!parsed.success) {
    return failure("PARSED_ERROR", "Failed to parse the request", 400);
  }
  try {
    const log = await db.inventoryLog.create({ data: parsed.data });
  return success(log);
  } catch (error) {
    return handlePrismaError(error);
  }
}