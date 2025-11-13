import { Search, Award, TrendingUp, Truck, Headphones } from 'lucide-react';
import CategoryCard from '../components/CategoryCard';
import BannerSlider from '../components/BannerSlider';
import FeaturedProducts from '../components/FeaturedProducts';
import { Category } from '../types/api';
import { useLanguage } from '../contexts/LanguageContext';

interface HomeScreenProps {
  categories: Category[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onCategoryClick: (categoryId: string) => void;
  onProductClick?: (productId: string) => void;
}

export default function HomeScreen({ categories, searchQuery, onSearchChange, onCategoryClick, onProductClick }: HomeScreenProps) {
  const { t } = useLanguage();
  
  const handleBannerClick = (slide: any) => {
    // Handle banner click - navigate to linked product or category
    if (slide.linkType === 'CATEGORY' && slide.linkedCategoryId) {
      onCategoryClick(slide.linkedCategoryId);
    } else if (slide.linkType === 'PRODUCT' && slide.linkedProductId && onProductClick) {
      onProductClick(slide.linkedProductId);
    }
  };

  const handleProductClick = (productId: string) => {
    if (onProductClick) {
      onProductClick(productId);
    }
  };

  // Featured categories (first 4 or 8)
  const featuredCategories = categories.slice(0, 8);

  return (
    <div className="pb-6">
      {/* Hero Banner */}
      <BannerSlider onSlideClick={handleBannerClick} />

      {/* Search Bar - Prominent */}
      <div className="px-4 mt-8 mb-8">
        <div className="relative max-w-2xl mx-auto">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder={t.home?.searchPlaceholder || "Search tools, materials, or brands…"}
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent shadow-sm text-base"
          />
        </div>
      </div>

      {/* Featured Categories Section */}
      <div className="px-4 mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {t.home?.featuredCategories || "Featured Categories"}
          </h2>
        </div>

        {categories.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">
              {searchQuery ? 'No categories found matching your search' : 'No categories available'}
            </p>
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="mt-2 text-orange-600 hover:text-orange-700 font-medium"
              >
                Clear search
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {featuredCategories.map((category) => (
              <div
                key={category.id}
                onClick={() => onCategoryClick(category.id)}
                className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer group"
              >
                <div className="aspect-square bg-gray-100 overflow-hidden">
                  {category.image ? (
                    <img
                      src={category.image}
                      alt={category.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-orange-100 to-orange-50">
                      <span className="text-4xl text-orange-500">🔨</span>
                    </div>
                  )}
                </div>
                <div className="p-3 text-center">
                  <h3 className="font-medium text-gray-900 text-sm group-hover:text-orange-600 transition-colors">
                    {category.name}
                  </h3>
                  {category.subcategories && category.subcategories.length > 0 && (
                    <p className="text-xs text-gray-500 mt-1">
                      {category.subcategories.length} {category.subcategories.length === 1 ? 'subcategory' : 'subcategories'}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* View All Categories Link */}
        {categories.length > 8 && (
          <div className="text-center mt-6">
            <button className="text-orange-600 hover:text-orange-700 font-medium inline-flex items-center">
              {t.home?.viewAllCategories || "View All Categories"}
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* Featured Products Section */}
      <FeaturedProducts onProductClick={handleProductClick} />

      {/* Why Choose Us Section */}
      <div className="bg-gray-50 py-12 px-4 mb-12">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
            {t.home?.whyChooseUs || "Why Choose Us?"}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Quality Products */}
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">
                {t.home?.qualityProducts || "Quality Products"}
              </h3>
              <p className="text-sm text-gray-600">
                {t.home?.qualityProductsDesc || "We offer only the best quality products from trusted brands"}
              </p>
            </div>

            {/* High Ratings */}
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">
                {t.home?.highRatings || "High Ratings"}
              </h3>
              <p className="text-sm text-gray-600">
                {t.home?.highRatingsDesc || "Rated 4.8/5 by thousands of satisfied customers"}
              </p>
            </div>

            {/* Free Delivery */}
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Truck className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">
                {t.home?.freeDelivery || "Free Delivery"}
              </h3>
              <p className="text-sm text-gray-600">
                {t.home?.freeDeliveryDesc || "Free shipping on orders over 200 TND"}
              </p>
            </div>

            {/* Good Support */}
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Headphones className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">
                {t.home?.goodSupport || "Good Support"}
              </h3>
              <p className="text-sm text-gray-600">
                {t.home?.goodSupportDesc || "24/7 customer support ready to help you"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* All Categories List (if searching or viewing all) */}
      {searchQuery && categories.length > 0 && (
        <div className="px-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            {t.home?.searchResults || "Search Results"}
            <span className="ml-2 text-sm text-gray-500">
              ({categories.length} {categories.length === 1 ? 'result' : 'results'})
            </span>
          </h3>
          <div className="space-y-3">
            {categories.map((category) => (
              <CategoryCard
                key={category.id}
                category={category}
                onClick={() => onCategoryClick(category.id)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
