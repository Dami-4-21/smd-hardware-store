import { Search, Link as LinkIcon } from 'lucide-react';
import { ProductFormData } from '../../pages/CreateProductPage';
import { useEffect } from 'react';

interface Props {
  formData: ProductFormData;
  updateFormData: (updates: Partial<ProductFormData>) => void;
}

export default function SEOSection({ formData, updateFormData }: Props) {
  // Auto-generate slug from product name
  useEffect(() => {
    if (formData.name && !formData.slug) {
      const generatedSlug = formData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
      updateFormData({ slug: generatedSlug });
    }
  }, [formData.name]);

  // Auto-generate meta title from product name
  useEffect(() => {
    if (formData.name && !formData.metaTitle) {
      updateFormData({ metaTitle: formData.name });
    }
  }, [formData.name]);

  const generateSlug = () => {
    const slug = formData.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    updateFormData({ slug });
  };

  return (
    <div className="space-y-6">
      {/* Meta Title */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Meta Title
        </label>
        <input
          type="text"
          value={formData.metaTitle}
          onChange={(e) => updateFormData({ metaTitle: e.target.value })}
          placeholder="Product name - SMD Hardware Store"
          maxLength={60}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
        />
        <div className="flex items-center justify-between mt-1">
          <p className="text-sm text-gray-500">
            Appears in search engine results
          </p>
          <span className={`text-sm ${formData.metaTitle.length > 60 ? 'text-red-600' : 'text-gray-500'}`}>
            {formData.metaTitle.length}/60
          </span>
        </div>
      </div>

      {/* Meta Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Meta Description
        </label>
        <textarea
          value={formData.metaDescription}
          onChange={(e) => updateFormData({ metaDescription: e.target.value })}
          placeholder="Brief description of the product for search engines..."
          rows={4}
          maxLength={160}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition resize-none"
        />
        <div className="flex items-center justify-between mt-1">
          <p className="text-sm text-gray-500">
            Shown in search results below the title
          </p>
          <span className={`text-sm ${formData.metaDescription.length > 160 ? 'text-red-600' : 'text-gray-500'}`}>
            {formData.metaDescription.length}/160
          </span>
        </div>
      </div>

      {/* URL Slug */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          URL Slug
        </label>
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <input
              type="text"
              value={formData.slug}
              onChange={(e) => updateFormData({ slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') })}
              placeholder="product-url-slug"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
            />
            <LinkIcon className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          </div>
          <button
            onClick={generateSlug}
            className="px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors whitespace-nowrap"
          >
            Auto-generate
          </button>
        </div>
        <p className="mt-1 text-sm text-gray-500">
          URL: <span className="font-mono text-blue-600">
            https://sqb-tunisie.com/products/{formData.slug || 'your-product-slug'}
          </span>
        </p>
      </div>

      {/* SEO Preview */}
      <div className="bg-gray-50 border border-gray-300 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-3">
          <Search className="w-5 h-5 text-gray-600" />
          <h3 className="font-semibold text-gray-900">Search Engine Preview</h3>
        </div>
        
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="space-y-1">
            <div className="text-xs text-green-700">
              https://smd-tunisie.com › products › {formData.slug || 'product-slug'}
            </div>
            <div className="text-xl text-blue-600 hover:underline cursor-pointer">
              {formData.metaTitle || 'Product Title - SMD Hardware Store'}
            </div>
            <div className="text-sm text-gray-600">
              {formData.metaDescription || 'Product description will appear here. Add a meta description to improve SEO and click-through rates from search results.'}
            </div>
          </div>
        </div>
      </div>

      {/* SEO Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">SEO Best Practices</h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li className="flex items-start gap-2">
            <span className="text-blue-600 mt-0.5">✓</span>
            <span>Keep meta title under 60 characters for optimal display</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 mt-0.5">✓</span>
            <span>Meta description should be 150-160 characters</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 mt-0.5">✓</span>
            <span>Include relevant keywords naturally in title and description</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 mt-0.5">✓</span>
            <span>Use hyphens (-) in URL slugs, not underscores</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 mt-0.5">✓</span>
            <span>Make URLs descriptive and easy to read</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
