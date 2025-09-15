"use client";

import { ReactNode } from "react";

interface PopupFormProps {
  children: ReactNode;
  onClose: () => void;
}

export default function PopupForm({ children, onClose }: PopupFormProps) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg relative w-96">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-black"
        >
          ✕
        </button>
        {children}
      </div>
    </div>
  );
}
