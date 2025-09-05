import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from '../../../contexts/LanguageContext';
import { 
  
  ShoppingCart, 
  User, 

  Globe,
  Heart,
  Sparkles,
  Home,
  Bolt,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getFavorites } from '../../../api/favorites';
import { useSelector } from 'react-redux';
import Alert from '../halpers/Alert';
import { me } from '../../../api/auth';

const ClientHeader = () => {
  
  const [showAlert, setShowAlert] = useState(false);

const isLogged = localStorage.getItem('islogged') === 'true';
  
  // Fetch current user
  const { data: userData, isLoading, isError } = useQuery({
    queryKey: ['user'],
    queryFn: me,
    enabled: isLogged,
    staleTime: 1000 * 60 * 5,
    retry: 1,
    refetchOnWindowFocus: false
  });
// React Query
const { data: favoriteItems  } = useQuery({
  queryKey: ['favorites'],
  queryFn: getFavorites,
  enabled: isLogged,
});
const favoritesList = React.useMemo(() => {
    if (!favoriteItems) return [];
    
    // Handle different API response structures
    const products = favoriteItems?.products || favoriteItems.items?.products || [];
    const packs = favoriteItems?.packs || favoriteItems.items?.packs || [];
    
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
  }, [favoriteItems]);


  const { language, setLanguage, t, isRTL } = useLanguage();
  const categories = useSelector((state) => state.categories?.items?.filter(cat => cat.isActive) || []);
  const cartItems = useSelector((state) => state.client?.cartItems || []);

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
  ];

  // Calculate cart items count from Redux store
  const cartItemsCount = cartItems.length;

 


  // Check if current path is active for bottom nav highlighting
  const isActivePath = (path) => {
    return location.pathname === path;
  };

  return (
    <>
      <header className="bg-white/80 backdrop-blur-xl border-b border-gray-200/50 sticky top-0 z-50 shadow-sm">
        {showAlert && (
        <Alert
          show={showAlert}
          onClose={() => setShowAlert(false)}
          duration={3000}
          message={t('pleaseLog')}
        />
      )}
        {/* Top notification bar */}
        <div className="bg-teal-600/90 text-white py-2">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-center items-center text-sm font-medium">
              <Sparkles className="h-4 w-4 mr-2" />
              <span>{t('freeDeliveryMsg')}</span>
            </div>
          </div>
        </div>

        {/* Main header */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center md:justify-between items-center h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2 rtl:space-x-reverse group active:scale-95 transition-transform duration-200">
              <div className="relative">
                {/* Logo container with subtle shadow */}
                <div className="relative overflow-hidden rounded-xl shadow-sm border border-gray-100">
                  <img 
                    src="/logo.jpg" 
                    alt="Parasaffona" 
                    className="h-10 w-10 object-cover"
                  />
                </div>
                {/* Active state indicator */}
                <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-emerald-400 rounded-full"></div>
              </div>
              
              <div className="flex flex-col">
                {/* Main brand name - clean and readable */}
                <h1 className="text-lg font-bold text-gray-800 tracking-tight">
                  Parasaffona
                </h1>
                {/* Subtle tagline that appears on larger screens */}
                <p className="hidden xs:block text-[10px] text-gray-500 font-medium">
                  Pharmacy
                </p>
              </div>
            </Link>  
             {/* Right Section - Hide user actions on mobile as they'll be in footer */}
            <div className="flex items-center space-x-3 rtl:space-x-reverse">
              {/* Language Selector */}
              <div className="relative group flex items-center justify-between">
                <button className="flex items-center space-x-2 rtl:space-x-reverse px-4 py-2 rounded-xl hover:bg-gray-50 transition-all duration-300 border border-gray-200 hover:border-emerald-200">
                  <Globe className="h-4 w-4 text-gray-600" />
                  <span className="text-lg">
                    {languages.find(l => l.code === language)?.flag}
                  </span>
                </button>
                
                <div className="absolute right-0 rtl:right-auto rtl:left-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => setLanguage(lang.code)}
                      className={`w-full flex items-center space-x-3 rtl:space-x-reverse px-4 py-3 text-sm hover:bg-gray-50 transition-colors ${
                        language === lang.code ? 'bg-emerald-50 text-emerald-700' : 'text-gray-700'
                      } first:rounded-t-xl last:rounded-b-xl`}
                    >
                      <span className="text-lg">{lang.flag}</span>
                      <span className="font-medium">{lang.name}</span>
                    </button>
                  ))}
                </div>
              </div>
           {isLogged ? (
  <Link
    to="/favorites"
    className="hidden md:block relative p-3 rounded-xl hover:bg-gray-50 transition-all duration-300 border border-gray-200 hover:border-red-200 group"
  >
    <Heart className="h-5 w-5 text-gray-600 group-hover:text-red-500 transition-colors" />
    <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
      {favoritesList?.length}
    </span>
  </Link>
) : (
  <button
    onClick={() => setShowAlert(true)}
    className="hidden md:block relative p-3 rounded-xl hover:bg-gray-50 transition-all duration-300 border border-gray-200 hover:border-red-200 group"
  >
    <Heart className="h-5 w-5 text-gray-600 group-hover:text-red-500 transition-colors" />
    <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
      {favoritesList?.length}
    </span>
  </button>
)}



              {/* Cart - Hidden on mobile */}
              <Link to="/shopping-cart" className="hidden md:block relative p-3 rounded-xl hover:bg-gray-50 transition-all duration-300 border border-gray-200 hover:border-emerald-200 group">
                <ShoppingCart className="h-5 w-5 text-gray-600 group-hover:text-emerald-600 transition-colors" />
                {cartItemsCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                    {cartItemsCount}
                  </span>
                )}
              </Link>

            { userData && userData.role_id!==1 ? (
              <Link to="/account-profile" className="hidden md:block p-3 rounded-xl hover:bg-gray-50 transition-all duration-300 border border-gray-200 hover:border-emerald-200 group">
                <User className="h-5 w-5 text-gray-600 group-hover:text-emerald-600 transition-colors" />
              </Link>
                ):(
           <Link to="/admin/dashboard" className="hidden md:block p-3 rounded-xl hover:bg-gray-50 transition-all duration-300 border border-gray-200 hover:border-emerald-200 group">
                <Bolt className="h-5 w-5 text-gray-600 group-hover:text-emerald-600 transition-colors" />
              </Link>
                )}

              
            </div>
          </div>
        </div>

        
      </header>

      {/* Mobile Footer Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
        <div className="grid grid-cols-4 py-2">
          <Link
            to="/"
            className={`flex flex-col items-center justify-center p-2 ${
              isActivePath('/') ? 'text-emerald-600' : 'text-gray-600'
            }`}
          >
            <Home className="h-5 w-5" />
            <span className="text-xs mt-1">{t('home')}</span>
          </Link>
          
          <Link
            to="/shopping-cart"
            className={`flex flex-col items-center justify-center p-2 ${
              isActivePath('/shopping-cart') ? 'text-emerald-600' : 'text-gray-600'
            }`}
          >
            <div className="relative">
              <ShoppingCart className="h-5 w-5" />
              {cartItemsCount > 0 && (
                <span className="absolute -top-2 -right-2 h-4 w-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                  {cartItemsCount}
                </span>
              )}
            </div>
            <span className="text-xs mt-1">{t('cart')}</span>
          </Link>
          
         {isLogged ? (
  <Link
    to="/favorites"
    className={`flex flex-col items-center justify-center p-2 ${
      isActivePath('/Favorites') ? 'text-emerald-600' : 'text-gray-600'
    }`}
  >
    <div className="relative">
      <Heart className="h-5 w-5" />
      <span className="absolute -top-2 -right-2 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
        {favoritesList?.length}
      </span>
    </div>
    <span className="text-xs mt-1">{t('favourites')}</span>
  </Link>
) : (
  <button
    onClick={() => setShowAlert(true)}
    className={`flex flex-col items-center justify-center p-2 ${
      isActivePath('/Favorites') ? 'text-emerald-600' : 'text-gray-600'
    }`}
  >
    <div className="relative">
      <Heart className="h-5 w-5" />
      <span className="absolute -top-2 -right-2 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
        {favoritesList?.length}
      </span>
    </div>
    <span className="text-xs mt-1">Favorites</span>
  </button>
)}


          
         { userData.role_id!==1 ? (
           <Link
            to="/account-profile"
            className={`flex flex-col items-center justify-center p-2 ${
              isActivePath('/account-profile') ? 'text-emerald-600' : 'text-gray-600'
            }`}
          >
            <User className="h-5 w-5" />
            <span className="text-xs mt-1">{t('profile')}</span>
          </Link>
          ):(
             <Link
            to="/admin/dashboard"
            className={`flex flex-col items-center justify-center p-2 ${
              isActivePath('/admin/dashboard') ? 'text-emerald-600' : 'text-gray-600'
            }`}
          >
            <Bolt className="h-5 w-5" />
            <span className="text-xs mt-1">{t('dashboard')}</span>
          </Link>
          )}
        </div>
      </div>
    </>
  );
};

export default ClientHeader;