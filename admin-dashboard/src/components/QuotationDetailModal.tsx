import { useState } from 'react';
import {
  X,
  User,
  Building2,
  CreditCard,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Package,
  DollarSign,
  Calendar,
  FileText,
} from 'lucide-react';
import { Quotation, quotationService } from '../services/quotationService';
import QuotationStatusBadge from './QuotationStatusBadge';
import { useLanguage } from '../contexts/LanguageContext';

interface QuotationDetailModalProps {
  quotation: Quotation;
  onClose: () => void;
  onUpdate: () => void;
}

export default function QuotationDetailModal({
  quotation,
  onClose,
  onUpdate,
}: QuotationDetailModalProps) {
  const { t } = useLanguage();
  const [isApproving, setIsApproving] = useState(false);
  const [isDeclining, setIsDeclining] = useState(false);
  const [showDeclineForm, setShowDeclineForm] = useState(false);
  const [declineReason, setDeclineReason] = useState('');
  const [error, setError] = useState('');

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
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getCreditAlert = () => {
    const limit = quotation.user.financialLimit || 0;
    const outstanding = quotation.user.currentOutstanding || 0;
    const newOutstanding = quotation.anticipatedOutstanding;

    if (limit === 0) {
      return {
        type: 'warning' as const,
        message: 'No credit limit set for this customer',
      };
    }

    if (newOutstanding > limit) {
      const overAmount = newOutstanding - limit;
      return {
        type: 'danger' as const,
        message: t.quotations.creditLimitExceeded.replace('{amount}', formatCurrency(overAmount)),
        details: {
          limit,
          outstanding,
          newOutstanding,
          overAmount,
        },
      };
    }

    const availableAfter = limit - newOutstanding;
    return {
      type: 'success' as const,
      message: t.quotations.withinCreditLimit.replace('{amount}', formatCurrency(availableAfter)),
      details: {
        limit,
        outstanding,
        newOutstanding,
        availableAfter,
      },
    };
  };

  const handleApprove = async () => {
    if (!confirm(t.quotations.confirmApprove)) {
      return;
    }

    setIsApproving(true);
    setError('');

    try {
      await quotationService.approve(quotation.id);
      alert(t.quotations.approved);
      onUpdate();
    } catch (err: any) {
      setError(err.message || t.quotations.approveFailed);
    } finally {
      setIsApproving(false);
    }
  };

  const handleDecline = async () => {
    if (!declineReason.trim()) {
      setError(t.quotations.declineReasonRequired);
      return;
    }

    setIsDeclining(true);
    setError('');

    try {
      await quotationService.decline(quotation.id, declineReason);
      alert(t.quotations.declined);
      onUpdate();
    } catch (err: any) {
      setError(err.message || t.quotations.declineFailed);
    } finally {
      setIsDeclining(false);
    }
  };

  const creditAlert = getCreditAlert();
  const canApprove = quotation.status === 'PENDING_APPROVAL';
  const canDecline = quotation.status === 'PENDING_APPROVAL';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">{quotation.quotationNumber}</h2>
            <p className="text-blue-100 text-sm mt-1">
              {t.quotations.created} {formatDate(quotation.createdAt)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Status */}
          <div className="flex items-center justify-between">
            <QuotationStatusBadge status={quotation.status} size="lg" />
            {quotation.convertedOrder && (
              <div className="text-sm text-gray-600">
                {t.quotations.convertedToOrder} {quotation.convertedOrder.orderNumber}
              </div>
            )}
          </div>

          {/* Credit Alert */}
          {creditAlert && (
            <div
              className={`border rounded-lg p-4 ${
                creditAlert.type === 'danger'
                  ? 'bg-red-50 border-red-200'
                  : creditAlert.type === 'warning'
                  ? 'bg-yellow-50 border-yellow-200'
                  : 'bg-green-50 border-green-200'
              }`}
            >
              <div className="flex items-start gap-3">
                {creditAlert.type === 'danger' ? (
                  <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                ) : creditAlert.type === 'warning' ? (
                  <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                ) : (
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                )}
                <div className="flex-1">
                  <p
                    className={`font-medium ${
                      creditAlert.type === 'danger'
                        ? 'text-red-900'
                        : creditAlert.type === 'warning'
                        ? 'text-yellow-900'
                        : 'text-green-900'
                    }`}
                  >
                    {creditAlert.message}
                  </p>
                  {creditAlert.details && (
                    <div className="mt-2 text-sm space-y-1">
                      <div className="flex justify-between">
                        <span className={creditAlert.type === 'danger' ? 'text-red-700' : 'text-green-700'}>
                          {t.quotations.creditLimit}:
                        </span>
                        <span className="font-medium">{formatCurrency(creditAlert.details.limit)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className={creditAlert.type === 'danger' ? 'text-red-700' : 'text-green-700'}>
                          {t.quotations.currentOutstanding}:
                        </span>
                        <span className="font-medium">{formatCurrency(creditAlert.details.outstanding)}</span>
                      </div>
                      <div className="flex justify-between font-bold">
                        <span className={creditAlert.type === 'danger' ? 'text-red-700' : 'text-green-700'}>
                          {t.quotations.newOutstanding}:
                        </span>
                        <span>{formatCurrency(creditAlert.details.newOutstanding)}</span>
                      </div>
                      {creditAlert.details.overAmount && (
                        <div className="flex justify-between text-red-700 font-bold">
                          <span>{t.quotations.overLimitBy}:</span>
                          <span>{formatCurrency(creditAlert.details.overAmount)}</span>
                        </div>
                      )}
                      {creditAlert.details.availableAfter !== undefined && (
                        <div className="flex justify-between text-green-700 font-bold">
                          <span>{t.quotations.availableAfter}:</span>
                          <span>{formatCurrency(creditAlert.details.availableAfter)}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Customer Information */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <User className="w-5 h-5 text-blue-600" />
              {t.quotations.customerInformation}
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <label className="text-gray-600">{t.customers.name}</label>
                <p className="font-medium text-gray-900">
                  {quotation.user.firstName} {quotation.user.lastName}
                </p>
              </div>
              <div>
                <label className="text-gray-600">{t.customers.email}</label>
                <p className="font-medium text-gray-900">{quotation.user.email}</p>
              </div>
              {quotation.user.companyName && (
                <div>
                  <label className="text-gray-600 flex items-center gap-1">
                    <Building2 className="w-4 h-4" />
                    {t.customers.company}
                  </label>
                  <p className="font-medium text-gray-900">{quotation.user.companyName}</p>
                </div>
              )}
              {quotation.user.paymentTerm && (
                <div>
                  <label className="text-gray-600 flex items-center gap-1">
                    <CreditCard className="w-4 h-4" />
                    {t.customers.paymentTerms}
                  </label>
                  <p className="font-medium text-gray-900">
                    {quotation.user.paymentTerm.replace('_', ' ')}
                  </p>
                </div>
              )}
              {quotation.user.accountStatus && (
                <div>
                  <label className="text-gray-600">{t.quotations.accountStatus}</label>
                  <p className="font-medium text-gray-900">
                    {quotation.user.accountStatus.replace(/_/g, ' ')}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Quotation Items */}
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <Package className="w-5 h-5 text-blue-600" />
                {t.quotations.items} ({quotation.items.length})
              </h3>
            </div>
            <div className="divide-y divide-gray-200">
              {quotation.items.map((item) => (
                <div key={item.id} className="px-4 py-3 flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{item.productName}</p>
                    <p className="text-sm text-gray-500">{t.quotations.sku}: {item.productSku}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">
                      {item.quantity} × {formatCurrency(item.unitPrice)}
                    </p>
                    <p className="font-medium text-gray-900">{formatCurrency(item.totalPrice)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Financial Summary */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-blue-600" />
              {t.quotations.financialSummary}
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">{t.quotations.subtotal}:</span>
                <span className="font-medium text-gray-900">{formatCurrency(quotation.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">{t.quotations.tax} (19%):</span>
                <span className="font-medium text-gray-900">{formatCurrency(quotation.taxAmount)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold pt-2 border-t border-blue-200">
                <span className="text-gray-700 font-semibold">{t.common.total}:</span>
                <span className="text-blue-600">{formatCurrency(quotation.totalAmount)}</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          {quotation.notes && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                Customer Notes
              </h3>
              <p className="text-gray-700 text-sm">{quotation.notes}</p>
            </div>
          )}

          {/* Admin Notes (if declined) */}
          {quotation.adminNotes && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h3 className="font-semibold text-red-900 mb-2 flex items-center gap-2">
                <XCircle className="w-5 h-5 text-red-600" />
                Decline Reason
              </h3>
              <p className="text-red-700 text-sm">{quotation.adminNotes}</p>
              {quotation.reviewer && (
                <p className="text-xs text-red-600 mt-2">
                  Declined by {quotation.reviewer.firstName} {quotation.reviewer.lastName} on{' '}
                  {quotation.reviewedAt && formatDate(quotation.reviewedAt)}
                </p>
              )}
            </div>
          )}

          {/* Decline Form */}
          {showDeclineForm && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="font-semibold text-yellow-900 mb-3">Decline Quotation</h3>
              <textarea
                value={declineReason}
                onChange={(e) => setDeclineReason(e.target.value)}
                placeholder="Enter reason for declining (required)..."
                rows={4}
                className="w-full px-3 py-2 border border-yellow-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              />
              <div className="flex gap-2 mt-3">
                <button
                  onClick={handleDecline}
                  disabled={isDeclining || !declineReason.trim()}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isDeclining ? 'Declining...' : 'Confirm Decline'}
                </button>
                <button
                  onClick={() => {
                    setShowDeclineForm(false);
                    setDeclineReason('');
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {(canApprove || canDecline) && !showDeclineForm && (
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              <Calendar className="w-4 h-4 inline mr-1" />
              Review this quotation carefully before making a decision
            </div>
            <div className="flex gap-3">
              {canDecline && (
                <button
                  onClick={() => setShowDeclineForm(true)}
                  disabled={isDeclining}
                  className="px-6 py-2 border border-red-300 bg-white text-red-700 rounded-lg hover:bg-red-50 font-medium transition-colors disabled:opacity-50"
                >
                  <XCircle className="w-4 h-4 inline mr-2" />
                  Decline Quotation
                </button>
              )}
              {canApprove && (
                <button
                  onClick={handleApprove}
                  disabled={isApproving}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors disabled:opacity-50"
                >
                  <CheckCircle className="w-4 h-4 inline mr-2" />
                  {isApproving ? 'Approving...' : 'Approve & Create Order'}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
