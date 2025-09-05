import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useMutation } from '@tanstack/react-query';
import { 
  X, Plus, Minus, MapPin, Phone, User, Truck, CreditCard, ArrowLeft,
  Shield, CheckCircle, ShoppingBag, Package, ArrowRight, ChevronRight, Home,
  Box, Gift, AlertCircle
} from 'lucide-react';
import { decreaseQuantity, increaseQuantity, removeFromCart, clearCart } from '../../../redux/action';
import { createOrder } from '../../../api/orders';
import { useLanguage } from '../../../contexts/LanguageContext';
import Alert from '../halpers/Alert';

const ShoppingCart = () => {
  const dispatch = useDispatch();
  const { t } = useLanguage();
  const cartItems = useSelector((state) => state.client?.cartItems || []);
  const [showAlert, setShowAlert] = useState(false);

  const [currentStep, setCurrentStep] = useState('cart'); // 'cart', 'info', 'review'
  const [deliveryArea, setDeliveryArea] = useState('');
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    phoneNumber: '',
    city: '',
    address: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [touchedFields, setTouchedFields] = useState({})


  const deliveryAreas = [
    { id: 1, name: 'Dakhla', delivery_fee: 10.00 },
    { id: 2, name: 'Southern_Region', delivery_fee: 25.00 },
    { id: 3, name: 'Upper_Agadir', delivery_fee: 35.00 },
  ];



  // Helper functions
  const updateQuantity = (itemId, newQuantity, isPack) => {
    if (newQuantity <= 0) {
      dispatch(removeFromCart(itemId, isPack));
      return;
    }

    if (newQuantity > getItemQuantity(itemId, isPack)) {
      dispatch(increaseQuantity(itemId, isPack));
    } else if (newQuantity < getItemQuantity(itemId, isPack)) {
      dispatch(decreaseQuantity(itemId, isPack));
    }
  };

  const getItemQuantity = (itemId, isPack) => {
    const item = cartItems.find(i => i.id === itemId && i.isPack === isPack);
    return item ? item.quantity : 0;
  };

  const removeItem = (itemId, isPack) => {
    dispatch(removeFromCart(itemId, isPack));
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => total + parseFloat(item.price) * item.quantity, 0);
  };

  const getDeliveryFee = () => {
    if (calculateSubtotal() >= 500) return 0;
    const area = deliveryAreas.find(a => a.name === deliveryArea);
    return area ? area.delivery_fee : 0;
  };

  const calculateTotal = () => calculateSubtotal() + getDeliveryFee();

  const handleInputChange = (field, value) => {
    setCustomerInfo(prev => ({ ...prev, [field]: value }));
    
    // Validate field on change
    if (touchedFields[field]) {
      validateField(field, value);
    }
  };

  const handleBlur = (field) => {
    setTouchedFields(prev => ({ ...prev, [field]: true }));
    validateField(field, customerInfo[field]);
  };

  const validateField = (field, value) => {
    let error = '';
    
    switch (field) {
      case 'name':
        if (!value.trim()) error = t('cartnameRequired');
        else if (value.trim().length < 2) error = t('cartnameMinLength');
        break;
      case 'phoneNumber':
        if (!value.trim()) error = t('cartphoneRequired');
        else if (!/^0[5-7][0-9]{8}$/.test(value)) error = t('cartphoneInvalid');
        break;
      case 'city':
        if (!value.trim()) error = t('cartcityRequired');
        break;
      case 'address':
        if (!value.trim()) error = t('cartaddressRequired');
        break;
      default:
        break;
    }
    
    setFormErrors(prev => ({ ...prev, [field]: error }));
    return !error;
  };

  const validateForm = () => {
    const newTouchedFields = { name: true, phoneNumber: true, city: true, address: true };
    setTouchedFields(newTouchedFields);
    
    const validations = [
      validateField('name', customerInfo.name),
      validateField('phoneNumber', customerInfo.phoneNumber),
      validateField('city', customerInfo.city),
      validateField('address', customerInfo.address),
    ];
    
    if (calculateSubtotal() < 500) {
      if (!deliveryArea) {
        setFormErrors(prev => ({ ...prev, deliveryArea: t('cartdeliveryAreaRequired') }));
        return false;
      }
    }
    
    return validations.every(valid => valid);
  };

  const handleNextStep = () => {
    if (currentStep === 'cart') {
      setCurrentStep('info');
    } else if (currentStep === 'info') {
      if (validateForm()) {
        setCurrentStep('review');
      }
    }
  };

  const handlePreviousStep = () => {
    if (currentStep === 'info') setCurrentStep('cart');
    else if (currentStep === 'review') setCurrentStep('info');
  };
  const [isSubmitting, setIsSubmitting] = useState(false);

