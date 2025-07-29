# Backend Implementation Plan - Pastebin with Valkey

## Architecture Overview

**Tech Stack:**
- Node.js + Express for REST API
- Valkey client for data storage
- CORS for frontend communication
- Compression middleware for large payloads

**Project Structure:**
```
backend/
├── package.json
├── server.js              # Main server entry
├── config/
│   └── valkey.js         # Valkey connection config
├── controllers/
│   └── snippetController.js  # Business logic
├── routes/
│   └── snippets.js       # API routes
├── middleware/
│   └── validation.js     # Request validation
└── utils/
    └── idGenerator.js    # ID generation utility
```

## Valkey Data Model

**Key Structure:**
```javascript
// Main snippet data with 2-week TTL (1,209,600 seconds)
`snippet:${id}` → {
  content: string,      // The code/text content
  language: string,     // Programming language
  title?: string,       // Optional title
  created_at: number,   // Timestamp
  file_size: number     // Size in bytes
}

// View counter (separate key for atomic operations)
`snippet:${id}:views` → integer

// Optional: Content hash for duplicate detection
`content_hash:${hash}` → snippet_id
```

**Example Data:**
```javascript
{
  content: "console.log('Hello World');",
  language: "javascript", 
  title: null,
  created_at: 1703097600000,
  file_size: 29
}
```

## API Endpoints Design

### POST /api/snippets - Save Snippet
```javascript
// Request body
{
  content: string,     // Required: snippet content
  language: string,    // Required: programming language
  title?: string       // Optional: snippet title
}

// Response
{
  success: true,
  id: "abc123def456",  // Generated snippet ID
  url: "/api/snippets/abc123def456",
  expires_at: "2024-02-15T10:30:00Z"
}
```

### GET /api/snippets/:id - Retrieve Snippet
```javascript
// Response (success)
{
  success: true,
  snippet: {
    id: "abc123def456",
    content: "console.log('Hello');",
    language: "javascript",
    title: null,
    created_at: "2024-02-01T10:30:00Z",
    views: 42,
    file_size: 25
  }
}

// Response (not found)
{
  success: false,
  error: "Snippet not found or expired"
}
```

## ID Generation Strategy

**Requirements:**
- URL-safe characters only
- Reasonably short for sharing
- Collision-resistant 
- No sequential patterns (security)

**Recommended Approach: nanoid**
```javascript
import { nanoid } from 'nanoid';

const generateSnippetId = () => {
  // 12 characters, URL-safe alphabet
  // ~2.7 million years to have 1% probability of collision at 1000 IDs/hour
  return nanoid(12); // e.g., "V1StGXR8_Z5j"
};

// Alternative: Custom alphabet (shorter URLs)
const customNanoid = customAlphabet('0123456789ABCDEFGHJKMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz', 8);
// Excludes confusing chars: I, L, O, l, o
```

**Collision Handling:**
```javascript
const generateUniqueId = async (valkey) => {
  let attempts = 0;
  while (attempts < 5) {
    const id = nanoid(12);
    const exists = await valkey.exists(`snippet:${id}`);
    if (!exists) return id;
    attempts++;
  }
  throw new Error('Failed to generate unique ID');
};
```

## Error Handling & Validation

**Request Validation:**
```javascript
const validateSnippet = (req, res, next) => {
  const { content, language } = req.body;
  
  // Required fields
  if (!content || typeof content !== 'string') {
    return res.status(400).json({
      success: false,
      error: 'Content is required and must be a string'
    });
  }
  
  if (!language || typeof language !== 'string') {
    return res.status(400).json({
      success: false,
      error: 'Language is required and must be a string'
    });
  }
  
  // Size validation (2MB limit)
  const contentSize = Buffer.byteLength(content, 'utf8');
  if (contentSize > 2 * 1024 * 1024) {
    return res.status(413).json({
      success: false,
      error: 'Content exceeds 2MB limit'
    });
  }
  
  // Language validation
  const allowedLanguages = ['javascript', 'typescript', 'python', 'html', 'css', 'json', 'yaml'];
  if (!allowedLanguages.includes(language)) {
    return res.status(400).json({
      success: false,
      error: 'Unsupported language'
    });
  }
  
  req.contentSize = contentSize;
  next();
};
```

**Error Response Format:**
```javascript
{
  success: false,
  error: "Error message",
  code?: "ERROR_CODE"  // Optional error code for frontend handling
}
```

## Dependencies & Package.json

```json
{
  "name": "pastebin-backend",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "test": "jest"
  },
  "dependencies": {
    "express": "^4.18.2",
    "valkey": "^4.6.0",
    "cors": "^2.8.5",
    "compression": "^1.7.4",
    "nanoid": "^5.0.4",
    "dotenv": "^16.3.1"
  },
  "devDependencies": {
    "nodemon": "^3.0.2"
  }
}
```

## Core Implementation Structure

**Main Controller Logic:**
```javascript
// controllers/snippetController.js
export const saveSnippet = async (req, res) => {
  try {
    const { content, language, title } = req.body;
    const id = await generateUniqueId(valkey);
    
    const snippetData = {
      content,
      language,
      title: title || null,
      created_at: Date.now(),
      file_size: req.contentSize
    };
    
    // Store with 2-week TTL (1,209,600 seconds)
    await valkey.setex(`snippet:${id}`, 1209600, JSON.stringify(snippetData));
    await valkey.setex(`snippet:${id}:views`, 1209600, '0');
    
    res.json({
      success: true,
      id,
      url: `/snippet/${id}`,
      expires_at: new Date(Date.now() + 1209600000).toISOString()
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

export const getSnippet = async (req, res) => {
  try {
    const { id } = req.params;
    
    const [snippetData, currentViews] = await Promise.all([
      valkey.get(`snippet:${id}`),
      valkey.incr(`snippet:${id}:views`) // Atomic increment
    ]);
    
    if (!snippetData) {
      return res.status(404).json({
        success: false,
        error: 'Snippet not found or expired'
      });
    }
    
    const snippet = JSON.parse(snippetData);
    res.json({
      success: true,
      snippet: {
        id,
        ...snippet,
        views: currentViews,
        created_at: new Date(snippet.created_at).toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};
```

## Implementation Steps

### Phase 1: Setup
1. Create `backend/` directory
2. Initialize package.json with dependencies
3. Set up Valkey connection configuration
4. Create basic Express server with CORS

### Phase 2: Core Functionality
1. Implement ID generation utility with collision detection
2. Create snippet controller with save/retrieve logic
3. Add request validation middleware
4. Set up API routes

### Phase 3: Integration
1. Test API endpoints with Postman/curl
2. Add compression middleware for large payloads
3. Configure environment variables
4. Add error logging

## Key Features

- ✅ 2MB file size limit with validation
- ✅ Automatic 2-week expiry via Valkey TTL
- ✅ Atomic view counter increments
- ✅ URL-safe ID generation with collision handling
- ✅ Comprehensive error handling and validation
- ✅ CORS support for frontend integration

## Notes

The backend will be completely stateless and rely on Valkey's TTL for automatic cleanup, eliminating the need for cron jobs or manual purging. All content will automatically expire after exactly 2 weeks from creation.