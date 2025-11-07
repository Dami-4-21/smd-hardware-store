import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, GripVertical, Eye, EyeOff, Image as ImageIcon } from 'lucide-react';
import { bannerService, BannerSlide } from '../services/bannerService';
import BannerSlideModal from '../components/BannerSlideModal';

export default function BannerSliderPage() {
  const [slides, setSlides] = useState<BannerSlide[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingSlide, setEditingSlide] = useState<BannerSlide | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  useEffect(() => {
    loadSlides();
  }, []);

  const loadSlides = async () => {
    try {
      setLoading(true);
      const data = await bannerService.getAllSlides();
      setSlides(data);
    } catch (error) {
      console.error('Failed to load banner slides:', error);
      alert('Failed to load banner slides');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSlide = () => {
    setEditingSlide(null);
    setShowModal(true);
  };

  const handleEditSlide = (slide: BannerSlide) => {
    setEditingSlide(slide);
    setShowModal(true);
  };

  const handleDeleteSlide = async (id: string) => {
    if (!confirm('Are you sure you want to delete this banner slide?')) {
      return;
    }

    try {
      await bannerService.deleteSlide(id);
      await loadSlides();
    } catch (error) {
      console.error('Failed to delete banner slide:', error);
      alert('Failed to delete banner slide');
    }
  };

  const handleToggleActive = async (slide: BannerSlide) => {
    try {
      await bannerService.updateSlide(slide.id, {
        isActive: !slide.isActive,
      });
      await loadSlides();
    } catch (error) {
      console.error('Failed to toggle slide status:', error);
      alert('Failed to toggle slide status');
    }
  };

  const handleSaveSlide = async () => {
    await loadSlides();
    setShowModal(false);
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newSlides = [...slides];
    const draggedSlide = newSlides[draggedIndex];
    newSlides.splice(draggedIndex, 1);
    newSlides.splice(index, 0, draggedSlide);

    setSlides(newSlides);
    setDraggedIndex(index);
  };

  const handleDragEnd = async () => {
    if (draggedIndex === null) return;

    try {
      const reorderedSlides = slides.map((slide, index) => ({
        id: slide.id,
        displayOrder: index,
      }));
      await bannerService.reorderSlides(reorderedSlides);
      await loadSlides();
    } catch (error) {
      console.error('Failed to reorder slides:', error);
      alert('Failed to reorder slides');
    } finally {
      setDraggedIndex(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Banner Slider</h1>
          <p className="text-gray-600 mt-1">Manage homepage banner slides</p>
        </div>
        <button
          onClick={handleAddSlide}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Slide
        </button>
      </div>

      {slides.length === 0 ? (
        <div className="bg-white rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
          <ImageIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No banner slides yet</h3>
          <p className="text-gray-600 mb-6">Create your first banner slide to get started</p>
          <button
            onClick={handleAddSlide}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add First Slide
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {slides.map((slide, index) => (
            <div
              key={slide.id}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
              className={`bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-move ${
                draggedIndex === index ? 'opacity-50' : ''
              }`}
            >
              <div className="flex items-center gap-4">
                {/* Drag Handle */}
                <div className="text-gray-400 cursor-grab active:cursor-grabbing">
                  <GripVertical className="w-5 h-5" />
                </div>

                {/* Preview */}
                <div className="w-32 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                  {slide.slideType === 'IMAGE' && slide.imageUrl ? (
                    <img
                      src={slide.imageUrl}
                      alt={slide.title || 'Slide'}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div
                      className="w-full h-full flex items-center justify-center text-white text-sm font-medium"
                      style={{ backgroundColor: slide.backgroundColor || '#2C3E50' }}
                    >
                      {slide.title || 'Text Slide'}
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`px-2 py-1 text-xs font-medium rounded ${
                      slide.slideType === 'IMAGE'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-purple-100 text-purple-700'
                    }`}>
                      {slide.slideType}
                    </span>
                    {slide.linkType && (
                      <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded">
                        Links to {slide.linkType}
                      </span>
                    )}
                  </div>
                  <h3 className="font-medium text-gray-900 truncate">
                    {slide.title || 'Untitled Slide'}
                  </h3>
                  {slide.subtitle && (
                    <p className="text-sm text-gray-600 truncate">{slide.subtitle}</p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleActive(slide)}
                    className={`p-2 rounded-lg transition-colors ${
                      slide.isActive
                        ? 'text-green-600 hover:bg-green-50'
                        : 'text-gray-400 hover:bg-gray-50'
                    }`}
                    title={slide.isActive ? 'Active' : 'Inactive'}
                  >
                    {slide.isActive ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                  </button>
                  <button
                    onClick={() => handleEditSlide(slide)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDeleteSlide(slide.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <BannerSlideModal
          slide={editingSlide}
          onSave={handleSaveSlide}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
}
