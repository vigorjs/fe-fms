import React, { useState, useRef } from "react";
import fileService from "../../../shared/api/file-service";
import { showToast, showErrorToast, TOAST_TYPES } from "../../../shared/utils/toast";
import { FileImage, FileVideo, FileText, FileMusic, FileIcon } from "lucide-react";
import ModalWrapper from "./ModalWrapper";

const UploadFileModal = ({ currentFolderId, onClose, onSuccess }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [customName, setCustomName] = useState("");
  const [accessLevel, setAccessLevel] = useState("PUBLIC"); // Default to PUBLIC
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState("");
  const [showPreviewInfo, setShowPreviewInfo] = useState(false);
  const fileInputRef = useRef(null);
  
  // Handle file selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    
    if (!file) {
      setSelectedFile(null);
      setCustomName("");
      return;
    }
    
    setSelectedFile(file);
    setCustomName(file.name); // Pre-fill with original filename
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedFile) {
      setError("Please select a file to upload");
      return;
    }
    
    setIsUploading(true);
    setError("");
    
    try {
      // Prepare filename
      const name = customName.trim() || selectedFile.name;
      
      // Upload the file
      await fileService.uploadFile(selectedFile, {
        name,
        folderId: currentFolderId,
        accessLevel // Add the access level option
      });
      
      showToast(`File "${name}" uploaded successfully!`, TOAST_TYPES.SUCCESS);
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error uploading file:", error);
      setError(error.response?.data?.error || error.message || "Failed to upload file. Please try again.");
      showErrorToast(error);
    } finally {
      setIsUploading(false);
    }
  };
  
  // Trigger file input click
  const handleBrowseClick = () => {
    fileInputRef.current.click();
  };
  
  return (
    <ModalWrapper onClose={onClose}>
      <div className="bg-white rounded-lg w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Upload File</h2>
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
            <label className="block text-gray-700 mb-2">
              Select File
            </label>
            <div className="flex items-center">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                disabled={isUploading}
              />
              <button
                type="button"
                onClick={handleBrowseClick}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded"
                disabled={isUploading}
              >
                Browse...
              </button>
              <span className="ml-3 text-sm text-gray-600 truncate">
                {selectedFile ? selectedFile.name : "No file selected"}
              </span>
            </div>
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 mb-2" htmlFor="customName">
              File Name (optional)
            </label>
            <input
              type="text"
              id="customName"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter file name"
              disabled={isUploading || !selectedFile}
            />
            <p className="text-xs text-gray-500 mt-1">
              Leave blank to use the original filename
            </p>
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">
              Access Level
            </label>
            <div className="flex space-x-2">
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
                  disabled={isUploading}
                />
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
                  disabled={isUploading}
                />
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
                  disabled={isUploading}
                />
                <div>
                  <p className="font-medium">Public</p>
                  <p className="text-xs text-gray-500">Anyone with the link can access</p>
                </div>
              </label>
            </div>
          </div>
          
          <div className="mb-4">
            <div className="flex justify-between items-center">
              <button 
                type="button"
                onClick={() => setShowPreviewInfo(!showPreviewInfo)} 
                className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
              >
                {showPreviewInfo ? "Hide preview information" : "Show supported preview formats"}
              </button>
            </div>
            
            {showPreviewInfo && (
              <div className="mt-2 p-3 bg-blue-50 rounded-md">
                <p className="text-sm font-medium mb-2">Supported preview formats:</p>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center">
                    <FileImage size={18} className="text-purple-500 mr-2" />
                    <span className="text-xs">Images (JPG, PNG, GIF, etc.)</span>
                  </div>
                  <div className="flex items-center">
                    <FileVideo size={18} className="text-red-500 mr-2" />
                    <span className="text-xs">Videos (MP4, WebM, etc.)</span>
                  </div>
                  <div className="flex items-center">
                    <FileIcon size={18} className="text-orange-500 mr-2" />
                    <span className="text-xs">PDF documents</span>
                  </div>
                  <div className="flex items-center">
                    <FileText size={18} className="text-blue-500 mr-2" />
                    <span className="text-xs">Text files (TXT, HTML, etc.)</span>
                  </div>
                  <div className="flex items-center">
                    <FileMusic size={18} className="text-yellow-500 mr-2" />
                    <span className="text-xs">Audio files (MP3, WAV, etc.)</span>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {isUploading && (
            <div className="mb-4">
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-blue-600 h-2.5 rounded-full" 
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <p className="text-xs text-center mt-1">{uploadProgress}% uploaded</p>
            </div>
          )}
          
          <div className="flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded mr-2"
              disabled={isUploading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              disabled={isUploading || !selectedFile}
            >
              {isUploading ? "Uploading..." : "Upload"}
            </button>
          </div>
        </form>
      </div>
    </ModalWrapper>
  );
};

export default UploadFileModal;