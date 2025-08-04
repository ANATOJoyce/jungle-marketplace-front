import React from 'react';

type Status = 'active' | 'inactive' | 'pending' | 'success' | 'error';

interface StatusBadgeProps {
  status: Status;
  children: React.ReactNode;
}

const statusColors = {
  active: 'bg-green-100 text-green-800',
  inactive: 'bg-gray-100 text-gray-800',
  pending: 'bg-yellow-100 text-yellow-800',
  success: 'bg-blue-100 text-blue-800',
  error: 'bg-red-100 text-red-800',
};

export const StatusBadge = ({ status, children }: StatusBadgeProps) => (
  <span
    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[status]}`}
  >
    {children}
  </span>
);