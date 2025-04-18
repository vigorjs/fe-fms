import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router";
import { HardDrive, FileIcon, AlertCircle, ExternalLink } from "lucide-react";
import FileViewer from "./components/FileViewer";
import fileService from "../../shared/api/file-service";
import apiClient from "../../shared/api/api-client";

const PublicFileViewPage = () => {
  const { token } = useParams();
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchFileInfo = async () => {
      try {
        setLoading(true);
        
        // First try to get file metadata
        try {
          const data = await fileService.getPublicFileInfo(token);
          console.log("File info successfully fetched:", data);
          setFile(data);
        } catch (infoError) {
          console.warn("Could not get file info, will try direct access:", infoError);
          
          // If we can't get the info but the file might still be accessible,
          // at least set a minimal file object
          setFile({ 
            publicToken: token,
            accessLevel: 'PUBLIC'
          });
        }
      } catch (error) {
        console.error("Error fetching file:", error);
        setError(error.message || "Failed to load file");
      } finally {
        setLoading(false);
      }
    };
    
    if (token) {
      fetchFileInfo();
    }
  }, [token]);
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-5">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
        <p className="text-gray-600">Loading file...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-5">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 mb-2">File Not Available</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <p className="text-gray-500 text-sm mb-4">
            The file you're trying to access may have been deleted, moved, or the link has expired.
          </p>
          <Link 
            to="/login" 
            className="inline-flex items-center text-blue-600 hover:text-blue-800"
          >
            <FileIcon className="h-4 w-4 mr-2" />
            Go to file management
          </Link>
        </div>
      </div>
    );
  }
  
  // If we have file info but no viewer is needed yet, show the file information
  if (file && !file.viewerOpen) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-5">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <div className="flex items-center justify-center mb-6">
            <HardDrive className="h-12 w-12 text-blue-500" />
          </div>
          
          <h1 className="text-2xl font-bold text-gray-800 text-center mb-6">Shared File</h1>
          
          <div className="mb-6">
            <div className="flex items-center p-4 border rounded-lg mb-4 bg-gray-50">
              <div className="mr-4">
                {file.mimeType && fileService.getFileIcon(file.mimeType) === 'image' ? (
                  <FileIcon className="h-10 w-10 text-purple-500" />
                ) : file.mimeType && fileService.getFileIcon(file.mimeType) === 'file-text' ? (
                  <FileIcon className="h-10 w-10 text-blue-500" />
                ) : (
                  <FileIcon className="h-10 w-10 text-gray-500" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-lg font-medium text-gray-900 truncate">{file.name || "Shared File"}</h2>
                {file.size && (
                  <p className="text-sm text-gray-500">{fileService.formatFileSize(file.size)}</p>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex justify-center space-x-4">
            <button
              onClick={() => setFile({ ...file, viewerOpen: true })}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded inline-flex items-center"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              View File
            </button>
            
            <a
              href={`${apiClient.getBaseUrl()}/files/public/${token}`}
              download={file.name || "download"}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded inline-flex items-center"
            >
              <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download
            </a>
          </div>
        </div>
      </div>
    );
  }
  
  // Render the file viewer if needed
  return (
    <div className="min-h-screen bg-gray-100">
      {file && file.viewerOpen && (
        <FileViewer 
          file={file}
          publicToken={token}
          onClose={() => setFile({ ...file, viewerOpen: false })}
        />
      )}
    </div>
  );
};

export default PublicFileViewPage;