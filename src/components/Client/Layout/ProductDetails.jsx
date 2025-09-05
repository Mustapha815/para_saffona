

import React, { useState, useEffect, useMemo } from 'react';
import { Heart, ShoppingCart, ChevronLeft, ChevronRight, Plus, Minus, Truck, Shield, RotateCcw, Package, Tag } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { addToCart, toggleFavorite, hideProductDetails, hidePackDetails } from '../../../redux/action';
import { getFavorites, toggle_favorite } from '../../../api/favorites';
import { useNavigate } from 'react-router-dom';
import Alert from '../halpers/Alert';
import { useLanguage } from '../../../contexts/LanguageContext';

const ProductDetails = ({ product, pack, onClose, onAddToCart }) => {
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const isLogged = localStorage.getItem('islogged') === 'true';
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [showAlert ,setShowAlert] = useState(false);
  const { cartItems } = useSelector(state => state.client);

  // React Query
  const { data: favoriteItems } = useQuery({
    queryKey: ['favorites'],
    queryFn: getFavorites,
    enabled: isLogged,
  });

  // Normalize favorites
  const favoritesList = useMemo(() => {
    if (!favoriteItems) return { products: [], packs: [] };
    return {
      products: favoriteItems.products || favoriteItems.items?.products || [],
      packs: favoriteItems.packs || favoriteItems.items?.packs || [],
    };
  }, [favoriteItems]);

  const [selectedImage, setSelectedImage] = useState(0);
  const [currentPage, setCurrentPage] = useState(0); // For pack image pagination

  // Determine if we're showing a product or a pack
  const isPack = Boolean(pack);
  const item = isPack ? pack : product;

  // Mutation for toggling favorites
  const toggleFavoriteMutation = useMutation({
    mutationFn: toggle_favorite,
    onMutate: async ({ type, id, item }) => {
      if (!isLogged) {
        throw new Error("Not logged in");
      }
      await queryClient.cancelQueries(["favorites"]);
      const previousFavorites = queryClient.getQueryData(["favorites"]);

      queryClient.setQueryData(["favorites"], (old = { products: [], packs: [] }) => {
        if (type === "pack") {
          const exists = old.packs.some((p) => p.id === id);
          return {
            ...old,
            packs: exists ? old.packs.filter((p) => p.id !== id) : [...old.packs, { ...item, id }],
          };
        } else {
          const exists = old.products.some((p) => (p.target_id || p.id) === id);
          return {
            ...old,
            products: exists
              ? old.products.filter((p) => (p.target_id || p.id) !== id)
              : [...old.products, { target: { ...item }, id: Date.now(), target_id: id }],
          };
        }
      });

      return { previousFavorites };
    },
    onError: (err, vars, context) => {
      if (context?.previousFavorites) {
        queryClient.setQueryData(["favorites"], context.previousFavorites);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries(["favorites"]);
    },
  });

  // Check if current item is in favorites
  const isFavorite = useMemo(() => {
    if (!favoritesList) return false;
    return isPack
      ? favoritesList.packs.some((p) => p.id === item.id)
      : favoritesList.products.some((p) => (p.target_id || p.id) === item.id);
  }, [favoritesList, isPack, item.id]);

  // Get item quantity from cart
  const getItemQuantity = (itemId, isPack = false) => {
    const cartItem = cartItems.find(item => item.id === itemId && item.isPack === isPack);
    return cartItem ? cartItem.quantity : 0;
  };

  const itemQuantity = getItemQuantity(item.id, isPack);
  const [quantity, setQuantity] = useState(itemQuantity || 1);

  // Update quantity when cart changes
  useEffect(() => {
    setQuantity(itemQuantity || 1);
  }, [itemQuantity]);

  // Get images for the item with special handling for packs
  const getImages = () => {
    if (isPack) {
      // For packs, use images from all products in the pack
      const packImages = [];
      
      // Add pack main image if available
      if (pack.image) {
        packImages.push(`${import.meta.env.VITE_IMG_BASE_URL}/${pack.image}`);
      }
      
      // Add images from all products in the pack
      if (pack.products && pack.products.length > 0) {
        pack.products.forEach(product => {
          if (product.image) {
            packImages.push(`${import.meta.env.VITE_IMG_BASE_URL}/${product.image}`);
          }
        });
      }
      
      return packImages.length > 0 ? packImages : ['/placeholder-image.jpg'];
    } else {
      // For products - single image
      if (product.image) {
        return [`${import.meta.env.VITE_IMG_BASE_URL}/${product.image}`];
      }
      
      return ['/placeholder-image.jpg'];
    }
  };

  const images = getImages();
  const isMultiPagePack = isPack && images.length > 1;

  const handleQuantityChange = (amount) => {
    const newQuantity = Math.max(1, quantity + amount);
    setQuantity(newQuantity);
  };

  const handleAddToCart = () => {
    // Use the Redux action instead of the prop function
    for (let i = 0; i < quantity; i++) {
      dispatch(addToCart({...item, isPack}));
    }
    if (isPack) {
      dispatch(hidePackDetails());
    } else {
      dispatch(hideProductDetails());
    }
  };

  const handleToggleFavorite = () => {
     if (!isLogged) {
      setShowAlert(true);
      return;
    }
    if (toggleFavoriteMutation.isLoading) return;
    toggleFavoriteMutation.mutate({ type: isPack ? "pack" : "product", id: item.id, item });
   
    // Update Redux store
    dispatch(toggleFavorite({...item, isPack}));
  };

  const handleClose = () => {
    if (isPack) {
      dispatch(hidePackDetails());
    } else {
      dispatch(hideProductDetails());
    }
  };

  const nextImage = () => {
    setSelectedImage((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setSelectedImage((prev) => (prev - 1 + images.length) % images.length);
  };

  const nextPage = () => {
    if (currentPage < Math.ceil(images.length / 4) - 1) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(prev => prev - 1);
    }
  };
   

  // Get current page thumbnails for packs
  const getCurrentPageThumbnails = () => {
    if (!isMultiPagePack) return images;
    
    const startIndex = currentPage * 4;
    return images.slice(startIndex, startIndex + 4);
  };

  // Calculate discount percentage
  const getDiscountPercentage = () => {
    if (item.offer_price && item.price) {
      return Math.round((1 - parseFloat(item.offer_price) / parseFloat(item.price)) * 100);
    }
    return 0;
  };

  const discountPercentage = getDiscountPercentage();

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
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-semibold text-gray-900">
            {isPack ? t('packDetails') : t('productDetails')}
          </h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Image Gallery */}
            <div className="space-y-4">
              {/* Main Image */}
              <div className="relative aspect-square overflow-hidden rounded-lg bg-gray-100">
                <img
                  src={images[selectedImage]}
                  alt={item.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = '/placeholder-image.jpg';
                  }}
                />
                
                {/* Navigation arrows if multiple images */}
                {images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white p-2 rounded-full shadow-md hover:bg-gray-100 transition-colors"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white p-2 rounded-full shadow-md hover:bg-gray-100 transition-colors"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </>
                )}
                
                {/* Favorite Button */}
                <button
                  onClick={handleToggleFavorite}
                  disabled={toggleFavoriteMutation.isLoading}
                  className="absolute top-2 right-2 bg-white p-2 rounded-full shadow-md hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {toggleFavoriteMutation.isLoading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-500"></div>
                  ) : (
                    <Heart 
                      className={`w-5 h-5 ${isFavorite ? 'text-red-500 fill-red-500' : 'text-gray-500'}`} 
                    />
                  )}
                </button>
                
                {/* Discount Badge */}
                {discountPercentage > 0 && (
                  <div className="absolute top-2 left-2 bg-red-500 text-white text-sm px-2 py-1 rounded-full flex items-center">
                    <Tag className="h-3 w-3 mr-1" />
                    -{discountPercentage}%
                  </div>
                )}
                
                {/* Pack Badge */}
                {isPack && (
                  <div className="absolute bottom-2 left-2 bg-blue-500 text-white text-sm px-2 py-1 rounded flex items-center">
                    <Package className="h-3 w-3 mr-1" />
                    Pack - {pack.products?.length || 0} {t('items')}
                  </div>
                )}

                {/* Image counter for packs */}
                {isPack && images.length > 1 && (
                  <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                    {selectedImage + 1} / {images.length}
                  </div>
                )}
              </div>

              {/* Thumbnails with pagination for packs */}
              {images.length > 1 && (
                <div className="relative">
                  <div className="grid grid-cols-4 gap-2">
                    {getCurrentPageThumbnails().map((img, index) => {
                      const globalIndex = currentPage * 4 + index;
                      return (
                        <button
                          key={globalIndex}
                          onClick={() => setSelectedImage(globalIndex)}
                          className={`aspect-square overflow-hidden rounded border-2 ${
                            selectedImage === globalIndex ? 'border-blue-500' : 'border-gray-200'
                          }`}
                        >
                          <img
                            src={img}
                            alt={`${item.name} ${globalIndex + 1}`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.src = '/placeholder-image.jpg';
                            }}
                          />
                        </button>
                      );
                    })}
                  </div>
                  
                  {/* Pagination controls for packs with many images */}
                  {isMultiPagePack && images.length > 4 && (
                    <div className="flex justify-center items-center mt-2 gap-2">
                      <button
                        onClick={prevPage}
                        disabled={currentPage === 0}
                        className="p-1 disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <span className="text-sm text-gray-600">
                        Page {currentPage + 1} {t('of')} {Math.ceil(images.length / 4)}
                      </span>
                      <button
                        onClick={nextPage}
                        disabled={currentPage >= Math.ceil(images.length / 4) - 1}
                        className="p-1 disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Product/Pack Info */}
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{item.name}</h1>
                <div className='flex gap-4 mb-4 justify-content-between'>
                  <p className="text-lg text-gray-600 mb-4">
                  {isPack ? t('productPack') : item.category?.name || t('uncategorized')}
                 </p>
                <p className="text-lg text-gray-600 mb-4">
                  {isPack ? t('productPack') : item.company?.name || t('uncategorized')}
                </p>
                </div>


                {/* Price */}
                <div className="flex items-center gap-4 mb-4">
                  {item.offer_price ? (
                    <>
                      <span className="text-3xl font-bold text-blue-600">{item.offer_price} DHS</span>
                      <span className="text-xl text-gray-400 line-through">{item.price} DHS</span>
                      <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-sm font-medium">
                        {t('save')} {(item.price - item.offer_price).toFixed(2)} DHS
                      </span>
                    </>
                  ) : (
                    <span className="text-3xl font-bold text-gray-900">{item.price} DHS</span>
                  )}
                </div>
              </div>

              {/* Pack Contents */}
              {isPack && pack.products && pack.products.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('packContents')}</h3>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {pack.products.map((product, index) => (
                      <div key={index} className="flex items-center gap-3 p-2 bg-gray-50 rounded">
                        <img
                          src={`${import.meta.env.VITE_IMG_BASE_URL}/${product.image}`}
                          alt={product.name}
                          className="w-12 h-12 object-cover rounded"
                          onError={(e) => {
                            e.target.src = '/placeholder-image.jpg';
                          }}
                        />
                        <div className="flex-1">
                          <p className="font-medium text-sm">{product.name}</p>
                          <p className="text-xs text-gray-500">${product.price}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Description */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
                <p className="text-gray-600 leading-relaxed">
                  {item.description || "High-quality product with excellent features. Designed for durability and performance. Perfect for everyday use."}
                </p>
              </div>

              {/* Quantity Selector */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('quantity')}</h3>
                <div className="flex items-center gap-4">
                  <div className="flex items-center border border-gray-300 rounded-lg">
                    <button
                      onClick={() => handleQuantityChange(-1)}
                      className="p-3 hover:bg-gray-100 transition-colors"
                      disabled={quantity <= 1}
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="px-4 py-2 text-lg font-medium min-w-[50px] text-center">
                      {quantity}
                    </span>
                    <button
                      onClick={() => handleQuantityChange(1)}
                      className="p-3 hover:bg-gray-100 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4">
                <button
                  onClick={handleAddToCart}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                >
                  <ShoppingCart className="w-5 h-5" />
                  {itemQuantity > 0 ? 'Update Cart' : t('addToCart')} - ${((item.offer_price || item.price) * quantity).toFixed(2)}
                </button>
                
                <button 
                  onClick={() => {
                    handleAddToCart();      
                    navigate('/shopping-cart'); 
                  }}
                  className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  {t('buyNow')}
                </button>
              </div>

           
            </div>
          </div>
        </div>
      </div>
    </div>
 </>
  );
};

export default ProductDetails;

