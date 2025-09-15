"use client";

import { useState } from "react";
import { useCategories } from "@/hooks/useCategories";
import PopupForm from "@/components/PopupForm";

export default function DebugPage() {
  const { categories, createCategory, updateCategory, deleteCategory, isLoading } = useCategories();

  const [showPopup, setShowPopup] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null); // null = create mode

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

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Debug Panel</h1>

      {/* Create Button */}
      <button
        className="bg-blue-500 text-white px-4 py-2 rounded"
        onClick={openCreate}
      >
        + Create Category
      </button>

      {/* Categories List */}
      <div className="border p-4 rounded">
        <h2 className="font-semibold">Categories</h2>
        {isLoading ? (
          <p>Loading...</p>
        ) : (
          <ul>
            {categories.map((cat: any) => (
              <li key={cat.id} className="flex justify-between items-center py-1">
                <span>{cat.name}</span>
                <div className="space-x-2">
                  <button
                    className="text-yellow-600 text-sm"
                    onClick={() => openEdit(cat)}
                  >
                    U
                  </button>
                  <button
                    className="text-red-600 text-sm"
                    onClick={() => deleteCategory(cat.id)}
                  >
                    D
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
