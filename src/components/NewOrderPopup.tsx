"use client";

import { useState } from "react";
import { useCategories } from "@/hooks/useCategories";
import { useMenuItems } from "@/hooks/useMenuItems";
import toast from "react-hot-toast";

type NewOrderPopupProps = {
  onClose: () => void;
  onSubmit: (payload: any) => Promise<any>;
};

type CartItem = {
  id: number;
  name: string;
  price: number;
  quantity: number;
};

export default function NewOrderPopup({ onClose, onSubmit }: NewOrderPopupProps) {
  const { categories } = useCategories();
  const { menuItems } = useMenuItems();

  // States
  const [tableNumber, setTableNumber] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"CASH" | "MOBILE_BANKING" | "">("CASH");
  const [cart,ZBcart] = useState<Record<number, CartItem>>({});
  const [tempQuantities, setTempQuantities] = useState<Record<number, number>>({});

  // Helper to get items by category
  const getItemsByCategory = (catId: number) => {
    return menuItems.filter((item: any) => item.categoryId === catId);
  };

  // Handlers
  const handleQuantityChange = (itemId: number, val: string) => {
    const num = parseInt(val);
    setTempQuantities((prev) => ({ ...prev, [itemId]: isNaN(num) ? 0 : num }));
  };

  const addToCart = (item: any) => {
    const qty = tempQuantities[item.id] || 1;
    if (qty <= 0) return toast.error("Quantity must be > 0");

    ZBcart((prev) => ({
      ...prev,
      [item.id]: {
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: (prev[item.id]?.quantity || 0) + qty,
      },
    }));
    
    toast.success(`Added ${qty} ${item.name}`);
    setTempQuantities((prev) => ({ ...prev, [item.id]: 1 })); // Reset input
  };

  const handleSubmit = async () => {
    if (!tableNumber) return toast.error("Please enter a table number");
    
    const itemsPayload = Object.values(cart).map((i) => ({
      menuItemId: i.id,
      quantity: i.quantity,
    }));

    if (itemsPayload.length === 0) return toast.error("Cart is empty");

    const payload = {
      tableNumber: parseInt(tableNumber),
      items: itemsPayload,
      paymentMethod: paymentMethod || undefined,
    };

    await onSubmit(payload);
  };

  const cartTotal = Object.values(cart).reduce((acc, item) => acc + item.price * item.quantity, 0);
  const cartCount = Object.values(cart).reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 backdrop-blur-sm">
      <div className="bg-white w-full max-w-3xl h-[80vh] rounded-lg shadow-2xl flex flex-col overflow-hidden relative">
        
        {/* Header */}
        <div className="p-4 bg-blue-600 text-white flex justify-between items-center shadow-md z-10">
          <h2 className="text-xl font-bold">New Order</h2>
          <button onClick={onClose} className="text-white/80 hover:text-white text-2xl">&times;</button>
        </div>

        {/* Main Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 pb-32 bg-gray-50">
          
          {/* Table Input */}
          <div className="bg-white p-4 rounded-lg shadow-sm mb-6 border border-gray-200">
            <label className="block text-sm font-bold text-gray-700 mb-1">Table Number</label>
            <input
              type="number"
              value={tableNumber}
              onChange={(e) => setTableNumber(e.target.value)}
              className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Enter table number..."
              autoFocus
            />
          </div>

          {/* Menu Sections */}
          <div className="space-y-8">
            {categories.map((cat: any) => {
              const items = getItemsByCategory(cat.id);
              if (items.length === 0) return null;

              return (
                <div key={cat.id}>
                  <h3 className="text-lg font-bold text-gray-800 mb-3 border-b pb-1">{cat.name}</h3>
                  <div className="grid gap-3">
                    {items.map((item: any) => (
                      <div key={item.id} className="flex items-center justify-between bg-white p-3 rounded shadow-sm border hover:border-blue-300 transition-colors">
                        
                        {/* Item Info */}
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900">{item.name}</p>
                          <p className="text-sm text-gray-500">${item.price}</p>
                        </div>

                        {/* Controls */}
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min="1"
                            className="border rounded w-16 p-1 text-center text-sm"
                            value={tempQuantities[item.id] ?? ""}
                            placeholder="1"
                            onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                          />
                          <button
                            onClick={() => addToCart(item)}
                            className="bg-blue-100 text-blue-700 px-3 py-1 rounded text-sm font-medium hover:bg-blue-200 active:bg-blue-300 transition-colors"
                          >
                            Add
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Fixed Footer */}
        <div className="absolute bottom-0 left-0 right-0 bg-white border-t p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-20">
          <div className="flex justify-between items-center mb-4">
            <div>
              <p className="text-sm text-gray-500">{cartCount} items in cart</p>
              <p className="text-2xl font-bold text-gray-800">Total: ${cartTotal.toFixed(2)}</p>
            </div>
            
            <div className="w-1/3">
               <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Payment Method</label>
               <select 
                 className="w-full border p-2 rounded bg-gray-50"
                 value={paymentMethod}
                 onChange={(e) => setPaymentMethod(e.target.value as any)}
               >
                 <option value="CASH">Cash</option>
                 <option value="MOBILE_BANKING">Mobile Banking</option>
               </select>
            </div>
          </div>

          <button
            onClick={handleSubmit}
            className="w-full bg-green-600 text-white py-3 rounded-lg font-bold text-lg hover:bg-green-700 transition-transform active:scale-[0.99] shadow-md"
          >
            Place Order
          </button>
        </div>

      </div>
    </div>
  );
}