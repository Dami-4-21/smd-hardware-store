import { useState } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Building2, 
  CreditCard, 
  Package, 
  LogOut, 
  ChevronRight,
  Heart, 
  Settings, 
  Globe,
  Check,
  FileText
} from 'lucide-react';
import { formatPrice } from '../utils/currency';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';

type TabType = 'profile' | 'orders' | 'quotations' | 'invoices' | 'wishlist' | 'addresses' | 'settings';

interface AccountScreenProps {
  onLogout: () => void;
  onNavigateToShop: () => void;
  onNavigateToQuotations?: () => void;
  onNavigateToInvoices?: () => void;
}

export default function AccountScreen({ onLogout, onNavigateToShop, onNavigateToQuotations, onNavigateToInvoices }: AccountScreenProps) {
  const { user, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const [activeTab, setActiveTab] = useState<TabType>('profile');

  const handleLogout = async () => {
    await logout();
    onLogout();
  };

  if (!user) {
    return null;
  }

  // Check if user is B2B customer (professional account types)
  const B2B_CUSTOMER_TYPES = ['Retailer', 'Wholesaler', 'Contractor', 'B2B'];
  const isB2BCustomer = user?.customerType && B2B_CUSTOMER_TYPES.includes(user.customerType);

  const tabs = [
    { id: 'profile' as TabType, label: t.account.profile, icon: User },
    { id: 'orders' as TabType, label: t.account.orders, icon: Package },
    ...(isB2BCustomer ? [
      { id: 'quotations' as TabType, label: t.account.quotations, icon: FileText },
      { id: 'invoices' as TabType, label: t.account.invoices, icon: FileText },
    ] : []),
    { id: 'wishlist' as TabType, label: t.account.wishlist, icon: Heart },
    { id: 'addresses' as TabType, label: t.account.addresses, icon: MapPin },
    { id: 'settings' as TabType, label: t.account.settings, icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Mon Compte</h1>
              <p className="mt-1 text-sm text-gray-600">
                Bienvenue, {user.firstName || user.username}!
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Déconnexion
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
                    <h2 className="text-2xl font-bold text-gray-900">Informations du profil</h2>
                    <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors">
                      <Settings className="w-4 h-4" />
                      Modifier le profil
                    </button>
                  </div>

                  <div className="space-y-6">
                    {/* Personal Information */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Informations personnelles</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-start gap-3">
                          <User className="w-5 h-5 text-gray-400 mt-0.5" />
                          <div>
                            <p className="text-sm text-gray-600">Nom complet</p>
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
                              <p className="text-sm text-gray-600">Nom d'utilisateur</p>
                              <p className="text-base font-medium text-gray-900">{user.username}</p>
                            </div>
                          </div>
                        )}

                        {user.phone && (
                          <div className="flex items-start gap-3">
                            <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
                            <div>
                              <p className="text-sm text-gray-600">Téléphone</p>
                              <p className="text-base font-medium text-gray-900">{user.phone}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Business Information */}
                    {user.companyName && (
                      <div className="pt-6 border-t border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Informations professionnelles</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="flex items-start gap-3">
                            <Building2 className="w-5 h-5 text-gray-400 mt-0.5" />
                            <div>
                              <p className="text-sm text-gray-600">Nom de l'entreprise</p>
                              <p className="text-base font-medium text-gray-900">{user.companyName}</p>
                            </div>
                          </div>

                          {user.customerType && (
                            <div className="flex items-start gap-3">
                              <FileText className="w-5 h-5 text-gray-400 mt-0.5" />
                              <div>
                                <p className="text-sm text-gray-600">Type de client</p>
                                <p className="text-base font-medium text-gray-900">{user.customerType}</p>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* B2B Financial Information */}
                        {user.customerType === 'B2B' && user.financialLimit && (
                          <div className="mt-6 pt-6 border-t border-gray-200">
                            <h4 className="text-md font-semibold text-gray-900 mb-4">Informations financières</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <p className="text-sm text-blue-600 font-medium mb-1">Limite de crédit</p>
                                <p className="text-xl font-bold text-blue-900">
                                  {formatPrice(user.financialLimit)}
                                </p>
                              </div>
                              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                                <p className="text-sm text-orange-600 font-medium mb-1">Encours actuel</p>
                                <p className="text-xl font-bold text-orange-900">
                                  {formatPrice(user.outstandingBalance || 0)}
                                </p>
                              </div>
                              <div className="bg-green-50 border border-green-200 rounded-lg p-4 col-span-2">
                                <p className="text-sm text-green-600 font-medium mb-1">Crédit disponible</p>
                                <p className="text-2xl font-bold text-green-900">
                                  {formatPrice(user.financialLimit - (user.outstandingBalance || 0))}
                                </p>
                              </div>
                            </div>
                            {user.paymentTerms && (
                              <div className="mt-4 flex items-center justify-between text-sm">
                                <span className="text-gray-600">Conditions de paiement:</span>
                                <span className="font-medium text-gray-900">{user.paymentTerms}</span>
                              </div>
                            )}
                            {user.accountStatus && (
                              <div className="mt-2 flex items-center justify-between text-sm">
                                <span className="text-gray-600">Statut du compte:</span>
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                  user.accountStatus === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                }`}>
                                  {user.accountStatus}
                                </span>
                              </div>
                            )}
                          </div>
                        )}

                        {/* B2B Quotations and Invoices Buttons */}
                        {isB2BCustomer && (
                          <div className="mt-6 space-y-3">
                            {onNavigateToQuotations && (
                              <button
                                onClick={onNavigateToQuotations}
                                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                              >
                                <FileText className="w-5 h-5" />
                                Voir mes devis
                              </button>
                            )}
                            {onNavigateToInvoices && (
                              <button
                                onClick={onNavigateToInvoices}
                                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                              >
                                <FileText className="w-5 h-5" />
                                Voir mes factures
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'orders' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Mes Commandes</h2>
                  <div className="text-center py-12">
                    <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600 mb-2">Aucune commande pour le moment</p>
                    <p className="text-sm text-gray-500">Commencez vos achats pour voir vos commandes ici</p>
                    <button
                      onClick={onNavigateToShop}
                      className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Commencer mes achats
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'quotations' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">{t.account.quotations}</h2>
                  <div className="text-center py-12">
                    <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600 mb-2">{t.account.noQuotations}</p>
                    <p className="text-sm text-gray-500">{t.account.quotationsMessage}</p>
                    <button
                      onClick={onNavigateToShop}
                      className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                      {t.account.startShopping}
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'invoices' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">{t.account.invoices}</h2>
                  <div className="text-center py-12">
                    <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600 mb-2">{t.account.noInvoices}</p>
                    <p className="text-sm text-gray-500">{t.account.invoicesMessage}</p>
                  </div>
                </div>
              )}

              {activeTab === 'wishlist' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Ma Liste de souhaits</h2>
                  <div className="text-center py-12">
                    <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600 mb-2">Votre liste de souhaits est vide</p>
                    <p className="text-sm text-gray-500">Enregistrez les articles que vous aimez pour plus tard</p>
                  </div>
                </div>
              )}

              {activeTab === 'addresses' && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">{t.account.savedAddresses}</h2>
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                      {t.account.addAddress}
                    </button>
                  </div>
                  <div className="text-center py-12">
                    <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600 mb-2">{t.account.noAddresses}</p>
                    <p className="text-sm text-gray-500">{t.account.addressesMessage}</p>
                  </div>
                </div>
              )}

              {activeTab === 'settings' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">{t.account.settings}</h2>
                  
                  {/* Language Settings */}
                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <Globe className="w-6 h-6 text-blue-600" />
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{t.language.title}</h3>
                        <p className="text-sm text-gray-600">{t.language.select}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                      <button
                        onClick={() => setLanguage('en')}
                        className={`flex items-center justify-between gap-3 px-6 py-4 rounded-lg border-2 transition-all ${
                          language === 'en'
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Globe className="w-5 h-5" />
                          <span className="font-medium text-lg">{t.language.english}</span>
                        </div>
                        {language === 'en' && <Check className="w-6 h-6 text-blue-600" />}
                      </button>
                      
                      <button
                        onClick={() => setLanguage('fr')}
                        className={`flex items-center justify-between gap-3 px-6 py-4 rounded-lg border-2 transition-all ${
                          language === 'fr'
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Globe className="w-5 h-5" />
                          <span className="font-medium text-lg">{t.language.french}</span>
                        </div>
                        {language === 'fr' && <Check className="w-6 h-6 text-blue-600" />}
                      </button>
                    </div>

                    <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm text-blue-800">
                        <strong>{t.language.change}:</strong> {language === 'en' ? 'The interface will update immediately when you select a language.' : 'L\'interface se mettra à jour immédiatement lorsque vous sélectionnez une langue.'}
                      </p>
                    </div>
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
