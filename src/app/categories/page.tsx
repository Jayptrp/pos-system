"use client";

import { useState } from "react";
import { useCategories } from "@/hooks/useCategories";
import { CategoryInput } from "@/lib/validation";

export default function CategoriesPage() {
  const { categories, isLoading, isError, createCategory, updateCategory, deleteCategory, mutate } =
    useCategories();
  const [form, setForm] = useState<CategoryInput>({ name: "" });
  const [editId, setEditId] = useState<number | null>(null);

  if (isLoading) return <p>Loading...</p>;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      if (editId) {
        await updateCategory(editId, form);
        setEditId(null);
      } else {
        await createCategory(form);
      }
      setForm({ name: "" });
      mutate();
    } catch (error) {
      alert(error);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete category?")) return;
    await deleteCategory(id);
    mutate();
  }

  return (
    <div className="max-w-xl mx-auto py-6">
      <h1 className="text-2xl font-bold mb-4">Categories</h1>

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex gap-2 mb-4">
        <input
          type="text"
          value={form.name}
          onChange={(e) => setForm({ name: e.target.value })}
          placeholder="Category name"
          className="border px-2 py-1 flex-1 rounded"
        />
        <button type="submit" className="bg-blue-500 text-white px-4 py-1 rounded">
          {editId ? "Update" : "Add"}
        </button>
      </form>

      {/* Category list */}
      <ul className="space-y-2">
        {categories?.map((cat: any) => (
          <li key={cat.id} className="flex justify-between items-center border p-2 rounded">
            <span>{cat.name}</span>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setEditId(cat.id);
                  setForm({ name: cat.name });
                }}
                className="bg-yellow-500 text-white px-3 py-1 rounded"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(cat.id)}
                className="bg-red-500 text-white px-3 py-1 rounded"
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
