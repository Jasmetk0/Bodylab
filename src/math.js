'use strict';
const num = v => v === null || v === undefined || v === '' ? null : (Number.isFinite(Number(v)) ? Number(v) : null);
const fixed = (v,d=1) => v == null || !Number.isFinite(Number(v)) ? '—' : Number(v).toLocaleString('cs-CZ',{minimumFractionDigits:d,maximumFractionDigits:d});
const fmt = (v, unit='', d=1) => v == null || !Number.isFinite(Number(v)) ? '—' : fixed(v,d) + (unit ? ' '+unit : '');
const escapeHtml = v => String(v ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const dateValue = s => new Date(`${s}T12:00:00`).getTime();
const isDate = s => /^\d{4}-\d{2}-\d{2}$/.test(String(s)) && !Number.isNaN(dateValue(s)) && new Date(dateValue(s)).toISOString().slice(0,10) === s;
const dateLabel = d => {if(!d) return '—'; const [y,m,dd]=d.split('-');return `${Number(dd)}. ${Number(m)}. ${y}`;};
const shortDate = d => { const [y,m,dd]=d.split('-');return `${Number(dd)}. ${Number(m)}.`; };
const sortAsc = (xs,key='date') => [...xs].sort((a,b)=>String(a[key]).localeCompare(String(b[key])));
const sortDesc = (xs,key='date') => [...xs].sort((a,b)=>String(b[key]).localeCompare(String(a[key])));
const mean = xs => xs.length ? xs.reduce((a,b)=>a+b,0)/xs.length : null;
const std = xs => xs.length>1 ? Math.sqrt(mean(xs.map(x=>(x-mean(xs))**2))) : null;
const getLatest = xs => sortDesc(xs)[0] || null;
const trailing = (xs,days,anchor) => {const last = anchor || getLatest(xs)?.date;if(!last) return [];
  const since=dateValue(last)-(days-1)*86400000;
  return sortAsc(xs.filter(x=>dateValue(x.date)>=since && dateValue(x.date)<=dateValue(last)));
};
const dailyMoving = (weights,days=7) => sortAsc(weights).map(w=>{
  const v=trailing(weights,days,w.date).map(r=>r.kg);
  return {...w,avg:mean(v),count:v.length};
});
const weightStats = weights => {
  const all=sortAsc(weights), last=getLatest(all);
  if(!last) return {latest:null,avg7:null,prev7:null,avg28:null,rate:null,delta:null,n7:0};
  const a7=trailing(all,7,last.date), a28=trailing(all,28,last.date);
  const prevDate=new Date(dateValue(last.date)-7*86400000).toISOString().slice(0,10);
  const p7=trailing(all,7,prevDate);
  const avg7=mean(a7.map(w=>w.kg)),prev7=mean(p7.map(w=>w.kg));
  const rate=regressionRate(a28);
  return {latest:last,avg7,prev7,avg28:mean(a28.map(w=>w.kg)),rate,
          delta:avg7 != null && prev7 != null ? avg7-prev7 : null,n7:a7.length,nPrev:p7.length};
};
const regressionRate = weights => {
  const xs=sortAsc(weights); if(xs.length<5) return null;
  const a=xs[0].date; const points=xs.map(w=>({x:(dateValue(w.date)-dateValue(a))/86400000,y:w.kg}));
  const mx=mean(points.map(p=>p.x)),my=mean(points.map(p=>p.y));
  const den=points.reduce((a,p)=>a+(p.x-mx)**2,0);
  if(!den) return null;
  return 7*points.reduce((a,p)=>a+(p.x-mx)*(p.y-my),0)/den;
};
const goalProgress=(start,target,current)=>{
  if([start,target,current].some(v=>num(v)==null) || Number(target)===Number(start)) return null;
  return (Number(current)-Number(start))/(Number(target)-Number(start))*100;
};
const datesRange=(a,b)=> (dateValue(b)-dateValue(a))/86400000;
const serializeCSV=(rows,fields)=> ['\ufeff'+fields.join(';'),...rows.map(x=>fields.map(k=>{
    let v=x[k]??'';if(typeof v==='number')v=String(v).replace('.',',');
    return `"${String(v).replace(/"/g,'""')}"`;
  }).join(';'))].join('\r\n');
const parseDelimitedRow=(line,delimiter)=>{const cells=[];let value='',quoted=false;
  for(let i=0;i<line.length;i++){let ch=line[i];if(ch==='"'){
    if(quoted && line[i+1]==='"'){value+='"';i++;}else quoted=!quoted;
  }else if(ch===delimiter&&!quoted){cells.push(value);value='';}else value+=ch;}
  cells.push(value);return cells;};
const parseWeightCSV=text=>{
  const lines=String(text).replace(/^\ufeff/,'').split(/\r?\n/).filter(x=>x.trim());
  if(!lines.length) return {rows:[],errors:['Soubor je prázdný.']};
  const delimiter=lines[0].includes(';')?';':lines[0].includes('\t')?'\t':',';
  const head=parseDelimitedRow(lines[0],delimiter).map(s=>s.trim().toLowerCase());
  const dateAt=head.findIndex(s=>/date|datum/.test(s)),weightAt=head.findIndex(s=>/weight|váha|vaha|kg|hmotnost/.test(s));
  const header=dateAt>=0&&weightAt>=0;
  const rows=[],errors=[];
  for(let i=header?1:0;i<lines.length;i++){
    const values=parseDelimitedRow(lines[i],delimiter).map(s=>s.trim());
    let date=values[header?dateAt:0],weight=values[header?weightAt:1];
    const m=/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/.exec(date);
    if(m)date=`${m[3]}-${m[2].padStart(2,'0')}-${m[1].padStart(2,'0')}`;
    const kg=num(String(weight??'').replace(',','.'));
    if(!isDate(date)||kg==null||kg<30||kg>300){errors.push(`Řádek ${i+1}: neplatné datum nebo hmotnost.`);continue;}
    rows.push({date,kg,note:'Import CSV',creatine:'unknown'});
  }
  return {rows,errors};
};
function safeData(input){
  if(!input||typeof input!=='object'||!Array.isArray(input.weights)||!Array.isArray(input.inbodies)||!Array.isArray(input.goals)||!Array.isArray(input.nutrition)) throw new Error('Neplatná struktura zálohy.');
  if([input.weights,input.inbodies,input.goals,input.nutrition].some(a=>a.length>10000)) throw new Error('Příliš mnoho záznamů v souboru.');
  const out=makeInitialData();out.weights=[];out.inbodies=[];out.goals=[];out.nutrition=[];out.events=[];
  for(const w of input.weights){if(!isDate(w.date)||num(w.kg)==null||w.kg<30||w.kg>300)throw new Error('Chybný záznam hmotnosti.');out.weights.push({date:w.date,kg:Number(w.kg),note:String(w.note||'').slice(0,500),creatine:['yes','no','unknown'].includes(w.creatine)?w.creatine:'unknown'});}
  for(const r of input.inbodies){if(!isDate(r.date))throw new Error('Chybné datum InBody.');let entry={date:r.date,source:String(r.source||'Vlastní záznam').slice(0,150),height:num(r.height)};
    for(const g of METRIC_GROUPS)for(const [key] of g.metrics) entry[key]=num(r[key]);
    for(const typ of ['lean','fat']){entry[typ]={};for(const [s] of SEGMENTS)entry[typ][s]=num(r[typ]?.[s]);}
    out.inbodies.push(entry);
  }
  for(const g of input.goals){if(!g||typeof g!=='object')continue;
    const goal={id:String(g.id||`goal-${out.goals.length}`).slice(0,80),name:String(g.name||'Cíl').slice(0,100),due:isDate(g.due)?g.due:'',historic:!!g.historic,note:String(g.note||'').slice(0,500),metrics:{},lean:{},fat:{}};
    for(const cat of METRIC_GROUPS)for(const [k]of cat.metrics)goal.metrics[k]=num(g.metrics?.[k]);
    for(const typ of ['lean','fat'])for(const [k] of SEGMENTS)goal[typ][k]=num(g[typ]?.[k]);
    out.goals.push(goal);
  }
  for(const n of input.nutrition){if(!isDate(n.date))throw new Error('Chybné datum jídelníčku.');
    const item={date:n.date,note:String(n.note||'').slice(0,500),estimated:!!n.estimated};
    for(const k of ['kcal','protein','carbs','fat']){item[k]=num(n[k]);if(item[k]!=null && (item[k]<0||item[k]>20000))throw new Error('Neplatná hodnota jídelníčku.');}out.nutrition.push(item);}
  if(Array.isArray(input.events)) for(const e of input.events.slice(0,1000)){if(isDate(e.date))out.events.push({date:e.date,end:isDate(e.end)?e.end:null,label:String(e.label||'Událost').slice(0,100),type:String(e.type||'other').slice(0,40)});}
  const base=makeInitialData().settings;out.settings={...base};
  if(input.settings && typeof input.settings==='object')for(const k of ['kcal','protein','carbs','fat','goalGain']){const value=num(input.settings[k]);if(value!=null && value>=0 && value<20000)out.settings[k]=value;}
  out.weights=sortAsc([...new Map(out.weights.map(r=>[r.date,r])).values()]);
  out.inbodies=sortAsc([...new Map(out.inbodies.map(r=>[r.date,r])).values()]);
  out.nutrition=sortAsc([...new Map(out.nutrition.map(r=>[r.date,r])).values()]);
  out.modifiedAt=new Date().toISOString();return out;
}
