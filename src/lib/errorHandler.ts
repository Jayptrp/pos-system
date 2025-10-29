import { Prisma } from "@prisma/client";
import { failure } from "./apiResponse";

export function handlePrismaError(error: unknown) {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case "P2002":
        return failure("UNIQUE_CONSTRAINT", "Duplicate value violates unique constraint", 409);
      case "P2003":
        return failure(
          "FK_CONSTRAINT",
          "Cannot delete: This record is still referenced by another table.",
          409
        );
      case "P2025":
        return failure("NOT_FOUND", "Record not found", 404);
      default:
        return failure("PRISMA_ERROR", "A database error occurred", 500, { code: error.code });
    }
  }

  console.error("Unknown error:", error);
  return failure("INTERNAL_ERROR", "An unexpected error occurred", 500);
}
