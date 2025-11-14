import { useState } from 'react';
import { Upload, X, Eye, EyeOff } from 'lucide-react';
import { CreateCustomerData, customerService } from '../services/customerService';
import { useLanguage } from '../contexts/LanguageContext';

interface CustomerFormProps {
  onSuccess: (data: { customer: any; credentials: any }) => void;
  onCancel: () => void;
}

const CUSTOMER_TYPES = [
  'Retailer',
  'Wholesaler',
  'Contractor',
  'Industrial',
  'Individual',
  'Other',
];

const PAYMENT_METHODS = [
  { value: 'COD', label: 'Cash on Delivery' },
  { value: 'CHEQUE', label: 'Cheque on Delivery' },
  { value: 'NET_TERMS', label: 'Payment on Due Date (Net Terms)' },
];

const PAYMENT_TERMS = [
  { value: 'NET_30', label: 'NET 30 (30 days)' },
  { value: 'NET_60', label: 'NET 60 (60 days)' },
  { value: 'NET_90', label: 'NET 90 (90 days)' },
  { value: 'NET_120', label: 'NET 120 (120 days)' },
];

const ACCOUNT_STATUSES = [
  { value: 'COMMERCIAL_IN_PROCESS', label: 'Commercial In-Process' },
  { value: 'FINANCIAL_IN_PROCESS', label: 'Financial In-Process' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'SUSPENDED', label: 'Suspended' },
  { value: 'FINANCIAL_NON_CURRENT', label: 'Financial Non-Current' },
];

