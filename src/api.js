import { API_BASE_URL } from './constants.js';

export const api = {
  async createSnippet({ content, language, title = null }) {
    const response = await fetch(`${API_BASE_URL}/api/snippets`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content, language, title })
    });
    
    const data = await response.json();
    if (!data.success) {
      throw new Error(data.error || 'Failed to save snippet');
    }
    
    return data;
  },

  async getSnippet(id) {
    const response = await fetch(`${API_BASE_URL}/api/snippets/${id}`);
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to fetch snippet');
    }
    
    return data.snippet;
  }
};