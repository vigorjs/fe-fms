import React, { useState } from "react";
import { showToast, showErrorToast, TOAST_TYPES } from "../../../shared/utils/toast";
import { Lock, UserPlus, Globe } from "lucide-react";
import ModalWrapper from "./ModalWrapper";

const AccessLevelModal = ({ item, type, onClose, onChangeAccessLevel }) => {
  const [accessLevel, setAccessLevel] = useState(item.accessLevel || "PRIVATE");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (accessLevel === item.accessLevel) {
      onClose();
      return;
    }
    
    setIsSubmitting(true);
    setError("");
    
    try {
      onChangeAccessLevel(accessLevel);
      showToast(`${type.charAt(0).toUpperCase() + type.slice(1)} access level updated`, TOAST_TYPES.SUCCESS);
    } catch (error) {
      console.error(`Error updating ${type} access level:`, error);
      setError(error.response?.data?.error || error.message || `Failed to update ${type} access level. Please try again.`);
      showErrorToast(error);
      setIsSubmitting(false);
    }
  };
  
  return (
    <ModalWrapper onClose={onClose}>
      <div className="bg-white rounded-lg w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Change Access Level</h2>
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
          <div className="mb-6">
            <label className="block text-gray-700 mb-2">
              Access Level
            </label>
            <div className="space-y-3">
              <label className={`flex items-center p-3 border rounded cursor-pointer transition-colors duration-200 ease-in-out
                  ${accessLevel === 'PRIVATE' ? 'bg-gray-100 border-gray-400' : 'border-gray-200 hover:bg-gray-50'}`}
              >
                <input
                  type="radio"
                  name="accessLevel"
                  value="PRIVATE"
                  checked={accessLevel === "PRIVATE"}
                  onChange={() => setAccessLevel("PRIVATE")}
                  className="mr-2"
                  disabled={isSubmitting}
                />
                <Lock size={18} className="mr-3 text-gray-600" />
                <div>
                  <p className="font-medium">Private</p>
                  <p className="text-xs text-gray-500">Only you can access</p>
                </div>
              </label>
              
              <label className={`flex items-center p-3 border rounded cursor-pointer transition-colors duration-200 ease-in-out
                  ${accessLevel === 'SHARED' ? 'bg-blue-50 border-blue-300' : 'border-gray-200 hover:bg-gray-50'}`}
              >
                <input
                  type="radio"
                  name="accessLevel"
                  value="SHARED"
                  checked={accessLevel === "SHARED"}
                  onChange={() => setAccessLevel("SHARED")}
                  className="mr-2"
                  disabled={isSubmitting}
                />
                <UserPlus size={18} className="mr-3 text-blue-600" />
                <div>
                  <p className="font-medium">Shared</p>
                  <p className="text-xs text-gray-500">Share with specific users</p>
                </div>
              </label>
              
              <label className={`flex items-center p-3 border rounded cursor-pointer transition-colors duration-200 ease-in-out
                  ${accessLevel === 'PUBLIC' ? 'bg-green-50 border-green-300' : 'border-gray-200 hover:bg-gray-50'}`}
              >
                <input
                  type="radio"
                  name="accessLevel"
                  value="PUBLIC"
                  checked={accessLevel === "PUBLIC"}
                  onChange={() => setAccessLevel("PUBLIC")}
                  className="mr-2"
                  disabled={isSubmitting}
                />
                <Globe size={18} className="mr-3 text-green-600" />
                <div>
                  <p className="font-medium">Public</p>
                  <p className="text-xs text-gray-500">Anyone with the link can access</p>
                </div>
              </label>
            </div>
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

export default AccessLevelModal;