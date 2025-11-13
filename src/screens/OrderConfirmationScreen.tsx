import { CheckCircle, Home } from 'lucide-react';

interface OrderConfirmationScreenProps {
  order: any;
  onBackToHome: () => void;
}

export default function OrderConfirmationScreen({
  order,
  onBackToHome
}: OrderConfirmationScreenProps) {
  const isManualEntry = order.needs_manual_entry;

  return (
    <div className="flex flex-col items-center justify-center px-4 py-20 min-h-screen bg-gray-50">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
        <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${
          isManualEntry ? 'bg-orange-100' : 'bg-green-100'
        }`}>
          {isManualEntry ? (
            <svg className="w-12 h-12 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          ) : (
            <CheckCircle className="w-12 h-12 text-green-600" />
          )}
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {isManualEntry ? 'Commande reçue!' : 'Commande confirmée!'}
        </h1>

        <p className="text-gray-600 mb-6">
          {isManualEntry
            ? 'Votre commande a été reçue et est prête pour le traitement manuel dans WooCommerce.'
            : 'Merci pour votre commande. Nous l\'avons reçue et la traiterons sous peu.'
          }
        </p>

        {order && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Numéro de commande:</span>
                <span className="font-semibold">#{order.order_number || order.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Statut:</span>
                <span className="font-semibold capitalize">{order.status}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total:</span>
                <span className="font-semibold text-green-600">{order.total} TND</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Paiement:</span>
                <span className="font-semibold">{order.payment_method_title}</span>
              </div>

              {isManualEntry && (
                <>
                  <div className="pt-2 border-t border-gray-200">
                    <p className="text-orange-600 font-medium mb-2">⚠️ Saisie manuelle requise</p>
                    <p className="text-xs text-gray-500 mb-2">
                      En raison des autorisations API, cette commande doit être créée manuellement dans l'admin WooCommerce.
                    </p>
                  </div>

                  <div className="text-xs text-gray-500">
                    <p><strong>Client:</strong> {order.billing?.first_name} {order.billing?.last_name}</p>
                    <p><strong>Email:</strong> {order.billing?.email}</p>
                    <p><strong>Téléphone:</strong> {order.billing?.phone}</p>
                    <p><strong>Articles:</strong> {order.line_items?.length || 0} produit(s)</p>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {isManualEntry && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6 text-left">
            <h3 className="font-medium text-orange-800 mb-2">📋 Prochaines étapes:</h3>
            <ol className="text-sm text-orange-700 space-y-1">
              <li>1. Accédez au panneau d'administration WooCommerce</li>
              <li>2. Naviguez vers Commandes → Ajouter nouveau</li>
              <li>3. Copiez les détails du client ci-dessus</li>
              <li>4. Ajoutez les produits de la commande</li>
              <li>5. Définissez le mode de paiement: {order.payment_method_title}</li>
            </ol>
          </div>
        )}

        <div className="space-y-3">
          <p className="text-sm text-gray-500">
            {isManualEntry
              ? 'Les détails de la commande ont été enregistrés dans la console du navigateur pour référence.'
              : 'Vous recevrez sous peu un email de confirmation avec les détails de la commande et les informations de suivi.'
            }
          </p>

          <button
            onClick={onBackToHome}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <Home className="w-5 h-5" />
            Retour à l'accueil
          </button>
        </div>
      </div>
    </div>
  );
}
