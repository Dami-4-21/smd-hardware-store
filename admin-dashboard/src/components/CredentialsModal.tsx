import { X, Copy, Check, Mail } from 'lucide-react';
import { useState } from 'react';

interface CredentialsModalProps {
  credentials: {
    username: string;
    password: string;
    email: string;
  };
  customerName: string;
  onClose: () => void;
}

export default function CredentialsModal({ credentials, customerName, onClose }: CredentialsModalProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Customer Account Created!</h2>
            <p className="text-sm text-gray-600 mt-1">Customer: {customerName}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Success Message */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start">
              <Mail className="w-5 h-5 text-green-600 mt-0.5 mr-3" />
              <div>
                <h3 className="font-semibold text-green-900">Email Sent Successfully</h3>
                <p className="text-sm text-green-700 mt-1">
                  Login credentials have been automatically sent to <strong>{credentials.email}</strong>
                </p>
              </div>
            </div>
          </div>

          {/* Credentials Display */}
          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6">
            <h3 className="font-semibold text-blue-900 mb-4 text-lg">Login Credentials</h3>
            
            <div className="space-y-4">
              {/* Username */}
              <div>
                <label className="block text-sm font-medium text-blue-900 mb-2">
                  Username
                </label>
                <div className="flex items-center space-x-2">
                  <div className="flex-1 bg-white px-4 py-3 rounded-lg border border-blue-300 font-mono text-lg text-gray-900">
                    {credentials.username}
                  </div>
                  <button
                    onClick={() => copyToClipboard(credentials.username, 'username')}
                    className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    title="Copy username"
                  >
                    {copiedField === 'username' ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      <Copy className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-blue-900 mb-2">
                  Password
                </label>
                <div className="flex items-center space-x-2">
                  <div className="flex-1 bg-white px-4 py-3 rounded-lg border border-blue-300 font-mono text-lg text-gray-900">
                    {credentials.password}
                  </div>
                  <button
                    onClick={() => copyToClipboard(credentials.password, 'password')}
                    className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    title="Copy password"
                  >
                    {copiedField === 'password' ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      <Copy className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-blue-900 mb-2">
                  Email
                </label>
                <div className="flex items-center space-x-2">
                  <div className="flex-1 bg-white px-4 py-3 rounded-lg border border-blue-300 font-mono text-lg text-gray-900">
                    {credentials.email}
                  </div>
                  <button
                    onClick={() => copyToClipboard(credentials.email, 'email')}
                    className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    title="Copy email"
                  >
                    {copiedField === 'email' ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      <Copy className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Important Notice */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="font-semibold text-yellow-900 mb-2">⚠️ Important</h4>
            <ul className="text-sm text-yellow-800 space-y-1 list-disc list-inside">
              <li>Save these credentials securely before closing this window</li>
              <li>The password will not be shown again</li>
              <li>Customer has been notified via email</li>
              <li>Recommend customer to change password after first login</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
