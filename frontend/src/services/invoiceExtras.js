// Extra invoice charges are recorded in the invoice's selected source currency.
// These amounts are added to its total, then converted to AFN at the recorded rate.
const KNOWN_TYPES=new Set(['transport','loading','customs','packaging','other']);
let nextExtraId=0;
export const newExtraExpense=()=>({id:`extra-${Date.now()}-${++nextExtraId}`,type:'other',description:'',amount:''});
// An unopened or untouched optional charge must never block saving a bill.
// Partially filled and nonzero charges still require full validation.
export const isBlankExtraExpense = entry => Boolean(entry) && (entry.type || 'other') === 'other'
  && !String(entry.description || '').trim() && (entry.amount === '' || entry.amount == null);
export const enteredExtraExpenses = extras => Array.isArray(extras)
  ? extras.filter(entry => !isBlankExtraExpense(entry)) : extras;
export function validateExtras(extras=[]){
  if(!Array.isArray(extras)) return 'مصارف اضافی معتبر نیست.';
  const entries=enteredExtraExpenses(extras);
  if(entries.some(e=>!e || !KNOWN_TYPES.has(e.type||'transport') || e.amount==='' || e.amount==null || !Number.isFinite(Number(e.amount)) || Number(e.amount)<=0))
    return 'مبلغ هر مصرف اضافی باید عددی بیشتر از صفر باشد.';
  if (entries.some(e => (e.type||'transport')==='other' && !String(e.description||'').trim()))
    return 'نام یا شرح مصارف اضافی را وارد کنید.';
  return '';
}
export function totalExtras(extras=[]){
  return Math.round((extras||[]).reduce((sum,e)=>sum+(Number.isFinite(Number(e?.amount))?Number(e.amount):0),0)*100)/100;
}
export function normalizeExtraExpenses(extras=[],convertAmount=(n)=>n){
  const problem=validateExtras(extras);
  if(problem) throw Error(problem);
  return enteredExtraExpenses(extras).map(e=>({id:e.id||`charge-${Date.now()}`,type:e.type||'other',description:String(e.description||'').trim().slice(0,200),sourceAmount:Number(e.amount),amount:convertAmount(Number(e.amount))}));
}
