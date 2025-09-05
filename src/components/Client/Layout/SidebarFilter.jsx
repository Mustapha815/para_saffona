// SidebarFilter.js
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetch_categories } from '../../../api/categories';
import { useLanguage } from '../../../contexts/LanguageContext';
import { fetch_companies } from '../../../api/companies';

const SidebarFilter = ({
  isOpen,
  onClose,
  filters,
  setFilters,
  openSections,
  setOpenSections,
}) => {
  // Fetch categories from backend
  const { data: categories = [], isLoading, isError } = useQuery({
    queryKey: ['categories'],
    queryFn: fetch_categories,
  });
  const { data: brands = [] } = useQuery({
    queryKey: ['companies'],
    queryFn: fetch_companies,
  });
  console.log('brands:', brands);

  const {t}= useLanguage();
    const skinTypes = ['Oily', 'Dry', 'Combination', 'Sensitive', 'Normal'];
  const concerns = ['Acne', 'Aging', 'Hydration', 'Redness', 'Pigmentation'];

  const handleCheckboxChange = (filterType, value) => {
    setFilters((prev) => ({
      ...prev,
      [filterType]: prev[filterType].includes(value)
        ? prev[filterType].filter((item) => item !== value)
        : [...prev[filterType], value],
    }));
  };

  const handlePriceChange = (type, value) => {
    setFilters((prev) => ({
      ...prev,
      price: {
        ...prev.price,
        [type]: parseInt(value),
      },
    }));
  };

  const [isMobile, setIsMobile] = useState(window.innerWidth <= 1200);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 1200);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div
      className={`
      fixed lg:sticky top-0 left-0 ${isMobile ? 'z-50' : 'z-100'} h-screen w-3/4 max-w-sm lg:w-64 bg-white border-r border-gray-200
      transform transition-transform duration-300 ease-in-out overflow-y-auto
      ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
    `}
    >
      <div className="p-6">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5 text-gray-900"
              >
                <path d="M10 20a1 1 0 0 0 .553.895l2 1A1 1 0 0 0 14 21v-7a2 2 0 0 1 .517-1.341L21.74 4.67A1 1 0 0 0 21 3H3a1 1 0 0 0-.742 1.67l7.225 7.989A2 2 0 0 1 10 14z"></path>
              </svg>
              <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
            </div>
            <button className="lg:hidden text-gray-500 hover:text-gray-700" onClick={onClose}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Filter Sections */}
          <div className="space-y-3">
            {/* Category Filter */}
            <FilterSection
              title={t('category')}
              options={categories.map(cat => cat.name)}
              filterKey="category"
              filters={filters}
              handleCheckboxChange={handleCheckboxChange}
              isOpen={openSections.category}
              toggleOpen={() => setOpenSections((prev) => ({ ...prev, category: !prev.category }))}
            />

            {/* Brand Filter */}
            <FilterSection
              title="Brand"
              options={brands.map(brand => brand.name)}
              filterKey="brand"
              filters={filters}
              handleCheckboxChange={handleCheckboxChange}
              isOpen={openSections.brand}
              toggleOpen={() => setOpenSections((prev) => ({ ...prev, brand: !prev.brand }))}
            />

            {/* Skin Type Filter */}
            {/* <FilterSection
              title="Skin Type"
              options={skinTypes}
              filterKey="skinType"
              filters={filters}
              handleCheckboxChange={handleCheckboxChange}
              isOpen={openSections.skinType}
              toggleOpen={() => setOpenSections((prev) => ({ ...prev, skinType: !prev.skinType }))}
            /> */}

            {/* Concern Filter */}
            {/* <FilterSection
              title="Skin Concern"
              options={concerns}
              filterKey="concern"
              filters={filters}
              handleCheckboxChange={handleCheckboxChange}
              isOpen={openSections.concern}
              toggleOpen={() => setOpenSections((prev) => ({ ...prev, concern: !prev.concern }))}
            /> */}

            {/* Price Range Filter */}
            <PriceFilter 
              filters={filters} 
              handlePriceChange={handlePriceChange} 
              isOpen={openSections.price} 
              toggleOpen={() => setOpenSections((prev) => ({ ...prev, price: !prev.price }))} 
              t = {t}
            />
          </div>

          {/* Clear Filters Button */}
          <button
            className="w-full py-2 px-4 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            onClick={() =>
              setFilters({
                category: [],
                brand: [],
                skinType: [],
                concern: [],
                price: { min: 0, max: 1000 },
              })
            }
          >
          {t('clearAllFilters')}
          </button>
        </div>
      </div>
    </div>
  );
};

// Reusable Filter Section Component
const FilterSection = ({ title, options, filterKey, filters, handleCheckboxChange, isOpen, toggleOpen }) => (
  <div className="border border-gray-200 rounded-lg">
    <button
      className="flex w-full items-center justify-between px-4 py-3 text-gray-900 font-medium hover:no-underline"
      onClick={toggleOpen}
    >
      {title}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={`text-gray-500 size-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
      >
        <path d="m6 9 6 6 6-6"></path>
      </svg>
    </button>
    <div className={`overflow-hidden transition-all duration-200 ${isOpen ? 'max-h-96' : 'max-h-0'}`}>
      <div className="px-4 pb-3 space-y-2">
        {options.map((item, idx) => (
          <label key={idx} className="flex items-center gap-2">
            <input
              type="checkbox"
              className="rounded text-blue-500 focus:ring-blue-500"
              checked={filters[filterKey].includes(item)}
              onChange={() => handleCheckboxChange(filterKey, item)}
            />
            <span className="text-sm">{item}</span>
          </label>
        ))}
      </div>
    </div>
  </div>
);

// Price Filter Component
const PriceFilter = ({ filters, handlePriceChange, isOpen, toggleOpen,t }) => (
  <div className="border border-gray-200 rounded-lg">
    <button
      className="flex w-full items-center justify-between px-4 py-3 text-gray-900 font-medium hover:no-underline"
      onClick={toggleOpen}
    >
     {t('priceRange')}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={`text-gray-500 size-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
      >
        <path d="m6 9 6 6 6-6"></path>
      </svg>
    </button>
    <div className={`overflow-hidden transition-all duration-200 ${isOpen ? 'max-h-96' : 'max-h-0'}`}>
      <div className="px-4 pb-3 space-y-4">
        <div>
          <label className="block text-sm text-gray-500 mb-1">{t('minPrice')}: {filters.price.min} DHS</label>
          <input
            type="range"
            min="0"
            max="1000"
            value={filters.price.min}
            onChange={(e) => handlePriceChange('min', e.target.value)}
            className="w-full"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-500 mb-1">{t('maxPrice')}: {filters.price.max} DHS</label>
          <input
            type="range"
            min="0"
            max="1000"
            value={filters.price.max}
            onChange={(e) => handlePriceChange('max', e.target.value)}
            className="w-full"
          />
        </div>
        <div className="flex justify-between text-sm text-gray-500">
          <span>{filters.price.min} DHS</span>
          <span>{filters.price.max} DHS</span>
        </div>
      </div>
    </div>
  </div>
);

export default SidebarFilter;