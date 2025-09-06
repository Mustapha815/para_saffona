import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { 
  Heart, 
  ShoppingCart, 
  ArrowLeft, 
  Trash2, 
  Eye,
  Plus,
  Package,
  Tag,
  RefreshCw
} from 'lucide-react';
import { 
  addToCart, 
  increaseQuantity, 
  decreaseQuantity, 
  showProductDetails, 
  hideProductDetails,
  showPackDetails,
  hidePackDetails
} from '../../../redux/action';
import { getFavorites, toggle_favorite } from '../../../api/favorites';
import ProductDetails from './ProductDetails';
import { useLanguage } from '../../../contexts/LanguageContext';

const FavoritesPage = () => {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const { t } = useLanguage();
  const cartItems = useSelector((state) => state.client?.cartItems || []);
  const { selectedProduct, showProductDetails: showDetails, selectedPack, showPackDetails: showPackDetail } = useSelector(state => state.client);
  const isLogged = localStorage.getItem('islogged') === 'true';
  
  // Fetch favorites from API
  const { data: favoritesData =[], isLoading, isError, refetch } = useQuery({
    queryKey: ['favorites'],
    queryFn: getFavorites,
    enabled: isLogged, 
  });

  // Transform favoritesData to a unified array for mapping
  const favoritesList = React.useMemo(() => {
    if (!favoritesData) return [];
    
    // Handle different API response structures
    const products = favoritesData?.products || favoritesData.items?.products || [];
    const packs = favoritesData?.packs || favoritesData.items?.packs || [];
    
    return [
      ...products.map(item => ({ 
        ...(item.target || item), 
        isPack: false,
        itemType: 'product',
        favoriteId: item.id 
      })),
      ...packs.map(pack => ({ 
        ...pack, 
        isPack: true,
        itemType: 'pack',
        favoriteId: pack.id 
      })),
    ];
  }, [favoritesData]);

  // Use the toggle_favorite API method with optimistic updates
  const toggleFavoriteMutation = useMutation({
    mutationFn: toggle_favorite,
    onMutate: async (formData) => {
      if (!isLogged) {
        alert('Please log in to manage favorites.');
        throw new Error('User not logged in');
      }

      // Cancel any outgoing refetches
      await queryClient.cancelQueries(['favorites']);

      // Snapshot previous favorites
      const previousFavorites = queryClient.getQueryData(['favorites']) || { products: [], packs: [] };

      // Optimistically update the cache - فقط الحذف
      queryClient.setQueryData(['favorites'], (oldData = { products: [], packs: [] }) => {
        const { type, id } = formData;
        
        if (type === 'pack') {
          // إزالة الباقة من المفضلة
          return {
            ...oldData,
            packs: oldData.packs.filter(pack => pack.id !== id)
          };
        } else {
          // إزالة المنتج من المفضلة
          return {
            ...oldData,
            products: oldData.products.filter(prod => (prod.target_id || prod.id) !== id)
          };
        }
      });

      return { previousFavorites };
    },
    onError: (err, variables, context) => {
      if (err.message !== 'User not logged in') {
        // Rollback to previous favorites on error
        queryClient.setQueryData(['favorites'], context.previousFavorites);
        
        // Show error message to user
        alert('Failed to remove from favorites. Please try again.');
      }
    },
    onSuccess: () => {
      // Refetch to sync with backend
      queryClient.invalidateQueries(['favorites']);
    },
  });

  // Handle favorite removal only (since we're in favorites page)
  const handleRemoveFavorite = (item, isPack = false) => {
    if (!isLogged) {
      alert('Please log in to manage favorites.');
      return;
    }

    toggleFavoriteMutation.mutate({
      type: isPack ? 'pack' : 'product',
      id: item.id || item.target_id,
    });
  };

  const handleAddToCart = (item, isPack = false) => {
    dispatch(addToCart({...item, isPack}));
  };

  const handleIncreaseQuantity = (itemId, isPack = false) => {
    dispatch(increaseQuantity(itemId, isPack));
  };

  const handleDecreaseQuantity = (itemId, isPack = false) => {
    dispatch(decreaseQuantity(itemId, isPack));
  };

  const handleViewItem = (item, isPack = false) => {
    if (isPack) {
      dispatch(showPackDetails(item));
    } else {
      dispatch(showProductDetails(item));
    }
  };

  const handleCloseDetails = () => {
    if (selectedPack) {
      dispatch(hidePackDetails());
    } else if (selectedProduct) {
      dispatch(hideProductDetails());
    }
  };

  // Get quantity for a specific product or pack from cart
  const getItemQuantity = (itemId, isPack = false) => {
    const item = cartItems.find(item => item.id === itemId && item.isPack === isPack);
    return item ? item.quantity : 0;
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
    if (item.products && item.products.length > 0 && item.products[0].image) {
      return `${import.meta.env.VITE_IMG_BASE_URL}/${item.products[0].image}`;
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
    if (pack.products && pack.products.length > 0) {
      pack.products.forEach(product => {
        if (product.image) {
          images.push(`${import.meta.env.VITE_IMG_BASE_URL}/${product.image}`);
        }
      });
    }
    
    return images.length > 0 ? images : ['/placeholder-image.jpg'];
  };

  // Get display price for item
  const getDisplayPrice = (item) => {
    if (item.offer_price) {
      return parseFloat(item.offer_price).toFixed(2);
    }
    return parseFloat(item.price || 0).toFixed(2);
  };

  // Get original price for item (if on offer)
  const getOriginalPrice = (item) => {
    if (item.offer_price && item.price) {
      return parseFloat(item.price).toFixed(2);
    }
    return null;
  };

  // Show loading state while data is being fetched
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">{t('loadingFavorites')}</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <Link 
            to="/" 
            className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-8 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            {t('backToShopping')}
          </Link>
          
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Heart className="w-12 h-12 text-red-500" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{t('errorLoading')}</h1>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              {t('errorMessage')}
            </p>
            <button
              onClick={() => refetch()}
              className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
            >
              <RefreshCw className="w-5 h-5 mr-2" />
              {t('tryAgain')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!favoritesList || favoritesList.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <Link 
            to="/" 
            className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-8 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            {t('backToShopping')}
          </Link>
          
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="w-24 h-24 bg-pink-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Heart className="w-12 h-12 text-pink-500 fill-pink-500" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{t('favoritesEmpty')}</h1>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              {t('emptyMessage')}
            </p>
            <Link
              to="/"
              className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-pink-600 hover:bg-pink-700 transition-colors"
            >
              {t('exploreProducts')}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
            <div>
              <Link 
                to="/" 
                className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4 sm:mb-0 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                {t('backToShopping')}
              </Link>
              <h1 className="text-3xl font-bold text-gray-900 mt-2">{t('myFavorites')}</h1>
              <p className="text-gray-600 mt-1">
                {favoritesList.length} {favoritesList.length === 1 ? t('item') : t('items')} {t('itemsSaved')}
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => refetch()}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={isLoading}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                {t('refresh')}
              </button>
            </div>
          </div>

          {/* Favorites Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
            {favoritesList?.map((item) => {
              const isPack = item.itemType === 'pack';
              const quantity = getItemQuantity(item.id, isPack);
              const hasOffer = item.offer_price && item.price && parseFloat(item.offer_price) > 0;
              const discountPercentage = getDiscountPercentage(item);
              const displayName = item.name || (isPack ? 'Pack' : 'Product');
              const displayPrice = getDisplayPrice(item);
              const originalPrice = getOriginalPrice(item);
              const categoryName = item.categoryName || item.category  || 'Uncategorized';
              
              // For packs, get all images for the slider
              const packImages = isPack ? getAllPackImages(item) : [];
              
              return (
                <div key={`${isPack ? 'pack-' : 'product-'}${item.id}`} className="group bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer flex flex-col h-full">
                  <div className="relative aspect-square overflow-hidden"
                   onClick={(e) => {
                          e.stopPropagation();
                          handleViewItem(item, isPack);
                        }}
                  
                  >
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
                          categoryName
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
                          {item.products?.length || 0} {t('items')}
                        </div>
                      )}
                    </div>
                    
                    {/* Remove from favorites icon */}
                    <button 
                      className="absolute top-2 right-2 w-8 h-8 bg-white border border-gray-200 rounded-full flex items-center justify-center hover:bg-gray-50 shadow-md transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveFavorite(item, isPack);
                      }}
                      disabled={toggleFavoriteMutation.isLoading}
                    >
                      {toggleFavoriteMutation.isLoading ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-500"></div>
                      ) : (
                        <Trash2 className="h-4 w-4 text-red-500" />
                      )}
                    </button>
                  </div>
                  
                  {/* Item Info */}
                  <div className="p-3 flex-1 flex flex-col">
                    <h2 className="font-medium text-medium text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2 flex-1">
                      {displayName}
                    </h2>
                    
                    {/* Pricing */}
                    <div className="flex items-center justify-between mt-2">
                      {hasOffer ? (
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-base text-gray-900">
                            ${displayPrice}
                          </span>
                          <span className="text-xs text-red-400 line-through">
                            ${originalPrice}
                          </span>
                        </div>
                      ) : (
                        <span className="font-semibold text-base text-gray-900">
                          ${displayPrice}
                        </span>
                      )}
                    </div>
                    
                    {/* Action Buttons */}
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

          {/* Summary Section */}
          <div className="mt-8 bg-white rounded-2xl shadow-lg p-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{t('favoritesSummary')}</h3>
                <p className="text-gray-600">
                  {t('youHave')} {favoritesList.length} {favoritesList.length === 1 ? t('item') : t('items')} {t('inYourFavorites')}
                </p>
              </div>
              
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600">
                  {t('totalValue')} : 
                  {favoritesList.reduce((total, item) => total + parseFloat(item.offer_price || item.price || 0), 0).toFixed(2)} DHS
                </span>
                
                <Link
                  to="/"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  {t('continueShopping')}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Show ProductDetails for both products and packs */}
      {(showDetails && selectedProduct) && (
        <ProductDetails
          product={selectedProduct.itemType === 'pack' ? null : selectedProduct}
          pack={selectedProduct.itemType === 'pack' ? selectedProduct : null}
          onClose={handleCloseDetails}
        />
      )}
      
      {(showPackDetail && selectedPack) && (
        <ProductDetails
          pack={selectedPack}
          onClose={handleCloseDetails}
        />
      )}
    </>
  );
};

// Component for the auto-scrolling pack image slider
const PackImageSlider = ({ images, alt }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  React.useEffect(() => {
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

export default FavoritesPage;