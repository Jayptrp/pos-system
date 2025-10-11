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
    // ensure priceInput is a string for controlled input
    setPriceInput(item.price !== undefined && item.price !== null ? String(item.price) : "");
    setSelectedCategory(item.categoryId ?? "");
    setNameError("");
    setPriceError("");
    setShowPopup(true);
  };

  const handleSubmit = async () => {
    // reset previous errors
    setNameError("");
    setPriceError("");

    // validation: name required
    if (!nameInput.trim()) {
      setNameError("Please enter an item name.");
      nameRef.current?.focus();
      return;
    }

    // validation: price required
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
      if (res?.error) {
        toast.error(res.error);
      } else {
        toast.success("Menu item created successfully!");
      }
    }

    setShowPopup(false);
  };

  const handleDelete = async (id: number) => {
    const confirmation = await ShowConfirmToast("delete this menu item");
    if (!confirmation) return;
    else {
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
  }

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
            ref={nameRef}
            type="text"
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            className={`border p-2 w-full mb-2 rounded ${nameError ? "border-red-500" : ""}`}
            placeholder="Item Name"
            aria-invalid={!!nameError}
            aria-describedby={nameError ? "item-name-error" : undefined}
          />
          {nameError && (
            <p id="item-name-error" className="text-sm text-red-600 mb-2">
              {nameError}
            </p>
          )}

          <input
            ref={priceRef}
            type="number"
            value={priceInput}
            onChange={(e) => setPriceInput(e.target.value)}
            className={`border p-2 w-full mb-2 rounded ${priceError ? "border-red-500" : ""}`}
            placeholder="Price"
            aria-invalid={!!priceError}
            aria-describedby={priceError ? "price-error" : undefined}
            min="0"
            step="0.01"
          />
          {priceError && (
            <p id="price-error" className="text-sm text-red-600 mb-2">
              {priceError}
            </p>
          )}

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(Number(e.target.value) || "")}
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
