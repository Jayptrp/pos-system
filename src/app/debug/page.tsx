"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import CategorySection from "./categories/CategorySection";
import MenuItemSection from "./menu-items/MenuItemSection";
import OrderSection from "./orders/OrderSection";
import InventoryLogSection from "./inventory-logs/InventoryLogSection";

export default function DebugPage() {
  const router = useRouter();

  useEffect(() => {
    if (process.env.NODE_ENV !== "development") {
      router.replace("/");
    }
  }, [router]);

  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  return (
    <div className="max-w-xl mx-auto py-6 space-y-8">
      <h1 className="text-3xl font-bold">Debug Dashboard</h1>

      {/* Each section corresponds to a table */}
      <CategorySection />
      <MenuItemSection />
      <OrderSection />
      <InventoryLogSection />
    </div>
  );
}
