import React, { useState } from "react";
import fileService from "../../../shared/api/file-service";
import CreateFolderModal from "./CreateFolderModal";
import UploadFileModal from "./UploadFileModal";
import ShareFileModal from "./ShareFileModal";

const FileActions = ({ selectedItems, currentFolder, onRefresh, onClearSelection }) => {
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [showUploadFile, setShowUploadFile] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  
  // Count selected files and folders
  const selectedFiles = selectedItems.filter(item => item.type === 'file');
  const selectedFolders = selectedItems.filter(item => item.type === 'folder');
  
  // Handle delete action
  const handleDelete = async () => {
    if (selectedItems.length === 0) return;
    
    if (!confirm(`Are you sure you want to delete ${selectedItems.length} item(s)?`)) {
      return;
    }
    
    try {
      // Delete selected files
      for (const item of selectedFiles) {
        await fileService.deleteFile(item.item.id);
      }
      
      // Delete selected folders
      for (const item of selectedFolders) {
        await fileService.deleteFolder(item.item.id);
      }
      
      onRefresh();
      onClearSelection();
    } catch (error) {
      console.error("Error deleting items:", error);
      alert("An error occurred while deleting items. Please try again.");
    }
  };
  
  // Handle share action (only for single file)
  const handleShare = () => {
    if (selectedFiles.length !== 1) {
      alert("Please select a single file to share.");
      return;
    }
    
    setShowShareModal(true);
  };
  
  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        onClick={() => setShowCreateFolder(true)}
        className="flex items-center bg-white hover:bg-gray-100 text-gray-800 font-semibold py-2 px-4 border border-gray-400 rounded shadow"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V8z" clipRule="evenodd" />
        </svg>
        New Folder
      </button>
      
      <button
        onClick={() => setShowUploadFile(true)}
        className="flex items-center bg-blue-500 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded shadow"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
        </svg>
        Upload
      </button>
      
      {/* Actions on selected items */}
      {selectedItems.length > 0 && (
        <>
          <div className="ml-auto flex items-center">
            <span className="mr-4 text-sm text-gray-600">
              {selectedItems.length} item{selectedItems.length !== 1 ? 's' : ''} selected
            </span>
            
            <button
              onClick={onClearSelection}
              className="text-gray-600 hover:text-gray-900 font-medium py-2 px-3 rounded"
            >
              Clear
            </button>
            
            <button
              onClick={handleShare}
              disabled={selectedFiles.length !== 1}
              className={`flex items-center font-medium py-2 px-3 rounded mr-2 ${
                selectedFiles.length === 1 
                  ? 'text-green-600 hover:text-green-900' 
                  : 'text-gray-400 cursor-not-allowed'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
              </svg>
              Share
            </button>
            
            <button
              onClick={handleDelete}
              className="flex items-center text-red-600 hover:text-red-900 font-medium py-2 px-3 rounded"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              Delete
            </button>
          </div>
        </>
      )}
      
      {/* Refresh button always shown */}
      <button
        onClick={onRefresh}
        className="ml-2 text-gray-600 hover:text-gray-900 p-2 rounded-full"
        title="Refresh"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
        </svg>
      </button>
      
      {/* Modals */}
      {showCreateFolder && (
        <CreateFolderModal
          currentFolderId={currentFolder}
          onClose={() => setShowCreateFolder(false)}
          onSuccess={onRefresh}
        />
      )}
      
      {showUploadFile && (
        <UploadFileModal
          currentFolderId={currentFolder}
          onClose={() => setShowUploadFile(false)}
          onSuccess={onRefresh}
        />
      )}
      
      {showShareModal && selectedFiles.length === 1 && (
        <ShareFileModal
          file={selectedFiles[0].item}
          onClose={() => setShowShareModal(false)}
          onSuccess={onRefresh}
        />
      )}
    </div>
  );
};

export default FileActions;