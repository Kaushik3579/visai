import { useState } from 'react';
import { useFileSystem } from '../context/FileSystemContext';
import { 
  BookOpen, 
  FileText,
  Users,
  Calendar,
  Search,
  BookMarked
} from 'lucide-react';
import '../styles/CitationManager.css';

const CitationManager = () => {
  const { fileTree, openFile } = useFileSystem();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterYear, setFilterYear] = useState('');

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

  // Filter PDFs based on search and year
  const filteredPDFs = allPDFs.filter(pdf => {
    const metadata = pdf.metadata || {};
    const matchesSearch = searchQuery === '' || 
      (metadata.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
       metadata.authors?.toLowerCase().includes(searchQuery.toLowerCase()) ||
       pdf.name.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesYear = filterYear === '' || metadata.year === filterYear;
    
    return matchesSearch && matchesYear;
  });

  // Get unique years for filter
  const uniqueYears = [...new Set(allPDFs.map(pdf => pdf.metadata?.year).filter(Boolean))].sort((a, b) => b - a);

  const handlePDFClick = (pdf) => {
    openFile(pdf);
  };

  return (
    <div className="citation-manager">
      <div className="citation-header">
        <div className="header-title">
          <BookOpen size={24} />
          <h2>Reference Manager</h2>
        </div>
        <p className="pdf-count">{filteredPDFs.length} references</p>
      </div>

      <div className="citation-filters">
        <div className="search-box">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search by title, authors..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        {uniqueYears.length > 0 && (
          <select 
            value={filterYear} 
            onChange={(e) => setFilterYear(e.target.value)}
            className="year-filter"
          >
            <option value="">All Years</option>
            {uniqueYears.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        )}
      </div>

      <div className="citations-list">
        {filteredPDFs.length === 0 ? (
          <div className="empty-state">
            <BookOpen size={48} />
            <p>{allPDFs.length === 0 ? 'No PDF references yet' : 'No matches found'}</p>
            <p className="empty-hint">
              {allPDFs.length === 0 
                ? 'Upload PDF files to manage citations' 
                : 'Try adjusting your search or filters'}
            </p>
          </div>
        ) : (
          filteredPDFs.map(pdf => {
            const metadata = pdf.metadata || {};
            return (
              <div 
                key={pdf.id} 
                className="citation-item"
                onClick={() => handlePDFClick(pdf)}
              >
                <div className="citation-icon">
                  <FileText size={20} />
                </div>
                <div className="citation-content">
                  <h4>{metadata.title || pdf.name}</h4>
                  <div className="citation-meta">
                    {metadata.authors && (
                      <span className="meta-item">
                        <Users size={12} />
                        {metadata.authors}
                      </span>
                    )}
                    {metadata.year && (
                      <span className="meta-item">
                        <Calendar size={12} />
                        {metadata.year}
                      </span>
                    )}
                    {metadata.journal && (
                      <span className="meta-item">
                        <BookMarked size={12} />
                        {metadata.journal}
                      </span>
                    )}
                  </div>
                  {!metadata.title && (
                    <p className="no-metadata">No metadata extracted</p>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default CitationManager;
