import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router";
import fileService from "../../shared/api/file-service";
import FolderBreadcrumb from "./components/FolderBreadcrumb";
import FileList from "./components/FileList";
import FolderList from "./components/FolderList";
import StorageInfo from "./components/StorageInfo";
import FileActions from "./components/FileActions";

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
          buildFolderPath(currentFolder);
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

  // Build folder path for breadcrumbs
  const buildFolderPath = async (folderId) => {
    const path = [{ id: null, name: "My Drive" }];
    let currentId = folderId;
    
    // This is a simplified approach - in a real app, you'd fetch the full path in one go
    try {
      while (currentId) {
        // Find the folder in the loaded folders first
        let folder = folders.find(f => f.id === currentId);
        
        // If not found, fetch it
        if (!folder) {
          // This is a placeholder - you'd need to add a method to get a single folder by ID
          // For now, we'll just add the ID for demonstration
          folder = { id: currentId, name: `Folder ${currentId}` };
        }
        
        path.unshift(folder);
        currentId = folder.parentId;
      }
    } catch (error) {
      console.error("Error building folder path:", error);
    }
    
    setFolderPath([{ id: null, name: "My Drive" }, ...path.slice(1)]);
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
    <div className="container px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">My Drive</h1>
      
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
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
          <p>{error}</p>
        </div>
      )}
      
      {/* Content Area */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-4 text-center">
            <p>Loading...</p>
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
              <div className="p-8 text-center text-gray-500">
                <p className="mb-4">This folder is empty</p>
                <p>Upload files or create a new folder to get started</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FileBrowserPage;