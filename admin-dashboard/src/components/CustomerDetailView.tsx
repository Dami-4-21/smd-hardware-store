import { useState } from 'react';
import {
  X,
  User,
  Mail,
  Phone,
  Building2,
  FileText,
  MapPin,
  ShoppingBag,
  Key,
  Calendar,
  CheckCircle,
  XCircle,
  Copy,
  RefreshCw,
  Edit,
  Download,
  DollarSign,
  CreditCard,
  TrendingUp,
  AlertCircle,
} from 'lucide-react';
import { Customer, customerService } from '../services/customerService';

interface CustomerDetailViewProps {
  customer: Customer;
  onClose: () => void;
  onUpdate: () => void;
}

export default function CustomerDetailView({ customer, onClose }: CustomerDetailViewProps) {
  const [activeTab, setActiveTab] = useState<'info' | 'orders' | 'addresses'>('info');
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [newPassword, setNewPassword] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleResetPassword = async () => {
    if (!confirm('Are you sure you want to reset this customer\'s password?')) {
      return;
    }

    setIsResettingPassword(true);
    try {
      const result = await customerService.resetPassword(customer.id);
      setNewPassword(result.newPassword);
      setShowPassword(true);
      alert('Password reset successfully! Make sure to save the new password.');
    } catch (error: any) {
      alert(error.message || 'Failed to reset password');
    } finally {
      setIsResettingPassword(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-TN', {
      style: 'currency',
      currency: 'TND',
    }).format(amount);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <User className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">
                {customer.firstName} {customer.lastName}
              </h2>
              <p className="text-blue-100 text-sm">{customer.email}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 bg-gray-50">
          <div className="flex px-6">
            <button
              onClick={() => setActiveTab('info')}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'info'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                Customer Information
              </div>
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'orders'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-4 h-4" />
                Orders ({customer._count?.orders || 0})
              </div>
            </button>
            <button
              onClick={() => setActiveTab('addresses')}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'addresses'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Addresses ({customer.addresses?.length || 0})
              </div>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'info' && (
            <div className="space-y-6">
              {/* Credentials Section */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Key className="w-5 h-5 text-yellow-600" />
                    Login Credentials
                  </h3>
                  <button
                    onClick={handleResetPassword}
                    disabled={isResettingPassword}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50 transition-colors"
                  >
                    <RefreshCw className={`w-4 h-4 ${isResettingPassword ? 'animate-spin' : ''}`} />
                    Reset Password
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Username</label>
                    <div className="mt-1 flex items-center gap-2">
                      <code className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm font-mono">
                        {customer.username}
                      </code>
                      <button
                        onClick={() => handleCopy(customer.username, 'username')}
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Copy username"
                      >
                        {copiedField === 'username' ? (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Email</label>
                    <div className="mt-1 flex items-center gap-2">
                      <code className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm font-mono">
                        {customer.email}
                      </code>
                      <button
                        onClick={() => handleCopy(customer.email, 'email')}
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Copy email"
                      >
                        {copiedField === 'email' ? (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
                {newPassword && showPassword && (
                  <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm font-medium text-green-900 mb-2">New Password Generated:</p>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 px-3 py-2 bg-white border border-green-300 rounded-lg text-sm font-mono text-green-900">
                        {newPassword}
                      </code>
                      <button
                        onClick={() => handleCopy(newPassword, 'password')}
                        className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                        title="Copy password"
                      >
                        {copiedField === 'password' ? (
                          <CheckCircle className="w-4 h-4" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    <p className="text-xs text-green-700 mt-2">
                      ⚠️ Make sure to save this password! It won't be shown again.
                    </p>
                  </div>
                )}
              </div>

              {/* Personal Information */}
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <User className="w-5 h-5 text-blue-600" />
                  Personal Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">First Name</label>
                    <p className="mt-1 text-gray-900">{customer.firstName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Last Name</label>
                    <p className="mt-1 text-gray-900">{customer.lastName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Email</label>
                    <div className="mt-1 flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <p className="text-gray-900">{customer.email}</p>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Phone</label>
                    <div className="mt-1 flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <p className="text-gray-900">{customer.phone || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Company Information */}
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-blue-600" />
                  Company Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Company Name</label>
                    <p className="mt-1 text-gray-900">{customer.companyName || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Customer Type</label>
                    <p className="mt-1">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {customer.customerType || 'N/A'}
                      </span>
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">RNE Number</label>
                    <p className="mt-1 text-gray-900">{customer.rneNumber || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Tax ID</label>
                    <p className="mt-1 text-gray-900">{customer.taxId || 'N/A'}</p>
                  </div>
                  {customer.rnePdfUrl && (
                    <div className="md:col-span-2">
                      <label className="text-sm font-medium text-gray-600">RNE Document</label>
                      <div className="mt-1">
                        <a
                          href={customer.rnePdfUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
                        >
                          <FileText className="w-4 h-4" />
                          View RNE Document
                          <Download className="w-4 h-4" />
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Financial Information (B2B) */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-blue-600" />
                  💰 Financial Information (B2B)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  {/* Credit Limit Card */}
                  <div className="bg-white rounded-lg p-4 border border-blue-200">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium text-gray-600">Credit Limit</label>
                      <TrendingUp className="w-4 h-4 text-blue-600" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatCurrency(customer.financialLimit || 0)}
                    </p>
                  </div>

                  {/* Current Outstanding Card */}
                  <div className="bg-white rounded-lg p-4 border border-blue-200">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium text-gray-600">Outstanding</label>
                      <AlertCircle className="w-4 h-4 text-orange-600" />
                    </div>
                    <p className="text-2xl font-bold text-orange-600">
                      {formatCurrency(customer.currentOutstanding || 0)}
                    </p>
                  </div>

                  {/* Available Credit Card */}
                  <div className="bg-white rounded-lg p-4 border border-blue-200">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium text-gray-600">Available Credit</label>
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    </div>
                    <p className="text-2xl font-bold text-green-600">
                      {formatCurrency((customer.financialLimit || 0) - (customer.currentOutstanding || 0))}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white rounded-lg p-3 border border-blue-200">
                    <label className="text-sm font-medium text-gray-600 flex items-center gap-2">
                      <CreditCard className="w-4 h-4" />
                      Payment Method
                    </label>
                    <p className="mt-1 text-gray-900 font-medium">
                      {customer.paymentTerm === 'NET_30' || customer.paymentTerm === 'NET_60' || 
                       customer.paymentTerm === 'NET_90' || customer.paymentTerm === 'NET_120'
                        ? 'Payment on Due Date (Net Terms)'
                        : 'Cash/Cheque on Delivery'}
                    </p>
                  </div>

                  {customer.paymentTerm && (
                    <div className="bg-white rounded-lg p-3 border border-blue-200">
                      <label className="text-sm font-medium text-gray-600">Payment Terms</label>
                      <p className="mt-1 text-gray-900 font-medium">
                        {customer.paymentTerm?.replace('_', ' ')} 
                        {customer.paymentTerm === 'NET_30' && ' (30 days)'}
                        {customer.paymentTerm === 'NET_60' && ' (60 days)'}
                        {customer.paymentTerm === 'NET_90' && ' (90 days)'}
                        {customer.paymentTerm === 'NET_120' && ' (120 days)'}
                      </p>
                    </div>
                  )}

                  <div className="bg-white rounded-lg p-3 border border-blue-200 md:col-span-2">
                    <label className="text-sm font-medium text-gray-600">Account Status</label>
                    <div className="mt-1">
                      {customer.accountStatus === 'ACTIVE' && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Active - Can submit quotations
                        </span>
                      )}
                      {customer.accountStatus === 'COMMERCIAL_IN_PROCESS' && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                          <AlertCircle className="w-4 h-4 mr-1" />
                          Commercial In-Process
                        </span>
                      )}
                      {customer.accountStatus === 'FINANCIAL_IN_PROCESS' && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                          <AlertCircle className="w-4 h-4 mr-1" />
                          Financial In-Process
                        </span>
                      )}
                      {customer.accountStatus === 'SUSPENDED' && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                          <XCircle className="w-4 h-4 mr-1" />
                          Suspended
                        </span>
                      )}
                      {customer.accountStatus === 'FINANCIAL_NON_CURRENT' && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800">
                          <AlertCircle className="w-4 h-4 mr-1" />
                          Financial Non-Current
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Credit Usage Progress Bar */}
                {customer.financialLimit && customer.financialLimit > 0 && (
                  <div className="mt-4 bg-white rounded-lg p-3 border border-blue-200">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium text-gray-600">Credit Usage</label>
                      <span className="text-sm text-gray-600">
                        {((customer.currentOutstanding || 0) / customer.financialLimit * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className={`h-3 rounded-full transition-all ${
                          ((customer.currentOutstanding || 0) / customer.financialLimit) > 0.9
                            ? 'bg-red-600'
                            : ((customer.currentOutstanding || 0) / customer.financialLimit) > 0.7
                            ? 'bg-orange-500'
                            : 'bg-green-500'
                        }`}
                        style={{
                          width: `${Math.min(((customer.currentOutstanding || 0) / customer.financialLimit) * 100, 100)}%`
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Account Status */}
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  Account Status
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Status</label>
                    <div className="mt-1">
                      {customer.isActive ? (
                        <span className="inline-flex items-center text-green-700">
                          <CheckCircle className="w-4 h-4 mr-1" />
                          <span className="text-sm font-medium">Active</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center text-red-700">
                          <XCircle className="w-4 h-4 mr-1" />
                          <span className="text-sm font-medium">Inactive</span>
                        </span>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Email Verified</label>
                    <div className="mt-1">
                      {customer.emailVerified ? (
                        <span className="inline-flex items-center text-green-700">
                          <CheckCircle className="w-4 h-4 mr-1" />
                          <span className="text-sm">Verified</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center text-yellow-700">
                          <XCircle className="w-4 h-4 mr-1" />
                          <span className="text-sm">Not Verified</span>
                        </span>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Member Since</label>
                    <p className="mt-1 text-gray-900 text-sm">{formatDate(customer.createdAt)}</p>
                  </div>
                  {customer.updatedAt && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">Last Updated</label>
                      <p className="mt-1 text-gray-900 text-sm">{formatDate(customer.updatedAt)}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'orders' && (
            <div>
              {customer.orders && customer.orders.length > 0 ? (
                <div className="space-y-4">
                  {customer.orders.map((order) => (
                    <div key={order.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h4 className="font-semibold text-gray-900">Order #{order.orderNumber}</h4>
                          <p className="text-sm text-gray-600">{formatDate(order.createdAt)}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-gray-900">{formatCurrency(order.totalAmount)}</p>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            order.status === 'DELIVERED' ? 'bg-green-100 text-green-800' :
                            order.status === 'PROCESSING' ? 'bg-blue-100 text-blue-800' :
                            order.status === 'SHIPPED' ? 'bg-purple-100 text-purple-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {order.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
                  <p className="text-gray-600">This customer hasn't placed any orders</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'addresses' && (
            <div>
              {customer.addresses && customer.addresses.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {customer.addresses.map((address) => (
                    <div key={address.id} className="bg-white border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-5 h-5 text-blue-600" />
                          <h4 className="font-semibold text-gray-900">{address.label || 'Address'}</h4>
                        </div>
                        {address.isDefault && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                            Default
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p>{address.street}</p>
                        <p>
                          {address.city}
                          {address.state && `, ${address.state}`}
                          {address.postalCode && ` ${address.postalCode}`}
                        </p>
                        <p>{address.country}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No addresses saved</h3>
                  <p className="text-gray-600">This customer hasn't added any addresses</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 bg-gray-50 px-6 py-4 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Customer ID: <code className="text-xs bg-gray-200 px-2 py-1 rounded">{customer.id}</code>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Close
            </button>
            <button
              onClick={() => {
                // TODO: Implement edit functionality
                alert('Edit functionality coming soon!');
              }}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Edit className="w-4 h-4" />
              Edit Customer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
