import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router";
import fileService from "../api/file-service";
import {
  Home,
  Users,
  HardDrive,
  FolderOpen,
  Folder,
  ChevronRight,
  ChevronDown,
  Upload,
  PlusCircle,
} from "lucide-react";

const Sidebar = ({ user }) => {
  const location = useLocation();
  const [folders, setFolders] = useState([]);
  const [isLoadingFolders, setIsLoadingFolders] = useState(false);
  const [showFolders, setShowFolders] = useState(true);
  const [error, setError] = useState(null);
  
  // Check if current path is active
  const isActive = (path) => {
    if (path === "/dashboard") {
      return location.pathname === "/dashboard" || location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };
  
  // Get style for active menu item
  const getNavItemClass = (path) => {
    return `flex items-center py-2 px-4 rounded-md text-sm font-medium transition-colors ${
      isActive(path)
        ? "bg-blue-50 text-blue-700"
        : "text-gray-700 hover:bg-gray-100"
    }`;
  };
  
  // Load top-level folders when My Drive is active
  useEffect(() => {
    if (isActive("/files")) {
      loadFolders();
    }
  }, [location]);
  
  // Function to load folders
  const loadFolders = async () => {
    try {
      setIsLoadingFolders(true);
      setError(null);
      const result = await fileService.getFolderContents(null); // Get root folders
      setFolders(result.folders || []);
    } catch (error) {
      console.error("Failed to load folders:", error);
      setError("Failed to load folders");
    } finally {
      setIsLoadingFolders(false);
    }
  };

  return (
    <div className="w-64 bg-white rounded-lg shadow-md overflow-hidden">
      {/* User info section */}
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-800">Dashboard</h2>
        <p className="text-sm text-gray-500">Welcome, {user.name}</p>
      </div>

      {/* Navigation with fixed height and scroll */}
      <nav className="p-2 h-[calc(100vh-16rem)] overflow-y-auto">
        <ul className="space-y-1">
          {/* Dashboard link */}
          <li>
            <Link to="/dashboard" className={getNavItemClass("/dashboard")}>
              <Home size={18} className="mr-2" />
              <span>Dashboard</span>
            </Link>
          </li>

          {/* User Management - only for admins */}
          {(user.role === "ADMIN" || user.role === "SUPER_ADMIN") && (
            <li>
              <Link to="/users" className={getNavItemClass("/users")}>
                <Users size={18} className="mr-2" />
                <span>User Management</span>
              </Link>
            </li>
          )}

          {/* My Drive with expandable folders */}
          <li className="space-y-1">
            <div className="flex items-center justify-between">
              <Link to="/files" className={getNavItemClass("/files")}>
                <HardDrive size={18} className="mr-2" />
                <span>My Drive</span>
              </Link>
              {isActive("/files") && (
                <button
                  onClick={() => setShowFolders(!showFolders)}
                  className="p-1 hover:bg-gray-200 rounded-full"
                >
                  {showFolders ? (
                    <ChevronDown size={16} />
                  ) : (
                    <ChevronRight size={16} />
                  )}
                </button>
              )}
            </div>

            {/* Folder list when My Drive is active */}
            {isActive("/files") && showFolders && (
              <div className="ml-6 mt-1 space-y-1">
                {isLoadingFolders ? (
                  <div className="text-xs text-gray-500 py-1 px-2">
                    Loading folders...
                  </div>
                ) : error ? (
                  <div className="text-xs text-red-500 py-1 px-2">{error}</div>
                ) : folders.length > 0 ? (
                  <>
                    {/* Create new folder button */}
                    <Link
                      to="/files"
                      className="flex items-center py-1.5 px-3 rounded text-xs font-medium text-gray-700 hover:bg-gray-100"
                    >
                      <PlusCircle size={14} className="mr-2 text-green-600" />
                      <span>New Folder</span>
                    </Link>
                    
                    {/* Upload file button */}
                    <Link
                      to="/files"
                      className="flex items-center py-1.5 px-3 rounded text-xs font-medium text-gray-700 hover:bg-gray-100"
                    >
                      <Upload size={14} className="mr-2 text-blue-600" />
                      <span>Upload File</span>
                    </Link>
                    
                    {/* Divider */}
                    <div className="border-t border-gray-200 my-1"></div>
                    
                    {/* List all root folders */}
                    {folders.map((folder) => (
                      <Link
                        key={folder.id}
                        to={`/files?folderId=${folder.id}`}
                        className={`flex items-center py-1.5 px-3 rounded text-xs font-medium ${
                          location.search === `?folderId=${folder.id}`
                            ? "bg-blue-50 text-blue-700"
                            : "text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        <Folder size={14} className="mr-2" />
                        <span className="truncate">{folder.name}</span>
                      </Link>
                    ))}
                  </>
                ) : (
                  <div className="text-xs text-gray-500 py-1 px-2">
                    No folders found
                  </div>
                )}
              </div>
            )}
          </li>
        </ul>
      </nav>
      
      {/* Footer with account info */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-medium">
            {user.name?.charAt(0) || user.email?.charAt(0) || "U"}
          </div>
          <div className="ml-2 overflow-hidden">
            <p className="text-sm font-medium text-gray-800 truncate">
              {user.name || user.email}
            </p>
            <p className="text-xs text-gray-500 truncate">{user.role}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;