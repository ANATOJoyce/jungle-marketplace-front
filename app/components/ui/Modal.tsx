import React from 'react';
import { FiX } from 'react-icons/fi';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;          // fermeture du modal
  title: string;                // titre du modal
  children: React.ReactNode;    // contenu
  className?: string;           // classes personnalisées pour le contenu
  overlayClassName?: string;    // classes personnalisées pour le fond
}

export const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  className = "",
  overlayClassName = "",
}: ModalProps) => {
  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ${overlayClassName}`}>
      <div className={`bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto ${className}`}>
        <div className="flex justify-between items-center border-b p-4">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <FiX size={24} />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};
