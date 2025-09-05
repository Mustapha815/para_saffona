import React, { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { fetch_add_categorie, fetch_update_categorie } from "../../../api/categories";
import { X, Save, Grid3X3 } from "lucide-react";
import { useLanguage } from '../../../contexts/LanguageContext';

const CategoryForm = ({ category, onClose, categories }) => {
  const queryClient = useQueryClient();
    const { t,  } = useLanguage();

  const [formData, setFormData] = useState({ 
    name: "" 
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  
  useEffect(() => {
    if (category) {
      setFormData({ 
        name: category.name || "" 
      });
    } else {
      // Reset form for new category
      setFormData({ name: "" });
      setErrors({});
      setServerError("");
    }
  }, [category]);

  const mutation = useMutation({
    mutationFn: async (data) => {
      // If updating, send _method=PUT
      if (category) {
        return fetch_update_categorie(category.id, { ...data, _method: "PUT" });
      } else {
        return fetch_add_categorie(data);
      }
    },

    onMutate: async (newCategory) => {
      await queryClient.cancelQueries(["categories"]);
      const previousCategories = queryClient.getQueryData(["categories"]);

      return { previousCategories };
    },

    onSuccess: () => {
      queryClient.invalidateQueries(["categories"]);
      onClose();
    },

    onError: (err, _newCategory, context) => {
      queryClient.setQueryData(["categories"], context.previousCategories);
      
      // Handle server validation errors
      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors);
      } else if (err.response?.data?.message) {
        setServerError(err.response.data.message);
      } else {
        setServerError(err.message || t("somethingWentWrong"));
      }
    },
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Clear errors when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
    if (serverError) {
      setServerError("");
    }

    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = t("catNameRequired");
    } else if (formData.name.trim().length < 2) {
      newErrors.name = t("catNameMin");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Clear previous errors
    setErrors({});
    setServerError("");

    if (!validateForm()) {
      return;
    }

    mutation.mutate(formData);
  };

  const isLoading = mutation.isLoading;

  return (
  <div className="p-6 ml-72">
  <div className="max-w-4xl mx-auto">
    {/* Header */}
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center space-x-3">
        <div className="bg-green-100 p-2 rounded-lg">
          <Grid3X3 className="h-6 w-6 text-green-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {category ? t("catEditTitle") : t("catAddTitle")}
          </h1>
          <p className="text-gray-600">
            {category ? t("catEditSubtitle") : t("catAddSubtitle")}
          </p>
          {serverError && (
            <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{serverError}</p>
            </div>
          )}
        </div>
      </div>
      <button 
        onClick={onClose} 
        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        disabled={isLoading}
      >
        <X className="h-5 w-5 text-gray-500" />
      </button>
    </div>

    {/* Form */}
    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6">
      {/* Category Name Field */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t("catNameLabel")} *
        </label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          disabled={isLoading}
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
            errors.name ? 'border-red-300' : 'border-gray-300'
          } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          placeholder={t("catNamePlaceholder")}
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-600">{errors.name}</p>
        )}
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
        <button 
          type="button" 
          onClick={onClose} 
          disabled={isLoading}
          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {t("cancel")}
        </button>
        <button 
          type="submit" 
          disabled={isLoading}
          className="inline-flex items-center px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              {category ? t("catUpdating") : t("catCreating")}
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              {category ? t("catUpdateButton") : t("catCreateButton")}
            </>
          )}
        </button>
      </div>
    </form>
  </div>
</div>

  );
};

export default CategoryForm;