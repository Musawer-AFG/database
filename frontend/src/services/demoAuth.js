// Client-side login demonstration only. A browser-local hash is NOT real authentication.
// In production, credentials and session verification belong to a trusted backend.
export function normalizeUsername(value) {
  return String(value ?? '').trim().toLowerCase();
}
export function validUsername(value) {
  return /^[a-z0-9][a-z0-9._-]{2,31}$/.test(normalizeUsername(value));
}
export function proposeUsername(employee) {
  const employeeCode = String(employee?.employeeCode ?? '').trim().toLowerCase().replace(/[^a-z0-9._-]/g,'');
  if(validUsername(employeeCode)) return employeeCode;
  const digits = String(employee?.phone ?? '').replace(/[^0-9]/g,'').slice(-9);
  if(digits.length >= 7) return `staff${digits}`;
  const id = String(employee?.id ?? '').replace(/[^0-9a-z]/gi,'').slice(-16).toLowerCase();
  return `staff${id || '001'}`;
}
const hex = bytes => [...bytes].map(b => b.toString(16).padStart(2,'0')).join('');
const bytesFromHex = value => new Uint8Array(String(value).match(/.{1,2}/g)?.map(part=>parseInt(part,16))||[]);
async function derivePassword(password, saltHex) {
  const key = await crypto.subtle.importKey('raw',new TextEncoder().encode(password),'PBKDF2',false,['deriveBits']);
  return hex(new Uint8Array(await crypto.subtle.deriveBits({name:'PBKDF2',salt:bytesFromHex(saltHex),iterations:150000,hash:'SHA-256'},key,256)));
}
export async function makeDemoCredential(password) {
  if(String(password).length < 8) throw Error('رمز باید حداقل ۸ حرف یا عدد داشته باشد.');
  if(!globalThis.crypto?.subtle) throw Error('براوزر برای رمزگذاری نمایشی نیاز به اتصال امن HTTPS دارد.');
  const salt=hex(crypto.getRandomValues(new Uint8Array(16)));
  return {passwordSalt:salt,passwordHash:await derivePassword(String(password),salt)};
}
export async function verifyDemoCredential(password, record) {
  if(!record?.passwordSalt || !record?.passwordHash || !globalThis.crypto?.subtle) return false;
  const result=await derivePassword(String(password),record.passwordSalt);
  return result===record.passwordHash;
}
export function makeTemporaryPassword() {
  const alphabet='ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789';
  const numbers=crypto.getRandomValues(new Uint8Array(12));
  return `Afg-${[...numbers].map(b=>alphabet[b%alphabet.length]).join('')}`;
}
