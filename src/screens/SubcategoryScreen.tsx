import React, { useState, useEffect, useMemo } from 'react';
import { Search } from 'lucide-react';
import { API } from '../services/api';
import { Category } from '../types/api';
import { useLanguage } from '../contexts/LanguageContext';

interface SubcategoryScreenProps {
  parentCategory: Category;
  onSubcategoryClick: (subcategory: Category) => void;
  onProductClick?: (productId: string) => void;
  onAddToCart?: (product: any) => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
}

export default function SubcategoryScreen({
  parentCategory,
  onSubcategoryClick,
  onProductClick,
  onAddToCart,
  searchQuery = '',
  onSearchChange
}: SubcategoryScreenProps) {
  const { t } = useLanguage();
  const [subcategories, setSubcategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadSubcategories = async () => {
      try {
        setLoading(true);
        const response = await API.getSubcategories(parentCategory.id);
        setSubcategories(response);
      } catch (err) {
        setError('Failed to load subcategories');
        console.error('Error loading subcategories:', err);
      } finally {
        setLoading(false);
      }
    };

    loadSubcategories();
  }, [parentCategory.id]);

  // Filter subcategories based on search query
  const filteredSubcategories = useMemo(() => {
    if (!searchQuery.trim()) return subcategories;

    const query = searchQuery.toLowerCase();
    return subcategories.filter(subcategory =>
      subcategory.name.toLowerCase().includes(query) ||
      subcategory.description?.toLowerCase().includes(query)
    );
  }, [subcategories, searchQuery]);

  if (loading) {
    return (
      <div className="px-4 py-6">
        <div className="mb-8">
          <div className="h-8 bg-gray-200 rounded w-48 mb-2 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-lg shadow-sm animate-pulse">
              <div className="aspect-square bg-gray-200"></div>
              <div className="p-3">
                <div className="h-4 bg-gray-200 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 px-4">
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="pb-6">
      {/* Header Section */}
      <div className="px-4 mt-6 mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {parentCategory.name}
        </h2>
        <p className="text-sm text-gray-500">
          {filteredSubcategories.length} {filteredSubcategories.length === 1 ? 'subcategory' : 'subcategories'}
          {searchQuery && ' (filtered)'}
        </p>
      </div>

      {/* Search Bar */}
      {onSearchChange && (
        <div className="px-4 mb-8">
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder={t.home?.searchPlaceholder || "Search subcategories…"}
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent shadow-sm text-base"
            />
          </div>
        </div>
      )}

      {/* Subcategories Grid */}
      <div className="px-4">
        {filteredSubcategories.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">
              {searchQuery ? 'No subcategories found matching your search' : 'No subcategories found'}
            </p>
            {searchQuery && onSearchChange && (
              <button
                onClick={() => onSearchChange('')}
                className="text-orange-600 hover:text-orange-700 font-medium"
              >
                Clear search
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {filteredSubcategories.map((subcategory) => (
              <div
                key={subcategory.id}
                onClick={() => onSubcategoryClick(subcategory)}
                className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer group"
              >
                <div className="aspect-square bg-gray-100 overflow-hidden">
                  {subcategory.image ? (
                    <img
                      src={subcategory.image}
                      alt={subcategory.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-orange-100 to-orange-50">
                      <span className="text-4xl text-orange-500">📦</span>
                    </div>
                  )}
                </div>
                <div className="p-3 text-center">
                  <h3 className="font-medium text-gray-900 text-sm group-hover:text-orange-600 transition-colors">
                    {subcategory.name}
                  </h3>
                  {subcategory.count > 0 && (
                    <p className="text-xs text-gray-500 mt-1">
                      {subcategory.count} {subcategory.count === 1 ? 'product' : 'products'}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
