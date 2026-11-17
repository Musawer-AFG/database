export const THEME_PRESETS=[
  {name:'آبی',hex:'#007aff'}, {name:'بنفش',hex:'#8056d8'}, {name:'سبز',hex:'#15856b'},
  {name:'لاجوردی',hex:'#3258c6'}, {name:'نارنجی',hex:'#c56716'}, {name:'گلابی',hex:'#bd498c'},
  {name:'فیروزه‌ای',hex:'#008f9e'}, {name:'سرخ',hex:'#b54b4b'},
];
export const validHex=value=>/^#[0-9a-fA-F]{6}$/.test(String(value||''));
const channel=v=>parseInt(v,16);
const blend=(hex,background,portion)=>{
  const rgb=[1,3,5].map(i=>channel(hex.slice(i,i+2)));
  const bg=[1,3,5].map(i=>channel(background.slice(i,i+2)));
  return '#'+rgb.map((x,i)=>Math.round(x*(1-portion)+bg[i]*portion).toString(16).padStart(2,'0')).join('');
};
const luminance=hex=>{
  const rgb=[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16)/255).map(x=>x<=.04045?x/12.92:((x+.055)/1.055)**2.4);
  return .2126*rgb[0]+.7152*rgb[1]+.0722*rgb[2];
};
const ratio=(a,b)=>{const x=luminance(a),y=luminance(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);};
export function themeColors(hex,mode='light'){
  const base=validHex(hex)?hex:THEME_PRESETS[0].hex;
  const dark=mode==='dark';
  const accent=dark?blend(base,'#ffffff',.22):base;
  let text=dark?blend(base,'#ffffff',.53):blend(base,'#000000',.18);
  const surface=dark?'#1c202b':'#ffffff';
  for(let i=0;i<16&&ratio(text,surface)<4.5;i++) text=blend(text,dark?'#ffffff':'#000000',.16);
  // Buttons always use white text. Darken user-selected light/neon colors until
  // WCAG AA contrast reaches 4.5:1 against white; keep accent for non-button UI.
  let buttonBg=base;
  for(let i=0;i<28 && ratio(buttonBg,'#ffffff')<4.5;i++) buttonBg=blend(buttonBg,'#000000',.105);
  const buttonHover=blend(buttonBg,'#000000',.16);
  const buttonText='#ffffff';
  const soft=dark?blend(base,'#1c202b',.82):blend(base,'#ffffff',.89);
  return {accent,text,soft,buttonText,buttonBg,buttonHover};
}
export function normalizeAppearance(raw={}){
  const customColors=[...new Set((Array.isArray(raw.customColors)?raw.customColors:[]).filter(validHex))].slice(0,16);
  const legacy={blue:THEME_PRESETS[0].hex,violet:THEME_PRESETS[1].hex,green:THEME_PRESETS[2].hex};
  const accent=validHex(raw.accent)?raw.accent:(legacy[raw.accent]||THEME_PRESETS[0].hex);
  return {mode:raw.mode==='dark'?'dark':'light',accent,customColors};
}
export function addCustomColor(appearance,hex){
  if(!validHex(hex)) throw Error('رنگ باید به شکل #RRGGBB باشد.');
  const a=normalizeAppearance(appearance);
  return {...a,accent:hex,customColors:[...new Set([...a.customColors,hex])].slice(-16)};
}
