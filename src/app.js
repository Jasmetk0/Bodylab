'use strict';
const ICONS={
  dashboard:'<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/>',
  weight:'<path d="M3 8a9 9 0 0 1 18 0v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M12 8l2.5-2.5M8 12h8"/>',
  body:'<circle cx="12" cy="4" r="2"/><path d="M5 21l2-8-2-6 7-1 7 1-2 6 2 8M7 13h10M10 13l-1 8m5-8 1 8"/>',
  target:'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
  food:'<path d="M4 3v7a4 4 0 0 0 8 0V3M8 3v18M19 3c-3 2-5 5-5 9h5v9"/>',
  data:'<path d="M4 6h16M4 12h16M4 18h16"/><circle cx="8" cy="6" r="2" fill="currentColor"/><circle cx="16" cy="12" r="2" fill="currentColor"/>',
  plus:'<path d="M12 5v14M5 12h14"/>',
  arrow:'<path d="M5 12h14m-6-6 6 6-6 6"/>',
  down:'<path d="m6 9 6 6 6-6"/>',
  edit:'<path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4z"/>',
  trash:'<path d="M3 6h18M8 6V4h8v2m3 0-1 15H6L5 6m5 4v7m4-7v7"/>',
  file:'<path d="M5 3h9l5 5v13H5zM14 3v5h5M8 13h8m-8 4h8"/>',
  upload:'<path d="M12 16V3m-5 5 5-5 5 5M4 15v5h16v-5"/>',
  download:'<path d="M12 3v13m-5-5 5 5 5-5M4 18v3h16v-3"/>',
  calendar:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4m10-4v4M3 10h18"/>',
  chart:'<path d="M3 21h18M3 21V3m3 12 5-5 4 3 6-8"/>',
  shield:'<path d="M12 2l9 4v6c0 6-4 9-9 10-5-1-9-4-9-10V6z"/><path d="m8 12 3 3 5-6"/>',
  activity:'<path d="M3 12h4l3-7 4 14 3-7h4"/>',
  info:'<circle cx="12" cy="12" r="10"/><path d="M12 11v6m0-10h.01"/>',
  check:'<path d="m4 12 5 5 11-11"/>',
  refresh:'<path d="M20 7v5h-5M4 17v-5h5M6 9a7 7 0 0 1 12-2l2 5M4 12l2 5a7 7 0 0 0 12-2"/>',
  trophy:'<path d="M7 4h10v7a5 5 0 0 1-10 0zM7 6H3v4a4 4 0 0 0 4 4m10-8h4v4a4 4 0 0 1-4 4m-5 2v4m-5 1h10"/>',
  clock:'<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 3"/>',
  save:'<path d="M5 3h13l3 3v15H3V3h2m3 0v6h8V3M7 21v-8h10v8"/>'
};
const icon=(key,cls='')=>`<svg class="${cls}" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[key]||ICONS.info}</svg>`;
let data;let storageError=false;let recoveryRaw=null;
const ui={view:'dashboard',period:90,weightEdit:null,weightShowAll:false,inbodyEdit:null,goalEdit:null,nutritionEdit:null,baseInbody:'',newInbody:'',showInbodyForm:false,showGoalForm:false,showNutritionForm:false};
function loadData(){
 try{const r=readStoredData(localStorage);
  if(r.invalidRaw!==null){recoveryRaw=r.invalidRaw;storageError=true;console.warn('Nečitelná historie FORMA:',r.error);}
  return r.data;
 }catch(e){storageError=true;console.warn('Úložiště:',e);return makeInitialData();}
}
function saveData(){
 if(recoveryRaw!==null){storageError=true;toast('Původní data jsou chráněná. Obnov je nebo vědomě resetuj.','error');return false;}
 try{data=writeStoredData(localStorage,data);storageError=false;return true;}
 catch(e){storageError=true;toast('Uložení selhalo. Změna nemusí být trvalá – stáhni JSON zálohu.','error');return false;}
}
function applyReplacement(candidate,message){
 try{const saved=writeStoredData(localStorage,candidate);data=saved;recoveryRaw=null;storageError=false;
  ui.baseInbody=firstInBody()?.date||'';ui.newInbody=lastInBody()?.date||'';
  render();toast(message);return true;
 }catch(e){storageError=true;render();toast('Zápis selhal; původní data zůstala uložená.','error');return false;}
}
function toast(text,type='ok'){const host=document.getElementById('toast-host');host.innerHTML=`<div class="toast ${type==='error'?'error':''}">${escapeHtml(text)}</div>`;clearTimeout(toast._timer);toast._timer=setTimeout(()=>host.innerHTML='',3900);}
function download(content,name,type){const blob=new Blob([content],{type}),url=URL.createObjectURL(blob),anchor=document.createElement('a');anchor.href=url;anchor.download=name;document.body.append(anchor);anchor.click();anchor.remove();setTimeout(()=>URL.revokeObjectURL(url),1500);}
function saveAndRender(message){const ok=saveData();render();if(ok&&message)toast(message);}
const navs=[['dashboard','Přehled','dashboard'],['weight','Ranní váha','weight'],['inbody','InBody','body'],['goals','Moje cíle','target'],['nutrition','Strava','food'],['data','Data a zálohy','data']];
function navMarkup(mobile=false){return navs.map(([id,title,ic])=>`<button type="button" data-nav="${id}" class="${ui.view===id?'active':''}" title="${title}" aria-label="${title}" aria-current="${ui.view===id?'page':'false'}">${icon(ic)}<span>${title}</span></button>`).join('');}
function layout(content){const latest=getLatest(data.weights);
  return `<div class="app-layout"><aside class="sidebar"><div class="brand"><div class="brand-symbol">↗</div><div><div class="brand-name">FORMA<span style="color:var(--lime)">.</span></div><span class="brand-kicker">BODY PROGRESS LAB</span></div></div><div><div class="nav-label">Tvůj prostor</div><nav class="nav" aria-label="Hlavní navigace">${navMarkup()}</nav></div><div class="sidebar-bottom"><b><span class="signal"></span> Soukromá data</b><p>Uložená v tomto prohlížeči. Pravidelně exportuj zálohu.</p></div></aside>
  <main class="main"><div class="topbar"><div class="breadcrumb">FORMA / <strong>${escapeHtml(navs.find(n=>n[0]===ui.view)?.[1]||'Přehled')}</strong></div><div class="mobile-brand"><div class="brand-symbol">↗</div>FORMA<span style="color:var(--lime)">.</span></div><div class="top-right"><span class="pill"><span class="dot"></span>${escapeHtml(latest?`Poslední vážení ${dateLabel(latest.date)}`:'Zatím bez vážení')}</span><button class="button primary" data-action="new-weight">${icon('plus')}<span> Zapsat váhu</span></button></div></div>${recoveryRaw!==null?'<div class="info warning" role="alert" style="margin-top:15px"><b>OCHRANA DAT: historii se nepodařilo načíst</b><p>Původní obsah zůstal v tomto prohlížeči nedotčený. Nové zápisy jsou blokované, dokud historii neobnovíš nebo vědomě nesmažeš.</p><div class="recovery-actions"><button class="button" data-action="download-recovery">Stáhnout původní obsah</button><button class="button" data-nav="data">Obnovit ze zálohy</button><button class="button ghost" data-action="reset-recovery">Smazat poškozený obsah</button></div></div>':storageError?'<div class="info warning" role="alert" style="margin-top:15px">Prohlížeč blokuje ukládání. Změny nemusí být trvalé. Stáhni JSON zálohu.</div>':''}${content}<div class="footer-note">FORMA v1.0 · Všechna data zůstávají na tomto zařízení · InBody je orientační měření, nikoli lékařská diagnóza.</div></main><nav class="mobile-nav" aria-label="Mobilní navigace">${navMarkup(true)}</nav></div>`;}
