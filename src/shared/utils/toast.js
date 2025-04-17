/**
 * Simple toast notification system
 */

// Toast types
export const TOAST_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  INFO: 'info',
  WARNING: 'warning'
};

// Keep track of active toasts
let toasts = [];
let toastCounter = 0;

// Create container for toasts if needed
const ensureToastContainer = () => {
  let toastContainer = document.getElementById('toast-container');
  
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'toast-container';
    toastContainer.style.position = 'fixed';
    toastContainer.style.top = '20px';
    toastContainer.style.right = '20px';
    toastContainer.style.zIndex = '9999';
    document.body.appendChild(toastContainer);
  }
  
  return toastContainer;
};

// Remove a toast
const removeToast = (id) => {
  const toastElement = document.getElementById(`toast-${id}`);
  if (toastElement) {
    toastElement.classList.add('toast-fade-out');
    
    // Clear the timer if it exists
    const toast = toasts.find(t => t.id === id);
    if (toast && toast.timer) {
      clearTimeout(toast.timer);
    }
    
    setTimeout(() => {
      toastElement.remove();
      toasts = toasts.filter(t => t.id !== id);
    }, 500);
  }
};

// Public function to hide a toast
export const hideToast = (id) => {
  removeToast(id);
};

// Create a toast message
export const showToast = (message, type = TOAST_TYPES.INFO, duration = 5000) => {
  const container = ensureToastContainer();
  const id = toastCounter++;
  
  // Create toast element
  const toast = document.createElement('div');
  toast.id = `toast-${id}`;
  toast.className = 'toast-notification toast-fade-in';
  toast.style.padding = '12px 16px';
  toast.style.borderRadius = '4px';
  toast.style.marginBottom = '10px';
  toast.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
  toast.style.display = 'flex';
  toast.style.justifyContent = 'space-between';
  toast.style.alignItems = 'center';
  toast.style.animation = 'toast-fade-in 0.3s ease-out';
  toast.style.maxWidth = '350px';
  toast.style.wordBreak = 'break-word';
  
  // Set style based on type
  switch (type) {
    case TOAST_TYPES.SUCCESS:
      toast.style.backgroundColor = '#10b981';
      toast.style.color = 'white';
      break;
    case TOAST_TYPES.ERROR:
      toast.style.backgroundColor = '#ef4444';
      toast.style.color = 'white';
      break;
    case TOAST_TYPES.WARNING:
      toast.style.backgroundColor = '#f59e0b';
      toast.style.color = 'white';
      break;
    case TOAST_TYPES.INFO:
    default:
      toast.style.backgroundColor = '#3b82f6';
      toast.style.color = 'white';
      break;
  }
  
  // Create content
  const content = document.createElement('div');
  content.textContent = message;
  content.style.flex = '1';
  
  // Create close button
  const closeButton = document.createElement('button');
  closeButton.innerHTML = '&times;';
  closeButton.style.marginLeft = '10px';
  closeButton.style.backgroundColor = 'transparent';
  closeButton.style.border = 'none';
  closeButton.style.color = 'inherit';
  closeButton.style.fontSize = '20px';
  closeButton.style.cursor = 'pointer';
  closeButton.onclick = () => removeToast(id);
  
  // Add elements to toast
  toast.appendChild(content);
  toast.appendChild(closeButton);
  
  // Add toast to container
  container.appendChild(toast);
  
  // Store toast
  toasts.push({ id, timer: setTimeout(() => removeToast(id), duration) });
  
  // Add CSS for animations
  if (!document.getElementById('toast-styles')) {
    const style = document.createElement('style');
    style.id = 'toast-styles';
    style.textContent = `
      @keyframes toast-fade-in {
        from { opacity: 0; transform: translateY(-20px); }
        to { opacity: 1; transform: translateY(0); }
      }
      
      @keyframes toast-fade-out {
        from { opacity: 1; transform: translateY(0); }
        to { opacity: 0; transform: translateY(-20px); }
      }
      
      .toast-fade-in {
        animation: toast-fade-in 0.3s ease-out forwards;
      }
      
      .toast-fade-out {
        animation: toast-fade-out 0.3s ease-out forwards;
      }
    `;
    document.head.appendChild(style);
  }
  
  return id;
};

// Extract error message from API errors
export const getErrorMessage = (error) => {
  if (!error) return 'An unknown error occurred';
  
  // Check if it's an API error with a response
  if (error.response && error.response.data) {
    return error.response.data.error || error.response.data.message || error.message;
  }
  
  // Check if it has a message property
  if (error.message) {
    // Handle specific error types
    if (error.message.includes('Network Error')) {
      return 'Network error. Please check your connection.';
    }
    
    // Extract error message from nested structure if present
    const match = error.message.match(/"error":"([^"]+)"/);
    if (match && match[1]) {
      return match[1];
    }
    
    return error.message;
  }
  
  // Handle string errors
  if (typeof error === 'string') {
    return error;
  }
  
  // Fallback
  return 'An error occurred';
};

// Show error toast with extracted message
export const showErrorToast = (error) => {
  showToast(getErrorMessage(error), TOAST_TYPES.ERROR);
};