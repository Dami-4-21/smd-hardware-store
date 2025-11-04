import { AlertCircle, TrendingUp, Package } from 'lucide-react';
import { ProductFormData } from '../../pages/CreateProductPage';

interface Props {
  formData: ProductFormData;
  updateFormData: (updates: Partial<ProductFormData>) => void;
  errors: Record<string, string>;
}

export default function PricingInventorySection({ formData, updateFormData, errors }: Props) {
  const getStockStatus = () => {
    if (formData.stockQuantity === 0) return { color: 'red', label: 'Out of Stock' };
    if (formData.stockQuantity <= formData.lowStockThreshold) return { color: 'yellow', label: 'Low Stock' };
    return { color: 'green', label: 'In Stock' };
  };

  const stockStatus = getStockStatus();

  return (
    <div className="space-y-6">
      {/* Base Price */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Base Price (TND) <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <input
            type="number"
            value={formData.basePrice}
            onChange={(e) => updateFormData({ basePrice: parseFloat(e.target.value) || 0 })}
            min="0"
            step="0.01"
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${
              errors.basePrice ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="0.00"
          />
          <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
            TND
          </span>
        </div>
        {errors.basePrice && (
          <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
            <AlertCircle className="w-4 h-4" />
            {errors.basePrice}
          </p>
        )}
        <p className="mt-1 text-sm text-gray-500">
          {formData.hasSizes 
            ? 'This is the default price. Size-specific prices will override this.' 
            : 'This is the selling price for this product.'}
        </p>
      </div>

      {/* SKU */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          SKU (Stock Keeping Unit) <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.sku}
          onChange={(e) => updateFormData({ sku: e.target.value.toUpperCase() })}
          placeholder="e.g., DRILL-18V-001"
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition uppercase ${
            errors.sku ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {errors.sku && (
          <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
            <AlertCircle className="w-4 h-4" />
            {errors.sku}
          </p>
        )}
        <p className="mt-1 text-sm text-gray-500">
          Unique identifier for inventory tracking
        </p>
      </div>

      {/* Stock Quantity */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Stock Quantity
        </label>
        <input
          type="number"
          value={formData.stockQuantity}
          onChange={(e) => updateFormData({ stockQuantity: parseInt(e.target.value) || 0 })}
          min="0"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
          placeholder="0"
        />
        {formData.hasSizes && (
          <p className="mt-1 text-sm text-yellow-600 flex items-center gap-1">
            <AlertCircle className="w-4 h-4" />
            Stock is managed per size variation. This is the total/default stock.
          </p>
        )}
      </div>

      {/* Low Stock Threshold */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Low Stock Alert Threshold
        </label>
        <input
          type="number"
          value={formData.lowStockThreshold}
          onChange={(e) => updateFormData({ lowStockThreshold: parseInt(e.target.value) || 0 })}
          min="0"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
          placeholder="5"
        />
        <p className="mt-1 text-sm text-gray-500">
          You'll be notified when stock falls below this number
        </p>
      </div>

      {/* Stock Status Visual */}
      <div className="bg-gray-50 border border-gray-300 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-900">Current Stock Status</h3>
          <span className={`px-3 py-1 rounded-full text-sm font-medium bg-${stockStatus.color}-100 text-${stockStatus.color}-700`}>
            {stockStatus.label}
          </span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Package className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{formData.stockQuantity}</div>
                <div className="text-sm text-gray-600">Units Available</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{formData.basePrice.toFixed(2)}</div>
                <div className="text-sm text-gray-600">Price (TND)</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <AlertCircle className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{formData.lowStockThreshold}</div>
                <div className="text-sm text-gray-600">Alert Threshold</div>
              </div>
            </div>
          </div>
        </div>

        {/* Stock Level Bar */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
            <span>Stock Level</span>
            <span>{formData.stockQuantity} units</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                stockStatus.color === 'green' ? 'bg-green-500' :
                stockStatus.color === 'yellow' ? 'bg-yellow-500' :
                'bg-red-500'
              }`}
              style={{
                width: `${Math.min((formData.stockQuantity / (formData.lowStockThreshold * 3)) * 100, 100)}%`
              }}
            />
          </div>
        </div>
      </div>

      {/* Pricing Summary */}
      {(formData.hasSizes && formData.sizeVariations.length > 0) && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-3">Size-Based Pricing Summary</h3>
          <div className="space-y-2">
            {formData.sizeVariations.map((size) => (
              <div key={size.id} className="flex items-center justify-between bg-white rounded px-3 py-2 text-sm">
                <span className="font-medium text-gray-900">{size.sizeName}</span>
                <div className="flex items-center gap-4">
                  <span className="text-blue-600 font-semibold">{size.price.toFixed(2)} TND</span>
                  <span className={`px-2 py-1 rounded text-xs ${
                    size.stock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {size.stock} in stock
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