function pageHeader(kicker,title,subtitle,actions=''){return `<header class="header"><div><div class="overline">${escapeHtml(kicker)}</div><h1>${title}</h1><p>${subtitle}</p></div>${actions?`<div class="header-actions">${actions}</div>`:''}</header>`;}
function card(title,sub,body,extra=''){return `<section class="card ${extra}"><div class="card-heading"><div><h2>${title}</h2>${sub?`<p>${sub}</p>`:''}</div></div>${body}</section>`;}
function stat(label,value,unit,foot,ic='',cl=''){return `<section class="card ${cl}">${ic?`<div class="stat-mark">${icon(ic)}</div>`:''}<div class="stat-label">${label}</div><div class="stat-value">${value}<small> ${unit}</small></div><div class="stat-foot">${foot}</div></section>`;}
function goalById(id){return data.goals.find(g=>g.id===id)||null;}
const firstInBody=()=>sortAsc(data.inbodies)[0]||null;
const lastInBody=()=>getLatest(data.inbodies);
function trendLabel(rate){if(rate==null)return 'Málo údajů pro trend';if(rate>0.08)return `+${fixed(rate,2)} kg / týden`;if(rate<-.08)return `${fixed(rate,2)} kg / týden`;return `±${fixed(Math.abs(rate),2)} kg / týden`;}
function periodButtons(){return `<div class="seg-control" aria-label="Období grafu">${[[30,'30 dní'],[90,'90 dní'],[0,'Vše']].map(([val,t])=>`<button type="button" data-period="${val}" class="${ui.period===val?'active':''}" aria-pressed="${ui.period===val}">${t}</button>`).join('')}</div>`;}
function weightChart(){const full=sortAsc(data.weights);
  if(!full.length)return `<div class="empty">Zatím nemáš žádné vážení.</div>`;
  const last=getLatest(full).date,cut=ui.period?dateValue(last)-(ui.period-1)*86400000:-Infinity;
  const series=full.filter(w=>dateValue(w.date)>=cut),moving=dailyMoving(full).filter(w=>dateValue(w.date)>=cut);
  const left=49,right=838,top=18,bottom=225,width=right-left,height=bottom-top;
  let values=series.flatMap(w=>[w.kg]),ymin=Math.floor((Math.min(...values)-.35)*2)/2,ymax=Math.ceil((Math.max(...values)+.35)*2)/2;
  if(ymax-ymin<1){ymin-=.5;ymax+=.5;}
  let x1=dateValue(series[0].date),x2=dateValue(series[series.length-1].date);if(x1===x2)x2=x1+86400000;
  const px=t=>left+(dateValue(t)-x1)/(x2-x1)*width;
  const py=v=>bottom-(v-ymin)/(ymax-ymin)*height;
  const rawPath=series.map((w,i)=>`${i?'L':'M'}${px(w.date).toFixed(1)},${py(w.kg).toFixed(1)}`).join(' ');
  const smoothPath=moving.map((w,i)=>`${i?'L':'M'}${px(w.date).toFixed(1)},${py(w.avg).toFixed(1)}`).join(' ');
  const grid=Array.from({length:5},(_,i)=>{const y=top+i/4*height,v=ymax-i/4*(ymax-ymin);return `<line x1="${left}" x2="${right}" y1="${y}" y2="${y}" stroke="#34414a" stroke-dasharray="3 6"/><text x="${left-10}" y="${y+4}" text-anchor="end" class="chart-label">${fixed(v,1)}</text>`;}).join('');
  const labels=Array.from({length:5},(_,i)=>{const date=new Date(x1+i/4*(x2-x1)).toISOString().slice(0,10);return `<text x="${left+i/4*width}" y="${bottom+26}" text-anchor="${i===0?'start':i===4?'end':'middle'}" class="chart-label">${shortDate(date)}</text>`;}).join('');
  const marks=data.events.filter(e=>dateValue(e.date)>=x1&&dateValue(e.date)<=x2).map(e=>`<line x1="${px(e.date)}" x2="${px(e.date)}" y1="${top}" y2="${bottom}" stroke="#c8a079" stroke-dasharray="3 5" opacity=".65"/><title>${escapeHtml(e.label)}</title>`).join('');
  const rawDots=series.map(w=>`<circle cx="${px(w.date)}" cy="${py(w.kg)}" r="${series.length<35?3.3:2.3}" fill="#83a7ab" opacity=".82" stroke="#141b24" stroke-width=".8"><title>${dateLabel(w.date)}: ${fixed(w.kg,1)} kg${w.note?` · ${escapeHtml(w.note)}`:''}</title></circle>`).join('');
  const lastW=series[series.length-1];const pxL=px(lastW.date),pyL=py(lastW.kg);
  return `<div class="chart-holder"><svg class="chart" viewBox="0 0 860 274" role="img" aria-label="Graf vývoje denní váhy a sedmidenního klouzavého průměru"><defs><linearGradient id="wFill" x1="0" x2="0" y1="0" y2="1"><stop stop-color="#c7f172" stop-opacity=".18"/><stop offset="1" stop-color="#c7f172" stop-opacity="0"/></linearGradient></defs>${grid}${marks}<path d="${smoothPath} L${pxL} ${bottom} L${px(series[0].date)} ${bottom} Z" fill="url(#wFill)" opacity=".9"/><path d="${rawPath}" fill="none" stroke="#88a9ac" stroke-width="1.5" opacity=".76" stroke-linejoin="round"/><path d="${smoothPath}" fill="none" stroke="#c7f172" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/>${rawDots}<circle cx="${pxL}" cy="${pyL}" r="5.5" fill="#c7f172" stroke="#1b2a24" stroke-width="3"/>${labels}<text x="${left}" y="10" class="chart-label">kg</text></svg></div><div class="legend"><span><i style="background:var(--lime)"></i> 7denní průměr</span><span><i style="background:#88a9ac"></i> Ranní vážení</span><span><i style="background:#c8a079"></i> Událost</span></div>`;
}
function progressItem(label,start,target,current,unit='kg'){
  const p=goalProgress(start,target,current);const targetReached=p!=null&&p>=100;
  return `<div class="progress-row"><div class="row-between"><strong>${label}</strong><span class="muted">${fmt(current,unit)} / ${fmt(target,unit)}</span></div><div class="goal-bar"><div style="width:${p==null?0:Math.max(0,Math.min(100,p))}%"></div></div><div class="row-between"><span class="muted">Od ${fmt(start,unit)}</span><span class="${targetReached?'positive':'muted'} tiny">${p==null?'Bez srovnání':`${fixed(p,0)} % přírůstku`}</span></div></div>`;
}
function dashboard(){const stats=weightStats(data.weights),latest=lastInBody(),base=firstInBody(),sept=goalById('goal-september'),north=goalById('goal-northstar'),weight=stats.latest;
  const pastNutr=sortDesc(data.nutrition).slice(0,7),avgKcal=mean(pastNutr.filter(n=>n.kcal!=null).map(n=>n.kcal));
  const gainTarget=num(data.settings.goalGain)||.2;
  const subtitle='Sleduj skutečný trend, svalovou hmotu a své dlouhodobé cíle. Bez zbytečných odhadů.';
  return pageHeader('Tvůj performance dashboard','Každý gram má svůj příběh.',subtitle,`<button class="button ghost" data-nav="data">${icon('download')} Data a zálohy</button>`)+
    (!data.weights.length&&!data.inbodies.length?'<section class="card section accent"><div class="card-heading"><div><h2>Vítej ve FORMA!</h2><p>Začni importem soukromé zálohy JSON nebo zapisuj první ranní váhu.</p></div></div><button class="button primary" data-nav="data">Importovat moje data</button></section>':'')+
    `<div class="grid cols4">${stat('Poslední ranní váha',weight?fixed(weight.kg,1):'—','kg',weight?dateLabel(weight.date):'Zatím bez měření','weight','accent')}${stat('Průměr za 7 dní',fmt(stats.avg7,'',2),'kg',stats.delta==null?'Bez předchozího týdne':`${stats.delta>=0?'+':''}${fixed(stats.delta,2)} kg proti předchozím 7 dnům`,'chart')}${stat('Kosterní svaly (SMM)',latest?fixed(latest.smm,1):'—','kg',latest?`InBody ${dateLabel(latest.date)}`:'Bez měření','body')}${stat('Tělesný tuk (PBF)',latest?fixed(latest.pbf,1):'—','%',latest?`Celkem ${fmt(latest.fatKg,'kg',1)} tuku`:'Bez měření','activity')}</div>`+
    `<div class="grid cols3 section"><section class="card span2"><div class="card-heading split-head"><div><h2>Vývoj hmotnosti</h2><p>Skutečné hodnoty a 7denní vyhlazený trend</p></div>${periodButtons()}</div>${weightChart()}<p class="chart-note">Trend za posledních 28 dní: <strong style="color:var(--text)">${trendLabel(stats.rate)}</strong>. Krátkodobé výkyvy mohou souviset s vodou, glykogenem nebo tréninkem.</p></section>
    <section class="card"><div class="card-heading"><div><h2>Historický milník</h2><p>Porovnání s uloženým cílem</p></div><span class="chip warn">Cíl</span></div>${sept&&base&&latest?`${progressItem('Hmotnost',base.weight,sept.metrics.weight,latest.weight)}${progressItem('Kosterní svaly',base.smm,sept.metrics.smm,latest.smm)}${progressItem('Beztuková hmota',base.ffm,sept.metrics.ffm,latest.ffm)}`:'<div class="empty">Doplň InBody a cíle.</div>'}<button class="button ghost" data-nav="goals" style="width:100%;margin-top:12px">Detail cílů ${icon('arrow')}</button></section></div>`+
    `<div class="grid cols3 section"><section class="card"><div class="card-heading"><div><h2>North Star</h2><p>Finální dlouhodobý cíl</p></div>${icon('trophy')}</div><div class="big-number">${fmt(north?.metrics.weight,'kg',0)}</div><div class="note">${fmt(north?.metrics.smm,'kg',0)} SMM · ${fmt(north?.metrics.pbf,'%',0)} tělesného tuku</div><div style="height:18px"></div>${latest&&north&&base?progressItem('Hmotnost od prvního InBody',base.weight,north.metrics.weight,latest.weight):''}<div class="info">Dosažení cíle nelze spolehlivě datovat jen z tempa růstu váhy; svaly přibývají nerovnoměrně.</div></section>
    <section class="card"><div class="card-heading"><div><h2>Energie a bílkoviny</h2><p>Tvůj aktuální plán stravy</p></div>${icon('food')}</div><div class="row-between" style="align-items:baseline"><div><div class="big-number">${fmt(data.settings.kcal,'',0)}</div><div class="tiny muted">kcal / den</div></div><div><div class="big-number">${fmt(data.settings.protein,'',0)}</div><div class="tiny muted">g bílkovin / den</div></div></div><div style="height:18px"></div><div class="key-value"><strong>Poslední 7 záznamů</strong><span>${fmt(avgKcal,'kcal',0)} / den</span></div><div class="key-value"><strong>Cílové tempo</strong><span>${fmt(gainTarget,'kg/týden',2)}</span></div><button class="button ghost" style="margin-top:14px;width:100%" data-nav="nutrition">Záznamy stravy ${icon('arrow')}</button></section>
    <section class="card"><div class="card-heading"><div><h2>Co sledovat teď</h2><p>Priorita pro další týdny</p></div>${icon('target')}</div><div class="insight"><div class="ins-icon">↗</div><div><b>Udržet kvalitní růst</b><p>Vyhodnocuj alespoň 14denní trend průměrné váhy, ne jednotlivé ráno.</p></div></div><div class="insight" style="margin-top:9px"><div class="ins-icon">◉</div><div><b>Kontrolovat končetiny</b><p>Porovnávej segmenty InBody za podobných podmínek. Rozdíly okolo 0,1 kg jsou nejisté.</p></div></div><div class="insight" style="margin-top:9px"><div class="ins-icon">☑</div><div><b>Zálohovat</b><p>Data jsou zatím jen v tomto prohlížeči. Doporučuji pravidelný export JSON.</p></div></div></section></div>`;
}
function weightForm(){const w=data.weights.find(x=>x.date===ui.weightEdit);
 return `<section class="card" id="weight-form"><div class="card-heading"><div><h2>${w?'Upravit ranní vážení':'Přidat ranní vážení'}</h2><p>Ideálně po probuzení, po toaletě, před jídlem a pitím</p></div></div><form class="form" id="form-weight"><input type="hidden" name="original" value="${escapeHtml(w?.date||'')}">
 <div class="field"><label for="weight-date">Datum</label><input type="date" id="weight-date" name="date" required value="${w?.date||new Date().toLocaleDateString('sv-SE')}"></div>
 <div class="field"><label for="weight-value">Hmotnost (kg)</label><input type="number" id="weight-value" name="kg" min="30" max="300" step="0.01" required placeholder="např. 68,4" value="${w?.kg??''}"></div>
 <div class="field"><label for="weight-creatine">Kreatin</label><select id="weight-creatine" name="creatine"><option value="unknown">Nezaznamenáno</option><option value="yes" ${w?.creatine==='yes'?'selected':''}>Užit</option><option value="no" ${w?.creatine==='no'?'selected':''}>Vynechán</option></select></div>
 <div class="field"><label for="weight-note">Poznámka</label><input type="text" id="weight-note" name="note" maxlength="500" placeholder="např. po MMA" value="${escapeHtml(w?.note||'')}"></div>
 <div class="form-actions">${w?'<button type="button" class="button ghost" data-action="cancel-weight">Zrušit úpravu</button>':''}<button class="button primary" type="submit">${icon('save')} ${w?'Uložit úpravy':'Uložit ranní váhu'}</button></div></form></section>`;
}
function weightsPage(){const stats=weightStats(data.weights),sorted=sortDesc(data.weights),rows=ui.weightShowAll?sorted:sorted.slice(0,18);
 return pageHeader('Denní záznamy','Ranní váha. Bez hádání.','Jednotlivé dny kolísají. Sleduj hlavně několik týdnů a poznámky k událostem.')+
 `<div class="grid cols4">${stat('Aktuální váha',fmt(stats.latest?.kg,'',1),'kg',dateLabel(stats.latest?.date),'weight','accent')}${stat('Průměr 7 dní',fmt(stats.avg7,'',2),'kg',`${stats.n7} měření v posledních 7 dnech`,'chart')}${stat('Trend 28 dní',stats.rate==null?'—':`${stats.rate>=0?'+':''}${fixed(stats.rate,2)}`,'kg/týden','Trend jen při alespoň 8 váženích za 14+ dní','activity')}${stat('Počet záznamů',String(data.weights.length),'','Historie vlastních záznamů','calendar')}</div>`+
 `<div class="grid cols3 section"><section class="card span2"><div class="card-heading split-head"><div><h2>Graf vývoje</h2><p>7denní průměr pomáhá filtrovat šum</p></div>${periodButtons()}</div>${weightChart()}</section>${weightForm()}</div>`+
 `<section class="card section"><div class="card-heading split-head"><div><h2>Historie vážení</h2><p>Každý záznam můžeš upravit nebo smazat</p></div><div class="selector"><button class="button small" data-action="export-weight-csv">${icon('download')} CSV</button></div></div><div class="table-scroll"><table><thead><tr><th>Datum</th><th class="right">Váha</th><th>Poznámka</th><th>Kreatin</th><th class="right">Akce</th></tr></thead><tbody>${rows.map(w=>`<tr><td class="nowrap">${dateLabel(w.date)}</td><td class="right"><strong>${fmt(w.kg,'kg',1)}</strong></td><td>${escapeHtml(w.note||'—')}</td><td>${w.creatine==='yes'?'<span class="chip">Ano</span>':w.creatine==='no'?'<span class="chip warn">Vynechán</span>':'<span class="nothing">—</span>'}</td><td><div class="row-actions"><button class="button small ghost" title="Upravit" aria-label="Upravit váhu ${dateLabel(w.date)}" data-action="edit-weight" data-date="${w.date}">${icon('edit')}</button><button class="button small ghost" title="Smazat" aria-label="Smazat váhu ${dateLabel(w.date)}" data-action="delete-weight" data-date="${w.date}">${icon('trash')}</button></div></td></tr>`).join('')}</tbody></table></div>${!ui.weightShowAll&&sorted.length>18?`<div style="text-align:center;padding-top:15px"><button class="button ghost" data-action="show-weights">Zobrazit všech ${sorted.length} záznamů</button></div>`:''}</section>`;
}
function metricCell(v,k,unit){let digits=['ecwTbw','ecfTbf','absi'].includes(k)?3:['score','visceral','obesity','bmr','intake','bma','amc'].includes(k)?0: k==='minerals'||k==='protein'?2:1;
  return `<span class="${v==null?'nothing':''}">${fmt(v,unit,digits)}</span>`;}
