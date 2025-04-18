import React from "react";
import { Home, ChevronRight, Folder } from "lucide-react";

const FolderBreadcrumb = ({ path, onNavigate }) => {
  if (!path || path.length === 0) {
    return (
      <div className="flex items-center py-2 px-4 bg-gray-50 rounded-lg border border-gray-200 shadow-sm">
        <Home size={16} className="text-blue-600 mr-2" />
        <span 
          onClick={() => onNavigate(null)}
          className="cursor-pointer hover:text-blue-600 font-medium"
        >
          My Drive
        </span>
      </div>
    );
  }
  
  return (
    <div className="flex items-center py-2 px-4 bg-gray-50 rounded-lg border border-gray-200 shadow-sm overflow-x-auto">
      <div 
        onClick={() => onNavigate(null)}
        className="flex items-center cursor-pointer hover:text-blue-600 transition-colors"
      >
        <Home size={16} className="text-blue-600 mr-2" />
        <span>My Drive</span>
      </div>
      
      {path.slice(1).map((folder, index) => (
        <React.Fragment key={folder.id || index}>
          <ChevronRight size={16} className="mx-2 text-gray-400" />
          <div 
            onClick={() => onNavigate(folder.id)}
            className={`
              flex items-center
              whitespace-nowrap
              cursor-pointer
              hover:text-blue-600
              transition-colors
              ${index === path.length - 2 ? 'font-medium text-blue-700' : ''}
            `}
          >
            <Folder size={16} className="mr-1" />
            <span>{folder.name}</span>
          </div>
        </React.Fragment>
      ))}
    </div>
  );
};

export default FolderBreadcrumb;