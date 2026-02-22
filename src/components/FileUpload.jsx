import { useRef, useState } from 'react';
import { useFileSystem } from '../context/FileSystemContext';
import { Upload, X, Loader } from 'lucide-react';
import { processPDFForMetadata } from '../services/geminiService';
import MetadataApproval from './MetadataApproval';
import '../styles/FileUpload.css';

const FileUpload = ({ onClose }) => {
  const { addFile, selectedFolder } = useFileSystem();
  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [extractingMetadata, setExtractingMetadata] = useState(false);
  const [pendingFile, setPendingFile] = useState(null);
  const [extractedMetadata, setExtractedMetadata] = useState(null);
  const [pendingFiles, setPendingFiles] = useState([]);

  const handleFileRead = async (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        resolve({
          name: file.name,
          type: file.type,
          size: file.size,
          content: e.target.result,
        });
      };

      if (file.type.includes('pdf') || file.type.includes('image')) {
        reader.readAsDataURL(file);
      } else {
        reader.readAsText(file);
      }
    });
  };

  const processFiles = async (files) => {
    // Filter only PDF files
    const pdfFiles = files.filter(file => 
      file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')
    );

    if (pdfFiles.length === 0) {
      alert('Only PDF files are allowed.');
      return;
    }

    if (pdfFiles.length < files.length) {
      alert(`Only ${pdfFiles.length} PDF file(s) will be processed. Other file types were skipped.`);
    }

    if (!selectedFolder) {
      alert('Please select a folder first. You cannot upload files to the root workspace.');
      return;
    }
    
    // Store files to process and process first one
    setPendingFiles(pdfFiles);
    await processNextFile(pdfFiles);
  };

  const processNextFile = async (filesToProcess) => {
    if (filesToProcess.length === 0) {
      // All files processed, close modal
      if (onClose) onClose();
      return;
    }

    const currentFile = filesToProcess[0];
    setExtractingMetadata(true);
    setPendingFile(currentFile);

    try {
      // Extract metadata using Gemini API
      const result = await processPDFForMetadata(currentFile);

      if (result.success) {
        // Show approval modal with extracted metadata
        setExtractedMetadata(result.metadata);
      } else {
        // Metadata extraction failed
        alert(`Failed to extract metadata from ${currentFile.name}: ${result.error}\n\nFile will not be uploaded.`);
        
        // Move to next file
        const remainingFiles = filesToProcess.slice(1);
        setPendingFiles(remainingFiles);
        await processNextFile(remainingFiles);
      }
    } catch (error) {
      console.error('Error processing file:', error);
      alert(`Error processing ${currentFile.name}: ${error.message}\n\nFile will not be uploaded.`);
      
      // Move to next file
      const remainingFiles = filesToProcess.slice(1);
      setPendingFiles(remainingFiles);
      await processNextFile(remainingFiles);
    } finally {
      setExtractingMetadata(false);
    }
  };

  const handleMetadataApprove = async (approvedMetadata) => {
    setUploading(true);
    
    try {
      // Upload file with approved metadata
      await addFile(selectedFolder.id, pendingFile, approvedMetadata);
      
      // Clear current file and metadata
      setPendingFile(null);
      setExtractedMetadata(null);
      
      // Process next file
      const remainingFiles = pendingFiles.slice(1);
      setPendingFiles(remainingFiles);
      setUploading(false);
      
      await processNextFile(remainingFiles);
    } catch (error) {
      console.error('Error uploading file:', error);
      alert(`Failed to upload ${pendingFile.name}: ${error.message}`);
      setUploading(false);
      
      // Move to next file anyway
      const remainingFiles = pendingFiles.slice(1);
      setPendingFiles(remainingFiles);
      setPendingFile(null);
      setExtractedMetadata(null);
      await processNextFile(remainingFiles);
    }
  };

  const handleMetadataReject = async () => {
    // User rejected metadata, skip this file
    setPendingFile(null);
    setExtractedMetadata(null);
    
    // Process next file
    const remainingFiles = pendingFiles.slice(1);
    setPendingFiles(remainingFiles);
    await processNextFile(remainingFiles);
  };

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      await processFiles(files);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      await processFiles(files);
    }
  };

  return (
    <>
      <div className="file-upload-modal">
        <div className="file-upload-content">
          <div className="upload-header">
            <h3>Upload Files</h3>
            <button onClick={onClose} className="close-btn" disabled={extractingMetadata || uploading}>
              <X size={20} />
            </button>
          </div>

          {extractingMetadata ? (
            <div className="upload-zone extracting">
              <Loader size={48} className="spinner" />
              <p className="upload-text">
                Extracting metadata using Gemini AI...
              </p>
              <p className="upload-hint">
                Please wait while we analyze your PDF
              </p>
            </div>
          ) : (
            <div
              className={`upload-zone ${isDragging ? 'dragging' : ''}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => !uploading && fileInputRef.current?.click()}
            >
              <Upload size={48} />
              <p className="upload-text">
                {uploading ? 'Uploading approved file...' : 'Drag & drop PDF files here or click to browse'}
              </p>
              <p className="upload-hint">
                PDF metadata will be extracted using AI before upload
              </p>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileSelect}
            style={{ display: 'none' }}
            accept=".pdf,application/pdf"
            disabled={extractingMetadata || uploading}
          />
        </div>
      </div>

      {/* Show metadata approval modal */}
      {extractedMetadata && pendingFile && (
        <MetadataApproval
          fileName={pendingFile.name}
          metadata={extractedMetadata}
          onApprove={handleMetadataApprove}
          onReject={handleMetadataReject}
        />
      )}
    </>
  );
};

export default FileUpload;
