import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useLanguage } from '../../../contexts/LanguageContext';
import { addSale } from '../../../store/slices/salesSlice';
import { updateStock } from '../../../store/slices/productsSlice';
import { 
  ShoppingCart, 
  Scan, 
  Plus, 
  Minus, 
  X, 
  CreditCard, 
  Banknote,
  Receipt,
  Search,
  CheckCircle
} from 'lucide-react';

const POSSystem = () => {
  const { t, language } = useLanguage();
  const products = useSelector((state) => state.products.items);
  const dispatch = useDispatch();
  
  const [cart, setCart] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showReceipt, setShowReceipt] = useState(false);
  const [lastSale, setLastSale] = useState(null);

  const filteredProducts = products.filter(product => {
    const name = language === 'ar' ? product.nameAr : 
                 language === 'fr' ? product.nameFr : product.name;
    return name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           product.barcode.includes(searchTerm);
  });

  const getProductName = (product) => {
    switch (language) {
      case 'ar': return product.nameAr;
      case 'fr': return product.nameFr;
      default: return product.name;
    }
  };

  const addToCart = (product) => {
    const existingItem = cart.find(item => item.id === product.id);
    if (existingItem) {
      if (existingItem.quantity < product.stock) {
        setCart(cart.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        ));
      }
    } else {
      if (product.stock > 0) {
        setCart([...cart, { ...product, quantity: 1 }]);
      }
    }
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity === 0) {
      setCart(cart.filter(item => item.id !== productId));
    } else {
      const product = products.find(p => p.id === productId);
      if (product && newQuantity <= product.stock) {
        setCart(cart.map(item =>
          item.id === productId
            ? { ...item, quantity: newQuantity }
            : item
        ));
      }
    }
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.id !== productId));
  };

  const getTotalAmount = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const handleCheckout = (paymentMethod) => {
    const sale = {
      items: cart.map(item => ({
        productId: item.id,
        quantity: item.quantity,
        price: item.price,
        name: getProductName(item)
      })),
      total: getTotalAmount(),
      paymentMethod,
      date: new Date().toISOString(),
      cashier: 'Admin User'
    };

    dispatch(addSale(sale));
    
    // Update stock for each item
    cart.forEach(item => {
      dispatch(updateStock({ productId: item.id, quantity: item.quantity }));
    });

    setLastSale(sale);
    setCart([]);
    setShowReceipt(true);
  };

  if (showReceipt && lastSale) {
    return (
      <div className="p-6">
        <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="text-center mb-6">
            <div className="bg-green-100 p-3 rounded-full w-16 h-16 mx-auto mb-4">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Payment Successful!</h2>
            <p className="text-gray-600">Transaction completed</p>
          </div>

          {/* Receipt */}
          <div className="border-t border-b border-gray-200 py-4 mb-6">
            <div className="text-center mb-4">
              <h3 className="font-bold text-lg">PharmaCare</h3>
              <p className="text-sm text-gray-600">Parapharmacy Receipt</p>
              <p className="text-xs text-gray-500">{new Date(lastSale.date).toLocaleString()}</p>
            </div>

            <div className="space-y-2 mb-4">
              {lastSale.items.map((item, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <div>
                    <span>{item.name}</span>
                    <span className="text-gray-500 ml-2">x{item.quantity}</span>
                  </div>
                  <span>{(item.price * item.quantity).toFixed(2)} {t('currency')}</span>
                </div>
              ))}
            </div>

            <div className="border-t pt-2">
              <div className="flex justify-between font-bold">
                <span>{t('total')}</span>
                <span>{lastSale.total.toFixed(2)} {t('currency')}</span>
              </div>
              <div className="flex justify-between text-sm capitalize text-gray-600 mt-1">
                <span>Payment Method</span>
                <span>{lastSale.paymentMethod}</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setShowReceipt(false)}
            className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            New Sale
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-8rem)]">
        {/* Product Search & List */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">{t('pos')}</h2>
              <button className="inline-flex items-center px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors">
                <Scan className="h-4 w-4 mr-2" />
                {t('scanBarcode')}
              </button>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search products or scan barcode..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Products Grid */}
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="bg-gray-50 rounded-lg p-4 cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => addToCart(product)}
                >
                  <img
                    src={product.image}
                    alt={getProductName(product)}
                    className="w-full h-20 object-cover rounded-lg mb-2"
                  />
                  <h3 className="font-medium text-gray-900 text-sm truncate">
                    {getProductName(product)}
                  </h3>
                  <p className="text-green-600 font-bold text-sm">
                    {product.price} {t('currency')}
                  </p>
                  <p className="text-xs text-gray-500">Stock: {product.stock}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Cart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col">
          {/* Cart Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <ShoppingCart className="h-6 w-6 text-green-600" />
              <h2 className="text-xl font-bold text-gray-900">Cart</h2>
              <span className="bg-green-100 text-green-600 px-2 py-1 rounded-full text-sm font-medium">
                {cart.length}
              </span>
            </div>
          </div>

          {/* Cart Items */}
          <div className="flex-1 p-6 overflow-y-auto">
            {cart.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <ShoppingCart className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Cart is empty</p>
                <p className="text-sm">Add products to start a sale</p>
              </div>
            ) : (
              <div className="space-y-3">
                {cart.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg"
                  >
                    <img
                      src={item.image}
                      alt={getProductName(item)}
                      className="h-12 w-12 object-cover rounded-lg"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 text-sm truncate">
                        {getProductName(item)}
                      </h4>
                      <p className="text-green-600 font-bold text-sm">
                        {item.price} {t('currency')}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="p-1 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        <Minus className="h-4 w-4 text-gray-600" />
                      </button>
                      <span className="text-sm font-medium w-8 text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="p-1 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        <Plus className="h-4 w-4 text-gray-600" />
                      </button>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="p-1 rounded-lg hover:bg-red-100 transition-colors"
                      >
                        <X className="h-4 w-4 text-red-600" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Cart Total & Checkout */}
          {cart.length > 0 && (
            <div className="p-6 border-t border-gray-200">
              <div className="mb-4">
                <div className="flex justify-between text-lg font-bold">
                  <span>{t('total')}</span>
                  <span>{getTotalAmount().toFixed(2)} {t('currency')}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleCheckout('cash')}
                  className="inline-flex items-center justify-center px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Banknote className="h-4 w-4 mr-2" />
                  {t('cash')}
                </button>
                <button
                  onClick={() => handleCheckout('card')}
                  className="inline-flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  {t('card')}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default POSSystem;