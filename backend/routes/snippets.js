import express from 'express';
import { saveSnippet, getSnippet } from '../controllers/snippetController.js';
import { validateSnippet, validateSnippetId } from '../middleware/validation.js';

const router = express.Router();

// POST /api/snippets - Save a new snippet
router.post('/', validateSnippet, saveSnippet);

// GET /api/snippets/:id - Retrieve a snippet by ID
router.get('/:id', validateSnippetId, getSnippet);

export default router;