import { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'en' | 'fr';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: any;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Import the existing French translations
import { fr as frTranslations } from '../translations/fr';

export const translations = {
  en: {
    // Common
    common: {
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      edit: 'Edit',
      view: 'View',
      search: 'Search',
      filter: 'Filter',
      loading: 'Loading...',
      noData: 'No data available',
      confirm: 'Confirm',
      yes: 'Yes',
      no: 'No',
      close: 'Close',
      back: 'Back',
      next: 'Next',
      submit: 'Submit',
      total: 'Total',
      subtotal: 'Subtotal',
      quantity: 'Quantity',
      price: 'Price',
      status: 'Status',
      date: 'Date',
      actions: 'Actions',
    },
    // Navigation
    nav: {
      home: 'Home',
      shop: 'Shop',
      categories: 'Categories',
      cart: 'Cart',
      account: 'My Account',
      orders: 'My Orders',
      quotations: 'My Quotations',
      invoices: 'My Invoices',
      wishlist: 'Wishlist',
      logout: 'Logout',
      login: 'Login',
      settings: 'Settings',
    },
    // Header
    header: {
      title: 'SMD Hardware Store',
      subtitle: 'Your DIY Partner',
      search: 'Search products...',
      cart: 'Cart',
      account: 'Account',
    },
    // Home
    home: {
      searchPlaceholder: 'Search tools, materials, or brands…',
      featuredCategories: 'Featured Categories',
      featuredProducts: 'Featured Products',
      viewAllCategories: 'View All Categories',
      whyChooseUs: 'Why Choose Us?',
      qualityProducts: 'Quality Products',
      qualityProductsDesc: 'We offer only the best quality products from trusted brands',
      highRatings: 'High Ratings',
      highRatingsDesc: 'Rated 4.8/5 by thousands of satisfied customers',
      freeDelivery: 'Free Delivery',
      freeDeliveryDesc: 'Free shipping on orders over 200 TND',
      goodSupport: 'Good Support',
      goodSupportDesc: '24/7 customer support ready to help you',
      searchResults: 'Search Results',
    },
    // Login
    login: {
      title: 'Customer Login',
      subtitle: 'Sign in to your account',
      email: 'Email or Username',
      password: 'Password',
      forgotPassword: 'Forgot your password?',
      signIn: 'Sign in',
      newCustomer: 'New customer?',
      createAccount: 'Create an account',
      loggingIn: 'Logging in...',
      errors: {
        required: 'This field is required',
        invalid: 'Invalid credentials',
        network: 'Network error. Please try again.',
      },
    },
    // Cart/Basket
    cart: {
      title: 'Your Cart',
      empty: 'Your basket is empty',
      emptyMessage: 'Start shopping to add items to your cart',
      startShopping: 'Start Shopping',
      subtotal: 'Subtotal',
      tax: 'Tax',
      deliveryFee: 'Delivery Fee',
      total: 'Total',
      checkout: 'Proceed to Checkout',
      remove: 'Remove',
      updateQuantity: 'Update Quantity',
    },
    // Checkout
    checkout: {
      title: 'Checkout',
      backToCart: 'Back to Cart',
      customerInfo: 'Customer Information',
      shippingAddress: 'Shipping Address',
      paymentMethod: 'Payment Method',
      paymentConditions: 'Payment Conditions',
      paymentTerms: 'Payment Terms',
      orderSummary: 'Order Summary',
      quotationSummary: 'Quotation Summary',
      placeOrder: 'Place Order',
      submitQuotation: 'Submit Quotation',
      processing: 'Processing...',
      assignedPaymentConditions: 'Assigned Payment Conditions',
      paymentMethodLabel: 'Payment Method',
      paymentTermsLabel: 'Payment Terms',
      creditLimit: 'Credit Limit',
      currentOutstanding: 'Current Outstanding',
      accountStatus: 'Account Status',
      quotationRequiresApproval: 'Your quotation will require administrator approval before processing.',
      creditLimitExceeded: 'Credit Limit Exceeded',
      creditLimitExceededMessage: 'This quotation will exceed your credit limit. Administrator approval is required.',
      newOutstanding: 'New Outstanding',
      limit: 'Limit',
      cashOnDelivery: 'Cash on Delivery',
      cashOnDeliveryDesc: 'Pay when you receive your order',
      cardPayment: 'Card Payment',
      cardPaymentDesc: 'Pay with your credit/debit card',
      errors: {
        emptyCart: 'Your cart is empty',
        fillRequired: 'Please fill in all required fields',
        accountSuspended: 'Your account is suspended',
        creditLimit: 'Insufficient credit limit',
      },
    },
    // Account
    account: {
      title: 'My Account',
      welcome: 'Welcome back',
      profile: 'My Profile',
      orders: 'My Orders',
      quotations: 'My Quotations',
      invoices: 'My Invoices',
      wishlist: 'Wishlist',
      addresses: 'Addresses',
      settings: 'Settings',
      logout: 'Logout',
      editProfile: 'Edit Profile',
      personalInfo: 'Personal Information',
      businessInfo: 'Business Information',
      financialInfo: 'Financial Information',
      fullName: 'Full Name',
      email: 'Email',
      phone: 'Phone',
      username: 'Username',
      companyName: 'Company Name',
      customerType: 'Customer Type',
      creditLimit: 'Credit Limit',
      outstandingBalance: 'Outstanding Balance',
      availableCredit: 'Available Credit',
      paymentTerms: 'Payment Terms',
      accountStatus: 'Account Status',
      viewQuotations: 'View My Quotations',
      viewInvoices: 'View My Invoices',
      noOrders: 'No orders yet',
      noQuotations: 'No quotations yet',
      quotationsMessage: 'Submit quotations to see them here',
      noInvoices: 'No invoices yet',
      invoicesMessage: 'Your invoices will appear here once orders are shipped',
      startShopping: 'Start Shopping',
      noOrdersMessage: 'Start shopping to see your orders here',
      wishlistEmpty: 'Your wishlist is empty',
      wishlistMessage: 'Save items you love for later',
      noAddresses: 'No saved addresses',
      addressesMessage: 'Add an address for faster checkout',
      addAddress: 'Add New Address',
      savedAddresses: 'Saved Addresses',
    },
    // Quotations
    quotations: {
      title: 'My Quotations',
      subtitle: 'View and track your quotation requests',
      noQuotations: 'No Quotations Yet',
      noQuotationsMessage: 'You haven\'t submitted any quotations. Start shopping to create your first quotation!',
      startShopping: 'Start Shopping',
      quotationNumber: 'Quotation Number',
      items: 'Items',
      totalAmount: 'Total Amount',
      viewDetails: 'View Details',
      status: 'Status',
      financialSummary: 'Financial Summary',
      creditLimit: 'Credit Limit',
      outstanding: 'Outstanding',
      availableCredit: 'Available Credit',
      accountStatus: 'Account Status',
      loading: 'Loading quotations...',
      error: 'Error Loading Quotations',
      tryAgain: 'Try Again',
      statuses: {
        pending: 'Pending Approval',
        approved: 'Approved',
        declined: 'Declined',
      },
      details: {
        items: 'Items',
        quantity: 'Quantity',
        each: 'each',
        subtotal: 'Subtotal',
        tax: 'Tax (19%)',
        total: 'Total',
        notes: 'Notes',
        close: 'Close',
      },
    },
    // Invoices
    invoices: {
      title: 'My Invoices',
      subtitle: 'View and manage your invoices',
      noInvoices: 'No Invoices Yet',
      noInvoicesMessage: 'You don\'t have any invoices yet',
      invoiceNumber: 'Invoice Number',
      issuedDate: 'Issued Date',
      dueDate: 'Due Date',
      amount: 'Amount',
      status: 'Status',
      viewDetails: 'View Details',
      loading: 'Loading invoices...',
      error: 'Error Loading Invoices',
      tryAgain: 'Try Again',
      statuses: {
        issued: 'Issued',
        paid: 'Paid',
        overdue: 'Overdue',
        cancelled: 'Cancelled',
      },
      details: {
        invoiceDetails: 'Invoice Details',
        orderNumber: 'Order Number',
        issuedDate: 'Issued Date',
        dueDate: 'Due Date',
        paymentTerms: 'Payment Terms',
        items: 'Items',
        quantity: 'Quantity',
        unitPrice: 'Unit Price',
        total: 'Total',
        subtotal: 'Subtotal',
        tax: 'Tax',
        grandTotal: 'Grand Total',
        overdue: 'This invoice is overdue',
        paymentReceived: 'Payment Received',
        paidOn: 'Paid on',
        close: 'Close',
      },
    },
    // Order Confirmation
    orderConfirmation: {
      confirmed: 'Order Confirmed!',
      received: 'Order Received!',
      thankYou: 'Thank you for your order. We\'ve received it and will process it shortly.',
      manualEntry: 'Your order has been received and is ready for manual processing in WooCommerce.',
      orderNumber: 'Order Number',
      status: 'Status',
      total: 'Total',
      payment: 'Payment',
      manualRequired: 'Manual Entry Required',
      manualMessage: 'Due to API permissions, this order needs to be manually created in WooCommerce admin.',
      customer: 'Customer',
      email: 'Email',
      phone: 'Phone',
      items: 'Items',
      products: 'product(s)',
      nextSteps: 'Next Steps',
      step1: 'Go to WooCommerce admin panel',
      step2: 'Navigate to Orders → Add New',
      step3: 'Copy the customer details above',
      step4: 'Add the products from the order',
      step5: 'Set payment method',
      detailsLogged: 'Order details have been logged to the browser console for reference.',
      emailConfirmation: 'You\'ll receive an email confirmation shortly with order details and tracking information.',
      backToHome: 'Back to Home',
    },
    // Language Settings
    language: {
      title: 'Language',
      select: 'Select Language',
      english: 'English',
      french: 'Français',
      change: 'Change Language',
    },
  },
  fr: frTranslations, // Use existing French translations
};

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('customerLanguage');
    return (saved as Language) || 'fr'; // Default to French
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('customerLanguage', lang);
  };

  const value = {
    language,
    setLanguage,
    t: translations[language],
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
