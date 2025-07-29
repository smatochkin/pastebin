import express from 'express';
import cors from 'cors';
import compression from 'compression';
import dotenv from 'dotenv';
import snippetRoutes from './routes/snippets.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(compression()); // Compress responses for large payloads
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json({ 
  limit: '2.5MB' // Slightly higher than 2MB to account for JSON overhead
}));

// Routes
app.use('/api/snippets', snippetRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Pastebin backend is running',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found'
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  
  // Handle JSON parsing errors
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      success: false,
      error: 'Invalid JSON format'
    });
  }
  
  // Handle payload too large errors
  if (err.type === 'entity.too.large') {
    return res.status(413).json({
      success: false,
      error: 'Request payload too large'
    });
  }
  
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

app.listen(PORT, () => {
  console.log(`Pastebin backend server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});