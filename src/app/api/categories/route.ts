import { NextRequest } from "next/server";
import db from "@/lib/db";
import { categorySchema } from "@/lib/validation";
import { success, failure } from "@/lib/apiResponse";
import { handlePrismaError } from "@/lib/errorHandler";

// GET all categories
export async function GET() {
  try {
    const categories = await db.category.findMany({
      orderBy: { createdAt: "desc" },
    });
    return success(categories);
  } catch (error) {
    console.error("Error fetching categories:", error);
    return failure("FETCHING_ERROR", "Failed to fetch categories", 500);
  }
}

// CREATE new category
export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = categorySchema.safeParse(body);

  if (!parsed.success) {
    return failure("PARSED_ERROR", "Failed to parse the request", 400);
  }

  const { name } = parsed.data;
  const existing = await db.category.findFirst({
    where: { name: { equals: name, mode: "insensitive" } },
  });

  if (existing) {
    return failure("DATA_EXISTING", "Category name already exists", 400);
  }

  try {
    const newCategory = await db.category.create({
      data: { name },
    });
    return success(newCategory);
  } catch (error) {
    return handlePrismaError(error);
  }
}
