import { useState, useEffect } from 'react';
import { ShoppingCart, Minus, Plus, Star, Package } from 'lucide-react';
import { Product } from '../types/api';
import { API } from '../services/api';
import { useLanguage } from '../contexts/LanguageContext';
import { formatPrice } from '../utils/currency';

interface ProductDetailScreenProps {
  productId: string;
  onAddToCart: (product: Product, selectedSize?: any, selectedPack?: any) => void;
}

interface SelectedVariation {
  type: 'size' | 'pack' | 'base';
  id?: string;
  price: number;
  stock: number;
  unitType?: string;
  label?: string;
}

interface SizePackCombination {
  sizeId?: string;
  packId?: string;
  price: number;
  stock: number;
  label: string;
}

export default function ProductDetailScreen({ productId, onAddToCart }: ProductDetailScreenProps) {
  const { t } = useLanguage();
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedVariation, setSelectedVariation] = useState<SelectedVariation | null>(null);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedPack, setSelectedPack] = useState<string>('');

  useEffect(() => {
    loadProduct();
  }, [productId]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      const productData = await API.getProduct(productId);
      setProduct(productData);

      // Set default variation (base product)
      setSelectedVariation({
        type: 'base',
        price: Number(productData.basePrice),
        stock: productData.stockQuantity || productData.stock || 0,
        unitType: 'piece'
      });
      
      // Reset size and pack selections
      setSelectedSize('');
      setSelectedPack('');

      // Load related products from same category
      if (productData.categoryId) {
        const response = await API.getProductsByCategory(productData.categoryId.toString());
        const related = response.products
          .filter((p: Product) => p.id !== productId)
          .slice(0, 4);
        setRelatedProducts(related);
      }
    } catch (err) {
      setError('Failed to load product');
      console.error('Error loading product:', err);
    } finally {
      setLoading(false);
    }
  };

  // formatPrice now imported from utils/currency

  const handleSizeChange = (sizeId: string) => {
    if (!product) return;
    
    setSelectedSize(sizeId);
    updateVariation(sizeId, selectedPack);
  };

  const handlePackChange = (packId: string) => {
    if (!product) return;
    
    setSelectedPack(packId);
    updateVariation(selectedSize, packId);
  };

  const updateVariation = (sizeId: string, packId: string) => {
    if (!product) return;

    // Priority 1: Pack with size (if both selected)
    if (packId && product.packSizes) {
      const packData = product.packSizes.find(p => {
        if (sizeId) {
          // Find pack that matches both pack ID and size
          return p.id === packId && p.size === sizeId;
        }
        // Find pack without size requirement
        return p.id === packId;
      });

      if (packData) {
        setSelectedVariation({
          type: 'pack',
          id: packData.id,
          price: Number(packData.price),
          stock: packData.stockQuantity,
          unitType: packData.unitType,
          label: `${packData.packType}${packData.size ? ` - ${packData.size}` : ''}`
        });
        setQuantity(1);
        return;
      }
    }

    // Priority 2: Size only (if no pack selected)
    if (sizeId && product.sizeTable) {
      const sizeData = product.sizeTable.find(s => s.id === sizeId);
      if (sizeData) {
        setSelectedVariation({
          type: 'size',
          id: sizeData.id,
          price: Number(sizeData.price),
          stock: sizeData.stockQuantity,
          unitType: sizeData.unitType,
          label: sizeData.size
        });
        setQuantity(1);
        return;
      }
    }

    // Priority 3: Base product (nothing selected)
    setSelectedVariation({
      type: 'base',
      price: Number(product.basePrice),
      stock: product.stockQuantity || product.stock || 0,
      unitType: 'piece'
    });
    setQuantity(1);
  };

  const handleQuantityChange = (delta: number) => {
    if (!selectedVariation) return;
    
    const newQuantity = quantity + delta;
    if (newQuantity >= 1 && newQuantity <= selectedVariation.stock) {
      setQuantity(newQuantity);
    }
  };

  const handleAddToCart = () => {
    if (product && selectedVariation) {
      // Prepare size or pack data for cart
      const sizeData = selectedVariation.type === 'size' && selectedVariation.id ? {
        id: selectedVariation.id,
        size: selectedVariation.label || '',
        label: selectedVariation.label,
        price: selectedVariation.price,
        stock: selectedVariation.stock,
        unitType: selectedVariation.unitType || 'piece'
      } : undefined;

      const packData = selectedVariation.type === 'pack' && selectedVariation.id ? {
        id: selectedVariation.id,
        packType: selectedVariation.label || '',
        label: selectedVariation.label,
        price: selectedVariation.price,
        stock: selectedVariation.stock,
        packQuantity: product.packSizes?.find(p => p.id === selectedVariation.id)?.packQuantity || 1
      } : undefined;

      // Create a modified product with selected variation price
      const productToAdd = {
        ...product,
        price: selectedVariation.price,
        basePrice: selectedVariation.price,
        stock: selectedVariation.stock,
        stockQuantity: selectedVariation.stock
      };
      
      // Add to cart with quantity
      for (let i = 0; i < quantity; i++) {
        onAddToCart(productToAdd, sizeData, packData);
      }
    }
  };

  if (loading) {
    return (
      <div className="px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-pulse">
          <div>
            <div className="aspect-square bg-gray-200 rounded-lg mb-4"></div>
            <div className="grid grid-cols-4 gap-2">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="aspect-square bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
          <div className="space-y-4">
            <div className="h-8 bg-gray-200 rounded w-3/4"></div>
            <div className="h-6 bg-gray-200 rounded w-1/4"></div>
            <div className="h-12 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="text-center py-12 px-4">
        <p className="text-red-600 mb-4">{error || 'Product not found'}</p>
        <button
          onClick={loadProduct}
          className="bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700"
        >
          Retry
        </button>
      </div>
    );
  }

  const images = product.imagesData && product.imagesData.length > 0
    ? product.imagesData.map(img => img.imageUrl)
    : product.images && product.images.length > 0
    ? product.images
    : ['https://via.placeholder.com/400'];

  const displayPrice = selectedVariation?.price || Number(product.basePrice);
  const displayStock = selectedVariation?.stock || product.stockQuantity || product.stock || 0;
  const unitType = selectedVariation?.unitType || 'piece';

  return (
    <div className="pb-6">
      <div className="px-4 py-6">
        {/* Product Main Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Image Gallery */}
          <div>
            {/* Main Image */}
            <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-4">
              <img
                src={images[selectedImage]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Thumbnail Strip */}
            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImage === index
                        ? 'border-orange-500'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div>
            {/* Brand */}
            {product.brand && (
              <p className="text-sm text-gray-500 mb-2">{product.brand}</p>
            )}

            {/* Product Name */}
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {product.name}
            </h1>

            {/* Rating (placeholder) */}
            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className="w-5 h-5 fill-orange-400 text-orange-400"
                  />
                ))}
              </div>
              <span className="text-sm text-gray-600">(45 reviews)</span>
            </div>

            {/* Price */}
            <div className="mb-6">
              <p className="text-4xl font-bold text-gray-900">
                {formatPrice(displayPrice)}
                {selectedVariation && selectedVariation.type !== 'base' && (
                  <span className="text-lg text-gray-500 ml-2">
                    / {selectedVariation.label}
                  </span>
                )}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Tax included. Shipping calculated at checkout.
              </p>
            </div>

            {/* Stock Status */}
            <div className="mb-6">
              {displayStock > 0 ? (
                <div className="flex items-center gap-2">
                  <p className="text-green-600 font-medium">
                    ✓ In Stock ({displayStock} {unitType} available)
                  </p>
                  {displayStock <= 5 && (
                    <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs font-semibold rounded">
                      Low Stock
                    </span>
                  )}
                </div>
              ) : (
                <p className="text-red-600 font-medium">
                  ✗ Out of Stock
                </p>
              )}
            </div>

            {/* Size Selector */}
            {product.sizeTable && product.sizeTable.length > 0 && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Size / Unit
                </label>
                <select
                  value={selectedSize}
                  onChange={(e) => handleSizeChange(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="">Base Product - {formatPrice(Number(product.basePrice))}</option>
                  {product.sizeTable.map((size) => (
                    <option key={size.id} value={size.id}>
                      {size.size} ({size.unitType}) - {formatPrice(Number(size.price))} - {size.stockQuantity} available
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Pack Size Selector */}
            {product.packSizes && product.packSizes.length > 0 && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Package className="w-4 h-4 inline mr-1" />
                  Pack Size
                </label>
                <select
                  value={selectedPack}
                  onChange={(e) => handlePackChange(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="">Select pack size</option>
                  {product.packSizes
                    .filter(pack => {
                      // If a size is selected, only show packs for that size or packs without size
                      if (selectedSize) {
                        return pack.size === selectedSize || !pack.size;
                      }
                      return true;
                    })
                    .map((pack) => (
                      <option key={pack.id} value={pack.id}>
                        {pack.packType} ({pack.packQuantity} pieces){pack.size ? ` - ${pack.size}` : ''} - {formatPrice(Number(pack.price))} - {pack.stockQuantity} available
                      </option>
                    ))}
                </select>
                {selectedSize && product.packSizes.filter(p => p.size === selectedSize).length === 0 && (
                  <p className="text-sm text-gray-500 mt-1">
                    No pack sizes available for selected size
                  </p>
                )}
              </div>
            )}

            {/* Quantity Selector */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantity
              </label>
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-gray-300 rounded-lg">
                  <button
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= 1}
                    className="p-3 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Minus className="w-5 h-5" />
                  </button>
                  <span className="px-6 py-3 font-medium min-w-[60px] text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => handleQuantityChange(1)}
                    disabled={quantity >= displayStock}
                    className="p-3 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
                <span className="text-sm text-gray-600">
                  {displayStock} {unitType} available
                </span>
              </div>
            </div>

            {/* Add to Cart Button */}
            <button
              onClick={handleAddToCart}
              disabled={displayStock === 0}
              className={`w-full py-4 rounded-lg font-semibold text-lg flex items-center justify-center gap-2 transition-colors ${
                displayStock === 0
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              <ShoppingCart className="w-6 h-6" />
              {displayStock === 0 ? 'Out of Stock' : 'Add to Cart'}
            </button>

            {/* SKU and Category */}
            <div className="mt-6 pt-6 border-t border-gray-200 space-y-2">
              <p className="text-sm text-gray-600">
                <span className="font-medium">SKU:</span> {product.sku}
              </p>
              {product.category && (
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Category:</span> {product.category.name || product.category}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Product Description & Specifications */}
        <div className="mb-12">
          <div className="border-b border-gray-200 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 pb-4">
              Product Details
            </h2>
          </div>

          {/* Description */}
          {product.description && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Description
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {product.description}
              </p>
            </div>
          )}

          {/* Specifications */}
          {product.specifications && Object.keys(product.specifications).length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Specifications
              </h3>
              <div className="bg-gray-50 rounded-lg p-6">
                <table className="w-full">
                  <tbody>
                    {Object.entries(product.specifications).map(([key, value], index) => (
                      <tr
                        key={key}
                        className={index !== 0 ? 'border-t border-gray-200' : ''}
                      >
                        <td className="py-3 pr-4 font-medium text-gray-700 w-1/3">
                          {key}
                        </td>
                        <td className="py-3 text-gray-600">{value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Related Products
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {relatedProducts.map((relatedProduct) => (
                <div
                  key={relatedProduct.id}
                  className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer group"
                  onClick={() => window.location.reload()}
                >
                  <div className="aspect-square bg-gray-100 rounded-t-lg overflow-hidden">
                    {relatedProduct.images && relatedProduct.images.length > 0 ? (
                      <img
                        src={relatedProduct.images[0]}
                        alt={relatedProduct.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-4xl text-gray-300">📦</span>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-medium text-gray-900 mb-2 line-clamp-2 group-hover:text-orange-600 transition-colors">
                      {relatedProduct.name}
                    </h3>
                    <p className="text-lg font-bold text-gray-900">
                      {formatPrice(Number(relatedProduct.basePrice || relatedProduct.price))}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
