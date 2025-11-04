import { X, AlertTriangle } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  parentId: string | null;
  productCount: number;
  subcategories?: Category[];
}

interface Props {
  category: Category;
  onConfirm: () => void;
  onClose: () => void;
}

export default function DeleteConfirmModal({ category, onConfirm, onClose }: Props) {
  const hasSubcategories = category.subcategories && category.subcategories.length > 0;
  const hasProducts = category.productCount > 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-md w-full">
        {/* Header */}
        <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Delete Category</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <p className="text-gray-700">
            Are you sure you want to delete the category{' '}
            <span className="font-semibold text-gray-900">"{category.name}"</span>?
          </p>

          {/* Warnings */}
          {(hasSubcategories || hasProducts) && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 space-y-2">
              <p className="text-sm font-semibold text-yellow-900">⚠️ Warning:</p>
              {hasSubcategories && (
                <p className="text-sm text-yellow-800">
                  • This category has <strong>{category.subcategories!.length} subcategories</strong> that will also be deleted.
                </p>
              )}
              {hasProducts && (
                <p className="text-sm text-yellow-800">
                  • This category contains <strong>{category.productCount} products</strong>. These products will become uncategorized.
                </p>
              )}
            </div>
          )}

          <p className="text-sm text-gray-600">
            This action cannot be undone.
          </p>
        </div>

        {/* Actions */}
        <div className="border-t border-gray-200 px-6 py-4 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Delete Category
          </button>
        </div>
      </div>
    </div>
  );
}
