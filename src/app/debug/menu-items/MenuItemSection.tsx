"use client";

import { useState, useRef } from "react";
import { useMenuItems } from "@/hooks/useMenuItems";
import { useCategories } from "@/hooks/useCategories";
import PopupForm from "@/components/PopupForm";
import ShowConfirmToast from "@/components/ShowConfirmToast";
import toast from "react-hot-toast";

export default function MenuItemSection() {
  const { menuItems, createMenuItem, updateMenuItem, deleteMenuItem, isLoading } = useMenuItems();
  const { categories, isLoading: categoriesLoading } = useCategories();

  const [showPopup, setShowPopup] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [nameInput, setNameInput] = useState("");
  const [priceInput, setPriceInput] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<number | "">("");
  const [nameError, setNameError] = useState("");
  const [priceError, setPriceError] = useState("");

  const nameRef = useRef<HTMLInputElement | null>(null);
  const priceRef = useRef<HTMLInputElement | null>(null);

  const openCreate = () => {
    setEditingItem(null);
    setNameInput("");
    setPriceInput("");
    setSelectedCategory("");
    setNameError("");
    setPriceError("");
    setShowPopup(true);
  };

  const openEdit = (item: any) => {
    setEditingItem(item);
    setNameInput(item.name ?? "");
    setPriceInput(item.price !== undefined && item.price !== null ? String(item.price) : "");
    setSelectedCategory(item.categoryId ?? "");
    setNameError("");
    setPriceError("");
    setShowPopup(true);
  };

  const handleSubmit = async () => {
    setNameError("");
    setPriceError("");

    if (!nameInput.trim()) {
      setNameError("Please enter an item name.");
      nameRef.current?.focus();
      return;
    }

    if (priceInput === "" || priceInput === null) {
      setPriceError("Please enter a price.");
      priceRef.current?.focus();
      return;
    }

    const parsedPrice = parseFloat(priceInput);
    if (isNaN(parsedPrice)) {
      setPriceError("Price must be a valid number.");
      priceRef.current?.focus();
      return;
    }

    if (parsedPrice < 1) {
      setPriceError("Price must be at least 1.");
      priceRef.current?.focus();
      return;
    }

    const payload = {
      name: nameInput.trim(),
      price: parsedPrice,
      categoryId: selectedCategory || null,
    };

    if (editingItem) {
      const res = await updateMenuItem(editingItem.id, payload);
      if (res?.error) {
        toast.error(res.error);
      } else {
        toast.success("Menu item updated successfully!");
      }
    } else {
      const res = await createMenuItem(payload);
      if (res.error || res.fieldErrors) {
        toast.error(res.error || res.fieldErrors?.name || "Failed to create menu item");
      } else {
        toast.success("Menu item created successfully!");
      }
    }

    setShowPopup(false);
  };

  const handleDelete = async (id: number) => {
    const confirmation = await ShowConfirmToast("delete this menu item");
    if (!confirmation) return;
    
    try {
      const res = await deleteMenuItem(id);
      if (res?.error) {
        toast.error(res.error);
      } else {
        toast.success("Menu item deleted successfully!");
      }
    } catch (err) {
      toast.error("Something went wrong while deleting.");
    }
  };

  // --- Helper to render a single list item (Avoids duplication) ---
  const renderMenuItem = (item: any) => (
    <li key={item.id} className="flex justify-between items-center py-2 border-b last:border-0">
      <span>{item.name} - ${item.price}</span>
      <div className="space-x-2">
        <button className="text-yellow-600 hover:underline" onClick={() => openEdit(item)}>
          Edit
        </button>
        <button className="text-red-600 hover:underline" onClick={() => handleDelete(item.id)}>
          Delete
        </button>
      </div>
    </li>
  );

  // Filter items that don't have a category
  const uncategorizedItems = menuItems ? menuItems.filter((item: any) => !item.category) : [];

  return (
    <div className="border p-4 rounded-lg">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Menu Items</h2>
        <button className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600" onClick={openCreate}>
          + Create Item
        </button>
      </div>

      <div className="mt-3">
        {isLoading || categoriesLoading ? (
          <p>Loading...</p>
        ) : (
          <div className="space-y-6">
            
            {/* 1. Map through Categories */}
            {categories.map((cat: any) => {
              // Find items for this category
              const catItems = menuItems.filter((item: any) => item.categoryId === cat.id);
              
              // Optional: Hide category section if empty? (Remove this check if you want to see empty headers)
              if (catItems.length === 0) return null;

              return (
                <div key={cat.id} className="bg-gray-50 p-3 rounded-lg">
                  <h3 className="font-bold text-lg text-gray-700 border-b pb-2 mb-2">
                    {cat.name}
                  </h3>
                  <ul className="bg-white px-3 rounded border">
                    {catItems.map(renderMenuItem)}
                  </ul>
                </div>
              );
            })}

            {/* 2. Show Uncategorized Items at the Bottom */}
            {uncategorizedItems.length > 0 && (
              <div className="bg-gray-50 p-3 rounded-lg border-t-4 border-gray-200">
                <h3 className="font-bold text-lg text-gray-500 border-b pb-2 mb-2">
                  Uncategorized
                </h3>
                <ul className="bg-white px-3 rounded border">
                  {uncategorizedItems.map(renderMenuItem)}
                </ul>
              </div>
            )}

            {/* Handle case where there are no items at all */}
            {menuItems.length === 0 && (
               <p className="text-gray-500 text-center">No menu items found.</p>
            )}
          </div>
        )}
      </div>

      {/* Popup */}
      {showPopup && (
        <PopupForm onClose={() => setShowPopup(false)}>
          <h3 className="text-lg font-semibold mb-2">
            {editingItem ? "Update Menu Item" : "Create Menu Item"}
          </h3>

          <input
            ref={nameRef}
            type="text"
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            className={`border p-2 w-full mb-2 rounded ${nameError ? "border-red-500" : ""}`}
            placeholder="Item Name"
          />
          {nameError && <p className="text-sm text-red-600 mb-2">{nameError}</p>}

          <input
            ref={priceRef}
            type="number"
            value={priceInput}
            onChange={(e) => setPriceInput(e.target.value)}
            className={`border p-2 w-full mb-2 rounded ${priceError ? "border-red-500" : ""}`}
            placeholder="Price"
            min="0"
            step="0.01"
          />
          {priceError && <p className="text-sm text-red-600 mb-2">{priceError}</p>}

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(Number(e.target.value) || "")}
            className="border p-2 w-full mb-4 rounded"
          >
            <option value="">Select category (Optional)</option>
            {categories.map((cat: any) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>

          <button
            className="bg-green-500 text-white px-4 py-2 rounded w-full hover:bg-green-600"
            onClick={handleSubmit}
          >
            {editingItem ? "Update" : "Create"}
          </button>
        </PopupForm>
      )}
    </div>
  );
}