import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router";
import { Link } from "react-router";
import searchService from "../../shared/api/search-service";
import fileService from "../../shared/api/file-service";
import { showToast, showErrorToast, TOAST_TYPES } from "../../shared/utils/toast";
import useDebounce from "../../shared/hooks/useDebounce";
import { 
  Search,
  FileIcon, 
  FileImage, 
  FileVideo, 
  FileText, 
  FileSpreadsheet, 
  FileMusic,
  Folder, 
  Loader,
  Download,
  Share2,
  ArrowLeft
} from "lucide-react";

const SearchResultsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState({ items: [], meta: { total: 0 } });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  
  // Debounce search term to reduce API calls while typing
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // Extract search query from URL parameters on initial load
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const query = params.get("q") || "";
    setSearchTerm(query);
  }, [location.search]);

  // Perform search when debounced search term changes
  useEffect(() => {
    if (debouncedSearchTerm) {
      performSearch(debouncedSearchTerm);
    }
  }, [debouncedSearchTerm]);

  // Perform search
  const performSearch = async (query, nextPage = 1) => {
    if (!query.trim()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const results = await searchService.search(query, { page: nextPage, limit: 20 });
      const formattedResults = searchService.formatSearchResults(results);
      
      if (nextPage === 1) {
        setSearchResults(formattedResults);
      } else {
        // Append results for pagination
        setSearchResults(prev => ({
          items: [...prev.items, ...formattedResults.items],
          meta: formattedResults.meta
        }));
      }
      
      setPage(nextPage);
      setHasMore(formattedResults.items.length === 20); // Assuming 20 is the page limit
    } catch (error) {
      console.error("Search error:", error);
      setError("Failed to perform search. Please try again.");
      showErrorToast(error);
    } finally {
      setLoading(false);
    }
  };
  
  // Handle search form submission
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;
    
    // Update URL to match search term without triggering a page reload
    const params = new URLSearchParams(location.search);
    params.set("q", searchTerm);
    navigate(`/search?${params.toString()}`, { replace: true });
    
    // Search is triggered by the useEffect watching debouncedSearchTerm
  };
  
  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    // The debounced version will trigger the search after the delay
  };
  
  // Load more results
  const handleLoadMore = () => {
    if (loading || !hasMore) return;
    performSearch(searchTerm, page + 1);
  };
  
  // Get icon based on mime type for files
  const getFileIcon = (mimeType) => {
    const iconType = fileService.getFileIcon(mimeType);
    
    switch (iconType) {
      case 'image':
        return <FileImage size={18} className="text-purple-500" />;
      case 'video':
        return <FileVideo size={18} className="text-red-500" />;
      case 'file-text':
        return <FileText size={18} className="text-blue-500" />;
      case 'file-spreadsheet':
        return <FileSpreadsheet size={18} className="text-green-500" />;
      case 'music':
        return <FileMusic size={18} className="text-yellow-500" />;
      default:
        return <FileIcon size={18} className="text-gray-500" />;
    }
  };
  
  // Download file
  const handleDownload = async (file) => {
    try {
      // Get file download info
      const { url, headers } = fileService.downloadFile(file.id);
      
      // Show loading toast
      const loadingToastId = showToast(`Downloading ${file.name}...`, TOAST_TYPES.INFO);
      
      // Fetch the file with proper headers
      fetch(url, { 
        method: 'GET',
        headers: headers,
        credentials: 'omit'
      })
        .then(response => {
          if (!response.ok) {
            throw new Error(`Server returned ${response.status}: ${response.statusText}`);
          }
          return response.blob();
        })
        .then(blob => {
          if (blob.size === 0) {
            throw new Error('Downloaded file is empty');
          }
          
          // Create a downloadable link
          const objectUrl = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = objectUrl;
          link.download = file.name;
          document.body.appendChild(link);
          
          // Trigger download
          link.click();
          
          // Clean up
          setTimeout(() => {
            URL.revokeObjectURL(objectUrl);
            document.body.removeChild(link);
          }, 100);
          
          // Hide the loading toast and show success message
          showToast(`Downloaded ${file.name} successfully`, TOAST_TYPES.SUCCESS);
        })
        .catch(error => {
          console.error("Error downloading file:", error);
          showErrorToast(error || "Failed to download file. Please try again.");
        });
    } catch (error) {
      console.error("Error initiating download:", error);
      showErrorToast(error || "Failed to download file. Please try again.");
    }
  };
  
  // Navigate to folder
  const navigateToFolder = (folderId) => {
    navigate(`/files?folderId=${folderId}`);
  };

  return (
    <div className="p-6">
      <div className="flex items-center mb-6">
        <button
          onClick={() => navigate(-1)}
          className="mr-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
          aria-label="Go back"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold text-gray-800">Search Results</h1>
      </div>
      
      {/* Search form */}
      <div className="mb-6">
        <form onSubmit={handleSearchSubmit} className="flex">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={16} className="text-gray-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder="Search files and folders..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
            {searchTerm && !loading && (
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer" onClick={() => setSearchTerm("")}>
                <span className="text-gray-400 hover:text-gray-600">✕</span>
              </div>
            )}
          </div>
          <button
            type="submit"
            className="ml-3 px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            disabled={loading}
          >
            {loading ? (
              <Loader className="h-4 w-4 animate-spin" />
            ) : (
              'Search'
            )}
          </button>
        </form>
      </div>
      
      {/* Results summary */}
      {searchTerm && !loading && searchResults.meta.total > 0 && (
        <div className="mb-4 text-sm text-gray-500">
          Found {searchResults.meta.total} results for "{searchTerm}"
        </div>
      )}
      
      {/* Error display */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}
      
      {/* Results */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading && searchResults.items.length === 0 ? (
          <div className="p-12 flex flex-col items-center justify-center text-gray-500">
            <Loader className="h-8 w-8 animate-spin mb-4" />
            <p>Searching...</p>
          </div>
        ) : searchResults.items.length === 0 && searchTerm ? (
          <div className="p-12 text-center text-gray-500">
            <Search className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p className="text-lg font-medium mb-2">No results found</p>
            <p className="text-sm mb-4">Try different keywords or check your spelling</p>
          </div>
        ) : searchResults.items.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <Search className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p className="text-lg font-medium mb-2">Start typing to search</p>
            <p className="text-sm mb-4">Search for files and folders by name</p>
          </div>
        ) : (
          <div>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Size
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Modified
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {searchResults.items.map((item) => (
                  <tr key={`${item.type}-${item.id}`} className="hover:bg-gray-50 transition-colors duration-150">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {item.type === 'file' ? (
                          getFileIcon(item.mimeType)
                        ) : (
                          <Folder size={18} className="text-yellow-500" />
                        )}
                        <div 
                          className="ml-2 cursor-pointer"
                          onClick={() => {
                            if (item.type === 'folder') {
                              navigateToFolder(item.id);
                            }
                          }}
                        >
                          <div className={`text-sm font-medium ${item.type === 'folder' ? 'text-blue-600 hover:underline' : 'text-gray-900'}`}>
                            {item.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            {item.type === 'file' && item.mimeType}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                      {item.type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.type === 'file' ? fileService.formatFileSize(item.size) : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(item.updatedAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {item.type === 'file' ? (
                        <button
                          onClick={() => handleDownload(item)}
                          className="inline-flex items-center text-blue-600 hover:text-blue-900 transition-colors"
                        >
                          <Download size={16} className="mr-1" />
                          <span>Download</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => navigateToFolder(item.id)}
                          className="inline-flex items-center text-blue-600 hover:text-blue-900 transition-colors"
                        >
                          <span>Open</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {/* Loading indicator for pagination */}
            {loading && page > 1 && (
              <div className="px-6 py-4 bg-gray-50 text-center">
                <Loader className="h-6 w-6 animate-spin mx-auto" />
                <p className="text-sm text-gray-500 mt-2">Loading more results...</p>
              </div>
            )}
            
            {/* Load more button */}
            {hasMore && !loading && (
              <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 text-center">
                <button
                  onClick={handleLoadMore}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Load more results
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchResultsPage;