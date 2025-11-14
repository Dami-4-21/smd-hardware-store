import { useState, useEffect } from 'react';
import { Search, Filter, Eye, AlertTriangle, TrendingUp, Trash2 } from 'lucide-react';
import { quotationService, Quotation } from '../services/quotationService';
import QuotationStatusBadge from '../components/QuotationStatusBadge';
import QuotationDetailModal from '../components/QuotationDetailModal';

export default function QuotationManagement() {
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedQuotation, setSelectedQuotation] = useState<Quotation | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchQuotations = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await quotationService.getAll({
        page: currentPage,
        limit: 20,
        status: statusFilter || undefined,
        search: searchQuery || undefined,
      });
      setQuotations(response.quotations || []);
      setTotalPages(response.pagination?.totalPages || 1);
    } catch (err: any) {
      setError(err.message || 'Failed to load quotations');
      setQuotations([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotations();
  }, [currentPage, statusFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchQuotations();
  };

  const handleViewDetails = (quotation: Quotation) => {
    setSelectedQuotation(quotation);
    setShowDetailModal(true);
  };

  const handleCloseModal = () => {
    setShowDetailModal(false);
    setSelectedQuotation(null);
  };

  const handleQuotationUpdated = () => {
    fetchQuotations();
    handleCloseModal();
  };

  const handleDeleteQuotation = async (quotation: Quotation) => {
    if (!confirm(`Are you sure you want to delete quotation ${quotation.quotationNumber}?\n\nThis action cannot be undone.`)) {
      return;
    }

    try {
      await quotationService.delete(quotation.id);
      // Refresh the list
      fetchQuotations();
    } catch (err: any) {
      alert(err.message || 'Failed to delete quotation');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-TN', {
      style: 'currency',
      currency: 'TND',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getCreditAlert = (quotation: Quotation) => {
    const limit = quotation.user.financialLimit || 0;
    const newOutstanding = quotation.anticipatedOutstanding;

    if (limit === 0) return null;
    if (newOutstanding <= limit) return null;

    const overAmount = newOutstanding - limit;
    return {
      type: 'danger' as const,
      message: `Exceeds credit limit by ${formatCurrency(overAmount)}`,
    };
  };

  // Statistics
  const stats = {
    pending: quotations?.filter(q => q.status === 'PENDING_APPROVAL').length || 0,
    total: quotations?.length || 0,
    totalValue: quotations?.reduce((sum, q) => sum + (Number(q.totalAmount) || 0), 0) || 0,
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Quotation Management</h1>
        <p className="text-gray-600">Review and approve customer quotations</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-yellow-800">Pending Approval</p>
              <p className="text-3xl font-bold text-yellow-900 mt-1">{stats.pending}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-200 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-yellow-700" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-800">Total Quotations</p>
              <p className="text-3xl font-bold text-blue-900 mt-1">{stats.total}</p>
            </div>
            <div className="w-12 h-12 bg-blue-200 rounded-full flex items-center justify-center">
              <Eye className="w-6 h-6 text-blue-700" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-800">Total Value</p>
              <p className="text-2xl font-bold text-green-900 mt-1">{formatCurrency(stats.totalValue)}</p>
            </div>
            <div className="w-12 h-12 bg-green-200 rounded-full flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-700" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <form onSubmit={handleSearch} className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by quotation number, customer name, or email..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </form>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
            >
              <option value="">All Statuses</option>
              <option value="PENDING_APPROVAL">Pending Approval</option>
              <option value="APPROVED">Approved</option>
              <option value="DECLINED">Declined</option>
              <option value="CONVERTED_TO_ORDER">Converted to Order</option>
              <option value="DRAFT">Draft</option>
              <option value="EXPIRED">Expired</option>
            </select>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Quotations Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading quotations...</p>
          </div>
        ) : !quotations || quotations.length === 0 ? (
          <div className="p-12 text-center">
            <Eye className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No quotations found</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quotation #
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Alert
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {quotations.map((quotation) => {
                    const alert = getCreditAlert(quotation);
                    return (
                      <tr key={quotation.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {quotation.quotationNumber}
                          </div>
                          <div className="text-xs text-gray-500">
                            {quotation.items.length} item{quotation.items.length !== 1 ? 's' : ''}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">
                            {quotation.user.firstName} {quotation.user.lastName}
                          </div>
                          <div className="text-xs text-gray-500">{quotation.user.companyName}</div>
                          <div className="text-xs text-gray-500">{quotation.user.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-bold text-gray-900">
                            {formatCurrency(quotation.totalAmount)}
                          </div>
                          <div className="text-xs text-gray-500">
                            Tax: {formatCurrency(quotation.taxAmount)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <QuotationStatusBadge status={quotation.status} size="sm" />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(quotation.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {alert && (
                            <div className="flex items-center gap-1 text-xs text-red-700 bg-red-50 px-2 py-1 rounded">
                              <AlertTriangle className="w-3 h-3" />
                              <span className="font-medium">Over Limit</span>
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end gap-3">
                            <button
                              onClick={() => handleViewDetails(quotation)}
                              className="text-blue-600 hover:text-blue-900 font-medium"
                            >
                              View Details
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteQuotation(quotation);
                              }}
                              className="text-red-600 hover:text-red-900 p-2 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete quotation"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Page {currentPage} of {totalPages}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedQuotation && (
        <QuotationDetailModal
          quotation={selectedQuotation}
          onClose={handleCloseModal}
          onUpdate={handleQuotationUpdated}
        />
      )}
    </div>
  );
}
