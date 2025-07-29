export const validateSnippet = (req, res, next) => {
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

export const validateSnippetId = (req, res, next) => {
  const { id } = req.params;
  
  if (!id || typeof id !== 'string' || id.length !== 12) {
    return res.status(400).json({
      success: false,
      error: 'Invalid snippet ID format'
    });
  }
  
  // Check if ID contains only URL-safe characters
  const urlSafeRegex = /^[A-Za-z0-9_-]+$/;
  if (!urlSafeRegex.test(id)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid snippet ID format'
    });
  }
  
  next();
};