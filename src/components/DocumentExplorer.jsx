import { useState } from 'react';
import { useDocuments } from '../context/DocumentContext';
import { 
  FileText,
  FilePlus,
  Trash2,
  Edit2,
  File
} from 'lucide-react';
import '../styles/DocumentExplorer.css';

const DocumentExplorer = () => {
  const { 
    documents, 
    selectedDocument,
    createDocument, 
    deleteDocument, 
    renameDocument, 
    openDocument 
  } = useDocuments();
  
  const [showNewDoc, setShowNewDoc] = useState(false);
  const [newDocName, setNewDocName] = useState('');
  const [renamingId, setRenamingId] = useState(null);
  const [renamingName, setRenamingName] = useState('');

  const handleCreateDocument = () => {
    if (newDocName.trim()) {
      createDocument(newDocName.trim());
      setNewDocName('');
      setShowNewDoc(false);
    }
  };

  const handleRename = (docId) => {
    if (renamingName.trim() && renamingName !== documents.find(d => d.id === docId)?.name) {
      renameDocument(docId, renamingName.trim());
    }
    setRenamingId(null);
    setRenamingName('');
  };

  const handleDelete = (docId, docName) => {
    if (confirm(`Are you sure you want to delete "${docName}"?`)) {
      deleteDocument(docId);
    }
  };

  const startRename = (doc) => {
    setRenamingId(doc.id);
    setRenamingName(doc.name);
  };

  return (
    <div className="document-explorer">
      <div className="explorer-header">
        <h3>My Papers</h3>
        <div className="header-actions">
          <button
            onClick={() => setShowNewDoc(true)}
            className="icon-btn"
            title="New Paper"
          >
            <FilePlus size={18} />
          </button>
        </div>
      </div>

      {showNewDoc && (
        <div className="new-doc-input">
          <input
            type="text"
            value={newDocName}
            onChange={(e) => setNewDocName(e.target.value)}
            onBlur={() => {
              if (!newDocName.trim()) setShowNewDoc(false);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleCreateDocument();
              if (e.key === 'Escape') setShowNewDoc(false);
            }}
            placeholder="Paper name..."
            autoFocus
          />
        </div>
      )}

      <div className="document-list">
        {documents.length === 0 ? (
          <div className="empty-state">
            <FileText size={48} strokeWidth={1.5} />
            <p>No papers yet</p>
            <button onClick={() => setShowNewDoc(true)} className="create-first-btn">
              Create your first paper
            </button>
          </div>
        ) : (
          documents.map(doc => (
            <div 
              key={doc.id}
              className={`document-item ${selectedDocument?.id === doc.id ? 'selected' : ''}`}
              onClick={() => openDocument(doc)}
            >
              <div className="document-icon">
                <FileText size={18} />
              </div>
              
              {renamingId === doc.id ? (
                <input
                  type="text"
                  value={renamingName}
                  onChange={(e) => setRenamingName(e.target.value)}
                  onBlur={() => handleRename(doc.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleRename(doc.id);
                    if (e.key === 'Escape') setRenamingId(null);
                  }}
                  onClick={(e) => e.stopPropagation()}
                  autoFocus
                  className="rename-input"
                />
              ) : (
                <div className="document-info">
                  <div className="document-name">{doc.name}</div>
                  <div className="document-meta">
                    {new Date(doc.updatedAt).toLocaleDateString()}
                  </div>
                </div>
              )}

              {renamingId !== doc.id && (
                <div className="document-actions">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      startRename(doc);
                    }}
                    className="action-btn"
                    title="Rename"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(doc.id, doc.name);
                    }}
                    className="action-btn delete-btn"
                    title="Delete"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default DocumentExplorer;
