import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  Sparkles, 
  ArrowRight,
  Truck,
  Award,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { fetch_products } from '../../../api/products';
import { fetch_packs } from '../../../api/packs';
import { useLanguage } from '../../../contexts/LanguageContext';

const HeroSection = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const { t } = useLanguage();

  const { data: productsData } = useQuery({
    queryKey: ['products'],
    queryFn: fetch_products
  });
  
  const { data: packsData } = useQuery({
    queryKey: ['packs'],
    queryFn: fetch_packs
  });

  // معالجة البيانات وإنشاء الشرائح مع تصفية المخزون
  const slides = useMemo(() => {
    if (!productsData || !packsData) return [];
    
    // تصفية المنتجات التي لديها مخزون إيجابي
    const availableProducts = productsData.filter(product => product.stock > 0);
    const availablePacks = packsData.filter(pack => pack.stock > 0);
    
    // تصفية المنتجات التي لديها عروض (offer_price) ومخزون إيجابي
    const productsWithOffers = availableProducts.filter(product => product.offer_price);
    
    // فرز المنتجات حسب عدد النقرات (number_click)
    const sortedProducts = [...availableProducts]
      .filter(product => !product.offer_price) // استبعاد المنتجات التي لديها عروض
      .sort((a, b) => (b.number_click || 0) - (a.number_click || 0));
    
    // فرز الباقات حسب عدد النقرات
    const sortedPacks = [...availablePacks]
      .sort((a, b) => (b.number_click || 0) - (a.number_click || 0));
    
    let slides = [];
    
    // إذا كان هناك منتجات لديها عروض، أضف 8 منها
    if (productsWithOffers.length > 0) {
      slides = productsWithOffers.slice(0, 8).map(product => ({
        id: product.id,
        title: product.name,
        price: `${product.offer_price} MAD`,
        oldPrice: `${product.price} MAD`,
        image: `${import.meta.env.VITE_IMG_BASE_URL}/${product.image}`,
        badge: 'OFFER',
        bgColor: 'from-[#79d6d5] to-teal-100',
        type: 'product'
      }));
    } else {
      // إذا لم يكن هناك عروض، أضف 4 منتجات و4 باقات
      const topProducts = sortedProducts.slice(0, 4);
      const topPacks = sortedPacks.slice(0, 4);
      
      slides = [
        ...topProducts.map(product => ({
          id: `product-${product.id}`,
          title: product.name,
          price: `${product.price} MAD`,
          oldPrice: null,
          image: `${import.meta.env.VITE_IMG_BASE_URL}/${product.image}`,
          badge: 'POPULAR',
          bgColor: 'from-blue-100 to-cyan-100',
          type: 'product'
        })),
        ...topPacks.map(pack => ({
          id: `pack-${pack.id}`,
          title: pack.name,
          price: `${pack.price} MAD`,
          oldPrice: null,
          image: pack.products && pack.products.length > 0 && pack.products[0].image 
            ? `${import.meta.env.VITE_IMG_BASE_URL}/${pack.products[0].image}`
            : '/placeholder-image.jpg',
          badge: 'PACK',
          bgColor: 'from-green-100 to-emerald-100',
          type: 'pack'
        }))
      ];
    }
    
    return slides;
  }, [productsData, packsData]);

  // Auto-advance slides
  useEffect(() => {
    if (slides.length === 0) return;
    
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    
    return () => clearInterval(timer);
  }, [slides.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };
    if (!productsData || !packsData) {
    return (
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 min-h-[500px] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">{t('loadingProducts')}</p>
        </div>
      </section>
    );
  }
  return (
<section className="relative overflow-hidden bg-gradient-to-br from-teal-400/90 to-teal-300/90 ">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-32 h-32 bg-emerald-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 md:opacity-30 md:w-72 md:h-72 animate-blob"></div>
      <div className="absolute bottom-0 right-0 w-40 h-40 bg-teal-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 md:opacity-30 md:w-72 md:h-72 animate-blob animation-delay-2000"></div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-16 lg:py-24">
        {/* Mobile-only slider with full width */}
        <div className="lg:hidden w-full mb-8">
          <div className="relative">
            {/* Slider container */}
            <div className="bg-white rounded-3xl p-4 shadow-2xl overflow-hidden">
              <div className="relative">
                {/* Slides */}
                <div className="overflow-hidden rounded-2xl">
                  <div 
                    className="flex transition-transform duration-500 ease-in-out"
                    style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                  >
                    {slides.map((slide, index) => (
                      <div 
                        key={slide.id}
                        className={`w-full flex-shrink-0 bg-gradient-to-br ${slide.bgColor} rounded-2xl p-4 flex items-center justify-center h-64`}
                      >
                        <div className="text-center relative w-full">
                          <div className="absolute -top-2 -left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full z-10">
                            {slide.badge}
                          </div>
                          
                          {/* Product Image */}
                          <div className="w-32 h-32 mx-auto mb-4 rounded-2xl overflow-hidden shadow-md">
                            <img 
                              src={slide.image} 
                              alt={slide.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          
                          <h3 className="text-xl font-bold text-gray-900 mt-2">{slide.title}</h3>
                          <div className="mt-2 flex items-center justify-center">
                            <span className="text-2xl font-bold text-emerald-600">{slide.price}</span>
                            <span className="text-sm text-gray-500 line-through ml-2">{slide.oldPrice}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Navigation arrows */}
                <button 
                  onClick={prevSlide}
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-md transition-all duration-300 z-20"
                >
                  <ChevronLeft className="h-5 w-5 text-gray-700" />
                </button>
                
                <button 
                  onClick={nextSlide}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-md transition-all duration-300 z-20"
                >
                  <ChevronRight className="h-5 w-5 text-gray-700" />
                </button>
                
                {/* Slide indicators */}
                <div className="absolute bottom-3 left-8 right-0 flex justify-center space-x-2 z-20">
                  {slides.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentSlide(index)}
                      className={`w-2 h-2 rounded-full transition-all duration-300 ${
                        index === currentSlide ? 'bg-emerald-600 w-6' : 'bg-black/60'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
            
            {/* Floating elements for mobile with increased bottom padding */}
            <div className="absolute -bottom-8 -left-3 bg-white rounded-xl p-2 shadow-lg transform -rotate-6">
              <div className="flex items-center">
                <div className="bg-emerald-100 p-2 rounded-lg">
                  <Truck className="h-5 w-5 text-emerald-600" />
                </div>
                <div className="ml-2">
                  <p className="text-xs font-medium">{t('freeDelivery')}</p>
                  <p className="text-xs text-gray-500">{t('fromAmount')}</p>
                </div>
              </div>
            </div>
            
            <div className="absolute -top-4 -right-3 bg-white rounded-xl p-2 shadow-lg transform rotate-6 mb-6">
              <div className="flex items-center">
                <div className="bg-emerald-100 p-2 rounded-lg">
                  <Award className="h-5 w-5 text-emerald-600" />
                </div>
                <div className="ml-2">
                  <p className="text-xs font-medium">{t('quality')}</p>
                  <p className="text-xs text-gray-500">{t('guaranteed')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12">
          {/* Text Content - Hidden on mobile, shown on desktop */}
          <div className="hidden lg:flex order-2 lg:order-1 flex-1 text-center lg:text-left">
            <div className="w-full">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-emerald-100 text-emerald-800 font-medium mb-6">
                <Sparkles className="h-4 w-4 mr-2" />
               {t('premiumProducts')}
              </div>

              <h1 className="text-5xl lg:text-6xl font-bold text-white leading-tight">
                {t('wellnessJourney')}
                <span className="block bg-gradient-to-r from-emerald-600 to-teal-900 bg-clip-text text-transparent">{t('startsHere')}</span>
              </h1>
              
              
         
            </div>
          </div>
          
          {/* Hero Image Slider - Hidden on mobile, shown on desktop */}
          <div className="hidden  lg:flex order-1 lg:order-2 flex-1 w-full max-w-md mx-auto lg:max-w-none">
            <div className="relative "style={{ width: '600px' }}>
              {/* Slider container */}
              <div className="bg-white rounded-3xl p-2 shadow-2xl transform lg:rotate-2 overflow-hidden">
                <div className="relative">
                  {/* Slides */}
                  <div className="overflow-hidden rounded-2xl">
                    <div 
                      className="flex transition-transform duration-500 ease-in-out"
                      style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                    >
                      {slides.map((slide, index) => (
                        <div 
                          key={slide.id}
                          className={`w-full flex-shrink-0 bg-gradient-to-br ${slide.bgColor} rounded-2xl p-6 flex items-center justify-center h-64`}
                        >
                          <div className="text-center relative w-full">
                            <div className="absolute -top-1 -left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full z-10">
                              {slide.badge}
                            </div>
                            
                            {/* Product Image */}
                            <div className="w-40 h-40 mx-auto mb-4 rounded-2xl overflow-hidden shadow-md">
                              <img 
                                src={slide.image} 
                                alt={slide.title}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            
                            <h3 className="text-xl font-bold text-gray-900 mt-2">{slide.title}</h3>
                            <div className="mt-2 flex items-center justify-center">
                              <span className="text-2xl font-bold text-emerald-600">{slide.price}</span>
                              <span className="text-sm text-gray-500 line-through ml-2">{slide.oldPrice}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Navigation arrows */}
                  <button 
                    onClick={prevSlide}
                    className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-md transition-all duration-300 z-20"
                  >
                    <ChevronLeft className="h-5 w-5 text-gray-700" />
                  </button>
                  
                  <button 
                    onClick={nextSlide}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-md transition-all duration-300 z-20"
                  >
                    <ChevronRight className="h-5 w-5 text-gray-700" />
                  </button>
                  
                  {/* Slide indicators */}
                  <div className="absolute left-0 right-0 flex justify-center space-x-2 z-20">
                    {slides.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentSlide(index)}
                        className={`w-2 h-1.5 rounded-full transition-all duration-300 ${
                          index === currentSlide ? 'bg-emerald-600 w-6' : 'bg-black/60'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Floating elements for desktop */}
              <div className="absolute -bottom-4 -left-4 bg-white rounded-xl p-3 shadow-lg transform -rotate-6">
                <div className="flex items-center">
                  <div className="bg-emerald-100 p-2 rounded-lg">
                    <Truck className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div className="ml-2">
                    <p className="text-xs font-medium">{t('freeDelivery')}</p>
                    <p className="text-xs text-gray-500">{t('fromAmount')}</p>
                  </div>
                </div>
              </div>
              
              <div className="absolute -top-3 -right-4 bg-white rounded-xl p-3 shadow-lg transform rotate-6 mb-8">
                <div className="flex items-center">
                  <div className="bg-emerald-100 p-2 rounded-lg">
                    <Award className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div className="ml-2">
                    <p className="text-xs font-medium">{t('quality')}</p>
                    <p className="text-xs text-gray-500">{t('guaranteed')}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Add custom animation */}
      <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
      `}</style>
        <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-white to-transparent pointer-events-none"></div>

    </section>
  );
};

export default HeroSection;
