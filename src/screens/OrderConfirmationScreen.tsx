import { CheckCircle, Home } from 'lucide-react';

interface OrderConfirmationScreenProps {
  order: any;
  onBackToHome: () => void;
}

export default function OrderConfirmationScreen({
  order,
  onBackToHome
}: OrderConfirmationScreenProps) {
  const isManualEntry = order.needs_manual_entry;

  return (
    <div className="flex flex-col items-center justify-center px-4 py-20 min-h-screen bg-gray-50">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
        <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${
          isManualEntry ? 'bg-orange-100' : 'bg-green-100'
        }`}>
          {isManualEntry ? (
            <svg className="w-12 h-12 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          ) : (
            <CheckCircle className="w-12 h-12 text-green-600" />
          )}
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {isManualEntry ? 'Order Received!' : 'Order Confirmed!'}
        </h1>

        <p className="text-gray-600 mb-6">
          {isManualEntry
            ? 'Your order has been received and is ready for manual processing in WooCommerce.'
            : 'Thank you for your order. We\'ve received it and will process it shortly.'
          }
        </p>

        {order && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Order Number:</span>
                <span className="font-semibold">#{order.order_number || order.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span className="font-semibold capitalize">{order.status}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total:</span>
                <span className="font-semibold text-green-600">{order.total} TND</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Payment:</span>
                <span className="font-semibold">{order.payment_method_title}</span>
              </div>

              {isManualEntry && (
                <>
                  <div className="pt-2 border-t border-gray-200">
                    <p className="text-orange-600 font-medium mb-2">⚠️ Manual Entry Required</p>
                    <p className="text-xs text-gray-500 mb-2">
                      Due to API permissions, this order needs to be manually created in WooCommerce admin.
                    </p>
                  </div>

                  <div className="text-xs text-gray-500">
                    <p><strong>Customer:</strong> {order.billing?.first_name} {order.billing?.last_name}</p>
                    <p><strong>Email:</strong> {order.billing?.email}</p>
                    <p><strong>Phone:</strong> {order.billing?.phone}</p>
                    <p><strong>Items:</strong> {order.line_items?.length || 0} product(s)</p>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {isManualEntry && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6 text-left">
            <h3 className="font-medium text-orange-800 mb-2">📋 Next Steps:</h3>
            <ol className="text-sm text-orange-700 space-y-1">
              <li>1. Go to WooCommerce admin panel</li>
              <li>2. Navigate to Orders → Add New</li>
              <li>3. Copy the customer details above</li>
              <li>4. Add the products from the order</li>
              <li>5. Set payment method: {order.payment_method_title}</li>
            </ol>
          </div>
        )}

        <div className="space-y-3">
          <p className="text-sm text-gray-500">
            {isManualEntry
              ? 'Order details have been logged to the browser console for reference.'
              : 'You\'ll receive an email confirmation shortly with order details and tracking information.'
            }
          </p>

          <button
            onClick={onBackToHome}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <Home className="w-5 h-5" />
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}
