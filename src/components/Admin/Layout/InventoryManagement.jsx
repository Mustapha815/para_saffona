import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useLanguage } from '../../../contexts/LanguageContext';
import { 
  Package, 
  AlertTriangle, 
  Calendar, 
  TrendingDown, 
  Filter,
  Download,
  RefreshCw
} from 'lucide-react';

const InventoryManagement = () => {
  const { t, language } = useLanguage();
  const products = useSelector((state) => state.products.items);
  const [filter, setFilter] = useState('all');

  const getProductName = (product) => {
    switch (language) {
      case 'ar': return product.nameAr;
      case 'fr': return product.nameFr;
      default: return product.name;
    }
  };

  const getFilteredProducts = () => {
    switch (filter) {
      case 'low-stock':
        return products.filter(p => p.stock <= p.minStock);
      case 'out-of-stock':
        return products.filter(p => p.stock === 0);
      case 'expiring':
        return products.filter(p => {
          const expiryDate = new Date(p.expiryDate);
          const nextMonth = new Date();
          nextMonth.setMonth(nextMonth.getMonth() + 1);
          return expiryDate <= nextMonth;
        });
      default:
        return products;
    }
  };

  const filteredProducts = getFilteredProducts();
  const lowStockItems = products.filter(p => p.stock <= p.minStock).length;
  const outOfStockItems = products.filter(p => p.stock === 0).length;
  const expiringItems = products.filter(p => {
    const expiryDate = new Date(p.expiryDate);
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    return expiryDate <= nextMonth;
  }).length;
  const totalValue = products.reduce((sum, p) => sum + (p.price * p.stock), 0);

  const getStockStatus = (product) => {
    if (product.stock === 0) {
      return { 
        status: 'Out of Stock', 
        color: 'text-red-600 bg-red-50',
        icon: AlertTriangle 
      };
    }
    if (product.stock <= product.minStock) {
      return { 
        status: 'Low Stock', 
        color: 'text-orange-600 bg-orange-50',
        icon: TrendingDown 
      };
    }
    return { 
      status: 'In Stock', 
      color: 'text-green-600 bg-green-50',
      icon: Package 
    };
  };

  const isExpiringSoon = (expiryDate) => {
    const expiry = new Date(expiryDate);
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    return expiry <= nextMonth;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('inventory')}</h1>
          <p className="text-gray-600 mt-1">Monitor and manage your stock levels</p>
        </div>
        <div className="flex space-x-3">
          <button className="inline-flex items-center px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </button>
          <button className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
            <Download className="h-4 w-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{t('inventoryValue')}</p>
              <p className="text-2xl font-bold text-gray-900">{totalValue.toLocaleString()} {t('currency')}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <Package className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{t('lowStock')}</p>
              <p className="text-2xl font-bold text-orange-600">{lowStockItems}</p>
            </div>
            <div className="bg-orange-100 p-3 rounded-lg">
              <TrendingDown className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Out of Stock</p>
              <p className="text-2xl font-bold text-red-600">{outOfStockItems}</p>
            </div>
            <div className="bg-red-100 p-3 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{t('expiringProducts')}</p>
              <p className="text-2xl font-bold text-purple-600">{expiringItems}</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg">
              <Calendar className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center space-x-4">
          <Filter className="h-5 w-5 text-gray-400" />
          <div className="flex space-x-2">
            {[
              { key: 'all', label: 'All Products' },
              { key: 'low-stock', label: 'Low Stock' },
              { key: 'out-of-stock', label: 'Out of Stock' },
              { key: 'expiring', label: 'Expiring Soon' }
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

      {/* Inventory Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('category')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Current Stock
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Min Stock
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('expiryDate')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Value
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProducts.map((product) => {
                const stockStatus = getStockStatus(product);
                const StatusIcon = stockStatus.icon;
                const expiringSoon = isExpiringSoon(product.expiryDate);

                return (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <img
                          className="h-10 w-10 rounded-lg object-cover"
                          src={product.image}
                          alt={getProductName(product)}
                        />
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {getProductName(product)}
                          </div>
                          <div className="text-sm text-gray-500">
                            {product.barcode}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 capitalize">
                        {t(product.category)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {product.stock}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {product.minStock}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${stockStatus.color}`}>
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {stockStatus.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center">
                        <span className={expiringSoon ? 'text-red-600 font-medium' : ''}>
                          {new Date(product.expiryDate).toLocaleDateString()}
                        </span>
                        {expiringSoon && (
                          <AlertTriangle className="h-4 w-4 text-red-500 ml-2" />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {(product.price * product.stock).toLocaleString()} {t('currency')}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {filteredProducts.length === 0 && (
        <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-gray-100">
          <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
          <p className="text-gray-600">No products match the selected filter criteria</p>
        </div>
      )}
    </div>
  );
};

export default InventoryManagement;