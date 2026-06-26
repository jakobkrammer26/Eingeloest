import React, { useState } from 'react';
import { FamilyProduct, FamilyOrder } from '../types';
import { 
  ShoppingCart, 
  Plus, 
  Trash2, 
  Check, 
  AlertTriangle, 
  Clock, 
  FileText, 
  CheckCircle2, 
  Sparkles, 
  TrendingDown, 
  Printer, 
  Calendar 
} from 'lucide-react';

interface OrderPlannerProps {
  products: FamilyProduct[];
  orders: FamilyOrder[];
  onAddOrder: (order: FamilyOrder) => void;
  onUpdateOrderStatus: (orderId: string, status: FamilyOrder['status']) => void;
  onDeleteOrder: (orderId: string) => void;
}

export default function OrderPlanner({
  products,
  orders,
  onAddOrder,
  onUpdateOrderStatus,
  onDeleteOrder
}: OrderPlannerProps) {

  // Auto-calculated suggestions
  const suggestedLowStock = products.filter(p => p.quantity <= p.minStock);
  const suggestedFavorites = products.filter(p => p.isFavorite && p.quantity <= p.minStock + 1);

  // Shopping List state (temporary buffer before creating a permanent Order)
  const [shoppingItems, setShoppingItems] = useState<{
    barcode: string;
    productName: string;
    quantityNeeded: number;
    unit: string;
  }[]>([]);

  const [orderNotes, setOrderNotes] = useState('');

  // Add an item to the current active shopping list draft
  const handleAddDraftItem = (product: FamilyProduct, quantityNeeded: number = 1) => {
    // Check if already in shopping items
    if (shoppingItems.some(item => item.barcode === product.barcode)) {
      setShoppingItems(prev => prev.map(item => 
        item.barcode === product.barcode 
          ? { ...item, quantityNeeded: item.quantityNeeded + quantityNeeded } 
          : item
      ));
    } else {
      setShoppingItems(prev => [...prev, {
        barcode: product.barcode,
        productName: product.name,
        quantityNeeded,
        unit: product.unit
      }]);
    }
  };

  // Add custom manual item without barcode
  const [manualName, setManualName] = useState('');
  const [manualQty, setManualQty] = useState(1);
  const [manualUnit, setManualUnit] = useState('pcs');

  const handleAddManualDraft = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualName) return;

    const fakeBarcode = `MAN-${Math.floor(1000 + Math.random() * 9000)}`;
    setShoppingItems(prev => [...prev, {
      barcode: fakeBarcode,
      productName: manualName,
      quantityNeeded: manualQty,
      unit: manualUnit
    }]);

    setManualName('');
    setManualQty(1);
  };

  const handleRemoveDraftItem = (barcode: string) => {
    setShoppingItems(prev => prev.filter(item => item.barcode !== barcode));
  };

  // Create permanent order
  const handleCreateOrder = () => {
    if (shoppingItems.length === 0) return;

    const newOrder: FamilyOrder = {
      id: `FO-${Math.floor(100 + Math.random() * 900)}`,
      date: new Date().toISOString().substring(0, 10),
      status: 'PENDING',
      items: [...shoppingItems],
      notes: orderNotes.trim() || undefined
    };

    onAddOrder(newOrder);
    setShoppingItems([]);
    setOrderNotes('');
  };

  // Auto fill entire suggested low stock
  const handleAutoFillSuggested = () => {
    suggestedLowStock.forEach(p => {
      const needed = Math.max(1, p.minStock * 2 - p.quantity);
      handleAddDraftItem(p, needed);
    });
  };

  const getStatusBadgeStyle = (status: FamilyOrder['status']) => {
    switch (status) {
      case 'RECEIVED':
        return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'ORDERED':
        return 'bg-blue-50 text-blue-700 border-blue-100 animate-pulse';
      default:
        return 'bg-amber-50 text-amber-700 border-amber-100';
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Header */}
      <div className="border-b border-gray-100 pb-6">
        <h2 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
          <ShoppingCart className="text-blue-500" size={28} />
          Family Reorder Planner
        </h2>
        <p className="text-gray-400 text-sm font-light mt-1">
          Auto-compute shortage reports, draft custom family shopping checklists, and release orders. Marking an order as <strong className="text-emerald-600">"Received"</strong> instantly restocks items.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Side: Shopping Draft & Custom List Creator */}
        <div className="lg:col-span-7 space-y-6">
          
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-4">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <h3 className="font-bold text-gray-950 text-sm flex items-center gap-1.5">
                <ShoppingCart size={16} className="text-blue-500" /> Active Shopping List Draft
              </h3>
              {shoppingItems.length > 0 && (
                <button
                  onClick={() => setShoppingItems([])}
                  className="text-[10px] text-gray-400 font-mono font-bold hover:text-red-500 transition-colors"
                >
                  Clear Draft
                </button>
              )}
            </div>

            {/* Shopping draft items */}
            <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
              {shoppingItems.map(item => (
                <div key={item.barcode} className="flex items-center justify-between p-3 bg-gray-50/50 border border-gray-100 rounded-xl text-xs">
                  <div className="space-y-0.5">
                    <p className="font-bold text-gray-850">{item.productName}</p>
                    <p className="text-[10px] text-gray-400 font-mono">ID/BC: {item.barcode}</p>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1 font-mono text-[11px]">
                      <span className="text-gray-400">Qty:</span>
                      <strong className="text-gray-800 font-bold">{item.quantityNeeded}</strong>
                      <span className="text-gray-400">{item.unit}</span>
                    </div>
                    <button
                      onClick={() => handleRemoveDraftItem(item.barcode)}
                      className="text-gray-300 hover:text-red-500"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}

              {shoppingItems.length === 0 && (
                <div className="text-center py-12 text-gray-450 text-xs font-light">
                  <p>Your shopping list draft is currently empty.</p>
                  <p className="text-[10px] text-gray-400 mt-1">Select from suggestions below or register custom items.</p>
                </div>
              )}
            </div>

            {/* Notes and Create Order buttons */}
            {shoppingItems.length > 0 && (
              <div className="space-y-3 pt-3 border-t border-gray-100">
                <input
                  type="text"
                  placeholder="Add optional notes (e.g., Buy from organic market...)"
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-gray-250 rounded-xl focus:outline-none"
                />
                <button
                  onClick={handleCreateOrder}
                  className="w-full py-2.5 bg-black hover:bg-gray-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
                >
                  Create & Save Order List
                </button>
              </div>
            )}
          </div>

          {/* Quick Manual Draft Item Adder */}
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 font-mono">Quick-Add Custom Item</h4>
            <form onSubmit={handleAddManualDraft} className="flex flex-wrap sm:flex-nowrap gap-2 items-end">
              <div className="flex-1 min-w-[120px]">
                <input
                  type="text"
                  placeholder="e.g. Milk, Apples, Bread"
                  required
                  value={manualName}
                  onChange={(e) => setManualName(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none"
                />
              </div>
              <div className="w-16">
                <input
                  type="number"
                  min="1"
                  value={manualQty}
                  onChange={(e) => setManualQty(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg"
                />
              </div>
              <div className="w-20">
                <input
                  type="text"
                  placeholder="pcs"
                  value={manualUnit}
                  onChange={(e) => setManualUnit(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-gray-150 hover:bg-gray-250 text-gray-800 rounded-lg text-xs font-bold shrink-0"
              >
                Add
              </button>
            </form>
          </div>

          {/* Suggested automatic stock shortage panel */}
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-4">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <h3 className="font-bold text-gray-900 text-sm flex items-center gap-1">
                <AlertTriangle size={15} className="text-amber-500" /> Shortage Detection Report
              </h3>
              {suggestedLowStock.length > 0 && (
                <button
                  onClick={handleAutoFillSuggested}
                  className="text-[10px] text-blue-600 font-mono font-bold hover:underline"
                >
                  Add All Low Stock
                </button>
              )}
            </div>

            <div className="space-y-2.5">
              {suggestedLowStock.map(p => (
                <div key={p.barcode} className="flex items-center justify-between text-xs">
                  <div className="space-y-0.5 pr-4">
                    <p className="font-semibold text-gray-800 truncate max-w-[200px]">{p.name}</p>
                    <p className="text-[10px] text-gray-400 font-mono">Stock level: {p.quantity} / Target: {p.minStock}</p>
                  </div>
                  <button
                    onClick={() => handleAddDraftItem(p, Math.max(1, p.minStock * 2 - p.quantity))}
                    className="px-3 py-1 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg font-bold text-[10px] transition-colors"
                  >
                    + Add to draft
                  </button>
                </div>
              ))}

              {suggestedLowStock.length === 0 && (
                <div className="text-center py-6 text-gray-450 text-xs">
                  <CheckCircle2 size={24} className="mx-auto text-emerald-500 mb-1.5" />
                  <p className="font-light">Excellent! All items are within optimal stock metrics.</p>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Right Side: Active Saved Orders & Receiving Desk */}
        <div className="lg:col-span-5 space-y-6">
          
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-4">
            <h3 className="font-bold text-gray-950 text-sm flex items-center gap-1">
              <FileText size={16} className="text-gray-400" /> Registered Order Lists
            </h3>

            <div className="space-y-4">
              {orders.map(order => (
                <div 
                  key={order.id} 
                  className="p-4 bg-gray-50/50 border border-gray-100 rounded-2xl space-y-3 hover:bg-gray-50 transition-all text-xs"
                >
                  <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                    <div className="space-y-0.5">
                      <strong className="text-gray-900 font-bold">{order.id}</strong>
                      <p className="text-[10px] text-gray-400 font-mono flex items-center gap-1">
                        <Calendar size={10} /> Created: {order.date}
                      </p>
                    </div>
                    <span className={`px-2.5 py-0.5 text-[9px] font-mono font-bold rounded border uppercase ${getStatusBadgeStyle(order.status)}`}>
                      {order.status}
                    </span>
                  </div>

                  {/* Items count summary */}
                  <div className="space-y-1.5">
                    {order.items.map(item => (
                      <div key={item.barcode} className="flex justify-between text-gray-600 text-[11px]">
                        <span className="truncate max-w-[180px] font-medium">{item.productName}</span>
                        <span className="font-mono text-gray-500">
                          Qty: <strong className="text-gray-700">{item.quantityNeeded}</strong> {item.unit}
                        </span>
                      </div>
                    ))}
                  </div>

                  {order.notes && (
                    <p className="text-[10px] text-gray-400 italic bg-white p-2 rounded-lg border border-gray-100">
                      Note: {order.notes}
                    </p>
                  )}

                  {/* Status action buttons */}
                  <div className="flex gap-2 pt-2 border-t border-gray-50 text-[10px] font-bold">
                    {order.status === 'PENDING' && (
                      <button
                        onClick={() => onUpdateOrderStatus(order.id, 'ORDERED')}
                        className="flex-1 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-center"
                      >
                        Mark as Placed
                      </button>
                    )}
                    {(order.status === 'PENDING' || order.status === 'ORDERED') && (
                      <button
                        onClick={() => onUpdateOrderStatus(order.id, 'RECEIVED')}
                        className="flex-1 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-center flex items-center justify-center gap-0.5"
                      >
                        <Check size={11} /> Mark Received (Restock)
                      </button>
                    )}
                    <button
                      onClick={() => onDeleteOrder(order.id)}
                      className="p-1.5 bg-gray-100 hover:bg-gray-200 text-gray-400 hover:text-red-500 rounded-lg"
                      title="Delete order list"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              ))}

              {orders.length === 0 && (
                <div className="text-center py-10 text-gray-400 text-xs font-light">
                  No active family orders currently tracked.
                </div>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
