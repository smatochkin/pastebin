import React, { useState } from 'react';
import MonacoEditor from 'react-monaco-editor';
import './App.css';

function App() {
  const [code, setCode] = useState('// Start coding here...');
  const [language, setLanguage] = useState('javascript');
  const [saveStatus, setSaveStatus] = useState(null); // 'saving', 'success', 'error'
  const [savedUrl, setSavedUrl] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const editorRef = React.useRef(null);

  const editorDidMount = (editor, monaco) => {
    editorRef.current = editor;
  };

  const editorOptions = {
    selectOnLineNumbers: true,
    automaticLayout: true,
  };

  const handleSave = async () => {
    setSaveStatus('saving');
    setErrorMessage('');
    setSavedUrl('');
    
    try {
      const response = await fetch('https://3001-firebase-pastebin-1753651815053.cluster-vyr53kd25jc2yvngldrwyq6zc4.cloudworkstations.dev/api/snippets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: code,
          language: language,
          title: null
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setSaveStatus('success');
        setSavedUrl(`https://3001-firebase-pastebin-1753651815053.cluster-vyr53kd25jc2yvngldrwyq6zc4.cloudworkstations.dev${data.url}`);
      } else {
        setSaveStatus('error');
        setErrorMessage(data.error || 'Failed to save snippet');
      }
    } catch (error) {
      setSaveStatus('error');
      setErrorMessage('Network error: Unable to connect to server');
      console.error('Save error:', error);
    }
  };

  return (
    <div className="App">
      <h1>Simple Pastebin</h1>
      <div className="controls">
        <label htmlFor="language-select">Language:</label>
        <select
          id="language-select"
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
        >
          <option value="javascript">JavaScript</option>
          <option value="typescript">TypeScript</option>
          <option value="python">Python</option>
          <option value="html">HTML</option>
          <option value="css">CSS</option>
          <option value="json">JSON</option>
          <option value="yaml">YAML</option>
          </select>
        <button onClick={handleSave} disabled={saveStatus === 'saving'}>
          {saveStatus === 'saving' ? 'Saving...' : 'Save'}
        </button>
      </div>
      
      {saveStatus === 'success' && (
        <div className="success-message">
          <p>✅ Snippet saved successfully!</p>
          <p>URL: <a href={savedUrl} target="_blank" rel="noopener noreferrer">{savedUrl}</a></p>
        </div>
      )}
      
      {saveStatus === 'error' && (
        <div className="error-message">
          <p>❌ Error: {errorMessage}</p>
        </div>
      )}
      
      <div className="editor-container">
        <MonacoEditor
          width="800"
          height="600"
          language={language}
          theme="vs-dark"
          value={code}
          options={editorOptions}
          onChange={(newValue) => setCode(newValue)}
          editorDidMount={editorDidMount}
        />
      </div>
    </div>
  );
}

export default App;
