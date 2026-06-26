import { useState, useEffect } from 'react';
import { 
  DEFAULT_PRODUCTS, 
  DEFAULT_SCAN_LOGS, 
  DEFAULT_ORDERS,
  DEFAULT_TEAM,
  DEFAULT_TASKS,
  DEFAULT_OKRS
} from './data/defaultData';
import { FamilyProduct, ScanLog, FamilyOrder, Task, TeamMember, OKR } from './types';

// Importing Custom Stock Components
import Dashboard from './components/Dashboard';
import ScanStation from './components/ScanStation';
import ProductCatalog from './components/ProductCatalog';
import OrderPlanner from './components/OrderPlanner';
import AuditLedger from './components/AuditLedger';
import CoPilotChat from './components/CoPilotChat';
import ProjectsBoard from './components/ProjectsBoard';
import OKRsTracker from './components/OKRsTracker';

import { 
  LayoutGrid, 
  QrCode, 
  Package, 
  ShoppingCart, 
  Activity, 
  Sparkles, 
  CheckSquare, 
  Target, 
  Menu, 
  X, 
  Clock, 
  Heart,
  ShieldCheck
} from 'lucide-react';

export default function App() {
  // Navigation
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // States with LocalStorage hydration
  const [products, setProducts] = useState<FamilyProduct[]>(() => {
    const saved = localStorage.getItem('effer_family_products');
    return saved ? JSON.parse(saved) : DEFAULT_PRODUCTS;
  });

  const [scanLogs, setScanLogs] = useState<ScanLog[]>(() => {
    const saved = localStorage.getItem('effer_family_scan_logs');
    return saved ? JSON.parse(saved) : DEFAULT_SCAN_LOGS;
  });

  const [orders, setOrders] = useState<FamilyOrder[]>(() => {
    const saved = localStorage.getItem('effer_family_orders');
    return saved ? JSON.parse(saved) : DEFAULT_ORDERS;
  });

  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('effer_tasks');
    return saved ? JSON.parse(saved) : DEFAULT_TASKS;
  });

  const [team, setTeam] = useState<TeamMember[]>(() => {
    const saved = localStorage.getItem('effer_team');
    return saved ? JSON.parse(saved) : DEFAULT_TEAM;
  });

  const [okrs, setOkrs] = useState<OKR[]>(() => {
    const saved = localStorage.getItem('effer_okrs');
    return saved ? JSON.parse(saved) : DEFAULT_OKRS;
  });

  // Persist states to LocalStorage
  useEffect(() => {
    localStorage.setItem('effer_family_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('effer_family_scan_logs', JSON.stringify(scanLogs));
  }, [scanLogs]);

  useEffect(() => {
    localStorage.setItem('effer_family_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('effer_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('effer_okrs', JSON.stringify(okrs));
  }, [okrs]);

  // Catalog modification actions
  const handleAddProduct = (product: FamilyProduct) => {
    setProducts(prev => {
      if (prev.some(p => p.barcode === product.barcode)) return prev;
      return [product, ...prev];
    });
  };

  const handleUpdateProduct = (updated: FamilyProduct) => {
    setProducts(prev => prev.map(p => p.barcode === updated.barcode ? updated : p));
  };

  const handleDeleteProduct = (barcode: string) => {
    setProducts(prev => prev.filter(p => p.barcode !== barcode));
  };

  const handleUpdateProductQuantity = (barcode: string, change: number, mode: 'set' | 'add') => {
    setProducts(prev => prev.map(p => {
      if (p.barcode === barcode) {
        const newQty = mode === 'set' ? change : Math.max(0, p.quantity + change);
        return { ...p, quantity: newQty };
      }
      return p;
    }));
  };

  // Scan Station action
  const handleAddLog = (log: ScanLog) => {
    setScanLogs(prev => [log, ...prev]);
  };

  // Order Planner actions
  const handleAddOrder = (order: FamilyOrder) => {
    setOrders(prev => [order, ...prev]);
  };

  const handleDeleteOrder = (orderId: string) => {
    setOrders(prev => prev.filter(o => o.id !== orderId));
  };

  const handleUpdateOrderStatus = (orderId: string, status: FamilyOrder['status']) => {
    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        // Core auto-restock logic on Order delivery
        if (status === 'RECEIVED' && o.status !== 'RECEIVED') {
          setProducts(currentProducts => currentProducts.map(p => {
            const orderedItem = o.items.find(item => item.barcode === p.barcode);
            if (orderedItem) {
              return { ...p, quantity: p.quantity + orderedItem.quantityNeeded };
            }
            return p;
          }));

          // Automatically publish standard stock receipts on the compliance ledger
          o.items.forEach(item => {
            const logId = `SL-${Math.floor(1000 + Math.random() * 9000)}`;
            const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
            const newLog: ScanLog = {
              id: logId,
              timestamp,
              barcode: item.barcode,
              productName: item.productName,
              type: 'CHECK_IN',
              quantityChange: item.quantityNeeded,
              status: 'SUCCESS',
              message: `Order list auto-receipt: Restocked ${item.quantityNeeded} ${item.unit} via order delivery ${orderId}.`
            };
            setScanLogs(currentLogs => [newLog, ...currentLogs]);
          });
        }
        return { ...o, status };
      }
      return o;
    }));
  };

  // Kanban tasks modifiers
  const handleAddTask = (task: Task) => setTasks(prev => [task, ...prev]);
  const handleUpdateTask = (updated: Task) => {
    setTasks(prev => prev.map(t => t.id === updated.id ? updated : t));
  };
  const handleDeleteTask = (id: string) => setTasks(prev => prev.filter(t => t.id !== id));

  // Goal trackers modifiers
  const handleAddOKR = (okr: OKR) => setOkrs(prev => [okr, ...prev]);
  const handleUpdateOKR = (updated: OKR) => {
    setOkrs(prev => prev.map(o => o.id === updated.id ? updated : o));
  };

  // Side Navigation tabs configuration
  const TABS = [
    { id: 'dashboard', label: 'Effer Overview', icon: LayoutGrid },
    { id: 'scan', label: 'Scan Station', icon: QrCode },
    { id: 'catalog', label: 'Stock Catalog', icon: Package },
    { id: 'orders', label: 'Order Planner', icon: ShoppingCart },
    { id: 'audit', label: 'Compliance Ledger', icon: Activity },
    { id: 'copilot', label: 'Gemini Workspace', icon: Sparkles, highlight: true },
    { id: 'projects', label: 'Sprint Planner', icon: CheckSquare },
    { id: 'okrs', label: 'Family Goals', icon: Target }
  ];

  return (
    <div className="min-h-screen bg-[#FBFBFD] text-[#1D1D1F] flex flex-col md:flex-row font-sans selection:bg-blue-100">
      
      {/* Mobile Top Header */}
      <header className="md:hidden bg-[#F5F5F7] border-b border-gray-200 px-6 py-4 flex items-center justify-between z-45 shrink-0">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 mr-1">
            <div className="w-2 h-2 rounded-full bg-[#FF5F57]"></div>
            <div className="w-2 h-2 rounded-full bg-[#FFBD2E]"></div>
            <div className="w-2 h-2 rounded-full bg-[#28C840]"></div>
          </div>
          <span className="font-sans font-bold tracking-tight text-[#1D1D1F]">Effer FMD</span>
        </div>
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-1.5 bg-white border border-gray-200 rounded-lg text-gray-600"
        >
          {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </header>

      {/* Navigation Sidebar (Desktop + Mobile overlay) */}
      <nav className={`
        fixed md:static inset-0 bg-[#F5F5F7] border-r border-gray-200 z-50 md:z-auto
        w-64 flex flex-col justify-between p-6 shrink-0 transition-transform duration-300 md:translate-x-0
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="space-y-6">
          {/* macOS window actions dots */}
          <div className="hidden md:flex items-center gap-2 px-1">
            <div className="w-3 h-3 rounded-full bg-[#FF5F57]"></div>
            <div className="w-3 h-3 rounded-full bg-[#FFBD2E]"></div>
            <div className="w-3 h-3 rounded-full bg-[#28C840]"></div>
          </div>

          {/* Brand Identity / Logo */}
          <div className="flex items-center justify-between border-b border-gray-200 pb-5">
            <div className="flex items-center gap-2.5">
              <span className="p-2 bg-black text-white rounded-xl shadow-xs">
                <QrCode size={16} />
              </span>
              <div>
                <span className="font-sans font-bold text-[#1D1D1F] text-base tracking-tight">Effer FMD</span>
                <p className="text-[9px] font-mono font-bold text-gray-400 mt-0.5 tracking-wider uppercase">Active Station</p>
              </div>
            </div>
            {/* Mobile close menu */}
            <button 
              onClick={() => setIsMobileMenuOpen(false)}
              className="md:hidden p-1.5 bg-gray-200/50 rounded-lg text-gray-500"
            >
              <X size={16} />
            </button>
          </div>

          {/* Navigation Links */}
          <div className="space-y-4">
            <h3 className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest px-1">System</h3>
            <div className="space-y-1">
              {TABS.map(tab => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;

                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`
                      w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold tracking-wide transition-all
                      ${isActive 
                        ? 'bg-white text-gray-900 shadow-sm border border-gray-200/45 font-bold' 
                        : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200/50'
                      }
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <Icon size={14} className={isActive ? 'text-blue-500' : 'text-gray-400'} />
                      <span>{tab.label}</span>
                    </div>
                    {tab.highlight && !isActive && (
                      <span className="w-1.5 h-1.5 bg-blue-500 rounded-full shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Workspace info & system status */}
        <div className="border-t border-gray-200 pt-5 space-y-4">
          <div className="p-4 bg-gradient-to-br from-[#1c1c1e] to-neutral-800 rounded-xl text-white shadow-sm flex items-start gap-2.5">
            <ShieldCheck size={16} className="text-blue-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-[10px] font-semibold opacity-70">Security Protocol</p>
              <p className="text-xs font-bold leading-tight">EU-FMD Compliant</p>
            </div>
          </div>
          <div className="text-[9px] text-gray-400 font-mono text-center flex items-center gap-1.5 justify-center">
            <Clock size={10} /> <span>v4.0.0 — Secured</span>
          </div>
        </div>
      </nav>

      {/* Main content viewport */}
      <main className="flex-1 p-6 md:p-10 lg:p-12 overflow-y-auto max-w-7xl mx-auto w-full">
        {activeTab === 'dashboard' && (
          <Dashboard 
            products={products}
            scanLogs={scanLogs}
            onNavigate={(tab) => setActiveTab(tab)} 
          />
        )}
        {activeTab === 'scan' && (
          <ScanStation
            products={products}
            onAddLog={handleAddLog}
            onUpdateProductQuantity={handleUpdateProductQuantity}
            onRegisterNewProduct={handleAddProduct}
          />
        )}
        {activeTab === 'catalog' && (
          <ProductCatalog
            products={products}
            onAddProduct={handleAddProduct}
            onUpdateProduct={handleUpdateProduct}
            onDeleteProduct={handleDeleteProduct}
            onUpdateProductQuantity={handleUpdateProductQuantity}
          />
        )}
        {activeTab === 'orders' && (
          <OrderPlanner
            products={products}
            orders={orders}
            onAddOrder={handleAddOrder}
            onUpdateOrderStatus={handleUpdateOrderStatus}
            onDeleteOrder={handleDeleteOrder}
          />
        )}
        {activeTab === 'audit' && (
          <AuditLedger scanLogs={scanLogs} />
        )}
        {activeTab === 'copilot' && (
          <CoPilotChat 
            products={products}
            scanLogs={scanLogs}
            orders={orders}
            tasks={tasks}
            okrs={okrs}
            team={team}
            onAddProduct={handleAddProduct}
            onAddOrder={handleAddOrder}
            onAddTask={handleAddTask}
            onAddOKR={handleAddOKR}
            onUpdateProductQuantity={handleUpdateProductQuantity}
            onUpdateOrderStatus={handleUpdateOrderStatus}
            onDeleteProduct={handleDeleteProduct}
            onDeleteOrder={handleDeleteOrder}
            onDeleteTask={handleDeleteTask}
            onAddLog={handleAddLog}
          />
        )}
        {activeTab === 'projects' && (
          <ProjectsBoard 
            tasks={tasks} 
            team={team} 
            onAddTask={handleAddTask} 
            onUpdateTask={handleUpdateTask} 
            onDeleteTask={handleDeleteTask} 
          />
        )}
        {activeTab === 'okrs' && (
          <OKRsTracker 
            okrs={okrs} 
            team={team} 
            onAddOKR={handleAddOKR} 
            onUpdateOKR={handleUpdateOKR} 
          />
        )}
      </main>
    </div>
  );
}
