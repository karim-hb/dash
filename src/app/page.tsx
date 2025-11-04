import Link from 'next/link';

export default function Home() {
  const navigationItems = [
    { href: '/dashboard', label: '📊 ANALYTICS TERMINAL' },
    { href: '/amm', label: '📈 AMM DASHBOARD' },
    { href: '/opportunities', label: '💎 OPPORTUNITIES' },
    { href: '/live', label: '🔴 LIVE FEED' },
    { href: '/included', label: '✅ INCLUDED' },
    { href: '/tokens', label: '💹 TOKENS' },
    { href: '/pools', label: '🏦 POOLS' },
    { href: '/oracle', label: '🛰️ ORACLES' },
  ];

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 text-[#0066FF]">
            Ξ BLOOMBERG TERMINAL v3.0.0
          </h1>
          <p className="text-[#8B949E] text-lg">
            ETHEREUM ANALYTICS PLATFORM
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {navigationItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="bg-[#161B22] border border-[#21262D] rounded-lg p-6 hover:bg-[#21262D] hover:border-[#0066FF]/50 transition-all duration-200 group"
            >
              <div className="text-center">
                <div className="text-2xl mb-2">{item.label.split(' ')[0]}</div>
                <div className="text-[#8B949E] font-mono text-sm group-hover:text-[#0066FF] transition-colors">
                  {item.label.substring(item.label.indexOf(' ') + 1)}
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="text-center">
          <div className="inline-flex items-center gap-4 bg-[#161B22] border border-[#21262D] rounded-lg px-6 py-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-[#00FF66] rounded-full animate-pulse"></div>
              <span className="text-[#00FF66] font-mono text-sm">LIVE</span>
            </div>
            <div className="w-px h-4 bg-[#21262D]"></div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-[#0066FF] rounded-full animate-pulse"></div>
              <span className="text-[#0066FF] font-mono text-sm">SYNC</span>
            </div>
            <div className="w-px h-4 bg-[#21262D]"></div>
            <div className="text-[#C9D1D9] font-mono text-sm">
              {new Date().toLocaleTimeString('en-US', { hour12: false, timeZone: 'America/New_York' })} EST
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}