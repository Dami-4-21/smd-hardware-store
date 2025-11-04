import { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Save, 
  Eye
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import ProductInfoSection from '../components/product-form/ProductInfoSection';
import MeasurementSection from '../components/product-form/MeasurementSection';
import SizeSpecificationSection from '../components/product-form/SizeSpecificationSection';
import PricingInventorySection from '../components/product-form/PricingInventorySection';
import SEOSection from '../components/product-form/SEOSection';
import ProductPreviewModal from '../components/product-form/ProductPreviewModal';
import { productService } from '../services/productService';

export interface ProductFormData {
  // Basic Info
  name: string;
  categoryId: string;
  description: string;
  brand: string;
  status: 'active' | 'draft' | 'hidden';
  images: File[];
  imagePreviewUrls: string[];
  
  // Measurement & Selling Type
  sellingType: 'piece' | 'weight' | 'length' | 'volume' | 'custom';
  customUnit: string;
  packSizes: PackSize[];
  
  // Size & Specifications
  hasSizes: boolean;
  sizeVariations: SizeVariation[];
  
  // Pricing & Inventory
  basePrice: number;
  sku: string;
  stockQuantity: number;
  lowStockThreshold: number;
  
  // SEO
  metaTitle: string;
  metaDescription: string;
  slug: string;
}

export interface PackSize {
  id: string;
  quantity: number;
  label: string;
  price: number;
  stock: number;
}

export interface SizeVariation {
  id: string;
  sizeName: string;
  dimension: string;
  price: number;
  stock: number;
}

const initialFormData: ProductFormData = {
  name: '',
  categoryId: '',
  description: '',
  brand: '',
  status: 'active',
  images: [],
  imagePreviewUrls: [],
  sellingType: 'piece',
  customUnit: '',
  packSizes: [],
  hasSizes: false,
  sizeVariations: [],
  basePrice: 0,
  sku: '',
  stockQuantity: 0,
  lowStockThreshold: 5,
  metaTitle: '',
  metaDescription: '',
  slug: '',
};

export default function CreateProductPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;
  
  const [formData, setFormData] = useState<ProductFormData>(initialFormData);
  const [activeTab, setActiveTab] = useState<'info' | 'measurement' | 'sizes' | 'pricing' | 'seo'>('info');
  const [showPreview, setShowPreview] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  // Load product data if editing
  useEffect(() => {
    if (isEditMode && id) {
      loadProduct(id);
    }
  }, [id, isEditMode]);

  const loadProduct = async (productId: string) => {
    try {
      const product = await productService.getById(productId);
      
      // Map product data to form data
      setFormData({
        name: product.name,
        categoryId: product.categoryId,
        description: product.description || '',
        brand: product.brand || '',
        status: product.isActive ? 'active' : 'draft',
        sku: product.sku || '',
        slug: product.slug,
        basePrice: typeof product.basePrice === 'string' ? parseFloat(product.basePrice) : product.basePrice,
        stockQuantity: product.stockQuantity,
        lowStockThreshold: 5,
        metaTitle: '',
        metaDescription: '',
        images: [],
        imagePreviewUrls: product.images?.map(img => img.imageUrl) || [],
        sellingType: 'piece', // Default, update based on sizeTable
        customUnit: '',
        packSizes: [],
        hasSizes: (product.sizeTable?.length || 0) > 0,
        sizeVariations: product.sizeTable?.map((size, index) => ({
          id: `size-${index}`,
          sizeName: size.size,
          dimension: '',
          price: typeof size.price === 'string' ? parseFloat(size.price) : size.price,
          stock: size.stockQuantity,
        })) || [],
      });
    } catch (error) {
      console.error('Failed to load product:', error);
      alert('Failed to load product');
      navigate('/products');
    }
  };

  const tabs = [
    { id: 'info', label: 'Product Info', icon: '📦' },
    { id: 'measurement', label: 'Measurement & Selling', icon: '📏' },
    { id: 'sizes', label: 'Sizes & Specs', icon: '🔧' },
    { id: 'pricing', label: 'Pricing & Inventory', icon: '💰' },
    { id: 'seo', label: 'SEO', icon: '🔍' },
  ];

  const updateFormData = (updates: Partial<ProductFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Product name is required';
    }
    if (!formData.categoryId) {
      newErrors.categoryId = 'Category is required';
    }
    if (formData.basePrice <= 0) {
      newErrors.basePrice = 'Base price must be greater than 0';
    }
    if (!formData.sku.trim()) {
      newErrors.sku = 'SKU is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async (asDraft: boolean = false) => {
    if (!validateForm() && !asDraft) {
      // Show which fields are missing
      const errorFields = Object.keys(errors).join(', ');
      alert(`Please fill in all required fields: ${errorFields}`);
      return;
    }

    setIsSaving(true);
    
    try {
      // Additional validation before sending
      if (!formData.categoryId) {
        alert('Please select a category');
        setIsSaving(false);
        return;
      }

      if (!formData.basePrice || formData.basePrice <= 0) {
        alert('Please enter a valid price');
        setIsSaving(false);
        return;
      }

      // Prepare product data for API (only fields that exist in schema)
      const productData = {
        name: formData.name,
        slug: formData.slug || formData.name.toLowerCase().replace(/\s+/g, '-'),
        sku: formData.sku,
        description: formData.description,
        shortDescription: formData.description.substring(0, 200),
        brand: formData.brand || undefined,
        categoryId: formData.categoryId,
        price: formData.basePrice,  // Backend converts to basePrice
        stockQuantity: formData.stockQuantity,
        isFeatured: false,
        isActive: asDraft ? false : formData.status === 'active',
        // Note: lowStockThreshold, metaTitle, metaDescription don't exist in schema
        // Convert images to URLs (assuming they're already uploaded)
        images: formData.imagePreviewUrls.map((url, index) => ({
          imageUrl: url,
          altText: formData.name,
          isPrimary: index === 0,
        })),
        // Add size tables if they exist
        sizeTables: formData.sizeVariations.length > 0 ? formData.sizeVariations.map(size => ({
          unitType: formData.sellingType === 'piece' ? 'piece' : 
                    formData.sellingType === 'weight' ? 'kg' :
                    formData.sellingType === 'length' ? 'm' :
                    formData.sellingType === 'volume' ? 'L' : 'piece',
          size: size.sizeName,
          price: size.price,
          stockQuantity: size.stock,
        })) : undefined,
      };

      // Create or update product via API
      if (isEditMode && id) {
        await productService.update(id, productData);
        console.log('Product updated successfully');
        alert(`Product ${asDraft ? 'saved as draft' : 'updated'} successfully!`);
      } else {
        const createdProduct = await productService.create(productData);
        console.log('Product created successfully:', createdProduct);
        alert(`Product ${asDraft ? 'saved as draft' : 'created'} successfully!`);
      }
      
      navigate('/products');
    } catch (error: any) {
      console.error(`Failed to ${isEditMode ? 'update' : 'create'} product:`, error);
      alert(`Failed to ${isEditMode ? 'update' : 'create'} product: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const getUnitLabel = () => {
    switch (formData.sellingType) {
      case 'piece': return 'piece';
      case 'weight': return 'kg';
      case 'length': return 'm';
      case 'volume': return 'L';
      case 'custom': return formData.customUnit || 'unit';
      default: return 'unit';
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/products')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isEditMode ? 'Edit Product' : 'Create New Product'}
            </h1>
            <p className="text-sm text-gray-600">
              {isEditMode ? 'Update product information' : 'Add a new product to your catalog'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowPreview(true)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Eye className="w-4 h-4" />
            Preview
          </button>
          <button
            onClick={() => handleSave(true)}
            disabled={isSaving}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Save as Draft
          </button>
          <button
            onClick={() => handleSave(false)}
            disabled={isSaving}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                {isEditMode ? 'Updating...' : 'Saving...'}
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                {isEditMode ? 'Update Product' : 'Create Product'}
              </>
            )}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="border-b border-gray-200">
          <div className="flex overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <span>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'info' && (
            <ProductInfoSection
              formData={formData}
              updateFormData={updateFormData}
              errors={errors}
            />
          )}

          {activeTab === 'measurement' && (
            <MeasurementSection
              formData={formData}
              updateFormData={updateFormData}
              unitLabel={getUnitLabel()}
            />
          )}

          {activeTab === 'sizes' && (
            <SizeSpecificationSection
              formData={formData}
              updateFormData={updateFormData}
              unitLabel={getUnitLabel()}
            />
          )}

          {activeTab === 'pricing' && (
            <PricingInventorySection
              formData={formData}
              updateFormData={updateFormData}
              errors={errors}
            />
          )}

          {activeTab === 'seo' && (
            <SEOSection
              formData={formData}
              updateFormData={updateFormData}
            />
          )}
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <button
          onClick={() => {
            const currentIndex = tabs.findIndex(t => t.id === activeTab);
            if (currentIndex > 0) {
              setActiveTab(tabs[currentIndex - 1].id as any);
            }
          }}
          disabled={activeTab === 'info'}
          className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        <button
          onClick={() => {
            const currentIndex = tabs.findIndex(t => t.id === activeTab);
            if (currentIndex < tabs.length - 1) {
              setActiveTab(tabs[currentIndex + 1].id as any);
            }
          }}
          disabled={activeTab === 'seo'}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <ProductPreviewModal
          formData={formData}
          unitLabel={getUnitLabel()}
          onClose={() => setShowPreview(false)}
        />
      )}
    </div>
  );
}
