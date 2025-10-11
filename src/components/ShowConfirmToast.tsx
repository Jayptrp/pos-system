"use client";

import toast from "react-hot-toast";

export default function showConfirmToast(action: string) {
  return new Promise((resolve) => {
    toast((t) => (
      <div>
        <p>Are you sure you want to {action}?</p>
        <div className="flex gap-2 mt-2">
          <button
            onClick={() => {
              toast.dismiss(t.id);
              resolve(true); // Resolve the promise with true
            }}
            className="px-2 py-1 bg-red-500 text-white rounded"
          >
            Yes
          </button>
          <button
            onClick={() => {
              toast.dismiss(t.id);
              resolve(false); // Resolve the promise with false
            }}
            className="px-2 py-1 bg-gray-200 rounded"
          >
            Cancel
          </button>
        </div>
      </div>
    )
  , {
      position: 'top-center', // This line centers the toast
      style: {
        width: 'auto',
        maxWidth: '400px',
        padding: '16px',
      },
      duration: Infinity, // Keep the toast visible until user action
    });
  });
};