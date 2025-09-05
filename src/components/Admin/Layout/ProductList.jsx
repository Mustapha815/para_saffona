
import React, { useState } from 'react';
import { useLanguage } from '../../../contexts/LanguageContext';
import { 
  Search, 
  Filter, 
  Plus, 
  Edit, 
  Trash2, 
  AlertTriangle,
  Package,
  Building2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Eye,
  RefreshCw,
  Tag,
  X
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import ProductForm from './ProductForm';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { fetch_products, fetch_delete_product, fetch_create_offer, fetch_remove_offer } from '../../../api/products';
import { fetch_categories } from '../../../api/categories';
import WarningAlert from '../helpers/WarningAlert';

const ProductList = () => {
  const { t, language } = useLanguage();
  const queryClient = useQueryClient();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [filter, setFilter] = useState('all');
  const [selectedImage, setSelectedImage] = useState(null);
  const [offerModal, setOfferModal] = useState({ 
    isOpen: false, 
    product: null,
    start_date: '',
    end_date: '',
    offer_price: ''
  });
  const pageSize = 10;

  // 🟢 fetch products with react query
  const { data: products = [], isLoading, isError, error } = useQuery({
    queryKey: ['products'],
    queryFn: fetch_products,
  });

  const {data:categories=[]}=useQuery({
    queryKey:['categories'],
    queryFn:fetch_categories
  });

  // Calculate inventory stats
  const totalValue = products.reduce((sum, product) => sum + (parseFloat(product.price) * product.stock), 0);
  const lowStockItems = products.filter(product => product.stock > 0 && product.stock <= 5).length;
  const outOfStockItems = products.filter(product => product.stock === 0).length;

  const filteredProducts = products?.filter(product => {
    const name = product?.name;

    const matchesSearch = name.toLowerCase().includes(searchTerm?.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category?.name === selectedCategory;
    
    // Apply additional filters
    let matchesFilter = true;
    if (filter === 'low-stock') {
      matchesFilter = product.stock > 0 && product.stock <= 5;
    } else if (filter === 'out-of-stock') {
      matchesFilter = product.stock === 0;
    }
    
    return matchesSearch && matchesCategory && matchesFilter;
  });

  // Calculate pagination
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedProducts = filteredProducts.slice(startIndex, endIndex);
  const totalPages = Math.ceil(filteredProducts.length / pageSize);
  const hasNext = endIndex < filteredProducts.length;
  const hasPrev = currentPage > 1;



  const getStockStatus = (product) => {
    if (product.stock === 0) return { 
      status: 'Out Of Stock', 
      color: 'bg-red-100 text-red-800',
      icon: AlertTriangle
    };
    if (product.stock > 0 && product.stock <= 5 ) return { 
      status: 'Low Stock', 
      color: 'bg-orange-100 text-orange-800',
      icon: AlertTriangle
    };
    return { 
      status: 'In Stock', 
      color: 'bg-green-100 text-green-800',
      icon: Package
    };
  };

  // Calculate discount percentage
  const getDiscountPercentage = (product) => {
    if (product.offer_price && product.price) {
      return Math.round((1 - parseFloat(product.offer_price) / parseFloat(product.price)) * 100);
    }
    return 0;
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const deleteMutation = useMutation({
    mutationFn: fetch_delete_product,
    onSuccess: () => {
      queryClient.invalidateQueries(["products"]);
    },
    onError: (error) => {
      console.error("Delete failed:", error);
      alert(t("errors.delete_product_failed"));
    },
  });

  const delete_product = (ProductId) => {
    if (window.confirm(t("product.confirm_delete"))) {
      deleteMutation.mutate(ProductId);
    }
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingProduct(null);
  };

  const openImageModal = (product) => {
    setSelectedImage({
      src: `${import.meta.env.VITE_IMG_BASE_URL}/${product.image}`,
      alt: product.name
    });
  };

  const closeImageModal = () => {
    setSelectedImage(null);
  };

  // Offer management functions
  const openOfferModal = (product) => {
    setOfferModal({
      isOpen: true,
      product,
      start_date: product.offer?.start_date || '',
      end_date: product.offer?.end_date || '',
      offer_price: product.offer_price || ''
    });
  };

  const closeOfferModal = () => {
    setOfferModal({ 
      isOpen: false, 
      product: null,
      start_date: '',
      end_date: '',
      offer_price: ''
    });
  };

  const handleOfferInputChange = (e) => {
    const { name, value } = e.target;
    setOfferModal(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const createOfferMutation = useMutation({
    mutationFn: (data) => fetch_create_offer(data),
    onSuccess: () => {
      queryClient.invalidateQueries(["products"]);
      closeOfferModal();
    },
    onError: (error) => {
      console.error("Create offer failed:", error);
      alert("Failed to create offer. Please check your inputs.");
    },
  });

  const removeOfferMutation = useMutation({
    mutationFn: (productId) => fetch_remove_offer(productId),
    onSuccess: () => {
      queryClient.invalidateQueries(["products"]);
    },
    onError: (error) => {
      console.error("Remove offer failed:", error);
      alert("Failed to remove offer.");
    },
  });

  const handleCreateOffer = (price) => {
    const { start_date, end_date, offer_price } = offerModal;
    
    if (!start_date || !end_date || !offer_price) {
      alert("Please fill all required fields");
      return;
    }
    
    if (new Date(end_date) < new Date(start_date)) {
      alert("End date must be after or equal to start date");
      return;
    }
    
    if (parseFloat(offer_price) <= 0) {
      alert("Offer price must be greater than 0");
      return;
    }
       if (parseFloat(offer_price) >parseFloat(price)){
      alert("Offer price must be less than original price");
      return;
    }
    createOfferMutation.mutate({
      product_id: offerModal.product.id,
      start_date,
      end_date,
      offer_price: parseFloat(offer_price)
    });
  };

  const handleRemoveOffer = (productId) => {    
    if (window.confirm("Are you sure you want to remove this offer?")) {
      removeOfferMutation.mutate(productId);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-violet-50/30 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">{t('Loading products...')}</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-violet-50/30 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-100 p-4 rounded-xl inline-flex mb-4">
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
          <p className="text-gray-600">Error loading products: {error.message}</p>
        </div>
      </div>
    );
  }

  if (showForm) {
    return <ProductForm product={editingProduct} onClose={closeForm} />;
  }

  return (
<div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-violet-50/30 p-6 ml-72">
<WarningAlert msg={t('deleteProductAlertMsg')} />
  <div className="p-6 space-y-6">
    {/* Header */}
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{t('Product Management')}</h1>
        <p className="text-gray-600 mt-1">{t('Monitor and manage your products')}</p>
      </div>
      <div className="flex space-x-3">
        <button className="inline-flex items-center px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors">
          <RefreshCw className="h-4 w-4 mr-2" />
          {t('Refresh')}
        </button>
        <button 
          onClick={() => setShowForm(true)}
          className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" />
          {t('addProduct')}
        </button>
      </div>
    </div>

    {/* Stats Cards */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{t('Total Products')}</p>
            <p className="text-2xl font-bold text-gray-900">{products.length}</p>
          </div>
          <div className="bg-blue-100 p-3 rounded-lg">
            <Package className="h-6 w-6 text-blue-600" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{t('Low Stock')}</p>
            <p className="text-2xl font-bold text-orange-600">{lowStockItems}</p>
          </div>
          <div className="bg-orange-100 p-3 rounded-lg">
            <AlertTriangle className="h-6 w-6 text-orange-600" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{t('Out Of Stock')}</p>
            <p className="text-2xl font-bold text-red-600">{outOfStockItems}</p>
          </div>
          <div className="bg-red-100 p-3 rounded-lg">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
        </div>
      </div>
    </div>

    {/* Filters and Search */}
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder={t('Search products by name...')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent bg-white/50"
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <div className="relative">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent bg-white/50 appearance-none pr-10"
            >
              <option value="all">{t('All Categories')}</option>
              {categories.map((category,index) => (
                <option key={index} value={category.name}>
                  {category.name}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
          </div>

          <div className="flex items-center space-x-4">
            <Filter className="h-5 w-5 text-gray-400" />
            <div className="flex space-x-2">
              {[
                { key: 'all', label: t('All Products') },
                { key: 'low-stock', label: t('Low Stock') },
                { key: 'out-of-stock', label: t('Out Of Stock') }
              ].map(filterOption => (
                <button
                  key={filterOption.key}
                  onClick={() => setFilter(filterOption.key)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filter === filterOption.key
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {filterOption.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Inventory Table */}
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('Product')}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('Category')}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('Current Stock')}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('Price')}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('Offer')}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('Status')}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('Actions')}</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedProducts.map((product) => {
              const stockStatus = getStockStatus(product);
              const StatusIcon = stockStatus.icon;
              const discountPercentage = getDiscountPercentage(product);
              const hasOffer = product.offer_price && product.offer;
              const isOfferActive = hasOffer && 
                new Date() >= new Date(product.offer.start_date) && 
                new Date() <= new Date(product.offer.end_date);

              return (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {product.image ? (
                        <img
                          className="h-10 w-10 rounded-lg object-cover cursor-pointer"
                          src={`${import.meta.env.VITE_IMG_BASE_URL}/${product.image}`}
                          alt={product.name}
                          onClick={() => openImageModal(product)}
                        />
                      ) : (
                        <div className="h-10 w-10 bg-gradient-to-br from-violet-500 to-purple-500 rounded-lg flex items-center justify-center text-white font-medium">
                          {product.name.charAt(0)}
                        </div>
                      )}
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{product.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 capitalize">
                      {product.category?.name || t(product.category)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap  text-sm text-gray-900">{product.stock}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{parseFloat(product.price).toLocaleString()} {t('currency')}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {hasOffer ? (
                      <div className="flex flex-col">
                        <span className={`text-sm font-medium ${isOfferActive ? 'text-green-600' : 'text-gray-500'}`}>
                          {parseFloat(product.offer_price).toLocaleString()} {t('currency')}
                          {discountPercentage > 0 && (
                            <span className="ml-1 text-xs bg-red-100 text-red-800 px-1.5 py-0.5 rounded">
                              -{discountPercentage}%
                            </span>
                          )}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(product.offer.start_date).toLocaleDateString()} - {new Date(product.offer.end_date).toLocaleDateString()}
                          {!isOfferActive && <span className="ml-1 text-red-500">({t('Expired')})</span>}
                        </span>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500">{t('No offer')}</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${stockStatus.color}`}>
                      <StatusIcon className="h-3 w-3 mr-1" />
                      {t(stockStatus.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      {hasOffer ? (
                        <button
                          onClick={() => handleRemoveOffer(product.id)}
                          className="text-red-600 hover:text-red-900 p-2 rounded-lg hover:bg-red-50 transition-colors duration-200"
                          title={t('Remove Offer')}
                        >
                          <X className="w-4 h-4" />
                        </button>
                      ) : (
                        <button
                          onClick={() => openOfferModal(product)}
                          className="text-green-600 hover:text-green-900 p-2 rounded-lg hover:bg-green-50 transition-colors duration-200"
                          title={t('Create Offer')}
                        >
                          <Tag className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleEdit(product)}
                        className="text-blue-600 hover:text-blue-900 p-2 rounded-lg hover:bg-blue-50 transition-colors duration-200"
                        title={t('Edit Product')}
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => delete_product(product.id)}
                        className="text-red-600 hover:text-red-900 p-2 rounded-lg hover:bg-red-50 transition-colors duration-200"
                        title={t('Delete Product')}
                        disabled={deleteMutation.isLoading}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {filteredProducts.length > pageSize && (
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            {t('Showing')} <span className="font-medium">{startIndex + 1}</span> {t('to')}{' '}
            <span className="font-medium">{Math.min(endIndex, filteredProducts.length)}</span> {t('of')}{' '}
            <span className="font-medium">{filteredProducts.length}</span> {t('products')}
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={!hasPrev}
              className={`flex items-center px-3 py-1.5 rounded-lg border border-gray-300 text-sm font-medium ${
                hasPrev ? 'text-gray-700 bg-white hover:bg-gray-50' : 'text-gray-400 bg-gray-100 cursor-not-allowed'
              }`}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              {t('Previous')}
            </button>
            <div className="flex items-center space-x-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) pageNum = i + 1;
                else if (currentPage <= 3) pageNum = i + 1;
                else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
                else pageNum = currentPage - 2 + i;
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
                hasNext ? 'text-gray-700 bg-white hover:bg-gray-50' : 'text-gray-400 bg-gray-100 cursor-not-allowed'
              }`}
            >
              {t('Next')}
              <ChevronRight className="h-4 w-4 ml-1" />
            </button>
          </div>
        </div>
      )}

      {filteredProducts.length === 0 && (
        <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-gray-100">
          <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">{t('No products found')}</h3>
          <p className="text-gray-600">{t('No products match the selected filter criteria')}</p>
        </div>
      )}
    </div>
  </div>

  {/* Image Modal */}
  {selectedImage && (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" onClick={closeImageModal}>
      <div className="bg-white rounded-lg max-w-4xl max-h-full overflow-auto" onClick={e => e.stopPropagation()}>
        <div className="p-4 flex justify-between items-center border-b">
          <h3 className="text-lg font-medium">{selectedImage.alt}</h3>
          <button onClick={closeImageModal} className="text-gray-500 hover:text-gray-700">&times;</button>
        </div>
        <div className="p-4">
          <img src={selectedImage.src} alt={selectedImage.alt} className="w-full h-auto max-h-96 object-contain" />
        </div>
      </div>
    </div>
  )}

  {/* Offer Modal */}
  {offerModal.isOpen && (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">{t('Create Offer for')} {offerModal.product.name}</h3>
          <button onClick={closeOfferModal} className="text-gray-500 hover:text-gray-700">
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('Regular Price')}</label>
            <div className="text-lg font-semibold">{parseFloat(offerModal.product.price).toLocaleString()} {t('currency')}</div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('Offer Price')} *</label>
            <input
              type="number"
              name="offer_price"
              value={offerModal.offer_price}
              onChange={handleOfferInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500"
              placeholder={t('Enter offer price')}
              min="0"
              step="0.01"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('Start Date')} *</label>
            <input
              type="date"
              name="start_date"
              value={offerModal.start_date}
              onChange={handleOfferInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('End Date')} *</label>
            <input
              type="date"
              name="end_date"
              value={offerModal.end_date}
              onChange={handleOfferInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>
        </div>
        
        <div className="mt-6 flex justify-end space-x-3">
          <button
            onClick={closeOfferModal}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
          >
            {t('Cancel')}
          </button>
          <button
            onClick={()=>handleCreateOffer(offerModal.product.price)}
            className="px-4 py-2 text-white bg-violet-600 rounded-md hover:bg-violet-700"
            disabled={createOfferMutation.isLoading}
          >
            {createOfferMutation.isLoading ? t('Creating...') : t('Create Offer')}
          </button>
        </div>
      </div>
    </div>
  )}
</div>

  );
};

export default ProductList;