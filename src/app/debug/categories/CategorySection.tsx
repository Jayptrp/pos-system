"use client";

import { useState } from "react";
import { useCategories } from "@/hooks/useCategories";
import PopupForm from "@/components/PopupForm";

export default function CategorySection() {
  const { categories, createCategory, updateCategory, deleteCategory, isLoading } = useCategories();

  const [showPopup, setShowPopup] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [nameInput, setNameInput] = useState("");

  const openCreate = () => {
    setEditingCategory(null);
    setNameInput("");
    setShowPopup(true);
  };

  const openEdit = (cat: any) => {
    setEditingCategory(cat);
    setNameInput(cat.name);
    setShowPopup(true);
  };

  const handleSubmit = async () => {
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
            type="text"
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            className="border p-2 w-full mb-4 rounded"
            placeholder="Category Name"
          />
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
