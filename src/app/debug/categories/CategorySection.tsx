"use client";

import { useState, useRef } from "react";
import { useCategories } from "@/hooks/useCategories";
import PopupForm from "@/components/PopupForm";

export default function CategorySection() {
  const { categories, createCategory, updateCategory, deleteCategory, isLoading } = useCategories();

  const [showPopup, setShowPopup] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [nameInput, setNameInput] = useState("");
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement | null>(null);

  const openCreate = () => {
    setEditingCategory(null);
    setNameInput("");
    setError("");
    setShowPopup(true);
  };

  const openEdit = (cat: any) => {
    setEditingCategory(cat);
    setNameInput(cat.name);
    setError("");
    setShowPopup(true);
    // focus will happen after render
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const handleSubmit = async () => {
    if (!nameInput.trim()) {
      setError("Please enter a category name.");
      inputRef.current?.focus();
      return;
    }

    setError("");
    if (editingCategory) {
      await updateCategory(editingCategory.id, { name: nameInput });
    } else {
      await createCategory({ name: nameInput });
    }
    setShowPopup(false);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete category?")) return;
    await deleteCategory(id);
  };

  return (
    <div className="border p-4 rounded-lg">
      <h2 className="text-xl font-semibold mb-2">Categories</h2>

      <button className="bg-blue-500 text-white px-3 py-1 rounded" onClick={openCreate}>
        + Create Category
      </button>

      <div className="mt-3">
        {isLoading ? (
          <p>Loading...</p>
        ) : (
          <ul className="divide-y">
            {categories.map((cat: any) => (
              <li key={cat.id} className="flex justify-between items-center py-2">
                <span>{cat.name}</span>
                <div className="space-x-2">
                  <button className="text-yellow-600" onClick={() => openEdit(cat)}>
                    Edit
                  </button>
                  <button className="text-red-600" onClick={() => handleDelete(cat.id)}>
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Popup */}
      {showPopup && (
        <PopupForm onClose={() => setShowPopup(false)}>
          <h3 className="text-lg font-semibold mb-2">
            {editingCategory ? "Update Category" : "Create Category"}
          </h3>
          <input
            ref={inputRef}
            type="text"
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            className={`border p-2 w-full mb-2 rounded ${error ? "border-red-500" : ""}`}
            placeholder="Category Name"
            aria-invalid={!!error}
            aria-describedby={error ? "category-name-error" : undefined}
          />
          {error && (
            <p id="category-name-error" className="text-sm text-red-600 mb-2">
              {error}
            </p>
          )}
          <button
            className="bg-green-500 text-white px-4 py-2 rounded"
            onClick={handleSubmit}
          >
            {editingCategory ? "Update" : "Create"}
          </button>
        </PopupForm>
      )}
    </div>
  );
}
