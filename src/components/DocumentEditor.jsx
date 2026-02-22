import { useEffect, useRef, useState } from 'react';
import { useDocuments } from '../context/DocumentContext';
import { useFileSystem } from '../context/FileSystemContext';
import { Save, X, Type, AlignLeft, AlignCenter, AlignRight, AlignJustify, Bold, Italic, Underline, List, ListOrdered, Image as ImageIcon, Table, Link, Code, Brain, CheckCircle, AlertCircle, Loader, FileText } from 'lucide-react';
import { checkGrammar, checkSpelling, summarizeText, generateInlineCitation } from '../services/acronService';
import '../styles/DocumentEditor.css';

const DocumentEditor = () => {
  const { selectedDocument, openDocuments, updateDocumentContent, closeDocument, openDocument } = useDocuments();
  const { fileTree } = useFileSystem();
  const editorRef = useRef(null);
  const [fontSize, setFontSize] = useState(14);
  const [fontFamily, setFontFamily] = useState('Arial');
  const [showAcron, setShowAcron] = useState(false);
  const [acronFeature, setAcronFeature] = useState('grammar');
  const [selectedText, setSelectedText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [summaryType, setSummaryType] = useState('brief');
  
  // Get all PDFs from file tree
  const getAllPDFs = (node) => {
    let pdfs = [];
    if (node.type === 'file' && node.fileType?.includes('pdf')) {
      pdfs.push(node);
    }
    if (node.children) {
      node.children.forEach(child => {
        pdfs = pdfs.concat(getAllPDFs(child));
      });
    }
    return pdfs;
  };
  
  const allPDFs = fileTree ? getAllPDFs(fileTree) : [];

  useEffect(() => {
    if (editorRef.current && selectedDocument) {
      // Only update innerHTML when document changes, not on every input
      if (editorRef.current.innerHTML !== selectedDocument.content) {
        editorRef.current.innerHTML = selectedDocument.content || '';
      }
      editorRef.current.focus();
    }
  }, [selectedDocument?.id]); // Only when document ID changes

  const handleContentChange = (e) => {
    if (selectedDocument) {
      updateDocumentContent(selectedDocument.id, e.target.innerHTML);
    }
  };

  const execCommand = (command, value = null) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
  };

  const insertTable = () => {
    const rows = prompt('Number of rows:', '3');
    const cols = prompt('Number of columns:', '3');
    
    if (rows && cols) {
      let tableHTML = '<table border="1" style="border-collapse: collapse; width: 100%; margin: 10px 0;"><tbody>';
      for (let i = 0; i < parseInt(rows); i++) {
        tableHTML += '<tr>';
        for (let j = 0; j < parseInt(cols); j++) {
          tableHTML += '<td style="border: 1px solid #ddd; padding: 8px;">Cell</td>';
        }
        tableHTML += '</tr>';
      }
      tableHTML += '</tbody></table>';
      
      execCommand('insertHTML', tableHTML);
    }
  };

  const insertImage = () => {
    const url = prompt('Enter image URL:', 'https://');
    if (url) {
      execCommand('insertImage', url);
    }
  };

  const insertLink = () => {
    const url = prompt('Enter link URL:', 'https://');
    if (url) {
      execCommand('createLink', url);
    }
  };

  const changeFontSize = (size) => {
    setFontSize(size);
    execCommand('fontSize', '7');
    const fontElements = document.getElementsByTagName('font');
    for (let element of fontElements) {
      if (element.size === '7') {
        element.removeAttribute('size');
        element.style.fontSize = size + 'px';
      }
    }
  };

  const changeFontFamily = (family) => {
    setFontFamily(family);
    execCommand('fontName', family);
  };

  const handleOpenAcron = () => {
    const selection = window.getSelection();
    const text = selection.toString().trim();
    
    if (!text) {
      alert('Please select some text first before opening ACRON AI Engine.');
      return;
    }
    
    setSelectedText(text);
    setShowAcron(true);
    setResult(null);
    setError(null);
  };

  const handleCloseAcron = () => {
    setShowAcron(false);
    setSelectedText('');
    setResult(null);
    setError(null);
    setAcronFeature('grammar');
  };

  const handleGrammarCheck = async () => {
    setIsProcessing(true);
    setError(null);
    try {
      const result = await checkGrammar(selectedText);
      setResult(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSpellCheck = async () => {
    setIsProcessing(true);
    setError(null);
    try {
      const result = await checkSpelling(selectedText);
      setResult(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSummarize = async () => {
    setIsProcessing(true);
    setError(null);
    try {
      const summary = await summarizeText(selectedText, summaryType);
      setResult({ summary });
    } catch (err) {
      setError(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCitation = async () => {
    setIsProcessing(true);
    setError(null);
    try {
      const citationResult = await generateInlineCitation(selectedText, allPDFs);
      setResult(citationResult);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsProcessing(false);
    }
  };
  
  const insertCitation = (citation) => {
    if (editorRef.current) {
      const selection = window.getSelection();
      if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        range.collapse(false); // Move to end of selection
        
        const citationNode = document.createTextNode(` ${citation}`);
        range.insertNode(citationNode);
        
        // Trigger content change
        if (selectedDocument) {
          updateDocumentContent(selectedDocument.id, editorRef.current.innerHTML);
        }
      }
    }
  };

  const handleSaveCorrection = () => {
    if (!result || !result.correctedText) return;
    
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      range.deleteContents();
      range.insertNode(document.createTextNode(result.correctedText));
      
      // Trigger content change
      if (selectedDocument) {
        updateDocumentContent(selectedDocument.id, editorRef.current.innerHTML);
      }
      
      handleCloseAcron();
    }
  };

  if (!selectedDocument) {
    return (
      <div className="document-editor-empty">
        <div className="empty-message">
          <p>No document selected</p>
          <span>Create or open a paper from the sidebar to start writing</span>
        </div>
      </div>
    );
  }

  return (
    <div className="document-editor">
      <div className="editor-tabs">
        {openDocuments.map(doc => (
          <div
            key={doc.id}
            className={`editor-tab ${selectedDocument?.id === doc.id ? 'active' : ''}`}
            onClick={() => openDocument(doc)}
          >
            <span className="tab-name">{doc.name}</span>
            <button
              className="tab-close"
              onClick={(e) => {
                e.stopPropagation();
                closeDocument(doc.id);
              }}
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>

      <div className="editor-toolbar">
        <div className="toolbar-group">
          <select 
            value={fontFamily} 
            onChange={(e) => changeFontFamily(e.target.value)}
            className="toolbar-select"
            title="Font Family"
          >
            <option value="Arial">Arial</option>
            <option value="Times New Roman">Times New Roman</option>
            <option value="Georgia">Georgia</option>
            <option value="Courier New">Courier New</option>
            <option value="Verdana">Verdana</option>
            <option value="Comic Sans MS">Comic Sans MS</option>
          </select>

          <select 
            value={fontSize} 
            onChange={(e) => changeFontSize(e.target.value)}
            className="toolbar-select toolbar-select-small"
            title="Font Size"
          >
            {[10, 11, 12, 14, 16, 18, 20, 24, 28, 32, 36].map(size => (
              <option key={size} value={size}>{size}</option>
            ))}
          </select>
        </div>

        <div className="toolbar-separator"></div>

        <div className="toolbar-group">
          <button onClick={() => execCommand('bold')} className="toolbar-btn" title="Bold (Ctrl+B)">
            <Bold size={18} />
          </button>
          <button onClick={() => execCommand('italic')} className="toolbar-btn" title="Italic (Ctrl+I)">
            <Italic size={18} />
          </button>
          <button onClick={() => execCommand('underline')} className="toolbar-btn" title="Underline (Ctrl+U)">
            <Underline size={18} />
          </button>
        </div>

        <div className="toolbar-separator"></div>

        <div className="toolbar-group">
          <button onClick={() => execCommand('justifyLeft')} className="toolbar-btn" title="Align Left">
            <AlignLeft size={18} />
          </button>
          <button onClick={() => execCommand('justifyCenter')} className="toolbar-btn" title="Align Center">
            <AlignCenter size={18} />
          </button>
          <button onClick={() => execCommand('justifyRight')} className="toolbar-btn" title="Align Right">
            <AlignRight size={18} />
          </button>
          <button onClick={() => execCommand('justifyFull')} className="toolbar-btn" title="Justify">
            <AlignJustify size={18} />
          </button>
        </div>

        <div className="toolbar-separator"></div>

        <div className="toolbar-group">
          <button onClick={() => execCommand('insertUnorderedList')} className="toolbar-btn" title="Bullet List">
            <List size={18} />
          </button>
          <button onClick={() => execCommand('insertOrderedList')} className="toolbar-btn" title="Numbered List">
            <ListOrdered size={18} />
          </button>
        </div>

        <div className="toolbar-separator"></div>

        <div className="toolbar-group">
          <button onClick={insertTable} className="toolbar-btn" title="Insert Table">
            <Table size={18} />
          </button>
          <button onClick={insertImage} className="toolbar-btn" title="Insert Image">
            <ImageIcon size={18} />
          </button>
          <button onClick={insertLink} className="toolbar-btn" title="Insert Link">
            <Link size={18} />
          </button>
        </div>

        <div className="toolbar-separator"></div>

        <div className="toolbar-group">
          <input 
            type="color" 
            onChange={(e) => execCommand('foreColor', e.target.value)}
            className="toolbar-color"
            title="Text Color"
          />
          <input 
            type="color" 
            onChange={(e) => execCommand('backColor', e.target.value)}
            className="toolbar-color"
            title="Background Color"
          />
        </div>

        <div className="toolbar-separator"></div>

        <div className="toolbar-group">
          <button 
            onClick={handleOpenAcron}
            className={`toolbar-btn acron-btn ${showAcron ? 'active' : ''}`}
            title="ACRON AI Engine - Select text first"
          >
            <Brain size={18} />
            <span className="acron-label">ACRON</span>
          </button>
        </div>
      </div>

      <div 
        ref={editorRef}
        contentEditable
        className="editor-content"
        onInput={handleContentChange}
        suppressContentEditableWarning
      />

      {showAcron && (
        <div className="acron-modal">
          <div className="acron-modal-content">
            <div className="acron-header">
              <div className="acron-title">
                <Brain size={20} />
                <h3>ACRON AI Engine</h3>
              </div>
              <button onClick={handleCloseAcron} className="acron-close">
                <X size={20} />
              </button>
            </div>
            
            <div className="acron-selected-text">
              <div className="selected-text-label">Selected Text:</div>
              <div className="selected-text-content">
                {selectedText.length > 200 ? `${selectedText.substring(0, 200)}...` : selectedText}
              </div>
            </div>

            <div className="acron-tabs">
              <button 
                className={`acron-tab ${acronFeature === 'grammar' ? 'active' : ''}`}
                onClick={() => setAcronFeature('grammar')}
              >
                Grammar Check
              </button>
              <button 
                className={`acron-tab ${acronFeature === 'spell' ? 'active' : ''}`}
                onClick={() => setAcronFeature('spell')}
              >
                Spell Check
              </button>
              <button 
                className={`acron-tab ${acronFeature === 'summarize' ? 'active' : ''}`}
                onClick={() => setAcronFeature('summarize')}
              >
                Summarize
              </button>
              <button 
                className={`acron-tab ${acronFeature === 'cite' ? 'active' : ''}`}
                onClick={() => setAcronFeature('cite')}
              >
                Citation
              </button>
            </div>

            <div className="acron-body">
              {acronFeature === 'grammar' && (
                <div className="acron-feature">
                  <h4>Grammar Check</h4>
                  <p>Check selected text for grammar and syntax issues.</p>
                  <button 
                    className="acron-action-btn" 
                    onClick={handleGrammarCheck}
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <><Loader size={16} className="spinner" /> Processing...</>
                    ) : (
                      'Check Grammar'
                    )}
                  </button>
                  
                  {error && (
                    <div className="acron-error">
                      <AlertCircle size={16} />
                      <span>{error}</span>
                    </div>
                  )}
                  
                  {result && result.mistakes && (
                    <div className="acron-results">
                      <div className="mistakes-section">
                        <h5>Issues Found ({result.mistakes.length}):</h5>
                        {result.mistakes.length === 0 ? (
                          <div className="no-mistakes">
                            <CheckCircle size={20} color="#16825d" />
                            <span>No grammar issues found!</span>
                          </div>
                        ) : (
                          <div className="mistakes-list">
                            {result.mistakes.map((mistake, idx) => (
                              <div key={idx} className="mistake-item">
                                <div className="mistake-error">
                                  <AlertCircle size={14} />
                                  {mistake.error}
                                </div>
                                <div className="mistake-correction">
                                  <CheckCircle size={14} />
                                  {mistake.correction}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      <div className="corrected-section">
                        <h5>Corrected Text:</h5>
                        <div className="corrected-text">{result.correctedText}</div>
                        <button className="save-btn" onClick={handleSaveCorrection}>
                          <Save size={16} />
                          Replace Selected Text
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              {acronFeature === 'spell' && (
                <div className="acron-feature">
                  <h4>Spell Check</h4>
                  <p>Check selected text for spelling errors and typos.</p>
                  <button 
                    className="acron-action-btn" 
                    onClick={handleSpellCheck}
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <><Loader size={16} className="spinner" /> Processing...</>
                    ) : (
                      'Check Spelling'
                    )}
                  </button>
                  
                  {error && (
                    <div className="acron-error">
                      <AlertCircle size={16} />
                      <span>{error}</span>
                    </div>
                  )}
                  
                  {result && result.mistakes && (
                    <div className="acron-results">
                      <div className="mistakes-section">
                        <h5>Issues Found ({result.mistakes.length}):</h5>
                        {result.mistakes.length === 0 ? (
                          <div className="no-mistakes">
                            <CheckCircle size={20} color="#16825d" />
                            <span>No spelling errors found!</span>
                          </div>
                        ) : (
                          <div className="mistakes-list">
                            {result.mistakes.map((mistake, idx) => (
                              <div key={idx} className="mistake-item">
                                <div className="mistake-error">
                                  <AlertCircle size={14} />
                                  {mistake.error}
                                </div>
                                <div className="mistake-correction">
                                  <CheckCircle size={14} />
                                  {mistake.correction}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      <div className="corrected-section">
                        <h5>Corrected Text:</h5>
                        <div className="corrected-text">{result.correctedText}</div>
                        <button className="save-btn" onClick={handleSaveCorrection}>
                          <Save size={16} />
                          Replace Selected Text
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              {acronFeature === 'summarize' && (
                <div className="acron-feature">
                  <h4>Summarize</h4>
                  <p>Generate a concise summary of selected text.</p>
                  <div className="acron-options">
                    <label>
                      <input 
                        type="radio" 
                        name="summary-length" 
                        checked={summaryType === 'brief'}
                        onChange={() => setSummaryType('brief')}
                      /> Brief
                    </label>
                    <label>
                      <input 
                        type="radio" 
                        name="summary-length" 
                        checked={summaryType === 'detailed'}
                        onChange={() => setSummaryType('detailed')}
                      /> Detailed
                    </label>
                  </div>
                  <button 
                    className="acron-action-btn" 
                    onClick={handleSummarize}
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <><Loader size={16} className="spinner" /> Processing...</>
                    ) : (
                      'Generate Summary'
                    )}
                  </button>
                  
                  {error && (
                    <div className="acron-error">
                      <AlertCircle size={16} />
                      <span>{error}</span>
                    </div>
                  )}
                  
                  {result && result.summary && (
                    <div className="acron-results">
                      <h5>Summary:</h5>
                      <div className="summary-text">{result.summary}</div>
                    </div>
                  )}
                </div>
              )}
              
              {acronFeature === 'cite' && (
                <div className="acron-feature">
                  <h4>Inline Citation Engine</h4>
                  <p>Compare selected text with your uploaded PDFs and generate inline citations based on similarity.</p>
                  <button 
                    className="acron-action-btn" 
                    onClick={handleCitation}
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <><Loader size={16} className="spinner" /> Analyzing...</>
                    ) : (
                      'Find Similar References'
                    )}
                  </button>
                  
                  {error && (
                    <div className="acron-error">
                      <AlertCircle size={16} />
                      <span>{error}</span>
                    </div>
                  )}
                  
                  {result && result.inlineCitations && (
                    <div className="acron-results">
                      <div className="citation-message">
                        <CheckCircle size={16} color="#16825d" />
                        <span>{result.message}</span>
                      </div>
                      
                      {result.inlineCitations.length === 0 ? (
                        <div className="no-matches">
                          <AlertCircle size={20} />
                          <p>No similar references found. Try selecting different text or upload more PDFs.</p>
                        </div>
                      ) : (
                        <div className="citation-matches">
                          <h5>Similar References Found:</h5>
                          {result.inlineCitations.map((item, idx) => (
                            <div key={idx} className="citation-match">
                              <div className="match-header">
                                <div className="match-info">
                                  <FileText size={16} />
                                  <span className="match-filename">{item.pdfName}</span>
                                </div>
                                <div className="similarity-badge">
                                  {item.similarity}% match
                                </div>
                              </div>
                              
                              <div className="inline-citation-box">
                                <div className="inline-citation">{item.citation}</div>
                                <button 
                                  className="insert-btn"
                                  onClick={() => insertCitation(item.citation)}
                                  title="Insert citation at cursor position"
                                >
                                  Insert
                                </button>
                              </div>
                              
                              <div className="full-citation">
                                <strong>Full Citation:</strong>
                                <p>{item.fullCitation}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="editor-statusbar">
        <div className="status-left">
          <span className="status-item">{selectedDocument.name}</span>
          <span className="status-item">Rich Text</span>
        </div>
        <div className="status-right">
          <span className="status-item">
            <Save size={12} /> Auto-saving...
          </span>
          <span className="status-item">
            Words: {(selectedDocument.content?.replace(/<[^>]*>/g, '') || '').split(/\s+/).filter(w => w).length}
          </span>
        </div>
      </div>
    </div>
  );
};

export default DocumentEditor;
