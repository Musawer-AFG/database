// Recovery codes are only a demonstration on one browser. Server-side secure
// recovery, rate-limiting and real sessions are necessary before actual use.
import { makeDemoCredential, verifyDemoCredential } from './demoAuth.js';
export function createRecoveryCode() {
  const bytes=crypto.getRandomValues(new Uint8Array(16));
  const alphabet='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const s=Array.from(bytes,b=>alphabet[b%alphabet.length]).join('');
  return `AF-${s.slice(0,4)}-${s.slice(4,8)}-${s.slice(8,12)}-${s.slice(12,16)}`;
}
export async function createRecoveryRecord(code,{now=Date.now(),days=1}={}) {
  const credential=await makeDemoCredential(String(code).trim().toUpperCase());
  return {recoverySalt:credential.passwordSalt,recoveryHash:credential.passwordHash,recoveryExpires:now+days*86400000};
}
export function recoveryFields(raw) {
  const salt=String(raw?.recoverySalt||'');
  const hash=String(raw?.recoveryHash||'');
  const expires=Number(raw?.recoveryExpires||0);
  return /^[a-f0-9]{32}$/.test(salt) && /^[a-f0-9]{64}$/.test(hash) && Number.isFinite(expires) && expires>0
    ? {recoverySalt:salt,recoveryHash:hash,recoveryExpires:expires} : {};
}
export async function verifyRecoveryCode(code,user,now=Date.now()) {
  const record=recoveryFields(user);
  if(!record.recoveryHash || now>record.recoveryExpires) return false;
  return verifyDemoCredential(String(code).trim().toUpperCase(),{passwordSalt:record.recoverySalt,passwordHash:record.recoveryHash});
}
export const clearRecoveryFields = () => ({recoverySalt:'',recoveryHash:'',recoveryExpires:0});
