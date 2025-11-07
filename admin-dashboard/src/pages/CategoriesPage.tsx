import { useState, useEffect } from 'react';
import { 
  FolderTree, 
  Plus, 
  Edit2, 
  Trash2, 
  ChevronRight, 
  ChevronDown,
  Folder,
  FolderOpen
} from 'lucide-react';
import CategoryModal from '../components/categories/CategoryModal';
import DeleteConfirmModal from '../components/categories/DeleteConfirmModal';
import { categoryService, Category } from '../services/categoryService';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);
  const [parentCategory, setParentCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load categories on mount
  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoading(true);
        const cats = await categoryService.getAll();
        setCategories(cats);
        setError(null);
      } catch (err) {
        console.error('Failed to load categories:', err);
        setError('Failed to load categories');
      } finally {
        setLoading(false);
      }
    };

    loadCategories();

    // Subscribe to category changes
    const unsubscribe = categoryService.subscribe((updatedCategories) => {
      setCategories(updatedCategories);
    });
    
    return unsubscribe;
  }, []);

  const toggleExpand = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const handleAddCategory = (parentCat: Category | null = null) => {
    setEditingCategory(null);
    setParentCategory(parentCat);
    setShowModal(true);
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setParentCategory(null);
    setShowModal(true);
  };

  const handleDeleteCategory = (category: Category) => {
    setDeletingCategory(category);
    setShowDeleteModal(true);
  };

  const handleSaveCategory = async (categoryData: Partial<Category> & { imageFile?: File }) => {
    const { imageFile, ...catData } = categoryData;
    
    try {
      let imageUrl = catData.imageUrl;
      
      // Upload image file if provided
      if (imageFile) {
        const formData = new FormData();
        formData.append('image', imageFile);
        formData.append('uploadType', 'categories');
        
        const token = localStorage.getItem('admin_token');
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
        
        const uploadResponse = await fetch(`${API_URL}/upload/image`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: formData,
        });
        
        if (!uploadResponse.ok) {
          throw new Error('Failed to upload image');
        }
        
        const uploadData = await uploadResponse.json();
        imageUrl = uploadData.data.url;
        console.log('Image uploaded successfully:', imageUrl);
      }
      
      if (editingCategory) {
        // Update existing category using service
        await categoryService.update(editingCategory.id, { ...catData, imageUrl });
      } else {
        // Add new category using service
        await categoryService.add({
          name: catData.name || '',
          slug: catData.slug || '',
          description: catData.description || '',
          parentId: parentCategory?.id || null,
          imageUrl: imageUrl || '',
          subcategories: [],
        });
        
        // Expand parent if adding subcategory
        if (parentCategory) {
          setExpandedCategories(new Set([...expandedCategories, parentCategory.id]));
        }
      }
      
      setShowModal(false);
    } catch (err) {
      console.error('Failed to save category:', err);
      alert('Failed to save category. Please try again.');
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingCategory) return;

    try {
      // Delete using service
      await categoryService.delete(deletingCategory.id);
      
      setShowDeleteModal(false);
      setDeletingCategory(null);
    } catch (err) {
      console.error('Failed to delete category:', err);
      alert('Failed to delete category. Please try again.');
    }
  };

  const getTotalProducts = () => {
    return categories.reduce((sum, cat) => sum + cat.productCount, 0);
  };

  const renderCategory = (category: Category, level: number = 0) => {
    const isExpanded = expandedCategories.has(category.id);
    const hasSubcategories = category.subcategories && category.subcategories.length > 0;

    return (
      <div key={category.id} className="border-b border-gray-200 last:border-0">
        <div 
          className={`flex items-center justify-between p-4 hover:bg-gray-50 transition-colors ${
            level > 0 ? 'bg-gray-50' : ''
          }`}
          style={{ paddingLeft: `${level * 2 + 1}rem` }}
        >
          <div className="flex items-center gap-3 flex-1">
            {hasSubcategories ? (
              <button
                onClick={() => toggleExpand(category.id)}
                className="p-1 hover:bg-gray-200 rounded transition-colors"
              >
                {isExpanded ? (
                  <ChevronDown className="w-5 h-5 text-gray-600" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-gray-600" />
                )}
              </button>
            ) : (
              <div className="w-7" />
            )}
            
            {/* Category Image Thumbnail */}
            {category.imageUrl ? (
              <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100 border border-gray-200">
                <img
                  src={category.imageUrl}
                  alt={category.name}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              isExpanded ? (
                <FolderOpen className="w-12 h-12 p-2 text-blue-600 bg-blue-50 rounded-lg" />
              ) : (
                <Folder className="w-12 h-12 p-2 text-gray-600 bg-gray-100 rounded-lg" />
              )
            )}
            
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-gray-900">{category.name}</h3>
                <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
                  {category.productCount} products
                </span>
              </div>
              {category.description && (
                <p className="text-sm text-gray-600 mt-0.5">{category.description}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {level === 0 && (
              <button
                onClick={() => handleAddCategory(category)}
                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="Add subcategory"
              >
                <Plus className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={() => handleEditCategory(category)}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title="Edit category"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleDeleteCategory(category)}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Delete category"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {isExpanded && hasSubcategories && (
          <div>
            {category.subcategories!.map(subcat => renderCategory(subcat, level + 1))}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
          <p className="text-sm text-gray-600 mt-1">
            Manage product categories and subcategories
          </p>
        </div>
        <button
          onClick={() => handleAddCategory()}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Category
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <FolderTree className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{categories.length}</div>
              <div className="text-sm text-gray-600">Total Categories</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <Folder className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {categories.reduce((sum, cat) => sum + (cat.subcategories?.length || 0), 0)}
              </div>
              <div className="text-sm text-gray-600">Subcategories</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-100 rounded-lg">
              <FolderTree className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{getTotalProducts()}</div>
              <div className="text-sm text-gray-600">Total Products</div>
            </div>
          </div>
        </div>
      </div>

      {/* Categories List */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {categories.length === 0 ? (
          <div className="p-12 text-center">
            <FolderTree className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No categories yet</h3>
            <p className="text-gray-600 mb-4">Get started by creating your first category</p>
            <button
              onClick={() => handleAddCategory()}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add Category
            </button>
          </div>
        ) : (
          <div>
            {categories.map(category => renderCategory(category))}
          </div>
        )}
      </div>

      {/* Modals */}
      {showModal && (
        <CategoryModal
          category={editingCategory}
          parentCategory={parentCategory}
          onSave={handleSaveCategory}
          onClose={() => setShowModal(false)}
        />
      )}

      {showDeleteModal && deletingCategory && (
        <DeleteConfirmModal
          category={deletingCategory}
          onConfirm={handleConfirmDelete}
          onClose={() => {
            setShowDeleteModal(false);
            setDeletingCategory(null);
          }}
        />
      )}
    </div>
  );
}
