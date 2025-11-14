import { useState, useEffect } from 'react';
import { Search, X, Package, Eye, Building2, User, Calendar, Edit } from 'lucide-react';
import { orderService, Order } from '../services/orderService';
import OrderEditModal from '../components/OrderEditModal';

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);

  useEffect(() => {
    loadOrders();
  }, [page, searchTerm, filterStatus]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const response = await orderService.getAll({
        page,
        limit: 20,
        search: searchTerm || undefined,
        status: filterStatus || undefined,
      });
      setOrders(response.orders);
      setTotalPages(response.pagination.totalPages);
    } catch (error: any) {
      console.error('Failed to load orders:', error);
      alert('Failed to load orders: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleViewOrder = async (order: Order) => {
    try {
      const fullOrder = await orderService.getById(order.id);
      setSelectedOrder(fullOrder);
    } catch (error: any) {
      alert('Failed to load order details: ' + error.message);
    }
  };

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    if (!confirm(`Update order status to ${newStatus}?`)) {
      return;
    }

    try {
      await orderService.updateStatus(orderId, newStatus);
      alert('Order status updated successfully');
      loadOrders();
      if (selectedOrder && selectedOrder.id === orderId) {
        const updatedOrder = await orderService.getById(orderId);
        setSelectedOrder(updatedOrder);
      }
    } catch (error: any) {
      alert('Failed to update order status: ' + error.message);
    }
  };

  const handleEditOrder = async (order: Order) => {
    try {
      const fullOrder = await orderService.getById(order.id);
      setEditingOrder(fullOrder);
    } catch (error: any) {
      alert('Failed to load order details: ' + error.message);
    }
  };

  const handleSaveOrderEdit = async (
    orderId: string,
    items: Array<{ productId: string; quantity: number; unitPrice: number }>
  ) => {
    try {
      await orderService.updateItems(orderId, items);
      alert('Order updated successfully');
      loadOrders();
      setEditingOrder(null);
    } catch (error: any) {
      throw error; // Re-throw to be handled by modal
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-TN', {
      style: 'currency',
      currency: 'TND',
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'PROCESSING':
        return 'bg-blue-100 text-blue-800';
      case 'SHIPPED':
        return 'bg-purple-100 text-purple-800';
      case 'DELIVERED':
        return 'bg-green-100 text-green-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilterStatus('');
    setPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Order Management</h1>
          <p className="text-gray-600 mt-1">View and manage customer orders</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by order number, customer name, email..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="flex items-center space-x-2">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="PROCESSING">Processing</option>
              <option value="SHIPPED">Shipped</option>
              <option value="DELIVERED">Delivered</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
            {(searchTerm || filterStatus) && (
              <button
                onClick={clearFilters}
                className="px-3 py-2 text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50"
                title="Clear filters"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
            <p className="text-gray-600">No orders match your search criteria</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Items
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-gray-900">
                          #{order.orderNumber}
                        </div>
                        <div className="text-sm text-gray-500">{order.paymentMethod}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="flex items-center gap-2">
                          {order.user?.companyName ? (
                            <Building2 className="w-4 h-4 text-gray-400" />
                          ) : (
                            <User className="w-4 h-4 text-gray-400" />
                          )}
                          <span className="font-medium text-gray-900">
                            {order.user?.companyName || order.customerName}
                          </span>
                        </div>
                        <div className="text-sm text-gray-500">{order.customerEmail}</div>
                        {order.user?.customerType && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 mt-1">
                            {order.user.customerType}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-900">
                        {order._count?.items || order.items?.length || 0} items
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-gray-900">
                        {formatCurrency(Number(order.totalAmount))}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <Calendar className="w-4 h-4" />
                        {formatDate(order.createdAt)}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {order.status === 'PENDING' && (
                          <button
                            onClick={() => handleEditOrder(order)}
                            className="inline-flex items-center px-3 py-1.5 text-sm text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            title="Edit Order"
                          >
                            <Edit className="w-4 h-4 mr-1" />
                            Edit
                          </button>
                        )}
                        <button
                          onClick={() => handleViewOrder(order)}
                          className="inline-flex items-center px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center space-x-2">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <span className="text-gray-600">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}

      {/* Order Edit Modal */}
      {editingOrder && (
        <OrderEditModal
          order={editingOrder}
          onClose={() => setEditingOrder(null)}
          onSave={handleSaveOrderEdit}
        />
      )}

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Order #{selectedOrder.orderNumber}</h2>
                <p className="text-blue-100 text-sm">{formatDate(selectedOrder.createdAt)}</p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Customer Info */}
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Name</label>
                    <p className="text-gray-900">{selectedOrder.customerName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Email</label>
                    <p className="text-gray-900">{selectedOrder.customerEmail}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Phone</label>
                    <p className="text-gray-900">{selectedOrder.customerPhone}</p>
                  </div>
                  {selectedOrder.user?.companyName && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">Company</label>
                      <p className="text-gray-900">{selectedOrder.user.companyName}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Order Items */}
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Items</h3>
                <div className="space-y-3">
                  {selectedOrder.items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{item.productName}</p>
                        {item.selectedSize && (
                          <p className="text-sm text-gray-600">Size: {item.selectedSize}</p>
                        )}
                        <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">{formatCurrency(Number(item.totalPrice))}</p>
                        <p className="text-sm text-gray-600">{formatCurrency(Number(item.unitPrice))} each</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Order Totals */}
                <div className="mt-4 pt-4 border-t border-gray-200 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="text-gray-900">{formatCurrency(Number(selectedOrder.subtotal))}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tax</span>
                    <span className="text-gray-900">{formatCurrency(Number(selectedOrder.taxAmount))}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-200">
                    <span>Total</span>
                    <span>{formatCurrency(Number(selectedOrder.totalAmount))}</span>
                  </div>
                </div>
              </div>

              {/* Status Update */}
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Update Status</h3>
                <div className="flex gap-2 flex-wrap">
                  {['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'].map((status) => (
                    <button
                      key={status}
                      onClick={() => handleUpdateStatus(selectedOrder.id, status)}
                      disabled={selectedOrder.status === status}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        selectedOrder.status === status
                          ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="border-t border-gray-200 bg-gray-50 px-6 py-4 flex justify-end">
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
