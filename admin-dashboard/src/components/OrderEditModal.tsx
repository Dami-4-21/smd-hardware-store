import { useState, useEffect } from 'react';
import { X, Plus, Trash2, Save, Search, AlertCircle } from 'lucide-react';
import { Order } from '../services/orderService';

interface Product {
  id: string;
  name: string;
  basePrice: number;
  stockQuantity: number;
  sku: string | null;
}

interface OrderEditModalProps {
  order: Order;
  onClose: () => void;
  onSave: (orderId: string, items: Array<{ productId: string; quantity: number; unitPrice: number }>) => Promise<void>;
}

export default function OrderEditModal({ order, onClose, onSave }: OrderEditModalProps) {
  const [editedItems, setEditedItems] = useState(order.items.map(item => ({
    id: item.id,
    productId: item.productId,
    productName: item.productName,
    quantity: item.quantity,
    unitPrice: Number(item.unitPrice),
    totalPrice: Number(item.totalPrice),
  })));
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  // Calculate totals
  const subtotal = editedItems.reduce((sum, item) => sum + item.totalPrice, 0);
  const taxRate = 0.19;
  const taxAmount = subtotal * taxRate;
  const totalAmount = subtotal + taxAmount;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-TN', {
      style: 'currency',
      currency: 'TND',
    }).format(amount);
  };

  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    setEditedItems(items =>
      items.map(item =>
        item.id === itemId
          ? {
              ...item,
              quantity: newQuantity,
              totalPrice: newQuantity * item.unitPrice,
            }
          : item
      )
    );
  };

  const handlePriceChange = (itemId: string, newPrice: number) => {
    if (newPrice < 0) return;
    
    setEditedItems(items =>
      items.map(item =>
        item.id === itemId
          ? {
              ...item,
              unitPrice: newPrice,
              totalPrice: item.quantity * newPrice,
            }
          : item
      )
    );
  };

  const handleRemoveItem = (itemId: string) => {
    if (editedItems.length === 1) {
      setError('Cannot remove the last item from the order');
      return;
    }
    
    if (!confirm('Remove this item from the order?')) return;
    
    setEditedItems(items => items.filter(item => item.id !== itemId));
    setError('');
  };

  const searchProducts = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/products?search=${encodeURIComponent(searchQuery)}&limit=10`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) throw new Error('Failed to search products');

      const data = await response.json();
      setSearchResults(data.products || []);
    } catch (err: any) {
      console.error('Search error:', err);
      setError('Failed to search products');
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddProduct = (product: Product) => {
    // Check if product already exists
    const existingItem = editedItems.find(item => item.productId === product.id);
    if (existingItem) {
      setError('Product already in order. Modify the quantity instead.');
      return;
    }

    const newItem = {
      id: `new-${Date.now()}`, // Temporary ID for new items
      productId: product.id,
      productName: product.name,
      quantity: 1,
      unitPrice: Number(product.basePrice),
      totalPrice: Number(product.basePrice),
    };

    setEditedItems([...editedItems, newItem]);
    setSearchQuery('');
    setSearchResults([]);
    setError('');
  };

  const handleSave = async () => {
    if (editedItems.length === 0) {
      setError('Order must have at least one item');
      return;
    }

    setIsSaving(true);
    setError('');

    try {
      const itemsData = editedItems.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
      }));

      await onSave(order.id, itemsData);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save changes');
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    const debounce = setTimeout(() => {
      if (searchQuery) {
        searchProducts();
      }
    }, 300);

    return () => clearTimeout(debounce);
  }, [searchQuery]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Edit Order #{order.orderNumber}</h2>
            <p className="text-indigo-100 text-sm">Modify items before changing status</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start gap-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Add Product Section */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Plus className="w-5 h-5 text-blue-600" />
              Add Product
            </h3>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products by name or SKU..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="mt-3 border border-gray-200 rounded-lg bg-white max-h-48 overflow-y-auto">
                {searchResults.map((product) => (
                  <button
                    key={product.id}
                    onClick={() => handleAddProduct(product)}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{product.name}</p>
                        <p className="text-sm text-gray-600">
                          SKU: {product.sku || 'N/A'} | Stock: {product.stockQuantity}
                        </p>
                      </div>
                      <span className="font-medium text-blue-600">
                        {formatCurrency(Number(product.basePrice))}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {isSearching && (
              <div className="mt-3 text-center text-gray-600">
                <div className="inline-block animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                <span className="ml-2">Searching...</span>
              </div>
            )}
          </div>

          {/* Order Items */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-4">Order Items</h3>
            <div className="space-y-3">
              {editedItems.map((item) => (
                <div key={item.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{item.productName}</p>
                    <div className="flex items-center gap-4 mt-2">
                      <div>
                        <label className="text-xs text-gray-600 block mb-1">Quantity</label>
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value) || 1)}
                          className="w-20 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-600 block mb-1">Unit Price</label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.unitPrice}
                          onChange={(e) => handlePriceChange(item.id, parseFloat(e.target.value) || 0)}
                          className="w-28 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">{formatCurrency(item.totalPrice)}</p>
                    <p className="text-xs text-gray-600 mt-1">
                      {item.quantity} × {formatCurrency(item.unitPrice)}
                    </p>
                  </div>
                  <button
                    onClick={() => handleRemoveItem(item.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Remove item"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="mt-4 pt-4 border-t border-gray-200 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span className="text-gray-900 font-medium">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Tax (19%)</span>
                <span className="text-gray-900 font-medium">{formatCurrency(taxAmount)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-200">
                <span>Total</span>
                <span className="text-blue-600">{formatCurrency(totalAmount)}</span>
              </div>
              
              {/* Show difference */}
              {totalAmount !== Number(order.totalAmount) && (
                <div className="flex justify-between text-sm pt-2">
                  <span className="text-gray-600">Change from original</span>
                  <span className={totalAmount > Number(order.totalAmount) ? 'text-red-600 font-medium' : 'text-green-600 font-medium'}>
                    {totalAmount > Number(order.totalAmount) ? '+' : ''}
                    {formatCurrency(totalAmount - Number(order.totalAmount))}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 bg-gray-50 px-6 py-4 flex justify-between items-center">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving || editedItems.length === 0}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
