import { useState, useEffect } from 'react';
import { useFileSystem } from '../context/FileSystemContext';
import { Clock, FileText, Trash2, File, FolderOpen } from 'lucide-react';
import '../styles/RecentFiles.css';

const RecentFiles = () => {
  const { openFile, findNodeById, fileTree } = useFileSystem();
  const [recentFiles, setRecentFiles] = useState([]);

  useEffect(() => {
    // Load recent files from localStorage
    const saved = localStorage.getItem('recentFiles');
    if (saved) {
      const recentIds = JSON.parse(saved);
      // Validate that files still exist
      const validFiles = recentIds
        .map(id => findNodeById(fileTree, id))
        .filter(file => file !== null);
      setRecentFiles(validFiles);
    }
  }, [fileTree]);

  const addToRecent = (file) => {
    const saved = localStorage.getItem('recentFiles');
    let recentIds = saved ? JSON.parse(saved) : [];
    
    // Remove if already exists
    recentIds = recentIds.filter(id => id !== file.id);
    
    // Add to beginning
    recentIds.unshift(file.id);
    
    // Keep only last 20
    recentIds = recentIds.slice(0, 20);
    
    localStorage.setItem('recentFiles', JSON.stringify(recentIds));
    
    const validFiles = recentIds
      .map(id => findNodeById(fileTree, id))
      .filter(f => f !== null);
    setRecentFiles(validFiles);
  };

  const handleOpenFile = (file) => {
    openFile(file);
    addToRecent(file);
  };

  const clearRecent = () => {
    if (confirm('Clear all recent files?')) {
      localStorage.removeItem('recentFiles');
      setRecentFiles([]);
    }
  };

  const removeFromRecent = (fileId) => {
    const saved = localStorage.getItem('recentFiles');
    if (saved) {
      let recentIds = JSON.parse(saved);
      recentIds = recentIds.filter(id => id !== fileId);
      localStorage.setItem('recentFiles', JSON.stringify(recentIds));
      
      const validFiles = recentIds
        .map(id => findNodeById(fileTree, id))
        .filter(f => f !== null);
      setRecentFiles(validFiles);
    }
  };

  const getFileIcon = (file) => {
    if (file.fileType?.includes('pdf')) {
      return <FileText size={18} className="file-icon-pdf" />;
    }
    return <File size={18} className="file-icon-default" />;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min${diffMins !== 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    
    return date.toLocaleDateString();
  };

  const getFileSize = (size) => {
    if (!size) return '';
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="recent-files-panel">
      <div className="recent-header">
        <div className="header-title">
          <Clock size={20} />
          <h3>Recent Files</h3>
        </div>
        {recentFiles.length > 0 && (
          <button onClick={clearRecent} className="clear-btn" title="Clear all">
            <Trash2 size={16} />
          </button>
        )}
      </div>

      <div className="recent-content">
        {recentFiles.length === 0 ? (
          <div className="recent-empty">
            <Clock size={48} />
            <p>No recent files</p>
            <p className="empty-hint">Files you open will appear here</p>
          </div>
        ) : (
          <div className="recent-list">
            {recentFiles.map(file => (
              <div
                key={file.id}
                className="recent-item"
                onClick={() => handleOpenFile(file)}
              >
                <div className="recent-item-icon">
                  {getFileIcon(file)}
                </div>
                
                <div className="recent-item-info">
                  <div className="recent-item-name">{file.name}</div>
                  <div className="recent-item-meta">
                    <span className="recent-date">
                      {formatDate(file.lastModified || file.createdAt)}
                    </span>
                    {file.size && (
                      <>
                        <span className="meta-separator">•</span>
                        <span className="recent-size">{getFileSize(file.size)}</span>
                      </>
                    )}
                  </div>
                </div>

                <button
                  className="remove-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFromRecent(file.id);
                  }}
                  title="Remove from recent"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RecentFiles;
