// A separate browser namespace intentionally starts a new, empty shop without
// deleting records left by earlier prototype versions at their old keys.
export const FRESH_STORAGE_KEYS = Object.freeze({
  data: 'afghan-wholesale-fresh-v1-data',
  preferences: 'afghan-wholesale-fresh-v1-preferences',
  access: 'afghan-wholesale-fresh-v1-access',
  session: 'afghan-wholesale-fresh-v1-session',
});

export function validateFirstSetup({shopName,adminName,username,password,confirmPassword}) {
  if(!String(shopName||'').trim() || !String(adminName||'').trim())
    return {ok:false,message:'نام عمده‌فروشی و نام مدیر ضروری است.'};
  if(!/^[a-z0-9_.-]{3,32}$/i.test(String(username||'').trim()))
    return {ok:false,message:'نام کاربری باید ۳ تا ۳۲ حرف انگلیسی، عدد یا علامت مجاز داشته باشد.'};
  if(String(password||'').length<8)
    return {ok:false,message:'رمز باید حداقل ۸ حرف داشته باشد.'};
  if(password!==confirmPassword)
    return {ok:false,message:'تکرار رمز مطابقت ندارد.'};
  return {ok:true,profile:{shopName:String(shopName).trim().slice(0,90),adminName:String(adminName).trim().slice(0,80)},username:String(username).trim().toLowerCase()};
}

export function clearFreshStorage(local,session) {
  for(const key of [FRESH_STORAGE_KEYS.data,FRESH_STORAGE_KEYS.preferences,FRESH_STORAGE_KEYS.access]) local.removeItem(key);
  session.removeItem(FRESH_STORAGE_KEYS.session);
}
