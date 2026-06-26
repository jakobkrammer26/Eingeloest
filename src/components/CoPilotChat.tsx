import React, { useState, useRef, useEffect } from 'react';
import { 
  FamilyProduct, 
  ScanLog, 
  FamilyOrder, 
  Task, 
  OKR, 
  TeamMember, 
  ChatMessage 
} from '../types';
import { 
  Sparkles, 
  Send, 
  RefreshCw, 
  User, 
  Code, 
  Briefcase, 
  ShieldCheck, 
  FileText,
  Clock,
  ShoppingCart,
  Package,
  CheckSquare,
  Target,
  Check,
  Database,
  Activity,
  Trash2
} from 'lucide-react';

interface ExtendedChatMessage extends ChatMessage {
  actions?: {
    name: string;
    args: any;
  }[];
}

interface CoPilotProps {
  products: FamilyProduct[];
  scanLogs: ScanLog[];
  orders: FamilyOrder[];
  tasks: Task[];
  okrs: OKR[];
  team: TeamMember[];
  onAddProduct: (product: FamilyProduct) => void;
  onAddOrder: (order: FamilyOrder) => void;
  onAddTask: (task: Task) => void;
  onAddOKR: (okr: OKR) => void;
  onUpdateProductQuantity: (barcode: string, change: number, mode: 'set' | 'add') => void;
  onUpdateOrderStatus: (orderId: string, status: FamilyOrder['status']) => void;
  onDeleteProduct: (barcode: string) => void;
  onDeleteOrder: (orderId: string) => void;
  onDeleteTask: (id: string) => void;
  onAddLog: (log: ScanLog) => void;
}

