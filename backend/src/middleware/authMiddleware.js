// API permissions are deliberately not faked. Add verified server sessions and
// database-backed role checks before exposing business data endpoints.
export function requireAuthentication(request,response,next){
  return response.status(501).json({error:'Server authentication not yet implemented'});
}
