// IndexedDB service for storing PDF files
// IndexedDB has much larger storage capacity than localStorage (50MB+ vs 5-10MB)

const DB_NAME = 'VISAI_PDFStorage';
const DB_VERSION = 1;
const STORE_NAME = 'pdfs';

/**
 * Open IndexedDB connection
 */
const openDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = () => {
      reject(new Error('Failed to open IndexedDB'));
    };
    
    request.onsuccess = () => {
      resolve(request.result);
    };
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      
      // Create object store if it doesn't exist
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'key' });
      }
    };
  });
};

/**
 * Store PDF file in IndexedDB
 * @param {string} key - Unique key for the PDF
 * @param {Blob|File} file - The PDF file to store
 * @returns {Promise<void>}
 */
export const storePDF = async (key, file) => {
  try {
    const db = await openDB();
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    
    // Store the file as a Blob (more efficient than base64)
    const data = {
      key: key,
      file: file,
      timestamp: new Date().toISOString()
    };
    
    return new Promise((resolve, reject) => {
      const request = store.put(data);
      
      request.onsuccess = () => {
        db.close();
        resolve();
      };
      
      request.onerror = () => {
        db.close();
        reject(new Error('Failed to store PDF'));
      };
    });
  } catch (error) {
    console.error('Error storing PDF:', error);
    throw error;
  }
};

/**
 * Retrieve PDF file from IndexedDB
 * @param {string} key - Unique key for the PDF
 * @returns {Promise<Blob|null>}
 */
export const getPDF = async (key) => {
  try {
    const db = await openDB();
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    
    return new Promise((resolve, reject) => {
      const request = store.get(key);
      
      request.onsuccess = () => {
        db.close();
        const result = request.result;
        resolve(result ? result.file : null);
      };
      
      request.onerror = () => {
        db.close();
        reject(new Error('Failed to retrieve PDF'));
      };
    });
  } catch (error) {
    console.error('Error retrieving PDF:', error);
    return null;
  }
};

/**
 * Delete PDF file from IndexedDB
 * @param {string} key - Unique key for the PDF
 * @returns {Promise<void>}
 */
export const deletePDF = async (key) => {
  try {
    const db = await openDB();
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    
    return new Promise((resolve, reject) => {
      const request = store.delete(key);
      
      request.onsuccess = () => {
        db.close();
        resolve();
      };
      
      request.onerror = () => {
        db.close();
        reject(new Error('Failed to delete PDF'));
      };
    });
  } catch (error) {
    console.error('Error deleting PDF:', error);
    throw error;
  }
};

/**
 * Get all PDF keys from IndexedDB
 * @returns {Promise<string[]>}
 */
export const getAllPDFKeys = async () => {
  try {
    const db = await openDB();
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    
    return new Promise((resolve, reject) => {
      const request = store.getAllKeys();
      
      request.onsuccess = () => {
        db.close();
        resolve(request.result);
      };
      
      request.onerror = () => {
        db.close();
        reject(new Error('Failed to get PDF keys'));
      };
    });
  } catch (error) {
    console.error('Error getting PDF keys:', error);
    return [];
  }
};

/**
 * Clear all PDFs from IndexedDB (useful for cleanup)
 * @returns {Promise<void>}
 */
export const clearAllPDFs = async () => {
  try {
    const db = await openDB();
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    
    return new Promise((resolve, reject) => {
      const request = store.clear();
      
      request.onsuccess = () => {
        db.close();
        resolve();
      };
      
      request.onerror = () => {
        db.close();
        reject(new Error('Failed to clear PDFs'));
      };
    });
  } catch (error) {
    console.error('Error clearing PDFs:', error);
    throw error;
  }
};

/**
 * Convert Blob to base64 data URL (for displaying PDFs)
 * @param {Blob} blob - The PDF blob
 * @returns {Promise<string>}
 */
export const blobToDataURL = (blob) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};
