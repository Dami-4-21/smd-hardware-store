import { Trash2, Minus, Plus } from 'lucide-react';
import { CartItem } from '../context/CartContext';

interface BasketScreenProps {
  cartItems: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  isLoading?: boolean;
  onCheckout: () => void;
}

export default function BasketScreen({
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  isLoading = false,
  onCheckout
}: BasketScreenProps) {
  const subtotal = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const tax = subtotal * 0.1; // 10% tax rate
  const total = subtotal + tax;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center px-4 py-20">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <svg
            className="w-12 h-12 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
            />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Your basket is empty</h2>
        <p className="text-gray-500 text-center">Add some products to get started!</p>
      </div>
    );
  }

  return (
    <div className="pb-40">
      <div className="px-4 py-4">
        <div className="space-y-4">
          {cartItems.map((item) => (
            <div key={item.product.id} className="bg-white rounded-lg shadow-sm p-4">
              <div className="flex gap-4">
                <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-900 mb-1">{item.product.name}</h3>
                  <p className="text-sm text-gray-500 mb-2">{item.product.brand}</p>
                  <p className="text-lg font-bold text-green-600">
                    {item.product.price.toFixed(2)} TND
                  </p>
                </div>

                <button
                  onClick={() => onRemoveItem(item.product.id)}
                  className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors self-start"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>

              <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center border border-gray-300 rounded-lg">
                  <button
                    onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
                    className="p-2 text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-4 py-2 font-medium text-gray-900 border-x border-gray-300">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                    className="p-2 text-gray-700 hover:bg-gray-50 transition-colors"
                    disabled={item.quantity >= item.product.stock}
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                <p className="text-lg font-bold text-gray-900">
                  {(item.product.price * item.quantity).toFixed(2)} TND
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg">
        <div className="px-4 py-4">
          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal</span>
              <span className="text-gray-900">{subtotal.toFixed(2)} TND</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Tax (10%)</span>
              <span className="text-gray-900">{tax.toFixed(2)} TND</span>
            </div>
            <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-200">
              <span className="text-gray-900">Total</span>
              <span className="text-green-600">{total.toFixed(2)} TND</span>
            </div>
          </div>

          <button
            onClick={onCheckout}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-4 rounded-lg transition-colors"
          >
            Proceed to Checkout
          </button>
        </div>
      </div>
    </div>
  );
}
