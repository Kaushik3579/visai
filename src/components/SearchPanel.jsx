import { useState, useMemo } from 'react';
import { useDocuments } from '../context/DocumentContext';
import { Search, FileText, X, Calendar, Clock } from 'lucide-react';
import '../styles/SearchPanel.css';

const SearchPanel = () => {
  const { documents, openDocument } = useDocuments();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredDocuments = useMemo(() => {
    if (!searchQuery.trim()) {
      return documents;
    }
    
    const query = searchQuery.toLowerCase();
    return documents.filter(doc => 
      doc.name.toLowerCase().includes(query)
    );
  }, [documents, searchQuery]);

  const handleDocumentClick = (doc) => {
    openDocument(doc);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    
    return formatDate(dateString);
  };

  return (
    <div className="search-panel">
      <div className="search-header">
        <h3>Citation Engine</h3>
      </div>

      <div className="search-input-container">
        <div className="search-input-wrapper">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            placeholder="Search your papers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
            autoFocus
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="clear-search"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      <div className="search-results">
        {documents.length === 0 ? (
          <div className="search-empty">
            <FileText size={48} />
            <p>No papers yet</p>
            <p className="search-hint">Create a document to get started</p>
          </div>
        ) : filteredDocuments.length === 0 ? (
          <div className="search-empty">
            <Search size={48} />
            <p>No results found</p>
            <p className="search-hint">Try a different search term</p>
          </div>
        ) : (
          <div className="documents-list">
            <div className="results-count">
              {filteredDocuments.length} paper{filteredDocuments.length !== 1 ? 's' : ''}
            </div>
            
            {filteredDocuments.map(doc => (
              <div
                key={doc.id}
                className="document-item"
                onClick={() => handleDocumentClick(doc)}
              >
                <div className="document-icon">
                  <FileText size={16} />
                </div>
                <div className="document-info">
                  <div className="document-name">{doc.name}</div>
                  <div className="document-meta">
                    <span className="meta-item">
                      <Calendar size={12} />
                      {formatDate(doc.createdAt)}
                    </span>
                    <span className="meta-item">
                      <Clock size={12} />
                      {formatTime(doc.updatedAt)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPanel;
