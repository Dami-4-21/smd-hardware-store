import { useState, useMemo, useEffect } from 'react';
import { ArrowUpDown } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { Product } from '../types/api';
import { API } from '../services/api';

interface ProductListScreenProps {
  categoryId: string;
  searchQuery?: string;
  onProductClick: (productId: string) => void;
  onAddToCart: (product: Product) => void;
  onSearchChange?: (query: string) => void;
}

type SortOption = 'name-asc' | 'name-desc' | 'price-asc' | 'price-desc' | 'popularity';

export default function ProductListScreen({
  categoryId,
  searchQuery = '',
  onProductClick,
  onAddToCart,
  onSearchChange
}: ProductListScreenProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>('name-asc');

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        const response = await API.getProductsByCategory(categoryId);
        setProducts(response.products);
      } catch (err) {
        setError('Failed to load products');
        console.error('Error loading products:', err);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [categoryId]);

  const sortedProducts = useMemo(() => {
    let filtered = [...products];

    // First filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query) ||
        product.sku.toLowerCase().includes(query) ||
        product.specifications &&
        Object.values(product.specifications).some(spec =>
          spec.toLowerCase().includes(query)
        )
      );
    }

    // Then sort the filtered results
    switch (sortBy) {
      case 'name-asc':
        return filtered.sort((a, b) => a.name.localeCompare(b.name));
      case 'name-desc':
        return filtered.sort((a, b) => b.name.localeCompare(a.name));
      case 'price-asc':
        return filtered.sort((a, b) => a.price - b.price);
      case 'price-desc':
        return filtered.sort((a, b) => b.price - a.price);
      case 'popularity':
        return filtered.sort((a, b) => b.stock - a.stock); // Using stock as popularity indicator
      default:
        return filtered;
    }
  }, [products, searchQuery, sortBy]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="py-6">
      {/* Search Bar */}
      <div className="px-4 mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Search tools, materials, or brands…"
            value={searchQuery}
            onChange={(e) => {
              onSearchChange?.(e.target.value);
            }}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="px-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-800">
            Products ({sortedProducts.length})
            {searchQuery && (
              <span className="ml-2 text-sm text-gray-500">
                of {products.length} total
              </span>
            )}
          </h2>

          <div className="flex items-center gap-2">
            <ArrowUpDown className="w-4 h-4 text-gray-500" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="name-asc">Name A-Z</option>
              <option value="name-desc">Name Z-A</option>
              <option value="price-asc">Price Low-High</option>
              <option value="price-desc">Price High-Low</option>
              <option value="popularity">Most Popular</option>
            </select>
          </div>
        </div>

        {sortedProducts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">
              {searchQuery ? 'No products found matching your search' : 'No products found in this category'}
            </p>
            {searchQuery && (
              <button
                onClick={() => window.location.reload()}
                className="mt-2 text-blue-600 hover:text-blue-700"
              >
                Clear search and reload
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onClick={() => onProductClick(product.id)}
                onAddToCart={() => onAddToCart(product)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
