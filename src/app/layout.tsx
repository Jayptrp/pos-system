import type { Metadata } from 'next';
import '@/styles/globals.css';
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: 'POS System',
  description: 'Point of Sale system built with Next.js App Router & TypeScript',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="p-4 bg-blue-600 text-white font-bold">
          POS System
        </header>

        <nav className="bg-gray-200 p-4">
          <ul className="flex space-x-4">
            <li><a href="/">Home</a></li>
            <li><a href="/categories">Categories</a></li>
            <li><a href="/inventory">Menu Items</a></li>
            <li><a href="/orders">Orders</a></li>
            <li><a href="/debug">Debug</a></li>
          </ul>
        </nav>

        <main className="p-6">{children}</main>
        <Toaster position="bottom-right" reverseOrder={false} />

        <footer className="p-4 bg-gray-100 text-center text-sm">
          &copy; 2025 POS System
        </footer>
      </body>
    </html>
  );
}
