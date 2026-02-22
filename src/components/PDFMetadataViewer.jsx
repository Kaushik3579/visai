import { useState } from 'react';
import { useFileSystem } from '../context/FileSystemContext';
import { 
  BookOpen, 
  Users, 
  Calendar, 
  BookMarked, 
  FileText, 
  Hash, 
  Copy,
  CheckCircle,
  ExternalLink,
  Edit,
  Save,
  X
} from 'lucide-react';
import '../styles/PDFMetadataViewer.css';

const PDFMetadataViewer = ({ file }) => {
  const { updateFileMetadata } = useFileSystem();
  const [copiedField, setCopiedField] = useState(null);
  const [citationStyle, setCitationStyle] = useState('apa');
  const [isEditing, setIsEditing] = useState(false);
  const [editedMetadata, setEditedMetadata] = useState({});
  const [saving, setSaving] = useState(false);

  const metadata = file?.metadata || {};

  const startEditing = () => {
    setEditedMetadata({
      title: metadata.title || '',
      authors: metadata.authors || '',
      year: metadata.year || '',
      journal: metadata.journal || '',
      volume: metadata.volume || '',
      issue: metadata.issue || '',
      pages: metadata.pages || '',
      doi: metadata.doi || ''
    });
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setEditedMetadata({});
  };

  const saveMetadata = async () => {
    setSaving(true);
    const success = await updateFileMetadata(file.id, editedMetadata);
    setSaving(false);
    
    if (success) {
      setIsEditing(false);
      setEditedMetadata({});
    }
  };

  const handleMetadataChange = (field, value) => {
    setEditedMetadata(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const copyToClipboard = (text, fieldName) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const formatCitation = (meta, style) => {
    const authors = meta.authors || 'Unknown Author';
    const year = meta.year || 'n.d.';
    const title = meta.title || file.name;
    const journal = meta.journal || '';
    const volume = meta.volume || '';
    const issue = meta.issue || '';
    const pages = meta.pages || '';
    const doi = meta.doi || '';

    switch (style) {
      case 'apa':
        return `${authors} (${year}). ${title}. ${journal}${volume ? `, ${volume}` : ''}${issue ? `(${issue})` : ''}${pages ? `, ${pages}` : ''}. ${doi ? `https://doi.org/${doi}` : ''}`;
      
      case 'mla':
        return `${authors}. "${title}." ${journal}${volume ? ` ${volume}` : ''}${issue ? `.${issue}` : ''} (${year})${pages ? `: ${pages}` : ''}. ${doi ? `doi:${doi}` : ''}`;
      
      case 'chicago':
        return `${authors}. "${title}." ${journal}${volume ? ` ${volume}` : ''}${issue ? `, no. ${issue}` : ''} (${year})${pages ? `: ${pages}` : ''}. ${doi ? `https://doi.org/${doi}` : ''}`;
      
      case 'bibtex':
        const firstAuthor = authors.split(',')[0].split(' ').pop().toLowerCase();
        const key = `${firstAuthor}${year}`;
        return `@article{${key},
  title={${title}},
  author={${authors}},
  journal={${journal}},
  volume={${volume}},
  ${issue ? `number={${issue}},` : ''}
  pages={${pages}},
  year={${year}},
  ${doi ? `doi={${doi}}` : ''}
}`;
      
      default:
        return `${authors} (${year}). ${title}.`;
    }
  };

  const copyCitation = () => {
    const citation = formatCitation(metadata, citationStyle);
    copyToClipboard(citation, 'citation');
  };

  const metadataFields = [
    { 
      label: 'Title', 
      value: metadata.title || 'Not available', 
      icon: BookOpen,
      field: 'title' 
    },
    { 
      label: 'Authors', 
      value: metadata.authors || 'Not available', 
      icon: Users,
      field: 'authors' 
    },
    { 
      label: 'Year', 
      value: metadata.year || 'Not available', 
      icon: Calendar,
      field: 'year' 
    },
    { 
      label: 'Journal', 
      value: metadata.journal || 'Not available', 
      icon: BookMarked,
      field: 'journal' 
    },
    { 
      label: 'Volume', 
      value: metadata.volume || 'Not available', 
      icon: Hash,
      field: 'volume' 
    },
    { 
      label: 'Issue', 
      value: metadata.issue || 'Not available', 
      icon: Hash,
      field: 'issue' 
    },
    { 
      label: 'Pages', 
      value: metadata.pages || 'Not available', 
      icon: FileText,
      field: 'pages' 
    },
    { 
      label: 'DOI', 
      value: metadata.doi || 'Not available', 
      icon: ExternalLink,
      field: 'doi',
      isLink: true,
      href: metadata.doi ? `https://doi.org/${metadata.doi}` : null
    }
  ];

  return (
    <div className="pdf-metadata-viewer">
      <div className="metadata-header">
        <div className="header-content">
          <BookOpen size={32} className="header-icon" />
          <div>
            <h2>{file.name}</h2>
            <p className="file-info">Bibliographic Metadata</p>
          </div>
        </div>
        <div className="header-actions">
          {!isEditing ? (
            <button onClick={startEditing} className="edit-btn">
              <Edit size={18} />
              <span>Edit Metadata</span>
            </button>
          ) : (
            <div className="edit-actions">
              <button onClick={saveMetadata} disabled={saving} className="save-btn">
                <Save size={18} />
                <span>{saving ? 'Saving...' : 'Save'}</span>
              </button>
              <button onClick={cancelEditing} disabled={saving} className="cancel-btn">
                <X size={18} />
                <span>Cancel</span>
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="metadata-content">
        <div className="metadata-section">
          <h3>Document Information</h3>
          <div className="metadata-table">
            <table>
              <thead>
                <tr>
                  <th>Field</th>
                  <th>Value</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {metadataFields.map(field => (
                  <tr key={field.field}>
                    <td className="field-label">
                      <field.icon size={16} />
                      <span>{field.label}</span>
                    </td>
                    <td className="field-value">
                      {isEditing ? (
                        <input
                          type="text"
                          value={editedMetadata[field.field] || ''}
                          onChange={(e) => handleMetadataChange(field.field, e.target.value)}
                          className="metadata-input"
                          placeholder={`Enter ${field.label.toLowerCase()}`}
                        />
                      ) : (
                        field.isLink && field.href ? (
                          <a 
                            href={field.href} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="doi-link"
                          >
                            {field.value}
                          </a>
                        ) : (
                          <span className={field.value === 'Not available' ? 'not-available' : ''}>
                            {field.value}
                          </span>
                        )
                      )}
                    </td>
                    <td className="field-actions">
                      {!isEditing && field.value !== 'Not available' && (
                        <button
                          onClick={() => copyToClipboard(field.value, field.field)}
                          className="copy-btn"
                          title="Copy to clipboard"
                        >
                          {copiedField === field.field ? (
                            <CheckCircle size={16} className="copied" />
                          ) : (
                            <Copy size={16} />
                          )}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="citation-section">
          <div className="citation-header-section">
            <h3>Generated Citation</h3>
            <p className="citation-description">Format your reference in multiple citation styles</p>
          </div>
          
          <div className="citation-style-buttons">
            {['apa', 'mla', 'chicago', 'bibtex'].map(style => (
              <button
                key={style}
                onClick={() => setCitationStyle(style)}
                className={`style-btn ${citationStyle === style ? 'active' : ''}`}
              >
                {style.toUpperCase()}
              </button>
            ))}
          </div>

          <div className="citation-preview-card">
            <div className="citation-label">
              {citationStyle.toUpperCase()} Format
            </div>
            <div className="citation-text">
              {formatCitation(metadata, citationStyle)}
            </div>
            <button onClick={copyCitation} className="copy-citation-btn">
              {copiedField === 'citation' ? (
                <>
                  <CheckCircle size={18} />
                  <span>Copied to Clipboard!</span>
                </>
              ) : (
                <>
                  <Copy size={18} />
                  <span>Copy Citation</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PDFMetadataViewer;
