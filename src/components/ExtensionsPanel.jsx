import { useState } from 'react';
import { Puzzle, Download, Check, X, Info } from 'lucide-react';
import '../styles/ExtensionsPanel.css';

const ExtensionsPanel = () => {
  const [installedExtensions, setInstalledExtensions] = useState([
    {
      id: 'pdf-annotator',
      name: 'PDF Annotator',
      description: 'Add highlights and notes to your PDFs',
      version: '1.0.0',
      enabled: true,
      installed: true
    },
    {
      id: 'citation-formatter',
      name: 'Citation Formatter',
      description: 'Format citations in multiple styles (APA, MLA, Chicago)',
      version: '2.1.0',
      enabled: true,
      installed: true
    }
  ]);

  const [availableExtensions] = useState([
    {
      id: 'grammar-check',
      name: 'Grammar Check Plus',
      description: 'Advanced grammar and style checking for academic writing',
      version: '1.5.0',
      installed: false
    },
    {
      id: 'reference-sync',
      name: 'Reference Sync',
      description: 'Sync your references with Zotero and Mendeley',
      version: '1.2.3',
      installed: false
    },
    {
      id: 'latex-support',
      name: 'LaTeX Support',
      description: 'Write mathematical equations using LaTeX syntax',
      version: '3.0.0',
      installed: false
    }
  ]);

  const toggleExtension = (id) => {
    setInstalledExtensions(prev =>
      prev.map(ext =>
        ext.id === id ? { ...ext, enabled: !ext.enabled } : ext
      )
    );
  };

  const installExtension = (extension) => {
    setInstalledExtensions(prev => [
      ...prev,
      { ...extension, installed: true, enabled: true }
    ]);
  };

  const uninstallExtension = (id) => {
    setInstalledExtensions(prev =>
      prev.filter(ext => ext.id !== id)
    );
  };

  return (
    <div className="extensions-panel">
      <div className="extensions-header">
        <Puzzle size={20} />
        <h3>Extensions</h3>
      </div>

      <div className="extensions-content">
        {/* Installed Extensions */}
        <div className="extensions-section">
          <h4>Installed ({installedExtensions.length})</h4>
          <div className="extensions-list">
            {installedExtensions.map(ext => (
              <div key={ext.id} className="extension-item installed">
                <div className="extension-icon">
                  <Puzzle size={20} />
                </div>
                <div className="extension-details">
                  <div className="extension-name">
                    {ext.name}
                    <span className="extension-version">v{ext.version}</span>
                  </div>
                  <p className="extension-description">{ext.description}</p>
                </div>
                <div className="extension-actions">
                  <button
                    className={`extension-toggle ${ext.enabled ? 'enabled' : 'disabled'}`}
                    onClick={() => toggleExtension(ext.id)}
                    title={ext.enabled ? 'Disable' : 'Enable'}
                  >
                    {ext.enabled ? <Check size={16} /> : <X size={16} />}
                  </button>
                  <button
                    className="extension-uninstall"
                    onClick={() => uninstallExtension(ext.id)}
                    title="Uninstall"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Available Extensions */}
        <div className="extensions-section">
          <h4>Available</h4>
          <div className="extensions-list">
            {availableExtensions
              .filter(ext => !installedExtensions.find(installed => installed.id === ext.id))
              .map(ext => (
                <div key={ext.id} className="extension-item available">
                  <div className="extension-icon">
                    <Puzzle size={20} />
                  </div>
                  <div className="extension-details">
                    <div className="extension-name">
                      {ext.name}
                      <span className="extension-version">v{ext.version}</span>
                    </div>
                    <p className="extension-description">{ext.description}</p>
                  </div>
                  <div className="extension-actions">
                    <button
                      className="extension-install"
                      onClick={() => installExtension(ext)}
                      title="Install"
                    >
                      <Download size={16} />
                      Install
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Info */}
        <div className="extensions-info">
          <Info size={16} />
          <p>Extensions enhance VISAI with additional features. Enable or disable installed extensions, or browse available extensions to install.</p>
        </div>
      </div>
    </div>
  );
};

export default ExtensionsPanel;
