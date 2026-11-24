// Browser-only shop identity image. Small data URLs are kept with the shop preferences.
// This is local demo storage; a future shared backend should store uploaded assets in object storage.
export const BUSINESS_LOGO_MAX_FILE_BYTES = 5 * 1024 * 1024;
const ACCEPTED_MIME = new Set(['image/jpeg','image/png','image/webp']);
const MAX_DATA_URL_LENGTH = 450000;

export function validateBusinessLogoFile(file) {
  if (!file || !ACCEPTED_MIME.has(file.type))
    return 'لطفاً عکس JPG، PNG یا WebP انتخاب کنید.';
  if (!Number.isFinite(file.size) || file.size <= 0 || file.size > BUSINESS_LOGO_MAX_FILE_BYTES)
    return 'حجم عکس باید کمتر از ۵ مگابایت باشد.';
  return '';
}

export function safeBusinessLogo(value) {
  if(typeof value !== 'string' || value.length > MAX_DATA_URL_LENGTH) return '';
  return /^data:image\/(?:png|jpeg|webp);base64,[a-z0-9+/=]+$/i.test(value) ? value : '';
}

export async function readBusinessLogo(file) {
  const error=validateBusinessLogoFile(file);
  if(error) throw new Error(error);
  const imageUrl=URL.createObjectURL(file);
  try {
    const img=await new Promise((resolve,reject)=>{
      const element=new Image();
      element.onload=()=>resolve(element);
      element.onerror=()=>reject(new Error('این عکس قابل خواندن نیست. عکس دیگری انتخاب کنید.'));
      element.src=imageUrl;
    });
    if(!img.naturalWidth || !img.naturalHeight || img.naturalWidth>10000 || img.naturalHeight>10000)
      throw new Error('ابعاد عکس مناسب نیست. لطفاً عکس دیگری انتخاب کنید.');
    const canvas=document.createElement('canvas');
    canvas.width=256; canvas.height=256;
    const ctx=canvas.getContext('2d');
    if(!ctx) throw new Error('براوزر نتوانست عکس را آماده کند.');
    const scale=Math.min(256/img.naturalWidth,256/img.naturalHeight);
    const w=img.naturalWidth*scale, h=img.naturalHeight*scale;
    ctx.drawImage(img,(256-w)/2,(256-h)/2,w,h);
    let result=canvas.toDataURL('image/webp',0.86);
    if(!safeBusinessLogo(result)) {
      ctx.globalCompositeOperation='destination-over';
      ctx.fillStyle='#ffffff'; ctx.fillRect(0,0,256,256);
      result=canvas.toDataURL('image/jpeg',0.78);
    }
    if(!safeBusinessLogo(result)) throw new Error('فایل عکس بسیار بزرگ است. عکس دیگری انتخاب کنید.');
    return result;
  } finally {URL.revokeObjectURL(imageUrl);}
}
