import { useState } from 'react';
import { X, CheckCircle, AlertCircle, Edit2 } from 'lucide-react';
import '../styles/MetadataApproval.css';

const MetadataApproval = ({ fileName, metadata, onApprove, onReject, onEdit }) => {
  const [editedMetadata, setEditedMetadata] = useState(metadata);
  const [isEditing, setIsEditing] = useState(false);

  const handleInputChange = (field, value) => {
    setEditedMetadata(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleApprove = () => {
    onApprove(editedMetadata);
  };

  const metadataFields = [
    { key: 'title', label: 'Title' },
    { key: 'authors', label: 'Author(s)' },
    { key: 'year', label: 'Year' },
    { key: 'journal', label: 'Journal/Conference' },
    { key: 'volume', label: 'Volume' },
    { key: 'issue', label: 'Issue' },
    { key: 'pages', label: 'Pages' },
    { key: 'doi', label: 'DOI' }
  ];

  return (
    <div className="metadata-approval-overlay">
      <div className="metadata-approval-modal">
        <div className="metadata-approval-header">
          <div className="metadata-header-content">
            <CheckCircle size={24} className="metadata-icon-success" />
            <h2>Review Extracted Metadata</h2>
          </div>
          <button onClick={onReject} className="metadata-close-btn">
            <X size={20} />
          </button>
        </div>

        <div className="metadata-approval-body">
          <div className="metadata-file-info">
            <AlertCircle size={18} />
            <span>File: <strong>{fileName}</strong></span>
          </div>

          <div className="metadata-toggle-edit">
            <button 
              onClick={() => setIsEditing(!isEditing)}
              className="metadata-edit-toggle-btn"
            >
              <Edit2 size={16} />
              {isEditing ? 'View Mode' : 'Edit Metadata'}
            </button>
          </div>

          <div className="metadata-fields">
            {metadataFields.map(({ key, label }) => (
              <div key={key} className="metadata-field">
                <label className="metadata-label">{label}</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedMetadata[key] || ''}
                    onChange={(e) => handleInputChange(key, e.target.value)}
                    className="metadata-input"
                    placeholder="Not found"
                  />
                ) : (
                  <div className="metadata-value">
                    {editedMetadata[key] || <span style={{color: '#888', fontStyle: 'italic'}}>Not found</span>}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="metadata-warning">
            <AlertCircle size={16} />
            <p>Please review the extracted metadata carefully. You can edit any field if needed. The file will only be uploaded if you approve.</p>
          </div>
        </div>

        <div className="metadata-approval-footer">
          <button onClick={onReject} className="metadata-btn metadata-btn-reject">
            Reject & Cancel
          </button>
          <button onClick={handleApprove} className="metadata-btn metadata-btn-approve">
            <CheckCircle size={18} />
            Approve & Upload
          </button>
        </div>
      </div>
    </div>
  );
};

export default MetadataApproval;
