import React, { useState, useRef, useEffect } from "react";
import { ChevronRight, Edit, Share2, Shield, Trash2 } from "lucide-react";
import RenameModal from "./RenameModal";
import AccessLevelModal from "./AccessLevelModal";
import ShareModal from "./ShareModal";

const ItemContextMenu = ({ 
  item, 
  type, 
  position, 
  onClose, 
  onDelete, 
  onRename, 
  onShareClick,
  onChangeAccessLevel 
}) => {
  const menuRef = useRef(null);
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [showAccessLevelModal, setShowAccessLevelModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Don't close if any modal is open
      if (showRenameModal || showAccessLevelModal || showShareModal) {
        return;
      }
      
      // Close if click is outside menu and not on a modal
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose, showRenameModal, showAccessLevelModal, showShareModal]);

  // Handle rename completion
  const handleRenameComplete = (newName) => {
    setShowRenameModal(false);
    onRename(item.id, newName);
  };

  // Handle access level change completion
  const handleAccessLevelComplete = (newAccessLevel) => {
    setShowAccessLevelModal(false);
    onChangeAccessLevel(item.id, newAccessLevel);
  };

  // Handle share completion
  const handleShareComplete = () => {
    setShowShareModal(false);
    onClose();
  };

  return (
    <>
      <div 
        ref={menuRef}
        className="absolute bg-white rounded-md shadow-lg py-1 w-48 z-40 border border-gray-200"
        style={{ 
          top: `${position.y}px`, 
          left: `${position.x}px` 
        }}
      >
        <div className="px-3 py-2 border-b border-gray-100">
          <p className="text-xs font-medium text-gray-500">
            {type === 'folder' ? 'Folder' : 'File'} Options
          </p>
        </div>
        
        <button 
          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
          onClick={(e) => {
            e.stopPropagation();
            setShowRenameModal(true);
          }}
        >
          <Edit size={14} className="mr-2" />
          Rename
        </button>
        
        <button 
          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
          onClick={(e) => {
            e.stopPropagation();
            setShowAccessLevelModal(true);
          }}
        >
          <Shield size={14} className="mr-2" />
          Change Access
        </button>
        
        <button 
          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
          onClick={(e) => {
            e.stopPropagation();
            setShowShareModal(true);
          }}
        >
          <Share2 size={14} className="mr-2" />
          Share
        </button>
        
        <button 
          className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(item.id);
            onClose();
          }}
        >
          <Trash2 size={14} className="mr-2" />
          Delete
        </button>
      </div>

      {/* Modals */}
      {showRenameModal && (
        <RenameModal
          item={item}
          type={type}
          onClose={() => setShowRenameModal(false)}
          onRename={handleRenameComplete}
        />
      )}

      {showAccessLevelModal && (
        <AccessLevelModal
          item={item}
          type={type}
          onClose={() => setShowAccessLevelModal(false)}
          onChangeAccessLevel={handleAccessLevelComplete}
        />
      )}

      {showShareModal && (
        <ShareModal
          item={item}
          type={type}
          onClose={() => setShowShareModal(false)}
          onSuccess={handleShareComplete}
        />
      )}
    </>
  );
};

export default ItemContextMenu;
