import { useEffect, useState } from 'react';
import Editor from '@monaco-editor/react';
import { useFileSystem } from '../context/FileSystemContext';
import { Save, FileText } from 'lucide-react';
import '../styles/PaperEditor.css';

const PaperEditor = ({ file }) => {
  const { updateFileContent } = useFileSystem();
  const [content, setContent] = useState(file?.content || '');
  const [hasChanges, setHasChanges] = useState(false);
  const [wordCount, setWordCount] = useState(0);

  useEffect(() => {
    setContent(file?.content || '');
    setHasChanges(false);
  }, [file?.id]);

  useEffect(() => {
    if (content) {
      const words = content.trim().split(/\s+/).filter(word => word.length > 0);
      setWordCount(words.length);
    } else {
      setWordCount(0);
    }
  }, [content]);

  const handleEditorChange = (value) => {
    setContent(value || '');
    setHasChanges(true);
  };

  const handleSave = () => {
    if (file && hasChanges) {
      updateFileContent(file.id, content);
      setHasChanges(false);
    }
  };

  // Auto-save every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (hasChanges && file) {
        handleSave();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [hasChanges, content, file]);

  // Save on Ctrl+S
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [content, file]);

  if (!file) {
    return (
      <div className="editor-empty">
        <FileText size={64} />
        <p>Select a file to start editing</p>
      </div>
    );
  }

  return (
    <div className="paper-editor">
      <div className="editor-toolbar">
        <div className="editor-info">
          <span className="file-name">{file.name}</span>
          {hasChanges && <span className="unsaved-indicator">• Unsaved changes</span>}
        </div>
        
        <div className="editor-stats">
          <span className="word-count">{wordCount} words</span>
          <button 
            onClick={handleSave} 
            className={`save-btn ${hasChanges ? 'has-changes' : ''}`}
            disabled={!hasChanges}
          >
            <Save size={16} />
            <span>Save</span>
          </button>
        </div>
      </div>

      <div className="editor-container">
        <Editor
          height="100%"
          language={getLanguage(file.name)}
          value={content}
          onChange={handleEditorChange}
          theme="vs-dark"
          options={{
            minimap: { enabled: true },
            fontSize: 14,
            wordWrap: 'on',
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 2,
            padding: { top: 16, bottom: 16 },
          }}
        />
      </div>
    </div>
  );
};

const getLanguage = (filename) => {
  const ext = filename.split('.').pop()?.toLowerCase();
  const languageMap = {
    'js': 'javascript',
    'jsx': 'javascript',
    'ts': 'typescript',
    'tsx': 'typescript',
    'json': 'json',
    'md': 'markdown',
    'html': 'html',
    'css': 'css',
    'py': 'python',
    'txt': 'plaintext',
  };
  return languageMap[ext] || 'markdown';
};

export default PaperEditor;
