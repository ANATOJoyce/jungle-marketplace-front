import React, { useEffect } from 'react';
import { FiCheckCircle, FiAlertCircle, FiX } from 'react-icons/fi';

type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
  message: string;
  type: ToastType;
  duration?: number;
  onClose: () => void;
}

export const Toast = ({ message, type, duration = 3000, onClose }: ToastProps) => {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const icons = {
    success: <FiCheckCircle className="text-green-500" size={20} />,
    error: <FiAlertCircle className="text-red-500" size={20} />,
    info: <FiAlertCircle className="text-blue-500" size={20} />,
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-white shadow-lg rounded-lg border border-gray-200 flex items-center p-4 min-w-[300px]">
        <div className="mr-3">{icons[type]}</div>
        <div className="flex-1">{message}</div>
        <button onClick={onClose} className="ml-4 text-gray-500 hover:text-gray-700">
          <FiX size={18} />
        </button>
      </div>
    </div>
  );
};