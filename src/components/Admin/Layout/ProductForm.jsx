
import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useLanguage } from '../../../contexts/LanguageContext';
import { addProduct, updateProduct } from '../../../store/slices/productsSlice';
import { X, Save, Package, Upload, Trash2, AlertCircle } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { fetch_add_product, fetch_update_product } from '../../../api/products';
import { fetch_categories } from '../../../api/categories';
import { fetch_companies } from '../../../api/companies';

const ProductForm = ({ product, onClose }) => {
  const { t } = useLanguage();
  const dispatch = useDispatch();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    image: null,
    category_id: '',
    company_id: '',
    stock: '',
  });

  const [imagePreview, setImagePreview] = useState(null);
  const [serverError, setServerError] = useState('');
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Load existing product for edit
  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        description: product.description || '',
        price: product.price?.toString() || '',
        image: null,
        category_id: product.category_id?.toString() || '',
        company_id: product.company_id?.toString() || '',
        stock: product.stock?.toString() || '',
      });
      if (product.image) {
        setImagePreview(`${import.meta.env.VITE_IMG_BASE_URL}/${product.image}`);
      }
    }
  }, [product]);

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: fetch_categories,
  });

  const { data: companies = [] } = useQuery({
    queryKey: ['companies'],
    queryFn: fetch_companies,
  });

  // Validation function
  const validateField = (name, value) => {
    let error = '';

    switch (name) {
      case 'name':
        if (!value.trim()) error = t('productNameRequired');
        else if (value.trim().length < 2) error = t('productNameMin', { count: 2 });
        else if (value.trim().length > 100) error = t('productNameMax', { count: 100 });
        break;
      case 'description':
        if (!value.trim()) error = t('descriptionRequired');
        else if (value.length > 500) error = t('descriptionMax', { count: 500 });
        break;
      case 'price':
        if (!value) error = t('priceRequired');
        else if (isNaN(value) || parseFloat(value) <= 0) error = t('pricePositive');
        else if (parseFloat(value) > 10000) error = t('priceMax', { count: 10000 });
        break;
      case 'category_id':
        if (!value) error = t('categoryRequired');
        break;
      case 'company_id':
        if (!value) error = t('companyRequired');
        break;
      case 'stock':
        if (!value) error = t('stockRequired');
        else if (isNaN(value) || parseInt(value) < 0) error = t('stockPositive');
        else if (parseInt(value) > 10000) error = t('stockMax', { count: 10000 });
        break;
      case 'image':
        if (!product && !value) error = t('imageRequired');
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

  // React Query mutation
  const productMutation = useMutation({
    mutationFn: async (data) => {
      const form = new FormData();
      form.append('name', data.name.trim());
      form.append('description', data.description.trim());
      form.append('price', parseFloat(data.price));
      form.append('category_id', parseInt(data.category_id));
      form.append('company_id', parseInt(data.company_id));
      form.append('stock', parseInt(data.stock) || 0);

      if (data.image instanceof File) {
        form.append('image', data.image);
      }

      if (product) {
        form.append('_method', 'PUT');
        return fetch_update_product(product.id, form);
      } else {
        return fetch_add_product(form);
      }
    },
    onSuccess: (data) => {
      if (product) dispatch(updateProduct(data));
      else dispatch(addProduct(data));
      queryClient.invalidateQueries(['products']);
      onClose();
    },
    onError: (err) => {
      let errorMessage = t('somethingWentWrong');

      if (err.response?.data?.errors) {
        const serverErrors = {};
        Object.keys(err.response.data.errors).forEach(key => {
          const fieldName = key === 'category_id' ? 'category_id' : 
                           key === 'company_id' ? 'company_id' : key;
          serverErrors[fieldName] = err.response.data.errors[key][0];
        });
        setErrors(serverErrors);
        return;
      } else if (err.message?.includes('Network Error')) {
        errorMessage = t('networkError');
      }

      setServerError(errorMessage);
    },
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

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

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({ ...prev, image: t('imageFileOnly') }));
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, image: t('imageMaxSize') }));
        return;
      }

      setFormData(prev => ({ ...prev, image: file }));
      setImagePreview(URL.createObjectURL(file));
      setErrors(prev => ({ ...prev, image: '' }));
    }
  };

  const removeImage = () => {
    setFormData(prev => ({ ...prev, image: null }));
    setImagePreview(null);
    if (!product) {
      setErrors(prev => ({ ...prev, image: t('imageRequired') }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setTouched({
      name: true,
      description: true,
      price: true,
      category_id: true,
      company_id: true,
      stock: true,
      image: true
    });

    if (validateForm()) {
      setServerError('');
      productMutation.mutate(formData);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 ml-72 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6 ml-72">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="bg-green-100 p-2 rounded-lg">
              <Package className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {product ? t('editProduct') : t('addProduct')}
              </h1>
              <p className="text-gray-600">
                {product ? t('updateProductInfo') : t('addNewProduct')}
              </p>
              {serverError && (
                <div className="mt-2 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg flex items-center">
                  <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                  {serverError}
                </div>
              )}
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border p-6 space-y-6">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('productName')} *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              onBlur={handleBlur}
              required
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
              placeholder={t('enterProductName')}
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1 flex-shrink-0" />
                {errors.name}
              </p>
            )}
          </div>

          {/* Category / Company */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('Category')} *
              </label>
              <select
                name="category_id"
                value={formData.category_id}
                onChange={handleChange}
                onBlur={handleBlur}
                required
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.category_id ? 'border-red-500' : 'border-gray-300'}`}
              >
                <option value="">{t('selectCategory')}</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              {errors.category_id && (
                <p className="text-red-500 text-sm mt-1 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1 flex-shrink-0" />
                  {errors.category_id}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('Company')} *
              </label>
              <select
                name="company_id"
                value={formData.company_id}
                onChange={handleChange}
                onBlur={handleBlur}
                required
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.company_id ? 'border-red-500' : 'border-gray-300'}`}
              >
                <option value="">{t('selectCompany')}</option>
                {companies.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              {errors.company_id && (
                <p className="text-red-500 text-sm mt-1 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1 flex-shrink-0" />
                  {errors.company_id}
                </p>
              )}
            </div>
          </div>

          {/* Price / Stock */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('price')} *
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                onBlur={handleBlur}
                required
                min="0.01"
                step="0.01"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.price ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="0.00"
              />
              {errors.price && (
                <p className="text-red-500 text-sm mt-1 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1 flex-shrink-0" />
                  {errors.price}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('Stock')} *
              </label>
              <input
                type="number"
                min="0"
                name="stock"
                value={formData.stock}
                onChange={handleChange}
                onBlur={handleBlur}
                required
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.stock ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="0"
              />
              {errors.stock && (
                <p className="text-red-500 text-sm mt-1 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1 flex-shrink-0" />
                  {errors.stock}
                </p>
              )}
            </div>
          </div>

          {/* Image */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('productImage')} {product ? '' : '*'}
            </label>
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
              <label className={`flex flex-col items-center justify-center w-32 h-32 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${errors.image ? 'border-red-500' : 'border-gray-300 hover:border-blue-500'}`}>
                <Upload className="w-6 h-6 mb-2 text-gray-500" />
                <span className="text-xs text-gray-500">{t('uploadImage')}</span>
                <input
                  type="file"
                  className="hidden"
                  name="image"
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </label>
              {imagePreview && (
                <div className="relative w-32 h-32">
                  <img 
                    src={imagePreview} 
                    alt={t('imagePreview')} 
                    className="w-full h-full object-cover rounded-lg border border-gray-200" 
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
            {errors.image && (
              <p className="text-red-500 text-sm mt-1 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1 flex-shrink-0" />
                {errors.image}
              </p>
            )}
            <p className="text-xs text-gray-500 mt-2">
              {t('supportedFormats')}
            </p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('description')}
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              onBlur={handleBlur}
              rows={3}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.description ? 'border-red-500' : 'border-gray-300'}`}
              placeholder={t('enterDescription')}
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

          {/* Actions */}
          <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4 pt-6 border-t">
            <button 
              type="button" 
              onClick={onClose} 
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              disabled={productMutation.isLoading}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              {productMutation.isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {t('saving')}...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {t('save')}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductForm;