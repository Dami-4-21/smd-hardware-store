import { useState, useEffect } from 'react';
import { UserPlus, Search, X } from 'lucide-react';
import { customerService, Customer } from '../services/customerService';
import CustomerForm from '../components/CustomerForm';
import CustomerList from '../components/CustomerList';
import CredentialsModal from '../components/CredentialsModal';
import CustomerDetailView from '../components/CustomerDetailView';
import { useLanguage } from '../contexts/LanguageContext';

export default function CustomersPage() {
  const { t } = useLanguage();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterActive, setFilterActive] = useState<boolean | undefined>(undefined);
  const [credentials, setCredentials] = useState<any>(null);
  const [customerName, setCustomerName] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [loadingCustomer, setLoadingCustomer] = useState(false);

  useEffect(() => {
    loadCustomers();
  }, [page, searchTerm, filterType, filterActive]);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      const response = await customerService.getAll({
        page,
        limit: 20,
        search: searchTerm || undefined,
        customerType: filterType || undefined,
        isActive: filterActive,
      });
      setCustomers(response.customers);
      setTotalPages(response.pagination.totalPages);
    } catch (error: any) {
      console.error('Failed to load customers:', error);
      alert('Failed to load customers: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSuccess = (data: any) => {
    setShowForm(false);
    setCredentials(data.credentials);
    setCustomerName(`${data.customer.firstName} ${data.customer.lastName}`);
    loadCustomers();
  };

  const handleDelete = async (customer: Customer) => {
    if (!confirm(`Are you sure you want to delete ${customer.firstName} ${customer.lastName}?\n\nThis action cannot be undone.`)) {
      return;
    }

    try {
      await customerService.delete(customer.id);
      alert('Customer deleted successfully');
      loadCustomers();
    } catch (error: any) {
      alert('Failed to delete customer: ' + error.message);
    }
  };

  const handleView = async (customer: Customer) => {
    try {
      setLoadingCustomer(true);
      const fullCustomer = await customerService.getById(customer.id);
      setSelectedCustomer(fullCustomer);
    } catch (error: any) {
      alert('Failed to load customer details: ' + error.message);
    } finally {
      setLoadingCustomer(false);
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilterType('');
    setFilterActive(undefined);
    setPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customer Management</h1>
          <p className="text-gray-600 mt-1">Manage customer accounts and commercial registrations</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <UserPlus className="w-5 h-5 mr-2" />
          Create Customer
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name, email, company, or RNE..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Customer Type Filter */}
          <div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Types</option>
              <option value="Retailer">Retailer</option>
              <option value="Wholesaler">Wholesaler</option>
              <option value="Contractor">Contractor</option>
              <option value="Industrial">Industrial</option>
              <option value="Individual">Individual</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center space-x-2">
            <select
              value={filterActive === undefined ? '' : filterActive ? 'active' : 'inactive'}
              onChange={(e) => setFilterActive(e.target.value === '' ? undefined : e.target.value === 'active')}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            {(searchTerm || filterType || filterActive !== undefined) && (
              <button
                onClick={clearFilters}
                className="px-3 py-2 text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50"
                title="Clear filters"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Customer List */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <CustomerList
          customers={customers}
          onView={handleView}
          onDelete={handleDelete}
          loading={loading}
        />
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center space-x-2">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <span className="text-gray-600">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}

      {/* Create Customer Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">{t.customers.createNew}</h2>
              <button
                onClick={() => setShowForm(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6">
              <CustomerForm
                onSuccess={handleCreateSuccess}
                onCancel={() => setShowForm(false)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Credentials Modal */}
      {credentials && (
        <CredentialsModal
          credentials={credentials}
          customerName={customerName}
          onClose={() => setCredentials(null)}
        />
      )}

      {/* Customer Detail View */}
      {selectedCustomer && (
        <CustomerDetailView
          customer={selectedCustomer}
          onClose={() => setSelectedCustomer(null)}
          onUpdate={loadCustomers}
        />
      )}

      {/* Loading Overlay */}
      {loadingCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-700">Loading customer details...</p>
          </div>
        </div>
      )}
    </div>
  );
}
