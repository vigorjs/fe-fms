import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

const ConfirmationModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = 'Confirm Action', 
  message, 
  confirmText = 'Confirm', 
  cancelText = 'Cancel',
  type = 'warning' // 'warning', 'danger', 'info'
}) => {
  if (!isOpen) return null;

  // Get appropriate colors based on type
  let headerBgColor, headerTextColor, iconColor, confirmBtnColor;
  
  switch (type) {
    case 'danger':
      headerBgColor = 'bg-red-100';
      headerTextColor = 'text-red-800';
      iconColor = 'text-red-500';
      confirmBtnColor = 'bg-red-600 hover:bg-red-700 focus:ring-red-500';
      break;
    case 'info':
      headerBgColor = 'bg-blue-100';
      headerTextColor = 'text-blue-800';
      iconColor = 'text-blue-500';
      confirmBtnColor = 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500';
      break;
    case 'warning':
    default:
      headerBgColor = 'bg-yellow-100';
      headerTextColor = 'text-yellow-800';
      iconColor = 'text-yellow-500';
      confirmBtnColor = 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500';
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        {/* Modal panel */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          {/* Header */}
          <div className={`${headerBgColor} ${headerTextColor} px-4 py-3 flex justify-between items-center sm:px-6`}>
            <div className="flex items-center">
              <AlertTriangle className={`${iconColor} h-5 w-5 mr-2`} />
              <h3 className="text-lg leading-6 font-medium">{title}</h3>
            </div>
            <button 
              onClick={onClose} 
              className="text-gray-400 hover:text-gray-500 focus:outline-none"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          {/* Content */}
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                <div className="mt-2">
                  <p className="text-sm text-gray-500">{message}</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Actions */}
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 ${confirmBtnColor} text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm`}
              onClick={() => {
                onConfirm();
                onClose();
              }}
            >
              {confirmText}
            </button>
            <button
              type="button"
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              onClick={onClose}
            >
              {cancelText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;