import { Search } from 'lucide-react';
import CategoryCard from '../components/CategoryCard';
import BannerSlider from '../components/BannerSlider';
import { Category } from '../types/api';

interface HomeScreenProps {
  categories: Category[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onCategoryClick: (categoryId: string) => void;
}

export default function HomeScreen({ categories, searchQuery, onSearchChange, onCategoryClick }: HomeScreenProps) {
  const handleBannerClick = (slide: any) => {
    // Handle banner click - navigate to linked product or category
    if (slide.linkType === 'CATEGORY' && slide.linkedCategoryId) {
      onCategoryClick(slide.linkedCategoryId);
    } else if (slide.linkType === 'PRODUCT' && slide.linkedProductId) {
      // Navigate to product detail - you can implement this later
      console.log('Navigate to product:', slide.linkedProductId);
    }
  };

  return (
    <div className="pb-6">
      <BannerSlider onSlideClick={handleBannerClick} />

      <div className="px-4 mt-6">
        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search tools, materials, or brands…"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">
            Shop by Category
            {searchQuery && (
              <span className="ml-2 text-sm text-gray-500">
                ({categories.length} results)
              </span>
            )}
          </h3>
        </div>

        <div className="space-y-3">
          {categories.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">
                {searchQuery ? 'No categories found matching your search' : 'No categories available'}
              </p>
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="mt-2 text-blue-600 hover:text-blue-700"
                >
                  Clear search
                </button>
              )}
            </div>
          ) : (
            categories.map((category) => (
              <CategoryCard
                key={category.id}
                category={category}
                onClick={() => onCategoryClick(category.id)}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