function metricDiff(a,b,k,unit){if(a==null||b==null)return '<span class="nothing">—</span>';const d=b-a;const dp=['ecwTbw','ecfTbf','absi'].includes(k)?3:['bmr','intake','score','visceral','obesity','bma'].includes(k)?0:2;
  return `<span class="${Math.abs(d)<0.00001?'muted':d>0?'positive':'negative'}">${d>0?'+':''}${fixed(d,dp)}${unit?' '+unit:''}</span>`;}
function inbodySelectors(){const opts=sortAsc(data.inbodies);const option=(chosen)=>opts.map(r=>`<option value="${r.date}" ${r.date===chosen?'selected':''}>${dateLabel(r.date)}</option>`).join('');
 return `<div class="selector"><label class="tiny muted" for="base-inbody">Porovnat:</label><select id="base-inbody" data-select="base-inbody">${option(ui.baseInbody)}</select><span class="muted">vs.</span><select aria-label="Novější InBody" data-select="new-inbody">${option(ui.newInbody)}</select></div>`;}
function inbodyComparison(){const a=data.inbodies.find(r=>r.date===ui.baseInbody)||firstInBody(),b=data.inbodies.find(r=>r.date===ui.newInbody)||lastInBody();
 const goal=goalById('goal-september');if(!a||!b)return `<div class="empty">Přidej alespoň jedno měření InBody.</div>`;
 return `<div class="table-scroll"><table><thead><tr><th>Ukazatel</th><th class="right">${dateLabel(a.date)}</th><th class="right">${dateLabel(b.date)}</th><th class="right">Změna</th><th class="right">Historický cíl</th><th class="right">Zbývá</th></tr></thead><tbody>${METRIC_GROUPS.map(g=>`<tr class="group-row"><td colspan="6">${g.title}</td></tr>`+g.metrics.map(([k,label,unit])=>{
 const av=a[k],bv=b[k],gv=goal?.metrics?.[k];return `<tr><td>${label}</td><td class="right nowrap">${metricCell(av,k,unit)}</td><td class="right nowrap"><strong>${metricCell(bv,k,unit)}</strong></td><td class="right nowrap">${metricDiff(av,bv,k,unit)}</td><td class="right nowrap">${metricCell(gv,k,unit)}</td><td class="right nowrap">${gv==null||bv==null?'<span class="nothing">—</span>':metricDiff(bv,gv,k,unit)}</td></tr>`;}).join('')).join('')}</tbody></table></div><p class="chart-note">„Zbývá“ je pouze aritmetický rozdíl (cíl − aktuální hodnota), nikoliv doporučené zvýšení. Chybějící naměřená čísla nejsou dopočtena.</p>`;
}
function segmentGroup(type,label){const a=data.inbodies.find(r=>r.date===ui.baseInbody)||firstInBody(),b=data.inbodies.find(r=>r.date===ui.newInbody)||lastInBody(),goal=goalById('goal-september');
 return card(label,`${type==='lean'?'Segmentální beztuková hmota':'Odhad segmentálního tuku'} · kg`,SEGMENTS.map(([k,name])=>{
  const av=a?.[type]?.[k],bv=b?.[type]?.[k],gv=goal?.[type]?.[k];const scale=Math.max(av||0,bv||0,gv||0,.1)*1.1;
  return `<div class="seg-item"><div class="row-between"><strong style="font-size:12px">${name}</strong><span class="tiny muted">${fmt(bv,'kg',2)} ${av!=null&&bv!=null?`<span class="${bv>=av?'positive':'negative'}">(${bv-av>=0?'+':''}${fixed(bv-av,2)})</span>`:''}</span></div><div class="seg-lines"><div class="base" style="width:${(av||0)/scale*100}%"></div><div class="new" style="width:${(bv||0)/scale*100}%"></div>${gv!=null?`<div class="target" style="left:${gv/scale*100}%"></div>`:''}</div></div>`;}).join('')+`<div class="legend"><span><i style="background:#617f88"></i> První</span><span><i style="background:var(--lime)"></i> Druhé</span><span><i style="background:#ffca8e"></i> Zářijový cíl</span></div>`);
}
function numberField(key,label,value,unit='',step='.01'){return `<div class="field"><label for="inbody-${key}">${escapeHtml(label)}${unit?` (${unit})`:''}</label><input id="inbody-${key}" type="number" min="0" max="100000" step="${step}" name="${key}" value="${value==null?'':value}" placeholder="Nezadáno"></div>`;}
function inbodyForm(){const r=data.inbodies.find(v=>v.date===ui.inbodyEdit);
 return `<section class="card section" id="inbody-form"><div class="card-heading"><div><h2>${r?'Upravit InBody':'Nové měření InBody'}</h2><p>Všechny údaje jsou volitelné kromě data. Neznámé hodnoty nech prázdné.</p></div></div><form id="form-inbody" class="form"><input type="hidden" name="original" value="${r?.date||''}">
 <div class="field"><label for="ib-date">Datum měření</label><input id="ib-date" type="date" name="date" required value="${r?.date||new Date().toLocaleDateString('sv-SE')}"></div>
 <div class="field"><label for="ib-height">Výška (cm)</label><input id="ib-height" name="height" type="number" min="50" max="250" step=".1" value="${r?.height??''}"></div>
 <div class="field span2"><label for="ib-source">Zdroj / přístroj</label><input id="ib-source" name="source" maxlength="150" value="${escapeHtml(r?.source||'InBody – vlastní měření')}"></div>
 ${METRIC_GROUPS.map((g,i)=>`<div class="form-title">${g.title}</div>${g.metrics.map(([k,label,unit])=>numberField(k,label,r?.[k],unit,['score','visceral','obesity','bmr','intake'].includes(k)?'1':'.001')).join('')}`).join('')}
 ${['lean','fat'].map(type=>`<div class="form-title">${type==='lean'?'Svalové segmenty (SLM)':'Tukové segmenty'} · kg</div>${SEGMENTS.map(([k,label])=>numberField(`${type}__${k}`,label,r?.[type]?.[k],'kg')).join('')}`).join('')}
 <div class="form-actions"><button type="button" class="button ghost" data-action="cancel-inbody">Zrušit</button><button type="submit" class="button primary">${icon('save')} ${r?'Uložit měření':'Přidat InBody'}</button></div></form></section>`;
}
function inbodyPage(){const newest=lastInBody();return pageHeader('Měření tělesného složení','InBody pod lupou.','Porovnávání všech dostupných parametrů, segmentů a původních cílů. Chybějící údaje zůstávají prázdné.',`<button class="button primary" data-action="new-inbody">${icon('plus')} Nové měření</button>`)+
 `<div class="grid cols4">${stat('Kosterní svaly',fmt(newest?.smm,'',1),'kg','SMM – poslední měření','body','accent')}${stat('Beztuková hmota',fmt(newest?.ffm,'',1),'kg','FFM – poslední měření','weight')}${stat('Procento tuku',fmt(newest?.pbf,'',1),'%','PBF – poslední měření','activity')}${stat('InBody skóre',fmt(newest?.score,'',0),'/100','Orientační skóre přístroje','target')}</div>`+
 `<section class="card section"><div class="card-heading split-head"><div><h2>Kompletní porovnání měření</h2><p>Včetně původního cíle na září 2026</p></div>${inbodySelectors()}</div>${inbodyComparison()}</section>`+
 `<div class="grid cols2 section">${segmentGroup('lean','Svalová hmota podle segmentů')}${segmentGroup('fat','Tuk podle segmentů')}</div>`+
 `<section class="card section"><div class="card-heading"><div><h2>Uložená měření</h2><p>Můžeš přidávat libovolně mnoho dalších měření</p></div></div><div class="timeline">${sortDesc(data.inbodies).map(r=>`<div class="timeline-item"><div class="row-between"><div><h4>${dateLabel(r.date)}</h4><p>${escapeHtml(r.source||'InBody')} · ${fmt(r.weight,'kg',1)} · ${fmt(r.smm,'kg SMM',1)}</p></div><div class="row-actions"><button class="button small ghost" data-action="edit-inbody" data-date="${r.date}" title="Upravit">${icon('edit')}</button><button class="button small ghost" data-action="delete-inbody" data-date="${r.date}" title="Smazat">${icon('trash')}</button></div></div></div>`).join('')||'<p class="muted">Žádná měření.</p>'}</div></section>${ui.showInbodyForm?inbodyForm():''}`;
}
function goalForm(){const goal=data.goals.find(g=>g.id===ui.goalEdit),base={metrics:{},lean:{},fat:{}};const r=goal||base;
 return `<section class="card section" id="goal-form"><div class="card-heading"><div><h2>${goal?'Upravit cíl':'Vytvořit nový cíl'}</h2><p>Libovolný milník. Nezadané parametry nebudeme odhadovat.</p></div></div><form id="form-goal" class="form"><input name="original" type="hidden" value="${escapeHtml(goal?.id||'')}">
 <div class="field span2"><label>Název cíle</label><input name="name" type="text" required maxlength="100" value="${escapeHtml(goal?.name||'')}"></div>
 <div class="field"><label>Termín (nepovinné)</label><input name="due" type="date" value="${goal?.due||''}"></div>
 <div class="field"><label>Druh cíle</label><select name="historic"><option value="false" ${goal?.historic?'':'selected'}>Aktivní</option><option value="true" ${goal?.historic?'selected':''}>Historický milník</option></select></div>
 <div class="form-title">Hlavní parametry</div>${[['weight','Hmotnost','kg'],['smm','Kosterní svaly (SMM)','kg'],['pbf','Tělesný tuk (PBF)','%'],['ffm','FFM','kg']].map(([k,label,unit])=>`<div class="field"><label>${label}</label><input type="number" step=".01" min="0" name="metric__${k}" value="${r.metrics?.[k]??''}" placeholder="Nezadáno"></div>`).join('')}
 <div class="field full"><label>Poznámka</label><textarea name="note" maxlength="500">${escapeHtml(goal?.note||'')}</textarea></div>
 <div class="field full"><details class="details"><summary>Pokročilé cíle – všechny ostatní metriky a segmenty</summary><div class="form">${METRIC_GROUPS.flatMap(g=>g.metrics.filter(([k])=>!['weight','smm','pbf','ffm'].includes(k))).map(([k,label,unit])=>`<div class="field"><label>${label}${unit?` (${unit})`:''}</label><input type="number" name="metric__${k}" step=".001" min="0" value="${r.metrics?.[k]??''}"></div>`).join('')}${['lean','fat'].map(type=>`<div class="form-title">${type==='lean'?'Svalové segmenty':'Tukové segmenty'} (kg)</div>${SEGMENTS.map(([k,label])=>`<div class="field"><label>${label}</label><input name="${type}__${k}" type="number" step=".01" min="0" value="${r[type]?.[k]??''}"></div>`).join('')}`).join('')}</div></details></div>
 <div class="form-actions"><button type="button" class="button ghost" data-action="cancel-goal">Zrušit</button><button type="submit" class="button primary">${icon('save')} Uložit cíl</button></div></form></section>`;
}
function goalCard(goal){const latest=lastInBody();const historic=goal.historic,hasWeight=goal.metrics.weight!=null;
 return `<article class="goal-card"><div class="row-between"><h3>${escapeHtml(goal.name)}</h3><span class="chip ${historic?'warn':'muted'}">${historic?'Historický':'Aktivní'}</span></div><p>${goal.due?`Termín ${dateLabel(goal.due)}`:'Bez pevného termínu'} ${goal.note?`· ${escapeHtml(goal.note)}`:''}</p><div class="goal-numbers">${[['weight','Hmotnost','kg'],['smm','SMM','kg'],['pbf','Tuk','%']].filter(([k])=>goal.metrics[k]!=null).map(([k,label,unit])=>`<div><span>${label}</span><b>${fmt(goal.metrics[k],unit,1)}</b></div>`).join('')}</div>${hasWeight?`<div class="tiny muted">Do hmotnostního cíle chybí ${latest?.weight==null?'—':fmt(goal.metrics.weight-latest.weight,'kg',1)}</div>`:''}<div style="display:flex;gap:8px;margin-top:14px;flex-wrap:wrap"><button class="button small" data-action="edit-goal" data-id="${escapeHtml(goal.id)}">${icon('edit')} Upravit</button><button class="button small ghost" data-action="delete-goal" data-id="${escapeHtml(goal.id)}">${icon('trash')} Smazat</button></div></article>`;
}
function goalsPage(){const sept=goalById('goal-september'),north=goalById('goal-northstar'),base=firstInBody(),last=lastInBody();
 return pageHeader('Plán a milníky','Cíl nestačí. Potřebuješ trajektorii.','Historické milníky i dlouhodobé cíle můžeš kdykoliv založit a upravit.',`<button class="button primary" data-action="new-goal">${icon('plus')} Nový milník</button>`)+
 `<div class="grid cols3"><section class="card span2"><div class="card-heading"><div><h2>Jak daleko jsme se dostali?</h2><p>Skutečný přírůstek od prvního InBody, nikoliv procento „dokonalosti“</p></div>${icon('target')}</div>${sept&&base&&last?`${progressItem('Zářijový cíl · váha',base.weight,sept.metrics.weight,last.weight)}${progressItem('Zářijový cíl · kosterní svaly',base.smm,sept.metrics.smm,last.smm)}${progressItem('North Star · váha',base.weight,north?.metrics.weight,last.weight)}${progressItem('North Star · kosterní svaly',base.smm,north?.metrics.smm,last.smm)}`:'<div class="empty">Zatím není dost údajů.</div>'}</section>
 <section class="card accent"><div class="card-heading"><div><h2>Kontrolní tempo</h2><p>Pro zdravé nabírání, ne závod na váze</p></div>${icon('activity')}</div><div class="big-number">${fmt(data.settings.goalGain,'kg',2)}</div><div class="muted tiny">Orientační týdenní přírůstek</div><div style="height:18px"></div><div class="info success">Výsledky vyhodnocuj alespoň po 2–3 týdnech. Přírůstek váhy není totéž jako přírůstek svalů.</div><div style="height:14px"></div><p class="note">Přesné datum dosažení 40 kg SMM nelze určit z dosavadních dvou InBody měření.</p></section></div>`+
 `<section class="card section"><div class="card-heading"><div><h2>Seznam cílů</h2><p>Všechny cíle jsou upravitelné; historické milníky nejsou automaticky „nesplněná povinnost“</p></div></div><div class="goal-cards">${data.goals.map(goalCard).join('')||'<div class="empty">Zatím bez cílů.</div>'}</div></section>${ui.showGoalForm?goalForm():''}`+
 `<section class="card section"><div class="card-heading"><div><h2>Co znamená dobrý pokrok?</h2><p>Metodika průběžného hodnocení</p></div></div><div class="grid cols3"><div class="info"><b>Váha</b><p>7denní průměr a 28denní trend. Sleduj průběžně, ale nedělej závěry z jednoho dne.</p></div><div class="info"><b>InBody</b><p>Za podobné hydratace, před tréninkem, ideálně ráno. Segmenty kolísají podle vody.</p></div><div class="info"><b>Výkonnost</b><p>K váze a InBody přidej silové výkony a subjektivní regeneraci. Do další verze plánujeme log tréninků.</p></div></div></section>`;
}
function nutritionForm(){const r=data.nutrition.find(x=>x.date===ui.nutritionEdit);
 return `<section class="card section" id="nutrition-form"><div class="card-heading"><div><h2>${r?'Upravit denní souhrn':'Zapsat denní souhrn'}</h2><p>Celodenní součet, ne jednotlivé potraviny. Odhady můžeš označit.</p></div></div><form id="form-nutrition" class="form"><input name="original" type="hidden" value="${r?.date||''}">
 <div class="field"><label>Datum</label><input type="date" name="date" required value="${r?.date||new Date().toLocaleDateString('sv-SE')}"></div>
 ${[['kcal','Kalorie','kcal'],['protein','Bílkoviny','g'],['carbs','Sacharidy','g'],['fat','Tuky','g']].map(([k,label,unit])=>`<div class="field"><label>${label} (${unit})</label><input type="number" name="${k}" step=".1" min="0" max="20000" value="${r?.[k]??''}" placeholder="Nezadáno"></div>`).join('')}
 <div class="field"><label>Typ záznamu</label><select name="estimated"><option value="false">Zadaná hodnota</option><option value="true" ${r?.estimated?'selected':''}>Orientační odhad</option></select></div>
 <div class="field span2"><label>Poznámka</label><input type="text" name="note" maxlength="500" value="${escapeHtml(r?.note||'')}"></div>
 <div class="form-actions"><button type="button" class="button ghost" data-action="cancel-nutrition">Zrušit</button><button type="submit" class="button primary">${icon('save')} Uložit den</button></div></form></section>`;
}
function nutritionBars(){const days=sortDesc(data.nutrition).slice(0,10).reverse();if(!days.length)return '<div class="empty">Přidej první den jídelníčku.</div>';
 let max=Math.max(data.settings.kcal||1,...days.map(x=>x.kcal||0))*1.08;
 return `<div style="height:140px;position:relative"><div style="border-top:1px dashed #9abb85;position:absolute;top:${100-(data.settings.kcal||0)/max*100}%;left:0;right:0;opacity:.7"></div><div class="bars">${days.map(n=>`<div class="bar-col" title="${dateLabel(n.date)} · ${fmt(n.kcal,'kcal',0)}"><span>${fmt(n.kcal,'',0)}</span><div class="bar ${n.kcal>=data.settings.kcal?'over':''}" style="height:${(n.kcal||0)/max*100}%"></div><span>${shortDate(n.date)}</span></div>`).join('')}</div></div><p class="chart-note">Čárkovaná linka je kalorický cíl ${fmt(data.settings.kcal,'kcal',0)}. Odhady z restaurací mají vyšší nejistotu.</p>`;
}
function nutritionPage(){const latest=getLatest(data.nutrition),avg=mean(sortDesc(data.nutrition).slice(0,7).filter(n=>n.kcal!=null).map(n=>n.kcal)),pr=mean(sortDesc(data.nutrition).slice(0,7).filter(n=>n.protein!=null).map(n=>n.protein));
 return pageHeader('Strava a energie','Jídlo, které podporuje výkon.','Denní kalorie a makra navazující na tvoje zápisy. Odhady z chatu zůstávají výslovně označené.',`<button class="button primary" data-action="new-nutrition">${icon('plus')} Přidat den</button>`)+
 `<div class="grid cols4">${stat('Denní kalorický cíl',fmt(data.settings.kcal,'',0),'kcal','Upravitelný cíl','food','accent')}${stat('Denní proteinový cíl',fmt(data.settings.protein,'',0),'g','Upravitelný příjem bílkovin','activity')}${stat('Průměr posledních 7 zápisů',fmt(avg,'',0),'kcal','Nejde nutně o posledních 7 kalendářních dní','chart')}${stat('Průměr bílkovin',fmt(pr,'',0),'g','Posledních 7 záznamů','target')}</div>`+
 `<div class="grid cols2 section"><section class="card"><div class="card-heading"><div><h2>Energetický příjem</h2><p>Poslední zaznamenané dny</p></div></div>${nutritionBars()}</section><section class="card"><div class="card-heading"><div><h2>Upravit denní makro cíle</h2><p>Cíle slouží jako vodítko, ne tvrdý limit</p></div></div><form id="form-settings" class="form">${[['kcal','Kalorie','kcal'],['protein','Bílkoviny','g'],['carbs','Sacharidy','g'],['fat','Tuky','g']].map(([k,label,unit])=>`<div class="field span2"><label>${label} (${unit})</label><input name="${k}" type="number" min="0" max="20000" step="1" value="${data.settings[k]??''}" required></div>`).join('')}<div class="field span2"><label>Cílové přibírání (kg/týden)</label><input name="goalGain" type="number" step=".05" min=".05" max="1" value="${data.settings.goalGain||.2}" required></div><div class="form-actions"><button type="submit" class="button primary">${icon('save')} Uložit cíle</button></div></form><p class="chart-note">Energetické součty makroživin se mohou od kalorií lišit kvůli zaokrouhlení, vláknině nebo odhadům.</p></section></div>`+
 `${ui.showNutritionForm?nutritionForm():''}<section class="card section"><div class="card-heading"><div><h2>Historie jídelníčku</h2><p>Importované odhady i nové zápisy</p></div></div><div class="table-scroll"><table><thead><tr><th>Den</th><th class="right">Kalorie</th><th class="right">Bílkoviny</th><th class="right">Sacharidy</th><th class="right">Tuky</th><th>Zdroj</th><th class="right">Akce</th></tr></thead><tbody>${sortDesc(data.nutrition).map(n=>`<tr><td class="nowrap">${dateLabel(n.date)}</td><td class="right">${fmt(n.kcal,'',0)}</td><td class="right">${fmt(n.protein,'g',0)}</td><td class="right">${fmt(n.carbs,'g',0)}</td><td class="right">${fmt(n.fat,'g',0)}</td><td><span class="chip ${n.estimated?'warn':'muted'}">${n.estimated?'Odhad':'Zapsáno'}</span><div class="tiny muted">${escapeHtml(n.note||'')}</div></td><td><div class="row-actions"><button class="button small ghost" data-action="edit-nutrition" data-date="${n.date}" title="Upravit">${icon('edit')}</button><button class="button small ghost" data-action="delete-nutrition" data-date="${n.date}" title="Smazat">${icon('trash')}</button></div></td></tr>`).join('')}</tbody></table></div></section>`;
}
function dataPage(){return pageHeader('Bezpečí a přenositelnost','Tvoje data patří tobě.','Žádný účet, žádný server. Všechno je uložené místně. Export je důležitý pro přenos na jiné zařízení.')+
 `<div class="grid cols4">${stat('Záznamy váhy',String(data.weights.length),'','Jedno datum = jedna váha','weight')}${stat('InBody měření',String(data.inbodies.length),'','Kompletní uložené metriky','body')}${stat('Cíle',String(data.goals.length),'','Včetně historických','target')}${stat('Denní souhrny stravy',String(data.nutrition.length),'','Včetně označených odhadů','food')}</div>`+
 `<div class="grid cols2 section"><section class="card accent"><div class="card-heading"><div><h2>Exportovat úplnou zálohu</h2><p>Doporučené · JSON obsahuje váhy, InBody, cíle, stravu a nastavení</p></div>${icon('shield')}</div><p class="note">Jediná záloha zachová všechny editovatelné záznamy. Ulož ji mimo prohlížeč, ideálně do soukromého úložiště.</p><div style="height:14px"></div><button class="button primary" data-action="export-json">${icon('download')} Stáhnout úplnou zálohu JSON</button></section>
 <section class="card"><div class="card-heading"><div><h2>Importovat zálohu</h2><p>Obnoví data z exportovaného souboru FORMA</p></div>${icon('upload')}</div><div class="dropzone"><input type="file" id="import-json" accept=".json,application/json" aria-label="Vybrat soubor zálohy JSON"><p>Před nahrazením všech dat se zobrazí potvrzení. Doporučujeme nejprve export současného stavu.</p></div></section></div>`+
 `<div class="grid cols2 section"><section class="card"><div class="card-heading"><div><h2>CSV denních vah</h2><p>Pro Excel nebo další aplikace</p></div></div><button class="button" data-action="export-weight-csv">${icon('download')} Exportovat váhy CSV</button><div style="height:18px"></div><label class="tiny muted" for="import-weight-csv">Import CSV (datum;váha nebo date;kg)</label><input type="file" id="import-weight-csv" accept=".csv,text/csv,text/plain" style="display:block;margin-top:9px;max-width:100%"><p class="chart-note">Podporuje datum YYYY-MM-DD nebo DD.MM.YYYY a desetinnou čárku. Duplicitní data se přepíší po potvrzení.</p></section>
 <section class="card"><div class="card-heading"><div><h2>Správa úložiště</h2><p>Opatrně: změny jsou lokální</p></div></div><div class="key-value"><strong>Záznamy v prohlížeči</strong><span>${data.weights.length+data.inbodies.length+data.nutrition.length+data.goals.length} položek</span></div><div class="key-value"><strong>Poslední změna</strong><span>${escapeHtml(data.modifiedAt?new Date(data.modifiedAt).toLocaleString('cs-CZ'):'—')}</span></div><div class="key-value"><strong>Verze struktury</strong><span>${data.version||APP_VERSION}</span></div><div style="display:flex;gap:9px;flex-wrap:wrap;margin-top:20px"><button class="button danger" data-action="reset-data">${icon('refresh')} Obnovit počáteční data</button></div></section></div>`+
 `<div class="info warning section"><b>Soukromí a synchronizace</b><p>V této první verzi se data ukládají jen přes localStorage daného prohlížeče. Smazání dat prohlížeče, anonymní režim nebo přechod na jiný telefon může znamenat ztrátu zápisů. Automatická synchronizace mezi zařízeními ani přímé propojení s WHOOP zatím nejsou implementované. Kompletní JSON záloha je proto zásadní.</p></div>`;
}
function render(){const pages={dashboard,weight:weightsPage,inbody:inbodyPage,goals:goalsPage,nutrition:nutritionPage,data:dataPage};
 document.getElementById('app').innerHTML=layout((pages[ui.view]||dashboard)());
 document.title=`FORMA · ${navs.find(n=>n[0]===ui.view)?.[1]||'Přehled'}`;
}
function jumpTo(id){requestAnimationFrame(()=>document.getElementById(id)?.scrollIntoView({behavior:'smooth',block:'start'}));}
const val=(f,k)=>String(f.get(k)||'').trim();
const fnum=(f,k)=>num(val(f,k).replace(',','.'));
function handleSubmit(ev){const form=ev.target;if(!form.id||!form.id.startsWith('form-'))return;
 ev.preventDefault();
 if(recoveryRaw!==null){toast('Nejdříve zachraň nebo obnov původní historii.','error');return;}
 const f=new FormData(form);try{
 if(form.id==='form-weight'){
   const date=val(f,'date'),kg=fnum(f,'kg'),original=val(f,'original');
   if(!isDate(date)||kg==null||kg<30||kg>300)throw new Error('Zadej platné datum a váhu 30–300 kg.');
   if(original!==date && data.weights.some(w=>w.date===date)&&!confirm('Na zvolené datum už vážení existuje. Chceš ho přepsat?'))return;
   data.weights=data.weights.filter(w=>w.date!==date&&w.date!==original);
   data.weights.push({date,kg,note:val(f,'note').slice(0,500),creatine:val(f,'creatine')||'unknown'});
   data.weights=sortAsc(data.weights);ui.weightEdit=null;saveAndRender('Váha byla uložena.');return;
 }
 if(form.id==='form-inbody'){
   const date=val(f,'date'),original=val(f,'original');if(!isDate(date))throw new Error('Zadej platné datum měření.');
   if(original!==date&&data.inbodies.some(r=>r.date===date)&&!confirm('Na toto datum už InBody existuje. Přepsat?'))return;
   const entry={date,source:val(f,'source').slice(0,150),height:fnum(f,'height')};
   for(const g of METRIC_GROUPS)for(const [k] of g.metrics)entry[k]=fnum(f,k);
   for(const type of ['lean','fat']){entry[type]={};for(const [k] of SEGMENTS)entry[type][k]=fnum(f,`${type}__${k}`);}
   const sourceWas= data.inbodies.find(r=>r.date===original);if(!entry.source)entry.source=sourceWas?.source||'InBody – vlastní záznam';
   data.inbodies=data.inbodies.filter(r=>r.date!==original&&r.date!==date);
   data.inbodies.push(entry);data.inbodies=sortAsc(data.inbodies);
   if(ui.newInbody===original||!ui.newInbody)ui.newInbody=date;
   if(ui.baseInbody===original)ui.baseInbody=date;
   ui.inbodyEdit=null;ui.showInbodyForm=false;saveAndRender('Měření InBody bylo uloženo.');return;
 }
 if(form.id==='form-goal'){
   const original=val(f,'original'),name=val(f,'name'),due=val(f,'due');if(!name)throw new Error('Napiš název cíle.');
   if(due&&!isDate(due))throw new Error('Neplatný termín cíle.');
   const goal={id:original||`goal-${Date.now()}`,name:name.slice(0,100),due,historic:val(f,'historic')==='true',note:val(f,'note').slice(0,500),metrics:{},lean:{},fat:{}};
   for(const g of METRIC_GROUPS)for(const [k] of g.metrics)goal.metrics[k]=fnum(f,`metric__${k}`);
   for(const type of ['lean','fat'])for(const [k] of SEGMENTS)goal[type][k]=fnum(f,`${type}__${k}`);
   data.goals=data.goals.filter(g=>g.id!==original);data.goals.push(goal);
   ui.goalEdit=null;ui.showGoalForm=false;saveAndRender('Cíl byl uložen.');return;
 }
 if(form.id==='form-nutrition'){
   const date=val(f,'date'),original=val(f,'original');if(!isDate(date))throw new Error('Neplatné datum stravy.');
   if(date!==original&&data.nutrition.some(n=>n.date===date)&&!confirm('Pro tento den existuje záznam. Přepsat?'))return;
   const n={date,estimated:val(f,'estimated')==='true',note:val(f,'note').slice(0,500)};
   for(const k of ['kcal','protein','carbs','fat']){n[k]=fnum(f,k);if(n[k]!=null&&(n[k]<0||n[k]>20000))throw new Error('Zkontroluj hodnoty živin.');}
   data.nutrition=data.nutrition.filter(v=>v.date!==date&&v.date!==original);data.nutrition.push(n);data.nutrition=sortAsc(data.nutrition);
   ui.nutritionEdit=null;ui.showNutritionForm=false;saveAndRender('Denní jídelníček uložen.');return;
 }
 if(form.id==='form-settings'){
   for(const k of ['kcal','protein','carbs','fat','goalGain']){const v=fnum(f,k);if(v==null||v<0||v>20000)throw new Error('Neplatné nastavení: '+k);data.settings[k]=v;}
   saveAndRender('Kalorické a makro cíle aktualizovány.');return;
 }
 }catch(e){toast(e.message||'Nepodařilo se uložit.','error');}}
