import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../../contexts/LanguageContext';
import { 
  LayoutDashboard, 
  Package, 
  Users,
  Building2,
  Grid3X3,
  Box,
  ShoppingCart,
  Layers,
  Building,
  UserCog
} from 'lucide-react';

const AdminSidebar = () => {
  const { t, isRTL } = useLanguage();

  const navigate = useNavigate();
  const pathname = window.location.pathname;


  const menuItems = [
    { 
      id: 'dashboard', 
      icon: LayoutDashboard, 
      label: t('dashboard'), 
      path: '/admin/dashboard',
      gradient: 'from-violet-500 to-purple-500',
      bgGradient: 'from-violet-50 to-purple-50',
      borderColor: 'border-violet-200',
      iconColor: 'text-violet-600'
    },
    { 
      id: 'orders', 
      icon: ShoppingCart, 
      label: t('orders'), 
      path: '/admin/orders-dashboard',
      gradient: 'from-blue-500 to-indigo-500',
      bgGradient: 'from-blue-50 to-indigo-50',
      borderColor: 'border-blue-200',
      iconColor: 'text-blue-600'
    },
    { 
      id: 'products', 
      icon: Package, 
      label: t('products'), 
      path: '/admin/products',
      gradient: 'from-emerald-500 to-teal-500',
      bgGradient: 'from-emerald-50 to-teal-50',
      borderColor: 'border-emerald-200',
      iconColor: 'text-emerald-600'
    },
    { 
      id: 'packManagement', 
      icon: Layers, 
      label: t('Pack Management'), 
      path: '/admin/pack-management',
      gradient: 'from-orange-500 to-amber-500',
      bgGradient: 'from-orange-50 to-amber-50',
      borderColor: 'border-orange-200',
      iconColor: 'text-orange-600'
    },
    { 
      id: 'categories', 
      icon: Grid3X3, 
      label: t('categories'), 
      path: '/admin/categories',
      gradient: 'from-pink-500 to-rose-500',
      bgGradient: 'from-pink-50 to-rose-50',
      borderColor: 'border-pink-200',
      iconColor: 'text-pink-600'
    },
    { 
      id: 'companies', 
      icon: Building, 
      label: t('companies'), 
      path: '/admin/companies',
      gradient: 'from-cyan-500 to-sky-500',
      bgGradient: 'from-cyan-50 to-sky-50',
      borderColor: 'border-cyan-200',
      iconColor: 'text-cyan-600'
    },
    { 
      id: 'customers', 
      icon: UserCog, 
      label: t('customers'), 
      path: '/admin/customers',
      gradient: 'from-green-500 to-emerald-500',
      bgGradient: 'from-green-50 to-emerald-50',
      borderColor: 'border-green-200',
      iconColor: 'text-green-600'
    }
  ];

  const handleMenuClick = (item) => {

    navigate(item.path);
  };

  return (
    <aside className={`${!isRTL? 'fixed left-0 top-0' : 'fixed right-0 top-0'} h-screen bg-white/80 backdrop-blur-xl w-72 border-r border-gray-200/50 flex flex-col z-50`} dir='ltr'>
   

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.path;
          
          return (
            <button
              key={item.id}
              onClick={() => handleMenuClick(item)}
              className={`w-full group relative overflow-hidden rounded-xl transition-all duration-300 ${
                isActive
                  ? `bg-gradient-to-r ${item.bgGradient} border ${item.borderColor} shadow-md`
                  : 'hover:bg-gray-50 border border-transparent hover:border-gray-200'
              }`}
            >
              {/* Background Gradient Effect */}
              {isActive && (
                <div className={`absolute inset-0 bg-gradient-to-r ${item.gradient} opacity-5`}></div>
              )}
              
              <div className="relative flex items-center p-4">
                <div className={`p-2 rounded-lg mr-3 transition-all duration-300 ${
                  isActive 
                    ? `bg-gradient-to-br ${item.gradient} text-white shadow-md` 
                    : `bg-gray-100 ${item.iconColor} group-hover:bg-gray-200`
                }`}>
                  <Icon className="h-5 w-5" />
                </div>
                
                <div className="flex-1 text-left">
                  <span className={`font-medium transition-colors text-sm ${
                    isActive ? 'text-gray-900' : 'text-gray-700 group-hover:text-gray-900'
                  }`}>
                    {item.label}
                  </span>
                </div>

                {/* Active Indicator */}
                {isActive && (
                  <div className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${item.gradient} animate-pulse`}></div>
                )}
              </div>
            </button>
          );
        })}
      </nav>

    
    </aside>
  );
};

export default AdminSidebar;