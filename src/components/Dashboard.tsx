import React from 'react';
import { motion } from 'motion/react';
import { FamilyProduct, ScanLog } from '../types';
import { 
  Plus, 
  ArrowRight, 
  Activity, 
  Heart, 
  AlertTriangle, 
  QrCode, 
  ShieldCheck, 
  ShoppingCart, 
  Sparkles, 
  Package, 
  CheckCircle2, 
  Layers 
} from 'lucide-react';

interface DashboardProps {
  products: FamilyProduct[];
  scanLogs: ScanLog[];
  onNavigate: (tab: string) => void;
}

export default function Dashboard({ products, scanLogs, onNavigate }: DashboardProps) {
  const totalStock = products.reduce((acc, curr) => acc + curr.quantity, 0);
  const lowStockProducts = products.filter(p => p.quantity <= p.minStock);
  const favoriteProducts = products.filter(p => p.isFavorite);

  // Group by category for a custom elegant distribution display
  const categoryCounts: Record<string, number> = {};
  products.forEach(p => {
    categoryCounts[p.category] = (categoryCounts[p.category] || 0) + p.quantity;
  });

  const getLogSeverityStyle = (status: ScanLog['status']) => {
    switch (status) {
      case 'FAILED':
        return 'bg-red-50 text-red-700 border-red-100/30';
      case 'WARNING':
        return 'bg-amber-50 text-amber-700 border-amber-100/30';
      default:
        return 'bg-blue-50 text-blue-700 border-blue-100/30';
    }
  };

  const getLogTypeBadgeStyle = (type: ScanLog['type']) => {
    switch (type) {
      case 'CHECK_IN':
        return 'bg-emerald-50 text-emerald-700 border-emerald-100/35';
      case 'CHECK_OUT':
        return 'bg-amber-50 text-amber-700 border-amber-100/35';
      case 'DECOMMISSION':
        return 'bg-red-50 text-red-700 border-red-100/35';
      default:
        return 'bg-blue-50 text-blue-700 border-blue-100/35';
    }
  };

  return (
    <div className="space-y-10">
      {/* Welcome Header Section */}
      <div className="border-b border-gray-100 pb-10">
        <div className="inline-block px-2.5 py-1 bg-blue-50 text-blue-600 text-[10px] font-bold uppercase tracking-widest rounded mb-4">
          FMD Compliance & Family Order Workspace
        </div>
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 mb-4 leading-none">
          Effer Family FMD
        </h1>
        <p className="text-lg md:text-xl text-gray-400 font-light max-w-3xl leading-relaxed">
          Your custom-crafted home stock inventory & verification hub. Safeguard medicines, track personal favorites, and manage grocery levels. Fully compatible with hardware barcode scanners.
        </p>
        <div className="pt-6 flex flex-wrap gap-3">
          <button 
            onClick={() => onNavigate('scan')}
            className="px-5 py-2.5 rounded-full bg-black text-white hover:bg-gray-800 font-semibold text-xs transition-all inline-flex items-center gap-2 shadow-sm"
          >
            <QrCode size={14} className="text-blue-400 animate-pulse" /> Launch Scan Station
          </button>
          <button 
            onClick={() => onNavigate('catalog')}
            className="px-5 py-2 rounded-full bg-gray-150 text-gray-900 hover:bg-gray-200 font-semibold text-xs transition-all inline-flex items-center gap-1.5"
          >
            Product Catalog <ArrowRight size={13} />
          </button>
        </div>
      </div>

      {/* Bento Grid Analytics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* Metric 1: Total Stock */}
        <motion.div 
          whileHover={{ y: -2 }}
          transition={{ duration: 0.15 }}
          className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-xs flex flex-col justify-between"
        >
          <div>
            <div className="flex justify-between items-center mb-4">
              <span className="p-2 bg-gray-50 rounded-xl border border-gray-100 text-gray-500">
                <Package size={18} />
              </span>
              <span className="text-[9px] font-mono font-bold text-gray-400 uppercase tracking-wider">Total Stock</span>
            </div>
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Available Units</h3>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-4xl font-bold tracking-tight text-gray-900">{totalStock}</span>
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100/50 uppercase tracking-wide">In Cabinet</span>
            </div>
          </div>
          <button 
            onClick={() => onNavigate('catalog')}
            className="mt-6 text-xs font-medium text-gray-400 hover:text-black inline-flex items-center gap-1 self-start transition-all"
          >
            Manage Catalog <ArrowRight size={11} />
          </button>
        </motion.div>

        {/* Metric 2: Favorites */}
        <motion.div 
          whileHover={{ y: -2 }}
          transition={{ duration: 0.15 }}
          className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-xs flex flex-col justify-between"
        >
          <div>
            <div className="flex justify-between items-center mb-4">
              <span className="p-2 bg-rose-50 rounded-xl border border-rose-100 text-rose-500">
                <Heart size={18} className="fill-rose-500" />
              </span>
              <span className="text-[9px] font-mono font-bold text-gray-400 uppercase tracking-wider">My Favorites</span>
            </div>
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Liked Things</h3>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-4xl font-bold tracking-tight text-gray-900">{favoriteProducts.length}</span>
              <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-100/50 uppercase tracking-wide">Starred</span>
            </div>
          </div>
          <button 
            onClick={() => onNavigate('catalog')}
            className="mt-6 text-xs font-medium text-gray-400 hover:text-black inline-flex items-center gap-1 self-start transition-all"
          >
            Review Favorites <ArrowRight size={11} />
          </button>
        </motion.div>

        {/* Metric 3: Low Stock Alerts */}
        <motion.div 
          whileHover={{ y: -2 }}
          transition={{ duration: 0.15 }}
          className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-xs flex flex-col justify-between"
        >
          <div>
            <div className="flex justify-between items-center mb-4">
              <span className="p-2 bg-amber-50 rounded-xl border border-amber-100 text-amber-500">
                <AlertTriangle size={18} />
              </span>
              <span className="text-[9px] font-mono font-bold text-gray-400 uppercase tracking-wider">Alerts</span>
            </div>
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Low Stock Items</h3>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-4xl font-bold tracking-tight text-gray-900">{lowStockProducts.length}</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wide ${
                lowStockProducts.length > 0 
                  ? 'bg-amber-50 border-amber-100 text-amber-600' 
                  : 'bg-emerald-50 border-emerald-100 text-emerald-600'
              }`}>
                {lowStockProducts.length > 0 ? 'Needs Reorder' : 'Sufficient'}
              </span>
            </div>
          </div>
          <button 
            onClick={() => onNavigate('orders')}
            className="mt-6 text-xs font-medium text-gray-400 hover:text-black inline-flex items-center gap-1 self-start transition-all"
          >
            Plan Shopping <ArrowRight size={11} />
          </button>
        </motion.div>

        {/* Metric 4: Verified Safeties */}
        <motion.div 
          whileHover={{ y: -2 }}
          transition={{ duration: 0.15 }}
          className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-xs flex flex-col justify-between"
        >
          <div>
            <div className="flex justify-between items-center mb-4">
              <span className="p-2 bg-blue-50 rounded-xl border border-blue-100 text-blue-500">
                <ShieldCheck size={18} />
              </span>
              <span className="text-[9px] font-mono font-bold text-gray-400 uppercase tracking-wider">Security</span>
            </div>
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest">FMD Verification</h3>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-4xl font-bold tracking-tight text-gray-900">100%</span>
              <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100/50 uppercase tracking-wide">Tamper Proof</span>
            </div>
          </div>
          <button 
            onClick={() => onNavigate('scan')}
            className="mt-6 text-xs font-medium text-gray-400 hover:text-black inline-flex items-center gap-1 self-start transition-all"
          >
            Run Safety Test <ArrowRight size={11} />
          </button>
        </motion.div>

      </div>

      {/* Main Grid: Category distribution & Recent Scan Ledger */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Category Distribution Meter */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-xs lg:col-span-1 space-y-6">
          <div className="flex justify-between items-center border-b border-gray-100 pb-4">
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <Layers size={18} className="text-gray-400" /> Stock by Category
            </h3>
            <span className="text-[10px] font-mono font-bold bg-gray-100 text-gray-500 px-2 py-0.5 rounded border border-gray-200/40 uppercase tracking-wider">
              {Object.keys(categoryCounts).length} sectors
            </span>
          </div>

          <div className="space-y-4">
            {Object.entries(categoryCounts).map(([cat, count]) => {
              const maxVal = Math.max(...Object.values(categoryCounts), 1);
              const percentage = Math.round((count / maxVal) * 100);
              return (
                <div key={cat} className="space-y-1.5 text-xs">
                  <div className="flex justify-between font-medium">
                    <span className="text-gray-700">{cat}</span>
                    <span className="font-mono text-gray-500 font-bold">{count} items</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                    <div 
                      className="bg-blue-500 h-1.5 rounded-full transition-all duration-700"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}

            {Object.keys(categoryCounts).length === 0 && (
              <p className="text-xs text-gray-400 italic text-center py-6">No inventory categories loaded yet.</p>
            )}
          </div>

          <div className="p-4 bg-[#F5F5F7] rounded-xl border border-gray-150 flex items-start gap-3">
            <span className="p-1.5 bg-white text-blue-500 rounded-lg border border-gray-200/50 shrink-0">
              <ShoppingCart size={13} />
            </span>
            <div className="text-[11px] text-gray-500 leading-relaxed">
              <p className="font-bold text-gray-800">Auto-Shopping Engine Active</p>
              <p className="mt-0.5 font-light">Effer FMD checks quantities continuously. Low items are automatically recommended to the reorder planner tab.</p>
            </div>
          </div>
        </div>

        {/* Right Side: Scan & FMD Log Ledger */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-xs lg:col-span-2 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-4">
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Activity size={18} className="text-gray-400" /> Recent FMD Scan Ledger
              </h3>
              <button 
                onClick={() => onNavigate('logs')}
                className="text-[10px] font-mono font-bold text-blue-600 uppercase hover:underline"
              >
                View Full Audit
              </button>
            </div>

            <div className="space-y-3.5 max-h-[350px] overflow-y-auto pr-1">
              {scanLogs.slice(0, 5).map(log => (
                <div 
                  key={log.id} 
                  className="flex items-start justify-between p-3.5 bg-gray-50/50 border border-gray-100 rounded-xl text-xs gap-4 hover:bg-gray-50 transition-all"
                >
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${getLogTypeBadgeStyle(log.type)}`}>
                        {log.type}
                      </span>
                      <span className="font-bold text-gray-850 truncate">{log.productName}</span>
                    </div>
                    <p className="text-[11px] text-gray-400 font-light">{log.message}</p>
                    <div className="text-[9px] font-mono text-gray-400 flex items-center gap-2">
                      <span>Barcode: <strong className="text-gray-600 font-semibold">{log.barcode}</strong></span>
                      <span>•</span>
                      <span>{log.timestamp}</span>
                    </div>
                  </div>

                  <span className={`px-2 py-0.5 text-[9px] font-mono font-bold rounded-md uppercase shrink-0 border ${getLogSeverityStyle(log.status)}`}>
                    {log.status}
                  </span>
                </div>
              ))}

              {scanLogs.length === 0 && (
                <div className="text-center py-12 text-gray-450 text-xs">
                  <CheckCircle2 size={24} className="mx-auto text-gray-300 mb-2" />
                  <p className="font-light">No barcode scan records logged yet.</p>
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-gray-100 flex justify-end">
            <button
              onClick={() => onNavigate('scan')}
              className="px-4 py-2 bg-black hover:bg-gray-800 text-white rounded-full text-xs font-semibold flex items-center gap-1"
            >
              Scan Barcode Now <ArrowRight size={12} />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
