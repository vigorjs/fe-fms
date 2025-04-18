// Search API service for files and folders
import apiClient from './api-client';

const searchService = {
  // Search files and folders
  search: (query, options = {}) => {
    const { page = 1, limit = 20 } = options;
    let queryString = `?query=${encodeURIComponent(query)}&page=${page}&limit=${limit}`;
    
    return apiClient.get(`/search${queryString}`);
  },
  
  // Helper function to determine if an item is a file or folder
  getItemType: (item) => {
    if (item.mimeType !== undefined) {
      return 'file';
    }
    return 'folder';
  },
  
  // Helper to format search results for display
  formatSearchResults: (results) => {
    if (!results || (!results.files && !results.folders)) {
      return { items: [], meta: { total: 0 } };
    }
    
    const files = (results.files || []).map(file => ({
      ...file,
      type: 'file'
    }));
    
    const folders = (results.folders || []).map(folder => ({
      ...folder,
      type: 'folder'
    }));
    
    // Combine and sort by relevance or date
    const items = [...files, ...folders].sort((a, b) => 
      new Date(b.updatedAt) - new Date(a.updatedAt)
    );
    
    return {
      items,
      meta: results.meta || { 
        total: items.length,
        page: 1,
        limit: items.length,
        totalPages: 1
      }
    };
  }
};

export default searchService;