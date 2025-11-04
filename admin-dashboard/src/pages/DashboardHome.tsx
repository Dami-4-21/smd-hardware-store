import { TrendingUp, Package, ShoppingCart, Users, DollarSign } from 'lucide-react';

export default function DashboardHome() {
  const stats = [
    {
      name: 'Total Revenue',
      value: '45,231 TND',
      change: '+12.5%',
      changeType: 'positive',
      icon: DollarSign,
    },
    {
      name: 'Orders',
      value: '156',
      change: '+8.2%',
      changeType: 'positive',
      icon: ShoppingCart,
    },
    {
      name: 'Products',
      value: '2,345',
      change: '+3.1%',
      changeType: 'positive',
      icon: Package,
    },
    {
      name: 'Customers',
      value: '892',
      change: '+15.3%',
      changeType: 'positive',
      icon: Users,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">Welcome back! 👋</h1>
        <p className="text-blue-100">Here's what's happening with your store today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-50 rounded-lg">
                <stat.icon className="w-6 h-6 text-blue-600" />
              </div>
              <span className="text-sm font-medium text-green-600">{stat.change}</span>
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
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                <div>
                  <p className="font-medium text-gray-900">Order #100{i}</p>
                  <p className="text-sm text-gray-600">Customer {i}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900">{(Math.random() * 500 + 50).toFixed(2)} TND</p>
                  <span className="inline-block px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded">
                    Completed
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Low Stock Alert */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Low Stock Alert</h2>
          <div className="space-y-4">
            {[
              { name: 'Cordless Drill 18V', stock: 3 },
              { name: 'Paint Brush Set', stock: 5 },
              { name: 'Safety Helmet', stock: 7 },
              { name: 'Electrical Wire', stock: 12 },
              { name: 'Hammer Tool', stock: 8 },
            ].map((product, i) => (
              <div key={i} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                <div>
                  <p className="font-medium text-gray-900">{product.name}</p>
                  <p className="text-sm text-gray-600">SKU: PROD-{1000 + i}</p>
                </div>
                <div className="text-right">
                  <span className={`inline-block px-3 py-1 text-sm font-medium rounded ${
                    product.stock < 5 ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {product.stock} left
                  </span>
                </div>
              </div>
            ))}
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
