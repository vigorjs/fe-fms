import React, { useState, useEffect } from "react";
import fileService from "../../../shared/api/file-service";
import { showToast, showErrorToast, TOAST_TYPES } from "../../../shared/utils/toast";

const ShareFileModal = ({ file, onClose, onSuccess }) => {
  const [email, setEmail] = useState("");
  const [permission, setPermission] = useState("VIEW");
  const [publicLink, setPublicLink] = useState("");
  const [isSharing, setIsSharing] = useState(false);
  const [isGeneratingLink, setIsGeneratingLink] = useState(false);
  const [error, setError] = useState("");
  const [shareSuccess, setShareSuccess] = useState(false);
  
  // Check if file is already public
  useEffect(() => {
    if (file && file.accessLevel === 'PUBLIC' && file.publicToken) {
      setPublicLink(fileService.getPublicFileUrl(file.publicToken));
    }
  }, [file]);
  
  // Focus email input on mount
  useEffect(() => {
    // Clear any previous errors when the modal opens
    setError("");
    setShareSuccess(false);
  }, []);
  
  // Handle sharing with user
  const handleShareWithUser = async (e) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setError("Email address is required");
      return;
    }
    
    setIsSharing(true);
    setError("");
    
    try {
      await fileService.shareFile(file.id, email.trim(), permission);
      setShareSuccess(true);
      setEmail("");
      showToast(`File shared with ${email.trim()} successfully`, TOAST_TYPES.SUCCESS);
      
      // After successful share, refresh the file data
      onSuccess();
    } catch (error) {
      console.error("Error sharing file:", error);
      setError(error.response?.data?.error || error.message || "Failed to share file. Please try again.");
      showErrorToast(error);
    } finally {
      setIsSharing(false);
    }
  };
  
  // Handle generating a public link
  const handleCreatePublicLink = async () => {
    setIsGeneratingLink(true);
    setError("");
    
    try {
      const result = await fileService.createPublicLink(file.id);
      setPublicLink(fileService.getPublicFileUrl(result.publicToken));
      showToast("Public link created successfully", TOAST_TYPES.SUCCESS);
      
      // After generating link, refresh the file data
      onSuccess();
    } catch (error) {
      console.error("Error creating public link:", error);
      setError(error.response?.data?.error || error.message || "Failed to create public link. Please try again.");
      showErrorToast(error);
    } finally {
      setIsGeneratingLink(false);
    }
  };
  
  // Copy public link to clipboard
  const handleCopyLink = () => {
    navigator.clipboard.writeText(publicLink)
      .then(() => {
        showToast("Link copied to clipboard!", TOAST_TYPES.SUCCESS);
      })
      .catch(error => {
        console.error("Failed to copy link:", error);
        showErrorToast("Failed to copy link to clipboard");
      });
  };
  
  return (
    <div className="fixed inset-0 z-10 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Share File</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="mb-4 p-3 bg-gray-100 rounded">
          <h3 className="font-medium">{file.name}</h3>
          <p className="text-sm text-gray-600">{fileService.formatFileSize(file.size)}</p>
        </div>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}
        
        {shareSuccess && (
          <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
            File shared successfully!
          </div>
        )}
        
        <div className="mb-6">
          <h3 className="font-medium mb-2">Share with people</h3>
          <form onSubmit={handleShareWithUser}>
            <div className="flex mb-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-l focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter email address"
                disabled={isSharing}
              />
              <select
                value={permission}
                onChange={(e) => setPermission(e.target.value)}
                className="px-3 py-2 border border-l-0 border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isSharing}
              >
                <option value="VIEW">View</option>
                <option value="EDIT">Edit</option>
                <option value="MANAGE">Manage</option>
              </select>
              <button
                type="submit"
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-r"
                disabled={isSharing || !email.trim()}
              >
                {isSharing ? "Sharing..." : "Share"}
              </button>
            </div>
          </form>
        </div>
        
        <div className="mb-4">
          <h3 className="font-medium mb-2">Get link</h3>
          
          {publicLink ? (
            <div className="flex items-center">
              <input
                type="text"
                value={publicLink}
                readOnly
                className="flex-1 px-3 py-2 border border-gray-300 rounded-l focus:outline-none"
              />
              <button
                onClick={handleCopyLink}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-r"
              >
                Copy
              </button>
            </div>
          ) : (
            <button
              onClick={handleCreatePublicLink}
              className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded"
              disabled={isGeneratingLink}
            >
              {isGeneratingLink ? "Generating..." : "Generate public link"}
            </button>
          )}
          
          <p className="text-xs text-gray-500 mt-1">
            Anyone with this link can access the file
          </p>
        </div>
      </div>
    </div>
  );
};

export default ShareFileModal;