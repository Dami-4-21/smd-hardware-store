import { Trash2, Eye, Building2, FileText, CheckCircle, XCircle } from 'lucide-react';
import { Customer } from '../services/customerService';

interface CustomerListProps {
  customers: Customer[];
  onView: (customer: Customer) => void;
  onDelete: (customer: Customer) => void;
  loading?: boolean;
}

export default function CustomerList({ customers, onView, onDelete, loading }: CustomerListProps) {
  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="text-gray-600 mt-4">Loading customers...</p>
      </div>
    );
  }

  if (customers.length === 0) {
    return (
      <div className="text-center py-12">
        <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No customers found</h3>
        <p className="text-gray-600">Create your first customer to get started</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Customer
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Company
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              RNE Number
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Type
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Orders
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {customers.map((customer) => (
            <tr key={customer.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4">
                <div>
                  <div className="font-medium text-gray-900">
                    {customer.firstName} {customer.lastName}
                  </div>
                  <div className="text-sm text-gray-500">{customer.email}</div>
                  {customer.phone && (
                    <div className="text-sm text-gray-500">{customer.phone}</div>
                  )}
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center">
                  <Building2 className="w-4 h-4 text-gray-400 mr-2" />
                  <span className="text-sm text-gray-900">{customer.companyName || '-'}</span>
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center">
                  {customer.rnePdfUrl && (
                    <a
                      href={customer.rnePdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 mr-2"
                      title="View RNE Document"
                    >
                      <FileText className="w-4 h-4" />
                    </a>
                  )}
                  <span className="text-sm text-gray-900">{customer.rneNumber || '-'}</span>
                </div>
              </td>
              <td className="px-6 py-4">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {customer.customerType || 'N/A'}
                </span>
              </td>
              <td className="px-6 py-4">
                <span className="text-sm text-gray-900">
                  {customer._count?.orders || 0}
                </span>
              </td>
              <td className="px-6 py-4">
                {customer.isActive ? (
                  <span className="inline-flex items-center text-green-700">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    <span className="text-sm">Active</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center text-red-700">
                    <XCircle className="w-4 h-4 mr-1" />
                    <span className="text-sm">Inactive</span>
                  </span>
                )}
              </td>
              <td className="px-6 py-4 text-right space-x-2">
                <button
                  onClick={() => onView(customer)}
                  className="inline-flex items-center px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="View Details"
                >
                  <Eye className="w-4 h-4 mr-1" />
                  View
                </button>
                <button
                  onClick={() => onDelete(customer)}
                  className="inline-flex items-center px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Delete Customer"
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
