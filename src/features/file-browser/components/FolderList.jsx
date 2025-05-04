import React, { useState } from "react";
import { Folder, FolderOpen, MoreVertical } from "lucide-react";
import ItemContextMenu from "./ItemContextMenu";
import fileService from "../../../shared/api/file-service";
import { showToast, showErrorToast, TOAST_TYPES } from "../../../shared/utils/toast";

const FolderList = ({ folders, selectedItems, onNavigate, onToggleSelect, onRefresh }) => {
  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, folder: null });
  
  // Helper to check if folder is selected
  const isFolderSelected = (folderId) => {
    return selectedItems.some(item => item.id === `folder-${folderId}`);
  };

  // Show context menu
  const handleContextMenu = (e, folder) => {
    e.preventDefault();
    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      folder
    });
  };
  
  // Close context menu
  const closeContextMenu = () => {
    setContextMenu({ visible: false, x: 0, y: 0, folder: null });
  };
  
  // Handle folder rename
  const handleRename = async (folderId, newName) => {
    try {
      await fileService.renameFolder(folderId, newName);
      onRefresh();
      showToast("Folder renamed successfully", TOAST_TYPES.SUCCESS);
    } catch (error) {
      console.error("Error renaming folder:", error);
      showErrorToast(error);
    }
  };
  
  // Handle folder access level change
  const handleChangeAccessLevel = async (folderId, newAccessLevel) => {
    try {
      await fileService.updateFolderAccessLevel(folderId, newAccessLevel);
      onRefresh();
      showToast("Folder access level updated", TOAST_TYPES.SUCCESS);
    } catch (error) {
      console.error("Error updating folder access level:", error);
      showErrorToast(error);
    }
  };
  
  // Handle folder deletion
  const handleDelete = async (folderId) => {
    try {
      await fileService.deleteFolder(folderId);
      onRefresh();
      showToast("Folder deleted successfully", TOAST_TYPES.SUCCESS);
    } catch (error) {
      console.error("Error deleting folder:", error);
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
              Modified
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Access
            </th>
            <th scope="col" className="w-12 px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {folders.map((folder) => (
            <tr 
              key={folder.id} 
              className={isFolderSelected(folder.id) ? "bg-blue-50" : "hover:bg-gray-50 transition-colors duration-150"}
              onContextMenu={(e) => handleContextMenu(e, folder)}
            >
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    checked={isFolderSelected(folder.id)}
                    onChange={() => onToggleSelect(folder)}
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              </td>
              <td 
                className="px-6 py-4 whitespace-nowrap cursor-pointer"
                onClick={() => onNavigate(folder.id)}
              >
                <div className="flex items-center group">
                  <div className="flex-shrink-0 mr-3 group-hover:text-yellow-600 transition-colors duration-150">
                    {isFolderSelected(folder.id) ? 
                      <FolderOpen size={20} className="text-yellow-600" /> :
                      <Folder size={20} className="text-yellow-500" />
                    }
                  </div>
                  <div className="ml-1">
                    <div className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors duration-150">
                      {folder.name}
                    </div>
                    <div className="text-xs text-gray-500">
                      Folder
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {new Date(folder.updatedAt).toLocaleString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                  ${folder.accessLevel === 'PRIVATE' ? 'bg-gray-100 text-gray-800' : 
                    folder.accessLevel === 'SHARED' ? 'bg-blue-100 text-blue-800' : 
                    'bg-green-100 text-green-800'}`}>
                  {folder.accessLevel}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleContextMenu(e, folder);
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <MoreVertical size={16} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      {/* Context Menu */}
      {contextMenu.visible && (
        <ItemContextMenu
          item={contextMenu.folder}
          type="folder"
          position={{ x: contextMenu.x, y: contextMenu.y }}
          onClose={closeContextMenu}
          onDelete={handleDelete}
          onRename={handleRename}
          onChangeAccessLevel={handleChangeAccessLevel}
        />
      )}
    </div>
  );
};

export default FolderList;