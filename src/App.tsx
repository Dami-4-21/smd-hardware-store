import React, { useState, useEffect, useMemo } from 'react';
import { CartProvider, useCart } from './context/CartContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import HomeScreen from './screens/HomeScreen';
import ProductListScreen from './screens/ProductListScreen';
import BasketScreen from './screens/BasketScreen';
import SubcategoryScreen from './screens/SubcategoryScreen';
import ProductDetailScreen from './screens/ProductDetailScreen';
import CheckoutScreen from './screens/CheckoutScreen';
import OrderConfirmationScreen from './screens/OrderConfirmationScreen';
import LoginScreen from './screens/LoginScreen';
import AccountScreen from './screens/AccountScreen';
import { API } from './services/api';
import { Category } from './types/api';

type Screen = 'home' | 'category' | 'subcategory' | 'product' | 'basket' | 'checkout' | 'confirmation' | 'login' | 'account';

interface AppState {
  screen: Screen;
  selectedCategoryId?: string;
  selectedSubcategoryId?: string;
  selectedProductId?: string;
  currentCategory?: Category;
  parentCategory?: Category;
}

function AppContent() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [appState, setAppState] = useState<AppState>({ screen: 'login' });
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [productSearchQuery, setProductSearchQuery] = useState('');
  const [subcategorySearchQuery, setSubcategorySearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [orderData, setOrderData] = useState<any>(null);
  const { cartItems, addToCart, removeFromCart, updateQuantity, getTotalItems, isLoading: cartLoading } = useCart();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  // Handle order completion
  const handleOrderComplete = (order: any) => {
    setOrderData(order);
    setAppState(prev => ({ ...prev, screen: 'confirmation' }));
  };

  // Redirect to login if not authenticated (except on login/account screens)
  useEffect(() => {
    if (!authLoading && !isAuthenticated && appState.screen !== 'login') {
      setAppState({ screen: 'login' });
    }
  }, [isAuthenticated, authLoading, appState.screen]);

  // Load categories on component mount
  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoading(true);
        // Load all categories (including subcategories) for search functionality
        const allCategories = await API.getAllCategories();
        setCategories(allCategories);
      } catch (err) {
        setError('Failed to load categories');
        console.error('Error loading categories:', err);
      } finally {
        setLoading(false);
      }
    };

    loadCategories();
  }, []);

  // Filter categories based on search query - only show parent categories on home
  const filteredCategories = useMemo(() => {
    // Filter to only parent categories (no parent)
    const parentCategories = categories.filter(cat => !cat.parent || cat.parent === 0);
    
    if (!searchQuery.trim()) return parentCategories;

    const query = searchQuery.toLowerCase();
    return parentCategories.filter(category =>
      category.name.toLowerCase().includes(query) ||
      category.description?.toLowerCase().includes(query)
    );
  }, [categories, searchQuery]);

  // Enhanced category navigation with sub-category checking
  const navigateToCategory = async (categoryId: string) => {
    try {
      const category = categories.find(c => c.id === categoryId);
      if (!category) return;

      // Check if category has subcategories (use the subcategories array from the category object)
      const hasSubcategories = category.subcategories && category.subcategories.length > 0;

      if (hasSubcategories) {
        // Navigate to subcategories screen
        setAppState({
          screen: 'subcategory',
          selectedCategoryId: categoryId,
          currentCategory: category
        });
      } else {
        // Navigate directly to products
        setAppState({
          screen: 'category',
          selectedCategoryId: categoryId,
          currentCategory: category
        });
      }
    } catch (err) {
      console.error('Error checking subcategories:', err);
      // Fallback to direct product navigation
      setAppState({
        screen: 'category',
        selectedCategoryId: categoryId,
        currentCategory: categories.find(c => c.id === categoryId)
      });
    }
  };

  // Navigate from subcategory to products
  const navigateToProducts = (subcategory: Category) => {
    setAppState({
      screen: 'category',
      selectedCategoryId: subcategory.id,
      selectedSubcategoryId: subcategory.id,
      currentCategory: subcategory,
      parentCategory: appState.currentCategory
    });
  };

  const navigateToProduct = (productId: string) => {
    setAppState(prev => ({ ...prev, screen: 'product', selectedProductId: productId }));
  };

  const navigateToCheckout = () => {
    setAppState(prev => ({ ...prev, screen: 'checkout' }));
  };

  const navigateToBasket = () => {
    setAppState(prev => ({ ...prev, screen: 'basket' }));
  };

  const navigateToHome = () => {
    setAppState({ screen: 'home' });
  };

  const navigateToLogin = () => {
    setAppState({ screen: 'login' });
  };

  const navigateToAccount = () => {
    if (isAuthenticated) {
      setAppState(prev => ({ ...prev, screen: 'account' }));
    } else {
      navigateToLogin();
    }
  };

  const handleLoginSuccess = () => {
    // After successful login, navigate to home
    setAppState({ screen: 'home' });
  };

  // Enhanced back navigation with breadcrumb support
  const handleBack = () => {
    if (appState.screen === 'product') {
      // Go back to category/subcategory screen
      if (appState.selectedSubcategoryId) {
        // We came from a subcategory, go back to subcategory screen
        setAppState(prev => ({
          ...prev,
          screen: 'subcategory',
          selectedProductId: undefined,
          currentCategory: prev.parentCategory
        }));
      } else if (appState.currentCategory) {
        // Check if current category has a parent (is subcategory)
        if (appState.parentCategory) {
          // Go back to parent category's subcategories
          setAppState({
            screen: 'subcategory',
            selectedCategoryId: appState.parentCategory.id,
            currentCategory: appState.parentCategory,
            selectedProductId: undefined,
            parentCategory: undefined,
            selectedSubcategoryId: undefined
          });
        } else {
          // Check if current category has subcategories (go back to subcategories)
          const hasSubcats = appState.currentCategory.subcategories && appState.currentCategory.subcategories.length > 0;
          if (hasSubcats) {
            setAppState(prev => ({
              ...prev,
              screen: 'subcategory',
              selectedProductId: undefined
            }));
          } else {
            navigateToHome();
          }
        }
      } else {
        navigateToHome();
      }
    } else if (appState.screen === 'category') {
      if (appState.parentCategory) {
        // We came from a subcategory, go back to subcategory screen
        setAppState({
          screen: 'subcategory',
          selectedCategoryId: appState.parentCategory.id,
          currentCategory: appState.parentCategory,
          selectedProductId: undefined,
          parentCategory: undefined,
          selectedSubcategoryId: undefined
        });
      } else {
        // Check if current category has subcategories
        if (appState.currentCategory) {
          const hasSubcats = appState.currentCategory.subcategories && appState.currentCategory.subcategories.length > 0;
          if (hasSubcats) {
            setAppState(prev => ({
              ...prev,
              screen: 'subcategory',
              selectedCategoryId: appState.currentCategory?.id,
              currentCategory: appState.currentCategory
            }));
          } else {
            navigateToHome();
          }
        } else {
          navigateToHome();
        }
      }
    } else if (appState.screen === 'subcategory') {
      navigateToHome();
    } else if (appState.screen === 'basket') {
      navigateToHome();
    } else if (appState.screen === 'checkout') {
      // Go back to basket from checkout
      setAppState(prev => ({ ...prev, screen: 'basket' }));
    } else if (appState.screen === 'confirmation') {
      // Go back to home from confirmation
      setAppState({ screen: 'home' });
    } else if (appState.screen === 'login') {
      // Cannot go back from login screen (it's the entry point)
      return;
    } else if (appState.screen === 'account') {
      navigateToHome();
    }
  };

  const getHeaderTitle = () => {
    if (appState.screen === 'basket') return 'Shopping Basket';
    if (appState.screen === 'checkout') return 'Checkout';
    if (appState.screen === 'confirmation') return 'Order Confirmed';
    if (appState.screen === 'login') return 'Customer Login';
    if (appState.screen === 'account') return 'My Account';

    if (appState.screen === 'subcategory' && appState.currentCategory) {
      return `${appState.currentCategory.name} - Subcategories`;
    }

    if (appState.screen === 'category' && appState.currentCategory) {
      if (appState.parentCategory) {
        return `${appState.parentCategory.name} > ${appState.currentCategory.name}`;
      }
      return appState.currentCategory.name;
    }

    if (appState.screen === 'product' && appState.selectedProductId) {
      // This would need to be fetched from API in a real implementation
      return 'Product Details';
    }

    return 'Hardware Store';
  };

  // Show loading screen while checking authentication or loading categories
  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center">
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
    <div className="min-h-screen bg-gray-50">
      {/* Hide header on login screen */}
      {appState.screen !== 'login' && (
        <Header
          title={getHeaderTitle()}
          showBack={appState.screen !== 'home'}
          onBackClick={handleBack}
          onMenuClick={() => setSidebarOpen(true)}
          cartItemCount={getTotalItems()}
          onCartClick={navigateToBasket}
          onAccountClick={navigateToAccount}
          isAuthenticated={isAuthenticated}
        />
      )}

      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className={appState.screen === 'login' ? '' : 'max-w-2xl mx-auto'}>
        {appState.screen === 'home' && (
          <HomeScreen
            categories={filteredCategories}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onCategoryClick={navigateToCategory}
          />
        )}

        {appState.screen === 'subcategory' && appState.currentCategory && (
          <SubcategoryScreen
            parentCategory={appState.currentCategory}
            onSubcategoryClick={navigateToProducts}
            onProductClick={navigateToProduct}
            onAddToCart={addToCart}
            searchQuery={subcategorySearchQuery}
            onSearchChange={setSubcategorySearchQuery}
          />
        )}

        {appState.screen === 'category' && appState.selectedCategoryId && (
          <ProductListScreen
            categoryId={appState.selectedCategoryId}
            searchQuery={productSearchQuery}
            onProductClick={navigateToProduct}
            onAddToCart={addToCart}
            onSearchChange={setProductSearchQuery}
          />
        )}

        {appState.screen === 'product' && appState.selectedProductId && (
          <ProductDetailScreen
            productId={appState.selectedProductId}
            onAddToCart={addToCart}
          />
        )}

        {appState.screen === 'basket' && (
          <BasketScreen
            cartItems={cartItems}
            onUpdateQuantity={updateQuantity}
            onRemoveItem={removeFromCart}
            isLoading={cartLoading}
            onCheckout={navigateToCheckout}
          />
        )}

        {appState.screen === 'checkout' && (
          <CheckoutScreen
            cartItems={cartItems}
            onBack={() => setAppState(prev => ({ ...prev, screen: 'basket' }))}
            onOrderComplete={handleOrderComplete}
          />
        )}

        {appState.screen === 'confirmation' && orderData && (
          <OrderConfirmationScreen
            order={orderData}
            onBackToHome={() => setAppState({ screen: 'home' })}
          />
        )}

        {appState.screen === 'login' && (
          <LoginScreen
            onLoginSuccess={handleLoginSuccess}
          />
        )}

        {appState.screen === 'account' && (
          <AccountScreen
            onLogout={navigateToLogin}
            onNavigateToShop={navigateToHome}
          />
        )}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <AppContent />
      </CartProvider>
    </AuthProvider>
  );
}
