import type { Metadata } from 'next';
import '@/styles/globals.css';

export const metadata: Metadata = {
  title: 'POS System',
  description: 'Point of Sale system built with Next.js App Router & TypeScript',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
            <li><a href="/menu-items">Menu Items</a></li>
            <li><a href="/orders">Orders</a></li>
          </ul>
        </nav>

        <main className="p-6">{children}</main>

        <footer className="p-4 bg-gray-100 text-center text-sm">
          &copy; 2025 POS System
        </footer>
      </body>
    </html>
  );
}
