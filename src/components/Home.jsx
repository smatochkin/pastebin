import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import { api } from '../api.js';
import { LANGUAGES } from '../constants.js';

const DEFAULT_CODE = '';

function Home() {
  const navigate = useNavigate();
  const [code, setCode] = useState(DEFAULT_CODE);
  const [language, setLanguage] = useState('javascript');
  const [saveStatus, setSaveStatus] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [wordWrap, setWordWrap] = useState(true);

  const editorOptions = {
    selectOnLineNumbers: true,
    automaticLayout: true,
    minimap: { enabled: false },
    fontSize: 14,
    tabSize: 2,
    insertSpaces: true,
    wordWrap: wordWrap ? 'on' : 'off',
    scrollBeyondLastLine: false,
    scrollbar: {
      vertical: 'auto',
      horizontal: 'auto'
    }
  };

  const handleSave = async () => {
    if (!code.trim()) {
      setErrorMessage('Cannot save empty snippet');
      setSaveStatus('error');
      return;
    }

    setSaveStatus('saving');
    setErrorMessage('');
    
    try {
      const data = await api.createSnippet({
        content: code,
        language: language,
        title: null
      });
      
      setSaveStatus('success');
      
      // Extract ID from URL and navigate to it
      const snippetId = data.url.split('/').pop();
      setTimeout(() => {
        navigate(`/${snippetId}`);
      }, 1000);
      
    } catch (error) {
      setSaveStatus('error');
      setErrorMessage(error.message || 'Network error: Unable to connect to server');
      console.error('Save error:', error);
    }
  };

  const handleLanguageChange = (newLanguage) => {
    setLanguage(newLanguage);
    // Only change language, preserve current code content
  };

  const handleNewSnippet = () => {
    setCode(DEFAULT_CODE);
    setSaveStatus(null);
    setErrorMessage('');
  };

  return (
    <div className="home">
      <div className="header">
        <h1>Simple Pastebin</h1>
        <div className="controls">
          <div className="control-group">
            <label htmlFor="language-select">Language:</label>
            <select
              id="language-select"
              value={language}
              onChange={(e) => handleLanguageChange(e.target.value)}
              className="language-select"
            >
              {LANGUAGES.map(lang => (
                <option key={lang.value} value={lang.value}>{lang.label}</option>
              ))}
            </select>
          </div>

          <div className="control-group">
            <label htmlFor="wrap-toggle">Line Wrap:</label>
            <button
              id="wrap-toggle"
              onClick={() => setWordWrap(!wordWrap)}
              className={`btn btn-outline wrap-toggle ${wordWrap ? 'active' : ''}`}
              title={wordWrap ? 'Disable line wrapping' : 'Enable line wrapping'}
            >
              {wordWrap ? '↩ On' : '→ Off'}
            </button>
          </div>
          
          <div className="button-group">
            <button 
              onClick={handleNewSnippet} 
              className="btn btn-secondary"
              disabled={saveStatus === 'saving'}
            >
              New
            </button>
            <button 
              onClick={handleSave} 
              disabled={saveStatus === 'saving' || !code.trim()}
              className="btn btn-primary"
            >
              {saveStatus === 'saving' ? 'Saving...' : 'Save & Share'}
            </button>
          </div>
        </div>
      </div>
      
      {saveStatus === 'success' && (
        <div className="message success-message">
          <p>✅ Snippet saved successfully! Redirecting to shared URL...</p>
        </div>
      )}
      
      {saveStatus === 'error' && (
        <div className="message error-message">
          <p>❌ Error: {errorMessage}</p>
        </div>
      )}
      
      <div className="editor-container">
        <Editor
          width="100%"
          height="100%"
          language={language}
          theme="vs-dark"
          value={code}
          options={editorOptions}
          onChange={(newValue) => setCode(newValue || '')}
        />
      </div>
    </div>
  );
}

export default Home;