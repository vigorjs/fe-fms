import React, { useState, useEffect } from "react";
import { showToast, showErrorToast, TOAST_TYPES } from "../../../shared/utils/toast";
import ModalWrapper from "./ModalWrapper";

const RenameModal = ({ item, type, onClose, onRename }) => {
  const [newName, setNewName] = useState(item.name || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  
  // Focus input on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      const input = document.getElementById("rename-input");
      if (input) {
        input.focus();
        input.select();
      }
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!newName.trim()) {
      setError(`${type.charAt(0).toUpperCase() + type.slice(1)} name is required`);
      return;
    }
    
    if (newName.trim() === item.name) {
      onClose();
      return;
    }
    
    setIsSubmitting(true);
    setError("");
    
    try {
      onRename(newName.trim());
      showToast(`${type.charAt(0).toUpperCase() + type.slice(1)} renamed successfully`, TOAST_TYPES.SUCCESS);
    } catch (error) {
      console.error(`Error renaming ${type}:`, error);
      setError(error.response?.data?.error || error.message || `Failed to rename ${type}. Please try again.`);
      showErrorToast(error);
      setIsSubmitting(false);
    }
  };
  
  return (
    <ModalWrapper onClose={onClose}>
      <div className="bg-white rounded-lg w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Rename {type.charAt(0).toUpperCase() + type.slice(1)}</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2" htmlFor="rename-input">
              New Name
            </label>
            <input
              type="text"
              id="rename-input"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={`Enter new ${type} name`}
              disabled={isSubmitting}
            />
          </div>
          
          <div className="flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded mr-2"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </ModalWrapper>
  );
};

export default RenameModal;