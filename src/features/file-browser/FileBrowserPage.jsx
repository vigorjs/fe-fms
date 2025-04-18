import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router";
import fileService from "../../shared/api/file-service";
import FolderBreadcrumb from "./components/FolderBreadcrumb";
import FileList from "./components/FileList";
import FolderList from "./components/FolderList";
import StorageInfo from "./components/StorageInfo";
import FileActions from "./components/FileActions";
import { FolderOpen, Loader } from "lucide-react";

const FileBrowserPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentFolder, setCurrentFolder] = useState(null);
  const [folderPath, setFolderPath] = useState([]);
  const [files, setFiles] = useState([]);
  const [folders, setFolders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [storageInfo, setStorageInfo] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Get folder ID from query params
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const folderId = searchParams.get("folderId");
    setCurrentFolder(folderId ? parseInt(folderId) : null);
  }, [location.search]);

  // Load storage info
  useEffect(() => {
    const loadStorageInfo = async () => {
      try {
        const info = await fileService.getStorageInfo();
        setStorageInfo(info);
      } catch (error) {
        console.error("Failed to load storage info:", error);
      }
    };

    loadStorageInfo();
  }, [refreshTrigger]);

  // Load folder contents
  useEffect(() => {
    const loadFolderContents = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await fileService.getFolderContents(currentFolder);
        setFiles(result.files || []);
        setFolders(result.folders || []);
        
        // Build the folder path
        if (currentFolder) {
          loadFolderPath(currentFolder);
        } else {
          setFolderPath([{ id: null, name: "My Drive" }]);
        }
      } catch (error) {
        console.error("Failed to load folder contents:", error);
        setError("Failed to load folder contents. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    loadFolderContents();
  }, [currentFolder, refreshTrigger]);

  // Load folder path for breadcrumbs using the new API
  const loadFolderPath = async (folderId) => {
    try {
      const result = await fileService.getFolderPath(folderId);
      setFolderPath(result.path);
    } catch (error) {
      console.error("Failed to load folder path:", error);
      // Fallback to a simple path with just the current folder
      setFolderPath([
        { id: null, name: "My Drive" },
        { id: folderId, name: `Folder ${folderId}` }
      ]);
    }
  };

  // Navigate to a folder
  const navigateToFolder = (folderId) => {
    if (folderId === null) {
      navigate("/files");
    } else {
      navigate(`/files?folderId=${folderId}`);
    }
  };

  // Handle selection of items
  const toggleSelectItem = (item, type) => {
    const itemId = `${type}-${item.id}`;
    
    if (selectedItems.some(i => i.id === itemId)) {
      setSelectedItems(selectedItems.filter(i => i.id !== itemId));
    } else {
      setSelectedItems([...selectedItems, { id: itemId, item, type }]);
    }
  };

  // Clear all selections
  const clearSelection = () => {
    setSelectedItems([]);
  };

  // Refresh the current view
  const refreshView = () => {
    setRefreshTrigger(prev => prev + 1);
    clearSelection();
  };

  return (
    <div className="p-6">
      <div className="flex items-center mb-6">
        <FolderOpen className="h-8 w-8 text-blue-600 mr-2" />
        <h1 className="text-2xl font-bold text-gray-800">My Drive</h1>
      </div>
      
      {/* Storage Info Card */}
      {storageInfo && (
        <div className="mb-6">
          <StorageInfo storageInfo={storageInfo} />
        </div>
      )}
      
      {/* Actions Toolbar */}
      <div className="mb-6">
        <FileActions 
          selectedItems={selectedItems}
          currentFolder={currentFolder}
          onRefresh={refreshView}
          onClearSelection={clearSelection}
        />
      </div>
      
      {/* Breadcrumb Navigation */}
      <div className="mb-6">
        <FolderBreadcrumb 
          path={folderPath} 
          onNavigate={navigateToFolder} 
        />
      </div>
      
      {/* Error Display */}
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm">{error}</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Content Area */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {loading ? (
          <div className="p-12 flex flex-col items-center justify-center text-gray-500">
            <Loader className="h-8 w-8 animate-spin mb-4" />
            <p>Loading content...</p>
          </div>
        ) : (
          <div>
            {/* Folders */}
            {folders.length > 0 && (
              <div className="border-b">
                <FolderList 
                  folders={folders}
                  selectedItems={selectedItems}
                  onNavigate={navigateToFolder}
                  onToggleSelect={(folder) => toggleSelectItem(folder, 'folder')}
                />
              </div>
            )}
            
            {/* Files */}
            <FileList
              files={files}
              selectedItems={selectedItems}
              onToggleSelect={(file) => toggleSelectItem(file, 'file')}
              onRefresh={refreshView}
            />
            
            {/* Empty State */}
            {folders.length === 0 && files.length === 0 && (
              <div className="p-12 text-center text-gray-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z" />
                </svg>
                <p className="text-lg font-medium mb-2">This folder is empty</p>
                <p className="text-sm mb-4">Upload files or create a new folder to get started</p>
                <div className="flex justify-center space-x-4">
                  <button className="px-4 py-2 bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 transition-colors font-medium text-sm">
                    Upload Files
                  </button>
                  <button className="px-4 py-2 bg-green-50 text-green-700 rounded-md hover:bg-green-100 transition-colors font-medium text-sm">
                    Create Folder
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FileBrowserPage;