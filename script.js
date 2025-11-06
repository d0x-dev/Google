// functions/[[path]].js

export async function onRequest(context) {
  const { request, env, params } = context;
  const url = new URL(request.url);
  
  // Get the path from the URL
  let path = params.path ? params.path.join('/') : '';
  
  // If no path or root path, serve index.html
  if (!path || path === '' || path === '/') {
    return await serveStaticFile('index.html', context);
  }
  
  // Try to serve the requested file
  try {
    return await serveStaticFile(path, context);
  } catch (error) {
    // If file not found, fall back to index.html for client-side routing
    return await serveStaticFile('index.html', context);
  }
}

async function serveStaticFile(filename, context) {
  // Remove leading slash if present
  const cleanFilename = filename.replace(/^\//, '');
  
  // For root path, serve index.html
  const fileToServe = cleanFilename === '' ? 'index.html' : cleanFilename;
  
  // Construct the path to your static files
  const object = await context.env.ASSETS.fetch(
    new URL(`/${fileToServe}`, context.request.url)
  );
  
  if (object.status === 404) {
    throw new Error('File not found');
  }
  
  // Get the content type
  const contentType = getContentType(fileToServe);
  
  return new Response(object.body, {
    headers: {
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=3600'
    }
  });
}

function getContentType(filename) {
  const ext = filename.split('.').pop().toLowerCase();
  const contentTypes = {
    'html': 'text/html',
    'css': 'text/css',
    'js': 'application/javascript',
    'json': 'application/json',
    'png': 'image/png',
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'gif': 'image/gif',
    'svg': 'image/svg+xml',
    'ico': 'image/x-icon',
    'txt': 'text/plain'
  };
  
  return contentTypes[ext] || 'text/plain';
}