export default function CoPilotChat({
  products,
  scanLogs,
  orders,
  tasks,
  okrs,
  team,
  onAddProduct,
  onAddOrder,
  onAddTask,
  onAddOKR,
  onUpdateProductQuantity,
  onUpdateOrderStatus,
  onDeleteProduct,
  onDeleteOrder,
  onDeleteTask,
  onAddLog
}: CoPilotProps) {
  const [messages, setMessages] = useState<ExtendedChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      content: "Hello! I am your Effer Operations Co-Pilot. I have direct access to your Stock Catalog, Order Planner, Kanban Board, and Goal Trackers. You can ask me to analyze stock levels, create restock orders, register products, schedule tasks, or align OKRs. Try selecting an AI preset or typing a command!",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<string>('strategy');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Focus Presets defining the systemInstruction
  const PRESETS = [
    {
      id: 'strategy',
      label: 'Organizational Strategy',
      icon: Briefcase,
      instruction: "You are the Effer Corporate Strategy Consultant. Advise the user on team design, strategic roadmaps, hiring priorities, and operational improvements. Keep responses structured, concise, and professional."
    },
    {
      id: 'announcements',
      label: 'Corporate Comms Writer',
      icon: FileText,
      instruction: "You are the Effer Lead Communications Writer. Draft pristine internal company newsletters, slack notifications, policies summaries, and executive email drafts. Focus on motivating, clear, and professional tone."
    },
    {
      id: 'compliance',
      label: 'SOC2 & InfoSec Advisor',
      icon: ShieldCheck,
      instruction: "You are the Effer InfoSec compliance auditor. Advise on security procedures, SOC2 checklist preparation, network isolation protocols, static code analysis warnings, and data isolation controls."
    }
  ];

  const activePreset = PRESETS.find(p => p.id === selectedPreset) || PRESETS[0];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const executeToolCall = (call: any) => {
    const { name, args } = call;
    try {
      if (name === 'createOrder') {
        const orderId = `FO-${Math.floor(100 + Math.random() * 900)}`;
        const newOrder: FamilyOrder = {
          id: orderId,
          date: new Date().toISOString().split('T')[0],
          status: 'PENDING',
          items: args.items || [],
          notes: args.notes || 'Generated via operations Co-Pilot.'
        };
        onAddOrder(newOrder);
        
        // Also trigger logging for auditing compliance
        const logId = `SL-${Math.floor(1000 + Math.random() * 9000)}`;
        const firstItem = args.items?.[0];
        onAddLog({
          id: logId,
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
          barcode: firstItem?.barcode || '12000000',
          productName: firstItem?.productName || 'Multiple items',
          type: 'VERIFY',
          quantityChange: 0,
          status: 'SUCCESS',
          message: `Co-Pilot automatically compiled and logged pending order ${orderId}.`
        });
      } else if (name === 'createProduct') {
        const newProduct: FamilyProduct = {
          barcode: args.barcode,
          name: args.name,
          description: args.description || '',
          category: args.category,
          quantity: Number(args.quantity) || 0,
          unit: args.unit || 'pcs',
          minStock: Number(args.minStock) || 0,
          isFavorite: !!args.isFavorite,
          expiryDate: args.expiryDate,
          serialNumber: args.serialNumber
        };
        onAddProduct(newProduct);

        const logId = `SL-${Math.floor(1000 + Math.random() * 9000)}`;
        onAddLog({
          id: logId,
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
          barcode: args.barcode,
          productName: args.name,
          type: 'CHECK_IN',
          quantityChange: Number(args.quantity) || 0,
          status: 'SUCCESS',
          message: `Co-Pilot registered new catalog entry: ${args.name}.`
        });
      } else if (name === 'updateProductQuantity') {
        onUpdateProductQuantity(args.barcode, Number(args.change), args.mode);

        const matchedProduct = products.find(p => p.barcode === args.barcode);
        const prodName = matchedProduct ? matchedProduct.name : 'Unknown Item';
        const logId = `SL-${Math.floor(1000 + Math.random() * 9000)}`;
        onAddLog({
          id: logId,
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
          barcode: args.barcode,
          productName: prodName,
          type: Number(args.change) >= 0 ? 'CHECK_IN' : 'CHECK_OUT',
          quantityChange: Number(args.change),
          status: 'SUCCESS',
          message: `Co-Pilot adjusted stock levels for barcode: ${args.barcode}.`
        });
      } else if (name === 'createTask') {
        const taskId = `TSK-${Math.floor(100 + Math.random() * 900)}`;
        const newTask: Task = {
          id: taskId,
          title: args.title,
          description: args.description || '',
          priority: args.priority || 'medium',
          stage: args.stage || 'todo',
          dueDate: args.dueDate || new Date().toISOString().split('T')[0],
          assigneeId: args.assigneeId,
          tags: args.tags || []
        };
        onAddTask(newTask);
      } else if (name === 'createOKR') {
        const okrId = `OKR-${Math.floor(100 + Math.random() * 900)}`;
        const newOKR: OKR = {
          id: okrId,
          title: args.title,
          progress: Number(args.progress) || 0,
          ownerId: args.ownerId,
          objective: args.objective,
          department: args.department
        };
        onAddOKR(newOKR);
      } else if (name === 'deleteOrder') {
        onDeleteOrder(args.orderId);
      } else if (name === 'deleteProduct') {
        onDeleteProduct(args.barcode);
      } else if (name === 'deleteTask') {
        onDeleteTask(args.id);
      }
    } catch (e) {
      console.error("Error executing Co-Pilot action locally:", e);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim() || isLoading) return;

    const userMsg: ExtendedChatMessage = {
      id: `msg_${Date.now()}_u`,
      role: 'user',
      content: userInput,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setUserInput('');
    setIsLoading(true);

    try {
      const chatHistory = [...messages, userMsg].map(m => ({
        role: m.role,
        content: m.content
      }));

      const res = await fetch('/api/gemini/co-pilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: chatHistory,
          systemInstruction: activePreset.instruction,
          products,
          orders,
          scanLogs,
          tasks,
          okrs,
          team
        })
      });

      if (!res.ok) throw new Error('Failed to fetch from co-pilot API');
      const data = await res.json();

      // If function calls are returned (either real or simulated), execute them
      if (data.functionCalls && Array.isArray(data.functionCalls)) {
        for (const call of data.functionCalls) {
          executeToolCall(call);
        }
      }

      const aiMsg: ExtendedChatMessage = {
        id: `msg_${Date.now()}_a`,
        role: 'model',
        content: data.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actions: data.functionCalls || []
      };

      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      console.error(err);
      const errMsg: ExtendedChatMessage = {
        id: `msg_${Date.now()}_err`,
        role: 'model',
        content: 'Error: Failed to fetch a response from the strategy co-pilot. Please check your dev server configuration and try again.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: 'welcome',
        role: 'model',
        content: `Active preset: ${activePreset.label}. I am connected to all database records and ready to assist you. Ask me to restock products, schedule items, or analyze compliance!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  const renderActionWidget = (action: any, index: number) => {
    const { name, args } = action;
    
    if (name === 'createOrder') {
      return (
        <div key={index} className="mt-3 p-3.5 bg-emerald-50/80 border border-emerald-200 rounded-xl flex items-start gap-3 text-gray-800 shadow-2xs max-w-sm">
          <span className="p-2 bg-emerald-500 text-white rounded-lg shadow-xs shrink-0">
            <ShoppingCart size={13} />
          </span>
          <div className="text-[11px] flex-1">
            <p className="font-bold text-emerald-950">Restock Order Placed</p>
            <div className="mt-1 space-y-1">
              {args.items?.map((item: any, idx: number) => (
                <p key={idx} className="text-emerald-800 font-medium">
                  • {item.productName} ({item.quantityNeeded} {item.unit})
                </p>
              ))}
            </div>
            {args.notes && <p className="text-emerald-700/80 mt-1 italic text-[10px]">"{args.notes}"</p>}
            <span className="inline-flex items-center gap-1 text-[9px] font-mono font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded mt-2 uppercase">
              <Check size={8} /> Sync Complete
            </span>
          </div>
        </div>
      );
    }

    if (name === 'createProduct') {
      return (
        <div key={index} className="mt-3 p-3.5 bg-blue-50/80 border border-blue-200 rounded-xl flex items-start gap-3 text-gray-800 shadow-2xs max-w-sm">
          <span className="p-2 bg-blue-500 text-white rounded-lg shadow-xs shrink-0">
            <Package size={13} />
          </span>
          <div className="text-[11px] flex-1">
            <p className="font-bold text-blue-950">New Product Registered</p>
            <p className="text-blue-800 font-semibold mt-1">
              {args.name}
            </p>
            <p className="text-gray-500 mt-0.5">Barcode: {args.barcode} • Initial Stock: {args.quantity} {args.unit}</p>
            <p className="text-gray-500 mt-0.5">Category: {args.category}</p>
            {args.expiryDate && <p className="text-gray-500 mt-0.5 font-mono">Expiry: {args.expiryDate}</p>}
            <span className="inline-flex items-center gap-1 text-[9px] font-mono font-bold text-blue-700 bg-blue-100 px-1.5 py-0.5 rounded mt-2.5 uppercase">
              <Check size={8} /> Catalog Synced
            </span>
          </div>
        </div>
      );
    }

    if (name === 'updateProductQuantity') {
      const isAdd = args.mode === 'add';
      const isPositive = Number(args.change) >= 0;
      return (
        <div key={index} className="mt-3 p-3.5 bg-amber-50/80 border border-amber-200 rounded-xl flex items-start gap-3 text-gray-800 shadow-2xs max-w-sm">
          <span className="p-2 bg-amber-500 text-white rounded-lg shadow-xs shrink-0">
            <Activity size={13} />
          </span>
          <div className="text-[11px] flex-1">
            <p className="font-bold text-amber-950">Stock Level Modified</p>
            <p className="text-gray-500 mt-1">Barcode: <span className="font-mono font-bold">{args.barcode}</span></p>
            <p className="text-amber-900 mt-0.5 font-semibold">
              Action: {isAdd ? (isPositive ? `Add +${args.change}` : `Subtract ${args.change}`) : `Set stock to ${args.change}`}
            </p>
            <span className="inline-flex items-center gap-1 text-[9px] font-mono font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded mt-2 uppercase">
              <Check size={8} /> Ledger Updated
            </span>
          </div>
        </div>
      );
    }

    if (name === 'createTask') {
      return (
        <div key={index} className="mt-3 p-3.5 bg-purple-50/80 border border-purple-200 rounded-xl flex items-start gap-3 text-gray-800 shadow-2xs max-w-sm">
          <span className="p-2 bg-purple-500 text-white rounded-lg shadow-xs shrink-0">
            <CheckSquare size={13} />
          </span>
          <div className="text-[11px] flex-1">
            <p className="font-bold text-purple-950">Kanban Task Created</p>
            <p className="text-purple-800 font-semibold mt-1">"{args.title}"</p>
            {args.description && <p className="text-gray-500 mt-0.5">{args.description}</p>}
            <div className="flex gap-1.5 mt-2 flex-wrap">
              <span className="text-[8px] font-bold uppercase tracking-wider bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded">
                {args.priority}
              </span>
              <span className="text-[8px] font-bold uppercase tracking-wider bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
                Stage: {args.stage}
              </span>
            </div>
            <span className="inline-flex items-center gap-1 text-[9px] font-mono font-bold text-purple-700 bg-purple-100 px-1.5 py-0.5 rounded mt-2.5 uppercase">
              <Check size={8} /> Kanban Synced
            </span>
          </div>
        </div>
      );
    }

    if (name === 'createOKR') {
      return (
        <div key={index} className="mt-3 p-3.5 bg-rose-50/80 border border-rose-200 rounded-xl flex items-start gap-3 text-gray-800 shadow-2xs max-w-sm">
          <span className="p-2 bg-rose-500 text-white rounded-lg shadow-xs shrink-0">
            <Target size={13} />
          </span>
          <div className="text-[11px] flex-1">
            <p className="font-bold text-rose-950">Family Goal Added</p>
            <p className="text-rose-800 font-semibold mt-1">"{args.title}"</p>
            {args.objective && <p className="text-gray-500 mt-0.5">{args.objective}</p>}
            <p className="text-rose-700 font-medium mt-1">Initial progress set to {args.progress}%</p>
            <span className="inline-flex items-center gap-1 text-[9px] font-mono font-bold text-rose-700 bg-rose-100 px-1.5 py-0.5 rounded mt-2 uppercase">
              <Check size={8} /> Goals Updated
            </span>
          </div>
        </div>
      );
    }

    if (name === 'deleteOrder' || name === 'deleteProduct' || name === 'deleteTask') {
      return (
        <div key={index} className="mt-3 p-3.5 bg-red-50/80 border border-red-100 rounded-xl flex items-start gap-3 text-gray-800 shadow-2xs max-w-sm">
          <span className="p-2 bg-red-500 text-white rounded-lg shadow-xs shrink-0">
            <Trash2 size={13} />
          </span>
          <div className="text-[11px] flex-1">
            <p className="font-bold text-red-950">Resource Decommitted</p>
            <p className="text-red-700 mt-0.5">
              Ref: {args.orderId || args.barcode || args.id} ({name})
            </p>
            <span className="inline-flex items-center gap-1 text-[9px] font-mono font-bold text-red-700 bg-red-100 px-1.5 py-0.5 rounded mt-2 uppercase">
              <Check size={8} /> Decommitted
            </span>
          </div>
        </div>
      );
    }

    return null;
  };

  const executedActionsCount = messages.reduce((acc, m) => acc + (m.actions?.length || 0), 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 h-[calc(100vh-140px)]">
      {/* Left column: Presets & Sync Engine Status */}
      <div className="lg:col-span-1 space-y-4 flex flex-col justify-between overflow-y-auto">
        <div className="space-y-4 shrink-0">
          <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs space-y-4">
            <div>
              <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">AI Consulting Frame</h3>
              <p className="text-[10px] text-gray-400 mt-0.5">Choose a persona perspective for Co-Pilot</p>
            </div>

            <div className="space-y-2">
              {PRESETS.map(preset => {
                const Icon = preset.icon;
                const isSelected = selectedPreset === preset.id;

                return (
                  <button
                    key={preset.id}
                    onClick={() => {
                      setSelectedPreset(preset.id);
                      setMessages([
                        {
                          id: `preset_${preset.id}`,
                          role: 'model',
                          content: `Switched operational perspective to: **${preset.label}**. I have full context on catalog stocks, order sheets, and agile lists. Ready to optimize!`,
                          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        }
                      ]);
                    }}
                    className={`w-full text-left p-3 rounded-xl border flex items-start gap-3 transition-all ${
                      isSelected
                        ? 'bg-black border-black text-white shadow-xs'
                        : 'bg-gray-50/50 border-gray-200/50 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <span className={`p-1.5 rounded-lg shrink-0 ${isSelected ? 'bg-white/10 text-amber-300' : 'bg-white border border-gray-100 text-gray-700'}`}>
                      <Icon size={12} />
                    </span>
                    <div className="text-xs min-w-0">
                      <p className="font-bold truncate">{preset.label}</p>
                      <p className={`text-[9px] mt-0.5 truncate ${isSelected ? 'text-gray-300' : 'text-gray-400'}`}>Consulting context loaded</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Database Integration Monitor */}
          <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">Workspace Sync Engine</h3>
                <p className="text-[10px] text-gray-400 mt-0.5">Direct state injection metrics</p>
              </div>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            </div>

            <div className="space-y-2.5 text-[11px] font-medium text-gray-600 font-mono">
              <div className="flex items-center justify-between border-b border-gray-100 pb-1.5">
                <span className="flex items-center gap-1.5 text-gray-500">
                  <Database size={11} className="text-blue-500" /> Catalog items
                </span>
                <span className="text-gray-900 font-bold">{products.length} registered</span>
              </div>
              <div className="flex items-center justify-between border-b border-gray-100 pb-1.5">
                <span className="flex items-center gap-1.5 text-gray-500">
                  <ShoppingCart size={11} className="text-emerald-500" /> Restock orders
                </span>
                <span className="text-gray-900 font-bold">{orders.length} orders</span>
              </div>
              <div className="flex items-center justify-between border-b border-gray-100 pb-1.5">
                <span className="flex items-center gap-1.5 text-gray-500">
                  <CheckSquare size={11} className="text-purple-500" /> Sprint Board tasks
                </span>
                <span className="text-gray-900 font-bold">{tasks.length} active</span>
              </div>
              <div className="flex items-center justify-between border-b border-gray-100 pb-1.5">
                <span className="flex items-center gap-1.5 text-gray-500">
                  <Target size={11} className="text-rose-500" /> Goal OKRs
                </span>
                <span className="text-gray-900 font-bold">{okrs.length} tracks</span>
              </div>
              <div className="flex items-center justify-between pb-0.5">
                <span className="flex items-center gap-1.5 text-gray-500">
                  <Activity size={11} className="text-amber-500" /> Actions in session
                </span>
                <span className="text-amber-600 font-bold">{executedActionsCount} executed</span>
              </div>
            </div>
          </div>
        </div>

        {/* Clear chat */}
        <button
          onClick={handleResetChat}
          className="w-full mt-4 py-2.5 bg-gray-50 hover:bg-gray-100 border border-gray-200/80 rounded-xl text-xs font-semibold text-gray-500 hover:text-gray-900 transition-all text-center shrink-0"
        >
          Reset Session History
        </button>
      </div>

      {/* Right column: Interactive Chat Area */}
      <div className="lg:col-span-3 flex flex-col h-full bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden">
        {/* Chat Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="p-1.5 bg-black text-amber-300 rounded-xl shadow-xs">
              <Sparkles size={14} className="fill-amber-300 animate-pulse" />
            </span>
            <div>
              <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">{activePreset.label} Frame</h3>
              <span className="text-[8px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-100 uppercase tracking-wider">
                Full-Access Operational Database Sync
              </span>
            </div>
          </div>
          <div className="text-right text-[10px] font-mono text-gray-400">
            <p className="flex items-center gap-1 justify-end"><Clock size={10} /> Continuous Sync</p>
          </div>
        </div>

        {/* Messages Body */}
        <div className="flex-1 p-6 overflow-y-auto space-y-5 bg-[#FBFBFD]">
          {messages.map(msg => {
            const isModel = msg.role === 'model';
            return (
              <div
                key={msg.id}
                className={`flex gap-3 max-w-[85%] ${isModel ? 'mr-auto' : 'ml-auto flex-row-reverse'}`}
              >
                {/* Avatar */}
                <span className={`w-7 h-7 rounded-full shrink-0 flex items-center justify-center text-[10px] font-bold border ${
                  isModel 
                    ? 'bg-black text-white border-black shadow-xs' 
                    : 'bg-white text-gray-600 border-gray-200'
                }`}>
                  {isModel ? 'O' : 'U'}
                </span>

                <div className="space-y-1 max-w-full">
                  <div className={`p-4 rounded-xl text-xs leading-relaxed whitespace-pre-line border ${
                    isModel
                      ? 'bg-white text-gray-800 border-gray-200/80 shadow-xs'
                      : 'bg-gray-900 text-white border-gray-900 shadow-sm'
                  }`}>
                    {msg.content}
                    
                    {/* Render action summary widgets */}
                    {isModel && msg.actions && msg.actions.length > 0 && (
                      <div className="space-y-2.5 mt-2">
                        {msg.actions.map((act, idx) => renderActionWidget(act, idx))}
                      </div>
                    )}
                  </div>
                  <span className={`text-[9px] font-mono text-gray-400 block ${isModel ? 'text-left' : 'text-right'}`}>
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            );
          })}
          {isLoading && (
            <div className="flex gap-3 max-w-[80%] mr-auto">
              <span className="w-7 h-7 rounded-full bg-black text-white flex items-center justify-center animate-pulse border border-black text-[10px] font-bold">
                O
              </span>
              <div className="p-4 bg-white rounded-xl text-xs text-gray-400 border border-gray-200/80 shadow-2xs italic flex items-center gap-2">
                <RefreshCw size={12} className="animate-spin text-blue-500" />
                <span>Synchronizing database state and formulating response...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Chat Input form */}
        <div className="p-4 border-t border-gray-100 bg-gray-50/50 shrink-0">
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <input
              type="text"
              required
              placeholder={`Ask Co-Pilot about catalog stock, restocks, planning, or ${activePreset.label.toLowerCase()}...`}
              value={userInput}
              onChange={e => setUserInput(e.target.value)}
              className="flex-1 px-4 py-2.5 text-xs bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-black focus:border-black shadow-2xs"
            />
            <button
              type="submit"
              disabled={isLoading || !userInput.trim()}
              className="px-4 bg-black text-white rounded-xl hover:bg-gray-800 transition-all flex items-center justify-center disabled:opacity-40 shadow-xs shrink-0 cursor-pointer"
            >
              <Send size={12} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
