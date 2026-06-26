import React, { useState } from 'react';
import { FamilyProduct } from '../types';
import { 
  Search, 
  Plus, 
  Trash2, 
  Heart, 
  Sparkles, 
  AlertTriangle, 
  X, 
  Check, 
  Star, 
  ChevronDown, 
  Edit3, 
  Filter, 
  Package, 
  Clock 
} from 'lucide-react';

interface ProductCatalogProps {
  products: FamilyProduct[];
  onAddProduct: (product: FamilyProduct) => void;
  onUpdateProduct: (product: FamilyProduct) => void;
  onDeleteProduct: (barcode: string) => void;
  onUpdateProductQuantity: (barcode: string, change: number, mode: 'set' | 'add') => void;
}

export default function ProductCatalog({
  products,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  onUpdateProductQuantity
}: ProductCatalogProps) {

  // Search and Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [favoriteOnly, setFavoriteOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'name' | 'quantity-low' | 'quantity-high'>('name');

  // Modal forms
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<FamilyProduct | null>(null);

  // New Product fields
  const [barcode, setBarcode] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Groceries');
  const [quantity, setQuantity] = useState(1);
  const [unit, setUnit] = useState('pcs');
  const [minStock, setMinStock] = useState(2);
  const [serialNumber, setSerialNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);

  // Get unique list of categories for filter dropdown
  const categories = ['ALL', ...Array.from(new Set(products.map(p => p.category)))];

  // Process search, filters, and sort
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.barcode.includes(searchQuery) ||
                          p.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === 'ALL' || p.category === selectedCategory;
    const matchesFavorite = !favoriteOnly || p.isFavorite;

    return matchesSearch && matchesCategory && matchesFavorite;
  }).sort((a, b) => {
    if (sortBy === 'name') {
      return a.name.localeCompare(b.name);
    } else if (sortBy === 'quantity-low') {
      return a.quantity - b.quantity;
    } else {
      return b.quantity - a.quantity;
    }
  });

  const handleOpenEdit = (p: FamilyProduct) => {
    setEditingProduct(p);
    setIsEditModalOpen(true);
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!barcode || !name) return;

    // Check if barcode already exists
    if (products.some(p => p.barcode === barcode)) {
      alert("Error: A product with this barcode already exists in the catalog.");
      return;
    }

    const newProduct: FamilyProduct = {
      barcode: barcode.trim(),
      name: name.trim(),
      description: description.trim() || 'Manual stock listing.',
      category,
      quantity: Number(quantity),
      unit: unit.trim() || 'pcs',
      minStock: Number(minStock),
      isFavorite,
      serialNumber: serialNumber.trim() || undefined,
      expiryDate: expiryDate || undefined
    };

    onAddProduct(newProduct);
    setIsAddModalOpen(false);
    resetForm();
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    onUpdateProduct(editingProduct);
    setIsEditModalOpen(false);
    setEditingProduct(null);
  };

  const toggleFavorite = (product: FamilyProduct) => {
    onUpdateProduct({
      ...product,
      isFavorite: !product.isFavorite
    });
  };

  const resetForm = () => {
    setBarcode('');
    setName('');
    setDescription('');
    setCategory('Groceries');
    setQuantity(1);
    setUnit('pcs');
    setMinStock(2);
    setSerialNumber('');
    setExpiryDate('');
    setIsFavorite(false);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-100 pb-6">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <Package className="text-blue-500" size={28} />
            Family Stock Catalog
          </h2>
          <p className="text-gray-400 text-sm font-light mt-1">
            Browse, manage, and edit <strong className="text-gray-800 font-semibold">{products.length} registered products</strong>. Double-click or use quick adjust buttons to modify stock on the fly.
          </p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-5 py-2.5 bg-black hover:bg-gray-800 text-white rounded-full text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
        >
          <Plus size={14} /> Register New Product
        </button>
      </div>

      {/* Workspace Control Filters Panel */}
      <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search size={14} className="absolute left-3.5 top-3.5 text-gray-400" />
          <input
            type="text"
            placeholder="Search matching products, barcodes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-xs border border-gray-200 rounded-xl focus:outline-none"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
            >
              <X size={12} />
            </button>
          )}
        </div>

        {/* Filter Toolbar */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto text-xs">
          
          {/* Category drop */}
          <div className="flex items-center gap-1.5">
            <span className="text-gray-400 font-medium">Category:</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl outline-none"
            >
              {categories.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Sort selection */}
          <div className="flex items-center gap-1.5">
            <span className="text-gray-400 font-medium">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl outline-none"
            >
              <option value="name">Product Name (A-Z)</option>
              <option value="quantity-low">Stock Level (Low-High)</option>
              <option value="quantity-high">Stock Level (High-Low)</option>
            </select>
          </div>

          {/* Favorites Star Toggle */}
          <button
            onClick={() => setFavoriteOnly(!favoriteOnly)}
            className={`px-3 py-1.5 rounded-xl border flex items-center gap-1 font-bold ${
              favoriteOnly
                ? 'bg-rose-50 border-rose-200 text-rose-600'
                : 'bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100'
            }`}
          >
            <Heart size={12} className={favoriteOnly ? 'fill-rose-500' : ''} /> Favorites Only
          </button>
        </div>
      </div>

      {/* Grid of Products (Tactile, Apple-like Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map(product => {
          const isLow = product.quantity <= product.minStock;
          const isExpired = product.expiryDate ? new Date(product.expiryDate) < new Date() : false;

          return (
            <div 
              key={product.barcode}
              className={`bg-white border rounded-2xl p-5 shadow-xs flex flex-col justify-between transition-all hover:shadow-md relative overflow-hidden ${
                isLow ? 'border-amber-100' : 'border-gray-200/70'
              }`}
            >
              {/* Star Heart for favorite selection */}
              <button 
                onClick={() => toggleFavorite(product)}
                className="absolute top-4 right-4 text-gray-300 hover:text-rose-500 transition-colors"
                title={product.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              >
                <Heart 
                  size={18} 
                  className={product.isFavorite ? 'fill-rose-500 text-rose-500' : ''} 
                />
              </button>

              <div className="space-y-4">
                {/* Meta details */}
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="px-2 py-0.5 bg-gray-50 border border-gray-100 text-gray-500 text-[9px] font-mono font-bold uppercase rounded tracking-wider">
                      {product.category}
                    </span>
                    {isLow && (
                      <span className="px-2 py-0.5 bg-amber-50 text-amber-700 text-[9px] font-mono font-bold uppercase rounded tracking-wider border border-amber-100/50 flex items-center gap-0.5">
                        <AlertTriangle size={8} /> Low Stock
                      </span>
                    )}
                    {isExpired && (
                      <span className="px-2 py-0.5 bg-red-50 text-red-700 text-[9px] font-mono font-bold uppercase rounded tracking-wider border border-red-100/40">
                        Expired
                      </span>
                    )}
                  </div>
                  <h3 className="font-bold text-gray-900 text-sm mt-2 leading-tight pr-6">{product.name}</h3>
                  <p className="text-gray-400 font-light text-[11px] leading-relaxed line-clamp-2">{product.description}</p>
                </div>

                {/* Stock Level Display */}
                <div className="p-3 bg-gray-50/50 rounded-xl border border-gray-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-gray-400 uppercase font-bold font-mono">Stock Level</span>
                    <div className="flex items-baseline gap-1 mt-0.5">
                      <span className="text-xl font-bold text-gray-850">{product.quantity}</span>
                      <span className="text-xs text-gray-400 font-light">{product.unit}</span>
                    </div>
                  </div>

                  {/* Quantity quick control adjustments */}
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onUpdateProductQuantity(product.barcode, -1, 'add')}
                      disabled={product.quantity <= 0}
                      className="w-8 h-8 flex items-center justify-center bg-white border border-gray-250 rounded-lg hover:bg-gray-50 disabled:opacity-30 disabled:hover:bg-white text-gray-600 font-bold text-sm select-none"
                    >
                      -
                    </button>
                    <button
                      onClick={() => onUpdateProductQuantity(product.barcode, 1, 'add')}
                      className="w-8 h-8 flex items-center justify-center bg-white border border-gray-250 rounded-lg hover:bg-gray-50 text-gray-600 font-bold text-sm select-none"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Details list */}
                <div className="space-y-1 text-[10px] font-mono text-gray-400 border-t border-gray-50 pt-3">
                  <div className="flex justify-between">
                    <span>Barcode ID:</span>
                    <strong className="text-gray-700">{product.barcode}</strong>
                  </div>
                  {product.expiryDate && (
                    <div className="flex justify-between">
                      <span>Expires:</span>
                      <strong className={`text-gray-700 ${isExpired ? 'text-red-500 font-bold' : ''}`}>{product.expiryDate}</strong>
                    </div>
                  )}
                  {product.serialNumber && (
                    <div className="flex justify-between">
                      <span>FMD Serial:</span>
                      <strong className="text-gray-600 font-light truncate max-w-[120px]">{product.serialNumber}</strong>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Toolbar */}
              <div className="flex items-center justify-between mt-5 pt-3.5 border-t border-gray-50 text-xs">
                <button
                  onClick={() => handleOpenEdit(product)}
                  className="text-gray-400 hover:text-blue-500 font-medium inline-flex items-center gap-1 transition-colors"
                >
                  <Edit3 size={11} /> Edit details
                </button>
                <button
                  onClick={() => onDeleteProduct(product.barcode)}
                  className="text-gray-300 hover:text-red-500 font-medium inline-flex items-center gap-1 transition-colors"
                >
                  <Trash2 size={11} /> Remove
                </button>
              </div>
            </div>
          );
        })}

        {filteredProducts.length === 0 && (
          <div className="col-span-1 md:col-span-2 lg:col-span-3 py-20 text-center text-gray-400 space-y-2">
            <Package className="mx-auto text-gray-200" size={44} />
            <p className="text-sm font-light">No products match your active search filter settings.</p>
          </div>
        )}
      </div>

      {/* --- ADD PRODUCT MODAL DIALOG --- */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-xl space-y-5 animate-scale-up">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <h3 className="text-lg font-bold text-gray-900">Register New Product</h3>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 text-gray-400 hover:bg-gray-100 rounded-full"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
              
              <div className="space-y-1">
                <label className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Barcode (EAN/UPC) *</label>
                <input
                  type="text"
                  placeholder="e.g. 40084911 (Scan or type)"
                  required
                  value={barcode}
                  onChange={(e) => setBarcode(e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Product Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Ibuprofen 400mg"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Description</label>
                <textarea
                  placeholder="Additional details, size, strength, etc."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 bg-white rounded-xl focus:outline-none"
                  >
                    <option value="Groceries">Groceries</option>
                    <option value="Beverages">Beverages</option>
                    <option value="Snacks">Snacks</option>
                    <option value="Drinks">Drinks</option>
                    <option value="Medicines (FMD)">Medicines (FMD)</option>
                    <option value="Household">Household</option>
                    <option value="Electronics">Electronics</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Stock Unit</label>
                  <input
                    type="text"
                    placeholder="e.g. boxes, pcs, bottles"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Initial Stock</label>
                  <input
                    type="number"
                    min="0"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Min Stock Trigger</label>
                  <input
                    type="number"
                    min="0"
                    value={minStock}
                    onChange={(e) => setMinStock(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="space-y-1">
                  <label className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">FMD Serial No.</label>
                  <input
                    type="text"
                    placeholder="e.g. SN-9938"
                    value={serialNumber}
                    onChange={(e) => setSerialNumber(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Expiry Date</label>
                  <input
                    type="date"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="add-fav"
                  checked={isFavorite}
                  onChange={(e) => setIsFavorite(e.target.checked)}
                  className="rounded border-gray-300 text-rose-500 focus:ring-rose-400"
                />
                <label htmlFor="add-fav" className="text-[11px] text-gray-600 font-semibold select-none flex items-center gap-1 cursor-pointer">
                  <Heart size={11} className="text-rose-500 fill-rose-500" /> Star as Family Favorite
                </label>
              </div>

              <div className="pt-4 border-t border-gray-100 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-500 hover:bg-gray-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-black hover:bg-gray-800 text-white rounded-xl font-bold shadow-sm"
                >
                  Save Entry
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* --- EDIT PRODUCT MODAL DIALOG --- */}
      {isEditModalOpen && editingProduct && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-xl space-y-5 animate-scale-up">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <h3 className="text-lg font-bold text-gray-900">Edit Product Profile</h3>
              <button 
                onClick={() => { setIsEditModalOpen(false); setEditingProduct(null); }}
                className="p-1 text-gray-400 hover:bg-gray-100 rounded-full"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4 text-xs">
              
              <div className="space-y-1">
                <label className="text-[10px] text-gray-400 uppercase font-bold tracking-wider font-mono">Barcode ID (Locked)</label>
                <input
                  type="text"
                  disabled
                  value={editingProduct.barcode}
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-400 font-mono font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Product Name *</label>
                <input
                  type="text"
                  required
                  value={editingProduct.name}
                  onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Description</label>
                <textarea
                  value={editingProduct.description}
                  onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Category</label>
                  <select
                    value={editingProduct.category}
                    onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 bg-white rounded-xl focus:outline-none"
                  >
                    <option value="Groceries">Groceries</option>
                    <option value="Beverages">Beverages</option>
                    <option value="Snacks">Snacks</option>
                    <option value="Drinks">Drinks</option>
                    <option value="Medicines (FMD)">Medicines (FMD)</option>
                    <option value="Household">Household</option>
                    <option value="Electronics">Electronics</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Stock Unit</label>
                  <input
                    type="text"
                    value={editingProduct.unit}
                    onChange={(e) => setEditingProduct({ ...editingProduct, unit: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Current Stock</label>
                  <input
                    type="number"
                    min="0"
                    value={editingProduct.quantity}
                    onChange={(e) => setEditingProduct({ ...editingProduct, quantity: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Min Stock Trigger</label>
                  <input
                    type="number"
                    min="0"
                    value={editingProduct.minStock}
                    onChange={(e) => setEditingProduct({ ...editingProduct, minStock: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="space-y-1">
                  <label className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">FMD Serial No.</label>
                  <input
                    type="text"
                    value={editingProduct.serialNumber || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, serialNumber: e.target.value || undefined })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Expiry Date</label>
                  <input
                    type="date"
                    value={editingProduct.expiryDate || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, expiryDate: e.target.value || undefined })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="edit-fav"
                  checked={editingProduct.isFavorite}
                  onChange={(e) => setEditingProduct({ ...editingProduct, isFavorite: e.target.checked })}
                  className="rounded border-gray-300 text-rose-500 focus:ring-rose-400"
                />
                <label htmlFor="edit-fav" className="text-[11px] text-gray-600 font-semibold select-none flex items-center gap-1 cursor-pointer">
                  <Heart size={11} className="text-rose-500 fill-rose-500" /> Star as Family Favorite
                </label>
              </div>

              <div className="pt-4 border-t border-gray-100 flex gap-2">
                <button
                  type="button"
                  onClick={() => { setIsEditModalOpen(false); setEditingProduct(null); }}
                  className="flex-1 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-500 hover:bg-gray-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-black hover:bg-gray-800 text-white rounded-xl font-bold shadow-sm"
                >
                  Apply Changes
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
