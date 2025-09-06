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
     <footer className="relative overflow-hidden text-white bg-[radial-gradient(100%_100%_at_100%_0%,#2E7F88_0%,#21867A_100%)]">
  {/* Background Pattern */}
  <div className="absolute inset-0 opacity-20">
    <div className="absolute top-0 left-0 w-64 h-64 rounded-full -translate-x-32 -translate-y-32 bg-[radial-gradient(100%_100%_at_100%_0%,#2E7F88_0%,#21867A_100%)]"></div>
    <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full translate-x-48 translate-y-48 bg-[radial-gradient(100%_100%_at_100%_0%,#2E7F88_0%,#21867A_100%)]"></div>
  </div>

  {/* Main Footer */}
  <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
    <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-6">
      
      {/* Company Info */}
      <div className="md:col-span-2 space-y-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="relative overflow-hidden rounded-xl shadow-md border border-white/20">
              <img 
                src="/logo.jpg" 
                alt="Parasaffona" 
                className="h-14 w-14 object-cover"
              />
            </div>
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-orange-400 rounded-full animate-pulse"></div>
          </div>
          <div>
            <h3 className="text-xl font-bold text-white tracking-tight">
              Parasaffona
            </h3>
            <p className="text-white text-xs font-medium mt-0.5">
              {t('Premium-Wellness-Partner')}
            </p>
          </div>
        </div>
        <p className="text-white text-sm max-w-md">
          {t('yourTrust')}
        </p>
      </div>

      {/* Contact Info */}
      <div className="space-y-4">
        <h4 className="text-lg font-bold text-white">
          {t('getInTouch')}
        </h4>
        <ul className="space-y-3">
          <li className="flex items-start gap-3">
            <div className="bg-white/10 p-1.5 rounded-md mt-0.5 flex-shrink-0">
              <MapPin className="h-4 w-4 text-emerald-400" />
            </div>
            <div>
              <p className="text-white text-sm font-medium">Ave Al Mokaouama</p>
              <p className="text-white/70 text-xs">Dakhla, Morocco</p>
            </div>
          </li>
          <li className="flex items-center gap-3">
            <div className="bg-white/10 p-1.5 rounded-md flex-shrink-0">
              <Phone className="h-4 w-4 text-blue-500" />
            </div>
            <p className="text-white text-sm font-medium">+212 5 22 XX XX XX</p>
          </li>
          <li className="flex items-center gap-3">
            <div className="bg-white/10 p-1.5 rounded-md flex-shrink-0">
              <Mail className="h-4 w-4 text-red-500" />
            </div>
            <p className="text-white text-sm font-medium">info@pharmacare.ma</p>
          </li>
        </ul>
      </div>

      {/* Social Media */}
      <div className="space-y-4">
        <h4 className="text-lg font-bold text-white">
          {t('socialMedia')}
        </h4>
        <div className="flex gap-3 pt-2">
          <Link 
            to={'https://www.instagram.com/para_saffona/'} 
            className="bg-white/10 p-2 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg hover:-translate-y-0.5"
          >
            <Instagram className="h-5 w-5 text-pink-500" />
          </Link>
        </div>
      </div>
    </div>
  </div>

  {/* Bottom Bar */}
  <div className="relative border-t border-white/20">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col md:flex-row justify-between items-center gap-2">
      <div className="flex items-center gap-1.5">
        <Heart className="h-4 w-4 text-red-500" />
        <p className="text-white text-xs">
          © 2025 ParaPharmacie. {t('madeBy')} <a href="https://www.oramadev.com" target="_blank" rel="noopener noreferrer" className="text-white/90 hover:underline">OramaDev</a>
        </p>
      </div>
      <p className="text-white/80 text-xs">
        {t('allRightsReserved')}
      </p>
    </div>
  </div>
</footer>


  );
};

export default ClientFooter;