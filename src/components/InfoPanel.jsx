import { Info, Github, Coffee, Heart, BookOpen, FileText, Upload } from 'lucide-react';
import '../styles/InfoPanel.css';

const InfoPanel = () => {
  return (
    <div className="info-panel">
      <div className="info-header">
        <h3>About</h3>
      </div>

      <div className="info-content">
        <div className="info-hero">
          <div className="info-icon">
            <BookOpen size={48} />
          </div>
          <h2>Paper Writing Dashboard</h2>
          <p className="version">Version 1.0.0</p>
        </div>

        <div className="info-section">
          <h4>Features</h4>
          <ul className="feature-list">
            <li>
              <FileText size={16} />
              <span>Cloud storage with Firebase (Firestore + Storage)</span>
            </li>
            <li>
              <Upload size={16} />
              <span>PDF viewer with zoom and navigation</span>
            </li>
            <li>
              <BookOpen size={16} />
              <span>Reference manager with multiple styles</span>
            </li>
            <li>
              <FileText size={16} />
              <span>Google authentication for secure access</span>
            </li>
            <li>
              <Upload size={16} />
              <span>Per-user isolated data storage</span>
            </li>
          </ul>
        </div>

        <div className="info-section">
          <h4>Keyboard Shortcuts</h4>
          <div className="shortcuts-list">
            <div className="shortcut-item">
              <span className="shortcut-key">Ctrl+S</span>
              <span className="shortcut-desc">Save current file</span>
            </div>
            <div className="shortcut-item">
              <span className="shortcut-key">Ctrl+Shift+E</span>
              <span className="shortcut-desc">Show Explorer</span>
            </div>
            <div className="shortcut-item">
              <span className="shortcut-key">Ctrl+Shift+F</span>
              <span className="shortcut-desc">Show Search</span>
            </div>
            <div className="shortcut-item">
              <span className="shortcut-key">Esc</span>
              <span className="shortcut-desc">Cancel operation</span>
            </div>
          </div>
        </div>

        <div className="info-section">
          <h4>Technologies</h4>
          <div className="tech-list">
            <span className="tech-badge">React</span>
            <span className="tech-badge">Vite</span>
            <span className="tech-badge">Firebase</span>
            <span className="tech-badge">Firestore</span>
            <span className="tech-badge">PDF.js</span>
            <span className="tech-badge">DnD Kit</span>
          </div>
        </div>

        <div className="info-section">
          <h4>Cloud Storage</h4>
          <p className="info-text">
            All your folders and PDF files are stored securely in Firebase Cloud. 
            Your data syncs across all devices where you're signed in. Each user has completely isolated data storage.
          </p>
          <p className="info-text" style={{ marginTop: '10px', fontSize: '12px', color: '#858585' }}>
            ⚠️ Sign in required to create folders and upload files.
          </p>
        </div>

        <div className="info-footer">
          <p>
            Made with <Heart size={14} className="heart-icon" /> for researchers and writers
          </p>
          <p className="copyright">© 2026 Paper Writing Dashboard</p>
        </div>
      </div>
    </div>
  );
};

export default InfoPanel;
