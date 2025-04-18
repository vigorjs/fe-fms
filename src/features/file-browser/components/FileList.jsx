import React, { useState } from "react";
import fileService from "../../../shared/api/file-service";
import { showToast, showErrorToast, hideToast, TOAST_TYPES } from "../../../shared/utils/toast";
import FileViewer from "./FileViewer";
import ConfirmationModal from "../../../shared/components/ConfirmationModal";
import { 
  FileIcon, 
  FileImage, 
  FileVideo, 
  FileText, 
  FileSpreadsheet, 
  FileMusic,
  Download,
  Share2,
  Eye,
  Trash2
} from "lucide-react";

const FileList = ({ files, selectedItems, onToggleSelect, onRefresh }) => {
  const [viewingFile, setViewingFile] = useState(null);
  const [deletingFile, setDeletingFile] = useState(null);
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    fileToDelete: null
  });
  
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
        return <FileImage size={18} className="text-purple-500" />;
      case 'video':
        return <FileVideo size={18} className="text-red-500" />;
      case 'file-text':
        return <FileText size={18} className="text-blue-500" />;
      case 'file-spreadsheet':
        return <FileSpreadsheet size={18} className="text-green-500" />;
      case 'music':
        return <FileMusic size={18} className="text-yellow-500" />;
      default:
        return <FileIcon size={18} className="text-gray-500" />;
    }
  };

  // Create public link for a file
  const handleCreatePublicLink = async (file) => {
    try {
      const result = await fileService.createPublicLink(file.id);
      
      // Create full URL for viewing
      const origin = window.location.origin;
      const viewUrl = `${origin}/view/${result.publicToken}`;
      
      // Use a more reliable approach for copying to clipboard
      try {
        // Create a temporary text area element
        const textArea = document.createElement("textarea");
        // Set its value to the URL we want to copy
        textArea.value = viewUrl;
        // Make it invisible
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        textArea.style.top = "-999999px";
        document.body.appendChild(textArea);
        // Focus and select the text
        textArea.focus();
        textArea.select();
        // Execute the copy command
        const successful = document.execCommand("copy");
        // Remove the temporary element
        document.body.removeChild(textArea);
        
        if (successful) {
          showToast("Public link created and copied to clipboard!", TOAST_TYPES.SUCCESS);
        } else {
          // Fallback message if the copy didn't work
          showToast(`Public link created: ${viewUrl}`, TOAST_TYPES.INFO);
        }
      } catch (clipboardError) {
        console.error("Clipboard error:", clipboardError);
        // Fallback message
        showToast(`Public link created: ${viewUrl}`, TOAST_TYPES.INFO);
      }
      
      onRefresh();
    } catch (error) {
      console.error("Error creating public link:", error);
      showErrorToast(error);
    }
  };

  // Open delete confirmation modal
  const showDeleteConfirmation = (file) => {
    setConfirmModal({
      isOpen: true,
      fileToDelete: file
    });
  };

  // Delete a file (after confirmation)
  const confirmDeleteFile = async () => {
    const file = confirmModal.fileToDelete;
    if (!file) return;
    
    try {
      setDeletingFile(file.id);
      
      // Delete the file
      await fileService.deleteFile(file.id);
      
      showToast(`File "${file.name}" deleted successfully`, TOAST_TYPES.SUCCESS);
      onRefresh(); // Refresh the file list
    } catch (error) {
      console.error("Error deleting file:", error);
      showErrorToast(error || "Failed to delete file. Please try again.");
    } finally {
      setDeletingFile(null);
    }
  };

  // Check if file is viewable in browser
  const isViewable = (mimeType) => {
    if (!mimeType) return false;
    
    // Common viewable file types
    return (
      mimeType.startsWith('image/') ||
      mimeType === 'application/pdf' ||
      mimeType.startsWith('text/') ||
      mimeType.startsWith('video/') ||
      mimeType.startsWith('audio/')
    );
  };

  return (
    <>
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
                  {isViewable(file.mimeType) && (
                    <button
                      onClick={() => setViewingFile(file)}
                      className="inline-flex items-center text-indigo-600 hover:text-indigo-900 mr-3 transition-colors"
                      title="View File"
                    >
                      <Eye size={16} className="mr-1" />
                      <span>View</span>
                    </button>
                  )}
                  <button
                    onClick={() => handleDownload(file)}
                    className="inline-flex items-center text-blue-600 hover:text-blue-900 mr-3 transition-colors"
                    title="Download File"
                  >
                    <Download size={16} className="mr-1" />
                    <span>Download</span>
                  </button>
                  <button
                    onClick={() => handleCreatePublicLink(file)}
                    className="inline-flex items-center text-green-600 hover:text-green-900 mr-3 transition-colors"
                    title="Share File"
                  >
                    <Share2 size={16} className="mr-1" />
                    <span>Share</span>
                  </button>
                  <button
                    onClick={() => showDeleteConfirmation(file)}
                    className="inline-flex items-center text-red-600 hover:text-red-900 transition-colors"
                    title="Delete File"
                    disabled={deletingFile === file.id}
                  >
                    <Trash2 size={16} className="mr-1" />
                    <span>{deletingFile === file.id ? "Deleting..." : "Delete"}</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* File Viewer Modal */}
      {viewingFile && (
        <FileViewer 
          file={viewingFile} 
          onClose={() => setViewingFile(null)} 
        />
      )}

      {/* Confirmation Modal for Delete */}
      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        onConfirm={confirmDeleteFile}
        title="Delete File"
        message={`Are you sure you want to delete "${confirmModal.fileToDelete?.name}"? This action cannot be undone and the file will be permanently removed.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />
    </>
  );
};

export default FileList;