import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLanguage } from '../../../contexts/LanguageContext';
import { 
  Grid3X3, 
  Plus, 
  Edit, 
  Trash2, 
  Search,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Package,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';
import CategoryForm from './CategoryForm';
import { fetch_categories, fetch_delete_categorie } from '../../../api/categories';
import WarningAlert from '../helpers/WarningAlert';

const CategoriesManagement = () => {
  const queryClient = useQueryClient();
  const { t, language } = useLanguage();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 15;



  // Fetch categories
  const { data: categoriesData=[], isLoading, isError, refetch } = useQuery({
    queryKey: ['categories'],
    queryFn: fetch_categories,
  });

  // Process categories data for pagination
  const categories = categoriesData || [];
  const filteredCategories = categories
    .filter(category => {
      const name = category?.name;
      const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
    })
    .sort((a, b) => a.sortOrder - b.sortOrder);

  // Calculate pagination
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedCategories = filteredCategories.slice(startIndex, endIndex);
  const totalPages = Math.ceil(filteredCategories.length / pageSize);
  const hasNext = endIndex < filteredCategories.length;
  const hasPrev = currentPage > 1;

  const handleEdit = (category) => {
    setEditingCategory(category);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingCategory(null);
  };

  const deleteMutation = useMutation({
    mutationFn: fetch_delete_categorie,
    onSuccess: () => {
      queryClient.invalidateQueries(["categories"]);
    },
    onError: (error) => {
      console.error("Delete failed:", error);
      alert(t("errors.delete_category_failed"));
    },
  });

  const deleteCategory = (categoryId) => {
    if (window.confirm(t("category.confirm_delete"))) {
      deleteMutation.mutate(categoryId);
    }
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  if (showForm) {
    return <CategoryForm category={editingCategory} categories={categories} onClose={closeForm} />;
  }

if (isLoading) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-violet-50/30 p-6 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">{t('loadingCategories')}</p>
      </div>
    </div>
  );
}

if (isError) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-violet-50/30 p-6 flex items-center justify-center">
      <div className="text-center">
        <div className="bg-red-100 p-4 rounded-xl inline-flex mb-4">
          <Trash2 className="h-8 w-8 text-red-600" />
        </div>
        <p className="text-gray-600">{t('errorLoadingCategories')}</p>
      </div>
    </div>
  );
}

return (
  <div className="p-6 space-y-6 ml-72">
    <WarningAlert msg="⚠ If you delete a category, all associated products will also be removed!" />
    {/* Header */}
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          {t('categories')} ({categories.length})
        </h1>
        <p className="text-gray-600 mt-1">{t('manageCategories')}</p>
      </div>
      <div className="flex space-x-3">
        <button 
          onClick={() => refetch()}
          className="inline-flex items-center px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          {t('refresh')}
        </button>
        <button 
          onClick={() => setShowForm(true)}
          className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" />
          {t('addCategory')}
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
              placeholder={t('searchCategoriesPlaceholder')}
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>
    </div>

    {/* Categories List */}
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">{t('categoryList')}</h2>
        <div className="text-sm text-gray-500">
          {t('page')} {currentPage} {t('of')} {totalPages}
        </div>
      </div>
      
      {/* List header */}
      <div className="grid grid-cols-12 px-6 py-3 bg-gray-50 border-b border-gray-100 text-sm font-medium text-gray-600">
        <div className="col-span-8">{t('name')}</div>
        <div className="col-span-4 text-right">{t('actions')}</div>
      </div>
      
      {/* Categories list */}
      <div className="divide-y divide-gray-100">
        {paginatedCategories.map((category) => (
          <div key={category.id} className="grid grid-cols-12 px-6 py-4 hover:bg-gray-50 transition-colors">
            <div className="col-span-8 flex items-center">
              <div className="bg-gray-100 p-2 rounded-lg mr-3">
                <Grid3X3 className="h-4 w-4 text-gray-600" />
              </div>
              <span className="font-medium text-gray-900">
                {category.name}
              </span>
            </div>
            <div className="col-span-4 flex items-center justify-end space-x-2">
              <button
                onClick={() => handleEdit(category)}
                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title={t('edit')}
              >
                <Edit className="h-4 w-4" />
              </button>
              <button
                onClick={() => deleteCategory(category.id)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title={t('delete')}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Empty state */}
      {filteredCategories.length === 0 && (
        <div className="text-center py-12">
          <div className="bg-gradient-to-br from-gray-100 to-gray-200 p-4 rounded-2xl w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <Grid3X3 className="h-8 w-8 text-gray-400" />
          </div>
          <p className="text-gray-500 font-medium">{t('noCategoriesFound')}</p>
          <p className="text-sm text-gray-400">{t('tryAdjustingSearch')}</p>
        </div>
      )}

      {/* Pagination */}
      {filteredCategories.length > pageSize && (
        <div className="px-6 py-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
          <div className="text-sm text-gray-700">
            {t('showing')} <span className="font-medium">{startIndex + 1}</span> {t('to')}{' '}
            <span className="font-medium">{Math.min(endIndex, filteredCategories.length)}</span> {t('of')}{' '}
            <span className="font-medium">{filteredCategories.length}</span> {t('categories')}
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
              {t('next')}
              <ChevronRight className="h-4 w-4 ml-1" />
            </button>
          </div>
        </div>
      )}
    </div>
  </div>
);

};

export default CategoriesManagement;