export default function CustomerForm({ onSuccess, onCancel }: CustomerFormProps) {
  const { t } = useLanguage();
  const [formData, setFormData] = useState<CreateCustomerData>({
    email: '',
    username: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: '',
    companyName: '',
    rneNumber: '',
    taxId: '',
    customerType: '',
    // B2B Financial Fields
    paymentMethod: 'COD',
    paymentTerm: undefined,
    financialLimit: 0,
    accountStatus: 'COMMERCIAL_IN_PROCESS',
    address: {
      street: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'Tunisia',
    },
  });

  const [rnePdfFile, setRnePdfFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [autoGeneratePassword, setAutoGeneratePassword] = useState(true);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name.startsWith('address.')) {
      const addressField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        address: {
          ...prev.address!,
          [addressField]: value,
        },
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (file.type !== 'application/pdf') {
      setError('Please upload a PDF file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB');
      return;
    }

    setRnePdfFile(file);
    setError('');
  };

  const removeFile = () => {
    setRnePdfFile(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let rnePdfUrl = '';

      // Upload RNE PDF if provided
      if (rnePdfFile) {
        setUploading(true);
        rnePdfUrl = await customerService.uploadRnePdf(rnePdfFile);
        setUploading(false);
      }

      // Prepare customer data
      const customerData: CreateCustomerData = {
        ...formData,
        rnePdfUrl: rnePdfUrl || undefined,
        password: autoGeneratePassword ? undefined : formData.password,
      };

      // Remove empty address if not filled
      if (!customerData.address?.street) {
        delete customerData.address;
      }

      // Create customer
      const result = await customerService.create(customerData);
      onSuccess(result);
    } catch (err: any) {
      setError(err.message || 'Failed to create customer');
    } finally {
      setLoading(false);
      setUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Personal Information */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="font-semibold text-gray-900 mb-4">{t.customers.personalInfo}</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t.customers.firstName} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t.customers.lastName} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t.customers.email} <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t.customers.phone}
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Company Information */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="font-semibold text-gray-900 mb-4">{t.customers.companyInfo}</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t.customers.companyName} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="companyName"
              value={formData.companyName}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t.customers.rneNumber} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="rneNumber"
              value={formData.rneNumber}
              onChange={handleChange}
              required
              placeholder={t.customers.commercialRegistration}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t.customers.taxId}
            </label>
            <input
              type="text"
              name="taxId"
              value={formData.taxId}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t.customers.customerType}
            </label>
            <select
              name="customerType"
              value={formData.customerType}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">{t.customers.selectType}</option>
              {CUSTOMER_TYPES.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">{t.customers.uploadRne}</label>
            <div className="mt-1">
              {!rnePdfFile ? (
                <label className="flex items-center justify-center w-full px-4 py-6 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 transition-colors">
                  <div className="text-center">
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">{t.customers.clickToUpload}</p>
                    <p className="text-xs text-gray-500 mt-1">{t.customers.pdfUpTo}</p>
                  </div>
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              ) : (
                <div className="flex items-center justify-between px-4 py-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <span className="text-sm text-blue-900">{rnePdfFile.name}</span>
                  <button
                    type="button"
                    onClick={removeFile}
                    className="text-red-600 hover:text-red-800"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Financial Settings (B2B) */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
        <h3 className="font-semibold text-gray-900 mb-1 flex items-center">
          💰 {t.customers.financialSettings}
        </h3>
        <p className="text-sm text-gray-600 mb-4">{t.customers.configurePayment}</p>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t.customers.paymentMethod} <span className="text-red-500">*</span>
            </label>
            <select
              name="paymentMethod"
              value={formData.paymentMethod}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
            >
              {PAYMENT_METHODS.map(method => (
                <option key={method.value} value={method.value}>
                  {method.label}
                </option>
              ))}
            </select>
          </div>

          {formData.paymentMethod === 'NET_TERMS' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t.customers.paymentTerms}
              </label>
              <select
                name="paymentTerm"
                value={formData.paymentTerm || ''}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              >
                <option value="">{t.customers.selectPaymentTerms}</option>
                {PAYMENT_TERMS.map(term => (
                  <option key={term.value} value={term.value}>
                    {term.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className={formData.paymentMethod === 'NET_TERMS' ? '' : 'col-span-2'}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t.customers.creditLimit}
            </label>
            <input
              type="number"
              name="financialLimit"
              value={formData.financialLimit}
              onChange={handleChange}
              min="0"
              step="100"
              placeholder="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">{t.customers.maxOutstanding}</p>
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t.customers.accountStatus} <span className="text-red-500">*</span>
            </label>
            <select
              name="accountStatus"
              value={formData.accountStatus}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
            >
              {ACCOUNT_STATUSES.map(status => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              • <strong>{t.customers.commercialInProcess}:</strong> {t.customers.defaultForNew}<br/>
              • <strong>{t.customers.financialInProcess}:</strong> {t.customers.underFinancialReview}<br/>
              • <strong>{t.customers.active}:</strong> {t.customers.canSubmitQuotations}<br/>
              • <strong>{t.customers.suspended}:</strong> {t.customers.accountTemporarilyDisabled}<br/>
              • <strong>{t.customers.financialNonCurrent}:</strong> {t.customers.paymentIssuesDetected}
            </p>
          </div>

          <div className="col-span-2 bg-blue-100 border border-blue-300 rounded-lg p-3">
            <p className="text-sm text-blue-700"><strong>📝 {t.customers.noteOutstanding}:</strong> {t.customers.outstandingNote}</p>
          </div>
        </div>
      </div>

      {/* Login Credentials */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="font-semibold text-gray-900 mb-4">{t.customers.loginCredentials}</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t.customers.username}
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder={t.customers.leaveEmpty}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">{t.customers.usernameGenerated}</p>
          </div>
          <div>
            <label className="flex items-center space-x-2 mb-2">
              <input
                type="checkbox"
                checked={autoGeneratePassword}
                onChange={(e) => setAutoGeneratePassword(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm">{t.customers.autoGeneratePassword}</span>
            </label>
            {!autoGeneratePassword && (
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder={t.customers.enterPassword}
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Address (Optional) */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="font-semibold text-gray-900 mb-4">{t.customers.addressOptional}</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t.customers.street}
            </label>
            <input
              type="text"
              name="address.street"
              value={formData.address?.street}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t.customers.city}
            </label>
            <input
              type="text"
              name="address.city"
              value={formData.address?.city}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t.customers.stateRegion}
            </label>
            <input
              type="text"
              name="address.state"
              value={formData.address?.state}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t.customers.postalCode}
            </label>
            <input
              type="text"
              name="address.postalCode"
              value={formData.address?.postalCode}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t.customers.country}
            </label>
            <input
              type="text"
              name="address.country"
              value={formData.address?.country}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-3 pt-4 border-t">
        <button
          type="button"
          onClick={onCancel}
          disabled={loading || uploading}
          className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          {t.common.cancel}
        </button>
        <button
          type="submit"
          disabled={loading || uploading}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {uploading ? 'Uploading...' : loading ? `${t.common.loading}` : t.customers.createCustomer}
        </button>
      </div>
    </form>
  );
}
