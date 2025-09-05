import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useDispatch } from 'react-redux';
import { 
  Package, 
  Truck, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Eye,
  ShoppingCart,
  Calendar,
  CreditCard,
  MapPin,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  RefreshCw,
  User,
  Phone,
  Box
} from 'lucide-react';
import { fetchUserOrders } from '../../../api/orders';
import { useLanguage } from '../../../contexts/LanguageContext';

const HistoryOrders = () => {
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [refetch, setrefetch] = useState(false);
  const { t } = useLanguage();

  // Fetch user orders using React Query
const { data: orders = [], isLoading, error } = useQuery({
    queryKey: ['userOrders'],
    queryFn: fetchUserOrders,
    retry: 2,
    enabled:refetch,
    refetchOnWindowFocus: false,
  });

  const handleRefresh = async () => {
    setrefetch(true)
  };


  const toggleOrderDetails = (orderId) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'delivered':
        return <CheckCircle className="w-4 h-4" />;
      case 'returned':
        return <Truck className="w-4 h-4" />;
      case 'panding':
        return <RefreshCw className="w-4 h-4 animate-spin" />;
      case 'cancelled':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'delivered':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'returned':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'panding':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200 animate-pulse';
      case 'cancelled':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };
  const deliveryAreas = [
    { id: 1, name: 'Dakhla', delivery_fee: 5.00 },
    { id: 2, name: 'Southern_Region', delivery_fee: 8.00 },
    { id: 3, name: 'Upper_Agadir', delivery_fee: 12.00 },
  ];

  // Calculate total items in an order
  const getTotalItems = (order) => {
    return order.order_items.reduce((total, item) => total + item.quantity, 0);
  };



  // Get item image or icon
  const getItemImage = (item) => {
    if (item.target_name === 'pack') {
      return (
        <div className="w-12 h-12 bg-blue-100 rounded-md flex items-center justify-center">
          <Box className="w-6 h-6 text-blue-500" />
        </div>
      );
    } else {
      return (
        <img
          src={`${import.meta.env.VITE_IMG_BASE_URL}/${item.target.image}`}
          className="w-12 h-12 object-cover rounded-md"
        
        />
      );
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">{}</h3>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-32"></div>
                  <div className="h-3 bg-gray-200 rounded w-24"></div>
                </div>
                <div className="h-8 bg-gray-200 rounded w-20"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="text-center py-12">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <p className="text-gray-600">{t('failedToLoad')}</p>
          <p className="text-sm text-gray-500 mt-1">{error.message}</p>
          <button
            onClick={handleRefresh}
            className="inline-block mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {t('tryAgain')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">{t('orderHistory')}</h3>
        <button
          onClick={handleRefresh}
          className="flex items-center gap-2 px-3 py-1 text-sm text-gray-600 hover:text-gray-800 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          {t('refresh')}
        </button>
      </div>

      <div className="space-y-4">
        {orders.sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
            .map((order) => (
          <div key={order.id} className="border border-gray-200 rounded-lg overflow-hidden">
            {/* Order Header - Always visible */}
            <div className="p-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Package className="w-5 h-5 text-gray-600" />
                    <span className="font-medium text-gray-900">#{order.order_number}</span>
                  </div>
                  <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
                    {getStatusIcon(order.status)}
                    <span className="capitalize">{t(order.status)}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(order.created_at).toLocaleDateString()}</span>
                  </div>
                  
                  <button
                    onClick={() => toggleOrderDetails(order.id)}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-blue-600 hover:text-blue-700 transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                    {expandedOrder === order.id ? t('hideDetails') : t('viewDetails')}
                    {expandedOrder === order.id ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Expanded Order Details - Only shown when clicked */}
            {expandedOrder === order.id && (
              <div className="p-4 bg-gray-50 border-t border-gray-200">
                {/* Order Items */}
                <div className="mb-6">
                  <h4 className="font-medium text-gray-900 mb-4">{t('orderItems')} ({getTotalItems(order)} {t('items')})</h4>
                  <div className="space-y-3">
                    {order.order_items.map((item) => {
                      const unitPrice = parseFloat(item.total_price) / item.quantity;
                      const isPack = item.target_name === 'pack';
                      
                      return (
                        <div key={item.id} className="flex items-center gap-4 p-3 bg-white rounded-lg border border-gray-200">
                          {getItemImage(item)}
                          <div className="flex-1 min-w-0">
                            <h5 className="font-medium text-gray-900 text-sm">
                              {item.target.name}
                            </h5>
                            <div className="flex items-center gap-2 mt-1">
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                isPack 
                                  ? 'bg-blue-100 text-blue-800' 
                                  : 'bg-green-100 text-green-800'
                              }`}>
                                {isPack ? 'Pack' : 'Product'}
                              </span>
                            </div>
                            <div className="flex items-center gap-4 mt-2">
                              <span className="text-xs text-gray-600">Qty: {item.quantity}</span>
                              <span className="text-xs font-medium text-blue-600">
                                ${unitPrice.toFixed(2)} {t('each')}
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-gray-900 text-sm">
                              ${parseFloat(item.total_price).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Order Summary */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">{t('orderSummary')}</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">{t('subtotal')}</span>
                        <span className="font-medium">${parseFloat(order.total_order).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">{t('shipping')}</span>
                        <span className="font-medium">$0.00</span>
                      </div>
                      <div className="flex justify-between pt-2 border-t border-gray-200">
                        <span className="text-gray-900 font-medium">{t('total')}</span>
                        <span className="text-blue-600 font-bold">${parseFloat(order.total_order).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Customer Information */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">{t('customerInformation')}</h4>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-gray-200">
                        <User className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                        <div className="text-sm text-gray-600">
                          <p className="font-medium">{order.name}</p>
                          <p className="text-xs">{t('customer')}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-gray-200">
                        <Phone className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                        <div className="text-sm text-gray-600">
                          <p className="font-medium">{order.phone_number}</p>
                          <p className="text-xs">{t('phoneNumber')}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Shipping Information */}
                  <div className="md:col-span-2">
                    <h4 className="font-medium text-gray-900 mb-3">{t('shippingAddress')}</h4>
                    <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-gray-200">
                      <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                      <div className="text-sm text-gray-600">
                        <p className="font-medium">{order.address}</p>
                        <p>{order.city}</p>
                        <p className="text-xs">{t('deliveryArea')} : 
                          <span className="font-medium">{deliveryAreas.find(area => area.id === order.delivery_area_id)?.name}</span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

  
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Empty state if no orders */}
      {orders.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600">{t('noOrdersYet')}</p>
          <p className="text-sm text-gray-500 mt-1">{t('orderHistoryWillAppear')}</p>
          <a
            href="/shop"
            className="inline-block mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {t('startShopping')}
          </a>
        </div>
      )}
    </div>
  );
};

export default HistoryOrders;