import { NextResponse } from "next/server";
import db from "@/lib/db";
import { categorySchema } from "@/lib/validation";
import { Prisma } from "@prisma/client";

// GET one category
export async function GET(req: Request, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  const category = await db.category.findUnique({ where: { id } });

  if (!category) {
    return NextResponse.json({ error: "Category not found" }, { status: 404 });
  }

  return NextResponse.json(category);
}

// UPDATE category
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  const body = await req.json();

  const parsed = categorySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(parsed.error.format(), { status: 400 });
  }

  try {
    const updated = await db.category.update({
      where: { id },
      data: parsed.data,
    });
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update category" }, { status: 500 });
  }
}

// DELETE category
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const param = await params
  const id = Number(param.id);

  try {
    await db.category.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2003") {
        return NextResponse.json(
          { error: "Cannot delete category: It is still referenced by existing menu items." },
          { status: 400 }
        );
      }
    }

    console.error("Unexpected error deleting category:", error);
    return NextResponse.json(
      { error: "Failed to delete category" },
      { status: 500 }
    );
  }
}
