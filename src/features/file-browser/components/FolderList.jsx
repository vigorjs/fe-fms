import React from "react";
import { Folder, FolderOpen } from "lucide-react";

const FolderList = ({ folders, selectedItems, onNavigate, onToggleSelect }) => {
  // Helper to check if folder is selected
  const isFolderSelected = (folderId) => {
    return selectedItems.some(item => item.id === `folder-${folderId}`);
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
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {folders.map((folder) => (
            <tr 
              key={folder.id} 
              className={isFolderSelected(folder.id) ? "bg-blue-50" : "hover:bg-gray-50 transition-colors duration-150"}
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
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default FolderList;