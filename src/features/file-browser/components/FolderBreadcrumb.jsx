import React from "react";

const FolderBreadcrumb = ({ path, onNavigate }) => {
  if (!path || path.length === 0) {
    return (
      <div className="flex items-center py-2 px-4 bg-gray-100 rounded-lg">
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
    <div className="flex items-center py-2 px-4 bg-gray-100 rounded-lg overflow-x-auto">
      {path.map((folder, index) => (
        <React.Fragment key={index}>
          {index > 0 && (
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-4 w-4 mx-2 text-gray-400" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M9 5l7 7-7 7" 
              />
            </svg>
          )}
          <span 
            onClick={() => onNavigate(folder.id)}
            className={`
              whitespace-nowrap
              cursor-pointer
              hover:text-blue-600
              ${index === path.length - 1 ? 'font-medium' : ''}
            `}
          >
            {folder.name}
          </span>
        </React.Fragment>
      ))}
    </div>
  );
};

export default FolderBreadcrumb;