const handleCheckout = () => {
  if (isSubmitting) return; // immediately block multiple clicks

  if (validateForm()) {
    setIsSubmitting(true);

    createOrderMutation.mutate(
      {
        name: customerInfo.name,
        phone_number: customerInfo.phoneNumber,
        address: customerInfo.address,
        city: customerInfo.city,
        delivery_area_id: deliveryAreas.find(area => area.name === deliveryArea)?.id || null,
        items: cartItems.map(item => ({
          target_name: item.isPack ? 'pack' : 'product',
          target_id: item.id,
          quantity: item.quantity,
          price: item.price
        })),
        user_id: JSON.parse(localStorage.getItem('user'))?.id || null,
      },
      {
        onSuccess: (data) => {
          setIsSubmitting(false);
          setShowAlert(true);
          dispatch(clearCart());
        },
        onError: (error) => {
          setIsSubmitting(false);
          alert(`Order failed: ${error.message}`);
        }
      }
    );
  }
};

  const subtotal = calculateSubtotal();
  const isFreeDelivery = subtotal >= 500;

  // Empty cart state
  if (cartItems.length === 0 ) {
    return (
     <>
       {
      showAlert && (
      <Alert
        show={showAlert}
        onClose={() => setShowAlert(false)}
        duration={5000}
        message={t('orderSuccess')}
      />
   )
   }
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <Link to="/" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-8">
            <ArrowLeft className="w-5 h-5 mr-2" />
            {t('continueShopping')}
          </Link>
          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="w-12 h-12 text-blue-500" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">{t('yourCartIsEmpty')}</h1>
            <p className="text-gray-600 mb-8">{t('emptyCartMessage')}</p>
            <Link to="/" className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              {t('startShopping')}
            </Link>
          </div>
        </div>
      </div>
     </>
    );
  }

  const steps = [
    { id: 'cart', title: t('stepcart'), icon: ShoppingBag },
    { id: 'info', title: t('stepinfo'), icon: User },
    { id: 'review', title: t('stepreview'), icon: CreditCard }
  ];



  return (
   <>
   {
      showAlert && (
      <Alert
        show={showAlert}
        onClose={() => setShowAlert(false)}
        duration={5000}
        message={t('orderSuccess')}
      />
   )
   }
      
   
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Breadcrumb */}
        <div className="flex items-center mb-8">
          <Link to="/" className="text-blue-600 hover:text-blue-800 flex items-center">
            <Home className="w-4 h-4 mr-1" /> Home
          </Link>
          <ChevronRight className="w-4 h-4 mx-2 text-gray-400" />
          <span className="text-gray-600">Shopping Cart</span>
        </div>

        {/* Steps - Improved responsive design */}
        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 mb-8">
          <div className="flex sm:flex-row justify-between items-center">
            {steps.map((step, index) => {
              const StepIcon = step.icon;
              const isActive = steps.findIndex(s => s.id === currentStep) >= index;
              return (
                <div key={step.id} className="flex items-center w-full sm:w-auto mb-4 sm:mb-0">
                  <div className="flex flex-col items-center w-full">
                    <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center mb-2 ${isActive ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                      <StepIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <span className={`text-xs sm:text-sm font-medium ${isActive ? 'text-blue-600' : 'text-gray-600'}`}>{step.title}</span>
                  </div>
                  {index < steps.length - 1 && (
                    <div className="hidden sm:flex mx-2 sm:mx-4">
                      <div className="h-0.5 bg-gray-300 w-8 sm:w-16"></div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Main */}
          <div className="lg:col-span-2">
            {/* Cart Step */}
            {currentStep === 'cart' && (
              <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">{t('yourCartItems')}</h2>
                <div className="space-y-4">
                  {cartItems.map(item => (
                    <div key={`${item.id}-${item.isPack ? 'pack' : 'product'}`} className="flex  sm:flex-row items-center gap-3 p-4 border border-gray-200 rounded-lg">
                      {item.isPack ? (
                        <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Box className="w-8 h-8 text-blue-600" />
                        </div>
                      ) : (
                        <img 
                          src={`${import.meta.env.VITE_IMG_BASE_URL}/${item.image}`} 
                          alt={item.name} 
                          className="w-16 h-16 object-cover rounded-lg flex-shrink-0" 
                          onError={(e) => {
                            e.target.src = 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=150&h=150&fit=crop';
                          }}
                        />
                      )}
                      <div className="flex-1 text-center sm:text-left">
                        <h3 className="font-semibold text-gray-900">{item.name}</h3>
                        <p className="text-sm text-gray-600">
                          {item.isPack ? 'Pack' : (item.category?.name || t('product'))}
                        </p>
                        <p className="text-lg font-bold text-blue-600">{parseFloat(item.price).toFixed(2)} DH</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center border border-gray-300 rounded-lg">
                          <button 
                            onClick={() => updateQuantity(item.id, item.quantity - 1, item.isPack)} 
                            className="p-2 hover:bg-gray-100" 
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="px-3 py-1 font-medium min-w-[2rem] text-center">{item.quantity}</span>
                          <button 
                            onClick={() => updateQuantity(item.id, item.quantity + 1, item.isPack)} 
                            className="p-2 hover:bg-gray-100"
                           disabled={item.stock === item.quantity}
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                        <button 
                          onClick={() => removeItem(item.id, item.isPack)} 
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Info Step */}
            {currentStep === 'info' && (
              <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">{t('cartcustomerInformation')}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('cartfullName')} *</label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                      <input 
                        type="text" 
                        value={customerInfo.name} 
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        onBlur={() => handleBlur('name')}
                        className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                          formErrors.name ? 'border-red-500' : 'border-gray-300'
                        }`} 
                        placeholder={t('cartenterFullName')}
                      />
                    </div>
                    {formErrors.name && (
                      <p className="text-red-500 text-sm mt-1 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" /> {formErrors.name}
                      </p>
                    )}
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('cartphoneNumber')} *</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                      <input
                        type="tel"
                        value={customerInfo.phoneNumber}
                        onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                        onBlur={() => handleBlur('phoneNumber')}
                        className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                          formErrors.phoneNumber ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder={t('cartenterPhoneNumber')}
                      />
                    </div>
                    {formErrors.phoneNumber && (
                      <p className="text-red-500 text-sm mt-1 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" /> {formErrors.phoneNumber}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('cartcity')} *</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                      <input 
                        type="text" 
                        value={customerInfo.city} 
                        onChange={(e) => handleInputChange('city', e.target.value)}
                        onBlur={() => handleBlur('city')}
                        className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                          formErrors.city ? 'border-red-500' : 'border-gray-300'
                        }`} 
                        placeholder={t('cartenterCity')} 
                      />
                    </div>
                    {formErrors.city && (
                      <p className="text-red-500 text-sm mt-1 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" /> {formErrors.city}
                      </p>
                    )}
                  </div>
                  {!isFreeDelivery && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">{t('cartdeliveryArea')} *</label>
                      <div className="relative">
                        <Truck className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                        <select 
                          value={deliveryArea} 
                          onChange={(e) => {
                            setDeliveryArea(e.target.value);
                            if (formErrors.deliveryArea) {
                              setFormErrors(prev => ({ ...prev, deliveryArea: '' }));
                            }
                          }}
                          onBlur={() => {
                            if (!deliveryArea) {
                              setFormErrors(prev => ({ ...prev, deliveryArea: 'Please select a delivery area' }));
                            }
                          }}
                          className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 appearance-none ${
                            formErrors.deliveryArea ? 'border-red-500' : 'border-gray-300'
                          }`}
                        >
                          <option value="">{t('cartselectDeliveryArea')}</option>
                          {deliveryAreas.map(area => <option key={area.id} value={area.name}>{area.name} ({area.delivery_fee.toFixed(2)} MAD)</option>)}
                        </select>
                      </div>
                      {formErrors.deliveryArea && (
                        <p className="text-red-500 text-sm mt-1 flex items-center">
                          <AlertCircle className="w-4 h-4 mr-1" /> {formErrors.deliveryArea}
                        </p>
                      )}
                    </div>
                  )}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('cartaddress')} *</label>
                    <div className="relative">
                      <textarea 
                        value={customerInfo.address} 
                        onChange={(e) => handleInputChange('address', e.target.value)}
                        onBlur={() => handleBlur('address')}
                        className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                          formErrors.address ? 'border-red-500' : 'border-gray-300'
                        }`} 
                        placeholder={t('cartenterAddress')}
                        rows={3} 
                      />
                    </div>
                    {formErrors.address && (
                      <p className="text-red-500 text-sm mt-1 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" /> {formErrors.address}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Review Step */}
            {currentStep === 'review' && (
              <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">{t('cartorderReview')}</h2>
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-4">{t('cartcustomerInformation')}</h3>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                      <p><strong>{t('cartfullName')}:</strong> {customerInfo.name}</p>
                      <p><strong>{t('cartphoneNumber')}:</strong> {customerInfo.phoneNumber}</p>
                      <p><strong>{t('cartcity')}:</strong> {customerInfo.city}</p>
                      <p><strong>{t('cartaddress')}:</strong> {customerInfo.address}</p>
                      {!isFreeDelivery && <p><strong>{t('cartdeliveryArea')}:</strong> {deliveryArea}</p>}
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-4">{t('cartorderItems')}</h3>
                    <div className="space-y-3">
                      {cartItems.map(item => (
                        <div key={`${item.id}-${item.isPack ? 'pack' : 'product'}`} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            {item.isPack ? (
                              <div className="w-10 h-10 bg-blue-100 rounded flex items-center justify-center flex-shrink-0">
                                <Box className="w-6 h-6 text-blue-600" />
                              </div>
                            ) : (
                              <img 
                                src={`${import.meta.env.VITE_IMG_BASE_URL}/${item.image}`} 
                                alt={item.name} 
                                className="w-10 h-10 object-cover rounded flex-shrink-0"
                                onError={(e) => {
                                  e.target.src = 'https://images.unsplash.com/phone-1584308666744-24d5c474f2ae?w=150&h=150&fit=crop';
                                }}
                              />
                            )}
                            <div>
                              <p className="font-medium">{item.name}</p>
                              <p className="text-sm text-gray-600">
                                {item.isPack ? 'Pack' : 'Product'} • Qty: {item.quantity}
                              </p>
                            </div>
                          </div>
                          <p className="font-semibold">{(parseFloat(item.price) * item.quantity).toFixed(2)} DH</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 sticky top-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">{t('cartorderSummary')}</h2>

              {/* Free Delivery Banner */}
              {isFreeDelivery && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4 flex items-start">
                  <Gift className="w-5 h-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                  <p className="text-green-700 text-sm">
                    <strong>{t('cartcongratulations')}!</strong> {t('youVe')} <strong>{t('cartfreeDelivery')}</strong> {t('onOrdersOver')} 500 DH.
                  </p>
                </div>
              )}
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span>{t('cartsubtotal')}</span>
                  <span>{subtotal.toFixed(2)} DH</span>
                </div>
                
                <div className="flex justify-between">
                  <span>{t('cartdeliveryFee')}</span>
                  <span className={isFreeDelivery ? 'text-green-600' : ''}>
                    {isFreeDelivery ? t('free') : deliveryArea ? `${getDeliveryFee().toFixed(2)} DH` : '0.00 DH'}
                  </span>
                </div>
                
                {isFreeDelivery && (
                  <div className="flex justify-between text-green-600 text-sm">
                    <span>{t('cartdeliveryDiscount')}</span>
                    <span>-{deliveryArea ? deliveryAreas.find(a => a.name === deliveryArea)?.delivery_fee.toFixed(2) : '0.00'} DH</span>
                  </div>
                )}
                
                <div className="border-t pt-3 flex justify-between font-bold text-lg">
                  <span>{t('carttotal')}</span>
                  <span className="text-blue-600">{calculateTotal().toFixed(2)} DH</span>
                </div>
                
                {!isFreeDelivery && subtotal > 0 && (
                  <div className="bg-blue-50 rounded-lg p-3 text-center mt-4">
                    <p className="text-blue-700 text-sm">
                      {t('add')} <strong>{(500 - subtotal).toFixed(2)} DH</strong> {t('moreToget')} <strong>{t('cartfreeDelivery')}</strong>!
                    </p>
                  </div>
                )}
              </div>

              {/* Buttons */}
              <div className="space-y-3">
                {currentStep === 'cart' && (
                  <button onClick={handleNextStep} className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center text-sm sm:text-base">
                    {t('continueToInformation')} <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
                  </button>
                )}
                {currentStep === 'info' && (
                  <>
                    <button 
                      onClick={handleNextStep} 
                      disabled={Object.values(formErrors).some(error => error) || (!isFreeDelivery && !deliveryArea)}
                      className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 transition-colors flex items-center justify-center text-sm sm:text-base"
                    >
                      {t('reviewOrder')} <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
                    </button>
                    <button onClick={handlePreviousStep} className="w-full border border-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors text-sm sm:text-base">
                      {t('backToCart')}
                    </button>
                  </>
                )}
                {currentStep === 'review' && (
                  <>
             <button 
  onClick={handleCheckout} 
  disabled={isLoading || isSubmitting} 
  className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-400 transition-colors flex items-center justify-center text-sm sm:text-base"
>
  {(isLoading || isSubmitting) 
    ? <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-white mr-2"></div> 
    : <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />} 
  Complete Order
</button>
                    <button onClick={handlePreviousStep} className="w-full border border-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors text-sm sm:text-base">
                      {t('backToInformation')}
                    </button>
                  </>
                )}
              </div>

           
            </div>
          </div>
        </div>
      </div>
    </div>
   </>
  );
};

export default ShoppingCart;