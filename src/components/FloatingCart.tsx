import { ShoppingCart } from 'lucide-react';

interface FloatingCartProps {
  itemCount: number;
  onClick: () => void;
}

export default function FloatingCart({ itemCount, onClick }: FloatingCartProps) {
  if (itemCount === 0) return null;

  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-6 bg-green-600 hover:bg-green-700 text-white rounded-full p-4 shadow-lg transition-all z-50"
    >
      <ShoppingCart className="w-6 h-6" />
      <span className="absolute -top-2 -right-2 bg-gray-800 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
        {itemCount}
      </span>
    </button>
  );
}
