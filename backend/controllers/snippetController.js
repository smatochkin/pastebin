import redisClient from '../config/valkey.js';
import { generateUniqueId } from '../utils/idGenerator.js';

export const saveSnippet = async (req, res) => {
  try {
    const { content, language, title } = req.body;
    const id = await generateUniqueId(redisClient);
    
    const snippetData = {
      content,
      language,
      title: title || null,
      created_at: Date.now(),
      file_size: req.contentSize
    };
    
    // Store with 2-week TTL (1,209,600 seconds)
    await redisClient.setEx(`snippet:${id}`, 1209600, JSON.stringify(snippetData));
    await redisClient.setEx(`snippet:${id}:views`, 1209600, '0');
    
    res.json({
      success: true,
      id,
      url: `/api/snippets/${id}`,
      expires_at: new Date(Date.now() + 1209600000).toISOString()
    });
  } catch (error) {
    console.error('Error saving snippet:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
};

export const getSnippet = async (req, res) => {
  try {
    const { id } = req.params;
    
    const [snippetData, currentViews] = await Promise.all([
      redisClient.get(`snippet:${id}`),
      redisClient.incr(`snippet:${id}:views`) // Atomic increment
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
    console.error('Error retrieving snippet:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
};