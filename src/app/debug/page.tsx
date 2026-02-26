"use client";

import CategorySection from "./categories/CategorySection";
import MenuItemSection from "./menu-items/MenuItemSection";
import OrderSection from "./orders/OrderSection";
import InventoryLogSection from "./inventory-logs/InventoryLogSection";
// import PaymentSection from "./payments/PaymentSection";

export default function DebugPage() {
  return (
    <div className="max-w-xl mx-auto py-6 space-y-8">
      <h1 className="text-3xl font-bold">Debug Dashboard</h1>

      {/* Each section corresponds to a table */}
      <CategorySection />
      <MenuItemSection />
      <OrderSection />
      <InventoryLogSection />
      {/* <PaymentSection /> */}

      {/* You can add more sections for other tables */}
    </div>
  );
}
