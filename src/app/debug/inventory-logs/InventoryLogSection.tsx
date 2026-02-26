"use client";

import { useState } from "react";
import { useInventoryLogs } from "@/hooks/useInventoryLogs";
import InvLogPopup from "@/components/InvLogPopup";
import ShowConfirmToast from "@/components/ShowConfirmToast";
import toast from "react-hot-toast";

export default function InventoryLogSection() {
  const { inventoryLogs, createInventoryLog, updateInventoryLog, deleteInventoryLog, isLoading } = useInventoryLogs();

  const [showPopup, setShowPopup] = useState(false);
  const [editingLog, setEditingLog] = useState<any>(null);

  const openCreate = () => {
    setEditingLog(null);
    setShowPopup(true);
  };

  const openEdit = (log: any) => {
    setEditingLog(log);
    setShowPopup(true);
  };

  const handlePopupSubmit = async (payload: any) => {
    let res;
    
    if (editingLog) {
      res = await updateInventoryLog(editingLog.id, payload);
    } else {
      res = await createInventoryLog(payload);
    }

    if (res?.fieldErrors) {
      // If validation failed on server, show toast
      const firstError = Object.values(res.fieldErrors)[0];
      toast.error(firstError || "Validation failed");
    } else if (res?.error) {
      toast.error(res.error);
    } else {
      toast.success(editingLog ? "Log updated!" : "Log created!");
      setShowPopup(false);
    }
  };

  const handleDelete = async (id: number) => {
    const confirmation = await ShowConfirmToast("delete this log");
    if (!confirmation) return;

    const res = await deleteInventoryLog(id);
    if (res?.error) {
      toast.error(res.error);
    } else {
      toast.success("Log deleted successfully!");
    }
  };

  return (
    <div className="border p-4 rounded-lg">
      <h2 className="text-xl font-semibold mb-2">Inventory Logs</h2>

      <button className="bg-blue-500 text-white px-3 py-1 rounded" onClick={openCreate}>
        + Add Log
      </button>

      <div className="mt-3">
        {isLoading ? (
          <p>Loading...</p>
        ) : (
          <ul className="divide-y">
            <li className="font-medium py-2">
              <span>{inventoryLogs.length} logs</span>
            </li>
            {inventoryLogs.map((log: any) => (
              <li key={log.id} className="flex justify-between items-center py-2">
                <div>
                  <span className="font-medium">{log.itemName}</span>
                  <span className={`ml-2 text-xs px-2 py-1 rounded ${
                    log.changeType === 'INCREASE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {log.changeType} {log.quantity}
                  </span>
                  <span className="text-gray-400 text-xs ml-2">
                    {new Date(log.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="space-x-2">
                  <button className="text-yellow-600" onClick={() => openEdit(log)}>
                    Edit
                  </button>
                  <button className="text-red-600" onClick={() => handleDelete(log.id)}>
                    Delete
                  </button>
                </div>
              </li>
            ))}
            {inventoryLogs.length === 0 && <p className="text-gray-500 text-center py-2">No logs found.</p>}
          </ul>
        )}
      </div>

      {/* Decoupled Popup */}
      {showPopup && (
        <InvLogPopup 
          onClose={() => setShowPopup(false)}
          onSubmit={handlePopupSubmit}
          initialData={editingLog}
        />
      )}
    </div>
  );
}