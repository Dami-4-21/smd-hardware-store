import { useState, useEffect } from 'react';
import { 
  Globe, 
  Bell, 
  Shield, 
  Database, 
  Mail,
  Save,
  Check,
  AlertCircle
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface SettingsData {
  notifications: {
    email: boolean;
    newOrders: boolean;
    newQuotations: boolean;
    lowStock: boolean;
    systemUpdates: boolean;
  };
  business: {
    companyName: string;
    email: string;
    phone: string;
    address: string;
    taxId: string;
    currency: string;
  };
  system: {
    maintenanceMode: boolean;
    autoBackup: boolean;
    sessionTimeout: number;
  };
}

export default function SettingsPage() {
  const { language, setLanguage, t } = useLanguage();
  const [settings, setSettings] = useState<SettingsData>({
    notifications: {
      email: true,
      newOrders: true,
      newQuotations: true,
      lowStock: true,
      systemUpdates: false,
    },
    business: {
      companyName: 'SMD Hardware Store',
      email: 'contact@smdhardware.com',
      phone: '+216 XX XXX XXX',
      address: 'Tunisia',
      taxId: 'TN123456789',
      currency: 'TND',
    },
    system: {
      maintenanceMode: false,
      autoBackup: true,
      sessionTimeout: 30,
    },
  });

  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<'general' | 'notifications' | 'business' | 'system'>('general');

  useEffect(() => {
    // Load settings from localStorage
    const savedSettings = localStorage.getItem('adminSettings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings(parsed);
      } catch (e) {
        console.error('Failed to load settings:', e);
      }
    }
  }, []);

  const handleSave = () => {
    // Save to localStorage
    localStorage.setItem('adminSettings', JSON.stringify(settings));
    
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const updateSettings = (section: keyof SettingsData, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...(prev[section] as any),
        [key]: value,
      },
    }));
  };

  const tabs = [
    { id: 'general' as const, label: t.settings.tabs.general, icon: Globe },
    { id: 'notifications' as const, label: t.settings.tabs.notifications, icon: Bell },
    { id: 'business' as const, label: t.settings.tabs.business, icon: Database },
    { id: 'system' as const, label: t.settings.tabs.system, icon: Shield },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{t.settings.title}</h1>
        <p className="text-gray-600 mt-1">{t.settings.subtitle}</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-5 h-5" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Content */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        {/* General Settings */}
        {activeTab === 'general' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">{t.settings.general.title}</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.settings.general.language}
                </label>
                <p className="text-sm text-gray-500 mb-3">{t.settings.general.languageDesc}</p>
                <div className="grid grid-cols-2 gap-4 max-w-md">
                  <button
                    onClick={() => setLanguage('en')}
                    className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-all ${
                      language === 'en'
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Globe className="w-5 h-5" />
                    <span className="font-medium">{t.settings.general.english}</span>
                    {language === 'en' && <Check className="w-5 h-5 ml-auto" />}
                  </button>
                  <button
                    onClick={() => setLanguage('fr')}
                    className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-all ${
                      language === 'fr'
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Globe className="w-5 h-5" />
                    <span className="font-medium">{t.settings.general.french}</span>
                    {language === 'fr' && <Check className="w-5 h-5 ml-auto" />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Notifications */}
        {activeTab === 'notifications' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">{t.settings.notifications.title}</h2>
            
            <div className="space-y-4">
              {/* Email Notifications */}
              <div className="flex items-start justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Mail className="w-5 h-5 text-gray-600" />
                    <h3 className="font-medium text-gray-900">{t.settings.notifications.email}</h3>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{t.settings.notifications.emailDesc}</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.notifications.email}
                    onChange={(e) => updateSettings('notifications', 'email', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              {/* New Orders */}
              <div className="flex items-start justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{t.settings.notifications.newOrders}</h3>
                  <p className="text-sm text-gray-600 mt-1">{t.settings.notifications.newOrdersDesc}</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.notifications.newOrders}
                    onChange={(e) => updateSettings('notifications', 'newOrders', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              {/* New Quotations */}
              <div className="flex items-start justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{t.settings.notifications.newQuotations}</h3>
                  <p className="text-sm text-gray-600 mt-1">{t.settings.notifications.newQuotationsDesc}</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.notifications.newQuotations}
                    onChange={(e) => updateSettings('notifications', 'newQuotations', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              {/* Low Stock */}
              <div className="flex items-start justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{t.settings.notifications.lowStock}</h3>
                  <p className="text-sm text-gray-600 mt-1">{t.settings.notifications.lowStockDesc}</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.notifications.lowStock}
                    onChange={(e) => updateSettings('notifications', 'lowStock', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              {/* System Updates */}
              <div className="flex items-start justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{t.settings.notifications.systemUpdates}</h3>
                  <p className="text-sm text-gray-600 mt-1">{t.settings.notifications.systemUpdatesDesc}</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.notifications.systemUpdates}
                    onChange={(e) => updateSettings('notifications', 'systemUpdates', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Business Info */}
        {activeTab === 'business' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">{t.settings.business.title}</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.settings.business.companyName}
                </label>
                <input
                  type="text"
                  value={settings.business.companyName}
                  onChange={(e) => updateSettings('business', 'companyName', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.settings.business.email}
                </label>
                <input
                  type="email"
                  value={settings.business.email}
                  onChange={(e) => updateSettings('business', 'email', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.settings.business.phone}
                </label>
                <input
                  type="tel"
                  value={settings.business.phone}
                  onChange={(e) => updateSettings('business', 'phone', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.settings.business.taxId}
                </label>
                <input
                  type="text"
                  value={settings.business.taxId}
                  onChange={(e) => updateSettings('business', 'taxId', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.settings.business.address}
                </label>
                <textarea
                  value={settings.business.address}
                  onChange={(e) => updateSettings('business', 'address', e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.settings.business.currency}
                </label>
                <select
                  value={settings.business.currency}
                  onChange={(e) => updateSettings('business', 'currency', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="TND">TND - Tunisian Dinar</option>
                  <option value="EUR">EUR - Euro</option>
                  <option value="USD">USD - US Dollar</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* System Settings */}
        {activeTab === 'system' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">{t.settings.system.title}</h2>
            
            <div className="space-y-4">
              {/* Maintenance Mode */}
              <div className="flex items-start justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-orange-600" />
                    <h3 className="font-medium text-gray-900">{t.settings.system.maintenance}</h3>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{t.settings.system.maintenanceDesc}</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.system.maintenanceMode}
                    onChange={(e) => updateSettings('system', 'maintenanceMode', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
                </label>
              </div>

              {/* Auto Backup */}
              <div className="flex items-start justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Database className="w-5 h-5 text-gray-600" />
                    <h3 className="font-medium text-gray-900">{t.settings.system.autoBackup}</h3>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{t.settings.system.autoBackupDesc}</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.system.autoBackup}
                    onChange={(e) => updateSettings('system', 'autoBackup', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              {/* Session Timeout */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.settings.system.sessionTimeout}
                </label>
                <p className="text-sm text-gray-600 mb-3">{t.settings.system.sessionTimeoutDesc}</p>
                <input
                  type="number"
                  min="5"
                  max="120"
                  value={settings.system.sessionTimeout}
                  onChange={(e) => updateSettings('system', 'sessionTimeout', parseInt(e.target.value))}
                  className="w-full max-w-xs px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Save Button */}
      <div className="flex items-center justify-end gap-4">
        {saved && (
          <div className="flex items-center gap-2 text-green-600">
            <Check className="w-5 h-5" />
            <span className="font-medium">{t.settings.buttons.saved}</span>
          </div>
        )}
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          <Save className="w-5 h-5" />
          {t.settings.buttons.save}
        </button>
      </div>
    </div>
  );
}
