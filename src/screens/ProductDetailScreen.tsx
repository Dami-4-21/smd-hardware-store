import { useState, useEffect } from 'react';
import { ShoppingCart, Minus, Plus, Package, ChevronDown, ChevronUp } from 'lucide-react';
import { Product } from '../types/api';
import { API } from '../services/api';
import { useCart } from '../context/CartContext';

interface ProductDetailScreenProps {
  productId: string;
  onAddToCart: (product: Product) => void;
}

export default function ProductDetailScreen({ productId, onAddToCart }: ProductDetailScreenProps) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [specsExpanded, setSpecsExpanded] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [packQuantities, setPackQuantities] = useState<{ [packId: string]: number }>({});
  const { getCartQuantity } = useCart();

  useEffect(() => {
    const loadProduct = async () => {
      try {
        setLoading(true);
        // Use the dedicated single product endpoint
        const productData = await API.getProduct(productId);
        setProduct(productData);
      } catch (err) {
        setError('Failed to load product');
        console.error('Error loading product:', err);
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [productId]);

  const cartQuantity = product ? getCartQuantity(product.id) : 0;
  const availableStock = product ? product.stock - cartQuantity : 0;

  // Get current price based on selected size
  const getCurrentPrice = () => {
    if (!product) return 0;
    if (product.sizeTableData && selectedSize) {
      const sizeOption = product.sizeTableData.sizeTable.find(s => s.size === selectedSize);
      return sizeOption ? sizeOption.price : product.price;
    }
    return product.price;
  };

  // Get available stock for selected size
  const getAvailableStock = () => {
    if (!product) return 0;
    if (product.sizeTableData && selectedSize) {
      const sizeOption = product.sizeTableData.sizeTable.find(s => s.size === selectedSize);
      return sizeOption ? sizeOption.quantity : availableStock;
    }
    return availableStock;
  };

  // Set initial size when product loads
  useEffect(() => {
    if (product?.sizeTableData?.sizeTable && product.sizeTableData.sizeTable.length > 0) {
      setSelectedSize(product.sizeTableData.sizeTable[0].size);
    }
  }, [product]);

  const handleAddToCart = () => {
    if (!product) return;

    // Handle pack-based purchases
    if (product.packSizeData && Object.values(packQuantities).some(q => q > 0)) {
      product.packSizeData.packSizes.forEach((pack) => {
        const qty = packQuantities[pack.id] || 0;
        if (qty > 0) {
          // Add each pack to cart with its specific price
          const packProduct = {
            ...product,
            name: `${product.name} - ${pack.packType}${pack.size ? ` (${pack.size})` : ''}`,
            price: pack.price,
            sku: pack.sku || `${product.sku}-${pack.packType}`,
          };
          for (let i = 0; i < qty; i++) {
            onAddToCart(packProduct);
          }
        }
      });
      // Reset pack quantities after adding to cart
      setPackQuantities({});
      return;
    }

    // Handle regular or size-based purchases
    if (getAvailableStock() > 0) {
      const productToAdd = {
        ...product,
        price: getCurrentPrice()
      };
      for (let i = 0; i < quantity; i++) {
        onAddToCart(productToAdd);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">{error || 'Product not found'}</p>
        <button
          onClick={() => window.location.reload()}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  const getUnitLabel = () => {
    if (product?.sizeTableData) {
      return product.sizeTableData.unitType;
    }
    return 'piece';
  };

  return (
    <div className="pb-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6">
        {/* Product Images */}
        <div>
          <div className="aspect-square bg-gray-100 rounded-lg mb-4 overflow-hidden">
            {product.image ? (
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <Package className="w-24 h-24" />
              </div>
            )}
          </div>
          
          {product.images && product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {product.images.slice(1, 5).map((url, index) => (
                <div key={index} className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                  <img src={url} alt={`${product.name} ${index + 2}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          {/* Title & Brand */}
          <div>
            {product.brand && (
              <p className="text-sm text-blue-600 font-medium mb-1">{product.brand}</p>
            )}
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {product.name}
            </h1>
            <p className="text-sm text-gray-600">SKU: {product.sku || 'N/A'}</p>
          </div>

          {/* Price */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-4xl font-bold text-blue-600">
              {getCurrentPrice().toFixed(2)} TND
            </div>
            <p className="text-sm text-gray-600 mt-1">
              Price per {getUnitLabel()}
            </p>
          </div>

          {/* Size Selector */}
          {product.sizeTableData && product.sizeTableData.sizeTable.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Size:
              </label>
              <select
                value={selectedSize}
                onChange={(e) => setSelectedSize(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white"
              >
                <option value="">Choose a size...</option>
                {product.sizeTableData.sizeTable.map((sizeOption) => (
                  <option key={sizeOption.size} value={sizeOption.size}>
                    {sizeOption.size} - {sizeOption.price.toFixed(2)} TND
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Pack Selection (if has pack sizes) */}
          {product.packSizeData && product.packSizeData.packSizes.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Select Pack & Size</h3>
              <div className="space-y-3">
                {product.packSizeData.packSizes.map((pack) => {
                  const packQty = packQuantities[pack.id] || 0;
                  const packTotal = pack.price * packQty;
                  
                  return (
                    <div
                      key={pack.id}
                      className="border border-gray-200 rounded-lg p-4 hover:border-blue-500 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold text-gray-900">{pack.packType}</h4>
                            {pack.size && (
                              <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                                Size: {pack.size}
                              </span>
                            )}
                          </div>
                          <div className="mt-1 text-sm text-gray-600">
                            {pack.packQuantity} pieces per pack
                            {pack.unitType && ` • ${pack.unitType}`}
                          </div>
                          <div className="mt-2 flex items-baseline gap-2">
                            <span className="text-2xl font-bold text-blue-600">
                              {pack.price.toFixed(2)} TND
                            </span>
                            <span className="text-sm text-gray-500">per pack</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {pack.stockQuantity > 0 ? (
                            <span className="text-xs text-green-600 font-medium">
                              {pack.stockQuantity} in stock
                            </span>
                          ) : (
                            <span className="text-xs text-red-600 font-medium">
                              Out of stock
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {pack.stockQuantity > 0 && (
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => {
                              setPackQuantities(prev => ({
                                ...prev,
                                [pack.id]: Math.max(0, (prev[pack.id] || 0) - 1)
                              }));
                            }}
                            disabled={packQty === 0}
                            className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <input
                            type="number"
                            value={packQty}
                            onChange={(e) => {
                              const val = Math.max(0, Math.min(pack.stockQuantity, parseInt(e.target.value) || 0));
                              setPackQuantities(prev => ({
                                ...prev,
                                [pack.id]: val
                              }));
                            }}
                            min="0"
                            max={pack.stockQuantity}
                            className="w-20 px-3 py-2 border border-gray-300 rounded-lg text-center focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                          />
                          <button
                            onClick={() => {
                              setPackQuantities(prev => ({
                                ...prev,
                                [pack.id]: Math.min(pack.stockQuantity, (prev[pack.id] || 0) + 1)
                              }));
                            }}
                            disabled={packQty >= pack.stockQuantity}
                            className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                          {packQty > 0 && (
                            <div className="ml-auto text-right">
                              <div className="text-sm text-gray-600">
                                {packQty} pack{packQty > 1 ? 's' : ''} × {pack.packQuantity} = {packQty * pack.packQuantity} pieces
                              </div>
                              <div className="text-lg font-bold text-blue-600">
                                {packTotal.toFixed(2)} TND
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              
              {/* Pack Summary */}
              {Object.values(packQuantities).some(q => q > 0) && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Order Summary</h4>
                  <div className="space-y-1 text-sm">
                    {product.packSizeData.packSizes.map((pack) => {
                      const qty = packQuantities[pack.id] || 0;
                      if (qty === 0) return null;
                      return (
                        <div key={pack.id} className="flex justify-between text-gray-700">
                          <span>{pack.packType} {pack.size ? `(${pack.size})` : ''} × {qty}</span>
                          <span className="font-medium">{(pack.price * qty).toFixed(2)} TND</span>
                        </div>
                      );
                    })}
                    <div className="pt-2 mt-2 border-t border-blue-300 flex justify-between text-base font-bold text-gray-900">
                      <span>Total:</span>
                      <span className="text-blue-600">
                        {product.packSizeData.packSizes.reduce((sum, pack) => {
                          return sum + (pack.price * (packQuantities[pack.id] || 0));
                        }, 0).toFixed(2)} TND
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Stock Status */}
          <div className="flex items-center gap-2">
            {getAvailableStock() > 0 ? (
              <>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-green-700 font-medium">
                  In Stock ({getAvailableStock()} available)
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
                max={getAvailableStock()}
                className="w-20 px-4 py-2 border border-gray-300 rounded-lg text-center focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
              <button
                onClick={() => setQuantity(Math.min(getAvailableStock(), quantity + 1))}
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Plus className="w-5 h-5" />
              </button>
              <span className="text-gray-600">
                {getUnitLabel()}
              </span>
            </div>
          </div>

          {/* Add to Cart Button */}
          <button
            onClick={handleAddToCart}
            disabled={
              product.packSizeData
                ? !Object.values(packQuantities).some(q => q > 0)
                : getAvailableStock() === 0
            }
            className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold text-lg"
          >
            <ShoppingCart className="w-5 h-5" />
            {product.packSizeData && Object.values(packQuantities).some(q => q > 0) ? (
              <>
                Add to Cart - {product.packSizeData.packSizes.reduce((sum, pack) => {
                  return sum + (pack.price * (packQuantities[pack.id] || 0));
                }, 0).toFixed(2)} TND
              </>
            ) : (
              <>Add to Cart - {(getCurrentPrice() * quantity).toFixed(2)} TND</>
            )}
          </button>

          {/* Description */}
          {product.description && (
            <div className="pt-6 border-t border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
              <p className="text-gray-700 whitespace-pre-line">
                {product.description}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Size Table (if has sizes) */}
      {product.sizeTableData && product.sizeTableData.sizeTable.length > 0 && (
        <div className="mt-8 pt-8 border-t border-gray-200 px-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Available Sizes</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Size</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Price</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Stock</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {product.sizeTableData.sizeTable.map((sizeOption) => (
                  <tr key={sizeOption.size} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{sizeOption.size}</td>
                    <td className="px-4 py-3 text-right font-semibold text-blue-600">
                      {sizeOption.price.toFixed(2)} TND
                    </td>
                    <td className="px-4 py-3 text-center">
                      {sizeOption.quantity > 0 ? (
                        <span className="inline-block px-2 py-1 bg-green-100 text-green-700 text-xs rounded">
                          {sizeOption.quantity} available
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

      {/* Specifications */}
      {product.specifications && Object.keys(product.specifications).length > 0 && (
        <div className="mt-8 pt-8 border-t border-gray-200 px-6">
          <button
            onClick={() => setSpecsExpanded(!specsExpanded)}
            className="w-full flex items-center justify-between mb-4"
          >
            <h3 className="text-xl font-bold text-gray-900">Technical Specifications</h3>
            {specsExpanded ? (
              <ChevronUp className="w-5 h-5 text-gray-500" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-500" />
            )}
          </button>

          {specsExpanded && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <tbody className="divide-y divide-gray-200">
                  {Object.entries(product.specifications).map(([key, value]) => (
                    <tr key={key} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-700 w-1/3">
                        {key}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">{value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
