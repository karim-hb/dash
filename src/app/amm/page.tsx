import AmmDashboard from '../components/AmmDashboard';

export default function AmmPage() {
  return (
    <div className="min-h-screen">
      <div className="max-w-full px-4 py-3">
        <div className="bg-[#0D1117] border border-[#21262D] shadow-xl">
          <div className="overflow-y-auto" style={{ maxHeight: 'calc(100vh - 200px)', minHeight: '600px' }}>
            <AmmDashboard />
          </div>
        </div>
      </div>
    </div>
  );
}
