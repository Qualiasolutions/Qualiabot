// Utility to load and process sitemap data
import { useEffect, useState } from 'react';

interface SitemapPage {
  url: string;
  title: string;
  description: string;
  content: string;
  headings: Array<{
    level: number;
    text: string;
  }>;
  lastFetched: string;
}

interface SitemapData {
  website: string;
  pages: SitemapPage[];
  totalPages: number;
  generatedAt: string;
}

// Function to load sitemap data from the JSON file
export const loadSitemapData = async (): Promise<SitemapData | null> => {
  try {
    // In production, this would load the data from the built JSON file
    // For development, we'll attempt to fetch it directly
    let data: SitemapData;
    
    if (process.env.NODE_ENV === 'production') {
      // In production, import the JSON directly (webpack will handle this)
      try {
        data = require('../data/sitemapData.json');
      } catch (e) {
        console.warn('Sitemap data not found in production build');
        return null;
      }
    } else {
      // In development, try to fetch from the public folder
      try {
        const response = await fetch('/sitemapData.json');
        if (!response.ok) {
          throw new Error('Sitemap data not found');
        }
        data = await response.json();
      } catch (e) {
        console.warn('Sitemap data not found, run npm run fetch-sitemap first');
        return null;
      }
    }
    
    return data;
  } catch (error) {
    console.error('Failed to load sitemap data:', error);
    return null;
  }
};

// React hook to use sitemap data
export const useSitemapData = () => {
  const [data, setData] = useState<SitemapData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await loadSitemapData();
        setData(result);
      } catch (e) {
        setError(e instanceof Error ? e : new Error('Failed to load sitemap data'));
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  return { data, loading, error };
};

// Function to extract a simplified context for the system prompt
export const extractWebsiteContext = (data: SitemapData | null): string => {
  if (!data || !data.pages || data.pages.length === 0) {
    return '';
  }
  
  // Extract main pages and their key information
  const mainPages = data.pages.map(page => {
    // Get the page path/name from URL
    const path = new URL(page.url).pathname;
    const name = path === '/' ? 'Home' : path.split('/').filter(Boolean).pop();
    
    // Get key headings (only h1, h2)
    const keyHeadings = page.headings
      .filter(h => h.level <= 2)
      .map(h => h.text)
      .join(', ');
      
    return `- ${name}: ${page.description || keyHeadings || 'No description available'}`;
  }).join('\n');
  
  return `
Website Structure:
${mainPages}
  `.trim();
};

export default {
  loadSitemapData,
  useSitemapData,
  extractWebsiteContext
}; 