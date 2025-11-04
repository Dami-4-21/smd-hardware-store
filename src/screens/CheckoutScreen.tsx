import { useState, useEffect } from 'react';
import { CreditCard, Truck, User, Building2, ArrowLeft } from 'lucide-react';
import { CartItem } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { API } from '../services/api';

interface CheckoutScreenProps {
  cartItems: CartItem[];
  onBack: () => void;
  onOrderComplete: (orderData: any) => void;
}

interface CustomerInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
}

export default function CheckoutScreen({
  cartItems,
  onBack,
  onOrderComplete
}: CheckoutScreenProps) {
  const { user } = useAuth();
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoadingUser, setIsLoadingUser] = useState(true);

  // Load user data on mount
  useEffect(() => {
    if (user) {
      setIsLoadingUser(false);
    }
  }, [user]);

  const subtotal = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const tax = subtotal * 0.1; // 10% tax rate
  const deliveryFee = subtotal > 100 ? 0 : 7.99; // Free delivery over 100 TND
  const total = subtotal + tax + deliveryFee;


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
      const orderData = {
        items: cartItems.map(item => ({
          productId: item.product.id,
          quantity: item.quantity,
          price: item.product.price
        })),
        paymentMethod: paymentMethod === 'cash' ? 'CASH_ON_DELIVERY' : 'CREDIT_CARD',
        notes: ''
      };

      // Create order using new API
      const result = await API.createOrder(orderData);

      if (result) {
        // Order created successfully
        onOrderComplete({
          id: result.id,
          orderNumber: result.orderNumber,
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
    } catch (error: any) {
      console.error('Order creation failed:', error);
      alert(error.message || 'Failed to process order. Please try again.');
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
        <h2 className="text-xl font-semibold text-gray-800 mb-2">No items to checkout</h2>
        <p className="text-gray-500 text-center mb-4">Add some products to your basket first!</p>
        <button
          onClick={onBack}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
        >
          Back to Shopping
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
          <h1 className="text-xl font-semibold text-gray-900">Checkout</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Customer Information - Display Only */}
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center gap-2 mb-4">
              <User className="w-5 h-5 text-gray-600" />
              <h2 className="text-lg font-semibold">Customer Information</h2>
            </div>

            {isLoadingUser ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-600 mt-2">Loading your information...</p>
              </div>
            ) : user ? (
              <div className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      Full Name
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
                      Phone
                    </label>
                    <p className="text-gray-900">{user.phone || 'Not provided'}</p>
                  </div>

                  {user.companyName && (
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">
                        Company
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
                        Customer Type
                      </label>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {user.customerType}
                      </span>
                    </div>
                  )}
                </div>

                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    ✓ Your account information will be used for this order
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-red-600">Please login to continue</p>
              </div>
            )}
          </div>

          {/* Shipping Address Note */}
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center gap-2 mb-4">
              <Truck className="w-5 h-5 text-gray-600" />
              <h2 className="text-lg font-semibold">Shipping Address</h2>
            </div>
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
              <p className="text-sm text-gray-700">
                Your default shipping address will be used for this order.
                <br />
                <span className="text-gray-600">You can manage your addresses in your account settings.</span>
              </p>
            </div>
          </div>

          {/* Payment Method */}
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center gap-2 mb-4">
              <CreditCard className="w-5 h-5 text-gray-600" />
              <h2 className="text-lg font-semibold">Payment Method</h2>
            </div>

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
                  <div className="font-medium">Cash on Delivery</div>
                  <div className="text-sm text-gray-500">Pay when you receive your order</div>
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
                  <div className="font-medium">Card Payment</div>
                  <div className="text-sm text-gray-500">Pay with your credit/debit card</div>
                </div>
              </label>
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center gap-2 mb-4">
              <Truck className="w-5 h-5 text-gray-600" />
              <h2 className="text-lg font-semibold">Order Summary</h2>
            </div>

            <div className="space-y-3 mb-4">
              {cartItems.map((item) => (
                <div key={item.product.id} className="flex justify-between items-center">
                  <div className="flex-1">
                    <p className="font-medium">{item.product.name}</p>
                    <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                  </div>
                  <p className="font-semibold">{(item.product.price * item.quantity).toFixed(2)} TND</p>
                </div>
              ))}
            </div>

            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{subtotal.toFixed(2)} TND</span>
              </div>
              <div className="flex justify-between">
                <span>Tax (10%)</span>
                <span>{tax.toFixed(2)} TND</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Fee</span>
                <span>{deliveryFee === 0 ? 'Free' : `${deliveryFee.toFixed(2)} TND`}</span>
              </div>
              <div className="flex justify-between font-bold text-lg pt-2 border-t">
                <span>Total</span>
                <span>{total.toFixed(2)} TND</span>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
            <button
              type="submit"
              disabled={isProcessing}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-4 rounded-lg transition-colors"
            >
              {isProcessing ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Processing Order...
                </div>
              ) : (
                `Place Order - ${total.toFixed(2)} TND`
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
