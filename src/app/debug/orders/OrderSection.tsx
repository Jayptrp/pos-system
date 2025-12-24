"use client";

import { useState } from "react";
// Relative imports to fix resolution
import { useOrders } from "../../../hooks/useOrders";
import NewOrderPopup from "../../../components/NewOrderPopup";
import ShowConfirmToast from "../../../components/ShowConfirmToast";
import toast from "react-hot-toast";

export default function OrderSection() {
  const { orders, createOrder, deleteOrder, isLoading } = useOrders();

  const [showNewOrderPopup, setShowNewOrderPopup] = useState(false);
  const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null);

  const toggleExpand = (id: number) => {
    setExpandedOrderId(expandedOrderId === id ? null : id);
  };

  const handleCreateOrder = async (payload: any) => {
    const res = await createOrder(payload);

    if (res.success) {
      toast.success("Order created successfully!");
      setShowNewOrderPopup(false);
    } else if (res.fieldErrors) {
      // If table number failed validation
      toast.error(res.fieldErrors.tableNumber || "Please check your inputs");
    } else {
      toast.error(res.error || "Failed to create order");
    }
  };

  const handleDelete = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent row expansion when clicking delete
    const confirmation = await ShowConfirmToast("delete this order");
    if (!confirmation) return;

    const res = await deleteOrder(id);
    if (res?.error) {
      toast.error(res.error);
    } else {
      toast.success("Order deleted successfully!");
    }
  };

  return (
    <div className="border p-4 rounded-lg bg-white shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Orders</h2>
        <button 
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow transition-colors" 
          onClick={() => setShowNewOrderPopup(true)}
        >
          + New Order
        </button>
      </div>

      <div className="mt-3">
        {isLoading ? (
          <div className="text-center py-4 text-gray-500">Loading orders...</div>
        ) : orders.length === 0 ? (
           <div className="text-center py-4 text-gray-400">No orders found.</div>
        ) : (
          <div className="border rounded-lg overflow-hidden">
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-2 bg-gray-100 p-3 font-semibold text-sm text-gray-600 border-b">
              <div className="col-span-2">Order ID</div>
              <div className="col-span-2">Table</div>
              <div className="col-span-2">Status</div>
              <div className="col-span-2 text-center">Items</div>
              <div className="col-span-3">Payment</div>
              <div className="col-span-1"></div>
            </div>

            {/* Table Body */}
            <ul className="divide-y">
              {orders.map((order: any) => (
                <li key={order.id} className="flex flex-col bg-white transition-colors">
                  
                  {/* Main Row */}
                  <div 
                    className="grid grid-cols-12 gap-2 p-3 items-center cursor-pointer hover:bg-blue-50"
                    onClick={() => toggleExpand(order.id)}
                  >
                    <div className="col-span-2 font-mono text-gray-500">#{order.id}</div>
                    <div className="col-span-2 font-medium">Tab {order.tableNumber}</div>
                    <div className="col-span-2">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium border ${
                        order.status === 'COMPLETED' ? 'bg-green-100 text-green-700 border-green-200' : 
                        order.status === 'CANCELLED' ? 'bg-red-100 text-red-700 border-red-200' : 
                        'bg-yellow-100 text-yellow-700 border-yellow-200'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                    <div className="col-span-2 text-center text-gray-600">
                      {order.orderItems?.reduce((acc: number, item: any) => acc + item.quantity, 0) || 0}
                    </div>
                    <div className="col-span-3 text-sm text-gray-600 truncate">
                      {order.payments?.length > 0 
                        ? order.payments.map((p: any) => p.method.replace('_', ' ')).join(", ") 
                        : <span className="text-gray-300 italic">None</span>}
                    </div>
                    <div className="col-span-1 text-right">
                      <button 
                        className="text-red-400 hover:text-red-600 p-1" 
                        onClick={(e) => handleDelete(order.id, e)}
                        title="Delete Order"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {expandedOrderId === order.id && (
                    <div className="bg-gray-50 p-4 border-t border-b border-gray-100 shadow-inner">
                      <h4 className="text-xs font-bold text-gray-400 uppercase mb-2 tracking-wider">Order Items</h4>
                      {order.orderItems && order.orderItems.length > 0 ? (
                        <table className="w-full text-sm">
                          <thead className="text-left text-gray-500">
                            <tr>
                              <th className="pb-1">Item ID</th>
                              <th className="pb-1">Quantity</th>
                            </tr>
                          </thead>
                          <tbody className="text-gray-700">
                            {order.orderItems.map((item: any) => (
                              <tr key={item.id} className="border-b border-gray-200 last:border-0">
                                <td className="py-1">Menu Item #{item.menuItemId}</td>
                                <td className="py-1 font-mono">x{item.quantity}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      ) : (
                        <p className="text-sm text-gray-400 italic">No items in this order.</p>
                      )}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* New Order Popup */}
      {showNewOrderPopup && (
        <NewOrderPopup 
          onClose={() => setShowNewOrderPopup(false)} 
          onSubmit={handleCreateOrder} 
        />
      )}
    </div>
  );
}