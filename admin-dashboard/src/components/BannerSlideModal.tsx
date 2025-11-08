import { useState, useEffect } from 'react';
import { X, Upload, Link as LinkIcon, AlertCircle } from 'lucide-react';
import { bannerService, BannerSlide, CreateBannerSlideData } from '../services/bannerService';
import { categoryService, Category } from '../services/categoryService';
import { productService, Product } from '../services/productService';

interface Props {
  slide: BannerSlide | null;
  onSave: () => void;
  onClose: () => void;
}

export default function BannerSlideModal({ slide, onSave, onClose }: Props) {
  const [formData, setFormData] = useState<CreateBannerSlideData>({
    title: slide?.title || '',
    subtitle: slide?.subtitle || '',
    buttonText: slide?.buttonText || '',
    slideType: slide?.slideType || 'IMAGE',
    imageUrl: slide?.imageUrl || '',
    backgroundColor: slide?.backgroundColor || '#2C3E50',
    textColor: slide?.textColor || '#FFFFFF',
    linkType: slide?.linkType || '',
    linkedProductId: slide?.linkedProductId || '',
    linkedCategoryId: slide?.linkedCategoryId || '',
    displayOrder: slide?.displayOrder || 0,
    isActive: slide?.isActive !== undefined ? slide.isActive : true,
    duration: slide?.duration || 5,
  });

  const [imageInputUrl, setImageInputUrl] = useState<string>('');
  const [useUrlInput, setUseUrlInput] = useState<boolean>(false);
  const [imagePreview, setImagePreview] = useState<string>(slide?.imageUrl || '');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const [activeLinkType, setActiveLinkType] = useState<string>(slide?.linkType || '');
  const [categorySearch, setCategorySearch] = useState<string>('');
  const [productSearch, setProductSearch] = useState<string>('');
  const [categoryResults, setCategoryResults] = useState<Category[]>([]);
  const [productResults, setProductResults] = useState<Product[]>([]);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showProductDropdown, setShowProductDropdown] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  useEffect(() => {
    // Load selected category/product if editing
    if (slide?.linkedCategoryId) {
      loadSelectedCategory(slide.linkedCategoryId);
    }
    if (slide?.linkedProductId) {
      loadSelectedProduct(slide.linkedProductId);
    }
  }, [slide]);

  const loadSelectedCategory = async (categoryId: string) => {
    try {
      const data = categoryService.getAllFlattened();
      const category = data.find(c => c.id === categoryId);
      if (category) {
        setSelectedCategory(category);
        setCategorySearch(category.name);
      }
    } catch (error) {
      console.error('Failed to load category:', error);
    }
  };

  const loadSelectedProduct = async (productId: string) => {
    try {
      const product = await productService.getById(productId);
      if (product) {
        setSelectedProduct(product);
        setProductSearch(product.name);
      }
    } catch (error) {
      console.error('Failed to load product:', error);
    }
  };

  const searchCategories = async (query: string) => {
    setCategorySearch(query);
    if (query.length < 2) {
      setCategoryResults([]);
      setShowCategoryDropdown(false);
      return;
    }

    try {
      const data = categoryService.getAllFlattened();
      const filtered = data.filter(cat => 
        cat.name.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 10); // Limit to 10 results
      setCategoryResults(filtered);
      setShowCategoryDropdown(true);
    } catch (error) {
      console.error('Failed to search categories:', error);
    }
  };

  const searchProducts = async (query: string) => {
    setProductSearch(query);
    if (query.length < 2) {
      setProductResults([]);
      setShowProductDropdown(false);
      return;
    }

    try {
      const data = await productService.getAll();
      const filtered = data.products.filter(prod => 
        prod.name.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 10); // Limit to 10 results
      setProductResults(filtered);
      setShowProductDropdown(true);
    } catch (error) {
      console.error('Failed to search products:', error);
    }
  };

  const selectCategory = (category: Category) => {
    setSelectedCategory(category);
    setCategorySearch(category.name);
    setFormData({ ...formData, linkedCategoryId: category.id, linkedProductId: '' });
    setShowCategoryDropdown(false);
    setSelectedProduct(null);
    setProductSearch('');
  };

  const selectProduct = (product: Product) => {
    setSelectedProduct(product);
    setProductSearch(product.name);
    setFormData({ ...formData, linkedProductId: product.id, linkedCategoryId: '' });
    setShowProductDropdown(false);
    setSelectedCategory(null);
    setCategorySearch('');
  };

  const clearCategorySelection = () => {
    setSelectedCategory(null);
    setCategorySearch('');
    setFormData({ ...formData, linkedCategoryId: '' });
  };

  const clearProductSelection = () => {
    setSelectedProduct(null);
    setProductSearch('');
    setFormData({ ...formData, linkedProductId: '' });
  };

  const handleUrlInput = () => {
    if (imageInputUrl.trim()) {
      setImagePreview(imageInputUrl);
      setFormData({ ...formData, imageUrl: imageInputUrl });
      setImageInputUrl('');
      setUseUrlInput(false);
    }
  };

  const handleRemoveImage = () => {
    setImagePreview('');
    setImageInputUrl('');
    setFormData({ ...formData, imageUrl: '' });
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (formData.slideType === 'IMAGE' && !formData.imageUrl) {
      newErrors.imageUrl = 'Image URL is required for IMAGE slide type';
    }

    if (formData.slideType === 'TEXT' && !formData.backgroundColor) {
      newErrors.backgroundColor = 'Background color is required for TEXT slide type';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    try {
      setLoading(true);
      
      // Ensure linkType is synced with activeLinkType
      const dataToSave = {
        ...formData,
        linkType: activeLinkType || undefined,
      };
      
      console.log('Saving banner slide with data:', dataToSave);
      
      if (slide) {
        await bannerService.updateSlide(slide.id, dataToSave);
      } else {
        await bannerService.createSlide(dataToSave);
      }
      onSave();
    } catch (error) {
      console.error('Failed to save banner slide:', error);
      alert('Failed to save banner slide. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between flex-shrink-0">
          <h2 className="text-xl font-bold text-gray-900">
            {slide ? 'Edit Banner Slide' : 'Add Banner Slide'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto flex-1">
          {/* Slide Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Slide Type *
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, slideType: 'IMAGE' })}
                className={`p-4 border-2 rounded-lg transition-colors ${
                  formData.slideType === 'IMAGE'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <Upload className="w-6 h-6 mx-auto mb-2" />
                <span className="font-medium">Image Slide</span>
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, slideType: 'TEXT' })}
                className={`p-4 border-2 rounded-lg transition-colors ${
                  formData.slideType === 'TEXT'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <span className="text-2xl mb-2 block">Aa</span>
                <span className="font-medium">Text Slide</span>
              </button>
            </div>
          </div>

          {/* Image Upload (for IMAGE type) */}
          {formData.slideType === 'IMAGE' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Banner Image *
              </label>
              {imagePreview ? (
                <div className="relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden border-2 border-gray-300 mb-4">
                  <img
                    src={imagePreview}
                    alt="Banner preview"
                    className="w-full h-full object-cover"
                    onError={() => {
                      setErrors({ ...errors, imageUrl: 'Failed to load image from URL' });
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors z-10"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex gap-2">
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
                      Upload File
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
                      <LinkIcon className="w-4 h-4 inline mr-2" />
                      Use URL
                    </button>
                  </div>

                  {useUrlInput ? (
                    <div className="space-y-2">
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
                          Load
                        </button>
                      </div>
                      <p className="text-xs text-gray-500">
                        Enter image URL from Cloudinary or other image hosting service
                      </p>
                    </div>
                  ) : (
                    <div className="text-center p-8 border-2 border-dashed border-gray-300 rounded-lg">
                      <p className="text-sm text-gray-600">File upload coming soon</p>
                      <p className="text-xs text-gray-500 mt-1">Use URL option for now</p>
                    </div>
                  )}
                </div>
              )}
              {errors.imageUrl && (
                <div className="flex items-center gap-2 mt-2 text-red-600 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  {errors.imageUrl}
                </div>
              )}
            </div>
          )}

          {/* Background Color (for TEXT type) */}
          {formData.slideType === 'TEXT' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Background Color *
                </label>
                <input
                  type="text"
                  value={formData.backgroundColor}
                  onChange={(e) => setFormData({ ...formData, backgroundColor: e.target.value })}
                  placeholder="#2C3E50 or gradient"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Hex color or CSS gradient
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Text Color
                </label>
                <input
                  type="text"
                  value={formData.textColor}
                  onChange={(e) => setFormData({ ...formData, textColor: e.target.value })}
                  placeholder="#FFFFFF"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>
            </div>
          )}

          {/* Title & Subtitle */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Welcome to Hardware Store"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subtitle
              </label>
              <input
                type="text"
                value={formData.subtitle}
                onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                placeholder="Everything you need"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>
          </div>

          {/* Button Text */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Button Text (Optional)
            </label>
            <input
              type="text"
              value={formData.buttonText}
              onChange={(e) => setFormData({ ...formData, buttonText: e.target.value })}
              placeholder="Shop Now"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>

          {/* Link Configuration */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Link To (Optional)
            </label>
            {/* Debug: Show current linkType */}
            <div className="text-xs text-gray-500 mb-2">
              Current linkType: "{activeLinkType || 'none'}" | formData: "{formData.linkType || 'none'}"
            </div>
            <div className="space-y-4">
              {/* Link Type Selection */}
              <div className="flex gap-3 relative z-10">
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('No Link clicked');
                    setActiveLinkType('');
                    setFormData({ ...formData, linkType: '', linkedProductId: '', linkedCategoryId: '' });
                    clearCategorySelection();
                    clearProductSelection();
                  }}
                  className={`flex-1 px-4 py-2 rounded-lg border-2 transition-all cursor-pointer ${
                    !activeLinkType
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  No Link
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('Category clicked, setting linkType to CATEGORY');
                    setActiveLinkType('CATEGORY');
                    const newFormData = { ...formData, linkType: 'CATEGORY', linkedProductId: '' };
                    setFormData(newFormData);
                    console.log('New formData:', newFormData);
                    clearProductSelection();
                  }}
                  className={`flex-1 px-4 py-2 rounded-lg border-2 transition-all cursor-pointer ${
                    activeLinkType === 'CATEGORY'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  Category
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('Product clicked, setting linkType to PRODUCT');
                    setActiveLinkType('PRODUCT');
                    const newFormData = { ...formData, linkType: 'PRODUCT', linkedCategoryId: '' };
                    setFormData(newFormData);
                    console.log('New formData:', newFormData);
                    clearCategorySelection();
                  }}
                  className={`flex-1 px-4 py-2 rounded-lg border-2 transition-all cursor-pointer ${
                    activeLinkType === 'PRODUCT'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  Product
                </button>
              </div>

              {/* Category Autocomplete */}
              {activeLinkType === 'CATEGORY' && (
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Search Category
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={categorySearch}
                      onChange={(e) => searchCategories(e.target.value)}
                      onFocus={() => categorySearch.length >= 2 && setShowCategoryDropdown(true)}
                      placeholder="Type to search categories..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                    {selectedCategory && (
                      <button
                        type="button"
                        onClick={clearCategorySelection}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  {showCategoryDropdown && categoryResults.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {categoryResults.map((category) => (
                        <button
                          key={category.id}
                          type="button"
                          onClick={() => selectCategory(category)}
                          className="w-full px-4 py-2 text-left hover:bg-blue-50 transition-colors border-b border-gray-100 last:border-b-0"
                        >
                          <div className="font-medium text-gray-900">{category.name}</div>
                          {category.slug && (
                            <div className="text-xs text-gray-500">{category.slug}</div>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                  {selectedCategory && (
                    <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm font-medium text-green-900">Selected: {selectedCategory.name}</div>
                          <div className="text-xs text-green-700">ID: {selectedCategory.id}</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Product Autocomplete */}
              {activeLinkType === 'PRODUCT' && (
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Search Product
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={productSearch}
                      onChange={(e) => searchProducts(e.target.value)}
                      onFocus={() => productSearch.length >= 2 && setShowProductDropdown(true)}
                      placeholder="Type to search products..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                    {selectedProduct && (
                      <button
                        type="button"
                        onClick={clearProductSelection}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  {showProductDropdown && productResults.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {productResults.map((product) => (
                        <button
                          key={product.id}
                          type="button"
                          onClick={() => selectProduct(product)}
                          className="w-full px-4 py-2 text-left hover:bg-blue-50 transition-colors border-b border-gray-100 last:border-b-0"
                        >
                          <div className="font-medium text-gray-900">{product.name}</div>
                          <div className="text-xs text-gray-500">SKU: {product.sku || 'N/A'}</div>
                        </button>
                      ))}
                    </div>
                  )}
                  {selectedProduct && (
                    <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm font-medium text-green-900">Selected: {selectedProduct.name}</div>
                          <div className="text-xs text-green-700">ID: {selectedProduct.id}</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Display Order, Duration & Active Status */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Display Order
              </label>
              <input
                type="number"
                value={formData.displayOrder}
                onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Duration (seconds)
              </label>
              <input
                type="number"
                min="1"
                max="60"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 5 })}
                placeholder="5"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <label className="flex items-center gap-3 px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">Active</span>
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : slide ? 'Update Slide' : 'Create Slide'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
