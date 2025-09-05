// Product Grid Component
import { Eye, Heart, ShoppingCart, Tag, Package, ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import ProductDetails from './ProductDetails';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { 
  addToCart, 
  increaseQuantity, 
  decreaseQuantity, 
  showProductDetails, 
  hideProductDetails,
  showPackDetails,
  hidePackDetails,
} from '../../../redux/action';
import { increment_pack_click } from '../../../api/packs';
import { increment_product_click } from '../../../api/products';
import { toggle_favorite, getFavorites } from '../../../api/favorites';
import Alert from '../halpers/Alert';
import { useLanguage } from '../../../contexts/LanguageContext';
import { Navigate, useNavigate } from 'react-router-dom';

const ProductGrid = ({ 
  products, 
  toggleMobileFilter, 
  sortOption, 
  handleSortChange, 
  searchQuery, 
  setSearchQuery, 
  productTypeFilter, 
  setProductTypeFilter,
  currentPage,
  totalPages,
  handlePageChange
}) => {
  const dispatch = useDispatch();
  const navigate = useNavigate()
  const queryClient = useQueryClient();
  const { t } = useLanguage();
  const { cartItems, selectedProduct, showProductDetails: showDetails, selectedPack, showPackDetails: showPackDetail } = useSelector(state => state.client);
    const [showAlert, setShowAlert] = useState(false);

  // Check if user is logged in
  const isLogged = localStorage.getItem('islogged') === 'true';

  // Fetch favorites from API
  const { data: favoritesData = {}, isLoading: favoritesLoading, isError: favoritesError, refetch: refetchFavorites } = useQuery({
    queryKey: ['favorites'],
    queryFn: getFavorites,
    enabled: isLogged, // Only fetch favorites if user is logged in
  });

  const inc_pack_click = useMutation({
    mutationFn: increment_pack_click,
  });
  
  const inc_product_click = useMutation({
    mutationFn: increment_product_click,
  });
  
const toggleFavoriteMutation = useMutation({
  mutationFn: toggle_favorite,
  onMutate: async ({ type, id, item }) => {
    if (!isLogged) throw new Error('User not logged in');

    await queryClient.cancelQueries(['favorites']);

    const previousFavorites = queryClient.getQueryData(['favorites']) || { products: [], packs: [] };

    queryClient.setQueryData(['favorites'], (old = { products: [], packs: [] }) => {
      if (type === 'pack') {
        const isFav = old.packs.some(p => p.id === id);
        return {
          ...old,
          packs: isFav
            ? old.packs.filter(p => p.id !== id)
            : [...old.packs, { ...item, id }]
        };
      } else {
        const isFav = old.products.some(p => (p.target_id || p.id) === id);
        return {
          ...old,
          products: isFav
            ? old.products.filter(p => (p.target_id || p.id) !== id)
            : [...old.products, { target: { ...item }, id: Date.now(), target_id: id }]
        };
      }
    });

    return { previousFavorites };
  },
  onError: (err, variables, context) => {
    queryClient.setQueryData(['favorites'], context.previousFavorites);
  },
  onSuccess: () => {
    queryClient.invalidateQueries(['favorites']);
  },
});


const isFavorite = (itemId, isPack = false) => {
  if (!isLogged) return false;
  
  const favorites = queryClient.getQueryData(["favorites"]);
  if (!favorites) return false;

  if (isPack) {
    return favorites.packs?.some((p) => p.id === itemId) || false;
  } else {
    return favorites.products?.some((p) => (p.target_id || p.id) === itemId) || false;
  }
};


  // Get quantity for a specific product or pack
  const getItemQuantity = (itemId, isPack = false) => {
    const item = cartItems.find(item => item.id === itemId && item.isPack === isPack);
    return item ? item.quantity : 0;
  };

  // Handle view product/pack click
  const handleViewItem = (item, isPack = false) => {
    if (isPack) {
      dispatch(showPackDetails(item));
      inc_pack_click.mutate(item.id);
    } else {
      dispatch(showProductDetails(item));
      inc_product_click.mutate(item.id);
    }
  };

  // Handle add to cart
  const handleAddToCart = (item, isPack = false) => {
    dispatch(addToCart({...item, isPack}));
  };

  // Handle increase quantity
  const handleIncreaseQuantity = (itemId, isPack = false) => {
    dispatch(increaseQuantity(itemId, isPack));
  };

  // Handle decrease quantity
  const handleDecreaseQuantity = (itemId, isPack = false) => {
    dispatch(decreaseQuantity(itemId, isPack));
  };

  // Unified toggle favorite function
  const handleToggleFavorite = (item, isPack = false) => {
    if (!isLogged) {
          setShowAlert(true);
      return;
    }

    // Update API using the toggle_favorite method
    const formData = {
      type: isPack ? 'pack' : 'product',
      id: item.id,
      item: item // إضافة العنصر للاستخدام في الـ optimistic update
    };
    
    toggleFavoriteMutation.mutate(formData);
  };

  // Handle add to cart from details
  const handleAddToCartFromDetails = (item, quantity, isPack = false) => {
    for (let i = 0; i < quantity; i++) {
      dispatch(addToCart({...item, isPack}));
    }
  };

  // Calculate discount percentage
  const getDiscountPercentage = (item) => {
    if (item.offer_price && item.price) {
      return Math.round((1 - parseFloat(item.offer_price) / parseFloat(item.price)) * 100);
    }
    return 0;
  };

  // Get display image for item (product or pack)
  const getDisplayImage = (item) => {
    if (item.image) {
      return `${import.meta.env.VITE_IMG_BASE_URL}/${item.image}`;
    }
    // For packs with multiple products, use the first product's image
    if (item.packProducts && item.packProducts.length > 0 && item.packProducts[0].image) {
      return `${import.meta.env.VITE_IMG_BASE_URL}/${item.packProducts[0].image}`;
    }
    return '/placeholder-image.jpg'; // Fallback image
  };

  // Get all images for packs
  const getAllPackImages = (pack) => {
    const images = [];
    
    // Add pack main image if available
    if (pack.image) {
      images.push(`${import.meta.env.VITE_IMG_BASE_URL}/${pack.image}`);
    }
    
    // Add images from all products in the pack
    if (pack.packProducts && pack.packProducts.length > 0) {
      pack.packProducts.forEach(product => {
        if (product.image) {
          images.push(`${import.meta.env.VITE_IMG_BASE_URL}/${product.image}`);
        }
      });
    }
    
    return images.length > 0 ? images : ['/placeholder-image.jpg'];
  };

  // Get display name for item
  const getDisplayName = (item) => {
    return item.name || (item.itemType === 'pack' ? 'Pack' : 'Product');
  };

  // Get display price for item
  const getDisplayPrice = (item) => {
    if (item.offer_price) {
      return parseFloat(item.offer_price).toFixed(2);
    }
    return parseFloat(item.price).toFixed(2);
  };

  // Get original price for item (if on offer)
  const getOriginalPrice = (item) => {
    if (item.offer_price && item.price) {
      return parseFloat(item.price).toFixed(2);
    }
    return null;
  };

  return (
  <>
  {showAlert && (
  <Alert
    show={showAlert} 
    onClose={() => setShowAlert(false)}
    duration={3000} // 3 ثواني
    message={t('pleaseLog')}
  />
  )}

    <div className="flex-1 p-4 lg:p-6 bg-white">
      {/* Header */}
      <div className="flex flex-col gap-4 mb-6">
        {/* Search and Filters Row */}
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          {/* Search Input */}
          <div className="flex-1 w-full">
            <div className="relative">
              <input
                type="text"
                placeholder={t('searchProducts')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>
          <div className='flex gap-6'>
          </div>
          {/* Product Type Filter */}
          <div className='flex gap-8'>
            <div className="sm:w-48">
            <select
              className="focus:ring-2 focus:ring-blue-500 w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-xs transition-all outline-none h-10 bg-white"
              value={productTypeFilter}
              onChange={(e) => setProductTypeFilter(e.target.value)}
            >
              <option value="all">{t('allProducts')}</option>
              <option value="packages">{t('packages')}</option>
              <option value="offers">{t('specialOffers')}</option>
            </select>
          </div>

          {/* Sort Dropdown */}
          <div className="sm:w-48">
            <select 
              className="focus:ring-2 focus:ring-blue-500 w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-xs transition-all outline-none h-10 bg-white"
              value={sortOption}
              onChange={handleSortChange}
            >
              <option value="featured">{t('featured')}</option>
              <option value="price-low-high">{t('price-low-high')}</option>
              <option value="price-high-low">{t('price-high-low')}</option>
              <option value="name-a-z">{t('name-a-z')}</option>
              <option value='name-z-a'>{t('name-z-a')}</option>
            </select>
          </div>
          </div>
        </div>

        {/* Title and Sort Row */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-xl lg:text-2xl font-semibold text-gray-900 mb-1">{t('products')} ({products.length})</h1>
          </div>
          
          <div className="flex items-center gap-3 w-full sm:w-auto">
            {/* Mobile Filter Button */}
            <button 
              className="justify-center whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 outline-none focus:ring-2 focus:ring-blue-500 border border-gray-300 bg-white text-gray-700 shadow-xs hover:bg-gray-50 h-9 px-4 py-2 flex items-center gap-2 flex-1 sm:flex-initial lg:hidden"
              onClick={toggleMobileFilter}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true">
                <path d="M10 20a1 1 0 0 0 .553.895l2 1A1 1 0 0 0 14 21v-7a2 2 0 0 1 .517-1.341L21.74 4.67A1 1 0 0 0 21 3H3a1 1 0 0 0-.742 1.67l7.225 7.989A2 2 0 0 1 10 14z"></path>
              </svg>
              {t('filters')}
            </button>
          </div>
        </div>
      </div>
      
      {/* Product Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        {products.map(item => {
          const isPack = item.itemType === 'pack';
          const quantity = getItemQuantity(item.id, isPack);
          const isFav = isFavorite(item.id, isPack);
          const hasOffer = item.offer_price && item.price && parseFloat(item.offer_price) > 0;
          const discountPercentage = getDiscountPercentage(item);
          const displayName = getDisplayName(item);
          const displayPrice = getDisplayPrice(item);
          const originalPrice = getOriginalPrice(item);
          
          // For packs, get all images for the slider
          const packImages = isPack ? getAllPackImages(item) : [];
          
          return (
            <div key={`${isPack ? 'pack-' : 'product-'}${item.id}`} className="group bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer flex flex-col h-full">
              <div className="relative aspect-square overflow-hidden"   
              onClick={(e) => {
                      e.stopPropagation();
                      handleViewItem(item, isPack);
                    }}>
                {isPack && packImages.length > 1 ? (
                  // Auto-scrolling image slider for packs with multiple images
                  <PackImageSlider images={packImages} alt={displayName} />
                ) : (
                  // Single image for products or packs with only one image
                  <img 
                                    
                    src={isPack && packImages.length > 0 ? packImages[0] : getDisplayImage(item)}
                    alt={displayName} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      e.target.src = '/placeholder-image.jpg';
                    }}
                  />
                )}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300"></div>
                
                {/* Category/Pack name at bottom left of image */}
                <div className="absolute bottom-2 left-2">
                  <span className="bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded flex items-center">
                    {isPack ? (
                      <>
                        <Package className="h-3 w-3 mr-1" />
                        Pack
                      </>
                    ) : (
                      item.categoryName || t('uncategorized')
                    )}
                  </span>
                </div>
                
                {/* Item badges */}
                <div className="absolute top-2 left-2">
                  {/* Offer Badge */}
                  {hasOffer && (
                    <div className="bg-red-500 text-white text-xs px-2 py-1 rounded-full flex items-center mb-1">
                      <Tag className="h-3 w-3 mr-1" />
                      -{discountPercentage}%
                    </div>
                  )}
                  
                  {/* Pack badge */}
                  {isPack && (
                    <div className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full flex items-center mb-1">
                      <Package className="h-3 w-3 mr-1" />
                      {item.packProducts?.length || 0} {t('items')}
                    </div>
                  )}
                </div>
                
                {/* Heart icon (always visible) */}
                <button 
                  className="absolute top-2 right-2 w-8 h-8 bg-white border border-gray-200 rounded-full flex items-center justify-center hover:bg-gray-50 shadow-md transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleFavorite(item, isPack);
                  }}
                  disabled={toggleFavoriteMutation.isLoading}
                >
                  {toggleFavoriteMutation.isLoading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-500"></div>
                  ) : (
                    <Heart className={`h-4 w-4 ${isFav ? 'text-red-500 fill-red-500' : 'text-gray-500 hover:text-red-500'}`} />
                  )}
                </button>
              </div>
              
              {/* Item Info - Reduced spacing */}
              <div className="p-3 flex-1 flex flex-col">
                <h2 className="font-medium text-medium text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2 flex-1">
                  {displayName}
                </h2>
                
                {/* Pricing in same row with spacing - removed margin */}
                <div className="flex items-center justify-between mt-2">
                  {hasOffer ? (
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-base text-gray-900">
                        {displayPrice} DHS
                      </span>
                      <span className="text-xs text-red-400 line-through">
                        {originalPrice} DHS
                      </span>
                    </div>
                  ) : (
                    <span className="font-semibold text-base text-gray-900">
                      {displayPrice} DHS
                    </span>
                  )}
                </div>
                
                {/* Action Buttons - Larger with Add to Cart text */}
                <div className="flex justify-end gap-2 mt-3">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewItem(item, isPack);
                    }}
                    className="p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-600 hover:text-white transition-colors duration-200 flex items-center justify-center"
                    title="View Details"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                                    
                  {/* Quantity Controls or Add to Cart Button */}
                  {quantity > 0 ? (
                    <div className="flex items-center gap-2 bg-blue-50 rounded-full px-3 py-1">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDecreaseQuantity(item.id, isPack);
                        }}
                        className="p-1 text-blue-600 hover:text-blue-800 transition-colors flex items-center justify-center"
                        title="Decrease quantity"
                      >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                        </svg>
                      </button>
                      
                      <span className="text-sm font-medium text-blue-600 min-w-[20px] text-center">
                        {quantity}
                      </span>
                      
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleIncreaseQuantity(item.id, isPack);
                        }}
                        className="p-1 text-blue-600 hover:text-blue-800 transition-colors flex items-center justify-center"
                        title="Increase quantity"
                       disabled={item.stock === quantity}
                      >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                      </button>
                    </div>
                  ) : (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddToCart(item, isPack);
                      }}
                      className="px-3 py-2 bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center gap-1"
                      title="Add to Cart"
                    >
                      <ShoppingCart className="h-4 w-4" />
                      <span className="text-xs font-medium">{t('add')}</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-8">
          <nav className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1 rounded border border-gray-300 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {t('previous')}
            </button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`px-3 py-1 rounded text-sm ${
                  currentPage === page
                    ? 'bg-blue-500 text-white'
                    : 'border border-gray-300'
                }`}
              >
                {page}
              </button>
            ))}
            
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-1 rounded border border-gray-300 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {t('next')}
            </button>
          </nav>
        </div>
      )}
      
      {/* Show ProductDetails for both products and packs */}
      {(showDetails && selectedProduct) && (
        <ProductDetails
          product={selectedProduct.itemType === 'pack' ? null : selectedProduct}
          pack={selectedProduct.itemType === 'pack' ? selectedProduct : null}
          onClose={() => {
            if (selectedProduct.itemType === 'pack') {
              dispatch(hidePackDetails());
            } else {
              dispatch(hideProductDetails());
            }
          }}
          onAddToCart={handleAddToCartFromDetails}
        />
      )}
      
      {(showPackDetail && selectedPack) && (
        <ProductDetails
          pack={selectedPack}
          onClose={() => dispatch(hidePackDetails())}
          onAddToCart={handleAddToCartFromDetails}
        />
      )}
    </div>
  </>

  );

};

// New component for the auto-scrolling pack image slider
const PackImageSlider = ({ images, alt }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    // Set up interval to automatically cycle through images
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 5000); // Change image every 5 seconds

    // Clean up interval on component unmount
    return () => clearInterval(interval);
  }, [images.length]);

  return (
    <div className="relative w-full h-full overflow-hidden">
      {images.map((image, index) => (
        <img
          key={index}
          src={image}
          alt={`${alt} - Image ${index + 1}`}
          className={`absolute top-0 left-0 w-full h-full object-cover transition-opacity duration-1000 ${
            index === currentIndex ? 'opacity-100' : 'opacity-0'
          }`}
          onError={(e) => {
            e.target.src = '/placeholder-image.jpg';
          }}
        />
      ))}
    </div>
  );
};

export default ProductGrid;