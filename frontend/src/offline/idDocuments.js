// Scans use IndexedDB instead of localStorage: binary files would overflow localStorage.
// Browser-only storage is NOT encrypted and is unsuitable for production identity data.
const DB='afghan-wholesale-identity-scans-v1';
const STORE='files';
const MAX_BYTES=8*1024*1024;
const allowed=['image/jpeg','image/png','image/webp','application/pdf'];
function database(){
  if(typeof indexedDB==='undefined') return Promise.reject(Error('حفظ اسناد در این مرورگر فعال نیست.'));
  return new Promise((resolve,reject)=>{
    const req=indexedDB.open(DB,1);
    req.onupgradeneeded=()=>{if(!req.result.objectStoreNames.contains(STORE))req.result.createObjectStore(STORE,{keyPath:'id'});};
    req.onsuccess=()=>resolve(req.result);
    req.onerror=()=>reject(req.error||Error('باز کردن حافظه اسناد ممکن نیست.'));
  });
}
async function operation(mode,fn){
  const db=await database();
  try {return await new Promise((resolve,reject)=>{
    const tx=db.transaction(STORE,mode);
    const request=fn(tx.objectStore(STORE));
    tx.oncomplete=()=>resolve(request?.result??null);
    tx.onerror=()=>reject(tx.error||Error('ثبت سند انجام نشد.'));
    tx.onabort=()=>reject(tx.error||Error('ثبت سند قطع شد.'));
  });} finally {db.close();}
}
export async function saveIdentityScan(file){
  if(!file||!allowed.includes(file.type)) throw Error('فقط JPG، PNG، WebP یا PDF مجاز است.');
  if(file.size>MAX_BYTES) throw Error('حجم سند باید کمتر از ۸ مگابایت باشد.');
  const id=typeof crypto!=='undefined'&&crypto.randomUUID?crypto.randomUUID():`scan-${Date.now()}-${Math.random()}`;
  await operation('readwrite',store=>store.put({id,blob:file,name:file.name,mime:file.type,size:file.size}));
  return {id,name:file.name,mime:file.type,size:file.size};
}
export const loadIdentityScan=id=>operation('readonly',store=>store.get(id));
export const removeIdentityScan=id=>operation('readwrite',store=>store.delete(id));
export const clearIdentityScans=()=>operation('readwrite',store=>store.clear());
