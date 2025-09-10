import React, { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { fetch_add_company, fetch_update_company } from "../../../api/companies";
import { X, Save, Building2, Upload, Trash2, AlertCircle } from "lucide-react";
import { useLanguage } from '../../../contexts/LanguageContext';

const CompanyForm = ({ company, onClose }) => {
  const queryClient = useQueryClient();
  const { t } = useLanguage();

  const [formData, setFormData] = useState({ 
    name: "", 
    image: null
  });
  const [imagePreview, setImagePreview] = useState("");
  const [serverError, setServerError] = useState("");
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  
  // Load existing company for edit
  useEffect(() => {
    if (company) {
      setFormData({ 
        name: company.name || "", 
        image: null
      });
      
      // Set preview if company has an image
      if (company.image_url) {
        setImagePreview(company.image_url);
      }
    } else {
      // Reset form for new company
      setFormData({ name: "", image: null });
      setImagePreview("");
      setErrors({});
      setServerError("");
      setTouched({});
    }
  }, [company]);

  // Validation function
  const validateField = (name, value) => {
    let error = '';

    switch (name) {
      case 'name':
        if (!value.trim()) error = t("comNameRequired") || "Company name is required";
        else if (value.trim().length < 2) error = t("comNameMinLength") || "Company name must be at least 2 characters long";
        else if (value.trim().length > 100) error = t("comNameMaxLength") || "Company name must be less than 100 characters";
        break;
      case 'image':
        if (!company && !value) error = t("comImageRequired") || "Company image is required";
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

  const mutation = useMutation({
    mutationFn: async (data) => {
      // Create FormData to handle file upload
      const formDataToSend = new FormData();
      formDataToSend.append("name", data.name.trim());
      
      if (data.image instanceof File) {
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

    onSuccess: () => {
      queryClient.invalidateQueries(["companies"]);
      onClose();
    },

    onError: (err) => {
      let errorMessage = t("somethingWentWrong") || "Something went wrong";

      if (err.response?.data?.errors) {
        const serverErrors = {};
        Object.keys(err.response.data.errors).forEach(key => {
          serverErrors[key] = err.response.data.errors[key][0];
        });
        setErrors(serverErrors);
        return;
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message?.includes('Network Error')) {
        errorMessage = t("networkError") || "Network error";
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
        setErrors(prev => ({ ...prev, image: t("imageFileOnly") || "Please select an image file" }));
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, image: t("imageMaxSize") || "Image must be less than 5MB" }));
        return;
      }

      setFormData(prev => ({ ...prev, image: file }));
      setImagePreview(URL.createObjectURL(file));
      setErrors(prev => ({ ...prev, image: '' }));
    }
  };

  const removeImage = () => {
    setFormData(prev => ({ ...prev, image: null }));
    setImagePreview("");
    if (!company) {
      setErrors(prev => ({ ...prev, image: t("comImageRequired") || "Company image is required" }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setTouched({
      name: true,
      image: true
    });

    if (validateForm()) {
      setServerError('');
      mutation.mutate(formData);
    }
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
              onBlur={handleBlur}
              disabled={isLoading}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              placeholder={t("comNamePlaceholder")}
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1 flex-shrink-0" />
                {errors.name}
              </p>
            )}
          </div>

          {/* Company Image Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("comImageLabel")} {company ? '' : '*'}
            </label>
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
              <label className={`flex flex-col items-center justify-center w-32 h-32 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                errors.image ? 'border-red-500' : 'border-gray-300 hover:border-blue-500'
              } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                <Upload className="w-6 h-6 mb-2 text-gray-500" />
                <span className="text-xs text-gray-500 text-center px-2">{t("comImagePlaceholder")}</span>
                <input 
                  type="file" 
                  name="image" 
                  onChange={handleImageChange}
                  disabled={isLoading}
                  accept="image/*"
                  className="hidden"
                />
              </label>
              
              {imagePreview && (
                <div className="relative w-32 h-32">
                  <img 
                    src={imagePreview} 
                    alt="Preview" 
                    className="w-full h-full object-cover rounded-lg border border-gray-200"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    disabled={isLoading}
                    className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
            
            {errors.image && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1 flex-shrink-0" />
                {errors.image}
              </p>
            )}
            
            <p className="text-xs text-gray-500 mt-2">
              {t("supportedFormats") || "Supported formats: JPG, PNG, GIF. Max size: 5MB"}
            </p>
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
                  {company ? t("comUpdating") || "Updating..." : t("comCreating") || "Creating..."}
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