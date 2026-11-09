/* ===================== GAMES HUB ===================== */
/* Modes: Story quiz ("מה הסיפור?"), Timeline-place ("קו הזמן"),
   Ordering ("סדר אותם"), Journey ("מסע בזמן"). Runs inside the app IIFE,
   so $,T,D,el,tx,L,lang,rtl,store,openOverlay,select,scrollToYear,
   MINY,MAXY,fmtYfull,fmtRange,anchorYear,span,ITEMS,eras,interp are in scope. */

Object.assign(T.he,{
 gHub:'משחקים', gHubTag:'למדו את סיפור העם — דרך המשחק',
 gDaily:'האתגר היומי', gDailySub:'5 שאלות · חדש בכל יום',
 gBest:'שיא', gStreak:'רצף', gDays:'ימים', gPts:'נק׳',
 gPlay:'שחק', gAgain:'שחק שוב', gHome:'תפריט', gNext:'הבא', gFinish:'סיום', gCheck:'בדקו',
 gDone:'הושלם היום · חזרו מחר', gResult:'תוצאה', gShare:'שתפו', gCopied:'הועתק!',
 gCorrect:'נכון!', gWrong:'לא מדויק', gAtlas:'ראו באטלס', gQ:'שאלה',
 // story
 gTitle:'מה הסיפור?', gTag:'ידידים, צוררים ואירועים — מה הייתה המשמעות?',
 gFree:'משחק חופשי', gFreeSub:'6 שאלות אקראיות',
 qAlly:n=>`${n} — ידיד של העם היהודי. במה היטיב/ה עימו?`,
 qEnemy:n=>`${n} — צורר של העם היהודי. כיצד פגע/ה בו?`,
 qEvent:n=>`${n} — מה הייתה משמעותו עבור העם היהודי?`,
 st:{ally:'ידיד',enemy:'צורר',mixed:'מורכב',event:'אירוע',person:'דמות'},
 // timeline
 tlTitle:'קו הזמן', tlTag:'מתי זה קרה? גררו את הסמן לשנה הנכונה',
 tlPrompt:'מתי זה קרה?', tlPromptLife:'מתי חי/ה?', tlYou:'הנחתם', tlReal:'התשובה', tlGap:'פער',
 tlYears:n=>`${n.toLocaleString('he')} שנה`, tlBull:'בול בפוני!', tlConfirm:'אשרו',
 tlDrag:'גררו את הסמן ואז אשרו',
 // order
 ordTitle:'סדר אותם', ordTag:'הקישו מהמוקדם למאוחר',
 ordPrompt:'מי קדם למי? הקישו לפי הסדר — מהמוקדם ביותר', ordSolved:'לפי הסדר',
 // journey
 jTitle:'מסע בזמן', jTag:'מסע דרך הדורות — תחנה אחר תחנה',
 jLocked:'נעול', jStart:'התחילו', jReplay:'שחקו שוב', jContinue:'המשיכו מסע',
 jIntro:'התחנה', jBegin:'יוצאים לדרך', jStation:'תחנה',
 jComplete:'תחנה הושלמה!', jNextStation:'לתחנה הבאה', jDoneAll:'סיימתם את המסע! 🎉',
 gThisEra:'בתקופה זו',
 mRange:(a,b)=>fmtRange(a,b)
});
Object.assign(T.en,{
 gHub:'Games', gHubTag:'Learn the story of a people — by playing',
 gDaily:'Daily Challenge', gDailySub:'5 questions · new every day',
 gBest:'Best', gStreak:'Streak', gDays:'days', gPts:'pts',
 gPlay:'Play', gAgain:'Play again', gHome:'Menu', gNext:'Next', gFinish:'Finish', gCheck:'Check',
 gDone:'Done today · come back tomorrow', gResult:'Result', gShare:'Share', gCopied:'Copied!',
 gCorrect:'Correct!', gWrong:'Not quite', gAtlas:'See in atlas', gQ:'Question',
 gTitle:'What’s the Story?', gTag:'Allies, foes and events — what did it mean?',
 gFree:'Free Play', gFreeSub:'6 random questions',
 qAlly:n=>`${n} — an ally of the Jewish people. How did they help?`,
 qEnemy:n=>`${n} — a persecutor of the Jewish people. How did they harm them?`,
 qEvent:n=>`${n} — what did it mean for the Jewish people?`,
 st:{ally:'Ally',enemy:'Foe',mixed:'Mixed',event:'Event',person:'Figure'},
 tlTitle:'Timeline', tlTag:'When did it happen? Drag the marker to the right year',
 tlPrompt:'When did it happen?', tlPromptLife:'When did they live?', tlYou:'You', tlReal:'Actual', tlGap:'Off by',
 tlYears:n=>`${n.toLocaleString('en')} yr`, tlBull:'Bullseye!', tlConfirm:'Confirm',
 tlDrag:'Drag the marker, then confirm',
 ordTitle:'Put in Order', ordTag:'Tap from earliest to latest',
 ordPrompt:'Which came first? Tap them in order — earliest first', ordSolved:'In order',
 jTitle:'Time Journey', jTag:'A journey through the ages — stop by stop',
 jLocked:'Locked', jStart:'Start', jReplay:'Replay', jContinue:'Continue journey',
 jIntro:'Station', jBegin:'Begin', jStation:'Station',
 jComplete:'Station complete!', jNextStation:'Next station', jDoneAll:'Journey complete! 🎉',
 gThisEra:'In this era',
 mRange:(a,b)=>fmtRange(a,b)
});

