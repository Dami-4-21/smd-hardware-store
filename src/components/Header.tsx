import { Menu, ShoppingCart, ArrowLeft, User, Wrench } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface HeaderProps {
  title?: string;
  showBack?: boolean;
  onBackClick?: () => void;
  onMenuClick: () => void;
  cartItemCount: number;
  onCartClick: () => void;
  onAccountClick?: () => void;
  isAuthenticated?: boolean;
}

export default function Header({
  title = 'SMD Hardware Store',
  showBack = false,
  onBackClick,
  onMenuClick,
  cartItemCount,
  onCartClick,
  onAccountClick,
  isAuthenticated = false
}: HeaderProps) {
  const { t } = useLanguage();
  
  return (
    <header className="bg-white shadow-sm sticky top-0 z-40">
      <div className="flex items-center justify-between px-4 py-4 max-w-7xl mx-auto">
        {/* Left side - Logo and Store Name */}
        <div className="flex items-center gap-3">
          {showBack ? (
            <button
              onClick={onBackClick}
              className="p-2 -ml-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-gray-700" />
            </button>
          ) : (
            <button
              onClick={onMenuClick}
              className="p-2 -ml-2 hover:bg-gray-100 rounded-lg transition-colors lg:hidden"
            >
              <Menu className="w-6 h-6 text-gray-700" />
            </button>
          )}
          
          {/* Logo and Store Name */}
          <div className="flex items-center gap-2">
            <div className="bg-gray-800 p-2 rounded-lg">
              <Wrench className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-gray-900 hidden sm:block">
              {t.header?.title || 'SMD Hardware Store'}
            </span>
          </div>
        </div>

        {/* Right side - User and Cart Icons */}
        <div className="flex items-center gap-1">
          {onAccountClick && (
            <button
              onClick={onAccountClick}
              className="relative p-2.5 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Account"
            >
              <User className="w-6 h-6 text-gray-700" />
              {isAuthenticated && (
                <span className="absolute top-1 right-1 bg-green-500 w-2 h-2 rounded-full"></span>
              )}
            </button>
          )}
          
          <button
            onClick={onCartClick}
            className="relative p-2.5 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Shopping Cart"
          >
            <ShoppingCart className="w-6 h-6 text-gray-700" />
            {cartItemCount > 0 && (
              <span className="absolute top-0 right-0 bg-orange-500 text-white text-xs font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1">
                {cartItemCount > 9 ? '9+' : cartItemCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
