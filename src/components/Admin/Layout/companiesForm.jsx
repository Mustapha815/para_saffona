import React, { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { fetch_add_company, fetch_update_company } from "../../../api/companies";
import { X, Save, Building2, Upload } from "lucide-react";
import { useLanguage } from '../../../contexts/LanguageContext';

const CompanyForm = ({ company, onClose }) => {
  const queryClient = useQueryClient();
  const { t } = useLanguage();

  const [formData, setFormData] = useState({ 
    name: "", 
    image: null
  });
  const [previewUrl, setPreviewUrl] = useState("");
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  
  useEffect(() => {
    if (company) {
      setFormData({ 
        name: company.name || "", 
        image: null
      });
      
      // Set preview if company has an image
      if (company.image_url) {
        setPreviewUrl(company.image_url);
      }
    } else {
      // Reset form for new company
      setFormData({ name: "", image: null });
      setPreviewUrl("");
      setErrors({});
      setServerError("");
    }
  }, [company]);

  const mutation = useMutation({
    mutationFn: async (data) => {
      // Create FormData to handle file upload
      const formDataToSend = new FormData();
      formDataToSend.append("name", data.name);
      
      if (data.image) {
        formDataToSend.append("image", data.image);
      }
      
      if (company) {
        // For updates, use the _method hack for PUT
        formDataToSend.append('_method', 'PUT');
        return fetch_update_company(company.id, formDataToSend);
      } else {
        // For creates, use POST
        return fetch_add_company(formDataToSend);
      }
    },

    onMutate: async (newCompany) => {
      await queryClient.cancelQueries(["companies"]);
      const previousCompanies = queryClient.getQueryData(["companies"]);

      return { previousCompanies };
    },

    onSuccess: () => {
      queryClient.invalidateQueries(["companies"]);
      onClose();
    },

    onError: (err, _newCompany, context) => {
      queryClient.setQueryData(["companies"], context.previousCompanies);
      
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
    const { name, value, files } = e.target;
    
    // Clear errors when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
    if (serverError) {
      setServerError("");
    }

    if (name === "image" && files && files[0]) {
      const file = files[0];
      setFormData(prev => ({ ...prev, [name]: file }));
      
      // Create a preview URL for the image
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = t("comNameRequired") || "Company name is required";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = t("comNameMinLength") || "Company name must be at least 2 characters long";
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
            <div className="bg-blue-100 p-2 rounded-lg">
              <Building2 className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {company ? t("comEditTitle") : t("comAddTitle")}
              </h1>
              <p className="text-gray-600">
                {company ? t("comEditDesc") : t("comAddDesc")}
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
          {/* Company Name Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("comNameLabel")} *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              disabled={isLoading}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.name ? 'border-red-300' : 'border-gray-300'
              } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              placeholder={t("comNamePlaceholder")}
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name}</p>
            )}
          </div>

          {/* Company Image Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("comImageLabel")}
            </label>
            
            {/* Image Preview */}
            {previewUrl && (
              <div className="mb-4">
                <img 
                  src={previewUrl} 
                  alt="Preview" 
                  className="h-32 w-32 object-cover rounded-lg border border-gray-300"
                />
              </div>
            )}
            
            <label className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer ${
              errors.image ? 'border-red-300' : 'border-gray-300'
            } ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:border-gray-400'}`}>
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="h-8 w-8 text-gray-400 mb-2" />
                <p className="text-sm text-gray-500">
                  {t("comImagePlaceholder")}
                </p>
              </div>
              <input 
                type="file" 
                name="image" 
                onChange={handleChange}
                disabled={isLoading}
                accept="image/*"
                className="hidden"
              />
            </label>
            {errors.image && (
              <p className="mt-1 text-sm text-red-600">{errors.image}</p>
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
              className="inline-flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {company ? t("comUpdating") : t("comCreating")}
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {company ? t("comUpdateButton") : t("comCreateButton")}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CompanyForm;