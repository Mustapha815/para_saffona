import React from 'react';
import { Link } from 'react-router-dom';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Instagram, 
  Heart
} from 'lucide-react';
import { useLanguage } from '../../../contexts/LanguageContext';

const ClientFooter = () => {
  const { t } = useLanguage();
  return (
    <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-emerald-900 text-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-64 h-64 bg-emerald-500 rounded-full -translate-x-32 -translate-y-32"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-teal-500 rounded-full translate-x-48 translate-y-48"></div>
      </div>
      
      {/* Main Footer */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-6">
          
          {/* Company Info */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              {/* Logo */}
              <div className="relative">
                <div className="relative overflow-hidden rounded-xl shadow-md border border-emerald-400/30">
                  <img 
                    src="/logo.jpg" 
                    alt="PharmaCare" 
                    className="h-14 w-14 object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-teal-500/20"></div>
                </div>
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-orange-400 rounded-full animate-pulse"></div>
              </div>
              {/* Text */}
              <div>
                <h3 className="text-xl font-bold text-white tracking-tight">
                  Parasaffona
                </h3>
                <p className="text-emerald-200 text-xs font-medium mt-0.5">
                  {t('Premium-Wellness-Partner')}
                </p>
              </div>
            </div>
            
            <p className="text-gray-300 text-sm max-w-md">
              {t('yourTrust')}
            </p>
    
          </div>
          
          {/* Contact Info */}
          <div className="space-y-4">
            <h4 className="text-lg font-bold bg-gradient-to-r from-white to-emerald-200 bg-clip-text text-transparent">
              {t('getInTouch')}
            </h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <div className="bg-gradient-to-br from-emerald-500 to-teal-500 p-1.5 rounded-md mt-0.5 flex-shrink-0">
                  <MapPin className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-gray-300 text-sm font-medium">Ave Al Mokaouama</p>
                  <p className="text-gray-400 text-xs">Dakhla, Morocco</p>
                </div>
              </li>
              <li className="flex items-center gap-3">
                <div className="bg-gradient-to-br from-blue-500 to-indigo-500 p-1.5 rounded-md flex-shrink-0">
                  <Phone className="h-4 w-4 text-white" />
                </div>
                <p className="text-gray-300 text-sm font-medium">+212 5 22 XX XX XX</p>
              </li>
              <li className="flex items-center gap-3">
                <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-1.5 rounded-md flex-shrink-0">
                  <Mail className="h-4 w-4 text-white" />
                </div>
                <p className="text-gray-300 text-sm font-medium">info@pharmacare.ma</p>
              </li>
            </ul>
          </div>

          {/*  social media */}
          <div className="space-y-4">
            <h4 className="text-lg font-bold bg-gradient-to-r from-white to-emerald-200 bg-clip-text text-transparent">
              {t('socialMedia')}
            </h4>
                   
            {/* Social Links */}
            <div className="flex gap-3 pt-2">
              <Link 
                to={'https://www.instagram.com/para_saffona/'} 
                className="bg-gradient-to-br from-pink-600 to-purple-700 p-2 rounded-lg 
                  hover:from-pink-500 hover:to-purple-600 transition-all duration-300 
                  shadow-md hover:shadow-lg hover:-translate-y-0.5"
              >
                <Instagram className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      {/* Bottom Bar */}
      <div className="relative border-t border-gray-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col md:flex-row justify-between items-center gap-2">
          <div className="flex items-center gap-1.5">
            <Heart className="h-4 w-4 text-red-500" />
            <p className="text-gray-300 text-xs">
              © 2025 ParaPharmacie. {t('madeBy')} <a href="https://www.oramadev.com" target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:underline">OramaDev</a>
            </p>
          </div>
          <p className="text-gray-400 text-xs">
            {t('allRightsReserved')}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default ClientFooter;