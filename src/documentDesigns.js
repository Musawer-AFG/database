import {safeBusinessLogo} from './businessLogo.js';
import {validHex} from './themePalette.js';
export const DEFAULT_DOCUMENT_COLOR='#214661';
export function normalizeDocumentDesign(value={}){
  return {color:validHex(value?.color)?value.color.toLowerCase():DEFAULT_DOCUMENT_COLOR,logo:safeBusinessLogo(value?.logo),logoMode:['custom','none','shop'].includes(value?.logoMode)?value.logoMode:'shop'};
}
export function resolveDocumentDesign(prefs={},kind='bill',legacy={}){
  const raw=prefs[kind==='contract'?'contractDesign':'billDesign'];
  if(!raw) return {color:validHex(legacy.color)?legacy.color:DEFAULT_DOCUMENT_COLOR,logo:safeBusinessLogo(legacy.logo)||safeBusinessLogo(prefs.shopLogo)};
  const d=normalizeDocumentDesign(raw);
  return {color:d.color,logo:d.logoMode==='none'?'':d.logoMode==='custom'?d.logo:safeBusinessLogo(prefs.shopLogo)};
}
export function documentDesignChanged(previous,next){return JSON.stringify(normalizeDocumentDesign(previous))!==JSON.stringify(normalizeDocumentDesign(next)) || (!previous&&!!next);}
