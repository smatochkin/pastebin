import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import { api } from '../api.js';
import { LANGUAGES } from '../constants.js';

const DEFAULT_CODE = {
  javascript: `// JavaScript example
function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

console.log(fibonacci(10));`,
  
  typescript: `// TypeScript example
interface User {
  id: number;
  name: string;
  email?: string;
}

function createUser(data: Partial<User>): User {
  return { id: Date.now(), name: 'Anonymous', ...data };
}`,

  python: `# Python example
def quicksort(arr):
    if len(arr) <= 1:
        return arr
    pivot = arr[len(arr) // 2]
    left = [x for x in arr if x < pivot]
    middle = [x for x in arr if x == pivot]
    right = [x for x in arr if x > pivot]
    return quicksort(left) + middle + quicksort(right)

print(quicksort([3,6,8,10,1,2,1]))`,

  yaml: `# YAML configuration example
apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config
  namespace: production
data:
  database:
    host: postgres.example.com
    port: 5432
    name: myapp
  features:
    - authentication
    - logging
    - metrics
  debug: false`,

  json: `{
  "name": "myapp",
  "version": "1.0.0",
  "dependencies": {
    "react": "^19.1.0",
    "react-dom": "^19.1.0"
  },
  "scripts": {
    "dev": "vite",
    "build": "vite build"
  }
}`,

  html: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My Page</title>
</head>
<body>
    <header>
        <h1>Welcome</h1>
    </header>
    <main>
        <p>This is a sample HTML document.</p>
    </main>
</body>
</html>`,

  css: `/* CSS styling example */
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  transition: transform 0.2s ease;
}

.card:hover {
  transform: translateY(-2px);
}`,

  markdown: `# Markdown Example

## Features

- **Bold text** and *italic text*
- \`inline code\` and code blocks
- [Links](https://example.com)

### Code Block

\`\`\`javascript
function greet(name) {
  return \`Hello, \${name}!\`;
}
\`\`\`

> This is a blockquote
> spanning multiple lines

1. Ordered list item
2. Another item
   - Nested unordered item`,

  xml: `<?xml version="1.0" encoding="UTF-8"?>
<bookstore>
    <book id="1" category="fiction">
        <title lang="en">Great Gatsby</title>
        <author>F. Scott Fitzgerald</author>
        <year>1925</year>
        <price currency="USD">12.99</price>
    </book>
    <book id="2" category="biography">
        <title lang="en">Steve Jobs</title>
        <author>Walter Isaacson</author>
        <year>2011</year>
        <price currency="USD">14.99</price>
    </book>
</bookstore>`,

  sql: `-- SQL query example
SELECT 
    u.id,
    u.name,
    u.email,
    COUNT(o.id) as order_count,
    SUM(o.total) as total_spent
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
WHERE u.created_at >= '2024-01-01'
    AND u.status = 'active'
GROUP BY u.id, u.name, u.email
HAVING COUNT(o.id) > 0
ORDER BY total_spent DESC
LIMIT 10;`
};

function Home() {
  const navigate = useNavigate();
  const [code, setCode] = useState(DEFAULT_CODE.javascript);
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
    wordWrap: wordWrap ? 'on' : 'off'
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
    // Load example code for the selected language
    setCode(DEFAULT_CODE[newLanguage] || '// Start coding here...');
  };

  const handleNewSnippet = () => {
    setCode(DEFAULT_CODE[language] || '// Start coding here...');
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