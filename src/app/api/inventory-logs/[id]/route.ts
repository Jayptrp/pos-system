import db from "@/lib/db";
import { NextRequest } from "next/server";
import { inventoryLogSchema } from "@/lib/validation";
import { success, failure } from "@/lib/apiResponse";
import { handlePrismaError } from "@/lib/errorHandler";
import { z } from "zod";

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: rawId } = await params;
  const id = Number(rawId);
  if (isNaN(id)) {
    return failure("INVALID_ID", "ID must be a number", 400);
  }
  try {
    const log = await db.inventoryLog.findUnique({ where: { id: id } });
    if (!log) return failure("NOT_FOUND", "Log not found", 404);
    return success(log);
  } catch (error) {
    return handlePrismaError(error);
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: rawId } = await params;
  const id = Number(rawId);
  if (isNaN(id)) {
    return failure("INVALID_ID", "ID must be a number", 400);
  }
  const body = await req.json();
  const parsed = inventoryLogSchema.partial().safeParse(body);
  if (!parsed.success) {
    return failure("VALIDATION_ERROR", "Invalid input", 400, z.treeifyError(parsed.error));
  }
  try {
    const updated = await db.inventoryLog.update({
      where: { id: id },
      data: parsed.data,
    });
    return success(updated);
  } catch (error) {
    return handlePrismaError(error);
  }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: rawId } = await params;
  const id = Number(rawId);
  if (isNaN(id)) {
    return failure("INVALID_ID", "ID must be a number", 400);
  }
  try {
    await db.inventoryLog.delete({ where: { id: id } });
    return success({ id });
  } catch (error) {
    return handlePrismaError(error);
  }
}
