import { useState, useEffect } from 'react';
import { ArrowLeft, FileText, Clock, CheckCircle, XCircle, Eye, AlertCircle } from 'lucide-react';
import { quotationService, Quotation } from '../services/quotationService';
import { useAuth } from '../context/AuthContext';

interface MyQuotationsScreenProps {
  onBack: () => void;
}

export default function MyQuotationsScreen({ onBack }: MyQuotationsScreenProps) {
  const { user } = useAuth();
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedQuotation, setSelectedQuotation] = useState<Quotation | null>(null);

  useEffect(() => {
    loadQuotations();
  }, []);

  const loadQuotations = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await quotationService.getMyQuotations();
      setQuotations(data);
    } catch (err: any) {
      setError(err.message || 'Échec du chargement des devis');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING_APPROVAL':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'APPROVED':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'DECLINED':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <FileText className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING_APPROVAL':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'APPROVED':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'DECLINED':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING_APPROVAL':
        return 'En attente d\'approbation';
      case 'APPROVED':
        return 'Approuvé';
      case 'DECLINED':
        return 'Refusé';
      default:
        return status;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-4 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex-1">
              <h1 className="text-xl font-semibold text-gray-900">Mes Devis</h1>
              <p className="text-sm text-gray-600">Consultez et suivez vos demandes de devis</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-6">
        {/* Financial Summary for B2B */}
        {user?.customerType === 'B2B' && user.financialLimit && (
          <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Récapitulatif financier</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-600 font-medium mb-1">Limite de crédit</p>
                <p className="text-xl font-bold text-blue-900">
                  {formatCurrency(user.financialLimit)}
                </p>
              </div>
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                <p className="text-sm text-orange-600 font-medium mb-1">Encours</p>
                <p className="text-xl font-bold text-orange-900">
                  {formatCurrency(user.outstandingBalance || 0)}
                </p>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 col-span-2">
                <p className="text-sm text-green-600 font-medium mb-1">Crédit disponible</p>
                <p className="text-xl font-bold text-green-900">
                  {formatCurrency(user.financialLimit - (user.outstandingBalance || 0))}
                </p>
              </div>
            </div>
            {user.accountStatus && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Statut du compte:</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    user.accountStatus === 'ACTIVE' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {user.accountStatus}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Chargement des devis...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-medium text-red-900">Erreur de chargement des devis</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
              <button
                onClick={loadQuotations}
                className="mt-3 text-sm text-red-600 hover:text-red-700 font-medium"
              >
                Réessayer
              </button>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && quotations.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucun devis pour le moment</h3>
            <p className="text-gray-600 mb-6">
              Vous n'avez soumis aucun devis. Commencez vos achats pour créer votre premier devis!
            </p>
            <button
              onClick={onBack}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Commencer mes achats
            </button>
          </div>
        )}

        {/* Quotations List */}
        {!loading && !error && quotations.length > 0 && (
          <div className="space-y-4">
            {quotations.map((quotation) => (
              <div
                key={quotation.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
              >
                <div className="p-4">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(quotation.status)}
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {quotation.quotationNumber}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {formatDate(quotation.createdAt)}
                        </p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(quotation.status)}`}>
                      {getStatusText(quotation.status)}
                    </span>
                  </div>

                  {/* Details */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Articles</p>
                      <p className="font-medium text-gray-900">
                        {quotation.items?.length || 0} articles
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Montant total</p>
                      <p className="font-medium text-gray-900">
                        {formatCurrency(quotation.totalAmount)}
                      </p>
                    </div>
                  </div>

                  {/* Action Button */}
                  <button
                    onClick={() => setSelectedQuotation(quotation)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                    Voir les détails
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quotation Detail Modal */}
      {selectedQuotation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">{selectedQuotation.quotationNumber}</h2>
                <p className="text-blue-100 text-sm">{formatDate(selectedQuotation.createdAt)}</p>
              </div>
              <button
                onClick={() => setSelectedQuotation(null)}
                className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Status */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <span className="text-gray-700 font-medium">Statut:</span>
                <span className={`px-4 py-2 rounded-full text-sm font-medium border ${getStatusColor(selectedQuotation.status)}`}>
                  {getStatusText(selectedQuotation.status)}
                </span>
              </div>

              {/* Items */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Articles</h3>
                <div className="space-y-2">
                  {selectedQuotation.items.map((item, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{item.productName || 'Product'}</p>
                        <p className="text-sm text-gray-600">Quantité: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">{formatCurrency(item.totalPrice)}</p>
                        <p className="text-sm text-gray-600">{formatCurrency(item.unitPrice)} l'unité</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totals */}
              <div className="border-t border-gray-200 pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Sous-total</span>
                  <span className="text-gray-900">{formatCurrency(selectedQuotation.subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">TVA (19%)</span>
                  <span className="text-gray-900">{formatCurrency(selectedQuotation.taxAmount)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-200">
                  <span>Total</span>
                  <span className="text-blue-600">{formatCurrency(selectedQuotation.totalAmount)}</span>
                </div>
              </div>

              {/* Notes */}
              {selectedQuotation.notes && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Notes</h4>
                  <p className="text-sm text-gray-700">{selectedQuotation.notes}</p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="border-t border-gray-200 bg-gray-50 px-6 py-4">
              <button
                onClick={() => setSelectedQuotation(null)}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
