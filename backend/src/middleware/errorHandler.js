export function errorHandler(error, request, response, next) {
  // Never leak database strings, passwords, or sensitive documents to clients.
  console.error('API error', error?.message || 'Unknown error');
  response.status(500).json({error:'Internal server error'});
}
