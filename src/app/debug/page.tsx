"use client";

import CategorySection from "./categories/CategorySection";
import MenuItemSection from "./menu-items/MenuItemSection";

export default function DebugPage() {
  return (
    <div className="p-6 space-y-8">
      <h1 className="text-3xl font-bold">Debug Dashboard</h1>

      {/* Each section corresponds to a table */}
      <CategorySection />
      <MenuItemSection />

      {/* You can add more sections for other tables */}
    </div>
  );
}
