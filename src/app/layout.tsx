import type { Metadata } from 'next';
import Link from 'next/link';
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
        {/* Bloomberg Terminal Header */}
        <header className="bg-[#0D1117] border-b-2 border-[#0066FF] px-5 py-3.5 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-1.5 h-8 bg-[#0066FF] shadow-[0_0_8px_rgba(0,102,255,0.5)]"></div>
              <div className="text-[#0066FF] font-mono text-[15px] font-bold tracking-[0.15em]">
                Ξ BLOOMBERG TERMINAL v3.0.0
              </div>
              <div className="text-[#8B949E] font-mono text-[10px] tracking-wide border-l-2 border-[#21262D] pl-4">
                ETHEREUM ANALYTICS PLATFORM
              </div>
            </div>

            {/* Status Bar */}
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 bg-[#00FF66] rounded-full animate-pulse shadow-[0_0_6px_rgba(0,255,102,0.6)]"></div>
                <span className="text-[#00FF66] font-mono text-[10px] font-bold tracking-wide">LIVE</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 bg-[#0066FF] rounded-full animate-pulse shadow-[0_0_6px_rgba(0,102,255,0.6)]"></div>
                <span className="text-[#0066FF] font-mono text-[10px] font-bold tracking-wide">SYNC</span>
              </div>
            <div className="text-[#C9D1D9] font-mono text-[11px] font-bold tracking-wide border-l-2 border-[#21262D] pl-4">
              {new Date().toLocaleTimeString('en-US', { hour12: false, timeZone: 'America/New_York' })} EST
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="bg-[#161B22] border-b border-[#21262D] px-5 py-2">
          <div className="flex gap-1 overflow-x-auto">
            {[
              { href: '/', label: '🏠 HOME' },
              { href: '/dashboard', label: '📊 ANALYTICS' },
              { href: '/amm', label: '📈 AMM DASHBOARD' },
              { href: '/pools', label: '🏦 POOLS' },
              { href: '/opportunities', label: '💎 OPPORTUNITIES' },
              { href: '/live', label: '🔴 LIVE FEED' },
              { href: '/included', label: '✅ INCLUDED' },
              { href: '/tokens', label: '💹 TOKENS' },
              { href: '/oracle', label: '🛰️ ORACLES' },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="font-mono text-[10px] px-4 py-2 border-b-2 transition-all tracking-wider font-bold rounded-t whitespace-nowrap text-[#8B949E] border-transparent hover:text-[#0066FF] hover:bg-[#21262D] hover:border-[#0066FF]/30"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </nav>
        </header>

        <div className="min-h-screen bg-linear-to-br from-[#0D1117] via-[#161B22] to-[#0D1117]">
          {children}
        </div>

        {/* Footer */}
        <footer className="bg-[#0D1117] border-t-2 border-[#0066FF] px-5 py-3.5 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 bg-[#00FF66] rounded-full animate-pulse shadow-[0_0_6px_rgba(0,255,102,0.6)]"></div>
                <span className="text-[#00FF66] font-mono text-[10px] font-bold tracking-wide">WS ACTIVE</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 bg-[#0066FF] rounded-full animate-pulse shadow-[0_0_6px_rgba(0,102,255,0.6)]"></div>
                <span className="text-[#0066FF] font-mono text-[10px] font-bold tracking-wide">RPC SYNC</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 bg-[#8B949E] rounded-full"></div>
                <span className="text-[#8B949E] font-mono text-[10px] font-bold tracking-wide">NO ERRORS</span>
              </div>
              <div className="text-[#C9D1D9] font-mono text-[9px] border-l-2 border-[#21262D] pl-4">
                ETH/USD: $3,856.42 | BTC/USD: $69,420.15
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-[#0066FF] font-mono text-[10px] font-bold tracking-[0.15em]">
                BLOOMBERG TERMINAL v3.0.0
              </div>
              <div className="w-1.5 h-5 bg-[#0066FF] shadow-[0_0_8px_rgba(0,102,255,0.5)]"></div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}