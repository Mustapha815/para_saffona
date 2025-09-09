import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Search,
  Filter,
  Mail,
  Phone,
  MapPin,
  ChevronDown,
  User,
  XCircle as XIcon,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal
} from 'lucide-react';
import { fetch_customers } from '../../../api/customers';
import EmailModal from './EmailModal';
import { useLanguage } from '../../../contexts/LanguageContext';

const CustomersComponent = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const { t } = useLanguage();
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // 🟢 fetch customers with react query
  const { data: customersData = [], isLoading, isError, error } = useQuery({
    queryKey: ['customers'],
    queryFn: fetch_customers,
  });
  console.log(customersData);
  

  const dateOptions = [
    { value: 'all', label: t('allTime') || 'All Time' },
    { value: 'today', label: t('today') || 'Today' },
    { value: 'week', label: t('week') || 'This Week' },
    { value: 'month', label: t('month') || 'This Month' }
  ];

  // Filter customers based on search term and date filter
  const filteredCustomers = useMemo(() => {
    const now = new Date();
    let startDate = null;

    // Set start date based on filter
    switch (dateFilter) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'week':
        const dayOfWeek = now.getDay();
        const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
        startDate = new Date(now.setDate(diff));
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      default:
        startDate = null;
    }

    return customersData.filter(customer => {
      // Apply search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch = (
          (customer.name && customer.name.toLowerCase().includes(searchLower)) ||
          (customer.email && customer.email.toLowerCase().includes(searchLower)) ||
          (customer.phone && customer.phone.toLowerCase().includes(searchLower)) ||
          (customer.city && customer.city.toLowerCase().includes(searchLower))
        );
        
        if (!matchesSearch) return false;
      }

      // Apply date filter
      if (startDate && customer.joined_at) {
        const customerDate = new Date(customer.joined_at);
        return customerDate >= startDate;
      }

      return true;
    });
  }, [customersData, searchTerm, dateFilter]);

  // Calculate pagination details based on the filtered data
  const totalItems = filteredCustomers.length || 0;
  const totalPages = Math.ceil(totalItems / pageSize);
  const hasPrev = currentPage > 1;
  const hasNext = currentPage < totalPages;
  
  // Paginate filtered data
  const paginatedCustomers = filteredCustomers.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return dateString; // Return original if parsing fails
    }
  };

  // Handle view customer details
  const handleViewCustomer = (customer) => {
    setSelectedCustomer(customer);
    setIsDetailModalOpen(true);
  };

  // Handle open email modal
  const handleOpenEmailModal = (customer) => {
    setSelectedCustomer(customer);
    setIsEmailModalOpen(true);
  };

  // Handle page change
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  // Handle filter change
  const handleFilterChange = () => {
    setCurrentPage(1); // Reset to first page when filters change
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-violet-50/30 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading customers...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-violet-50/30 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-100 p-4 rounded-xl inline-flex mb-4">
            <XIcon className="h-8 w-8 text-red-600" />
          </div>
          <p className="text-gray-600">Error loading customers: {error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-violet-50/30 p-6 space-y-8 ml-72">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-violet-500 to-purple-500 p-3 rounded-2xl">
              <User className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-purple-900 to-indigo-900 bg-clip-text text-transparent mb-2">
                {t('customers') || 'Customers'}
              </h1>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-violet-600">{totalItems || 0}</span>
                <span className="text-gray-600 text-lg">{t('registeredCUs')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-lg border border-white/50 p-6">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder={t("cusSearchPlaceholder") || "Search customers by name, email, phone or city..."}
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1); // Reset to first page when searching
                }}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent bg-white/50"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            <div className="relative">
              <select
                value={dateFilter}
                onChange={(e) => {
                  setDateFilter(e.target.value);
                  handleFilterChange();
                }}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent bg-white/50 appearance-none pr-10"
              >
                {dateOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
            </div>

            <button 
              className="px-4 py-3 bg-gradient-to-r from-violet-500 to-purple-500 text-white rounded-xl hover:from-violet-600 hover:to-purple-600 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all duration-300"
              onClick={handleFilterChange}
            >
              <Filter className="w-4 h-4" />
              <span>{t("filter") || "Filter"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-lg border border-white/50 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center space-x-3 mb-4 sm:mb-0">
            <div className="bg-gradient-to-br from-violet-500 to-purple-500 p-2 rounded-xl">
              <User className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{t('cusDirectory') || 'Customer Directory'}</h2>
              <p className="text-sm text-gray-600">{t('allregCus') || 'All registered customers in your system'}</p>
            </div>
          </div>
          <div className="text-sm text-gray-500">
            {t('page') || 'Page'} {currentPage} {t('of') || 'of'} {totalPages}
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('cus') || 'Customer'}</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('contact') || 'Contact'}</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('orders') || 'Orders'}</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('totalSpent') || 'Total Spent'}</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('joined') || 'Joined'}</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedCustomers.map((customer) => (
                <tr 
                  key={customer.id} 
                  className="hover:bg-gray-50/50 transition-colors duration-200 cursor-pointer"
                  onClick={() => handleViewCustomer(customer)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-br from-violet-500 to-purple-500 rounded-full flex items-center justify-center text-white font-medium">
                        {customer.name?.charAt(0) || 'C'}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{customer.name || 'Unknown Customer'}</div>
                        <div className="text-sm text-gray-500">{customer.city || 'N/A'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{customer.email || 'N/A'}</div>
                    <div className="text-sm text-gray-500">{customer.phone || 'N/A'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{customer.total_orders || 0}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {customer.total_spent ? customer.total_spent.toLocaleString() : '0'} DH
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {formatDate(customer.joined_at)}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {paginatedCustomers.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm text-gray-700">
              {t('showing') || 'Showing'} <span className="font-medium">{(currentPage - 1) * pageSize + 1}</span> {t('to') || 'to'}{' '}
              <span className="font-medium">{Math.min(currentPage * pageSize, totalItems)}</span> {t('of') || 'of'} {' '}
              <span className="font-medium">{totalItems}</span> {t('customers') || 'customers'}
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={!hasPrev}
                className={`flex items-center px-3 py-1.5 rounded-lg border border-gray-300 text-sm font-medium ${
                  hasPrev
                    ? 'text-gray-700 bg-white hover:bg-gray-50'
                    : 'text-gray-400 bg-gray-100 cursor-not-allowed'
                }`}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                {t('previous') || 'Previous'}
              </button>
              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  // Show pages around current page
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                        currentPage === pageNum
                          ? 'bg-violet-500 text-white'
                          : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                {totalPages > 5 && (
                  <span className="px-2 py-1.5 text-gray-500">
                    <MoreHorizontal className="h-4 w-4" />
                  </span>
                )}
              </div>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={!hasNext}
                className={`flex items-center px-3 py-1.5 rounded-lg border border-gray-300 text-sm font-medium ${
                  hasNext
                    ? 'text-gray-700 bg-white hover:bg-gray-50'
                    : 'text-gray-400 bg-gray-100 cursor-not-allowed'
                }`}
              >
                {t('next') || 'Next'}
                <ChevronRight className="h-4 w-4 ml-1" />
              </button>
            </div>
          </div>
        )}

        {paginatedCustomers.length === 0 && (
          <div className="text-center py-12">
            <div className="bg-gradient-to-br from-gray-100 to-gray-200 p-4 rounded-2xl w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <User className="h-8 w-8 text-gray-400" />
            </div>
            <p className="text-gray-500 font-medium">{t('noCustomersFound') || 'No customers found'}</p>
            <p className="text-sm text-gray-400">{t('tryAdjustingSearch') || 'Try adjusting your search or filter criteria'}</p>
          </div>
        )}
      </div>

      {/* Customer Detail Modal */}
      {isDetailModalOpen && selectedCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">
                  {t('cusDetails') || 'Customer Details'} - {selectedCustomer.name || 'Unknown Customer'}
                </h2>
                <button
                  onClick={() => setIsDetailModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
                >
                  <XIcon className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Customer Information */}
                <div className="bg-gradient-to-r from-gray-50 to-violet-50/50 rounded-2xl p-5 border border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('personalInfo') || 'Personal Information'}</h3>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-12 w-12 bg-gradient-to-br from-violet-500 to-purple-500 rounded-full flex items-center justify-center text-white font-medium text-lg">
                        {selectedCustomer.name?.charAt(0) || 'C'}
                      </div>
                      <div className="ml-4">
                        <div className="font-medium text-gray-900">{selectedCustomer.name || 'Unknown Customer'}</div>
                        <div className="text-sm text-gray-500">{t('customerSince') || 'Customer since'} {formatDate(selectedCustomer.joined_at)}</div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Mail className="w-5 h-5 text-gray-400 mr-3" />
                      <span className="text-gray-700">{selectedCustomer.email || 'N/A'}</span>
                    </div>
                    <div className="flex items-center">
                      <Phone className="w-5 h-5 text-gray-400 mr-3" />
                      <span className="text-gray-700">{selectedCustomer.phone || 'N/A'}</span>
                    </div>
                    <div className="flex items-center">
                      <MapPin className="w-5 h-5 text-gray-400 mr-3" />
                      <span className="text-gray-700">{selectedCustomer.city || 'N/A'}</span>
                    </div>
                  </div>
                </div>

                {/* Order Information */}
                <div className="bg-gradient-to-r from-gray-50 to-violet-50/50 rounded-2xl p-5 border border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('orderInfo') || 'Order Information'}</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">{t('totalOrders') || 'Total Orders'}:</span>
                      <span className="font-medium">{selectedCustomer.total_orders || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">{t('totalSpent') || 'Total Spent'}:</span>
                      <span className="font-medium text-green-600">{selectedCustomer.total_spent ? selectedCustomer.total_spent.toLocaleString() : '0'} DH</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">{t('averageSpent') || 'Average Spent'}:</span>
                      <span className="font-medium">
                        {selectedCustomer.total_orders > 0 ? (selectedCustomer.total_spent / selectedCustomer.total_orders).toFixed(2) : '0.00'} DH
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">{t('lastOrder') || 'Last Order'}:</span>
                      <span className="font-medium">{formatDate(selectedCustomer.last_order)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {isEmailModalOpen && selectedCustomer && (
        <EmailModal
          customer={selectedCustomer}
          onClose={() => setIsEmailModalOpen(false)}
        />
      )}
    </div>
  );
};

export default CustomersComponent;