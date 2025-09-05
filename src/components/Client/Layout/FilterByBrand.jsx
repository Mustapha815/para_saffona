import { useQuery } from '@tanstack/react-query';
import { fetch_products } from '../../../api/products';
import { useParams, useNavigate } from 'react-router-dom';
import { ShoppingCart, Eye, Heart, Tag, ArrowLeft, Search, X } from "lucide-react";
import { useDispatch, useSelector } from 'react-redux';
import { addToCart, increaseQuantity, decreaseQuantity, showProductDetails, hideProductDetails } from '../../../redux/action';
import { increment_product_click } from '../../../api/products';
import { toggle_favorite, getFavorites } from '../../../api/favorites';
import { useQueryClient } from '@tanstack/react-query';
import Alert from '../halpers/Alert';
import { useState, useEffect } from 'react';
import ProductDetails from './ProductDetails';
import { useLanguage } from '../../../contexts/LanguageContext';
import ClientHeader from './ClientHeader';

const FilteredProductsByBrand = () => {
  const { brandId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const { t } = useLanguage();
  const [showAlert, setShowAlert] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredProducts, setFilteredProducts] = useState([]);
  
  const { cartItems, selectedProduct, showProductDetails: showDetails } = useSelector(state => state.client);
  
  // Check if user is logged in
  const isLogged = localStorage.getItem('islogged') === 'true';

  // Fetch favorites from API
  const { data: favoritesData = {} } = useQuery({
    queryKey: ['favorites'],
    queryFn: getFavorites,
    enabled: isLogged,
  });

  const { data: all_products = [], isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: fetch_products,
  });

  // Get brand name for display
  const brandName = all_products.find(
    product => product.company_id === Number(brandId)
  )?.company.name || "Brand";

  // Filter products by brand and search query
  useEffect(() => {
    if (all_products.length > 0) {
      let filtered = all_products.filter(
        product => product.company_id === Number(brandId)
      );
      
      // Apply search filter if query exists
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        filtered = filtered.filter(product => 
          product.name.toLowerCase().includes(query) || 
          (product.categoryName && product.categoryName.toLowerCase().includes(query))
        );
      }
      
      setFilteredProducts(filtered);
    }
  }, [all_products, brandId, searchQuery]);

  // Get quantity for a specific product
  const getItemQuantity = (itemId) => {
    const item = cartItems.find(item => item.id === itemId && !item.isPack);
    return item ? item.quantity : 0;
  };

  // Handle view product click
  const handleViewItem = (item) => {
    dispatch(showProductDetails(item));
    increment_product_click(item.id);
  };

  // Handle add to cart
  const handleAddToCart = (item) => {
    dispatch(addToCart({...item, isPack: false}));
  };

  // Handle increase quantity
  const handleIncreaseQuantity = (itemId) => {
    dispatch(increaseQuantity(itemId, false));
  };

  // Handle decrease quantity
  const handleDecreaseQuantity = (itemId) => {
    dispatch(decreaseQuantity(itemId, false));
  };

  // Toggle favorite function
  const handleToggleFavorite = (item) => {
    if (!isLogged) {
      setShowAlert(true);
      return;
    }

    // Update API using the toggle_favorite method
    const formData = {
      type: 'product',
      id: item.id,
      item: item
    };
    
    toggle_favorite(formData).then(() => {
      queryClient.invalidateQueries(['favorites']);
    });
  };

  // Check if product is favorite
  const isFavorite = (itemId) => {
    if (!isLogged) return false;
    return favoritesData.products?.some((p) => (p.target_id || p.id) === itemId) || false;
  };

  // Calculate discount percentage
  const getDiscountPercentage = (item) => {
    if (item.original_price && item.price && parseFloat(item.original_price) > parseFloat(item.price)) {
      return Math.round((1 - parseFloat(item.price) / parseFloat(item.original_price)) * 100);
    }
    return 0;
  };

  // Clear search query
  const clearSearch = () => {
    setSearchQuery('');
  };
  

  if (isLoading) {
    return (
      <div className="flex-1 p-4 lg:p-6 bg-white">
        <div className="flex items-center gap-4 mb-6">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-xl lg:text-2xl font-semibold text-gray-900">Loading products...</h1>
        </div>
      </div>
    );
  }

  return (
    <>
      <ClientHeader/>
      {showAlert && (
        <Alert
          show={showAlert} 
          onClose={() => setShowAlert(false)}
          duration={3000}
          message={t('pleaseLog')}
        />
      )}

      <div className="flex-1 p-4 lg:p-6 bg-white">
        {/* Header with back button and title */}
        <div className="flex flex-col gap-4 mb-6">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate(-1)}
              className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="flex-1 text-center">
              <h1 className="text-xl lg:text-2xl font-semibold text-gray-900">{brandName}</h1>
              <p className="text-sm text-gray-500">{filteredProducts.length} products found</p>
            </div>
            {/* Empty div to balance the back button */}
            <div className="w-10"></div>
          </div>
          
          {/* Centered Search input */}
          <div className="flex justify-center">
            <div className="relative max-w-md w-full">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {searchQuery && (
                <button
                  onClick={clearSearch}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                </button>
              )}
            </div>
          </div>
        </div>
        
        {/* Product Grid - 2 columns on mobile, 5 on desktop */}
        {filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Search className="h-12 w-12 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-500 max-w-md">
              {searchQuery 
                ? `No products matching "${searchQuery}" found for ${brandName}.`
                : `No products available for ${brandName} at the moment.`
              }
            </p>
            {searchQuery && (
              <button
                onClick={clearSearch}
                className="mt-4 px-4 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
              >
                Clear search
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-6">
            {filteredProducts?.map(item => {
              const quantity = getItemQuantity(item.id);
              const isFav = isFavorite(item.id);
              const hasOffer = item.original_price && item.price && parseFloat(item.original_price) > parseFloat(item.price);
              const discountPercentage = getDiscountPercentage(item);
              
              return (
                <div key={item.id} className="group bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer flex flex-col h-full">
                  <div className="relative aspect-square overflow-hidden"   
                    onClick={() => handleViewItem(item)}
                  >
                    <img
                      src={`${import.meta.env.VITE_IMG_BASE_URL}/${item.image}`}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        e.target.src = '/placeholder-image.jpg';
                      }}
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300"></div>
                    
                    {/* Category */}
                    <div className="absolute bottom-2 left-2">
                      <span className="bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                        {item.category?.name || item.categoryName || t('uncategorized')}
                      </span>
                    </div>
                    
                    {/* Offer Badge */}
                    {hasOffer && (
                      <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full flex items-center">
                        <Tag className="h-3 w-3 mr-1" />
                        -{discountPercentage}%
                      </div>
                    )}
                    
                    {/* Heart icon */}
                    <button 
                      className="absolute top-2 right-2 w-8 h-8 bg-white border border-gray-200 rounded-full flex items-center justify-center hover:bg-gray-50 shadow-md transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleFavorite(item);
                      }}
                    >
                      <Heart className={`h-4 w-4 ${isFav ? 'text-red-500 fill-red-500' : 'text-gray-500 hover:text-red-500'}`} />
                    </button>
                  </div>
                  
                  {/* Product Info */}
                  <div className="p-3 flex-1 flex flex-col">
                    <h2 className="font-medium text-medium text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2 flex-1">
                      {item.name}
                    </h2>
                    
                    {/* Pricing */}
                    <div className="flex items-center justify-between mt-2">
                      {hasOffer ? (
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-base text-gray-900">
                            {item.price} DHS
                          </span>
                          <span className="text-xs text-red-400 line-through">
                            {item.original_price} DHS
                          </span>
                        </div>
                      ) : (
                        <span className="font-semibold text-base text-gray-900">
                          {item.price} DHS
                        </span>
                      )}
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex justify-end gap-2 mt-3">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewItem(item);
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
                              handleDecreaseQuantity(item.id);
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
                              handleIncreaseQuantity(item.id);
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
                            handleAddToCart(item);
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
        )}
      </div>

      {/* Show ProductDetails */}
      {showDetails && selectedProduct && (
        <ProductDetails
          product={selectedProduct}
          onClose={() => dispatch(hideProductDetails())}
          onAddToCart={(item, quantity) => {
            for (let i = 0; i < quantity; i++) {
              dispatch(addToCart({...item, isPack: false}));
            }
          }}
        />
      )}
    </>
  );
};

export default FilteredProductsByBrand;