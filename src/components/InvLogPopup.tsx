"use client";

import { useState, useRef, useEffect } from "react";
import PopupForm from "@/components/PopupForm";

interface InvLogPopupProps {
  onClose: () => void;
  onSubmit: (payload: any) => Promise<void>; // Or return a specific type if needed
  initialData?: any; // For editing mode
}

export default function InvLogPopup({ onClose, onSubmit, initialData }: InvLogPopupProps) {
  // Form States
  const [itemNameInput, setItemNameInput] = useState(initialData?.itemName || "");
  const [quantityInput, setQuantityInput] = useState(initialData?.quantity ? String(initialData.quantity) : "");
  const [changeTypeInput, setChangeTypeInput] = useState<"INCREASE" | "DECREASE">(initialData?.changeType || "INCREASE");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Error States
  const [errors, setErrors] = useState<Record<string, string>>({});
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = async () => {
    setErrors({});

    if (!itemNameInput.trim()) {
      setErrors({ itemName: "Please enter an item name." });
      inputRef.current?.focus();
      return;
    }

    const qty = parseInt(quantityInput);
    if (isNaN(qty) || qty < 0) {
      setErrors({ quantity: "Please enter a valid quantity." });
      return;
    }

    const payload = {
      itemName: itemNameInput,
      quantity: qty,
      changeType: changeTypeInput,
    };

    setIsSubmitting(true);
    await onSubmit(payload);
    setIsSubmitting(false);
  };

  return (
    <PopupForm onClose={onClose}>
      <h3 className="text-lg font-semibold mb-2">
        {initialData ? "Update Log" : "Create Log"}
      </h3>
      
      <label className="block text-sm font-medium mb-1">Item Name</label>
      <input
        ref={inputRef}
        type="text"
        value={itemNameInput}
        onChange={(e) => setItemNameInput(e.target.value)}
        className={`border p-2 w-full mb-2 rounded ${errors.itemName ? "border-red-500" : ""}`}
        placeholder="e.g. Cola Cans"
        disabled={isSubmitting}
      />
      {errors.itemName && <p className="text-sm text-red-600 mb-2">{errors.itemName}</p>}

      <label className="block text-sm font-medium mb-1">Quantity</label>
      <input
        type="number"
        value={quantityInput}
        onChange={(e) => setQuantityInput(e.target.value)}
        className={`border p-2 w-full mb-2 rounded ${errors.quantity ? "border-red-500" : ""}`}
        placeholder="0"
        disabled={isSubmitting}
      />
      {errors.quantity && <p className="text-sm text-red-600 mb-2">{errors.quantity}</p>}

      <label className="block text-sm font-medium mb-1">Change Type</label>
      <select
        value={changeTypeInput}
        onChange={(e) => setChangeTypeInput(e.target.value as "INCREASE" | "DECREASE")}
        className="border p-2 w-full mb-4 rounded"
        disabled={isSubmitting}
      >
        <option value="INCREASE">INCREASE</option>
        <option value="DECREASE">DECREASE</option>
      </select>

      <button
        className="bg-green-500 text-white px-4 py-2 rounded w-full disabled:bg-gray-400"
        onClick={handleSubmit}
        disabled={isSubmitting}
      >
        {isSubmitting ? "Saving..." : (initialData ? "Update" : "Create")}
      </button>
    </PopupForm>
  );
}