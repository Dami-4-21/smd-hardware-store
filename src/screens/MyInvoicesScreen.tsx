import { useState, useEffect } from 'react';
import { ArrowLeft, FileText, Calendar, DollarSign, AlertCircle, CheckCircle } from 'lucide-react';
import { invoiceService, Invoice } from '../services/invoiceService';

interface MyInvoicesScreenProps {
  onBack?: () => void;
}

export default function MyInvoicesScreen({ onBack }: MyInvoicesScreenProps) {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await invoiceService.getMyInvoices();
      setInvoices(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load invoices');
    } finally {
      setLoading(false);
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
      month: 'long',
      day: 'numeric',
    });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { bg: string; text: string; icon: any }> = {
      DRAFT: { bg: 'bg-gray-100', text: 'text-gray-700', icon: FileText },
      ISSUED: { bg: 'bg-blue-100', text: 'text-blue-700', icon: AlertCircle },
      PAID: { bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle },
      OVERDUE: { bg: 'bg-red-100', text: 'text-red-700', icon: AlertCircle },
      CANCELLED: { bg: 'bg-gray-100', text: 'text-gray-700', icon: AlertCircle },
    };

    const config = statusConfig[status] || statusConfig.ISSUED;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${config.bg} ${config.text}`}>
        <Icon className="w-4 h-4" />
        {status}
      </span>
    );
  };

  const isOverdue = (invoice: Invoice) => {
    if (!invoice.dueDate || invoice.status === 'PAID') return false;
    return new Date(invoice.dueDate) < new Date();
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            {onBack && (
              <button
                onClick={onBack}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-6 h-6 text-gray-600" />
              </button>
            )}
            <div>
              <h1 className="text-2xl font-bold text-gray-900">My Invoices</h1>
              <p className="text-sm text-gray-600">View and manage your invoices</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading invoices...</p>
          </div>
        ) : invoices.length === 0 ? (
          /* Empty State */
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Invoices Yet</h3>
            <p className="text-gray-600 mb-6">
              Invoices will appear here once your orders are shipped or delivered.
            </p>
            {onBack && (
              <button
                onClick={onBack}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Back to Account
              </button>
            )}
          </div>
        ) : (
          /* Invoices List */
          <div className="space-y-4">
            {invoices.map((invoice) => (
              <div
                key={invoice.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setSelectedInvoice(invoice)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{invoice.invoiceNumber}</h3>
                    <p className="text-sm text-gray-600">
                      Issued: {formatDate(invoice.issuedDate)}
                    </p>
                  </div>
                  {getStatusBadge(invoice.status)}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-600">Total Amount</p>
                      <p className="font-semibold text-gray-900">{formatCurrency(invoice.totalAmount)}</p>
                    </div>
                  </div>

                  {invoice.dueDate && (
                    <div className="flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-xs text-gray-600">Due Date</p>
                        <p className={`font-semibold ${isOverdue(invoice) ? 'text-red-600' : 'text-gray-900'}`}>
                          {formatDate(invoice.dueDate)}
                        </p>
                      </div>
                    </div>
                  )}

                  {invoice.paymentTerm && (
                    <div className="flex items-center gap-2">
                      <FileText className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-xs text-gray-600">Payment Terms</p>
                        <p className="font-semibold text-gray-900">{invoice.paymentTerm.replace('_', ' ')}</p>
                      </div>
                    </div>
                  )}
                </div>

                {isOverdue(invoice) && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                    <p className="text-sm text-red-700 font-medium">This invoice is overdue</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Invoice Detail Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">{selectedInvoice.invoiceNumber}</h2>
                <p className="text-blue-100 text-sm">Invoice Details</p>
              </div>
              <button
                onClick={() => setSelectedInvoice(null)}
                className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Status */}
              <div className="flex items-center justify-between">
                {getStatusBadge(selectedInvoice.status)}
                {isOverdue(selectedInvoice) && (
                  <span className="text-sm text-red-600 font-medium">Overdue</span>
                )}
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-600">Issued Date</label>
                  <p className="font-medium text-gray-900">{formatDate(selectedInvoice.issuedDate)}</p>
                </div>
                {selectedInvoice.dueDate && (
                  <div>
                    <label className="text-sm text-gray-600">Due Date</label>
                    <p className={`font-medium ${isOverdue(selectedInvoice) ? 'text-red-600' : 'text-gray-900'}`}>
                      {formatDate(selectedInvoice.dueDate)}
                    </p>
                  </div>
                )}
              </div>

              {/* Financial Summary */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-blue-600" />
                  Financial Summary
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-medium text-gray-900">{formatCurrency(selectedInvoice.subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax (19%):</span>
                    <span className="font-medium text-gray-900">{formatCurrency(selectedInvoice.taxAmount)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold pt-2 border-t border-blue-200">
                    <span className="text-gray-900">Total:</span>
                    <span className="text-blue-600">{formatCurrency(selectedInvoice.totalAmount)}</span>
                  </div>
                </div>
              </div>

              {/* Payment Info */}
              {selectedInvoice.paymentTerm && (
                <div>
                  <label className="text-sm text-gray-600">Payment Terms</label>
                  <p className="font-medium text-gray-900">{selectedInvoice.paymentTerm.replace('_', ' ')}</p>
                </div>
              )}

              {selectedInvoice.paidDate && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="font-semibold text-green-900">Payment Received</span>
                  </div>
                  <p className="text-sm text-green-700">
                    Paid on {formatDate(selectedInvoice.paidDate)}
                    {selectedInvoice.paidAmount && ` - Amount: ${formatCurrency(selectedInvoice.paidAmount)}`}
                  </p>
                </div>
              )}

              {/* Notes */}
              {selectedInvoice.notes && (
                <div>
                  <label className="text-sm text-gray-600">Notes</label>
                  <p className="text-gray-700 text-sm mt-1">{selectedInvoice.notes}</p>
                </div>
              )}
            </div>

            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
              <button
                onClick={() => setSelectedInvoice(null)}
                className="w-full px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
