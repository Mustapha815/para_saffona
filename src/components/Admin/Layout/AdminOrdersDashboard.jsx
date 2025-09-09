import React, { useState, useMemo } from 'react';
import { 
  Search, Filter, Eye, CheckCircle, XCircle, Clock, User, Phone, MapPin, Package, DollarSign,
  Calendar, X, ChevronLeft, ChevronRight
} from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { fetch_orders, fetchingUpdateOrderStatus } from '../../../api/orders';
import { useLanguage } from '../../../contexts/LanguageContext';

const AdminOrdersDashboard = () => {
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const { data: orders = [], isLoading, isError, error } = useQuery({
    queryKey: ['orders'],
    queryFn: fetch_orders
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Filtered orders with useMemo
  const filteredOrders = useMemo(() => {
    let results = orders || [];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      results = results.filter(o =>
        o.order_number?.toLowerCase().includes(term) ||
        o.name?.toLowerCase().includes(term) ||
        o.phone_number?.includes(term)
      );
    }

    if (statusFilter !== 'all') {
      results = results.filter(o => o.status === statusFilter);
    }

    if (dateFilter !== 'all') {
      const now = new Date();
      results = results.filter(o => {
        const orderDate = new Date(o.created_at);
        switch (dateFilter) {
          case 'today':
            return orderDate.toDateString() === now.toDateString();
          case 'week':
            const startOfWeek = new Date(now);
            startOfWeek.setDate(now.getDate() - now.getDay());
            startOfWeek.setHours(0, 0, 0, 0);
            return orderDate >= startOfWeek;
          case 'month':
            return orderDate.getMonth() === now.getMonth() && orderDate.getFullYear() === now.getFullYear();
          default:
            return true;
        }
      });
    }

    return results;
  }, [orders, searchTerm, statusFilter, dateFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const paginatedOrders = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredOrders.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredOrders, currentPage, itemsPerPage]);

  // Mutation for updating order status
  const updateStatusMutation = useMutation({
    mutationFn: ({ orderId, newStatus }) => fetchingUpdateOrderStatus(orderId, { status: newStatus }),
    onMutate: async ({ orderId, newStatus }) => {
      await queryClient.cancelQueries(['orders']);
      const previousOrders = queryClient.getQueryData(['orders']);
      queryClient.setQueryData(['orders'], old =>
        old.map(order => order.id === orderId ? { ...order, status: newStatus } : order)
      );
      return { previousOrders };
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(['orders'], context.previousOrders);
      console.error('Error updating status:', err);
    },
    onSuccess: () => queryClient.invalidateQueries(['orders']),
  });

  const handleStatusUpdate = (orderId, newStatus) => {
    updateStatusMutation.mutate({ orderId, newStatus });
  };

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setIsDetailModalOpen(true);
  };

  // Stats calculation
  const stats = useMemo(() => ({
    total: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    returned: orders.filter(o => o.status === 'returned').length,
    cancelled: orders.filter(o => o.status === 'cancelled').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
    revenue: orders
      .filter(o => o.status === 'delivered')
      .reduce((sum, o) => sum + Number(o.total_order || 0), 0)
  }), [orders]);

  const statusOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: 'pending', label: 'Pending' },
    { value: 'returned', label: 'Returned' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  const dateOptions = [
    { value: 'all', label: 'All Dates' },
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' }
  ];

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
      returned: 'bg-blue-100 text-blue-800 border border-blue-200',
      delivered: 'bg-green-100 text-green-800 border border-green-200',
      cancelled: 'bg-red-100 text-red-800 border border-red-200'
    };
    return styles[status] || 'bg-gray-100 text-gray-800 border border-gray-200';
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: <Clock className="w-4 h-4" />,
      returned: <CheckCircle className="w-4 h-4" />,
      delivered: <CheckCircle className="w-4 h-4" />,
      cancelled: <XCircle className="w-4 h-4" />
    };
    return icons[status] || <Clock className="w-4 h-4" />;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2
    }).format(amount) + ' DH';
  };

  if (isLoading) return <p>Loading orders...</p>;
  if (isError) return <p>Error loading orders: {error.message}</p>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-violet-50/30 p-6 space-y-8 ml-72">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-purple-900 to-indigo-900 bg-clip-text text-transparent mb-2">
            {t('Orders Management') || 'Orders Management'}
          </h1>
          <p className="text-gray-600 text-lg">
            {t('Manage and track all customer orders') || 'Manage and track all customer orders'}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-lg border border-white/50 p-6">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder={t('Search orders by order number, name, or phone...') || 'Search orders by order number, name, or phone...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent bg-white/50"
            />
          </div>
          <div className="flex gap-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent bg-white/50"
            >
              {statusOptions.map(opt => (
                <option key={opt.value} value={opt.value}>
                  {t(opt.label) || opt.label}
                </option>
              ))}
            </select>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent bg-white/50"
            >
              {dateOptions.map(opt => (
                <option key={opt.value} value={opt.value}>
                  {t(opt.label) || opt.label}
                </option>
              ))}
            </select>
            <button className="px-4 py-3 bg-gradient-to-r from-violet-500 to-purple-500 text-white rounded-xl hover:from-violet-600 hover:to-purple-600 flex items-center gap-2 shadow-lg hover:shadow-xl transition-all duration-300">
              <Filter className="w-4 h-4" /> {t('Filter') || 'Filter'}
            </button>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-lg border border-white/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('Order Number') || 'Order Number'}</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('Customer') || 'Customer'}</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('Items') || 'Items'}</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('Total') || 'Total'}</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('Status') || 'Status'}</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('Date') || 'Date'}</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('Actions') || 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedOrders.map(order => (
                <tr key={order.id} className="hover:bg-gray-50/50 transition-colors duration-200">
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{order.order_number}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium">{order.name}</div>
                    <div className="text-gray-500 text-sm">{order.phone_number}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{order.order_items?.length || 0} {t('Items') || 'Items'}</td>
                  <td className="px-6 py-4 whitespace-nowrap font-bold">{formatCurrency(order.total_order || 0)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(order.status)}`}>
                      {getStatusIcon(order.status)}
                      <span className="ml-1 capitalize">{t(order.status) || order.status}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{formatDate(order.created_at)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex items-center gap-2">
                    <button onClick={() => handleViewOrder(order)} className="text-violet-600 hover:text-violet-900 p-2 rounded-lg hover:bg-violet-50 transition-colors duration-200">
                      <Eye className="w-5 h-5" />
                    </button>
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                      className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-violet-500 bg-white/50"
                    >
                      <option value="pending">{t('Pending') || 'Pending'}</option>
                      <option value="returned">{t('Returned') || 'Returned'}</option>
                      <option value="cancelled">{t('Cancelled') || 'Cancelled'}</option>
                      <option value="delivered">{t('Delivered') || 'Delivered'}</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredOrders.length === 0 && (
          <div className="text-center py-12">
            <div className="bg-gradient-to-br from-gray-100 to-gray-200 p-4 rounded-2xl w-16 h-16 mx-auto flex items-center justify-center">
              <Package className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500 mt-4">{t('No orders found') || 'No orders found'}</p>
          </div>
        )}

        {/* Pagination */}
        {filteredOrders.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-700">
                {t('Showing') || 'Showing'} {((currentPage - 1) * itemsPerPage) + 1} {t('to') || 'to'} {Math.min(currentPage * itemsPerPage, filteredOrders.length)} {t('of') || 'of'} {filteredOrders.length} {t('results') || 'results'}
              </span>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="text-sm border border-gray-200 rounded-lg px-3 py-1 focus:ring-2 focus:ring-violet-500 bg-white/50"
              >
                <option value="5">5 {t('per page') || 'per page'}</option>
                <option value="10">10 {t('per page') || 'per page'}</option>
                <option value="25">25 {t('per page') || 'per page'}</option>
                <option value="50">50 {t('per page') || 'per page'}</option>
              </select>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <ChevronLeft className="w-4 h-4" />
                {t('Previous') || 'Previous'}
              </button>
              <div className="flex gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const page = currentPage <= 3 ? i + 1 : 
                              currentPage >= totalPages - 2 ? totalPages - 4 + i : 
                              currentPage - 2 + i;
                  return page > 0 && page <= totalPages ? (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-10 h-10 rounded-lg border ${currentPage === page ? 'bg-violet-500 text-white border-violet-500' : 'border-gray-200 text-gray-700 hover:bg-gray-50'}`}
                    >
                      {page}
                    </button>
                  ) : null;
                })}
              </div>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {t('Next') || 'Next'}
                <ChevronRight className="w-4 h-4" />
              </button>
              </div>
            </div>
          )}
        </div>

        {/* Order Detail Modal */}
        {isDetailModalOpen && selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900">
                    Order Details - {selectedOrder?.order_number}
                  </h2>
                  <button
                    onClick={() => setIsDetailModalOpen(false)}
                    className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  {/* Customer Information */}
                  <div className="bg-gradient-to-r from-gray-50 to-violet-50/50 rounded-2xl p-5 border border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <User className="w-5 h-5 text-violet-600 mr-2" />
                      Customer Information
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <User className="w-5 h-5 text-gray-400 mr-3" />
                        <span className="text-gray-700">{selectedOrder?.name}</span>
                      </div>
                      <div className="flex items-center">
                        <Phone className="w-5 h-5 text-gray-400 mr-3" />
                        <span className="text-gray-700">{selectedOrder?.phone_number}</span>
                      </div>
                      <div className="flex items-center">
                        <MapPin className="w-5 h-5 text-gray-400 mr-3" />
                        <span className="text-gray-700">
                          {selectedOrder?.address}, {selectedOrder?.city}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Order Information */}
                  <div className="bg-gradient-to-r from-gray-50 to-violet-50/50 rounded-2xl p-5 border border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <Calendar className="w-5 h-5 text-violet-600 mr-2" />
                      Order Information
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Order Number:</span>
                        <span className="font-medium">{selectedOrder?.order_number}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Order Date:</span>
                        <span className="font-medium">{formatDate(selectedOrder?.created_at)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Status:</span>
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(selectedOrder?.status)}`}>
                          {getStatusIcon(selectedOrder?.status)}
                          <span className="ml-1 capitalize">{selectedOrder?.status}</span>
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Amount:</span>
                        <span className="font-medium text-green-600">{formatCurrency(selectedOrder?.total_order || 0)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="bg-gradient-to-r from-gray-50 to-violet-50/50 rounded-2xl p-5 border border-gray-100 mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Package className="w-5 h-5 text-violet-600 mr-2" />
                    Order Items
                  </h3>
                  <div className="space-y-4">
                    {selectedOrder?.order_items?.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-100 hover:shadow-md transition-all duration-300">
                        <div className="flex items-center">
                          <div className={`bg-gradient-to-br from-violet-500 to-purple-500 ${item.target_name === 'product' ? 'p-0' : 'p-2'} rounded-lg mr-4`}>
                            {item.target_name === 'product' ? (
                              <img 
                                src={`${import.meta.env.VITE_IMG_BASE_URL}/${item.target.image}`} 
                                alt={item.target.name} 
                                className="object-cover w-12 h-12 rounded-lg" 
                              />
                            ) : (
                              <Package className="w-5 h-5 text-white" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {item.target.name}
                            </p>
                            <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-gray-900">{formatCurrency(item.total_price)}</p>
                          <p className="text-sm text-gray-500">
                            {formatCurrency(parseFloat(item.total_price) / item.quantity)} each
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
  );
};

export default AdminOrdersDashboard;