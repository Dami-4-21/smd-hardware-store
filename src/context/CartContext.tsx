import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Product } from '../types/api';

export interface CartItem {
  product: Product;
  quantity: number;
  selectedSize?: {
    id: string;
    size: string;
    price: number;
    unitType: string;
  };
  selectedPack?: {
    id: string;
    packType: string;
    price: number;
    packQuantity: number;
  };
  // Unique key for cart item (productId + sizeId or packId)
  cartItemKey: string;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: Product, selectedSize?: any, selectedPack?: any) => void;
  removeFromCart: (cartItemKey: string) => void;
  updateQuantity: (cartItemKey: string, quantity: number) => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
  getCartQuantity: (productId: string) => number;
  clearCart: () => void;
  isLoading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'hardware-store-cart';

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem(CART_STORAGE_KEY);
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart);
        setCartItems(parsedCart);
      }
    } catch (error) {
      console.error('Error loading cart from localStorage:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (!isLoading) {
      try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
      } catch (error) {
        console.error('Error saving cart to localStorage:', error);
      }
    }
  }, [cartItems, isLoading]);

  const addToCart = (product: Product, selectedSize?: any, selectedPack?: any) => {
    // Generate unique cart item key
    const cartItemKey = selectedSize 
      ? `${product.id}-size-${selectedSize.id}`
      : selectedPack
      ? `${product.id}-pack-${selectedPack.id}`
      : product.id;

    // Determine stock and price based on selection
    const stock = selectedSize?.stock || selectedPack?.stock || product.stockQuantity || product.stock || 0;
    const price = selectedSize?.price || selectedPack?.price || product.basePrice || product.price || 0;

    // Check if product is in stock
    if (stock <= 0) {
      console.warn('Cannot add out of stock product to cart');
      return;
    }

    setCartItems((prev) => {
      const existingItem = prev.find((item) => item.cartItemKey === cartItemKey);

      if (existingItem) {
        const newQuantity = Math.min(existingItem.quantity + 1, stock);
        if (newQuantity === existingItem.quantity) {
          console.warn('Cannot add more items than available stock');
          return prev;
        }

        return prev.map((item) =>
          item.cartItemKey === cartItemKey
            ? { ...item, quantity: newQuantity }
            : item
        );
      }

      // Create new cart item with selected variation
      const newItem: CartItem = {
        product: {
          ...product,
          basePrice: price,
          price: price,
          stock: stock,
          stockQuantity: stock
        },
        quantity: 1,
        cartItemKey,
        selectedSize: selectedSize ? {
          id: selectedSize.id,
          size: selectedSize.label || selectedSize.size,
          price: selectedSize.price,
          unitType: selectedSize.unitType || 'piece'
        } : undefined,
        selectedPack: selectedPack ? {
          id: selectedPack.id,
          packType: selectedPack.label || selectedPack.packType,
          price: selectedPack.price,
          packQuantity: selectedPack.packQuantity || 1
        } : undefined
      };

      return [...prev, newItem];
    });
  };

  const removeFromCart = (cartItemKey: string) => {
    setCartItems((prev) => prev.filter((item) => item.cartItemKey !== cartItemKey));
  };

  const updateQuantity = (cartItemKey: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(cartItemKey);
      return;
    }

    setCartItems((prev) => {
      const item = prev.find((item) => item.cartItemKey === cartItemKey);
      if (!item) return prev;

      const stock = item.product.stockQuantity || item.product.stock || 0;
      const newQuantity = Math.min(quantity, stock);
      if (newQuantity === item.quantity) return prev;

      return prev.map((item) =>
        item.cartItemKey === cartItemKey
          ? { ...item, quantity: newQuantity }
          : item
      );
    });
  };

  const getTotalItems = () => {
    return cartItems.reduce((sum, item) => sum + item.quantity, 0);
  };

  const getCartQuantity = (productId: string) => {
    const item = cartItems.find((item) => item.product.id === productId);
    return item ? item.quantity : 0;
  };

  const getTotalPrice = () => {
    return cartItems.reduce((sum, item) => {
      const price = Number(item.product.basePrice || item.product.price || 0);
      return sum + (price * item.quantity);
    }, 0);
  };

  const clearCart = () => {
    setCartItems([]);
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        getTotalItems,
        getTotalPrice,
        getCartQuantity,
        clearCart,
        isLoading
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
