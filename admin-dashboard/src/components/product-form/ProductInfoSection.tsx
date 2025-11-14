import { useState, useEffect } from 'react';
import { Upload, X, AlertCircle, Link } from 'lucide-react';
import { ProductFormData } from '../../pages/CreateProductPage';
import { categoryService, Category } from '../../services/categoryService';
import { useLanguage } from '../../contexts/LanguageContext';

interface Props {
  formData: ProductFormData;
  updateFormData: (updates: Partial<ProductFormData>) => void;
  errors: Record<string, string>;
}

export default function ProductInfoSection({ formData, updateFormData, errors }: Props) {
  const { t } = useLanguage();
  const [categories, setCategories] = useState<Category[]>(categoryService.getAllFlattened());
  const [imageInputUrl, setImageInputUrl] = useState<string>('');
  const [useUrlInput, setUseUrlInput] = useState<boolean>(false);

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

  const handleUrlInput = () => {
    if (imageInputUrl.trim()) {
      updateFormData({
        imagePreviewUrls: [...formData.imagePreviewUrls, imageInputUrl],
      });
      setImageInputUrl('');
      setUseUrlInput(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Product Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t.products.productName} <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => updateFormData({ name: e.target.value })}
          placeholder={t.products.productNamePlaceholder}
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
          {t.products.category} <span className="text-red-500">*</span>
        </label>
        <select
          value={formData.categoryId}
          onChange={(e) => updateFormData({ categoryId: e.target.value })}
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${
            errors.categoryId ? 'border-red-500' : 'border-gray-300'
          }`}
        >
          <option value="">{t.products.selectCategory}</option>
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
          {t.products.description}
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => updateFormData({ description: e.target.value })}
          placeholder={t.products.descriptionPlaceholder}
          rows={6}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition resize-none"
        />
        <p className="mt-1 text-sm text-gray-500">
          {formData.description.length} {t.products.characters}
        </p>
      </div>

      {/* Images Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t.products.productImages}
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
          {!useUrlInput ? (
            <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors">
              <Upload className="w-8 h-8 text-gray-400 mb-2" />
              <span className="text-sm text-gray-600">{t.products.uploadImage}</span>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>
          ) : (
            <div className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-gray-300 rounded-lg p-2">
              <Link className="w-8 h-8 text-gray-400 mb-2" />
              <span className="text-xs text-gray-600 text-center">URL Input Mode</span>
            </div>
          )}
        </div>

        {/* Toggle between upload and URL */}
        <div className="flex gap-2 mb-3">
          <button
            type="button"
            onClick={() => setUseUrlInput(false)}
            className={`flex-1 px-4 py-2 rounded-lg border-2 transition-colors ${
              !useUrlInput
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <Upload className="w-4 h-4 inline mr-2" />
            {t.products.uploadFile}
          </button>
          <button
            type="button"
            onClick={() => setUseUrlInput(true)}
            className={`flex-1 px-4 py-2 rounded-lg border-2 transition-colors ${
              useUrlInput
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <Link className="w-4 h-4 inline mr-2" />
            {t.products.useUrl}
          </button>
        </div>

        {/* URL Input */}
        {useUrlInput && (
          <div className="mb-3">
            <div className="flex gap-2">
              <input
                type="url"
                value={imageInputUrl}
                onChange={(e) => setImageInputUrl(e.target.value)}
                placeholder="https://res.cloudinary.com/your-image.jpg"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
              <button
                type="button"
                onClick={handleUrlInput}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add
              </button>
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Enter image URL from Cloudinary or other image hosting service
            </p>
          </div>
        )}
        
        <p className="text-sm text-gray-500">
          {t.products.firstImagePrimary}
        </p>
      </div>

      {/* Brand */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t.products.brand} (Optional)
        </label>
        <input
          type="text"
          value={formData.brand}
          onChange={(e) => updateFormData({ brand: e.target.value })}
          placeholder={t.products.brandPlaceholder}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
        />
      </div>

      {/* Product Status */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t.products.productStatus}
        </label>
        <div className="flex gap-4">
          {[
            { value: 'active', label: t.products.active, color: 'green' },
            { value: 'draft', label: t.products.draft, color: 'yellow' },
            { value: 'hidden', label: t.products.hidden, color: 'gray' },
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
