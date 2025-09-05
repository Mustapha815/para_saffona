import React, { useEffect, useRef, useState } from 'react';
import { Loader } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetch_companies } from '../../../api/companies';

const BrandSection = () => {
  // Hardcoded brand data - replace with API later
    const { data: brands = [] } = useQuery({
    queryKey: ['companies'],
    queryFn: fetch_companies,
  });
  
  




  const [duplicatedBrands, setDuplicatedBrands] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const scrollContainerRef = useRef(null);
  const [isPaused, setIsPaused] = useState(false);
  const animationFrameRef = useRef(null);
  const scrollSpeedRef = useRef(1); // Adjust scroll speed here

  useEffect(() => {
    const initializeBrands = async () => {
      try {
        setIsLoading(true);
        
        // Simulate API loading delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Duplicate brands for seamless scrolling
        setDuplicatedBrands([...brands]);
      } catch (err) {
        console.error('Failed to initialize brands:', err);
      } finally {
        setIsLoading(false);
      }
    };

    initializeBrands();
  }, [brands]);

  // Auto-scroll function using requestAnimationFrame for smoother animation
  const autoScroll = () => {
    if (isPaused || !scrollContainerRef.current || duplicatedBrands.length === 0) {
      animationFrameRef.current = requestAnimationFrame(autoScroll);
      return;
    }

    const container = scrollContainerRef.current;
    const maxScroll = container.scrollWidth / 2; // Since we duplicated content
    
    // Check if we've reached the end of the original content
    if (container.scrollLeft >= maxScroll - 10) {
      // When we reach the end, instantly but invisibly jump back to the beginning
      container.scrollTo({ 
        left: container.scrollLeft - maxScroll, 
        behavior: 'instant' 
      });
    } else {
      // Otherwise, continue scrolling
      container.scrollBy({ left: scrollSpeedRef.current, behavior: 'auto' });
    }

    animationFrameRef.current = requestAnimationFrame(autoScroll);
  };

  // Start/stop auto-scroll based on pause state
  useEffect(() => {
    if (duplicatedBrands.length > 0) {
      animationFrameRef.current = requestAnimationFrame(autoScroll);
    }
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPaused, duplicatedBrands]);

  // Handle brand click - navigate to brand products page
  const navigate = useNavigate();

  const handleBrandClick = (brandId) => {
    navigate(`/brands/${brandId}`); // هادي اللي كتمشي لصفحة البراند
  };

  // Pause auto-scroll on hover/touch
  const handleMouseEnter = () => {
    setIsPaused(true);
  };

  // Resume auto-scroll when not hovering/touching
  const handleMouseLeave = () => {
    setIsPaused(false);
  };

  // Loading skeleton component
  const renderSkeletons = () => {
    return Array.from({ length: brands.length }).map((_, index) => (
      <div 
        key={index} 
        className="flex-shrink-0 bg-gray-200 rounded-lg px-4 py-3 border border-gray-300 mx-2 animate-pulse"
        style={{ minWidth: '100px' }}
      >
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 bg-gray-300 rounded-full"></div>
          <div className="h-3 bg-gray-300 rounded w-12"></div>
        </div>
      </div>
    ));
  };
  
  return (
    <>
      
<section className="py-8 bg-white">
  <div className="container mx-auto px-4">
    <div className="relative">
      {/* Section Header with Badge */}

      
      {/* Horizontal scrolling brands container */}
      <div 
        ref={scrollContainerRef}
        className="flex overflow-x-auto scrollbar-hide py-2"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleMouseEnter}
        onTouchEnd={handleMouseLeave}
      >
        <div className="flex">
          {isLoading ? (
            renderSkeletons()
          ) : (
            duplicatedBrands.map((brand, index) => (
          <div 
            key={`${brand.id}-${index}`} 
            onClick={() => handleBrandClick(brand.id)}
            className="flex-shrink-0 rounded-tl-xl rounded-br-xl px-4 py-3 
           cursor-pointer mx-2 min-w-[100px]
           bg-[radial-gradient(100%_100%_at_100%_0%,#4CA3AF_0%,#41c9b8_100%)]
           text-white shadow-[0px_0.01em_0.01em_rgba(45,35,66,0.4),
                             0px_0.3em_0.7em_-0.01em_rgba(45,35,66,0.3),
                             inset_0px_-0.01em_0px_rgba(58,65,111,0.5)]
           transition duration-200 ease-in-out
           hover:shadow-[0px_0.1em_0.2em_rgba(45,35,66,0.4),
                         0px_0.4em_0.7em_-0.1em_rgba(45,35,66,0.3),
                         inset_0px_-0.1em_0px_#2e8f83]
           hover:-translate-y-[0.1em]
           active:shadow-[inset_0px_0.1em_0.6em_#2e8f83]
           active:translate-y-0"
          >
            <div className="flex items-center justify-center">
              <h3 className="text-sm font-semibold whitespace-nowrap [text-shadow:0_1px_0_rgba(0,0,0,0.4)]">
                <Link to={`/brands/${brand.id}`} className="text-white hover:text-gray-100 transition-colors">
                  {brand.name}
                </Link>
              </h3>
            </div>
          </div>

            ))
          )}
        </div>
      </div>

      {/* Loading indicator */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-80">
          <Loader className="w-6 h-6 text-blue-500 animate-spin" />
        </div>
      )}
    </div>
  </div>

  <style jsx>{`
    .scrollbar-hide::-webkit-scrollbar {
      display: none;
    }
    .scrollbar-hide {
      -ms-overflow-style: none;
      scrollbar-width: none;
    }
    
    @media (max-width: 640px) {
      .brand-item {
        min-width: 90px;
        padding-left: 0.75rem;
        padding-right: 0.75rem;
      }
    }
  `}</style>
</section>
    </>
  );
};

export default BrandSection;