import { X, ShoppingCart, Minus, Plus, Package } from 'lucide-react';
import { ProductFormData } from '../../pages/CreateProductPage';
import { useState } from 'react';

interface Props {
  formData: ProductFormData;
  unitLabel: string;
  onClose: () => void;
}

export default function ProductPreviewModal({ formData, unitLabel, onClose }: Props) {
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedPackSize, setSelectedPackSize] = useState<string>('');
  const [quantity, setQuantity] = useState(1);

  const getCurrentPrice = () => {
    if (selectedSize) {
      const size = formData.sizeVariations.find(s => s.id === selectedSize);
      return size?.price || formData.basePrice;
    }
    if (selectedPackSize) {
      const pack = formData.packSizes.find(p => p.id === selectedPackSize);
      return pack?.price || formData.basePrice;
    }
    return formData.basePrice;
  };

  const getCurrentStock = () => {
    if (selectedSize) {
      const size = formData.sizeVariations.find(s => s.id === selectedSize);
      return size?.stock || 0;
    }
    if (selectedPackSize) {
      const pack = formData.packSizes.find(p => p.id === selectedPackSize);
      return pack?.stock || 0;
    }
    return formData.stockQuantity;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Product Preview</h2>
            <p className="text-sm text-gray-600">How customers will see this product</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Product Detail Preview */}
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Images */}
            <div>
              <div className="aspect-square bg-gray-100 rounded-lg mb-4 overflow-hidden">
                {formData.imagePreviewUrls[0] ? (
                  <img
                    src={formData.imagePreviewUrls[0]}
                    alt={formData.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <Package className="w-24 h-24" />
                  </div>
                )}
              </div>
              
              {formData.imagePreviewUrls.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {formData.imagePreviewUrls.slice(1, 5).map((url, index) => (
                    <div key={index} className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                      <img src={url} alt={`${formData.name} ${index + 2}`} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              {/* Title & Brand */}
              <div>
                {formData.brand && (
                  <p className="text-sm text-blue-600 font-medium mb-1">{formData.brand}</p>
                )}
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {formData.name || 'Product Name'}
                </h1>
                <p className="text-sm text-gray-600">SKU: {formData.sku || 'N/A'}</p>
              </div>

              {/* Price */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-4xl font-bold text-blue-600">
                  {getCurrentPrice().toFixed(2)} TND
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  Price per {unitLabel}
                </p>
              </div>

              {/* Pack Sizes */}
              {formData.packSizes.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Pack Size:
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {formData.packSizes.map((pack) => (
                      <button
                        key={pack.id}
                        onClick={() => {
                          setSelectedPackSize(pack.id);
                          setSelectedSize('');
                        }}
                        className={`border-2 rounded-lg p-3 text-center transition-all ${
                          selectedPackSize === pack.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        <div className="font-semibold text-gray-900">
                          {pack.label || `${pack.quantity} ${unitLabel}`}
                        </div>
                        <div className="text-sm font-bold text-blue-600 mt-1">
                          {pack.price.toFixed(2)} TND
                        </div>
                        <div className="text-xs text-gray-600 mt-1">
                          {pack.stock > 0 ? `${pack.stock} available` : 'Out of stock'}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Size Variations */}
              {formData.hasSizes && formData.sizeVariations.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Size:
                  </label>
                  <select
                    value={selectedSize}
                    onChange={(e) => {
                      setSelectedSize(e.target.value);
                      setSelectedPackSize('');
                    }}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  >
                    <option value="">Choose a size...</option>
                    {formData.sizeVariations.map((size) => (
                      <option key={size.id} value={size.id}>
                        {size.sizeName} {size.dimension && `(${size.dimension}${unitLabel})`} - {size.price.toFixed(2)} TND
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Stock Status */}
              <div className="flex items-center gap-2">
                {getCurrentStock() > 0 ? (
                  <>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-green-700 font-medium">
                      In Stock ({getCurrentStock()} available)
                    </span>
                  </>
                ) : (
                  <>
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span className="text-red-700 font-medium">Out of Stock</span>
                  </>
                )}
              </div>

              {/* Quantity Selector */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantity:
                </label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Minus className="w-5 h-5" />
                  </button>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    min="1"
                    max={getCurrentStock()}
                    className="w-20 px-4 py-2 border border-gray-300 rounded-lg text-center focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                  <button
                    onClick={() => setQuantity(Math.min(getCurrentStock(), quantity + 1))}
                    className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                  <span className="text-gray-600">
                    {unitLabel}
                  </span>
                </div>
              </div>

              {/* Add to Cart Button */}
              <button
                disabled={getCurrentStock() === 0}
                className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold text-lg"
              >
                <ShoppingCart className="w-5 h-5" />
                Add to Cart - {(getCurrentPrice() * quantity).toFixed(2)} TND
              </button>

              {/* Description */}
              {formData.description && (
                <div className="pt-6 border-t border-gray-200">
                  <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
                  <p className="text-gray-700 whitespace-pre-line">
                    {formData.description}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Size Table Preview (if has sizes) */}
          {formData.hasSizes && formData.sizeVariations.length > 0 && (
            <div className="mt-8 pt-8 border-t border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Available Sizes</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Size</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Dimension</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Price</th>
                      <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Stock</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {formData.sizeVariations.map((size) => (
                      <tr key={size.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium text-gray-900">{size.sizeName}</td>
                        <td className="px-4 py-3 text-gray-600">{size.dimension} {unitLabel}</td>
                        <td className="px-4 py-3 text-right font-semibold text-blue-600">
                          {size.price.toFixed(2)} TND
                        </td>
                        <td className="px-4 py-3 text-center">
                          {size.stock > 0 ? (
                            <span className="inline-block px-2 py-1 bg-green-100 text-green-700 text-xs rounded">
                              {size.stock} available
                            </span>
                          ) : (
                            <span className="inline-block px-2 py-1 bg-red-100 text-red-700 text-xs rounded">
                              Out of stock
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
