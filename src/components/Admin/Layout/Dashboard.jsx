import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLanguage } from '../../../contexts/LanguageContext';
import { 
  Package, 
  AlertTriangle, 
  DollarSign,
  ShoppingBag,
  RefreshCw,
  PieChart,
  ArrowUpRight,
  Award
} from 'lucide-react';
import { getDashboardStatistics } from '../../../api/statistic';
import { fetch_sales_per_product } from '../../../api/products';
import { fetch_sales_per_categories } from '../../../api/categories';

const Dashboard = () => {
  const { t } = useLanguage();

  // Fetch dashboard statistics
  const { data: dashboardStats, isLoading: statsLoading, refetch: refetchStats } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: getDashboardStatistics,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false
  });

  // Fetch top selling products
  const { data: topSellingProducts = [], isLoading: productsLoading ,refetch: refetchProducts} = useQuery({
    queryKey: ['top-products'],
    queryFn: fetch_sales_per_product,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false
  });

  // Category sales with time frame
  const [timeFrame, setTimeFrame] = React.useState('all');
  const { data: categorySales = [], isLoading: categoriesLoading , refetch: refetchCategories} = useQuery({
    queryKey: ['category-sales', timeFrame],
    queryFn: () => fetch_sales_per_categories(timeFrame),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false
  });

  const loading = statsLoading || productsLoading || categoriesLoading;

  // Memoized metrics for performance
  const metrics = useMemo(() => {
    const ordersOverview = dashboardStats?.orders_overview || [];
    
    // Find counts for each order status
    const findStatusCount = (status) => {
      const statusObj = ordersOverview.find(item => item.status === status);
      return statusObj ? statusObj.total : 0;
    };
    
    return {
      totalRevenue: parseFloat(dashboardStats?.total_revenue || 0),
      totalOrders: dashboardStats?.today_orders?.today_orders || 0,
      deliveredOrders: findStatusCount('delivered'),
      lowStockItems: dashboardStats?.stock_alert?.low_stock_products || 0,
      outOfStockItems: dashboardStats?.stock_alert?.out_of_stock_products || 0,
      pendingOrders: findStatusCount('pending'),
      returnedOrders: findStatusCount('returned'),
      canceledOrders: findStatusCount('canceled')
    };
  }, [dashboardStats]);

  // Top 5 products
  const topProducts = useMemo(() => topSellingProducts.slice(0, 5), [topSellingProducts]);
  

  const stats = [
    {
      title: t("Today's Revenue"),
      value: `${metrics.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} MAD`,
      icon: DollarSign,
      gradient: 'from-amber-500 to-orange-500',
      subtitle: t('Total Revenue')
    },
    {
      title: t('Orders & Deliveries'),
      value: `${metrics.totalOrders} / ${metrics.deliveredOrders}`,
      icon: ShoppingBag,
      gradient: 'from-cyan-500 to-blue-500',
      subtitle: t('Total / Delivered')
    },
    {
      title: t('Stock Alerts'),
      value: `${metrics.lowStockItems} / ${metrics.outOfStockItems}`,
      icon: AlertTriangle,
      gradient: 'from-orange-500 to-red-500',
      subtitle: t('Low / Out of Stock')
    }
  ];

  const refreshData = async () => {
    await refetchStats();
    await refetchProducts();
    await refetchCategories();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-violet-50/30 p-6 flex items-center justify-center ml-72">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-violet-50/30 p-6 space-y-8 ml-72">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-purple-900 to-indigo-900 bg-clip-text text-transparent mb-2">
            Pharmacy Dashboard
          </h1>
          <p className="text-gray-600 text-lg">{t('dashboardWelcome')}</p>
          <p className="text-sm text-gray-500 mt-1">
            {t('lastUpdated')}: {new Date().toLocaleTimeString()}
          </p>
        </div>
        
        <button
          onClick={refreshData}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-500 to-purple-500 text-white rounded-xl hover:from-violet-600 hover:to-purple-600 disabled:opacity-50 transition-all duration-300 mt-4 lg:mt-0"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          {t('refresh') }
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="group relative overflow-hidden">
              {/* Background Gradient */}
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-5 group-hover:opacity-10 transition-opacity rounded-2xl`}></div>
              
              <div className="relative bg-white/70 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-white/50 hover:shadow-xl transition-all duration-300 group-hover:-translate-y-1">
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.gradient} shadow-lg`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</p>
                  {stat.subtitle && (
                    <p className="text-xs text-gray-500">{stat.subtitle}</p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Two Column Layout: Top 5 Products and Category Earnings */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Top 5 Products - Left Column */}
        <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-lg border border-white/50 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-br from-violet-500 to-purple-500 p-2 rounded-xl">
                  <Award className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{t('topSellingProducts')}</h2>
                  <p className="text-sm text-gray-600">{t('bestPerformingItems')}</p>
                </div>
              </div>
            
            </div>
          </div>
          
          <div className="p-6">
            {topProducts.length > 0 ? (
              <div className="space-y-4">
               {topProducts.map((product, index) => (
  <div 
    key={product.target_id} 
    className="flex items-center space-x-4 p-4 bg-gradient-to-r from-gray-50 to-violet-50/50 rounded-xl border border-gray-100 hover:shadow-md transition-all duration-300"
  >
    <div className="flex-shrink-0 relative">
      {product.target_name === 'product' && product.image ? (
        <img 
          src={`${import.meta.env.VITE_IMG_BASE_URL}/${product.image}`}
          alt={product.name}
          className="h-12 w-12 rounded-xl object-cover shadow-md"
        />
      ) : (
        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
          <Package className="h-6 w-6" />
        </div>
      )}

      <div className="absolute -top-1 -left-1 bg-gradient-to-r from-violet-500 to-purple-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
        {index + 1}
      </div>
    </div>

    <div className="flex-1 min-w-0">
      <p className="font-semibold text-gray-900 truncate">
        {product?.name}
      </p>
      <p className="text-sm text-gray-600">{product.total_quantity_sold} {t('unitsSold')}</p>
      <p className="text-xs text-gray-500">
        {parseFloat(product.price || 0).toFixed(2)} MAD {t('each')}
      </p>
    </div>

    <div className="text-right">
      <p className="font-bold text-gray-900">{parseFloat(product.total_revenue || 0).toFixed(2)} MAD</p>
      <p className="text-sm text-emerald-600">{t('totalRevenue')}</p>
    </div>
  </div>
))}

              </div>
            ) : (
              <div className="text-center py-12">
                <div className="bg-gradient-to-br from-gray-100 to-gray-200 p-4 rounded-2xl w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Package className="h-8 w-8 text-gray-400" />
                </div>
                <p className="text-gray-500 font-medium">{t('noSalesData')}</p>
                <p className="text-sm text-gray-400">{t('salesWillAppearHere')}</p>
              </div>
            )}
          </div>
        </div>

        {/* Category Sales - Right Column */}
        <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-lg border border-white/50 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-br from-violet-500 to-purple-500 p-2 rounded-xl">
                  <PieChart className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{t('categorySales')}</h2>
                  <p className="text-sm text-gray-600">{t('revenueByProductCategory')}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setTimeFrame('all')}
                  className={`px-3 py-1 rounded-lg text-xs font-medium ${
                    timeFrame === 'all'
                      ? 'bg-violet-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {t('all')}
                </button>
                <button
                  onClick={() => setTimeFrame('today')}
                  className={`px-3 py-1 rounded-lg text-xs font-medium ${
                    timeFrame === 'today'
                      ? 'bg-violet-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {t('today')}
                </button>
                <button
                  onClick={() => setTimeFrame('month')}
                  className={`px-3 py-1 rounded-lg text-xs font-medium ${
                    timeFrame === 'month'
                      ? 'bg-violet-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {t('month')}
                </button>
                <button
                  onClick={() => setTimeFrame('year')}
                  className={`px-3 py-1 rounded-lg text-xs font-medium ${
                    timeFrame === 'year'
                      ? 'bg-violet-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {t('year')}
                </button>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            {categorySales.length > 0 ? (
              <div className="space-y-4">
                {categorySales.map((category, index) => {
                  const percentage = (category.total_revenue / metrics.totalRevenue) * 100;
                  return (
                    <div key={category.category_id} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-violet-50/50 rounded-xl border border-gray-100">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-gray-900">{category.category_name}</span>
                          <span className="font-bold text-violet-600">
                            {category.total_revenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} MAD
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-violet-500 to-purple-500 h-2 rounded-full" 
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>{category.total_quantity_sold} {t('unitsSold')}</span>
                          <span>{percentage.toFixed(1)}% {t('ofTotalRevenue')}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="bg-gradient-to-br from-gray-100 to-gray-200 p-4 rounded-2xl w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <PieChart className="h-8 w-8 text-gray-400" />
                </div>
                <p className="text-gray-500 font-medium">{t('noCategorySales')}</p>
                <p className="text-sm text-gray-400">{t('salesWillAppearHere')}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Order Status Summary - Full Width */}
      <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-lg border border-white/50 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-br from-blue-500 to-indigo-500 p-2 rounded-xl">
              <ShoppingBag className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{t('orderStatusSummary')}</h2>
              <p className="text-sm text-gray-600">{t('overviewOrders')}</p>
            </div>
          </div>
        </div>
        
        <div className="p-6 grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-gradient-to-r from-yellow-50 to-amber-50/50 p-6 rounded-xl border border-amber-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-amber-800">{t('pendingOrders')}</h3>
              <div className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm font-medium">
                {metrics.pendingOrders}
              </div>
            </div>
            <p className="text-amber-600">{t('pendingOrdersDesc')}</p>
          </div>
          
          <div className="bg-gradient-to-r from-emerald-50 to-green-50/50 p-6 rounded-xl border border-emerald-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-emerald-800">{t('deliveredOrders')}</h3>
              <div className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-sm font-medium">
                {metrics.deliveredOrders}
              </div>
            </div>
            <p className="text-emerald-600">{t('deliveredOrdersDesc')}</p>
          </div>
          
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50/50 p-6 rounded-xl border border-blue-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-blue-800">{t('returnedOrders')}</h3>
              <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                {metrics.returnedOrders}
              </div>
            </div>
            <p className="text-blue-600">{t('returnedOrdersDesc')}</p>
          </div>
          
          <div className="bg-gradient-to-r from-red-50 to-pink-50/50 p-6 rounded-xl border border-red-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-red-800">{t('canceledOrders')}</h3>
              <div className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
                {metrics.canceledOrders}
              </div>
            </div>
            <p className="text-red-600">{t('canceledOrdersDesc')}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;