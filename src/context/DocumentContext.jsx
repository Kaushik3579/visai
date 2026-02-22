import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const DocumentContext = createContext();

export const useDocuments = () => {
  const context = useContext(DocumentContext);
  if (!context) {
    throw new Error('useDocuments must be used within DocumentProvider');
  }
  return context;
};

export const DocumentProvider = ({ children }) => {
  const { user } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [openDocuments, setOpenDocuments] = useState([]);

  // Load documents from localStorage on mount
  useEffect(() => {
    if (user) {
      loadDocuments();
    } else {
      setDocuments([]);
      setOpenDocuments([]);
      setSelectedDocument(null);
    }
  }, [user]);

  // Auto-save when document content changes
  useEffect(() => {
    if (selectedDocument && selectedDocument.content !== undefined) {
      const timer = setTimeout(() => {
        saveDocument(selectedDocument);
      }, 1000); // Auto-save after 1 second of no changes

      return () => clearTimeout(timer);
    }
  }, [selectedDocument?.content]);

  const loadDocuments = () => {
    if (!user) return;
    
    const storageKey = `documents_${user.uid}`;
    const stored = localStorage.getItem(storageKey);
    
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setDocuments(parsed);
      } catch (error) {
        console.error('Error loading documents:', error);
        setDocuments([]);
      }
    } else {
      setDocuments([]);
    }
  };

  const saveDocumentsToStorage = (docs) => {
    if (!user) return;
    
    const storageKey = `documents_${user.uid}`;
    localStorage.setItem(storageKey, JSON.stringify(docs));
  };

  const createDocument = (name, type = 'markdown') => {
    if (!user) {
      alert('Please sign in to create documents.');
      return null;
    }

    const newDoc = {
      id: `doc-${Date.now()}`,
      name: name.endsWith('.md') ? name : `${name}.md`,
      type: type,
      content: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const updatedDocs = [...documents, newDoc];
    setDocuments(updatedDocs);
    saveDocumentsToStorage(updatedDocs);
    
    return newDoc;
  };

  const saveDocument = (doc) => {
    if (!user || !doc) return;

    const updatedDocs = documents.map(d => 
      d.id === doc.id 
        ? { ...doc, updatedAt: new Date().toISOString() }
        : d
    );
    
    setDocuments(updatedDocs);
    saveDocumentsToStorage(updatedDocs);
    
    // Update open documents
    setOpenDocuments(prev => 
      prev.map(d => d.id === doc.id ? { ...doc, updatedAt: new Date().toISOString() } : d)
    );
  };

  const deleteDocument = (docId) => {
    if (!user) return;

    const updatedDocs = documents.filter(d => d.id !== docId);
    setDocuments(updatedDocs);
    saveDocumentsToStorage(updatedDocs);

    // Remove from open documents
    setOpenDocuments(prev => prev.filter(d => d.id !== docId));
    
    // Clear selection if deleted
    if (selectedDocument?.id === docId) {
      const remaining = openDocuments.filter(d => d.id !== docId);
      setSelectedDocument(remaining[remaining.length - 1] || null);
    }
  };

  const renameDocument = (docId, newName) => {
    if (!user) return;

    const updatedDocs = documents.map(d => 
      d.id === docId 
        ? { ...d, name: newName, updatedAt: new Date().toISOString() }
        : d
    );
    
    setDocuments(updatedDocs);
    saveDocumentsToStorage(updatedDocs);

    // Update open documents
    setOpenDocuments(prev => 
      prev.map(d => d.id === docId ? { ...d, name: newName } : d)
    );

    // Update selected document
    if (selectedDocument?.id === docId) {
      setSelectedDocument({ ...selectedDocument, name: newName });
    }
  };

  const openDocument = (doc) => {
    setSelectedDocument(doc);
    
    if (!openDocuments.find(d => d.id === doc.id)) {
      setOpenDocuments(prev => [...prev, doc]);
    }
  };

  const closeDocument = (docId) => {
    const updatedOpen = openDocuments.filter(d => d.id !== docId);
    setOpenDocuments(updatedOpen);
    
    if (selectedDocument?.id === docId) {
      setSelectedDocument(updatedOpen[updatedOpen.length - 1] || null);
    }
  };

  const updateDocumentContent = (docId, content) => {
    setSelectedDocument(prev => 
      prev?.id === docId ? { ...prev, content } : prev
    );

    // Update in open documents
    setOpenDocuments(prev => 
      prev.map(d => d.id === docId ? { ...d, content } : d)
    );
  };

  const value = {
    documents,
    selectedDocument,
    openDocuments,
    createDocument,
    saveDocument,
    deleteDocument,
    renameDocument,
    openDocument,
    closeDocument,
    updateDocumentContent
  };

  return (
    <DocumentContext.Provider value={value}>
      {children}
    </DocumentContext.Provider>
  );
};
