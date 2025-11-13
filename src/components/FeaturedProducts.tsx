import { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { API } from '../services/api';
import { formatPrice } from '../utils/currency';
import { Product } from '../types/api';

interface FeaturedProductsProps {
  onProductClick: (productId: string) => void;
  onAddToCart?: (product: any, quantity: number) => void;
}

export default function FeaturedProducts({ onProductClick, onAddToCart }: FeaturedProductsProps) {
  const { t } = useLanguage();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFeaturedProducts();
  }, []);

  const loadFeaturedProducts = async () => {
    try {
      setLoading(true);
      // Get first page of products (first 4 as featured)
      const response = await API.getProducts(1, 4);
      if (response && response.products) {
        setProducts(response.products);
      }
    } catch (error) {
      console.error('Error loading featured products:', error);
      setProducts([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  // formatPrice now imported from utils/currency

  const getBadgeColor = (index: number) => {
    const colors = ['bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-purple-500'];
    return colors[index % colors.length];
  };

  const getBadgeText = (index: number) => {
    const badges = ['Sale', 'New', 'Hot', 'Deal'];
    return badges[index % badges.length];
  };

  if (loading) {
    return (
      <div className="px-4 mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          {t.home?.featuredProducts || "Featured Products"}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-lg shadow-sm animate-pulse">
              <div className="aspect-square bg-gray-200"></div>
              <div className="p-4">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded mb-2"></div>
                <div className="h-5 bg-gray-200 rounded w-20"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return null;
  }

  return (
    <div className="px-4 mb-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          {t.home?.featuredProducts || "Featured Products"}
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {products.map((product, index) => (
          <div
            key={product.id}
            className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer group overflow-hidden"
            onClick={() => onProductClick(product.id)}
          >
            {/* Product Image */}
            <div className="relative aspect-square bg-gray-100 overflow-hidden">
              {/* Badge */}
              <div className={`absolute top-2 left-2 ${getBadgeColor(index)} text-white text-xs font-bold px-2 py-1 rounded z-10`}>
                {getBadgeText(index)}
              </div>
              
              {product.images && product.images.length > 0 ? (
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-50">
                  <span className="text-4xl text-gray-300">📦</span>
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="p-4">
              <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2 group-hover:text-orange-600 transition-colors">
                {product.name}
              </h3>
              <p className="text-xs text-gray-500 mb-3 line-clamp-2">
                {product.description}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold text-gray-900">
                  {formatPrice(product.basePrice || product.price || 0)}
                </span>
                {product.stock > 0 ? (
                  <span className="text-xs text-green-600 font-medium">
                    {t.products?.inStock || 'In Stock'}
                  </span>
                ) : (
                  <span className="text-xs text-red-600 font-medium">
                    {t.products?.outOfStock || 'Out of Stock'}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
