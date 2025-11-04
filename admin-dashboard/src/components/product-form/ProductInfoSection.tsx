import { useState, useEffect } from 'react';
import { Upload, X, AlertCircle } from 'lucide-react';
import { ProductFormData } from '../../pages/CreateProductPage';
import { categoryService, Category } from '../../services/categoryService';

interface Props {
  formData: ProductFormData;
  updateFormData: (updates: Partial<ProductFormData>) => void;
  errors: Record<string, string>;
}

export default function ProductInfoSection({ formData, updateFormData, errors }: Props) {
  const [categories, setCategories] = useState<Category[]>(categoryService.getAllFlattened());

  // Subscribe to category changes
  useEffect(() => {
    const unsubscribe = categoryService.subscribe(() => {
      setCategories(categoryService.getAllFlattened());
    });
    return unsubscribe;
  }, []);
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newImages = [...formData.images, ...files];
    const newPreviewUrls = files.map(file => URL.createObjectURL(file));
    
    updateFormData({
      images: newImages,
      imagePreviewUrls: [...formData.imagePreviewUrls, ...newPreviewUrls],
    });
  };

  const removeImage = (index: number) => {
    const newImages = formData.images.filter((_, i) => i !== index);
    const newPreviewUrls = formData.imagePreviewUrls.filter((_, i) => i !== index);
    
    updateFormData({
      images: newImages,
      imagePreviewUrls: newPreviewUrls,
    });
  };

  return (
    <div className="space-y-6">
      {/* Product Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Product Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => updateFormData({ name: e.target.value })}
          placeholder="e.g., Cordless Drill 18V"
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${
            errors.name ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
            <AlertCircle className="w-4 h-4" />
            {errors.name}
          </p>
        )}
      </div>

      {/* Category */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Category <span className="text-red-500">*</span>
        </label>
        <select
          value={formData.categoryId}
          onChange={(e) => updateFormData({ categoryId: e.target.value })}
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${
            errors.categoryId ? 'border-red-500' : 'border-gray-300'
          }`}
        >
          <option value="">Select a category</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.parentId ? `  ↳ ${cat.name}` : cat.name}
            </option>
          ))}
        </select>
        {errors.categoryId && (
          <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
            <AlertCircle className="w-4 h-4" />
            {errors.categoryId}
          </p>
        )}
        <p className="mt-1 text-sm text-gray-500">
          {categories.length} categories available (including subcategories)
        </p>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Description
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => updateFormData({ description: e.target.value })}
          placeholder="Detailed product description..."
          rows={6}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition resize-none"
        />
        <p className="mt-1 text-sm text-gray-500">
          {formData.description.length} characters
        </p>
      </div>

      {/* Images Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Product Images
        </label>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          {formData.imagePreviewUrls.map((url, index) => (
            <div key={index} className="relative group">
              <img
                src={url}
                alt={`Product ${index + 1}`}
                className="w-full h-32 object-cover rounded-lg border border-gray-300"
              />
              <button
                onClick={() => removeImage(index)}
                className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-4 h-4" />
              </button>
              {index === 0 && (
                <span className="absolute bottom-2 left-2 px-2 py-1 bg-blue-600 text-white text-xs rounded">
                  Primary
                </span>
              )}
            </div>
          ))}
          
          {/* Upload Button */}
          <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors">
            <Upload className="w-8 h-8 text-gray-400 mb-2" />
            <span className="text-sm text-gray-600">Upload Image</span>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
              className="hidden"
            />
          </label>
        </div>
        
        <p className="text-sm text-gray-500">
          First image will be the primary image. Recommended size: 800x800px
        </p>
      </div>

      {/* Brand */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Brand (Optional)
        </label>
        <input
          type="text"
          value={formData.brand}
          onChange={(e) => updateFormData({ brand: e.target.value })}
          placeholder="e.g., Bosch, DeWalt, Makita"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
        />
      </div>

      {/* Product Status */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Product Status
        </label>
        <div className="flex gap-4">
          {[
            { value: 'active', label: 'Active', color: 'green' },
            { value: 'draft', label: 'Draft', color: 'yellow' },
            { value: 'hidden', label: 'Hidden', color: 'gray' },
          ].map((status) => (
            <label
              key={status.value}
              className={`flex items-center gap-2 px-4 py-3 border-2 rounded-lg cursor-pointer transition-all ${
                formData.status === status.value
                  ? `border-${status.color}-500 bg-${status.color}-50`
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <input
                type="radio"
                name="status"
                value={status.value}
                checked={formData.status === status.value}
                onChange={(e) => updateFormData({ status: e.target.value as any })}
                className="w-4 h-4"
              />
              <span className="font-medium">{status.label}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
