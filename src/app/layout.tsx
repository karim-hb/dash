import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Ethereum Mempool Tracker',
  description: 'Real-time Ethereum transaction monitoring',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-900 text-white min-h-screen">
        {children}
      </body>
    </html>
  );
}