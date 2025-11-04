import React, { useState, useEffect, useMemo } from 'react';
import { API } from '../services/api';
import { Category } from '../types/api';
import CategoryCard from '../components/CategoryCard';

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
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {parentCategory.name}
        </h2>
        {parentCategory.description && (
          <p className="text-gray-600">{parentCategory.description}</p>
        )}
        <p className="text-sm text-gray-500 mt-2">
          {filteredSubcategories.length} of {subcategories.length} subcategories
          {searchQuery && ` (filtered)`}
        </p>
      </div>

      {/* Search Bar */}
      {onSearchChange && (
        <div className="px-4 mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Search subcategories…"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-4 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      )}

      {filteredSubcategories.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">
            {searchQuery ? 'No subcategories found matching your search' : 'No subcategories found'}
          </p>
          {searchQuery && onSearchChange && (
            <button
              onClick={() => onSearchChange('')}
              className="mt-2 text-blue-600 hover:text-blue-700"
            >
              Clear search
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSubcategories.map((subcategory) => (
            <CategoryCard
              key={subcategory.id}
              category={{
                id: subcategory.id,
                name: subcategory.name,
                image: subcategory.image,
                subcategories: undefined // Subcategories don't have further subcats in this view
              }}
              onClick={() => onSubcategoryClick(subcategory)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
