import React from "react";
import fileService from "../../../shared/api/file-service";
import { HardDrive, AlertCircle } from "lucide-react";

const StorageInfo = ({ storageInfo }) => {
  const { storageQuota, storageUsed, usagePercentage } = storageInfo;
  
  // Progress bar color based on usage
  const getProgressColor = (percentage) => {
    if (percentage < 70) return "bg-blue-500";
    if (percentage < 90) return "bg-yellow-500";
    return "bg-red-500";
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md p-4 border border-gray-100">
      <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
        <div className="flex items-center">
          <HardDrive className="h-6 w-6 text-blue-500 mr-3" />
          <div>
            <h3 className="text-lg font-medium text-gray-900">Storage</h3>
            <p className="text-sm text-gray-600">
              {fileService.formatFileSize(storageUsed)} of {fileService.formatFileSize(storageQuota)} used
            </p>
          </div>
        </div>
        
        <div className="w-full md:w-1/2 lg:w-2/3">
          <div className="flex items-center mb-1 justify-between">
            <span className="text-xs font-medium text-gray-500">{usagePercentage}% used</span>
            {usagePercentage > 85 && (
              <div className="flex items-center text-amber-600 text-xs">
                <AlertCircle className="h-4 w-4 mr-1" />
                <span>Storage almost full</span>
              </div>
            )}
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className={`${getProgressColor(usagePercentage)} h-2.5 rounded-full transition-all duration-500 ease-in-out`} 
              style={{ width: `${usagePercentage}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StorageInfo;