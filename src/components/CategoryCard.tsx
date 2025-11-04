import { ChevronRight } from 'lucide-react';
import { Category } from '../data/categories';

interface CategoryCardProps {
  category: Category;
  onClick: () => void;
}

export default function CategoryCard({ category, onClick }: CategoryCardProps) {
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="%23cbd5e0" stroke-width="2"%3E%3Crect x="3" y="3" width="18" height="18" rx="2"/%3E%3Ccircle cx="8.5" cy="8.5" r="1.5"/%3E%3Cpath d="m21 15-5-5L5 21"/%3E%3C/svg%3E';
  };

  return (
    <button
      onClick={onClick}
      className="w-full bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow"
    >
      <div className="flex items-center gap-4 p-4">
        <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100 flex items-center justify-center">
          <img
            src={category.image}
            alt={category.name}
            className="w-full h-full object-cover"
            onError={handleImageError}
          />
        </div>

        <div className="flex-1 text-left">
          <h3 className="font-semibold text-gray-800">{category.name}</h3>
          {category.subcategories && (
            <p className="text-sm text-gray-500 mt-1">
              {category.subcategories.length} subcategories
            </p>
          )}
        </div>

        <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
      </div>
    </button>
  );
}
