import { useState, useEffect } from 'react';
import { TrendingUp, Package, ShoppingCart, Users, DollarSign } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { dashboardService, DashboardStats, RecentOrder, LowStockProduct } from '../services/dashboardService';

export default function DashboardHome() {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<LowStockProduct[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError('');
    try {
      // Fetch all dashboard data in parallel
      const [statsData, ordersData, productsData] = await Promise.all([
        dashboardService.getStats().catch(() => null),
        dashboardService.getRecentOrders(5).catch(() => []),
        dashboardService.getLowStockProducts(5).catch(() => []),
      ]);

      if (statsData) setStats(statsData);
      setRecentOrders(ordersData);
      setLowStockProducts(productsData);
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-TN', {
      style: 'currency',
      currency: 'TND',
    }).format(amount);
  };

  const formatChange = (change: number) => {
    const sign = change >= 0 ? '+' : '';
    return `${sign}${change.toFixed(1)}%`;
  };

  const statsCards = [
    {
      name: t.dashboard.totalRevenue,
      value: stats ? formatCurrency(stats.totalRevenue) : '0 TND',
      change: stats ? formatChange(stats.revenueChange) : '0%',
      changeType: stats && stats.revenueChange >= 0 ? 'positive' : 'negative',
      icon: DollarSign,
    },
    {
      name: t.dashboard.totalOrders,
      value: stats ? stats.totalOrders.toString() : '0',
      change: stats ? formatChange(stats.ordersChange) : '0%',
      changeType: stats && stats.ordersChange >= 0 ? 'positive' : 'negative',
      icon: ShoppingCart,
    },
    {
      name: t.products.title,
      value: stats ? stats.totalProducts.toString() : '0',
      change: stats ? formatChange(stats.productsChange) : '0%',
      changeType: stats && stats.productsChange >= 0 ? 'positive' : 'negative',
      icon: Package,
    },
    {
      name: t.dashboard.totalCustomers,
      value: stats ? stats.totalCustomers.toString() : '0',
      change: stats ? formatChange(stats.customersChange) : '0%',
      changeType: stats && stats.customersChange >= 0 ? 'positive' : 'negative',
      icon: Users,
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'COMPLETED':
      case 'DELIVERED':
        return 'bg-green-100 text-green-700';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-700';
      case 'PROCESSING':
      case 'SHIPPED':
        return 'bg-blue-100 text-blue-700';
      case 'CANCELLED':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="ml-4 text-gray-600">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">{t.dashboard.welcome} 👋</h1>
        <p className="text-blue-100">{t.dashboard.overview}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat) => (
          <div key={stat.name} className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-50 rounded-lg">
                <stat.icon className="w-6 h-6 text-blue-600" />
              </div>
              <span className={`text-sm font-medium ${
                stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
              }`}>
                {stat.change}
              </span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</h3>
            <p className="text-sm text-gray-600">{stat.name}</p>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Orders</h2>
          <div className="space-y-4">
            {recentOrders.length === 0 ? (
              <div className="text-center py-8">
                <ShoppingCart className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500">No recent orders</p>
              </div>
            ) : (
              recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                  <div>
                    <p className="font-medium text-gray-900">{order.orderNumber}</p>
                    <p className="text-sm text-gray-600">{order.customerName}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">{formatCurrency(order.totalAmount)}</p>
                    <span className={`inline-block px-2 py-1 text-xs font-medium rounded ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Low Stock Alert */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Low Stock Alert</h2>
          <div className="space-y-4">
            {lowStockProducts.length === 0 ? (
              <div className="text-center py-8">
                <Package className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500">All products are well stocked</p>
              </div>
            ) : (
              lowStockProducts.map((product) => (
                <div key={product.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                  <div>
                    <p className="font-medium text-gray-900">{product.name}</p>
                    <p className="text-sm text-gray-600">SKU: {product.sku}</p>
                  </div>
                  <div className="text-right">
                    <span className={`inline-block px-3 py-1 text-sm font-medium rounded ${
                      product.stock < 5 ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {product.stock} left
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-center">
            <Package className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <span className="text-sm font-medium text-gray-700">Add Product</span>
          </button>
          <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-center">
            <ShoppingCart className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <span className="text-sm font-medium text-gray-700">View Orders</span>
          </button>
          <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-center">
            <Users className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <span className="text-sm font-medium text-gray-700">Manage Customers</span>
          </button>
          <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-center">
            <TrendingUp className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <span className="text-sm font-medium text-gray-700">View Reports</span>
          </button>
        </div>
      </div>
    </div>
  );
}