function handleClick(ev){const nav=ev.target.closest('[data-nav]');if(nav){ui.view=nav.dataset.nav;render();window.scrollTo({top:0,behavior:'instant'});return;}
 const period=ev.target.closest('[data-period]');if(period){ui.period=Number(period.dataset.period);render();return;}
 const button=ev.target.closest('[data-action]');if(!button)return;
 const {action,date,id}=button.dataset;
 if(recoveryRaw!==null&&!['download-recovery','reset-recovery'].includes(action)){
  toast('Zápis je blokován, dokud neobnovíš nebo nesmažeš původní data.','error');return;
 }
 switch(action){
  case 'download-recovery':
   if(recoveryRaw!==null){download(recoveryRaw,'forma-zachrana-puvodniho-obsahu.json','application/json;charset=utf-8');toast('Zahájeno stažení původního obsahu.');}return;
  case 'reset-recovery':
   if(recoveryRaw!==null&&confirm('Opravdu nevratně nahradit původní nečitelná data prázdným stavem?')&&confirm('Máš uloženou zálohu, nebo původní historii již nepotřebuješ?'))applyReplacement(makeInitialData(),'Nečitelná historie byla vědomě nahrazena prázdným stavem.');
   return;
   case 'new-weight':ui.view='weight';ui.weightEdit=null;render();jumpTo('weight-form');return;
   case 'cancel-weight':ui.weightEdit=null;render();return;
   case 'edit-weight':ui.weightEdit=date;render();jumpTo('weight-form');return;
   case 'delete-weight':if(confirm(`Opravdu smazat vážení ${dateLabel(date)}?`)){data.weights=data.weights.filter(w=>w.date!==date);if(ui.weightEdit===date)ui.weightEdit=null;saveAndRender('Vážení smazáno.');}return;
   case 'show-weights':ui.weightShowAll=true;render();return;
   case 'new-inbody':ui.showInbodyForm=true;ui.inbodyEdit=null;render();jumpTo('inbody-form');return;
   case 'cancel-inbody':ui.showInbodyForm=false;ui.inbodyEdit=null;render();return;
   case 'edit-inbody':ui.showInbodyForm=true;ui.inbodyEdit=date;render();jumpTo('inbody-form');return;
   case 'delete-inbody':if(confirm(`Smazat celé InBody měření ${dateLabel(date)}?`)){data.inbodies=data.inbodies.filter(r=>r.date!==date);if(ui.baseInbody===date)ui.baseInbody=firstInBody()?.date||'';if(ui.newInbody===date)ui.newInbody=lastInBody()?.date||'';saveAndRender('InBody smazáno.');}return;
   case 'new-goal':ui.showGoalForm=true;ui.goalEdit=null;render();jumpTo('goal-form');return;
   case 'cancel-goal':ui.showGoalForm=false;ui.goalEdit=null;render();return;
   case 'edit-goal':ui.showGoalForm=true;ui.goalEdit=id;render();jumpTo('goal-form');return;
   case 'delete-goal':if(confirm('Opravdu smazat tento cíl?')){data.goals=data.goals.filter(g=>g.id!==id);saveAndRender('Cíl smazán.');}return;
   case 'new-nutrition':ui.view='nutrition';ui.showNutritionForm=true;ui.nutritionEdit=null;render();jumpTo('nutrition-form');return;
   case 'cancel-nutrition':ui.showNutritionForm=false;ui.nutritionEdit=null;render();return;
   case 'edit-nutrition':ui.showNutritionForm=true;ui.nutritionEdit=date;render();jumpTo('nutrition-form');return;
   case 'delete-nutrition':if(confirm(`Smazat záznam stravy ${dateLabel(date)}?`)){data.nutrition=data.nutrition.filter(n=>n.date!==date);saveAndRender('Záznam stravy smazán.');}return;
   case 'export-json':download(JSON.stringify(data,null,2),`forma-zaloha-${new Date().toLocaleDateString('sv-SE')}.json`,'application/json;charset=utf-8');toast('Záloha JSON stažena.');return;
   case 'export-weight-csv':download(serializeCSV(sortAsc(data.weights),['date','kg','note','creatine']),'forma-ranni-vahy.csv','text/csv;charset=utf-8');toast('CSV export připraven.');return;
   case 'reset-data':if(confirm('Opravdu smazat všechny místní záznamy? Doporučujeme předem export JSON.')&&confirm('Poslední potvrzení: nahradit databázi prázdným stavem?'))applyReplacement(makeInitialData(),'Místní záznamy smazány.');return;
 }
}
function handleSelect(ev){const item=ev.target;if(item.dataset.select==='base-inbody'){ui.baseInbody=item.value;render();}
 if(item.dataset.select==='new-inbody'){ui.newInbody=item.value;render();}}
