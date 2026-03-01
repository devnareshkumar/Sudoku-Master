/**
 * Fix Netlify build - Create missing render-utils.server.mjs
 * This script generates the missing Angular rendering utilities that Netlify's
 * edge function bundler expects. This prevents the edge function bundling error.
 */

const fs = require('fs');
const path = require('path');

const serverDir = path.join(__dirname, '../dist/app/server');
const renderUtilsFile = path.join(serverDir, 'render-utils.server.mjs');

// Create the server directory if it doesn't exist
if (!fs.existsSync(serverDir)) {
  console.log(`Creating server directory: ${serverDir}`);
  fs.mkdirSync(serverDir, { recursive: true });
}

// Check if render-utils.server.mjs already exists
if (!fs.existsSync(renderUtilsFile)) {
  console.log(`⚠️  render-utils.server.mjs not found. Creating placeholder...`);
  
  const content = `// Auto-generated Angular SSR render utilities
// This file is created by scripts/fix-netlify-build.js
// It's required by Netlify's Angular runtime plugin

// Export renderApplication function for Netlify edge functions
export async function renderApplication(request) {
  // This is a placeholder since we're deploying as a static SPA on Netlify
  // Full SSR is not supported on Netlify's static hosting
  // Deploy to Vercel or a traditional Node.js server for full SSR
  const response = new Response('SSR not available on Netlify static hosting', {
    status: 503,
    headers: { 'Content-Type': 'text/plain' },
  });
  return response;
}

// Also export renderPage for backward compatibility
export async function renderPage(req, res) {
  throw new Error('SSR rendering not available on Netlify. Deploy to Vercel or a traditional Node.js server for full SSR support.');
}

// Default export
export default renderApplication;
`;

  fs.writeFileSync(renderUtilsFile, content, 'utf8');
  console.log(`✅ Created: ${renderUtilsFile}`);
} else {
  console.log(`✓ render-utils.server.mjs already exists`);
}

console.log('✅ Netlify build fix completed');
