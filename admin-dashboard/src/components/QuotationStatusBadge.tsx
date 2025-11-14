import { Clock, CheckCircle, XCircle, AlertCircle, FileText, ShoppingCart } from 'lucide-react';

interface QuotationStatusBadgeProps {
  status: 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'DECLINED' | 'EXPIRED' | 'CONVERTED_TO_ORDER';
  size?: 'sm' | 'md' | 'lg';
}

export default function QuotationStatusBadge({ status, size = 'md' }: QuotationStatusBadgeProps) {
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3 py-1.5',
  };

  const iconSize = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  const statusConfig = {
    DRAFT: {
      label: 'Draft',
      icon: FileText,
      bgColor: 'bg-gray-100',
      textColor: 'text-gray-700',
      borderColor: 'border-gray-300',
    },
    PENDING_APPROVAL: {
      label: 'Pending Approval',
      icon: Clock,
      bgColor: 'bg-yellow-100',
      textColor: 'text-yellow-800',
      borderColor: 'border-yellow-300',
    },
    APPROVED: {
      label: 'Approved',
      icon: CheckCircle,
      bgColor: 'bg-green-100',
      textColor: 'text-green-800',
      borderColor: 'border-green-300',
    },
    DECLINED: {
      label: 'Declined',
      icon: XCircle,
      bgColor: 'bg-red-100',
      textColor: 'text-red-800',
      borderColor: 'border-red-300',
    },
    EXPIRED: {
      label: 'Expired',
      icon: AlertCircle,
      bgColor: 'bg-orange-100',
      textColor: 'text-orange-800',
      borderColor: 'border-orange-300',
    },
    CONVERTED_TO_ORDER: {
      label: 'Converted to Order',
      icon: ShoppingCart,
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-800',
      borderColor: 'border-blue-300',
    },
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-medium border ${sizeClasses[size]} ${config.bgColor} ${config.textColor} ${config.borderColor}`}
    >
      <Icon className={iconSize[size]} />
      {config.label}
    </span>
  );
}
