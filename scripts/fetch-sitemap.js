const fs = require('fs');
const path = require('path');
const https = require('https');
const { DOMParser } = require('@xmldom/xmldom');
const fetch = require('node-fetch');
const cheerio = require('cheerio');

// Sitemap URL
const SITEMAP_URL = 'https://qualiasolutions.net/sitemap.xml';

// Output file path
const OUTPUT_FILE = path.join(__dirname, '../src/data/sitemapData.json');

// Ensure the data directory exists
if (!fs.existsSync(path.join(__dirname, '../src/data'))) {
  fs.mkdirSync(path.join(__dirname, '../src/data'), { recursive: true });
}

// Function to fetch and parse sitemap
async function fetchSitemap(url) {
  try {
    console.log(`Fetching sitemap from: ${url}`);
    const response = await fetch(url);
    const sitemapXml = await response.text();
    
    // Parse the XML
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(sitemapXml, 'text/xml');
    
    // Extract URLs from the sitemap
    const urls = [];
    const urlElements = xmlDoc.getElementsByTagName('url');
    
    for (let i = 0; i < urlElements.length; i++) {
      const locElement = urlElements[i].getElementsByTagName('loc')[0];
      if (locElement && locElement.textContent) {
        urls.push(locElement.textContent.trim());
      }
    }
    
    console.log(`Found ${urls.length} URLs in sitemap`);
    return urls;
  } catch (error) {
    console.error('Error fetching sitemap:', error);
    return [];
  }
}

// Function to extract content from a webpage
async function extractPageContent(url) {
  try {
    console.log(`Fetching content from: ${url}`);
    const response = await fetch(url);
    const html = await response.text();
    
    // Use cheerio to parse HTML
    const $ = cheerio.load(html);
    
    // Remove script, style elements and comments
    $('script, style, noscript, iframe, svg').remove();
    
    // Get page title
    const title = $('title').text().trim();
    
    // Get meta description
    const description = $('meta[name="description"]').attr('content') || '';
    
    // Extract main content (customize selectors based on website structure)
    const mainContent = $('main, article, .content, .main-content, #content')
      .text()
      .replace(/\s+/g, ' ')
      .trim();
    
    // Fallback to body content if main content selectors didn't match
    let content = mainContent;
    if (!content || content.length < 100) {
      content = $('body')
        .text()
        .replace(/\s+/g, ' ')
        .trim();
    }
    
    // Extract headings for structure
    const headings = [];
    $('h1, h2, h3, h4').each((i, el) => {
      const text = $(el).text().trim();
      if (text) {
        headings.push({
          level: parseInt(el.tagName.substring(1)),
          text
        });
      }
    });
    
    return {
      url,
      title,
      description,
      content: content.substring(0, 10000), // Limit content length
      headings,
      lastFetched: new Date().toISOString()
    };
  } catch (error) {
    console.error(`Error extracting content from ${url}:`, error);
    return null;
  }
}

// Main function to process the sitemap
async function processSitemap() {
  try {
    // Fetch URLs from sitemap
    const urls = await fetchSitemap(SITEMAP_URL);
    
    if (urls.length === 0) {
      console.error('No URLs found in sitemap');
      return;
    }
    
    // Process each URL (with a delay to avoid overwhelming the server)
    const pageContents = [];
    for (let i = 0; i < urls.length; i++) {
      const content = await extractPageContent(urls[i]);
      if (content) {
        pageContents.push(content);
      }
      
      // Add a small delay between requests
      if (i < urls.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    // Create structured data from all pages
    const structuredData = {
      website: 'qualiasolutions.net',
      pages: pageContents,
      totalPages: pageContents.length,
      generatedAt: new Date().toISOString()
    };
    
    // Save to file
    fs.writeFileSync(
      OUTPUT_FILE,
      JSON.stringify(structuredData, null, 2),
      'utf8'
    );
    
    console.log(`Successfully processed ${pageContents.length} pages`);
    console.log(`Data saved to ${OUTPUT_FILE}`);
  } catch (error) {
    console.error('Error processing sitemap:', error);
  }
}

// Run the script
processSitemap(); 