/* ---------- shared helpers ---------- */
const QUIZ=(D.quiz||[]);
const QBY={ally:QUIZ.filter(q=>q.cat==='ally'),enemy:QUIZ.filter(q=>q.cat==='enemy'),event:QUIZ.filter(q=>q.cat==='event')};
function mulberry32(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
function gShuffle(arr,rnd){rnd=rnd||Math.random;for(let i=arr.length-1;i>0;i--){const j=Math.floor(rnd()*(i+1));const t=arr[i];arr[i]=arr[j];arr[j]=t}return arr}
function gTodayKey(){const d=new Date();return d.getFullYear()*10000+(d.getMonth()+1)*100+d.getDate()}
function gYesterdayKey(){const d=new Date();d.setDate(d.getDate()-1);return d.getFullYear()*10000+(d.getMonth()+1)*100+d.getDate()}
const gStat=(k,d)=>store.get(k,d);

// Datable pool (events + figures), each with a single representative year
const DATABLE=[...ITEMS.values()].filter(it=>it.kind!=='comm').map(it=>{
 const y=it.kind==='event'?it.year:anchorYear(it);
 return {ref:it, id:it.key, rawid:it.id, y, name:(it.name||it.title),
  kind:it.kind, chip:(it.kind==='event'?'event':it.kind==='person'?'person':it.stance),
  sub:(it.kind==='event'?tx(it.place):tx(it.role)),
  imp:(it.kind==='event'?3:(it.importance||2))};
}).filter(d=>d.y!=null);
const GPOOL=DATABLE.filter(d=>d.imp>=2);           // recognizable enough for a guessing game
const rawYear={};DATABLE.forEach(d=>{rawYear[d.rawid]=d});

function eraOf(y){for(let i=eras.length-1;i>=0;i--)if(y>=eras[i].start)return eras[i];return eras[0]}
function pickSpread(pool,n,rnd,gap){
 const a=gShuffle(pool.slice(),rnd),out=[];
 for(const it of a){if(out.every(o=>Math.abs(o.y-it.y)>=gap)){out.push(it);if(out.length>=n)break}}
 for(const it of a){if(out.length>=n)break;if(!out.includes(it))out.push(it)}
 return out.sort((x,y)=>x.y-y.y);
}
function goAtlas(ref){try{closeOverlay('game')}catch(_){}try{scrollToYear(anchorYear(ref),true);select(ref,true)}catch(_){}}

/* ---------- overlay plumbing ---------- */
let GS=null,JRN=null;const gbox=()=>$('gamebox');
function openGame(){$('game').dir=rtl()?'rtl':'ltr';gameHome();openOverlay('game')}
function gClose(b){const x=el('button','ibtn','✕');x.setAttribute('data-close','');x.setAttribute('aria-label',L().close);return x}
function gTopBar(label,right){const t=el('div','g-top');t.append(el('div','g-prog',label));if(right)t.append(right);else t.append(el('span','grow'));t.append(gClose());return t}

/* ======================================================= HOME */
function gameHome(){
 const b=gbox();b.innerHTML='';b.className='sheet gamebox';
 const head=el('div','g-head');
 const h=el('div','g-headtxt');h.append(el('h2',null,L().gHub),el('p',null,L().gHubTag));
 head.append(h,gClose());b.appendChild(head);
 // stats
 const stats=el('div','g-stats');
 const s1=el('div','g-stat');s1.append(el('b',null,String(gStat('gDailyStreak',0))),el('span',null,L().gStreak+' · '+L().gDays));
 const prog=jProgress();
 const s2=el('div','g-stat');s2.append(el('b',null,prog.stars+'★'),el('span',null,L().jTitle));
 stats.append(s1,s2);b.appendChild(stats);
 // daily
 const dailyDone=gStat('gDailyDoneKey',0)===gTodayKey();
 const d=el('button','g-mode daily'+(dailyDone?' done':''));
 d.append(el('b',null,'⭐ '+L().gDaily),el('span',null,dailyDone?L().gDone:L().gDailySub));
 d.onclick=()=>startStory('daily');
 b.appendChild(d);
 // modes grid
 const grid=el('div','g-modegrid');
 grid.append(
  modeCard('🧭',L().jTitle,L().jTag,openJourney,'j'),
  modeCard('📅',L().tlTitle,L().tlTag,()=>startTimeline(),'t'),
  modeCard('🔀',L().ordTitle,L().ordTag,()=>startOrder(),'o'),
  modeCard('💬',L().gTitle,L().gTag,()=>startStory('free'),'s')
 );
 b.appendChild(grid);
}
function modeCard(icon,title,tag,fn,cls){
 const c=el('button','g-card c-'+cls);
 const i=el('div','g-cardi',icon);
 const t=el('div','g-cardt');t.append(el('b',null,title),el('span',null,tag));
 c.append(i,t);c.onclick=fn;return c;
}

/* ======================================================= GENERIC RESULT */
function showResult(cfg){
 const b=gbox();b.innerHTML='';b.className='sheet gamebox result';
 b.appendChild(gTopBar(cfg.label));
 b.appendChild(el('div','g-rhead',L().gResult));
 const ring=el('div','g-score');ring.append(el('b',null,cfg.big));if(cfg.unit)ring.append(el('small',null,cfg.unit));
 b.appendChild(ring);
 if(cfg.streak!=null)b.appendChild(el('div','g-streak','🔥 '+cfg.streak+' '+L().gDays+' '+L().gStreak));
 if(cfg.marks){const m=el('div','g-marks');cfg.marks.forEach(v=>m.appendChild(el('i','mk '+(v?'ok':'no'))));b.appendChild(m)}
 if(cfg.msg)b.appendChild(el('p','g-msg',cfg.msg));
 const acts=el('div','g-acts');
 (cfg.actions||[]).forEach(a=>{const btn=el('button','g-btn'+(a.pri?' pri':''),a.label);btn.onclick=a.onclick;acts.appendChild(btn)});
 b.appendChild(acts);
}
function scoreMsg(pct){return pct>=0.8?(rtl()?'מצוין! אתם מכירים את הסיפור.':'Excellent!'):pct>=0.5?(rtl()?'לא רע! עוד סיבוב?':'Not bad!'):(rtl()?'יש עוד מה ללמוד — נסו שוב.':'More to learn — try again.')}

/* ======================================================= STORY QUIZ */
function gMakeQ(item,rnd){
 const nm=tx(item.name),correct=tx(item.imp);
 const pool=QBY[item.cat].filter(x=>x.id!==item.id);
 const o=gShuffle(pool.slice(),rnd).slice(0,3).map(x=>tx(x.imp));
 const opts=gShuffle([correct].concat(o),rnd);
 const q=item.cat==='event'?L().qEvent(nm):item.cat==='ally'?L().qAlly(nm):L().qEnemy(nm);
 return {item,q,opts,correct,stance:item.cat,expl:nm+' — '+correct};
}
function gRound(n,rnd,pool){return gShuffle((pool||QUIZ).slice(),rnd).slice(0,n).map(it=>gMakeQ(it,rnd))}
function startStory(mode){
 if(mode==='daily'&&gStat('gDailyDoneKey',0)===gTodayKey()){const r=gStat('gDailyRes',null);if(r){GS={mode,qs:[],i:r.marks.length,score:r.score,marks:r.marks,n:r.n};return storyResult()}}
 const rnd=mode==='daily'?mulberry32(gTodayKey()):Math.random;
 const qs=gRound(mode==='daily'?5:6,rnd);
 GS={mode,qs,i:0,score:0,marks:[],n:qs.length,locked:false};
 storyPlay();
}
function storyPlay(){
 const b=gbox();b.innerHTML='';b.className='sheet gamebox g-play';GS.locked=false;
 const qo=GS.qs[GS.i];
 b.appendChild(gTopBar(L().gQ+' '+(GS.i+1)+' / '+GS.n,(()=>{const s=el('div','g-sc');s.textContent='✓ '+GS.score;return s})()));
 b.appendChild(progBar(GS.i/GS.n));
 const qc=el('div','g-q');
 const chip=el('span','g-chip '+qo.stance);chip.textContent=L().st[qo.stance];qc.appendChild(chip);
 qc.append(el('div','g-qtext',qo.q));b.appendChild(qc);
 const opts=el('div','g-opts');
 qo.opts.forEach(opt=>{const ob=el('button','g-opt');ob.dataset.opt=opt;ob.textContent=opt;ob.onclick=()=>storyAnswer(ob,opt,qo,opts);opts.appendChild(ob)});
 b.appendChild(opts);
 const fb=el('div','g-fb');fb.id='g-fb';b.appendChild(fb);
}
function storyAnswer(btn,opt,qo,opts){
 if(GS.locked)return;GS.locked=true;
 const ok=opt===qo.correct;GS.marks.push(ok);if(ok)GS.score++;
 [...opts.children].forEach(ch=>{ch.disabled=true;const t=ch.dataset.opt;if(t===qo.correct)ch.classList.add('right');else if(ch===btn)ch.classList.add('wrong')});
 const fb=$('g-fb');fb.className='g-fb show '+(ok?'ok':'no');
 fb.append(el('b',null,ok?L().gCorrect:L().gWrong),el('p',null,qo.expl));
 const nx=el('button','g-next',GS.i+1>=GS.n?L().gFinish:L().gNext);
 nx.onclick=()=>{GS.i++;if(GS.i>=GS.n)storyFinish();else storyPlay()};
 fb.appendChild(nx);nx.focus();
}
function storyFinish(){
 if(GS.mode==='free'){if(GS.score>gStat('gBest',0))store.set('gBest',GS.score)}
 else if(gStat('gDailyDoneKey',0)!==gTodayKey()){
  const prev=gStat('gDailyStreak',0),last=gStat('gDailyLast',0),tk=gTodayKey();
  store.set('gDailyStreak',last===gYesterdayKey()?prev+1:1);
  store.set('gDailyLast',tk);store.set('gDailyDoneKey',tk);store.set('gDailyRes',{score:GS.score,n:GS.n,marks:GS.marks});
 }
 storyResult();
}
function storyResult(){
 const daily=GS.mode==='daily';
 showResult({
  label:daily?L().gDaily:L().gFree,big:GS.score+'/'+GS.n,marks:GS.marks,
  streak:daily?gStat('gDailyStreak',0):null,msg:scoreMsg(GS.score/GS.n),
  actions:(daily?[{label:L().gShare,pri:true,onclick:function(){const em=GS.marks.map(m=>m?'🟩':'🟥').join('');const d=new Date();navigator.clipboard&&navigator.clipboard.writeText(L().gTitle+' · '+(d.getMonth()+1)+'/'+d.getDate()+'\n'+em+' '+GS.score+'/'+GS.n);this.textContent=L().gCopied;const t=this;setTimeout(()=>t.textContent=L().gShare,1500)}}]
   :[{label:L().gAgain,pri:true,onclick:()=>startStory('free')}]).concat([{label:L().gHome,onclick:gameHome}])
 });
}

/* ======================================================= TIMELINE PLACE */
function startTimeline(items,onDone,ctx){
 const rnd=Math.random;
 const list=items||pickSpread(GPOOL,5,rnd,40);
 GS={mode:'timeline',list,i:0,score:0,marks:[],n:list.length,onDone,ctx};
 timelinePlay();
}
// inset = fraction from the inline-start edge (logical props mirror for RTL automatically).
// Past sits at inline-start (right in he / left in en); present at inline-end — matching the atlas.
function bandScale(){const span=MAXY-MINY;return {
 inset:y=>(y-MINY)/span,
 yearAt:screenFrac=>Math.round(MINY+(rtl()?1-screenFrac:screenFrac)*span)
};}
function buildBand(){
 const wrap=el('div','g-band');
 const track=el('div','g-track');
 const sc=bandScale();
 eras.forEach((e,idx)=>{
  const l=sc.inset(e.start),r=sc.inset(e.end);
  const seg=el('div','g-era'+(idx%2?' alt':''));seg.style.insetInlineStart=(l*100)+'%';seg.style.width=((r-l)*100)+'%';
  track.appendChild(seg);
 });
 // sparse, well-spread anchor ticks — one carries the "BCE" word, no overlap
 [-1000,0,1000,2000].forEach(y=>{
  const f=sc.inset(y);const t=el('div','g-tick');t.style.insetInlineStart=(f*100)+'%';
  const lbl=y<0?Math.abs(y)+(rtl()?' לפנה״ס':' BCE'):(y===0?(rtl()?'ספירה':'CE'):String(y));
  t.appendChild(el('span',null,lbl));
  track.appendChild(t);
 });
 const guess=el('div','g-knob guess');guess.innerHTML='<i></i>';
 const real=el('div','g-knob real',null);real.innerHTML='<i></i>';real.style.display='none';
 track.append(guess,real);
 wrap.appendChild(track);
 return {wrap,track,guess,real,sc};
}
function timelinePlay(){
 const b=gbox();b.innerHTML='';b.className='sheet gamebox g-tl';
 const it=GS.list[GS.i];
 b.appendChild(gTopBar((GS.ctx?GS.ctx+' · ':'')+L().tlTitle+' '+(GS.i+1)+'/'+GS.n,(()=>{const s=el('div','g-sc');s.textContent='◎ '+GS.score;return s})()));
 b.appendChild(progBar(GS.i/GS.n));
 const card=el('div','g-tlcard');
 const chip=el('span','g-chip '+it.chip);chip.textContent=L().st[it.chip];
 card.append(chip,el('div','g-tlname',tx(it.name)));if(it.sub)card.append(el('div','g-tlsub',it.sub));
 b.appendChild(card);
 b.appendChild(el('div','g-tlq',it.kind==='event'?L().tlPrompt:L().tlPromptLife));
 const B=buildBand();b.appendChild(B.wrap);
 const read=el('div','g-read');const eraLbl=el('span','g-readera');const yrLbl=el('span','g-readyr');read.append(eraLbl,yrLbl);b.appendChild(read);
 const hint=el('div','g-tlhint',L().tlDrag);b.appendChild(hint);
 const act=el('button','g-next',L().tlConfirm);act.disabled=true;b.appendChild(act);

 const SPAN=MAXY-MINY;let gf=0.5,placed=false,confirmed=false; // gf = inset fraction (from inline-start)
 const yearOf=f=>Math.round(MINY+f*SPAN);
 function setScreen(screenFrac,first){const f=Math.max(0,Math.min(1,rtl()?1-screenFrac:screenFrac));gf=f;B.guess.style.insetInlineStart=(f*100)+'%';const y=yearOf(f);yrLbl.textContent=fmtYfull(y);eraLbl.textContent=tx(eraOf(y).name);if(!placed){placed=true;act.disabled=false;hint.style.display='none';B.guess.classList.add('on')}}
 B.guess.style.insetInlineStart='50%';yrLbl.textContent=fmtYfull(yearOf(0.5));eraLbl.textContent='';
 function at(clientX){const r=B.track.getBoundingClientRect();return (clientX-r.left)/r.width}
 let drag=false;
 const dn=e=>{if(confirmed)return;drag=true;B.track.setPointerCapture&&B.track.setPointerCapture(e.pointerId);setScreen(at(e.clientX));e.preventDefault()};
 const mv=e=>{if(!drag||confirmed)return;setScreen(at(e.clientX))};
 const up=()=>{drag=false};
 B.track.addEventListener('pointerdown',dn);B.track.addEventListener('pointermove',mv);
 addEventListener('pointerup',up);B.track.addEventListener('pointercancel',up);

 act.onclick=()=>{
  if(!placed||confirmed)return;confirmed=true;drag=false;
  const guessY=yearOf(gf),realY=it.y,gap=Math.abs(guessY-realY);
  const pts=Math.round(100*Math.exp(-gap/180));GS.score+=pts;GS.marks.push(pts>=50);
  B.real.style.insetInlineStart=(B.sc.inset(realY)*100)+'%';B.real.style.display='';
  requestAnimationFrame(()=>B.real.classList.add('show'));
  const fb=el('div','g-fb show '+(gap<=25?'ok':gap<=120?'mid':'no'));
  fb.append(el('b',null,gap<=25?L().tlBull:(gap<=120?L().gCorrect:L().gWrong)));
  const line=el('div','g-fbstats');
  line.append(fbStat(L().tlReal,fmtYfull(realY)),fbStat(L().tlGap,L().tlYears(gap)),fbStat(L().gPts,'+'+pts,true));
  fb.append(line);
  fb.append(el('div','g-exp',tx(it.name)+(it.sub?' — '+it.sub:'')));
  const row=el('div','g-fbrow');
  const atlas=el('button','g-link',L().gAtlas);atlas.onclick=()=>goAtlas(it.ref);
  const nx=el('button','g-next',GS.i+1>=GS.n?L().gFinish:L().gNext);
  nx.onclick=()=>{GS.i++;if(GS.i>=GS.n)timelineFinish();else timelinePlay()};
  row.append(atlas,nx);fb.append(row);
  act.replaceWith(fb);nx.focus();
 };
}
function timelineFinish(){
 const max=GS.n*100,pct=GS.score/max;
 if(GS.onDone)return GS.onDone({score:GS.score,max,pct,marks:GS.marks});
 showResult({label:L().tlTitle,big:GS.score+'',unit:'/ '+max+' '+L().gPts,marks:GS.marks,msg:scoreMsg(pct),
  actions:[{label:L().gAgain,pri:true,onclick:()=>startTimeline()},{label:L().gHome,onclick:gameHome}]});
}

/* ======================================================= ORDERING */
function startOrder(items,onDone,ctx){
 const rnd=Math.random;
 const list=items||pickSpread(GPOOL,5,rnd,30);
 const solved=list.slice().sort((a,b)=>a.y-b.y);
 GS={mode:'order',solved,remaining:gShuffle(list.slice(),rnd),done:[],miss:0,n:list.length,onDone,ctx};
 orderPlay();
}
function orderPlay(){
 const b=gbox();b.innerHTML='';b.className='sheet gamebox g-ord';
 b.appendChild(gTopBar((GS.ctx?GS.ctx+' · ':'')+L().ordTitle));
 b.appendChild(el('div','g-tlq',L().ordPrompt));
 const solvedWrap=el('div','g-solved');solvedWrap.id='g-solved';b.appendChild(solvedWrap);
 const pool=el('div','g-cards');pool.id='g-cards';b.appendChild(pool);
 renderOrder();
}
function orderCardEl(it,extra){
 const c=el('div','g-ocard'+(extra?' '+extra:''));
 const chip=el('span','g-chip '+it.chip);chip.textContent=L().st[it.chip];
 const tt=el('div','g-oct');tt.append(el('b',null,tx(it.name)));if(it.sub)tt.append(el('span',null,it.sub));
 c.append(chip,tt);return c;
}
function renderOrder(){
 const sv=$('g-solved');sv.innerHTML='';
 GS.done.forEach((d,i)=>{
  const c=orderCardEl(d.it,(d.st==='hit'?'ok':'rev'));
  c.prepend(el('div','g-onum',String(i+1)));
  c.append(mono(fmtYfull(d.it.y)));
  sv.appendChild(c);
 });
 const pool=$('g-cards');pool.innerHTML='';
 GS.remaining.forEach(it=>{const c=orderCardEl(it);c.onclick=e=>orderTap(it,e.currentTarget);pool.appendChild(c)});
}
function orderTap(it,node){
 if(GS.busy)return;
 const expected=GS.solved[GS.done.length];           // earliest not-yet-placed
 if(it.id===expected.id){
  GS.done.push({it,st:'hit'});
  GS.remaining=GS.remaining.filter(x=>x.id!==it.id);
  renderOrder();
  if(GS.remaining.length===0)setTimeout(orderFinish,500);
 }else{
  GS.busy=true;GS.miss++;
  if(node)node.classList.add('shake','wrongflash');
  setTimeout(()=>{
   GS.busy=false;
   GS.done.push({it:expected,st:'reveal'});           // reveal the correct next as "the answer"
   GS.remaining=GS.remaining.filter(x=>x.id!==expected.id);
   renderOrder();
   if(GS.remaining.length===0)setTimeout(orderFinish,500);
  },520);
 }
}
function orderFinish(){
 const correct=GS.done.filter(d=>d.st==='hit').length,pct=correct/GS.n;
 const marks=GS.done.map(d=>d.st==='hit');
 if(GS.onDone)return GS.onDone({score:correct,max:GS.n,pct,marks});
 showResult({label:L().ordTitle,big:correct+'/'+GS.n,marks,msg:scoreMsg(pct),
  actions:[{label:L().gAgain,pri:true,onclick:()=>startOrder()},{label:L().gHome,onclick:gameHome}]});
}

/* ======================================================= JOURNEY */
// Build stations from eras that have enough content. Each station = intro + adaptive challenges.
function journeyStations(){
 return eras.map(e=>{
  const its=DATABLE.filter(d=>d.y>=e.start&&d.y<=e.end);
  const quiz=QUIZ.filter(q=>{const r=rawYear[q.id];return r&&r.y>=e.start&&r.y<=e.end});
  return {era:e,items:its,quiz};
 }).filter(s=>s.items.length>=1);
}
const JST=journeyStations();
function jKey(e){return 'jStars:'+e.id}
function jProgress(){
 let unlocked=gStat('jUnlocked',0),stars=0;
 JST.forEach(s=>stars+=gStat(jKey(s.era),0));
 return {unlocked:Math.min(unlocked,JST.length-1),stars};
}
function openJourney(){
 const b=gbox();b.innerHTML='';b.className='sheet gamebox g-journey';
 const head=el('div','g-head');
 const h=el('div','g-headtxt');h.append(el('h2',null,'🧭 '+L().jTitle),el('p',null,L().jTag));
 head.append(h,gClose());b.appendChild(head);
 const back=el('button','g-back',(rtl()?'→ ':'← ')+L().gHome);back.onclick=gameHome;b.appendChild(back);
 const prog=jProgress();
 const path=el('div','g-path');
 JST.forEach((s,i)=>{
  const stars=gStat(jKey(s.era),0);const unlocked=i<=prog.unlocked;
  const node=el('button','g-st'+(unlocked?'':' locked')+(stars>0?' done':''));
  const dot=el('div','g-stdot',unlocked?(stars>0?'✓':String(i+1)):'🔒');
  const tx2=el('div','g-sttx');
  tx2.append(el('b',null,tx(s.era.name)),el('span',null,L().mRange(s.era.start,s.era.end)));
  const st=el('div','g-stars');for(let k=0;k<3;k++)st.appendChild(el('i','star'+(k<stars?' on':'')));
  tx2.appendChild(st);
  node.append(dot,tx2);
  if(unlocked)node.onclick=()=>journeyIntro(i);
  path.appendChild(node);
 });
 b.appendChild(path);
}
function journeyIntro(i){
 const s=JST[i];const b=gbox();b.innerHTML='';b.className='sheet gamebox g-jintro';
 b.appendChild(gTopBar(L().jStation+' '+(i+1)+' / '+JST.length));
 const hero=el('div','g-jhero');
 hero.append(el('div','g-jeyebrow',L().mRange(s.era.start,s.era.end)));
 hero.append(el('h2','g-jtitle',tx(s.era.name)));
 if(s.era.subtitle)hero.append(el('div','g-jsub',tx(s.era.subtitle)));
 b.appendChild(hero);
 const sumFull=tx(s.era.summary)||'';const sum=sumFull.length>260?sumFull.slice(0,255).replace(/\s+\S*$/,'')+'…':sumFull;
 if(sum)b.appendChild(el('p','g-jsum',sum));
 const go=el('button','g-next',L().jBegin);go.onclick=()=>journeyRun(i);b.appendChild(go);
}
// Build the ordered challenge sequence for a station
function journeySeq(s,rnd){
 const seq=[];
 if(s.items.length>=4)seq.push({t:'order',items:pickSpread(s.items,Math.min(5,s.items.length),rnd,1)});
 if(s.quiz.length){const qi=gShuffle(s.quiz.slice(),rnd).slice(0,Math.min(2,s.quiz.length));seq.push({t:'story',items:qi})}
 if(s.items.length)seq.push({t:'timeline',items:pickSpread(s.items,Math.min(3,s.items.length),rnd,1)});
 if(!seq.length)seq.push({t:'timeline',items:s.items.slice(0,1)});
 return seq;
}
// Journey progress lives in its own JRN (mini-games overwrite GS freely).
function journeyRun(i){
 const s=JST[i],rnd=Math.random;
 JRN={si:i,seq:journeySeq(s,rnd),k:0,got:0,tot:0,ctx:tx(s.era.name)};
 journeyStep();
}
function journeyStep(){
 if(JRN.k>=JRN.seq.length)return journeyDone();
 const step=JRN.seq[JRN.k];
 const onDone=res=>{JRN.got+=res.pct;JRN.tot++;JRN.k++;journeyStep()};
 if(step.t==='order')startOrder(step.items,onDone,JRN.ctx);
 else if(step.t==='timeline')startTimeline(step.items,onDone,JRN.ctx);
 else startStoryEmbed(step.items,onDone,JRN.ctx);
}
// embeddable story round over specific quiz items
function startStoryEmbed(items,onDone,ctx){
 const rnd=Math.random;const qs=items.map(it=>gMakeQ(it,rnd));
 GS={mode:'jstory',_story:{qs,i:0,score:0,marks:[],n:qs.length,onDone,ctx}};
 storyEmbedPlay();
}
function storyEmbedPlay(){
 const S=GS._story;const b=gbox();b.innerHTML='';b.className='sheet gamebox g-play';S.locked=false;
 const qo=S.qs[S.i];
 b.appendChild(gTopBar((S.ctx?S.ctx+' · ':'')+L().gQ+' '+(S.i+1)+'/'+S.n,(()=>{const s=el('div','g-sc');s.textContent='✓ '+S.score;return s})()));
 b.appendChild(progBar(S.i/S.n));
 const qc=el('div','g-q');const chip=el('span','g-chip '+qo.stance);chip.textContent=L().st[qo.stance];qc.appendChild(chip);
 qc.append(el('div','g-qtext',qo.q));b.appendChild(qc);
 const opts=el('div','g-opts');
 qo.opts.forEach(opt=>{const ob=el('button','g-opt');ob.dataset.opt=opt;ob.textContent=opt;ob.onclick=()=>{
  if(S.locked)return;S.locked=true;const ok=opt===qo.correct;S.marks.push(ok);if(ok)S.score++;
  [...opts.children].forEach(ch=>{ch.disabled=true;const t=ch.dataset.opt;if(t===qo.correct)ch.classList.add('right');else if(ch===ob)ch.classList.add('wrong')});
  const fb=$('g-fb');fb.className='g-fb show '+(ok?'ok':'no');fb.append(el('b',null,ok?L().gCorrect:L().gWrong),el('p',null,qo.expl));
  const nx=el('button','g-next',S.i+1>=S.n?L().gNext:L().gNext);nx.onclick=()=>{S.i++;if(S.i>=S.n)S.onDone({score:S.score,max:S.n,pct:S.score/S.n,marks:S.marks});else storyEmbedPlay()};
  fb.appendChild(nx);nx.focus();
 };opts.appendChild(ob)});
 b.appendChild(opts);const fb=el('div','g-fb');fb.id='g-fb';b.appendChild(fb);
}
function journeyDone(){
 const pct=JRN.tot?JRN.got/JRN.tot:0;const stars=pct>=0.85?3:pct>=0.6?2:pct>=0.3?1:0;
 const i=JRN.si,era=JST[i].era;
 if(stars>gStat(jKey(era),0))store.set(jKey(era),stars);
 if(i+1>gStat('jUnlocked',0)&&i+1<JST.length)store.set('jUnlocked',i+1);
 const last=i+1>=JST.length;
 const starRow=('★★★'.slice(0,stars)+'☆☆☆'.slice(0,3-stars));
 showResult({label:tx(era.name),big:starRow,msg:last?L().jDoneAll:L().jComplete,
  actions:(last?[]:[{label:L().jNextStation,pri:true,onclick:()=>journeyIntro(i+1)}])
   .concat([{label:L().jReplay,onclick:()=>journeyRun(i)},{label:L().jTitle,onclick:openJourney}])});
}

/* ---------- tiny ui helpers ---------- */
function progBar(frac){const bar=el('div','g-bar');const fill=el('i');fill.style.width=Math.round(frac*100)+'%';bar.appendChild(fill);return bar}
function mono(t){return el('span','g-mono',t)}
function fbStat(label,val,ltr){const d=el('div','g-fbstat');const v=el('b',null,val);if(ltr)v.dir='ltr';d.append(el('span',null,label),v);return d}

if($('gamebtn'))$('gamebtn').onclick=openGame;
if($('gamebtn-lbl'))$('gamebtn-lbl').textContent=L().gHub;
