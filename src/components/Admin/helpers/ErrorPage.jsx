import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home } from 'lucide-react';
import { useLanguage } from '../../../contexts/LanguageContext';

const ErrorPage = () => {
  const {t} = useLanguage();
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="text-center">
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-teal-600">404</h1>
          <h2 className="text-2xl font-semibold text-gray-800 mt-4">{t('pageNotFound')}</h2>
          <p className="text-gray-600 mt-2 max-w-md mx-auto">
            {t('errorMsg')}
          </p>
        </div>
        
        <button
          onClick={handleGoHome}
          className="inline-flex items-center gap-2 px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors duration-200 font-medium"
        >
          <Home className="h-5 w-5" />
          {t('goBackHome')}
        </button>
        
       
      </div>
    </div>
  );
};

export default ErrorPage;