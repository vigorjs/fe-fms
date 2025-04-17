import React from "react";

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
              className={isFolderSelected(folder.id) ? "bg-blue-50" : "hover:bg-gray-50"}
            >
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded"
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
                <div className="flex items-center">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-5 w-5 mr-2 text-yellow-500" 
                    viewBox="0 0 20 20" 
                    fill="currentColor"
                  >
                    <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1H8a3 3 0 00-3 3v1.5a1.5 1.5 0 01-3 0V6z" clipRule="evenodd" />
                    <path d="M6 12a2 2 0 012-2h8a2 2 0 012 2v2a2 2 0 01-2 2H2h2a2 2 0 002-2v-2z" />
                  </svg>
                  <div className="ml-2">
                    <div className="text-sm font-medium text-gray-900">
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