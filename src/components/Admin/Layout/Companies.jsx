import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLanguage } from '../../../contexts/LanguageContext';
import { 
  Building2, 
  Plus, 
  Edit, 
  Trash2, 
  Search
} from 'lucide-react';
import CompanyForm from './companiesForm'; // You'll need to create this
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { fetch_companies, fetch_delete_company } from '../../../api/companies'; // Update API imports
import WarningAlert from '../helpers/WarningAlert';

const CompaniesManagement = () => {
  const queryClient = useQueryClient();
  const { t, language } = useLanguage();
  
  const { data: companies = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['companies'],
    queryFn: fetch_companies,
  });
  
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingCompany, setEditingCompany] = useState(null);

  const getCompanyName = (company) => {
    switch (language) {
      case 'ar': return company.nameAr || company.name;
      case 'fr': return company.nameFr || company.name;
      default: return company.name;
    }
  };

  const filteredCompanies = companies.filter(company => {
    const name = getCompanyName(company);
    return name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const handleEdit = (company) => {
    setEditingCompany(company);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingCompany(null);
    refetch();
  };

  const deleteMutation = useMutation({
    mutationFn: fetch_delete_company,
    onSuccess: () => {
      queryClient.invalidateQueries(["companies"]);
    },
    onError: (error) => {
      console.error("Delete failed:", error);
      alert(t("errors.delete_company_failed"));
    },
  });

  const deleteCompany = (companyId) => {
    if (window.confirm(t("company.confirm_delete"))) {
      deleteMutation.mutate(companyId);
    }
  };

  if (showForm) {
    return <CompanyForm company={editingCompany} onClose={closeForm} />;
  }

  if (isLoading) {
    return <div className="text-center py-12">Loading companies...</div>;
  }

  if (isError) {
    return <div className="text-center py-12 text-red-600">Error fetching companies.</div>;
  }

  return (
    <div className="p-6 space-y-6 ml-72">
    <WarningAlert msg={t('deleteBrandMsg') || '⚠ If you delete a brand, all associated products will also be removed!'}  />
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('companies') || 'Companies Management'}</h1>
          <p className="text-gray-600 mt-1">{t('manageYourBrands') || 'Manage your product companies'}</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" />
          {t('comAddButton') || 'Add Company'}
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{t('comTotalCompanies') }</p>
              <p className="text-2xl font-bold text-gray-900">{companies.length}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <Building2 className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder={t('comSearchPlaceholder') || 'Search companies...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Companies List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>

              

                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('comName') || 'Name'}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('comActions') || 'Actions'}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCompanies.map((company) => (
                <tr key={company.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="bg-blue-100  rounded-lg mr-3">
                       <img
                          className="h-10 w-10 rounded-lg object-cover cursor-pointer"
                          src={`${import.meta.env.VITE_IMG_BASE_URL}/${company.image}`}
                          alt={company.name}
                        />                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {getCompanyName(company)}
                        </div>
                      </div>
                    </div>
                  </td>
               
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(company)}
                        className="inline-flex items-center px-3 py-1 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors"
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        {t('comEdit') || 'Edit'}
                      </button>
                      <button
                        onClick={() => deleteCompany(company.id)}
                        className="inline-flex items-center px-3 py-1 bg-red-50 text-red-600 rounded-md hover:bg-red-100 transition-colors"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        {t('comDelete') || 'Delete'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredCompanies.length === 0 && (
        <div className="text-center py-12">
          <Building2 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {t('comNoCompaniesFound') || 'No companies found'}
          </h3>
          <p className="text-gray-600">
            {t('comTryAdjustingSearch') || 'Try adjusting your search criteria'}
          </p>
        </div>
      )}
    </div>
  );
};

export default CompaniesManagement;