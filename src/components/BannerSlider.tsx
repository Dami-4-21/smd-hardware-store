import { useState, useEffect, useRef } from 'react';

interface BannerSlide {
  id: string;
  title: string;
  subtitle?: string;
  buttonText?: string;
  slideType: 'IMAGE' | 'TEXT';
  imageUrl?: string;
  backgroundColor?: string;
  textColor?: string;
  linkType?: string;
  linkedProductId?: string;
  linkedCategoryId?: string;
  displayOrder: number;
  isActive: boolean;
}

interface BannerSliderProps {
  onSlideClick?: (slide: BannerSlide) => void;
}

export default function BannerSlider({ onSlideClick }: BannerSliderProps) {
  const [slides, setSlides] = useState<BannerSlide[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Swipe gesture state
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const sliderRef = useRef<HTMLDivElement>(null);
  
  // Minimum swipe distance (in px)
  const minSwipeDistance = 50;

  useEffect(() => {
    fetchSlides();
  }, []);

  const fetchSlides = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'https://catalogquienquillerie.sqb-tunisie.com/api';
      const response = await fetch(`${apiUrl}/banners`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch banner slides');
      }

      const data = await response.json();
      if (data.success && data.data) {
        setSlides(data.data.filter((slide: BannerSlide) => slide.isActive));
      }
    } catch (err) {
      console.error('Error fetching banner slides:', err);
      setError('Failed to load banners');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (slides.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 5000); // Auto-advance every 5 seconds

    return () => clearInterval(interval);
  }, [slides.length]);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  };

  const handleSlideClick = (e: React.MouseEvent, slide: BannerSlide) => {
    // Prevent click if user was swiping
    if (touchStart !== null && touchEnd !== null) {
      const distance = Math.abs(touchStart - touchEnd);
      if (distance > 10) {
        // User was swiping, don't trigger click
        return;
      }
    }
    
    console.log('Slide clicked:', slide);
    console.log('Link type:', slide.linkType);
    console.log('Linked Category ID:', slide.linkedCategoryId);
    console.log('Linked Product ID:', slide.linkedProductId);
    
    if (onSlideClick && (slide.linkType === 'CATEGORY' || slide.linkType === 'PRODUCT')) {
      console.log('Triggering navigation...');
      onSlideClick(slide);
    } else {
      console.log('No navigation - linkType is not CATEGORY or PRODUCT');
    }
  };

  // Touch handlers for swipe gestures
  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      goToNext();
    } else if (isRightSwipe) {
      goToPrevious();
    }
  };

  // Mouse handlers for desktop swipe
  const onMouseDown = (e: React.MouseEvent) => {
    setTouchEnd(null);
    setTouchStart(e.clientX);
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (touchStart === null) return;
    setTouchEnd(e.clientX);
  };

  const onMouseUp = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      goToNext();
    } else if (isRightSwipe) {
      goToPrevious();
    }
    
    setTouchStart(null);
    setTouchEnd(null);
  };

  const onMouseLeave = () => {
    setTouchStart(null);
    setTouchEnd(null);
  };

  if (isLoading) {
    return (
      <div className="bg-gradient-to-br from-gray-700 to-gray-900 text-white px-6 py-8 animate-pulse">
        <div className="h-8 bg-gray-600 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-600 rounded w-1/2"></div>
      </div>
    );
  }

  if (error || slides.length === 0) {
    // Fallback to default banner if no slides
    return (
      <div className="bg-gradient-to-br from-gray-700 to-gray-900 text-white px-6 py-8">
        <h2 className="text-2xl font-bold mb-2">Welcome to Hardware Store</h2>
        <p className="text-gray-300">Everything you need for your projects</p>
      </div>
    );
  }

  const currentSlide = slides[currentIndex];

  return (
    <div 
      ref={sliderRef}
      className="relative overflow-hidden select-none"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseLeave}
    >
      {/* Slide Container */}
      <div
        className={`relative px-6 py-8 cursor-pointer transition-all duration-500 ${
          currentSlide.slideType === 'IMAGE' ? 'min-h-[200px]' : ''
        }`}
        style={{
          backgroundColor: currentSlide.slideType === 'TEXT' ? currentSlide.backgroundColor : undefined,
          color: currentSlide.slideType === 'TEXT' ? currentSlide.textColor : '#FFFFFF',
        }}
        onClick={(e) => handleSlideClick(e, currentSlide)}
      >
        {/* Background Image for IMAGE slides */}
        {currentSlide.slideType === 'IMAGE' && currentSlide.imageUrl && (
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url(${currentSlide.imageUrl})`,
            }}
          >
            <div className="absolute inset-0 bg-black bg-opacity-40"></div>
          </div>
        )}

        {/* Content */}
        <div className="relative z-10">
          <h2 className="text-2xl font-bold mb-2">{currentSlide.title}</h2>
          {currentSlide.subtitle && (
            <p className={currentSlide.slideType === 'IMAGE' ? 'text-white' : 'opacity-90'}>
              {currentSlide.subtitle}
            </p>
          )}
          {currentSlide.buttonText && (
            <button
              className={`mt-4 px-6 py-2 rounded-lg font-semibold transition-all ${
                currentSlide.slideType === 'IMAGE'
                  ? 'bg-white text-gray-900 hover:bg-gray-100'
                  : 'bg-opacity-20 backdrop-blur-sm border-2 hover:bg-opacity-30'
              }`}
              style={{
                borderColor: currentSlide.slideType === 'TEXT' ? currentSlide.textColor : undefined,
              }}
            >
              {currentSlide.buttonText}
            </button>
          )}
        </div>
      </div>

      {/* Dots Indicator - Only show if more than 1 slide */}
      {slides.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={(e) => {
                e.stopPropagation();
                setCurrentIndex(index);
              }}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentIndex
                  ? 'bg-white w-6'
                  : 'bg-white bg-opacity-50 hover:bg-opacity-75'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
