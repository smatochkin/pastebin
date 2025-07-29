import { nanoid } from 'nanoid';

export const generateSnippetId = () => {
  // 12 characters, URL-safe alphabet
  // ~2.7 million years to have 1% probability of collision at 1000 IDs/hour
  return nanoid(12);
};

export const generateUniqueId = async (redisClient) => {
  let attempts = 0;
  while (attempts < 5) {
    const id = generateSnippetId();
    const exists = await redisClient.exists(`snippet:${id}`);
    if (!exists) return id;
    attempts++;
  }
  throw new Error('Failed to generate unique ID');
};