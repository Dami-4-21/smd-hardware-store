import { useState, useEffect } from 'react';
import { MapPin, CreditCard, Truck, FileText, Check, AlertCircle, ArrowLeft, Building2, Minus, Plus, Trash2, User } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { formatPrice } from '../utils/currency';
import { useAuth } from '../context/AuthContext';
import { API } from '../services/api';
import { quotationService } from '../services/quotationService';
import { CartItem } from '../context/CartContext';

interface CheckoutScreenProps {
  cartItems: CartItem[];
  onBack: () => void;
  onOrderComplete: (orderData: any) => void;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
}

export default function CheckoutScreen({
  cartItems,
  onBack,
  onOrderComplete,
  onUpdateQuantity,
  onRemoveItem
}: CheckoutScreenProps) {
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoadingUser, setIsLoadingUser] = useState(true);

  // Helper function to format payment method display
  const formatPaymentMethod = (method: string | undefined) => {
    if (!method) return language === 'fr' ? 'Non attribué' : 'Not assigned';
    
    const paymentMethodLabels: Record<string, { en: string; fr: string }> = {
      'COD': { en: 'Cash on Delivery', fr: 'Paiement à la Livraison' },
      'CHEQUE': { en: 'Cheque on Delivery', fr: 'Chèque à la Livraison' },
      'NET_TERMS': { en: 'Payment on Due Date', fr: 'Paiement à Échéance' },
      'CASH_ON_DELIVERY': { en: 'Cash on Delivery', fr: 'Paiement à la Livraison' },
      'CHEQUE_ON_DELIVERY': { en: 'Cheque on Delivery', fr: 'Chèque à la Livraison' },
    };
    
    return paymentMethodLabels[method]?.[language] || method;
  };

  // Helper function to format payment terms
  const formatPaymentTerms = (terms: string | undefined) => {
    if (!terms) return language === 'fr' ? 'Non attribué' : 'Not assigned';
    
    const termsLabels: Record<string, { en: string; fr: string }> = {
      'NET_30': { en: 'NET 30 (30 days)', fr: 'NET 30 (30 jours)' },
      'NET_60': { en: 'NET 60 (60 days)', fr: 'NET 60 (60 jours)' },
      'NET_90': { en: 'NET 90 (90 days)', fr: 'NET 90 (90 jours)' },
      'NET_120': { en: 'NET 120 (120 days)', fr: 'NET 120 (120 jours)' },
    };
    
    return termsLabels[terms]?.[language] || terms;
  };

  // Load user data on mount
  useEffect(() => {
    if (user) {
      setIsLoadingUser(false);
    }
  }, [user]);

  const subtotal = cartItems.reduce((sum, item) => sum + (item.product.basePrice || item.product.price || 0) * item.quantity, 0);
  const tax = subtotal * 0.19; // 19% tax rate
  const deliveryFee = 0; // No delivery fee for B2B
  const total = subtotal + tax + deliveryFee;

  // Check if user is B2B customer (professional account types)
  const B2B_CUSTOMER_TYPES = ['Retailer', 'Wholesaler', 'Contractor', 'B2B'];
  const isB2BCustomer = user?.customerType && B2B_CUSTOMER_TYPES.includes(user.customerType);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      alert('Please login to place an order');
      return;
    }

    // Validate cart is not empty
    if (!cartItems || cartItems.length === 0) {
      alert('Your cart is empty. Please add items before placing an order.');
      onBack();
      return;
    }

    setIsProcessing(true);

    try {
      // B2B customers submit quotations
      if (isB2BCustomer) {
        const quotationData = {
          items: cartItems.map(item => ({
            productId: item.product.id,
            quantity: item.quantity,
          })),
          notes: ''
        };

        const result = await quotationService.create(quotationData);

        if (result) {
          // Quotation created successfully
          onOrderComplete({
            id: result.id,
            orderNumber: result.quotationNumber,
            isQuotation: true,
            customer: {
              name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email,
              email: user.email,
              phone: user.phone || 'N/A',
              company: user.companyName
            },
            items: cartItems,
            totals: {
              subtotal,
              tax,
              delivery: deliveryFee,
              total
            },
            paymentMethod: user.paymentMethod || 'NET_TERMS',
            status: result.status || 'PENDING_APPROVAL'
          });
        } else {
          throw new Error('Failed to create quotation');
        }
      } else {
        // Regular customers place orders directly
        console.log('Cart Items:', JSON.stringify(cartItems, null, 2));
        console.log('Cart Items Length:', cartItems.length);
        
        const orderData = {
          items: cartItems.map(item => ({
            productId: item.product.id,
            quantity: item.quantity,
            price: item.product.basePrice || item.product.price || 0
          })),
          paymentMethod: paymentMethod === 'cash' ? 'CASH_ON_DELIVERY' : 'CREDIT_CARD',
          notes: ''
        };

        console.log('Order Data:', JSON.stringify(orderData, null, 2));
        console.log('Order Items:', JSON.stringify(orderData.items, null, 2));
        console.log('Order Items Length:', orderData.items.length);

        const result = await API.createOrder(orderData);

        if (result) {
          // Order created successfully
          onOrderComplete({
            id: result.id,
            orderNumber: result.orderNumber,
            isQuotation: false,
            customer: {
              name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email,
              email: user.email,
              phone: user.phone || 'N/A',
              company: user.companyName
            },
            items: cartItems,
            totals: {
              subtotal,
              tax,
              delivery: deliveryFee,
              total
            },
            paymentMethod: paymentMethod === 'cash' ? 'Cash on Delivery' : 'Card Payment',
            status: result.status || 'PENDING'
          });
        } else {
          throw new Error('Failed to create order');
        }
      }
    } catch (error: any) {
      console.error(isB2BCustomer ? 'Quotation creation failed:' : 'Order creation failed:', error);
      alert(error.message || `Échec de ${isB2BCustomer ? 'la soumission du devis' : 'traitement de la commande'}. Veuillez réessayer.`);
    } finally {
      setIsProcessing(false);
    }
  };

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
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Aucun article à commander</h2>
        <p className="text-gray-500 text-center mb-4">Ajoutez d'abord des produits à votre panier!</p>
        <button
          onClick={onBack}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
        >
          Retour aux achats
        </button>
      </div>
    );
  }

  return (
    <div className="pb-40">
      <div className="px-4 py-4">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-semibold text-gray-900">Finaliser la commande</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Customer Information - Display Only */}
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center gap-2 mb-4">
              <User className="w-5 h-5 text-gray-600" />
              <h2 className="text-lg font-semibold">Informations client</h2>
            </div>

            {isLoadingUser ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-600 mt-2">Chargement de vos informations...</p>
              </div>
            ) : user ? (
              <div className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      Nom complet
                    </label>
                    <p className="text-gray-900 font-medium">
                      {user.firstName} {user.lastName}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      Email
                    </label>
                    <p className="text-gray-900">{user.email}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      Téléphone
                    </label>
                    <p className="text-gray-900">{user.phone || 'Non fourni'}</p>
                  </div>

                  {user.companyName && (
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">
                        Entreprise
                      </label>
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-gray-400" />
                        <p className="text-gray-900">{user.companyName}</p>
                      </div>
                    </div>
                  )}

                  {user.customerType && (
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">
                        Type de client
                      </label>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {user.customerType}
                      </span>
                    </div>
                  )}
                </div>

                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    ✓ Vos informations de compte seront utilisées pour cette commande
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-red-600">Veuillez vous connecter pour continuer</p>
              </div>
            )}
          </div>

          {/* Shipping Address Note */}
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center gap-2 mb-4">
              <Truck className="w-5 h-5 text-gray-600" />
              <h2 className="text-lg font-semibold">Adresse de livraison</h2>
            </div>
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
              <p className="text-sm text-gray-700">
                Votre adresse de livraison par défaut sera utilisée pour cette commande.
                <br />
                <span className="text-gray-600">Vous pouvez gérer vos adresses dans les paramètres de votre compte.</span>
              </p>
            </div>
          </div>

          {/* Payment Method */}
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center gap-2 mb-4">
              {isB2BCustomer ? (
                <FileText className="w-5 h-5 text-gray-600" />
              ) : (
                <CreditCard className="w-5 h-5 text-gray-600" />
              )}
              <h2 className="text-lg font-semibold">
                {isB2BCustomer ? t.checkout.paymentConditions : t.checkout.paymentMethod}
              </h2>
            </div>

            {isB2BCustomer ? (
              // B2B Customer - Show assigned payment terms (read-only)
              <div className="space-y-3">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <FileText className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 mb-2">{t.checkout.assignedPaymentConditions}</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">{t.checkout.paymentMethodLabel}:</span>
                          <span className="font-medium text-gray-900">
                            {formatPaymentMethod(user.paymentMethod)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">{t.checkout.paymentTermsLabel}:</span>
                          <span className="font-medium text-gray-900">
                            {formatPaymentTerms(user.paymentTerms)}
                          </span>
                        </div>
                        {user.financialLimit && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">{t.checkout.creditLimit}:</span>
                            <span className="font-medium text-gray-900">
                              {formatPrice(user.financialLimit)}
                            </span>
                          </div>
                        )}
                        {user.outstandingBalance !== undefined && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">{t.checkout.currentOutstanding}:</span>
                            <span className="font-medium text-gray-900">
                              {formatPrice(user.outstandingBalance)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Account Status Warning */}
                {user.accountStatus && user.accountStatus !== 'ACTIVE' && (
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-yellow-900 mb-1">{t.checkout.accountStatus}: {user.accountStatus}</h4>
                      <p className="text-sm text-yellow-800">
                        {t.checkout.quotationRequiresApproval}
                      </p>
                    </div>
                  </div>
                )}

                {/* Credit Limit Warning */}
                {user.financialLimit && user.outstandingBalance !== undefined && 
                 (user.outstandingBalance + total) > user.financialLimit && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-red-900 mb-1">{t.checkout.creditLimitExceeded}</h4>
                      <p className="text-sm text-red-800">
                        {t.checkout.creditLimitExceededMessage}
                      </p>
                      <p className="text-xs text-red-700 mt-1">
                        {t.checkout.newOutstanding}: {formatPrice(user.outstandingBalance + total)} / 
                        {t.checkout.limit}: {formatPrice(user.financialLimit)}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              // Regular Customer - Show payment method selection
              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="cash"
                    checked={paymentMethod === 'cash'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mr-3"
                  />
                  <div className="flex-1">
                    <div className="font-medium">{t.checkout.cashOnDelivery}</div>
                    <div className="text-sm text-gray-500">{t.checkout.cashOnDeliveryDesc}</div>
                  </div>
                </label>

                <label className="flex items-center">
                  <input
                    type="radio"
                    value="card"
                    checked={paymentMethod === 'card'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mr-3"
                  />
                  <div className="flex-1">
                    <div className="font-medium">{t.checkout.cardPayment}</div>
                    <div className="text-sm text-gray-500">{t.checkout.cardPaymentDesc}</div>
                  </div>
                </label>
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center gap-2 mb-4">
              {isB2BCustomer ? (
                <FileText className="w-5 h-5 text-gray-600" />
              ) : (
                <Truck className="w-5 h-5 text-gray-600" />
              )}
              <h2 className="text-lg font-semibold">
                {isB2BCustomer ? 'Récapitulatif du devis' : 'Récapitulatif de la commande'}
              </h2>
            </div>

            <div className="space-y-3 mb-4">
              {cartItems.map((item) => (
                <div key={item.product.id} className="border border-gray-200 rounded-lg p-3">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{item.product.name}</p>
                      <p className="text-sm text-gray-500 mt-1">
                        {formatPrice(item.product.basePrice || item.product.price || 0)} × {item.quantity}
                      </p>
                    </div>
                    <p className="font-semibold text-lg">{formatPrice((item.product.basePrice || item.product.price || 0) * item.quantity)}</p>
                  </div>
                  
                  {/* Quantity Controls */}
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-gray-600">Quantité:</span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => onUpdateQuantity(item.product.id, Math.max(1, item.quantity - 1))}
                          className="p-1 rounded-lg border border-gray-300 hover:bg-gray-100 transition-colors"
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="w-4 h-4 text-gray-600" />
                        </button>
                        <span className="w-12 text-center font-medium">{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                          className="p-1 rounded-lg border border-gray-300 hover:bg-gray-100 transition-colors"
                        >
                          <Plus className="w-4 h-4 text-gray-600" />
                        </button>
                      </div>
                    </div>
                    
                    {/* Remove Button */}
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`Retirer "${item.product.name}" du panier?`)) {
                          onRemoveItem(item.product.id);
                        }
                      }}
                      className="flex items-center gap-1 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      Retirer
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between">
                <span>Sous-total</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>TVA (10%)</span>
                <span>{formatPrice(tax)}</span>
              </div>
              <div className="flex justify-between">
                <span>Frais de livraison</span>
                <span>{deliveryFee === 0 ? 'Gratuit' : formatPrice(deliveryFee)}</span>
              </div>
              <div className="flex justify-between font-bold text-lg pt-2 border-t">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
            <button
              type="submit"
              disabled={isProcessing}
              className={`w-full ${
                isB2BCustomer 
                  ? 'bg-indigo-600 hover:bg-indigo-700' 
                  : 'bg-green-600 hover:bg-green-700'
              } disabled:bg-gray-400 text-white font-semibold py-4 rounded-lg transition-colors`}
            >
              {isProcessing ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  {isB2BCustomer ? 'Soumission du devis...' : 'Traitement de la commande...'}
                </div>
              ) : (
                <>
                  {isB2BCustomer ? (
                    <div className="flex items-center justify-center gap-2">
                      <FileText className="w-5 h-5" />
                      Soumettre le devis - {formatPrice(total)}
                    </div>
                  ) : (
                    `Passer la commande - ${formatPrice(total)}`
                  )}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
