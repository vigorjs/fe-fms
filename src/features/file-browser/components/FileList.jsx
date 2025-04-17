import React from "react";
import fileService from "../../../shared/api/file-service";
import { showToast, showErrorToast, hideToast, TOAST_TYPES } from "../../../shared/utils/toast";

const FileList = ({ files, selectedItems, onToggleSelect, onRefresh }) => {
  // Helper to check if file is selected
  const isFileSelected = (fileId) => {
    return selectedItems.some(item => item.id === `file-${fileId}`);
  };

  // Download file
  const handleDownload = async (file) => {
    try {
      // Get file download info
      const { url, headers } = fileService.downloadFile(file.id);
      
      // Show loading toast
      const loadingToastId = showToast(`Downloading ${file.name}...`, TOAST_TYPES.INFO);
      
      // Fetch the file with proper headers
      fetch(url, { 
        method: 'GET',
        headers: headers,
        credentials: 'omit'
      })
        .then(response => {
          if (!response.ok) {
            throw new Error(`Server returned ${response.status}: ${response.statusText}`);
          }
          return response.blob();
        })
        .then(blob => {
          if (blob.size === 0) {
            throw new Error('Downloaded file is empty');
          }
          
          // Create a downloadable link
          const objectUrl = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = objectUrl;
          link.download = file.name;
          document.body.appendChild(link);
          
          // Trigger download
          link.click();
          
          // Clean up
          setTimeout(() => {
            URL.revokeObjectURL(objectUrl);
            document.body.removeChild(link);
          }, 100);
          
          // Hide the loading toast and show success message
          hideToast(loadingToastId);
          showToast(`Downloaded ${file.name} successfully (${fileService.formatFileSize(blob.size)})`, TOAST_TYPES.SUCCESS);
        })
        .catch(error => {
          console.error("Error downloading file:", error);
          hideToast(loadingToastId);
          showErrorToast(error || "Failed to download file. Please try again.");
        });
    } catch (error) {
      console.error("Error initiating download:", error);
      showErrorToast(error || "Failed to download file. Please try again.");
    }
  };

  // Get icon based on mime type
  const getFileIcon = (mimeType) => {
    const iconType = fileService.getFileIcon(mimeType);
    
    switch (iconType) {
      case 'image':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-500" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
          </svg>
        );
      case 'video':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
            <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
          </svg>
        );
      case 'file-text':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
          </svg>
        );
      case 'file-spreadsheet':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5 4a3 3 0 00-3 3v6a3 3 0 003 3h10a3 3 0 003-3V7a3 3 0 00-3-3H5zm-1 9v-1h5v2H5a1 1 0 01-1-1zm7 1h4a1 1 0 001-1v-1h-5v2zm0-4h5V8h-5v2zM9 8H4v2h5V8z" clipRule="evenodd" />
          </svg>
        );
      case 'music':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
            <path d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V7.82l8-1.6v5.894A4.37 4.37 0 0015 12c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V3z" />
          </svg>
        );
      default:
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
          </svg>
        );
    }
  };

  // Create public link for a file
  const handleCreatePublicLink = async (file) => {
    try {
      const result = await fileService.createPublicLink(file.id);
      
      // Copy to clipboard
      navigator.clipboard.writeText(window.location.origin + result.url)
        .then(() => {
          showToast("Public link created and copied to clipboard!", TOAST_TYPES.SUCCESS);
        })
        .catch(() => {
          showToast(
            `Public link created: ${window.location.origin + result.url}`,
            TOAST_TYPES.INFO
          );
        });
      
      onRefresh();
    } catch (error) {
      console.error("Error creating public link:", error);
      showErrorToast(error);
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="w-12 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              <span className="sr-only">Select</span>
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Name
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Size
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Modified
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Access
            </th>
            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {files.length === 0 && (
            <tr>
              <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">
                No files in this folder
              </td>
            </tr>
          )}
          
          {files.map((file) => (
            <tr 
              key={file.id} 
              className={isFileSelected(file.id) ? "bg-blue-50" : "hover:bg-gray-50"}
            >
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                    checked={isFileSelected(file.id)}
                    onChange={() => onToggleSelect(file)}
                  />
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  {getFileIcon(file.mimeType)}
                  <div className="ml-2">
                    <div className="text-sm font-medium text-gray-900">
                      {file.name}
                    </div>
                    <div className="text-xs text-gray-500">
                      {file.mimeType}
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {fileService.formatFileSize(file.size)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {new Date(file.updatedAt).toLocaleString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                  ${file.accessLevel === 'PRIVATE' ? 'bg-gray-100 text-gray-800' : 
                    file.accessLevel === 'SHARED' ? 'bg-blue-100 text-blue-800' : 
                    'bg-green-100 text-green-800'}`}>
                  {file.accessLevel}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button
                  onClick={() => handleDownload(file)}
                  className="text-blue-600 hover:text-blue-900 mr-4"
                >
                  Download
                </button>
                <button
                  onClick={() => handleCreatePublicLink(file)}
                  className="text-green-600 hover:text-green-900"
                >
                  Share
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default FileList;