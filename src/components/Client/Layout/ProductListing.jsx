import React, { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetch_products } from '../../../api/products';
import { fetch_packs } from '../../../api/packs';
import { fetch_categories } from '../../../api/categories';
import SidebarFilter from './SidebarFilter';
import ProductGrid from './ProductGrid';
import { useLanguage } from '../../../contexts/LanguageContext';

// Main Product Listing Component
const ProductListing = () => {
  const { t } = useLanguage();
  const { data: all_products = [], isLoading: productsLoading, isError: productsError } = useQuery({
    queryKey: ['products'],
    queryFn: fetch_products,
  });
  const products = all_products.filter(product => product.stock > 0);

  const { data: all_packs = [], isLoading: packsLoading, isError: packsError } = useQuery({
    queryKey: ['packs'],
    queryFn: fetch_packs,
  });
 const packs = all_packs.filter(pack => pack.stock > 0);

  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    category: [],
    brand:[],
    price: { min: 0, max: 1000 }
  });
  const [openSections, setOpenSections] = useState({
    category: true,
    brand: true,
    price: true
  });
  const [sortOption, setSortOption] = useState('featured');
  const [searchQuery, setSearchQuery] = useState('');
  const [productTypeFilter, setProductTypeFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Combine products and packs into a single array with type identification
  const allItems = useMemo(() => {
    const productItems = products.map(product => ({
      ...product,
      itemType: 'product',
      displayPrice: product.offer_price ? parseFloat(product.offer_price) : parseFloat(product.price),
      originalPrice: product.offer_price ? parseFloat(product.price) : null,
      // Extract category name for filtering
      categoryName: product.category?.name || t('uncategorized'),
    }));

    const packItems = packs.map(pack => ({
      ...pack,
      itemType: 'pack',
      displayPrice: pack.offer_price ? parseFloat(pack.offer_price) : parseFloat(pack.price),
      originalPrice: pack.offer_price ? parseFloat(pack.price) : null,
      // For packs, use a default category
      categoryName: 'Packages',
      // Include products for display purposes
      packProducts: pack.products || []
    }));

    return [...productItems, ...packItems];
  }, [products, packs]);
  
  // 🟢 Filtered items (products and packs)
 const filteredItems = useMemo(() => {
  let result = [...allItems];

  if (searchQuery) {
    const query = searchQuery.toLowerCase();
    result = result.filter(item =>
      item.name.toLowerCase().includes(query) ||
      (item.description?.toLowerCase().includes(query) || '') ||
      (item.categoryName?.toLowerCase().includes(query) || '')
    );
  }

  if (productTypeFilter !== 'all') {
    result = result.filter(item => {
      if (productTypeFilter === 'packages') return item.itemType === 'pack';
      if (productTypeFilter === 'offers') return item.offer_price !== null && item.itemType !== 'pack';
      return true;
    });
  }

  // ✅ فلترة بالـ Category
  if (filters.category.length > 0) {
    result = result.filter(item => 
      filters.category.includes(item.categoryName)
    );
  }

  // ✅ فلترة بالـ Brand
  if (filters.brand.length > 0) {
    result = result.filter(item => 
      filters.brand.includes(item.company?.name || '')
    );
  }

  // ✅ فلترة بالسعر
  result = result.filter(item =>
    item.displayPrice >= filters.price.min && item.displayPrice <= filters.price.max
  );

  // ✅ Sort
  switch (sortOption) {
    case 'price-low-high':
      result.sort((a, b) => a.displayPrice - b.displayPrice);
      break;
    case 'price-high-low':
      result.sort((a, b) => b.displayPrice - a.displayPrice);
      break;
    case 'name-a-z':
      result.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case 'name-z-a':
      result.sort((a, b) => b.name.localeCompare(a.name));
      break;
    default:
      result.sort((a, b) => {
        if (a.offer_price && !b.offer_price) return -1;
        if (!a.offer_price && b.offer_price) return 1;
        if (a.itemType === 'product' && b.itemType === 'pack') return -1;
        if (a.itemType === 'pack' && b.itemType === 'product') return 1;
        return a.name.localeCompare(b.name);
      });
      break;
  }

  return result;
}, [allItems, filters, sortOption, searchQuery, productTypeFilter]);

  // 🟢 Pagination
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const currentItems = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredItems.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredItems, currentPage, itemsPerPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filters, searchQuery, productTypeFilter]);

  const isLoading = productsLoading || packsLoading;
  const isError = productsError || packsError;

  if (isLoading) return <p className="p-4 text-gray-500">Loading products and packs...</p>;
  if (isError) return <p className="p-4 text-red-500">Error fetching products or packs.</p>;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <SidebarFilter 
          isOpen={isMobileFilterOpen}
          onClose={() => setIsMobileFilterOpen(false)}
          filters={filters}
          setFilters={setFilters}
          openSections={openSections}
          setOpenSections={setOpenSections}
          allItems={allItems}
        />

        <ProductGrid 
          products={currentItems}
          toggleMobileFilter={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
          sortOption={sortOption}
          handleSortChange={(e) => setSortOption(e.target.value)}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          productTypeFilter={productTypeFilter}
          setProductTypeFilter={setProductTypeFilter}
          currentPage={currentPage}
          totalPages={totalPages}
          handlePageChange={(page) => {
            setCurrentPage(page);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />
      </div>

      {isMobileFilterOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsMobileFilterOpen(false)}
        ></div>
      )}
    </div>
  );
};

export default ProductListing;