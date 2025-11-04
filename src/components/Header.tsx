import { Menu, ShoppingCart, ArrowLeft, User } from 'lucide-react';

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
  title = 'Hardware Store',
  showBack = false,
  onBackClick,
  onMenuClick,
  cartItemCount,
  onCartClick,
  onAccountClick,
  isAuthenticated = false
}: HeaderProps) {
  return (
    <header className="bg-white shadow-sm sticky top-0 z-40">
      <div className="flex items-center justify-between px-4 py-3">
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
              className="p-2 -ml-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Menu className="w-6 h-6 text-gray-700" />
            </button>
          )}
          <h1 className="text-lg font-semibold text-gray-800">{title}</h1>
        </div>

        <div className="flex items-center gap-2">
          {onAccountClick && (
            <button
              onClick={onAccountClick}
              className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <User className="w-6 h-6 text-gray-700" />
              {isAuthenticated && (
                <span className="absolute -top-1 -right-1 bg-blue-600 w-2 h-2 rounded-full"></span>
              )}
            </button>
          )}
          
          <button
            onClick={onCartClick}
            className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ShoppingCart className="w-6 h-6 text-gray-700" />
            {cartItemCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-green-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {cartItemCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
