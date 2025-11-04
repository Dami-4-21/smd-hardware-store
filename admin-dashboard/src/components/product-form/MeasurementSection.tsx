import { Plus, Trash2, Eye } from 'lucide-react';
import { ProductFormData, PackSize } from '../../pages/CreateProductPage';

interface Props {
  formData: ProductFormData;
  updateFormData: (updates: Partial<ProductFormData>) => void;
  unitLabel: string;
}

export default function MeasurementSection({ formData, updateFormData, unitLabel }: Props) {

  const sellingTypes = [
    { value: 'piece', label: 'By Piece', icon: '📦', unit: 'piece', examples: '1 unit, pack of 6, box of 12' },
    { value: 'weight', label: 'By Weight', icon: '⚖️', unit: 'kg', examples: '1kg, 5kg, 10kg' },
    { value: 'length', label: 'By Length', icon: '📏', unit: 'm', examples: '1m, 5m, 10m, 50m' },
    { value: 'volume', label: 'By Volume', icon: '🧪', unit: 'L', examples: '1L, 5L, 20L' },
    { value: 'custom', label: 'Custom Unit', icon: '⚙️', unit: 'custom', examples: 'Define your own' },
  ];

  const addPackSize = () => {
    const newPackSize: PackSize = {
      id: Date.now().toString(),
      quantity: 1,
      label: '',
      price: 0,
      stock: 0,
    };
    updateFormData({
      packSizes: [...formData.packSizes, newPackSize],
    });
  };

  const updatePackSize = (id: string, updates: Partial<PackSize>) => {
    const updatedPackSizes = formData.packSizes.map(pack =>
      pack.id === id ? { ...pack, ...updates } : pack
    );
    updateFormData({ packSizes: updatedPackSizes });
  };

  const removePackSize = (id: string) => {
    updateFormData({
      packSizes: formData.packSizes.filter(pack => pack.id !== id),
    });
  };

  return (
    <div className="space-y-6">
      {/* Selling Type Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          How is this product sold? <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sellingTypes.map((type) => (
            <label
              key={type.value}
              className={`relative flex flex-col p-4 border-2 rounded-lg cursor-pointer transition-all ${
                formData.sellingType === type.value
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <input
                type="radio"
                name="sellingType"
                value={type.value}
                checked={formData.sellingType === type.value}
                onChange={(e) => updateFormData({ sellingType: e.target.value as any })}
                className="sr-only"
              />
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">{type.icon}</span>
                <div>
                  <div className="font-semibold text-gray-900">{type.label}</div>
                  <div className="text-sm text-gray-600">Unit: {type.unit}</div>
                </div>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Examples: {type.examples}
              </div>
              {formData.sellingType === type.value && (
                <div className="absolute top-2 right-2 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </label>
          ))}
        </div>
      </div>

      {/* Custom Unit Input */}
      {formData.sellingType === 'custom' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Custom Unit Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.customUnit}
            onChange={(e) => updateFormData({ customUnit: e.target.value })}
            placeholder="e.g., roll, sheet, panel, bag"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
          />
          <p className="mt-1 text-sm text-gray-500">
            This will be displayed as the unit of measurement (e.g., "5 {formData.customUnit || 'units'}")
          </p>
        </div>
      )}

      {/* Pack Sizes Section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Pack Size Options
            </label>
            <p className="text-sm text-gray-500">
              Define different quantities/packs with individual pricing
            </p>
          </div>
          <button
            onClick={addPackSize}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Pack Size
          </button>
        </div>

        {formData.packSizes.length === 0 ? (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <div className="text-gray-400 mb-2">📦</div>
            <p className="text-gray-600 mb-4">No pack sizes defined yet</p>
            <button
              onClick={addPackSize}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add First Pack Size
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {formData.packSizes.map((pack, index) => (
              <div key={pack.id} className="border border-gray-300 rounded-lg p-4 bg-gray-50">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-medium text-gray-700">Pack #{index + 1}</span>
                  <button
                    onClick={() => removePackSize(pack.id)}
                    className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Quantity
                    </label>
                    <input
                      type="number"
                      value={pack.quantity}
                      onChange={(e) => updatePackSize(pack.id, { quantity: parseInt(e.target.value) || 0 })}
                      min="1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Label
                    </label>
                    <input
                      type="text"
                      value={pack.label}
                      onChange={(e) => updatePackSize(pack.id, { label: e.target.value })}
                      placeholder={`${pack.quantity} ${unitLabel}`}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Price (TND)
                    </label>
                    <input
                      type="number"
                      value={pack.price}
                      onChange={(e) => updatePackSize(pack.id, { price: parseFloat(e.target.value) || 0 })}
                      min="0"
                      step="0.01"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Stock
                    </label>
                    <input
                      type="number"
                      value={pack.stock}
                      onChange={(e) => updatePackSize(pack.id, { stock: parseInt(e.target.value) || 0 })}
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Preview Section */}
      {formData.packSizes.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-blue-600" />
              <span className="font-medium text-blue-900">Customer View Preview</span>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-4 border border-blue-200">
            <p className="text-sm font-medium text-gray-700 mb-3">Available Pack Sizes:</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {formData.packSizes.map((pack) => (
                <div key={pack.id} className="border border-gray-300 rounded-lg p-3 hover:border-blue-500 cursor-pointer transition-colors">
                  <div className="font-semibold text-gray-900">
                    {pack.label || `${pack.quantity} ${unitLabel}`}
                  </div>
                  <div className="text-lg font-bold text-blue-600 mt-1">
                    {pack.price.toFixed(2)} TND
                  </div>
                  <div className="text-xs text-gray-600 mt-1">
                    {pack.stock > 0 ? (
                      <span className="text-green-600">✓ In Stock ({pack.stock})</span>
                    ) : (
                      <span className="text-red-600">✗ Out of Stock</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
