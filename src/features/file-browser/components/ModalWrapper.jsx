import React, { useRef } from "react";

const ModalWrapper = ({ children, onClose, className = "" }) => {
  const backdropRef = useRef(null);
  
  const handleBackdropClick = (e) => {
    if (e.target === backdropRef.current) {
      onClose();
    }
  };
  
  return (
    <div 
      ref={backdropRef}
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 ${className}`}
      onClick={handleBackdropClick}
    >
      <div 
        className="relative"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
};

export default ModalWrapper;