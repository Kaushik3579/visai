import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc,
  getDocs,
  deleteDoc, 
  updateDoc,
  query,
  orderBy,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { storePDF, getPDF, deletePDF, blobToDataURL } from '../services/pdfStorageService';

const FileSystemContext = createContext();

export const useFileSystem = () => {
  const context = useContext(FileSystemContext);
  if (!context) {
    throw new Error('useFileSystem must be used within FileSystemProvider');
  }
  return context;
};

export const FileSystemProvider = ({ children }) => {
  const { user } = useAuth();
  const [fileTree, setFileTree] = useState({
    id: 'root',
    name: 'My Workspace',
    type: 'folder',
    children: []
  });

  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [openFiles, setOpenFiles] = useState([]);
  const [citations, setCitations] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load citations from localStorage
  useEffect(() => {
    const savedCitations = localStorage.getItem('citations');
    if (savedCitations) {
      setCitations(JSON.parse(savedCitations));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('citations', JSON.stringify(citations));
  }, [citations]);

  // Load user's folders and files from Firestore
  useEffect(() => {
    if (user) {
      loadUserData();
    } else {
      // Reset to empty when logged out
      setFileTree({
        id: 'root',
        name: 'My Workspace',
        type: 'folder',
        children: []
      });
    }
  }, [user]);

  const loadUserData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const foldersRef = collection(db, 'users', user.uid, 'folders');
      const foldersSnapshot = await getDocs(query(foldersRef, orderBy('createdAt', 'asc')));
      
      const folders = [];
      
      for (const folderDoc of foldersSnapshot.docs) {
        const folderData = folderDoc.data();
        const filesRef = collection(db, 'users', user.uid, 'folders', folderDoc.id, 'files');
        const filesSnapshot = await getDocs(query(filesRef, orderBy('createdAt', 'asc')));
        
        const files = filesSnapshot.docs.map(fileDoc => ({
          id: fileDoc.id,
          ...fileDoc.data(),
          type: 'file'
        }));

        folders.push({
          id: folderDoc.id,
          ...folderData,
          type: 'folder',
          children: files
        });
      }

      setFileTree({
        id: 'root',
        name: user.displayName ? `${user.displayName}'s Workspace` : 'My Workspace',
        type: 'folder',
        children: folders
      });
    } catch (error) {
      console.error('Error loading user data:', error);
      alert('Failed to load your files: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const findNodeById = (tree, id) => {
    if (tree.id === id) return tree;
    if (tree.children) {
      for (const child of tree.children) {
        const found = findNodeById(child, id);
        if (found) return found;
      }
    }
    return null;
  };

  const findParentById = (tree, id, parent = null) => {
    if (tree.id === id) return parent;
    if (tree.children) {
      for (const child of tree.children) {
        const found = findParentById(child, id, tree);
        if (found) return found;
      }
    }
    return null;
  };

  // Create a new folder in Firestore
  const addFolder = async (parentId, folderName) => {
    if (!user) {
      alert('Please sign in to create folders.');
      return null;
    }

    try {
      const folderId = `folder-${Date.now()}`;
      const folderRef = doc(db, 'users', user.uid, 'folders', folderId);
      
      const folderData = {
        name: folderName,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      await setDoc(folderRef, folderData);

      // Update local state
      const newFolder = {
        id: folderId,
        ...folderData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        type: 'folder',
        children: []
      };

      setFileTree(prevTree => {
        const newTree = JSON.parse(JSON.stringify(prevTree));
        if (parentId === 'root') {
          newTree.children.push(newFolder);
        }
        return newTree;
      });

      return newFolder;
    } catch (error) {
      console.error('Error creating folder:', error);
      alert('Failed to create folder: ' + error.message);
      return null;
    }
  };

  // Upload a PDF file to Firebase Storage and save metadata to Firestore
  const addFile = async (parentId, file, metadata = null) => {
    if (!user) {
      alert('Please sign in to upload files.');
      return null;
    }

    // Only allow PDF files
    if (!file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
      alert('Only PDF files are allowed.');
      return null;
    }

    try {
      const parent = findNodeById(fileTree, parentId);
      if (!parent || parent.type !== 'folder' || parent.id === 'root') {
        alert('Please select a folder to upload files to.');
        return null;
      }

      const fileId = `file-${Date.now()}`;
      
      // Store PDF in IndexedDB (much larger capacity than localStorage)
      const indexedDBKey = `pdf_${user.uid}_${fileId}`;
      await storePDF(indexedDBKey, file);

      // Save metadata to Firestore
      const fileRef = doc(db, 'users', user.uid, 'folders', parent.id, 'files', fileId);
      const fileData = {
        name: file.name,
        fileType: 'application/pdf',
        size: file.size,
        indexedDBKey: indexedDBKey,
        // Store bibliographic metadata if provided
        ...(metadata && {
          metadata: {
            title: metadata.title || null,
            authors: metadata.authors || null,
            year: metadata.year || null,
            journal: metadata.journal || null,
            volume: metadata.volume || null,
            issue: metadata.issue || null,
            pages: metadata.pages || null,
            doi: metadata.doi || null,
            extractedAt: metadata.extractedAt || new Date().toISOString()
          }
        }),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      await setDoc(fileRef, fileData);

      // Update local state
      const newFile = {
        id: fileId,
        ...fileData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        type: 'file'
      };

      setFileTree(prevTree => {
        const newTree = JSON.parse(JSON.stringify(prevTree));
        const parentNode = findNodeById(newTree, parentId);
        if (parentNode && parentNode.type === 'folder') {
          parentNode.children = parentNode.children || [];
          parentNode.children.push(newFile);
        }
        return newTree;
      });

      return newFile;
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Failed to upload file: ' + error.message);
      return null;
    }
  };

  // Delete a folder or file
  const deleteNode = async (nodeId) => {
    if (!user) {
      alert('Please sign in to delete items.');
      return;
    }

    try {
      const node = findNodeById(fileTree, nodeId);
      const parent = findParentById(fileTree, nodeId);

      if (!node) return;

      if (node.type === 'file' && parent) {
        // Delete file from IndexedDB (or localStorage for old files)
        if (node.indexedDBKey) {
          await deletePDF(node.indexedDBKey);
        } else if (node.localStorageKey) {
          localStorage.removeItem(node.localStorageKey);
        }

        // Delete file metadata from Firestore
        await deleteDoc(doc(db, 'users', user.uid, 'folders', parent.id, 'files', node.id));
      } else if (node.type === 'folder') {
        // Delete all files in the folder first
        if (node.children && node.children.length > 0) {
          for (const child of node.children) {
            if (child.type === 'file') {
              try {
                if (child.indexedDBKey) {
                  await deletePDF(child.indexedDBKey);
                } else if (child.localStorageKey) {
                  localStorage.removeItem(child.localStorageKey);
                }
              } catch (error) {
                console.error('Error deleting file:', error);
              }
            }
          }
        }

        // Delete folder from Firestore (files subcollection will be orphaned but that's okay)
        await deleteDoc(doc(db, 'users', user.uid, 'folders', node.id));
      }

      // Update local state
      setFileTree(prevTree => {
        const newTree = JSON.parse(JSON.stringify(prevTree));
        if (parent && parent.children) {
          parent.children = parent.children.filter(child => child.id !== nodeId);
        } else if (newTree.children) {
          newTree.children = newTree.children.filter(child => child.id !== nodeId);
        }
        return newTree;
      });

      // Close the file if it's open
      setOpenFiles(prev => prev.filter(file => file.id !== nodeId));
      if (selectedFile?.id === nodeId) {
        setSelectedFile(null);
      }
    } catch (error) {
      console.error('Error deleting node:', error);
      alert('Failed to delete: ' + error.message);
    }
  };

  // Rename a folder or file
  const renameNode = async (nodeId, newName) => {
    if (!user) {
      alert('Please sign in to rename items.');
      return;
    }

    try {
      const node = findNodeById(fileTree, nodeId);
      const parent = findParentById(fileTree, nodeId);

      if (!node) return;

      if (node.type === 'file' && parent) {
        await updateDoc(doc(db, 'users', user.uid, 'folders', parent.id, 'files', node.id), {
          name: newName,
          updatedAt: serverTimestamp()
        });
      } else if (node.type === 'folder') {
        await updateDoc(doc(db, 'users', user.uid, 'folders', node.id), {
          name: newName,
          updatedAt: serverTimestamp()
        });
      }

      // Update local state
      setFileTree(prevTree => {
        const newTree = JSON.parse(JSON.stringify(prevTree));
        const nodeToUpdate = findNodeById(newTree, nodeId);
        if (nodeToUpdate) {
          nodeToUpdate.name = newName;
        }
        return newTree;
      });
    } catch (error) {
      console.error('Error renaming node:', error);
      alert('Failed to rename: ' + error.message);
    }
  };

  // Open a file (load from IndexedDB)
  const openFile = async (file) => {
    try {
      // Try IndexedDB first (new storage method)
      if (file.indexedDBKey) {
        const pdfBlob = await getPDF(file.indexedDBKey);
        
        if (pdfBlob) {
          const dataURL = await blobToDataURL(pdfBlob);
          
          const fileWithContent = {
            ...file,
            url: dataURL,
            content: dataURL
          };
          
          setSelectedFile(fileWithContent);
          if (!openFiles.find(f => f.id === file.id)) {
            setOpenFiles(prev => [...prev, fileWithContent]);
          }
        } else {
          alert('File not found in storage.');
        }
      } 
      // Fallback to localStorage for old files
      else if (file.localStorageKey) {
        const base64Data = localStorage.getItem(file.localStorageKey);
        
        if (base64Data) {
          const fileWithContent = {
            ...file,
            url: base64Data,
            content: base64Data
          };
          
          setSelectedFile(fileWithContent);
          if (!openFiles.find(f => f.id === file.id)) {
            setOpenFiles(prev => [...prev, fileWithContent]);
          }
        } else {
          alert('File not found in storage.');
        }
      }
    } catch (error) {
      console.error('Error opening file:', error);
      alert('Failed to open file: ' + error.message);
    }
  };

  const closeFile = (fileId) => {
    setOpenFiles(prev => prev.filter(f => f.id !== fileId));
    if (selectedFile?.id === fileId) {
      const remaining = openFiles.filter(f => f.id !== fileId);
      setSelectedFile(remaining[remaining.length - 1] || null);
    }
  };

  // Download a file
  const downloadFile = async (file) => {
    try {
      // Try IndexedDB first (new storage method)
      if (file.indexedDBKey) {
        const pdfBlob = await getPDF(file.indexedDBKey);
        if (pdfBlob) {
          const dataURL = await blobToDataURL(pdfBlob);
          const a = document.createElement('a');
          a.href = dataURL;
          a.download = file.name;
          a.click();
        } else {
          alert('File not found in storage.');
        }
      } 
      // Fallback to localStorage for old files
      else if (file.localStorageKey) {
        const base64Data = localStorage.getItem(file.localStorageKey);
        if (base64Data) {
          const a = document.createElement('a');
          a.href = base64Data;
          a.download = file.name;
          a.click();
        } else {
          alert('File not found in storage.');
        }
      }
    } catch (error) {
      console.error('Error downloading file:', error);
      alert('Failed to download file: ' + error.message);
    }
  };

  const addCitation = (citation) => {
    setCitations(prev => [...prev, { ...citation, id: `citation-${Date.now()}` }]);
  };

  const deleteCitation = (citationId) => {
    setCitations(prev => prev.filter(c => c.id !== citationId));
  };

  // Placeholder for move operation (not commonly used)
  const moveNode = async (nodeId, targetParentId) => {
    alert('Moving files between folders is not supported yet.');
  };

  // Select a folder for operations
  const selectFolder = (folder) => {
    if (folder && folder.type === 'folder') {
      setSelectedFolder(folder);
    }
  };

  // Update file metadata
  const updateFileMetadata = async (fileId, updatedMetadata) => {
    if (!user) {
      alert('Please sign in to update metadata.');
      return false;
    }

    try {
      // Find the file and its parent
      const file = findNodeById(fileTree, fileId);
      if (!file || file.type !== 'file') {
        alert('File not found.');
        return false;
      }

      const parent = findParentById(fileTree, fileId);
      if (!parent || parent.id === 'root') {
        alert('Cannot update metadata for files in root. Please move file to a folder first.');
        return false;
      }

      // Update metadata in Firestore
      const fileRef = doc(db, 'users', user.uid, 'folders', parent.id, 'files', fileId);
      await updateDoc(fileRef, {
        metadata: {
          title: updatedMetadata.title || null,
          authors: updatedMetadata.authors || null,
          year: updatedMetadata.year || null,
          journal: updatedMetadata.journal || null,
          volume: updatedMetadata.volume || null,
          issue: updatedMetadata.issue || null,
          pages: updatedMetadata.pages || null,
          doi: updatedMetadata.doi || null,
          updatedAt: new Date().toISOString()
        },
        updatedAt: serverTimestamp()
      });

      // Update local state
      setFileTree(prevTree => {
        const newTree = JSON.parse(JSON.stringify(prevTree));
        const fileNode = findNodeById(newTree, fileId);
        if (fileNode) {
          fileNode.metadata = {
            ...updatedMetadata,
            updatedAt: new Date().toISOString()
          };
          fileNode.updatedAt = new Date().toISOString();
        }
        return newTree;
      });

      // Update selectedFile if it's the one being edited
      if (selectedFile?.id === fileId) {
        setSelectedFile(prev => ({
          ...prev,
          metadata: {
            ...updatedMetadata,
            updatedAt: new Date().toISOString()
          }
        }));
      }

      // Update openFiles if the file is open
      setOpenFiles(prev => prev.map(f => 
        f.id === fileId 
          ? { ...f, metadata: { ...updatedMetadata, updatedAt: new Date().toISOString() } }
          : f
      ));

      return true;
    } catch (error) {
      console.error('Error updating metadata:', error);
      alert('Failed to update metadata. Please try again.');
      return false;
    }
  };

  const value = {
    fileTree,
    selectedFile,
    selectedFolder,
    openFiles,
    citations,
    loading,
    addFile,
    addFolder,
    deleteNode,
    renameNode,
    moveNode,
    openFile,
    closeFile,
    downloadFile,
    selectFolder,
    updateFileMetadata,
    addCitation,
    deleteCitation,
    findNodeById,
    refreshData: loadUserData
  };

  return (
    <FileSystemContext.Provider value={value}>
      {children}
    </FileSystemContext.Provider>
  );
};
