export function readPort(value=process.env.PORT) {
  const port=Number(value||3001);
  if(!Number.isInteger(port)||port<1||port>65535) throw Error('Invalid PORT');
  return port;
}
export function hasDatabaseUrl(value=process.env.DATABASE_URL) {return Boolean(value?.trim());}
