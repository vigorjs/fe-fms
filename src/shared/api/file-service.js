// File management API service
import apiClient from './api-client';

const fileService = {
  // Folder operations
  createFolder: (folderData) => {
    return apiClient.post('/files/folders', folderData);
  },
  
  getFolderContents: (folderId = null) => {
    const queryParams = folderId ? `?folderId=${folderId}` : '';
    return apiClient.get(`/files/folders${queryParams}`);
  },
  
  deleteFolder: (folderId) => {
    return apiClient.delete(`/files/folders/${folderId}`);
  },
  
  // File operations
  listFiles: (options = {}) => {
    const { search, mimeType, sortBy, sortOrder, page = 1, limit = 20 } = options;
    let queryString = `?page=${page}&limit=${limit}`;
    
    if (search) queryString += `&search=${encodeURIComponent(search)}`;
    if (mimeType) queryString += `&mimeType=${encodeURIComponent(mimeType)}`;
    if (sortBy) queryString += `&sortBy=${sortBy}`;
    if (sortOrder) queryString += `&sortOrder=${sortOrder}`;
    
    return apiClient.get(`/files/list${queryString}`);
  },
  
  uploadFile: (file, options = {}) => {
    const formData = new FormData();
    formData.append('file', file);
    
    if (options.name) formData.append('name', options.name);
    if (options.folderId) formData.append('folderId', options.folderId);
    
    // Log what we're sending for debugging
    console.log('Uploading file:', {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      options
    });
    
    return apiClient.post('/files/upload', formData, {
      headers: {
        // The Content-Type header should be automatically set by the browser
        // Don't set it manually as it needs to include the boundary
      },
    });
  },
  
  downloadFile: (fileId) => {
    // For direct downloads, we'll use a different approach
    // We'll return the URL that can be used for direct download
    const token = apiClient.getAuthToken();
    return {
      url: `${apiClient.getBaseUrl()}/files/${fileId}/download`,
      headers: { Authorization: `Bearer ${token}` }
    };
  },
  
  deleteFile: (fileId) => {
    return apiClient.delete(`/files/${fileId}`);
  },
  
  // Sharing operations
  shareFile: (fileId, email, permission = 'VIEW') => {
    return apiClient.post('/files/share', { 
      fileId, 
      email, 
      permission 
    });
  },
  
  createPublicLink: (fileId) => {
    return apiClient.post(`/files/${fileId}/public-link`, { fileId });
  },
  
  // Storage info
  getStorageInfo: () => {
    return apiClient.get('/files/storage/info');
  },
  
  // Helper functions
  getPublicFileUrl: (token) => {
    return `${apiClient.getBaseUrl()}/files/public/${token}`;
  },
  
  // File icon helpers
  getFileIcon: (mimeType) => {
    if (!mimeType) return 'file';
    
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.startsWith('audio/')) return 'music';
    if (mimeType.startsWith('text/')) return 'file-text';
    
    if (mimeType === 'application/pdf') return 'file-text';
    if (mimeType.includes('word') || mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') return 'file-text';
    if (mimeType.includes('excel') || mimeType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') return 'file-spreadsheet';
    if (mimeType.includes('powerpoint') || mimeType === 'application/vnd.openxmlformats-officedocument.presentationml.presentation') return 'file-presentation';
    
    return 'file';
  },
  
  formatFileSize: (bytes) => {
    if (bytes === 0) return '0 Bytes';
    
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    
    return `${parseFloat((bytes / Math.pow(1024, i)).toFixed(2))} ${sizes[i]}`;
  }
};

export default fileService;