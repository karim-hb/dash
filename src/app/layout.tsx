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
      <body className="bg-[#0D1117] text-[#C9D1D9] min-h-screen font-mono">
        <div className="min-h-screen bg-gradient-to-br from-[#0D1117] via-[#161B22] to-[#0D1117]">
          {children}
        </div>
      </body>
    </html>
  );
}