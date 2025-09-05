import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Edit2,
  Save,
  X,
  LogOut,
  Shield,
  Package,
  Heart,
  ShoppingBag,
  CreditCard,
  Settings,
  Bell,
  Lock,
  ChevronRight,
  Award,
  Star,
  Truck,
  RefreshCw,
  Home,
  Eye,
  EyeOff,
  CheckCircle,
  Key,
  ChevronDown,
  Menu
} from 'lucide-react';
import { me, update_user_info, logout, update_password } from '../../../api/auth';
import { fetchUserOrders } from '../../../api/orders';
import { useDispatch, useSelector } from 'react-redux';
import { clearCart, clearFavorites } from '../../../redux/action';
import HistoryOrders from './HistoryOrders';
import { useLanguage } from '../../../contexts/LanguageContext';

const AccountProfile = () => {
  const dispatch = useDispatch();
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [activeTab, setActiveTab] = useState('profile');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordErrors, setPasswordErrors] = useState({});
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Get favorites count from Redux (removed cartItems)
  const isLogged = localStorage.getItem('islogged') === 'true';
  
  // Fetch current user
  const { data: userData, isLoading, isError } = useQuery({
    queryKey: ['user'],
    queryFn: me,
    enabled: isLogged,
    staleTime: 1000 * 60 * 5,
    retry: 1,
    refetchOnWindowFocus: false
  });
  const { data: orders = [] } = useQuery({
    queryKey: ['userOrders'],
    queryFn: fetchUserOrders,
    enabled: isLogged,
    
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: update_user_info,
    onSuccess: () => {
      queryClient.invalidateQueries(['user']);
      setIsEditing(false);
    },
  });

  // Change password mutation
  const changePasswordMutation = useMutation({
    mutationFn: update_password,
    onSuccess: () => {
      setPasswordSuccess(true);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => {
        setPasswordSuccess(false);
        setShowPasswordForm(false);
      }, 3000);
    },
    onError: (error) => {
      setPasswordErrors({ submit: error.message });
    }
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: logout,
    onSuccess: () => {
      dispatch(clearCart());
      localStorage.setItem('islogged', 'false'); // بلا JSON.stringify
      dispatch(clearFavorites());
      queryClient.clear();
      window.location.href = '/';
    },
  });

  const handleEditToggle = () => {
    if (isEditing) {
      setIsEditing(false);
      setEditForm({});
    } else {
      setEditForm(userData || {});
      setIsEditing(true);
    }
  };

  const handleInputChange = (field, value) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = () => {
    updateProfileMutation.mutate(editForm);
  };

  const handlePasswordChange = (field, value) => {
    setPasswordForm(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear errors when user types
    if (passwordErrors[field]) {
      setPasswordErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validatePasswordForm = () => {
    const errors = {};
    
    if (!passwordForm.currentPassword) {
      errors.currentPassword = t('currentPassReq');
    }
    
    if (!passwordForm.newPassword) {
      errors.newPassword = t('newPassReq');
    } else if (passwordForm.newPassword.length < 6) {
      errors.newPassword = t('newPassMin');
    }
    
    if (!passwordForm.confirmPassword) {
      errors.confirmPassword = t('newPassConfirm');
    } else if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      errors.confirmPassword = t('newPassMismatch');
    }
    
    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    
    if (validatePasswordForm()) {
      const newPassData = {
        old_password: passwordForm.currentPassword,
        new_password: passwordForm.newPassword,
        new_password_confirmation: passwordForm.confirmPassword
      };
      changePasswordMutation.mutate(newPassData);
    }
  };

  const togglePasswordForm = () => {
    setShowPasswordForm(!showPasswordForm);
    // Reset form when closing
    if (showPasswordForm) {
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setPasswordErrors({});
      setPasswordSuccess(false);
    }
  };

  const handleLogout = () => {
    if (window.confirm(t('areYouSureYouWantToLogout'))) {
      logoutMutation.mutate();
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent"></div>
          <p className="mt-4 text-gray-600">{t('loadingProfile')}</p>
        </div>
      </div>
    );
  }

  if (isError || !userData ) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <User className="w-10 h-10 text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-3">{t('welcome')}</h1>
            <p className="text-gray-600 mb-6">
              {t('signInMessage')}
            </p>
            <div className="space-y-3">
              <a
                href="/login"
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
              >
                <Lock className="w-5 h-5" />
                {t('signIn')}
              </a>
              <a
                href="/register"
                className="w-full flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all"
              >
                <User className="w-5 h-5" />
                {t('createAccount')}
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const user = userData;
  const userName = user.full_name || t('valuedCustomer');

  const tabs = [
    { id: 'profile', label: t('profile'), icon: User },
    { id: 'orders', label: t('orders'), icon: Package },
    { id: 'settings', label: t('settings'), icon: Settings },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">{t('personalInformation')}</h3>
                <button
                  onClick={handleEditToggle}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  {isEditing ? <X className="w-5 h-5" /> : <Edit2 className="w-5 h-5" />}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2">{t('fullName')}</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editForm.full_name || ''}
                        onChange={(e) => handleInputChange('full_name', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                      <p className="text-gray-900 text-lg font-medium">{user.full_name || t('notProvided')}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2">{t('emailAddress')}</label>
                    {isEditing ? (
                      <input
                        type="email"
                        value={editForm.email || ''}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                      <div className="flex items-center gap-3">
                        <Mail className="w-5 h-5 text-gray-400" />
                        <span className="text-gray-900">{user.email}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-4">

                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2">{t('city')}</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editForm.city || ''}
                        onChange={(e) => handleInputChange('city', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter your city"
                      />
                    ) : (
                      <div className="flex items-center gap-3">
                        <Home className="w-5 h-5 text-gray-400" />
                        <span className="text-gray-900">{user.city || t('notProvided')}</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2">{t('memberSince')}</label>
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-900">
                        {user.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        }) : t('n/a')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {isEditing && (
                <div className="flex flex-col sm:flex-row gap-3 mt-6 pt-6 border-t border-gray-100">
                  <button
                    onClick={handleSave}
                    disabled={updateProfileMutation.isLoading}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    {updateProfileMutation.isLoading ? t('saving') : t('saveChanges')}
                  </button>
                  <button
                    onClick={handleEditToggle}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    {t('cancel')}
                  </button>
                </div>
              )}
            </div>

            {/* Quick Stats - Removed cart items */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-blue-600 font-medium">{t('deliveredOrders')}</p>
                    <p className="text-2xl font-bold text-blue-900">{orders?.filter(order => order.status === 'delivered').length}</p>
                  </div>
                  <Package className="w-8 h-8 text-blue-600" />
                </div>
              </div>
            </div>
          </div>
        );

      case 'orders':
        return <HistoryOrders/>;

     

      case 'settings':
        return (
          <div className="space-y-6">
            {/* Change Password Card */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="bg-gradient-to-br from-blue-100 to-blue-200 p-2 rounded-lg">
                    <Key className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{t('changePassword')}</h3>
                    <p className="text-sm text-gray-600">{t('Update your account password')}</p>
                  </div>
                </div>
                <button
                  onClick={togglePasswordForm}
                  className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    showPasswordForm 
                      ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' 
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {showPasswordForm ? (
                    <>
                      <X className="w-4 h-4" />
                      <span className="hidden sm:inline">{t('cancel')}</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      <span className="hidden sm:inline">{t('changePassword')}</span>
                      <span className="sm:hidden">{t('change')}</span>
                    </>
                  )}
                </button>
              </div>

              {showPasswordForm && (
                <form onSubmit={handlePasswordSubmit} className="space-y-4 pt-4 border-t border-gray-100">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('currentPass')}
                    </label>
                    <div className="relative">
                      <input
                        type={showCurrentPassword ? "text" : "password"}
                        value={passwordForm.currentPassword}
                        onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                        className={`w-full px-4 py-3 border ${passwordErrors.currentPassword ? 'border-red-300' : 'border-gray-200'} rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12`}
                        placeholder={t('currentPassPlaceholder')}
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                      >
                        {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {passwordErrors.currentPassword && (
                      <p className="mt-1 text-sm text-red-600">{passwordErrors.currentPassword}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                     {t('newPass')}
                    </label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? "text" : "password"}
                        value={passwordForm.newPassword}
                        onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                        className={`w-full px-4 py-3 border ${passwordErrors.newPassword ? 'border-red-300' : 'border-gray-200'} rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12`}
                        placeholder={t('newPassPlaceholder')}
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                      >
                        {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {passwordErrors.newPassword && (
                      <p className="mt-1 text-sm text-red-600">{passwordErrors.newPassword}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('confirmPass')}
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        value={passwordForm.confirmPassword}
                        onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                        className={`w-full px-4 py-3 border ${passwordErrors.confirmPassword ? 'border-red-300' : 'border-gray-200'} rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12`}
                        placeholder={t('confirmPassPlaceholder')}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                      >
                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {passwordErrors.confirmPassword && (
                      <p className="mt-1 text-sm text-red-600">{passwordErrors.confirmPassword}</p>
                    )}
                  </div>

                  {passwordErrors.submit && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                      <p className="text-sm text-red-600">{passwordErrors.submit}</p>
                    </div>
                  )}

                  {passwordSuccess && (
                    <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <p className="text-sm text-green-600">{t('passUpdatedSucc')}</p>
                    </div>
                  )}

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={changePasswordMutation.isLoading}
                      className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50"
                    >
                      {changePasswordMutation.isLoading ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          {t('updating')}
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4" />
                          {t('updatePass')}
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Logout Card */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-gradient-to-br from-red-100 to-red-200 p-2 rounded-lg">
                  <LogOut className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{t('accountActions')}</h3>
                  <p className="text-sm text-gray-600">{t('manageSession')}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-red-50 border border-red-100 rounded-xl">
                  <h4 className="font-medium text-red-800 mb-2">{t('signOut')}</h4>
                  <p className="text-sm text-red-600 mb-4">
                    {t('signOutWarning')}
                  </p>
                  <button
                    onClick={handleLogout}
                    disabled={logoutMutation.isLoading}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                  >
                    {logoutMutation.isLoading ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <LogOut className="w-4 h-4" />
                    )}
                    {t('signOut')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Mobile Navigation Toggle */}
        <div className="lg:hidden mb-6">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="w-full flex items-center justify-between p-4 bg-white rounded-xl shadow-sm border border-gray-100"
          >
            <span className="font-medium text-gray-900">
              {tabs.find(tab => tab.id === activeTab)?.label || 'Menu'}
            </span>
            {isMobileMenuOpen ? <ChevronDown className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          
          {isMobileMenuOpen && (
            <div className="mt-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <nav className="space-y-1 p-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setActiveTab(tab.id);
                        setIsMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                        activeTab === tab.id
                          ? 'bg-blue-50 text-blue-600 border border-blue-100'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{tab.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar - Hidden on mobile, shown on desktop */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 sticky top-8">
              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="w-10 h-10 text-blue-600" />
                </div>
                <h2 className="font-semibold text-gray-900">{userName}</h2>
                <p className="text-sm text-gray-600">{user.email}</p>
                {user.city && (
                  <div className="flex items-center justify-center gap-1 mt-1 text-sm text-gray-500">
                    <Home className="w-4 h-4" />
                    <span>{user.city}</span>
                  </div>
                )}
              </div>

              <nav className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                        activeTab === tab.id
                          ? 'bg-blue-50 text-blue-600 border border-blue-100'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{tab.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {renderTabContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountProfile;