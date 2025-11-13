import { useState } from 'react';
import { 
  User, 
  Package, 
  Heart, 
  MapPin, 
  Settings, 
  LogOut,
  Building2,
  Phone,
  Mail,
  FileText
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

type TabType = 'profile' | 'orders' | 'wishlist' | 'addresses';

interface AccountScreenProps {
  onLogout: () => void;
  onNavigateToShop: () => void;
  onNavigateToQuotations?: () => void;
}

export default function AccountScreen({ onLogout, onNavigateToShop, onNavigateToQuotations }: AccountScreenProps) {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('profile');

  const handleLogout = async () => {
    await logout();
    onLogout();
  };

  if (!user) {
    return null;
  }

  const tabs = [
    { id: 'profile' as TabType, label: 'My Profile', icon: User },
    { id: 'orders' as TabType, label: 'My Orders', icon: Package },
    { id: 'wishlist' as TabType, label: 'Wishlist', icon: Heart },
    { id: 'addresses' as TabType, label: 'Addresses', icon: MapPin },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Account</h1>
              <p className="mt-1 text-sm text-gray-600">
                Welcome back, {user.firstName || user.username}!
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <nav className="space-y-1 p-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                        activeTab === tab.id
                          ? 'bg-blue-50 text-blue-700'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      {tab.label}
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              {activeTab === 'profile' && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Profile Information</h2>
                    <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors">
                      <Settings className="w-4 h-4" />
                      Edit Profile
                    </button>
                  </div>

                  <div className="space-y-6">
                    {/* Personal Information */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-start gap-3">
                          <User className="w-5 h-5 text-gray-400 mt-0.5" />
                          <div>
                            <p className="text-sm text-gray-600">Full Name</p>
                            <p className="text-base font-medium text-gray-900">
                              {user.firstName} {user.lastName}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-3">
                          <Mail className="w-5 h-5 text-gray-400 mt-0.5" />
                          <div>
                            <p className="text-sm text-gray-600">Email</p>
                            <p className="text-base font-medium text-gray-900">{user.email}</p>
                          </div>
                        </div>

                        {user.username && (
                          <div className="flex items-start gap-3">
                            <User className="w-5 h-5 text-gray-400 mt-0.5" />
                            <div>
                              <p className="text-sm text-gray-600">Username</p>
                              <p className="text-base font-medium text-gray-900">{user.username}</p>
                            </div>
                          </div>
                        )}

                        {user.phone && (
                          <div className="flex items-start gap-3">
                            <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
                            <div>
                              <p className="text-sm text-gray-600">Phone</p>
                              <p className="text-base font-medium text-gray-900">{user.phone}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Business Information */}
                    {user.companyName && (
                      <div className="pt-6 border-t border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Business Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="flex items-start gap-3">
                            <Building2 className="w-5 h-5 text-gray-400 mt-0.5" />
                            <div>
                              <p className="text-sm text-gray-600">Company Name</p>
                              <p className="text-base font-medium text-gray-900">{user.companyName}</p>
                            </div>
                          </div>

                          {user.customerType && (
                            <div className="flex items-start gap-3">
                              <FileText className="w-5 h-5 text-gray-400 mt-0.5" />
                              <div>
                                <p className="text-sm text-gray-600">Customer Type</p>
                                <p className="text-base font-medium text-gray-900">{user.customerType}</p>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* B2B Financial Information */}
                        {user.customerType === 'B2B' && user.financialLimit && (
                          <div className="mt-6 pt-6 border-t border-gray-200">
                            <h4 className="text-md font-semibold text-gray-900 mb-4">Financial Information</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <p className="text-sm text-blue-600 font-medium mb-1">Credit Limit</p>
                                <p className="text-xl font-bold text-blue-900">
                                  {user.financialLimit.toFixed(2)} TND
                                </p>
                              </div>
                              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                                <p className="text-sm text-orange-600 font-medium mb-1">Outstanding Balance</p>
                                <p className="text-xl font-bold text-orange-900">
                                  {(user.outstandingBalance || 0).toFixed(2)} TND
                                </p>
                              </div>
                              <div className="bg-green-50 border border-green-200 rounded-lg p-4 col-span-2">
                                <p className="text-sm text-green-600 font-medium mb-1">Available Credit</p>
                                <p className="text-2xl font-bold text-green-900">
                                  {(user.financialLimit - (user.outstandingBalance || 0)).toFixed(2)} TND
                                </p>
                              </div>
                            </div>
                            {user.paymentTerms && (
                              <div className="mt-4 flex items-center justify-between text-sm">
                                <span className="text-gray-600">Payment Terms:</span>
                                <span className="font-medium text-gray-900">{user.paymentTerms}</span>
                              </div>
                            )}
                            {user.accountStatus && (
                              <div className="mt-2 flex items-center justify-between text-sm">
                                <span className="text-gray-600">Account Status:</span>
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                  user.accountStatus === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                }`}>
                                  {user.accountStatus}
                                </span>
                              </div>
                            )}
                          </div>
                        )}

                        {/* B2B Quotations Button */}
                        {user.customerType === 'B2B' && onNavigateToQuotations && (
                          <div className="mt-6">
                            <button
                              onClick={onNavigateToQuotations}
                              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                            >
                              <FileText className="w-5 h-5" />
                              View My Quotations
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'orders' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">My Orders</h2>
                  <div className="text-center py-12">
                    <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600 mb-2">No orders yet</p>
                    <p className="text-sm text-gray-500">Start shopping to see your orders here</p>
                    <button
                      onClick={onNavigateToShop}
                      className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Start Shopping
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'wishlist' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">My Wishlist</h2>
                  <div className="text-center py-12">
                    <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600 mb-2">Your wishlist is empty</p>
                    <p className="text-sm text-gray-500">Save items you love for later</p>
                  </div>
                </div>
              )}

              {activeTab === 'addresses' && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Saved Addresses</h2>
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                      Add New Address
                    </button>
                  </div>
                  <div className="text-center py-12">
                    <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600 mb-2">No saved addresses</p>
                    <p className="text-sm text-gray-500">Add an address for faster checkout</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
