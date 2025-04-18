import React, { useState, useEffect } from "react";
import { X, Download, ExternalLink, AlertCircle } from "lucide-react";
import fileService from "../../../shared/api/file-service";
import apiClient from "../../../shared/api/api-client";
import { showToast, TOAST_TYPES } from "../../../shared/utils/toast";

const FileViewer = ({ file, publicToken = null, onClose }) => {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fileInfo, setFileInfo] = useState(file || null);
  const [mimeType, setMimeType] = useState(null);
  
  useEffect(() => {
    const fetchFileContent = async () => {
      try {
        setLoading(true);
        setError(null);
        
        let fileData;
        let contentType;
        
        if (publicToken) {
          // If we don't have file info yet, fetch it first
          if (!fileInfo) {
            try {
              const infoResponse = await fetch(`${apiClient.getBaseUrl()}/files/public/${publicToken}/info`);
              if (infoResponse.ok) {
                const info = await infoResponse.json();
                setFileInfo(info);
              }
            } catch (infoError) {
              console.error("Error fetching file info:", infoError);
              // Continue anyway, as we can still try to get the file
            }
          }
          
          // Fetch by public token
          const response = await fetch(`${apiClient.getBaseUrl()}/files/public/${publicToken}?inline=true`);
          if (!response.ok) throw new Error("Failed to load file");
          
          // Get content type from response headers
          contentType = response.headers.get('content-type');
          if (contentType) {
            setMimeType(contentType);
          }
          
          fileData = await response.blob();
        } else if (file) {
          // Fetch by file ID
          const { url, headers } = fileService.downloadFile(file.id);
          const response = await fetch(url, { 
            method: 'GET',
            headers: headers 
          });
          if (!response.ok) throw new Error("Failed to load file");
          
          // Get content type from response headers
          contentType = response.headers.get('content-type');
          if (contentType) {
            setMimeType(contentType);
          }
          
          fileData = await response.blob();
        } else {
          throw new Error("No file specified");
        }
        
        // If we have a blob with a type, and no mime type yet, use the blob's type
        if (fileData.type && !mimeType) {
          setMimeType(fileData.type);
        }
        
        // Create an object URL for the blob
        const objectUrl = URL.createObjectURL(fileData);
        setContent(objectUrl);
      } catch (error) {
        console.error("Error loading file:", error);
        setError(error.message || "Failed to load file content");
      } finally {
        setLoading(false);
      }
    };
    
    fetchFileContent();
    
    // Cleanup function to revoke the object URL when component unmounts
    return () => {
      if (content) {
        URL.revokeObjectURL(content);
      }
    };
  }, [file, publicToken]);
  
  const handleDownload = () => {
    if (!content) return;
    
    const link = document.createElement('a');
    link.href = content;
    link.download = fileInfo?.name || 'download';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showToast("File downloaded successfully", TOAST_TYPES.SUCCESS);
  };
  
  const getFileType = () => {
    // Use the mime type we detected from the response or blob
    const currentMimeType = mimeType || (fileInfo?.mimeType || '');
    
    console.log("Detected MIME type:", currentMimeType);
    
    if (currentMimeType.startsWith('image/')) return 'image';
    if (currentMimeType === 'application/pdf') return 'pdf';
    if (currentMimeType.startsWith('text/')) return 'text';
    if (currentMimeType.startsWith('video/')) return 'video';
    if (currentMimeType.startsWith('audio/')) return 'audio';
    
    return 'unknown';
  };
  
  const renderFileContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      );
    }
    
    if (error) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-red-500 p-8 text-center">
          <AlertCircle size={48} className="mb-4" />
          <h3 className="text-lg font-medium mb-2">Error Loading File</h3>
          <p>{error}</p>
        </div>
      );
    }
    
    if (!content) return null;
    
    const fileType = getFileType();
    console.log("Determined file type:", fileType);
    
    switch (fileType) {
      case 'image':
        return (
          <div className="flex items-center justify-center h-full bg-gray-800">
            <img 
              src={content} 
              alt={fileInfo?.name || 'Image preview'} 
              className="max-w-full max-h-full object-contain"
            />
          </div>
        );
        
      case 'pdf':
        return (
          <iframe 
            src={content} 
            className="w-full h-full border-0" 
            title={fileInfo?.name || 'PDF preview'}
          ></iframe>
        );
        
      case 'text':
        return (
          <iframe 
            src={content} 
            className="w-full h-full border-0" 
            title={fileInfo?.name || 'Text preview'}
          ></iframe>
        );
        
      case 'video':
        return (
          <div className="flex items-center justify-center h-full bg-black">
            <video 
              src={content} 
              controls 
              className="max-w-full max-h-full" 
              autoPlay={false}
            >
              Your browser does not support the video tag.
            </video>
          </div>
        );
        
      case 'audio':
        return (
          <div className="flex flex-col items-center justify-center h-full p-8">
            <h3 className="text-lg font-medium mb-4">{fileInfo?.name || 'Audio file'}</h3>
            <audio 
              src={content} 
              controls 
              className="w-full max-w-md" 
              autoPlay={false}
            >
              Your browser does not support the audio tag.
            </audio>
          </div>
        );
        
      default:
        return (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <AlertCircle size={48} className="mb-4 text-yellow-500" />
            <h3 className="text-lg font-medium mb-2">Preview Not Available</h3>
            <p className="mb-4">This file type ({mimeType || 'unknown'}) cannot be previewed in the browser.</p>
            <button
              onClick={handleDownload}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded flex items-center"
            >
              <Download size={18} className="mr-2" />
              Download File
            </button>
          </div>
        );
    }
  };
  
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-800 opacity-75"></div>
        </div>
        
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-5xl sm:w-full">
          {/* Header */}
          <div className="bg-gray-100 px-4 py-3 flex justify-between items-center border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 truncate">
              {fileInfo?.name || 'File Preview'}
            </h3>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleDownload}
                className="p-2 text-gray-500 hover:text-gray-700 focus:outline-none"
                title="Download"
              >
                <Download size={20} />
              </button>
              <button
                onClick={onClose}
                className="p-2 text-gray-500 hover:text-gray-700 focus:outline-none"
                title="Close"
              >
                <X size={20} />
              </button>
            </div>
          </div>
          
          {/* Content */}
          <div className="bg-white h-[calc(100vh-12rem)]">
            {renderFileContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileViewer;