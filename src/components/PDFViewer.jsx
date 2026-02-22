import { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Download } from 'lucide-react';
import { useFileSystem } from '../context/FileSystemContext';
import '../styles/PDFViewer.css';

// ✅ Correct worker setup for Vite
pdfjs.GlobalWorkerOptions.workerSrc = 
  `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const PDFViewer = ({ file }) => {
  const { downloadFile } = useFileSystem();
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
    setPageNumber(1);
  };

  const changePage = (offset) => {
    setPageNumber(prev => prev + offset);
  };

  const previousPage = () => changePage(-1);
  const nextPage = () => changePage(1);

  const zoomIn = () => {
    setScale(prev => Math.min(prev + 0.2, 3.0));
  };

  const zoomOut = () => {
    setScale(prev => Math.max(prev - 0.2, 0.5));
  };

  const downloadPDF = () => {
    downloadFile(file);
  };

  if (!file.content && !file.url) {
    return <div className="pdf-error">No PDF content available</div>;
  }

  return (
    <div className="pdf-viewer">
      <div className="pdf-controls">
        <div className="pdf-navigation">
          <button onClick={previousPage} disabled={pageNumber <= 1}>
            <ChevronLeft size={20} />
          </button>
          <span className="page-info">
            Page {pageNumber} of {numPages || '--'}
          </span>
          <button onClick={nextPage} disabled={pageNumber >= numPages}>
            <ChevronRight size={20} />
          </button>
        </div>

        <div className="pdf-zoom">
          <button onClick={zoomOut} disabled={scale <= 0.5}>
            <ZoomOut size={20} />
          </button>
          <span className="zoom-level">{Math.round(scale * 100)}%</span>
          <button onClick={zoomIn} disabled={scale >= 3.0}>
            <ZoomIn size={20} />
          </button>
        </div>

        <button onClick={downloadPDF} className="download-btn">
          <Download size={20} />
          <span>Download</span>
        </button>
      </div>

      <div className="pdf-content">
        <Document
          file={file.url || file.content}
          onLoadSuccess={onDocumentLoadSuccess}
          onLoadError={(error) => console.error('Error loading PDF:', error)}
          loading={<div className="pdf-loading">Loading PDF...</div>}
          error={<div className="pdf-error">Failed to load PDF</div>}
        >
          <Page
            pageNumber={pageNumber}
            scale={scale}
            renderTextLayer={true}
            renderAnnotationLayer={true}
          />
        </Document>
      </div>
    </div>
  );
};

export default PDFViewer;
