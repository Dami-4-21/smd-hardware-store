import { Plus } from 'lucide-react';
import { Product } from '../types/api';
import { useCart } from '../context/CartContext';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  onClick: () => void;
}

export default function ProductCard({ product, onAddToCart, onClick }: ProductCardProps) {
  const { getCartQuantity } = useCart();
  const cartQuantity = getCartQuantity(product.id);
  const availableStock = product.stock - cartQuantity;

  const handleAddClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (availableStock > 0) {
      onAddToCart(product);
    }
  };

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
    >
      <div className="aspect-square bg-gray-100 overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover"
        />
      </div>

      <div className="p-3">
        <p className="text-xs text-gray-500 mb-1">{product.brand}</p>
        <h3 className="font-medium text-gray-800 text-sm mb-2 line-clamp-2">{product.name}</h3>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-lg font-bold text-gray-900">{product.price.toFixed(2)} TND</p>
            <p className="text-xs text-gray-500">
              {availableStock > 0 ? `${availableStock} available` : 'Out of stock'}
              {cartQuantity > 0 && ` (${cartQuantity} in cart)`}
            </p>
          </div>

          <button
            onClick={handleAddClick}
            disabled={availableStock <= 0}
            className={`rounded-lg p-2 transition-colors ${
              availableStock > 0
                ? 'bg-green-600 hover:bg-green-700 text-white'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
