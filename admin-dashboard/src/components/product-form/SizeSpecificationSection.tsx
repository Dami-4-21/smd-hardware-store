import { Plus, Trash2, Upload, Download, Eye } from 'lucide-react';
import { ProductFormData, SizeVariation } from '../../pages/CreateProductPage';
import { useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';

interface Props {
  formData: ProductFormData;
  updateFormData: (updates: Partial<ProductFormData>) => void;
  unitLabel: string;
}

export default function SizeSpecificationSection({ formData, updateFormData, unitLabel }: Props) {
  const { t } = useLanguage();
  const [csvFile, setCsvFile] = useState<File | null>(null);

  const addSizeVariation = () => {
    const newSize: SizeVariation = {
      id: Date.now().toString(),
      sizeName: '',
      dimension: '',
      price: 0,
      stock: 0,
    };
    updateFormData({
      sizeVariations: [...formData.sizeVariations, newSize],
    });
  };

  const updateSizeVariation = (id: string, updates: Partial<SizeVariation>) => {
    const updatedSizes = formData.sizeVariations.map(size =>
      size.id === id ? { ...size, ...updates } : size
    );
    updateFormData({ sizeVariations: updatedSizes });
  };

  const removeSizeVariation = (id: string) => {
    updateFormData({
      sizeVariations: formData.sizeVariations.filter(size => size.id !== id),
    });
  };

  const handleCSVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCsvFile(file);
      // TODO: Parse CSV and add size variations
      alert('CSV import feature coming soon!');
    }
  };

  const downloadCSVTemplate = () => {
    const csvContent = 'Size Name,Dimension,Price,Stock\n1mm,1,10.50,100\n1.5mm,1.5,12.00,150\n2mm,2,15.00,200';
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'size-variations-template.csv';
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Enable Sizes Toggle */}
      <div className="bg-gray-50 border border-gray-300 rounded-lg p-4">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.hasSizes}
            onChange={(e) => updateFormData({ hasSizes: e.target.checked })}
            className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
          />
          <div>
            <div className="font-semibold text-gray-900">{t.products.hasSizes}</div>
            <div className="text-sm text-gray-600">
              Product has multiple sizes/dimensions (e.g., screws, bolts, cables)
            </div>
          </div>
        </label>
      </div>

      {formData.hasSizes && (
        <>
          {/* Bulk Import Section */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-semibold text-blue-900">Bulk Import from CSV</h3>
                <p className="text-sm text-blue-700">Import multiple size variations at once</p>
              </div>
              <button
                onClick={downloadCSVTemplate}
                className="flex items-center gap-2 px-3 py-2 bg-white border border-blue-300 text-blue-700 rounded-lg hover:bg-blue-50 transition-colors text-sm"
              >
                <Download className="w-4 h-4" />
                Download Template
              </button>
            </div>
            
            <label className="flex items-center gap-3 px-4 py-3 bg-white border-2 border-dashed border-blue-300 rounded-lg cursor-pointer hover:border-blue-500 transition-colors">
              <Upload className="w-5 h-5 text-blue-600" />
              <div className="flex-1">
                <span className="text-sm font-medium text-gray-900">
                  {csvFile ? csvFile.name : 'Click to upload CSV file'}
                </span>
                <p className="text-xs text-gray-600">
                  CSV format: Size Name, Dimension, Price, Stock
                </p>
              </div>
              <input
                type="file"
                accept=".csv"
                onChange={handleCSVUpload}
                className="hidden"
              />
            </label>
          </div>

          {/* Manual Size Entry */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  {t.products.sizeVariations}
                </label>
                <p className="text-sm text-gray-500">
                  {t.products.sizeVariationsDesc}
                </p>
              </div>
              <button
                onClick={addSizeVariation}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                {t.products.addSize}
              </button>
            </div>

            {formData.sizeVariations.length === 0 ? (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <div className="text-gray-400 mb-2">🔧</div>
                <p className="text-gray-600 mb-4">No size variations added yet</p>
                <button
                  onClick={addSizeVariation}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {t.products.addSize}
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Table Header */}
                <div className="hidden md:grid grid-cols-12 gap-4 px-4 py-2 bg-gray-100 rounded-lg text-sm font-medium text-gray-700">
                  <div className="col-span-3">{t.products.sizeName}</div>
                  <div className="col-span-2">{t.products.dimension}</div>
                  <div className="col-span-2">Unit</div>
                  <div className="col-span-2">{t.products.price} (TND)</div>
                  <div className="col-span-2">{t.products.stock}</div>
                  <div className="col-span-1"></div>
                </div>

                {/* Size Rows */}
                {formData.sizeVariations.map((size) => (
                  <div key={size.id} className="border border-gray-300 rounded-lg p-4 bg-white hover:shadow-md transition-shadow">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                      <div className="md:col-span-3">
                        <label className="block text-xs font-medium text-gray-600 mb-1 md:hidden">
                          {t.products.sizeName}
                        </label>
                        <input
                          type="text"
                          value={size.sizeName}
                          onChange={(e) => updateSizeVariation(size.id, { sizeName: e.target.value })}
                          placeholder="e.g., Small, 1mm, M6"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        />
                      </div>
                      
                      <div className="md:col-span-2">
                        <label className="block text-xs font-medium text-gray-600 mb-1 md:hidden">
                          {t.products.dimension}
                        </label>
                        <input
                          type="text"
                          value={size.dimension}
                          onChange={(e) => updateSizeVariation(size.id, { dimension: e.target.value })}
                          placeholder="e.g., 1, 1.5, 2"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        />
                      </div>
                      
                      <div className="md:col-span-2">
                        <label className="block text-xs font-medium text-gray-600 mb-1 md:hidden">
                          Unit
                        </label>
                        <div className="flex items-center h-10 px-3 bg-gray-100 border border-gray-300 rounded-lg text-gray-700">
                          {unitLabel}
                        </div>
                      </div>
                      
                      <div className="md:col-span-2">
                        <label className="block text-xs font-medium text-gray-600 mb-1 md:hidden">
                          {t.products.price} (TND)
                        </label>
                        <input
                          type="number"
                          value={size.price}
                          onChange={(e) => updateSizeVariation(size.id, { price: parseFloat(e.target.value) || 0 })}
                          min="0"
                          step="0.01"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        />
                      </div>
                      
                      <div className="md:col-span-2">
                        <label className="block text-xs font-medium text-gray-600 mb-1 md:hidden">
                          {t.products.stock}
                        </label>
                        <input
                          type="number"
                          value={size.stock}
                          onChange={(e) => updateSizeVariation(size.id, { stock: parseInt(e.target.value) || 0 })}
                          min="0"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        />
                      </div>
                      
                      <div className="md:col-span-1 flex items-end md:items-center">
                        <button
                          onClick={() => removeSizeVariation(size.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="Remove size"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Preview Section */}
          {formData.sizeVariations.length > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <Eye className="w-5 h-5 text-green-600" />
                <span className="font-medium text-green-900">Product Detail Page Preview</span>
              </div>
              
              <div className="bg-white rounded-lg p-4 border border-green-200">
                <p className="text-sm font-medium text-gray-700 mb-3">Size Selection (Dropdown View):</p>
                <select className="w-full md:w-64 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none">
                  <option value="">Select size...</option>
                  {formData.sizeVariations.map((size) => (
                    <option key={size.id} value={size.id}>
                      {size.sizeName} {size.dimension && `(${size.dimension}${unitLabel})`} - {size.price.toFixed(2)} TND
                    </option>
                  ))}
                </select>

                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-sm font-medium text-gray-700 mb-3">Size Selection (Table View):</p>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left font-medium text-gray-700">Size</th>
                          <th className="px-4 py-2 text-left font-medium text-gray-700">Dimension</th>
                          <th className="px-4 py-2 text-right font-medium text-gray-700">Price</th>
                          <th className="px-4 py-2 text-center font-medium text-gray-700">Stock</th>
                          <th className="px-4 py-2 text-center font-medium text-gray-700">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {formData.sizeVariations.map((size) => (
                          <tr key={size.id} className="border-t border-gray-200 hover:bg-gray-50">
                            <td className="px-4 py-3 font-medium">{size.sizeName}</td>
                            <td className="px-4 py-3 text-gray-600">
                              {size.dimension} {unitLabel}
                            </td>
                            <td className="px-4 py-3 text-right font-semibold text-blue-600">
                              {size.price.toFixed(2)} TND
                            </td>
                            <td className="px-4 py-3 text-center">
                              {size.stock > 0 ? (
                                <span className="inline-block px-2 py-1 bg-green-100 text-green-700 text-xs rounded">
                                  {size.stock} available
                                </span>
                              ) : (
                                <span className="inline-block px-2 py-1 bg-red-100 text-red-700 text-xs rounded">
                                  Out of stock
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-center">
                              <button className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors">
                                Add to Cart
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
