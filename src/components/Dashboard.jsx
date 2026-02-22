import { useState, useEffect } from 'react';
import { useFileSystem } from '../context/FileSystemContext';
import { useDocuments } from '../context/DocumentContext';
import { useAuth } from '../context/AuthContext';
import ActivityBar from './ActivityBar';
import FileExplorer from './FileExplorer';
import SearchPanel from './SearchPanel';
import MetadataTable from './MetadataTable';
import ExtensionsPanel from './ExtensionsPanel';
import SettingsPanel from './SettingsPanel';
import InfoPanel from './InfoPanel';
import FileUpload from './FileUpload';
import PaperEditor from './PaperEditor';
import PDFViewer from './PDFViewer';
import PDFMetadataViewer from './PDFMetadataViewer';
import DocumentEditor from './DocumentEditor';
import CitationManager from './CitationManager';
import SignInModal from './SignInModal';
import ProfileDropdown from './ProfileDropdown';
import { 
  Upload, 
  X, 
  FileText,
  LogIn
} from 'lucide-react';
import '../styles/Dashboard.css';

const Dashboard = () => {
  const { selectedFile, openFiles, closeFile, loading } = useFileSystem();
  const { selectedDocument } = useDocuments();
  const { user } = useAuth();
  const [showUpload, setShowUpload] = useState(false);
  const [showSignIn, setShowSignIn] = useState(false);
  const [activeView, setActiveView] = useState('explorer');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.shiftKey) {
        switch (e.key.toLowerCase()) {
          case 'e':
            e.preventDefault();
            setActiveView('explorer');
            break;
          case 'f':
            e.preventDefault();
            setActiveView('search');
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const renderSidebarContent = () => {
    switch (activeView) {
      case 'explorer':
        return <FileExplorer />;
      case 'search':
        return <SearchPanel />;
      case 'recent':
        return null; // Metadata table shown in main area
      case 'citations':
        return <CitationManager />;
      case 'extensions':
        return <ExtensionsPanel />;
      case 'settings':
        return <SettingsPanel />;
      case 'info':
        return <InfoPanel />;
      default:
        return <FileExplorer />;
    }
  };

  const renderFileContent = () => {
    // Show metadata table when metadata view is active
    if (activeView === 'recent') {
      return <MetadataTable />;
    }

    // Show document editor if a document is selected
    if (selectedDocument) {
      return <DocumentEditor />;
    }

    // Show PDF content based on active view
    if (selectedFile) {
      if (selectedFile.fileType?.includes('pdf')) {
        // Reference Manager view: Show metadata viewer
        if (activeView === 'citations') {
          return <PDFMetadataViewer file={selectedFile} />;
        }
        // PDF References view: Show PDF viewer
        return <PDFViewer file={selectedFile} />;
      }
      return <PaperEditor file={selectedFile} />;
    }

    // Show empty state
    return (
      <div className="empty-workspace">
        <FileText size={64} />
        <h2>Welcome to Paper Writing Dashboard</h2>
        <p>Upload PDFs for references or create a new paper to start writing</p>
        <button onClick={() => setShowUpload(true)} className="primary-btn">
          <Upload size={20} />
          <span>Upload PDF References</span>
        </button>
      </div>
    );
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-left">
          <h1>Paper Writing & Citations Dashboard</h1>
          {user && <span className="user-workspace">☁️ Cloud Storage</span>}
        </div>
        
        <div className="header-actions">
          <button 
            onClick={() => setShowUpload(true)}
            className="header-btn"
            title="Upload Files"
          >
            <Upload size={20} />
            <span>Upload</span>
          </button>

          {!user ? (
            <button 
              onClick={() => setShowSignIn(true)}
              className="header-btn signin-btn"
              title="Sign In"
            >
              <LogIn size={20} />
              <span>Sign In</span>
            </button>
          ) : (
            <ProfileDropdown />
          )}
        </div>
      </header>

      <div className="dashboard-body">
        <ActivityBar activeView={activeView} onViewChange={setActiveView} />
        
        {activeView !== 'recent' && (
          <aside className="sidebar-panel">
            {renderSidebarContent()}
          </aside>
        )}

        <main className="main-content">
          {openFiles.length > 0 && (
            <div className="file-tabs">
              {openFiles.map(file => (
                <div
                  key={file.id}
                  className={`file-tab ${selectedFile?.id === file.id ? 'active' : ''}`}
                >
                  <span className="tab-name">{file.name}</span>
                  <button
                    onClick={() => closeFile(file.id)}
                    className="tab-close"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="content-area">
            {renderFileContent()}
          </div>
        </main>
      </div>

      {showUpload && (
        <FileUpload onClose={() => setShowUpload(false)} />
      )}

      {showSignIn && (
        <SignInModal onClose={() => setShowSignIn(false)} />
      )}
    </div>
  );
};

export default Dashboard;
