// Prototype browser offline storage helper (unconnected to current React screens).
const DB_NAME = 'afghan-wholesale-offline-v1';
export function openOfflineDB() {
  if (!('indexedDB' in globalThis)) return Promise.reject(new Error('IndexedDB not supported'));
  return new Promise((resolve,reject)=>{
    const req=indexedDB.open(DB_NAME,1);
    req.onupgradeneeded=()=>{ const db=req.result;
      if(!db.objectStoreNames.contains('pendingOperations'))db.createObjectStore('pendingOperations',{keyPath:'id'});
    };
    req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error);
  });
}
