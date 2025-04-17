import React from "react";
import fileService from "../../../shared/api/file-service";

const StorageInfo = ({ storageInfo }) => {
  const { storageQuota, storageUsed, usagePercentage } = storageInfo;
  
  // Progress bar color based on usage
  const getProgressColor = (percentage) => {
    if (percentage < 70) return "bg-blue-500";
    if (percentage < 90) return "bg-yellow-500";
    return "bg-red-500";
  };
  
  return (
    <div className="bg-white rounded-lg shadow p-4 flex flex-col md:flex-row justify-between items-center">
      <div className="mb-4 md:mb-0">
        <h3 className="text-lg font-medium text-gray-900">Storage</h3>
        <p className="text-sm text-gray-600">
          {fileService.formatFileSize(storageUsed)} of {fileService.formatFileSize(storageQuota)} used ({usagePercentage}%)
        </p>
      </div>
      
      <div className="w-full md:w-2/3">
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div 
            className={`${getProgressColor(usagePercentage)} h-2.5 rounded-full`} 
            style={{ width: `${usagePercentage}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default StorageInfo;