async function handleFile(ev){const input=ev.target;if(!input.files?.length)return;const file=input.files[0];try{
 if(file.size>12*1024*1024)throw new Error('Soubor je příliš velký (max. 12 MB).');
 const text=await file.text();if(input.id==='import-json'){
   const parsed=JSON.parse(text);const restored=safeData(parsed);
   if(!confirm(`Obnovit zálohu? Nahradí současná data: ${restored.weights.length} vah, ${restored.inbodies.length} InBody, ${restored.nutrition.length} dnů stravy.`))return;
   applyReplacement(restored,'Záloha byla úspěšně obnovena.');return;
 }
 if(input.id==='import-weight-csv'){
   if(recoveryRaw!==null)throw new Error('Před importem CSV nejprve obnov plnou JSON zálohu nebo vědomě resetuj původní data.');
   const result=parseWeightCSV(text);if(!result.rows.length)throw new Error(result.errors[0]||'CSV neobsahuje platné váhy.');
   if(!confirm(`Importovat ${result.rows.length} záznamů váhy? Duplicitní datum se přepíše. ${result.errors.length} řádků bude vynecháno.`))return;
   const old=new Map(data.weights.map(w=>[w.date,w]));for(const w of result.rows)old.set(w.date,w);
   data.weights=sortAsc([...old.values()]);saveAndRender(`Načteno ${result.rows.length} vah. Chybné řádky: ${result.errors.length}.`);return;
 }
 }catch(e){toast(`Import se nepodařil: ${e.message}`,'error');}finally{input.value='';}}
function init(){data=loadData();if(!data.goals.length)data.goals=makeInitialData().goals;
 ui.baseInbody=firstInBody()?.date||'';ui.newInbody=lastInBody()?.date||'';
 document.addEventListener('submit',handleSubmit);document.addEventListener('click',handleClick);
 document.addEventListener('change',e=>{handleSelect(e);if(['import-json','import-weight-csv'].includes(e.target.id))handleFile(e);});render();}
init();
