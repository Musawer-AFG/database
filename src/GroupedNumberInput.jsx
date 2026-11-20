import React from "react";
import {groupedNumber,ungroupedNumber} from "./calendarDisplay.js";
export default function GroupedNumberInput({value='',onChange,min,step,max,inputMode, ...props}) {
  const inputRef=React.useRef(null);
  const change=e=>{
    const clean=ungroupedNumber(e.target.value);
    const nonnegative=Number(min)>=0 && min!==undefined;
    if(!/^[-]?\d*(?:\.\d*)?$/.test(clean)|| (nonnegative&&clean.startsWith('-')))return;
    const before=ungroupedNumber(e.target.value.slice(0,e.target.selectionStart??e.target.value.length)).length;
    onChange?.({target:{value:clean}});
    // Keep insertion position when a thousands separator is inserted.
    requestAnimationFrame(()=>{const el=inputRef.current;if(!el||document.activeElement!==el)return;let i=0,n=0;for(;i<el.value.length&&n<before;i++){if(el.value[i]!==',')n++;}el.setSelectionRange(i,i);});
  };
  return <input {...props} ref={inputRef} type="text" inputMode={inputMode||'decimal'} value={groupedNumber(value)} onChange={change}/>;
}
