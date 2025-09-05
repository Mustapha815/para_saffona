import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Package, 
  Plus, 
  Edit, 
  Trash2, 
  Search,
  X,
  Eye,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  ShoppingCart,
  Minus,
  Scan,
  AlertCircle
} from 'lucide-react';
import { useLanguage } from '../../../contexts/LanguageContext';


import { fetch_packs, create_pack, update_pack, delete_pack } from '../../../api/packs';
import { fetch_products } from '../../../api/products';

const PackManagement = () => {
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddPack, setShowAddPack] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedPack, setSelectedPack] = useState(null);
  const [editingPack, setEditingPack] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Fetch packs
  const { data: packsData, isLoading, isError } = useQuery({
    queryKey: ['packs'],
    queryFn: fetch_packs,
  });

  // Process packs data for pagination
  const packs = packsData || [];
  const filteredPacks = packs
    .filter(pack => {
      const matchesSearch = pack.name.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
    });

  // Calculate pagination
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedPacks = filteredPacks.slice(startIndex, endIndex);
  const totalPages = Math.ceil(filteredPacks.length / pageSize);
  const hasNext = endIndex < filteredPacks.length;
  const hasPrev = currentPage > 1;

  const handleView = (pack) => {
    setSelectedPack(pack);
    setShowViewModal(true);
  };

  const handleEdit = (pack) => {
    setEditingPack(pack);
    setShowAddPack(true);
  };

  const handleDelete = (packId) => {
    if (window.confirm('Are you sure you want to delete this pack?')) {
      deleteMutation.mutate(packId);
    }
  };

  const deleteMutation = useMutation({
    mutationFn: delete_pack,
    onSuccess: () => {
      queryClient.invalidateQueries(['packs']);
    },
  });

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading packs...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-100 p-4 rounded-xl inline-flex mb-4">
            <Package className="h-8 w-8 text-red-600" />
          </div>
          <p className="text-gray-600">Error loading packs.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 ml-72 ">
      {showAddPack ? (
        <AddPack 
          editingPack={editingPack}
          t = {t}
          onCancel={() => {
            setShowAddPack(false);
            setEditingPack(null);
          }}
          onSuccess={() => {
            setShowAddPack(false);
            setEditingPack(null);
          }}
        />
      ) : (
        <>
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{t('Pack Management')}</h1>
              <p className="text-gray-600 mt-1">{t('Create and manage product packs')}</p>
            </div>
            <div className="flex space-x-3">
              <button 
                onClick={() => setShowAddPack(true)}
                className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Plus className="h-4 w-4 mr-2" />
                {t('New Pack')}
              </button>
            </div>
          </div>

          {/* Search Filter */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder={t('Search packs by name...')}
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Packs Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('Pack Name')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('Description')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('price')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('Stock')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('products')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('Actions')}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedPacks.map((pack) => (
                    <tr key={pack.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="bg-blue-100 p-2 rounded-lg">
                            <Package className="h-5 w-5 text-blue-600" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {pack.name}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-xs truncate">
                          {pack.description || t('No description')}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${pack.price}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {pack.stock}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {pack.products ? pack.products.length : 0} {t('products')}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleView(pack)}
                            className="text-blue-600 hover:text-blue-900"
                            title={t('View')}
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleEdit(pack)}
                            className="text-green-600 hover:text-green-900"
                            title={t('Edit')}
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(pack.id)}
                            className="text-red-600 hover:text-red-900"
                            title={t('Delete')}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {filteredPacks.length > pageSize && (
              <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  {t('Showing')} <span className="font-medium">{startIndex + 1}</span> {t('to')}{' '}
                  <span className="font-medium">{Math.min(endIndex, filteredPacks.length)}</span> {t('of')}{' '}
                  <span className="font-medium">{filteredPacks.length}</span> {t('packs')}
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
                    {t('Previous')}
                  </button>
                  <div className="flex items-center space-x-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
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
                              ? 'bg-blue-500 text-white'
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
                    {t('Next')}
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </button>
                </div>
              </div>
            )}

            {filteredPacks.length === 0 && (
              <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-gray-100">
                <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">{t('No packs found')}</h3>
                <p className="text-gray-600">{t('Create your first pack to get started')}</p>
              </div>
            )}
          </div>

          {/* View Pack Modal */}
          {showViewModal && selectedPack && (
            <ViewPackModal
              pack={selectedPack}
              onClose={() => {
                setShowViewModal(false);
                setSelectedPack(null);
              }}
            />
          )}
        </>
      )}
    </div>
  );

};
// AddPack Component (POS-style design)
const AddPack = ({ editingPack, onCancel, onSuccess,t }) => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 12;
  const [formData, setFormData] = useState({
    name: editingPack?.name || '',
    description: editingPack?.description || '',
    price: editingPack?.price || '',
    product_ids: editingPack?.products ? editingPack.products.map(p => p.id) : []
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [touched, setTouched] = useState({});

  // Fetch all products
  const { data: productsData, isLoading: productsLoading } = useQuery({
    queryKey: ['products'],
    queryFn: fetch_products,
  });

  // Filter products based on search term
  const filteredProducts = productsData?.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  // Calculate pagination
  const totalProducts = filteredProducts.length;
  const totalPages = Math.ceil(totalProducts / productsPerPage);
  const startIndex = (currentPage - 1) * productsPerPage;
  const endIndex = startIndex + productsPerPage;
  const paginatedProducts = filteredProducts.slice(startIndex, endIndex);
  const hasNext = endIndex < totalProducts;
  const hasPrev = currentPage > 1;

  // Validation function
  const validateField = (name, value) => {
    let error = '';
    
   
switch (name) {
  case "name":
    if (!value.trim()) error = t("nameRequired");
    else if (value.trim().length < 2) error = t("nameMin");
    else if (value.trim().length > 100) error = t("nameMax") ;
    break;

  case "description":
    if (value.length > 500) error = t("descriptionMax");
    else if (value.trim().length === 0) error = t("descriptionRequired");
    break;

  case "price":
    if (!value) error = t("priceRequired");
    else if (isNaN(value) || parseFloat(value) <= 0) error = t("priceInvalid");
    else if (parseFloat(value) > 10000) error = t("priceMax");
    break;

  case "product_ids":
    if (!value || value.length === 0) error = t("productRequired");
    break;

  default:
    break;
}
    
    return error;
  };

  // Validate all fields
  const validateForm = () => {
    const newErrors = {};
    
    Object.keys(formData).forEach(key => {
      const error = validateField(key, formData[key]);
      if (error) newErrors[key] = error;
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const createMutation = useMutation({
    mutationFn: create_pack,
    onSuccess: () => {
      queryClient.invalidateQueries(['packs']);
      onSuccess();
    },
    onError: (err) => {
      handleApiError(err);
    },
  });

  const updateMutation = useMutation({
    mutationFn: update_pack,
    onSuccess: () => {
      queryClient.invalidateQueries(['packs']);
      onSuccess();
    },
    onError: (err) => {
      handleApiError(err);
    },
  });

  const handleApiError = (err) => {
    // Handle different types of errors with user-friendly messages
    let errorMessage = t('somethingWentWrong');
    
    if (err.response?.data?.errors) {
      // Convert server validation errors to user-friendly messages
      const serverErrors = {};
      Object.keys(err.response.data.errors).forEach(key => {
        // Map server field names to client field names if needed
        const fieldName = key === 'product_ids' ? 'product_ids' : key;
        
        // Get the first error message for each field
        serverErrors[fieldName] = err.response.data.errors[key][0];
      });
      setErrors(serverErrors);
      return;
    } else if (err.message?.includes('Network Error')) {
      errorMessage = t('networkError');
    }
    setServerError(errorMessage);
  };
  //  else if (err.message) {
  //     // Check for common database errors and provide user-friendly messages
  //     if (err.message.includes('SQL') || err.message.includes('database') || err.message.includes('mysql')) {
  //       errorMessage = 'A database error occurred. Please check your input and try again.';
  //     } else {
  //       errorMessage = err.message;
  //     }
  //   }
    

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Validate field immediately after change if it's been touched before
    if (touched[name]) {
      const error = validateField(name, value);
      setErrors(prev => ({ ...prev, [name]: error }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    
    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const toggleProductSelection = (productId) => {
    setFormData(prev => {
      const productIds = [...prev.product_ids];
      const index = productIds.indexOf(productId);
      
      if (index > -1) {
        productIds.splice(index, 1);
      } else {
        productIds.push(productId);
      }
      
      // Validate product selection
      if (touched.product_ids) {
        const error = validateField('product_ids', productIds);
        setErrors(prev => ({ ...prev, product_ids: error }));
      }
      
      return { ...prev, product_ids: productIds };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Mark all fields as touched
    setTouched({
      name: true,
      description: true,
      price: true,
      product_ids: true
    });
    
    if (validateForm()) {
      setServerError('');
      
      // Prepare data for API
      const submitData = {
        ...formData,
        price: parseFloat(formData.price),
        product_ids: formData.product_ids
      };
      
      if (editingPack) {
        updateMutation.mutate({ ...submitData, id: editingPack.id });
      } else {
        createMutation.mutate(submitData);
      }
    }
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  return (
   <div className="p-6 ">
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-8rem)]">
    {/* Product Search & List */}
    <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">
            {editingPack ? t('editPack') : t('createPack')}
          </h2>
          <div className="text-sm text-gray-500">
            {t('page')} {currentPage} {t('of')} {totalPages}
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder={t('searchProductsByName')}
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Products Grid */}
      <div className="flex-1 p-6 overflow-y-auto">
        {productsLoading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          </div>
        ) : (
          <>
            {errors.product_ids && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg flex items-center">
                <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                {errors.product_ids}
              </div>
            )}
            
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              {paginatedProducts.map((product) => (
                <div
                  key={product.id}
                  className={`relative rounded-lg p-4 cursor-pointer transition-colors ${
                    formData.product_ids.includes(product.id)
                      ? 'bg-blue-50 border-2 border-blue-200'
                      : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                  onClick={() => toggleProductSelection(product.id)}
                >
                  <img
                    src={`${import.meta.env.VITE_IMG_BASE_URL}/${product.image}`}
                    alt={product.name}
                    className="w-full h-20 object-cover rounded-lg mb-2"
                    onError={(e) => {
                      e.target.src = '/placeholder-product.png';
                    }}
                  />
                  <h3 className="font-medium text-gray-900 text-sm truncate">
                    {product.name}
                  </h3>
                  <p className="text-green-600 font-bold text-sm">
                    ${product.price}
                  </p>
                  <p className="text-xs text-gray-500">
                    {t('stock')}: {product.stock}
                  </p>
                  {formData.product_ids.includes(product.id) && (
                    <div className="absolute top-2 right-2 bg-blue-600 rounded-full p-1">
                      <Check className="h-3 w-3 text-white" />
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Products Pagination */}
            {totalProducts > productsPerPage && (
              <div className="mt-6 pt-4 border-t border-gray-200 flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  {t('showing')} <span className="font-medium">{startIndex + 1}</span> {t('to')}{' '}
                  <span className="font-medium">{Math.min(endIndex, totalProducts)}</span> {t('of')}{' '}
                  <span className="font-medium">{totalProducts}</span> {t('products')}
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
                    {t('previous')}
                  </button>
                  <div className="flex items-center space-x-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
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
                              ? 'bg-green-500 text-white'
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
                    {t('next')}
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>

    {/* Pack Details Form */}
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col">
      {/* Form Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <Package className="h-6 w-6 text-green-600" />
          <h2 className="text-xl font-bold text-gray-900">{t('packDetails')}</h2>
          <span className="bg-green-100 text-green-600 px-2 py-1 rounded-full text-sm font-medium">
            {formData.product_ids.length}
          </span>
        </div>
      </div>

      {/* Form Content */}
      <div className="flex-1 p-6 overflow-y-auto">
        {serverError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg flex items-center">
            <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
            {serverError}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('packName')} *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              onBlur={handleBlur}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              required
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1 flex-shrink-0" />
                {errors.name}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('description')}
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              onBlur={handleBlur}
              rows={3}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.description ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            <div className="flex justify-between mt-1">
              <span className="text-xs text-gray-500">
                {formData.description.length}/500 {t('characters')}
              </span>
              {errors.description && (
                <span className="text-red-500 text-xs flex items-center">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  {errors.description}
                </span>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('price')} *
            </label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleInputChange}
              onBlur={handleBlur}
              step="0.01"
              min="0.01"
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.price ? 'border-red-500' : 'border-gray-300'
              }`}
              required
            />
            {errors.price && (
              <p className="text-red-500 text-sm mt-1 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1 flex-shrink-0" />
                {errors.price}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('selectedProducts')} ({formData.product_ids.length})
            </label>
            <div className={`border rounded-lg p-3 max-h-40 overflow-y-auto ${
              errors.product_ids ? 'border-red-500' : 'border-gray-200'
            }`}>
              {formData.product_ids.length === 0 ? (
                <p className="text-gray-500 text-sm">{t('noProductsSelected')}</p>
              ) : (
                formData.product_ids.map(id => {
                  const product = productsData?.find(p => p.id === id);
                  return product ? (
                    <div key={id} className="flex items-center justify-between py-1">
                      <span className="text-sm text-gray-900">{product.name}</span>
                      <button
                        type="button"
                        onClick={() => toggleProductSelection(id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : null;
                })
              )}
            </div>
            {errors.product_ids && (
              <p className="text-red-500 text-sm mt-1 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1 flex-shrink-0" />
                {errors.product_ids}
              </p>
            )}
          </div>
        </form>
      </div>

      {/* Form Actions */}
      <div className="p-6 border-t border-gray-200 bg-gray-50 mt-auto">
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={onCancel}
            disabled={createMutation.isLoading || updateMutation.isLoading}
            className="px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            {t('cancel')}
          </button>
          <button
            onClick={handleSubmit}
            disabled={createMutation.isLoading || updateMutation.isLoading}
            className="px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center"
          >
            {createMutation.isLoading || updateMutation.isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                {editingPack ? t('updating') : t('creating')}
              </>
            ) : (
              editingPack ? t('updatePack') : t('createPackBtn')
            )}
          </button>
        </div>
      </div>
    </div>
  </div>
</div>

  );
};
// View Pack Modal Component (unchanged from previous implementation)
const ViewPackModal = ({ pack, onClose }) => {
  const { t } = useLanguage();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">{t("packDetails")}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left side: Pack Info & Products */}
            <div className="md:col-span-2">
              <div className="bg-gray-50 rounded-lg p-6 mb-6">
                <h3 className="text-lg font-bold text-gray-900 mb-2">{pack.name}</h3>
                <p className="text-gray-600 mb-4">
                  {pack.description || t("noDescription")}
                </p>
                <div className="text-2xl font-bold text-blue-600">
                  {t("currency")} {pack.price}
                </div>
              </div>

              <h4 className="text-md font-semibold text-gray-900 mb-4">
                {t("productsInPack")}
              </h4>
              <div className="grid grid-cols-1 gap-4">
                {pack.products && pack.products.length > 0 ? (
                  pack.products.map((product) => (
                    <div
                      key={product.id}
                      className="flex items-center p-4 bg-white border border-gray-200 rounded-lg"
                    >
                      <img
                        src={`${import.meta.env.VITE_IMG_BASE_URL}/${product.image}`}
                        alt={product.name}
                        className="h-16 w-16 object-cover rounded-lg mr-4"
                      />
                      <div className="flex-1">
                        <h5 className="font-medium text-gray-900">{product.name}</h5>
                        <p className="text-sm text-gray-500">
                          {t("currency")} {product.price}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>{t("noProductsInPack")}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Right side: Pack Summary */}
            <div className="bg-gray-50 rounded-lg p-6 h-fit">
              <h4 className="text-md font-semibold text-gray-900 mb-4">
                {t("packSummary")}
              </h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">{t("totalProducts")}:</span>
                  <span className="font-medium">
                    {pack.products ? pack.products.length : 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">{t("packPrice")}:</span>
                  <span className="font-medium text-blue-600">
                    {t("currency")} {pack.price}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">{t("created")}:</span>
                  <span className="font-medium">
                    {new Date(pack.created_at).toLocaleDateString()}
                  </span>
                </div>
                {pack.updated_at && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">{t("lastUpdated")}:</span>
                    <span className="font-medium">
                      {new Date(pack.updated_at).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            {t("close")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PackManagement;