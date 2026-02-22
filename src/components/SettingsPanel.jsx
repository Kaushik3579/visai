import { useState, useEffect } from 'react';
import { Monitor, Moon, Sun, Type, Save, Palette } from 'lucide-react';
import '../styles/SettingsPanel.css';

const SettingsPanel = () => {
  const [settings, setSettings] = useState({
    theme: 'dark',
    editorFontSize: 14,
    autoSave: true,
    autoSaveDelay: 30,
    wordWrap: 'on',
    minimap: true,
    lineNumbers: true,
  });

  useEffect(() => {
    const saved = localStorage.getItem('appSettings');
    if (saved) {
      setSettings(JSON.parse(saved));
    }
  }, []);

  const updateSetting = (key, value) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    localStorage.setItem('appSettings', JSON.stringify(newSettings));
  };

  return (
    <div className="settings-panel">
      <div className="settings-header">
        <h3>Settings</h3>
      </div>

      <div className="settings-content">
        <div className="settings-section">
          <h4><Palette size={16} /> Appearance</h4>
          
          <div className="setting-item">
            <label>
              <span className="setting-label">Theme</span>
              <span className="setting-description">Choose the color theme</span>
            </label>
            <select 
              value={settings.theme}
              onChange={(e) => updateSetting('theme', e.target.value)}
              className="setting-select"
            >
              <option value="dark">Dark</option>
              <option value="light">Light (Coming Soon)</option>
            </select>
          </div>
        </div>

        <div className="settings-section">
          <h4><Type size={16} /> Editor</h4>
          
          <div className="setting-item">
            <label>
              <span className="setting-label">Font Size</span>
              <span className="setting-description">Editor font size in pixels</span>
            </label>
            <input 
              type="number"
              min="10"
              max="24"
              value={settings.editorFontSize}
              onChange={(e) => updateSetting('editorFontSize', parseInt(e.target.value))}
              className="setting-input"
            />
          </div>

          <div className="setting-item">
            <label>
              <span className="setting-label">Word Wrap</span>
              <span className="setting-description">Wrap long lines</span>
            </label>
            <select 
              value={settings.wordWrap}
              onChange={(e) => updateSetting('wordWrap', e.target.value)}
              className="setting-select"
            >
              <option value="on">On</option>
              <option value="off">Off</option>
              <option value="bounded">Bounded</option>
            </select>
          </div>

          <div className="setting-item">
            <label>
              <span className="setting-label">Show Minimap</span>
              <span className="setting-description">Display code overview</span>
            </label>
            <input 
              type="checkbox"
              checked={settings.minimap}
              onChange={(e) => updateSetting('minimap', e.target.checked)}
              className="setting-checkbox"
            />
          </div>

          <div className="setting-item">
            <label>
              <span className="setting-label">Line Numbers</span>
              <span className="setting-description">Show line numbers</span>
            </label>
            <input 
              type="checkbox"
              checked={settings.lineNumbers}
              onChange={(e) => updateSetting('lineNumbers', e.target.checked)}
              className="setting-checkbox"
            />
          </div>
        </div>

        <div className="settings-section">
          <h4><Save size={16} /> Files</h4>
          
          <div className="setting-item">
            <label>
              <span className="setting-label">Auto Save</span>
              <span className="setting-description">Automatically save files</span>
            </label>
            <input 
              type="checkbox"
              checked={settings.autoSave}
              onChange={(e) => updateSetting('autoSave', e.target.checked)}
              className="setting-checkbox"
            />
          </div>

          {settings.autoSave && (
            <div className="setting-item">
              <label>
                <span className="setting-label">Auto Save Delay (seconds)</span>
                <span className="setting-description">Time before auto-saving</span>
              </label>
              <input 
                type="number"
                min="5"
                max="120"
                value={settings.autoSaveDelay}
                onChange={(e) => updateSetting('autoSaveDelay', parseInt(e.target.value))}
                className="setting-input"
              />
            </div>
          )}
        </div>

        <div className="settings-info">
          <p>Settings are saved locally in your browser</p>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;
