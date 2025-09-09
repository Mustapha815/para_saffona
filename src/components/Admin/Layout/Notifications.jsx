import React, { useState, useEffect } from 'react';
import { fetch_delete_notification, fetch_notifications, fetch_update_notification } from '../../../api/notifications';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useLanguage } from '../../../contexts/LanguageContext';
import { AlertCircle, Bell, Calendar, CheckCircle, Package, ShoppingCart, Trash2, X } from 'lucide-react';
// ... other imports

const AdminNotifications = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [activeType, setActiveType] = useState('all');
  const queryClient = useQueryClient();
  const { t } = useLanguage();
  const isLogged = localStorage.getItem('islogged') === 'true';

  const { data: notifications = [], isLoading, error, refetch } = useQuery({
    queryKey: ['notifications'],
    queryFn: fetch_notifications,
    enabled: !!isLogged,
  });

  // Polling using setInterval
  useEffect(() => {
    if (!isLogged) return;
    const interval = setInterval(() => {
      refetch(); // This will fetch new data and update the UI
    }, 5000); // every 5 seconds
    return () => clearInterval(interval);
  }, [isLogged, refetch]);

  // Mutations (update/delete) same as before
  const updateNotificationMutation = useMutation({
    mutationFn: (id) => fetch_update_notification(id),
    onSuccess: () => queryClient.invalidateQueries(['notifications']),
  });

  const deleteNotificationMutation = useMutation({
    mutationFn: (id) => fetch_delete_notification(id),
    onSuccess: () => queryClient.invalidateQueries(['notifications']),
  });

  // rest of your code remains unchanged...


  // Filter notifications based on active tabs
  const filteredNotifications = notifications.filter(notification => {
    const readMatch = activeTab === 'all' || 
                     (activeTab === 'read' && notification.is_read) || 
                     (activeTab === 'unread' && !notification.is_read);
    
    const typeMatch = activeType === 'all' || notification.type === activeType;
    
    return readMatch && typeMatch;
  });

  // Mark notification as read
  const markAsRead = (id) => {
    updateNotificationMutation.mutate(id);
  };

  // Delete notification
  const deleteNotification = (id) => {
    deleteNotificationMutation.mutate(id);
  };

  // Get icon based on notification type
  const getIcon = (type) => {
    switch (type) {
      case 'out_of_stock':
        return <X size={20} className="text-red-500" />;
      case 'new_order':
        return <ShoppingCart size={20} className="text-blue-500" />;
      case 'low_stock':
        return <AlertCircle size={20} className="text-yellow-500" />;
      default:
        return <Bell size={20} className="text-gray-500" />;
    }
  };

  const getTitle = (type) =>{
    switch (type) {
      case 'out_of_stock':
        return t('Product is out of stock');
      case 'new_order':
        return t('New order received');
      case 'low_stock':
        return t('Product is low on stock');
      default:
        return t('General Notification');
    }
  }

  const getSubTitle = (type , message)=>{
    switch (type) {
      case 'out_of_stock':
        return `${t('The product')} "${message}" ${t('is out of stock.')}`;
      case 'new_order':
        return `${t('A new order has been placed by')} "${message}".`;
      case 'low_stock':
        return `${t('The product')} "${message}" ${t('is low on stock.')}`;
      default:
        return `Notification: ${message}`;
    }
  }

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center ml-72">
        <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md p-6 w-full">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 bg-gray-100 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md p-6 text-center">
          <div className="text-red-500 mb-4">
            <AlertCircle size={48} className="mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error loading notifications</h3>
          <p className="text-gray-500">{error.message}</p>
          <button 
            onClick={() => queryClient.refetchQueries(['notifications'])}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            {t('tryAgain')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 ml-72">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md overflow-hidden">
        {/* Header */}
        <div className="bg-indigo-600 p-6 text-white flex items-center justify-between">
          <div className="flex items-center">
            <Bell size={24} className="mr-3" />
            <h1 className="text-2xl font-bold">{t('Notifications')}</h1>
          </div>
          <span className="bg-indigo-800 text-sm px-3 py-1 rounded-full">
            {notifications.filter(n => !n.is_read).length} {t('unread')}
          </span>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <div className="flex">
            {['all', 'unread', 'read'].map(tab => (
              <button
                key={tab}
                className={`px-6 py-4 font-medium text-sm capitalize ${activeTab === tab ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                onClick={() => setActiveTab(tab)}
              >
                {t(tab)}
              </button>
            ))}
          </div>
          
          <div className="flex px-6 pb-4 mt-2">
            {['all', 'out_of_stock', 'new_order', 'low_stock'].map(type => (
              <button
                key={type}
                className={`px-4 py-2 text-xs font-medium rounded-full mr-2 capitalize ${activeType === type ? 'bg-indigo-100 text-indigo-800' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                onClick={() => setActiveType(type)}
              >
                {t(type.replace(/_/g, ' '))}
              </button>
            ))}
          </div>
        </div>

        {/* Notifications List */}
        <div className="divide-y divide-gray-200">
          {filteredNotifications.length > 0 ? (
            filteredNotifications.map(notification => (
              <div
                key={notification.id}
                className={`p-6 flex items-start ${!notification.is_read ? 'bg-indigo-50' : ''}`}
              >
                <div className="flex-shrink-0 mr-4 mt-1">
                  {getIcon(notification.type)}
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{getTitle(notification.type)}</h3>
                  <p className="mt-1 text-gray-600">{getSubTitle(notification.type, notification.message)}</p>
                  <div className="mt-2 flex items-center text-sm text-gray-500">
                    <Calendar size={14} className="mr-1" />
                    {formatDate(notification.created_at)}
                  </div>
                </div>
                <div className="flex space-x-2">
                  {!notification.is_read && (
                    <button
                      onClick={() => markAsRead(notification.id)}
                      disabled={updateNotificationMutation.isLoading}
                      className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-full disabled:opacity-50"
                      title="Mark as read"
                    >
                      <CheckCircle size={18} />
                    </button>
                  )}
                  <button
                    onClick={() => deleteNotification(notification.id)}
                    disabled={deleteNotificationMutation.isLoading}
                    className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full disabled:opacity-50"
                    title="Delete notification"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="p-12 text-center">
              <Package size={48} className="mx-auto text-gray-300" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">{t("No notifications")}</h3>
              <p className="mt-1 text-gray-500">{t("You're all caught up! No notifications to display.")}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminNotifications;