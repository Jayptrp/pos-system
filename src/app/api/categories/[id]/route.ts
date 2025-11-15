import { NextRequest } from "next/server";
import db from "@/lib/db";
import { categorySchema } from "@/lib/validation";
import { success, failure } from "@/lib/apiResponse";
import { handlePrismaError } from "@/lib/errorHandler";
import { z } from "zod";

// GET one category
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const id = Number(params.id);

  const category = await db.category.findUnique({ where: { id } });
  if (!category) {
    return failure("CATEGORY_NOT_FOUND", "Category not found", 404);
  }

  return success(category);
}

// UPDATE category
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  const body = await req.json();

  const parsed = categorySchema.safeParse(body);
  if (!parsed.success) {
    return failure("VALIDATION_ERROR", "Invalid input", 400, z.treeifyError(parsed.error));
  }

  try {
    const updated = await db.category.update({
      where: { id },
      data: parsed.data,
    });
    return success(updated);
  } catch (error) {
    return handlePrismaError(error);
  }
}

// DELETE category
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const id = Number(params.id);

  try {
    await db.category.delete({ where: { id } });
    return success({ id });
  } catch (error) {
    return handlePrismaError(error);
  }
}
