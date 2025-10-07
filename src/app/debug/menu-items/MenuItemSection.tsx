"use client";

import { useState } from "react";
import { useMenuItems } from "@/hooks/useMenuItems";
import { useCategories } from "@/hooks/useCategories";
import PopupForm from "@/components/PopupForm";

export default function MenuItemSection() {
  const { menuItems, createMenuItem, updateMenuItem, deleteMenuItem, isLoading } = useMenuItems();
  const { categories, isLoading: categoriesLoading } = useCategories();

  const [showPopup, setShowPopup] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [nameInput, setNameInput] = useState("");
  const [priceInput, setPriceInput] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<number | "">("");

  const openCreate = () => {
    setEditingItem(null);
    setNameInput("");
    setPriceInput("");
    setShowPopup(true);
  };

  const openEdit = (item: any) => {
  setEditingItem(item);
  setNameInput(item.name);
  setPriceInput(item.price);
  setSelectedCategory(item.categoryId);
  setShowPopup(true);
  };

  const handleSubmit = async () => {
  if (!selectedCategory) {
    alert("Please select a category");
    return;
  }

  const payload = {
    name: nameInput,
    price: parseFloat(priceInput),
    categoryId: selectedCategory,
  };

  if (editingItem) {
    await updateMenuItem(editingItem.id, payload);
  } else {
    await createMenuItem(payload);
  }

  setShowPopup(false);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete item?")) return;
    await deleteMenuItem(id);
  };

  return (
    <div className="border p-4 rounded-lg">
      <h2 className="text-xl font-semibold mb-2">Menu Items</h2>

      <button className="bg-blue-500 text-white px-3 py-1 rounded" onClick={openCreate}>
        + Create Item
      </button>

      <div className="mt-3">
        {isLoading ? (
          <p>Loading...</p>
        ) : (
          <ul className="divide-y">
            {menuItems.map((item: any) => (
              <li key={item.id} className="flex justify-between items-center py-2">
                <span>{item.name} - ${item.price}</span>
                <div className="space-x-2">
                  <button className="text-yellow-600" onClick={() => openEdit(item)}>
                    Edit
                  </button>
                  <button className="text-red-600" onClick={() => handleDelete(item.id)}>
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
            {editingItem ? "Update Menu Item" : "Create Menu Item"}
          </h3>

          <input
            type="text"
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            className="border p-2 w-full mb-2 rounded"
            placeholder="Item Name"
          />

          <input
            type="number"
            value={priceInput}
            onChange={(e) => setPriceInput(e.target.value)}
            className="border p-2 w-full mb-2 rounded"
            placeholder="Price"
          />

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(Number(e.target.value))}
            className="border p-2 w-full mb-4 rounded"
          >
            <option value="">Select category</option>
            {categories.map((cat: any) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>

          <button
            className="bg-green-500 text-white px-4 py-2 rounded"
            onClick={handleSubmit}
          >
            {editingItem ? "Update" : "Create"}
          </button>
        </PopupForm>
      )}
    </div>
  );
}
