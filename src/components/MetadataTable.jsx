import { useState, useEffect } from 'react';
import { useFileSystem } from '../context/FileSystemContext';
import { 
  Database, 
  FileText, 
  Users, 
  Calendar, 
  BookMarked, 
  Edit, 
  Plus,
  Search,
  Filter,
  X
} from 'lucide-react';
import '../styles/MetadataTable.css';

const MetadataTable = () => {
  const { fileTree, openFile, updateFileMetadata } = useFileSystem();
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editedData, setEditedData] = useState({});
  const [filterType, setFilterType] = useState('all'); // all, hasMetadata, noMetadata

  // Extract all PDF files from the file tree
  const getAllPDFs = (node) => {
    let pdfs = [];
    
    if (node.type === 'file' && node.fileType?.includes('pdf')) {
      pdfs.push(node);
    }
    
    if (node.children) {
      node.children.forEach(child => {
        pdfs = pdfs.concat(getAllPDFs(child));
      });
    }
    
    return pdfs;
  };

  const allPDFs = fileTree ? getAllPDFs(fileTree) : [];

  // Filter PDFs based on search and metadata presence
  const filteredPDFs = allPDFs.filter(pdf => {
    const metadata = pdf.metadata || {};
    
    // Search filter
    const matchesSearch = searchQuery === '' || 
      (metadata.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
       metadata.authors?.toLowerCase().includes(searchQuery.toLowerCase()) ||
       metadata.year?.toString().includes(searchQuery) ||
       pdf.name.toLowerCase().includes(searchQuery.toLowerCase()));
    
    // Metadata presence filter
    let matchesFilter = true;
    if (filterType === 'hasMetadata') {
      matchesFilter = metadata.title || metadata.authors || metadata.year;
    } else if (filterType === 'noMetadata') {
      matchesFilter = !metadata.title && !metadata.authors && !metadata.year;
    }
    
    return matchesSearch && matchesFilter;
  });

  const startEditing = (pdf) => {
    const metadata = pdf.metadata || {};
    setEditingId(pdf.id);
    setEditedData({
      title: metadata.title || '',
      authors: metadata.authors || '',
      year: metadata.year || '',
      journal: metadata.journal || '',
      volume: metadata.volume || '',
      issue: metadata.issue || '',
      pages: metadata.pages || '',
      doi: metadata.doi || ''
    });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditedData({});
  };

  const saveMetadata = async (pdfId) => {
    const success = await updateFileMetadata(pdfId, editedData);
    if (success) {
      setEditingId(null);
      setEditedData({});
    }
  };

  const handleViewPDF = (pdf) => {
    openFile(pdf);
  };

  const getMetadataStatus = (pdf) => {
    const metadata = pdf.metadata || {};
    const hasBasicInfo = metadata.title || metadata.authors || metadata.year;
    const hasFullInfo = metadata.title && metadata.authors && metadata.year && metadata.journal;
    
    if (hasFullInfo) return { status: 'complete', color: '#4ade80', text: 'Complete' };
    if (hasBasicInfo) return { status: 'partial', color: '#fbbf24', text: 'Partial' };
    return { status: 'empty', color: '#f87171', text: 'Missing' };
  };

  return (
    <div className="metadata-table-panel">
      <div className="metadata-header">
        <div className="header-title">
          <Database size={24} />
          <h3>Metadata Manager</h3>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="metadata-controls">
        <div className="search-box">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            placeholder="Search by title, authors, year..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="clear-search">
              <X size={14} />
            </button>
          )}
        </div>

        <div className="filter-buttons">
          <button 
            className={`filter-btn ${filterType === 'all' ? 'active' : ''}`}
            onClick={() => setFilterType('all')}
          >
            All ({allPDFs.length})
          </button>
          <button 
            className={`filter-btn ${filterType === 'hasMetadata' ? 'active' : ''}`}
            onClick={() => setFilterType('hasMetadata')}
          >
            With Data
          </button>
          <button 
            className={`filter-btn ${filterType === 'noMetadata' ? 'active' : ''}`}
            onClick={() => setFilterType('noMetadata')}
          >
            Missing Data
          </button>
        </div>
      </div>

      {/* Metadata Table */}
      <div className="metadata-content">
        {filteredPDFs.length === 0 ? (
          <div className="metadata-empty">
            <Database size={48} />
            <p>No PDFs found</p>
            <p className="empty-hint">
              {allPDFs.length === 0 
                ? 'Upload PDF files to manage their metadata' 
                : 'No PDFs match your search criteria'}
            </p>
          </div>
        ) : (
          <div className="table-container">
            <table className="metadata-table">
              <thead>
                <tr>
                  <th style={{ width: '40px' }}>Status</th>
                  <th style={{ width: '180px' }}>File Name</th>
                  <th style={{ width: '220px' }}>Title</th>
                  <th style={{ width: '160px' }}>Authors</th>
                  <th style={{ width: '70px' }}>Year</th>
                  <th style={{ width: '140px' }}>Journal</th>
                  <th style={{ width: '70px' }}>Volume</th>
                  <th style={{ width: '70px' }}>Issue</th>
                  <th style={{ width: '90px' }}>Pages</th>
                  <th style={{ width: '130px' }}>DOI</th>
                  <th style={{ width: '120px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPDFs.map(pdf => {
                  const metadata = pdf.metadata || {};
                  const isEditing = editingId === pdf.id;
                  const statusInfo = getMetadataStatus(pdf);

                  if (isEditing) {
                    return (
                      <tr key={pdf.id} className="editing-row">
                        <td>
                          <div className="status-indicator" style={{ background: statusInfo.color }} />
                        </td>
                        <td className="file-name-cell">
                          <FileText size={14} />
                          <span>{pdf.name}</span>
                        </td>
                        <td>
                          <input
                            type="text"
                            value={editedData.title}
                            onChange={(e) => setEditedData({...editedData, title: e.target.value})}
                            placeholder="Title"
                            className="edit-input"
                          />
                        </td>
                        <td>
                          <input
                            type="text"
                            value={editedData.authors}
                            onChange={(e) => setEditedData({...editedData, authors: e.target.value})}
                            placeholder="Authors"
                            className="edit-input"
                          />
                        </td>
                        <td>
                          <input
                            type="text"
                            value={editedData.year}
                            onChange={(e) => setEditedData({...editedData, year: e.target.value})}
                            placeholder="Year"
                            className="edit-input"
                            style={{ width: '60px' }}
                          />
                        </td>
                        <td>
                          <input
                            type="text"
                            value={editedData.journal}
                            onChange={(e) => setEditedData({...editedData, journal: e.target.value})}
                            placeholder="Journal"
                            className="edit-input"
                          />
                        </td>
                        <td>
                          <input
                            type="text"
                            value={editedData.volume}
                            onChange={(e) => setEditedData({...editedData, volume: e.target.value})}
                            placeholder="Vol"
                            className="edit-input"
                            style={{ width: '50px' }}
                          />
                        </td>
                        <td>
                          <input
                            type="text"
                            value={editedData.issue}
                            onChange={(e) => setEditedData({...editedData, issue: e.target.value})}
                            placeholder="Issue"
                            className="edit-input"
                            style={{ width: '50px' }}
                          />
                        </td>
                        <td>
                          <input
                            type="text"
                            value={editedData.pages}
                            onChange={(e) => setEditedData({...editedData, pages: e.target.value})}
                            placeholder="Pages"
                            className="edit-input"
                            style={{ width: '70px' }}
                          />
                        </td>
                        <td>
                          <input
                            type="text"
                            value={editedData.doi}
                            onChange={(e) => setEditedData({...editedData, doi: e.target.value})}
                            placeholder="DOI"
                            className="edit-input"
                          />
                        </td>
                        <td>
                          <div className="action-buttons">
                            <button 
                              onClick={() => saveMetadata(pdf.id)}
                              className="action-btn save-btn"
                              title="Save"
                            >
                              <Edit size={14} />
                            </button>
                            <button 
                              onClick={cancelEditing}
                              className="action-btn cancel-btn"
                              title="Cancel"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  }

                  return (
                    <tr key={pdf.id} className="data-row">
                      <td>
                        <div 
                          className="status-indicator" 
                          style={{ background: statusInfo.color }}
                          title={statusInfo.text}
                        />
                      </td>
                      <td className="file-name-cell">
                        <FileText size={14} />
                        <span className="file-name-text">{pdf.name}</span>
                      </td>
                      <td className="metadata-cell">
                        {metadata.title || <span className="empty-data">—</span>}
                      </td>
                      <td className="metadata-cell">
                        {metadata.authors || <span className="empty-data">—</span>}
                      </td>
                      <td className="metadata-cell">
                        {metadata.year || <span className="empty-data">—</span>}
                      </td>
                      <td className="metadata-cell">
                        {metadata.journal || <span className="empty-data">—</span>}
                      </td>
                      <td className="metadata-cell">
                        {metadata.volume || <span className="empty-data">—</span>}
                      </td>
                      <td className="metadata-cell">
                        {metadata.issue || <span className="empty-data">—</span>}
                      </td>
                      <td className="metadata-cell">
                        {metadata.pages || <span className="empty-data">—</span>}
                      </td>
                      <td className="metadata-cell doi-cell">
                        {metadata.doi || <span className="empty-data">—</span>}
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button 
                            onClick={() => startEditing(pdf)}
                            className="action-btn edit-btn"
                            title="Edit metadata"
                          >
                            <Edit size={14} />
                          </button>
                          <button 
                            onClick={() => handleViewPDF(pdf)}
                            className="action-btn view-btn"
                            title="View PDF"
                          >
                            <FileText size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Info Footer */}
      <div className="metadata-footer">
        <div className="footer-stats">
          <span className="stat-item">
            <span className="stat-value">{filteredPDFs.length}</span> of {allPDFs.length} PDFs
          </span>
          <span className="stat-separator">•</span>
          <span className="stat-item">
            <span className="stat-value">
              {allPDFs.filter(pdf => {
                const m = pdf.metadata || {};
                return m.title && m.authors && m.year;
              }).length}
            </span> complete
          </span>
        </div>
      </div>
    </div>
  );
};

export default MetadataTable;
