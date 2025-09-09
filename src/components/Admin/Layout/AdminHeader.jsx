

import { Link, useNavigate } from 'react-router-dom';
import { useMutation,useQueryClient,useQuery } from '@tanstack/react-query';
import { useLanguage } from '../../../contexts/LanguageContext';
import { 
 
  Globe, 
  User, 

  LogOut, 
  Bell,
  Home

} from 'lucide-react';
import { logout } from '../../../api/auth';
import {fetch_notifications} from '../../../api/notifications';
import { useEffect } from 'react';


const AdminHeader = () => {
  const { language, setLanguage, t } = useLanguage();
    const pathname = window.location.pathname;
 
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  // Fetch notifications using React Query
const { data: notifications = [], isLoading, error, refetch } = useQuery({
  queryKey: ['notifications'],
  queryFn: fetch_notifications,
  staleTime: 0, // ensures data is considered stale immediately
});

// Polling using useEffect
useEffect(() => {
  const interval = setInterval(() => {
    refetch(); // fetch latest notifications
  }, 10000); // every 10 seconds
  return () => clearInterval(interval);
}, [refetch]);


  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
  ];

    // Logout mutation
    const logoutMutation = useMutation({
      mutationFn: logout,
      onSuccess: () => {
        localStorage.setItem('islogged', 'false');
        queryClient.clear();
        navigate('/login');
        
      },
    });
    const handleLogout = () => {
    if (window.confirm(t('areYouSureYouWantToLogout'))) {
      logoutMutation.mutate();
    }
  };

  

  return (
    <header className="bg-white/80 backdrop-blur-xl border-b border-gray-200/50 sticky top-0 z-50 ml-72">
      <div className="px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
           {/* Logo and Brand */}
          <div className="flex items-center space-x-4 rtl:space-x-reverse">
            <div className="relative group">
              <div className="relative   p-3 rounded-2xl ">
                <img src='/logo.jpg' className="h-10 rounded-2xl  w-10 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 via-purple-900 to-indigo-900 bg-clip-text text-transparent">
                Parasaffona Admin
              </h1>
              <p className="text-sm text-gray-500 font-medium">Command Center</p>
            </div>
          </div>



          {/* Right Section */}
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            {/* Language Selector */}
               <Link to={'/'} className={`relative p-4 rounded-xl hover:bg-teal-50 transition-all duration-300 border border-gray-200  group `}>
                <Home className={`h-5 w-5 text-gray-600 group-hover:text-teal-600 transition-colors `} />
              </Link>

            <div className="relative group">
              <button className="flex items-center space-x-2 rtl:space-x-reverse px-4 py-3 rounded-xl hover:bg-gray-50 transition-all duration-300 border border-gray-200 hover:border-violet-200">
                <Globe className="h-4 w-4 text-gray-600" />
                <span className="text-lg">
                  {languages.find(l => l.code === language)?.flag}
                </span>
              </button>
            
              
              <div className="absolute right-0 rtl:right-auto rtl:left-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => setLanguage(lang.code)}
                    className={`w-full flex items-center space-x-3 rtl:space-x-reverse px-4 py-3 text-sm hover:bg-gray-50 transition-colors ${
                      language === lang.code ? 'bg-violet-50 text-violet-700' : 'text-gray-700'
                    } first:rounded-t-xl last:rounded-b-xl`}
                  >
                    <span className="text-lg">{lang.flag}</span>
                    <span className="font-medium">{lang.name}</span>
                  </button>
                ))}
              </div>
            </div>
            {/* {notifications} */}
            <Link to={'/admin/notifications'} className={`relative p-4 rounded-xl hover:bg-orange-50 transition-all duration-300 border border-gray-200 hover:border-orange-200 group ${pathname === '/admin/notifications' ? 'bg-orange-50 border-orange-200' : ''}`}>
              <Bell className={`h-5 w-5 text-gray-600 group-hover:text-orange-600 transition-colors ${pathname === '/admin/notifications' ? 'text-orange-600' : ''}`} />
              <span className="absolute -top-1 -right-1 h-5 w-5 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">{notifications.filter(n => !n.is_read).length}</span>
            </Link>

            

           
            <Link to="/admin/admin-profile">
            <div className="flex items-center space-x-3 rtl:space-x-reverse px-4 py-2 rounded-xl bg-gradient-to-r from-violet-50 to-indigo-50 border border-violet-200 cursor-pointer hover:from-violet-100 hover:to-indigo-100 transition-colors">
              <div className="bg-gradient-to-br from-violet-500 to-indigo-500 p-2 rounded-lg">
                <User className="h-5 w-5 text-white" />
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-bold text-gray-900">Admin User</p>
                <p className="text-xs text-violet-600 font-medium">Administrator</p>
              </div>
            </div>
          </Link>


            {/* Logout */}
            <button
              onClick={handleLogout}
              className="p-4 rounded-xl hover:bg-red-50 text-red-600 transition-all duration-300 border border-gray-200 hover:border-red-200 group"
              title="Logout"
            >
              <LogOut className="h-5 w-5 group-hover:scale-110 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;