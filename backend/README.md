# Pastebin Backend

A Node.js Express API server using [Valkey](https://valkey.io/) for storage with automatic 2-week expiry.

## Features

- ✅ Save code snippets with unique IDs
- ✅ Retrieve snippets by ID with view tracking
- ✅ Automatic 2-week expiry via Valkey TTL
- ✅ 2MB file size limit with validation
- ✅ URL-safe ID generation with collision handling
- ✅ CORS support for frontend integration

## Setup

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Set up environment variables:**

   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start Valkey/Redis server:**

   ```bash
   # Using Docker
   docker run -d -p 6379:6379 valkey/valkey:latest

   # Or install locally and run
   valkey-server
   ```

4. **Start the server:**

   ```bash
   # Development
   npm run dev

   # Production
   npm start
   ```

## API Endpoints

### Save Snippet

```http
POST /api/snippets
Content-Type: application/json

{
  "content": "console.log('Hello World');",
  "language": "javascript",
  "title": "Optional title"
}
```

**Response:**

```json
{
  "success": true,
  "id": "V1StGXR8_Z5j",
  "url": "/api/snippet/V1StGXR8_Z5j",
  "expires_at": "2024-02-15T10:30:00Z"
}
```

### Retrieve Snippet

```http
GET /api/snippets/:id
```

**Response:**

```json
{
  "success": true,
  "snippet": {
    "id": "V1StGXR8_Z5j",
    "content": "console.log('Hello World');",
    "language": "javascript",
    "title": null,
    "created_at": "2024-02-01T10:30:00Z",
    "views": 42,
    "file_size": 29
  }
}
```

### Health Check

```http
GET /health
```

## Environment Variables

- `VALKEY_URL`: Valkey/Redis connection URL (default: `redis://localhost:6379`)
- `PORT`: Server port (default: `3001`)
- `FRONTEND_URL`: Frontend URL for CORS (default: `http://localhost:5173`)

## Data Model

Snippets are stored in Valkey with the following structure:

```javascript
// Main snippet data (TTL: 2 weeks)
`snippet:${id}` → {
  content: "console.log('Hello');",
  language: "javascript",
  title: null,
  created_at: 1703097600000,
  file_size: 29
}

// View counter (TTL: 2 weeks)
`snippet:${id}:views` → 42
```

## Supported Languages

- javascript
- typescript
- python
- html
- css
- json
