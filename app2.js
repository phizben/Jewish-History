(function(){
"use strict";
const $=id=>document.getElementById(id);
const D=JSON.parse($('d-data').textContent);
const MAPS=JSON.parse($('d-maps').textContent);
const LAND=JSON.parse($('d-land').textContent);
const MINY=-1800, MAXY=2026;
const store={get(k,d){try{const v=localStorage.getItem('jatlas2:'+k);return v==null?d:JSON.parse(v)}catch(e){return d}},set(k,v){try{localStorage.setItem('jatlas2:'+k,JSON.stringify(v))}catch(e){}}};
const reduceMotion=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
const phone=()=>innerWidth<=760;

/* ---------- i18n ---------- */
const T={
 he:{title:'אטלס העם היהודי',bce:'לפנה״ס',ce:'לספירה',pop:'יהודים בעולם',popU:'כ־',mil:'מיליון',th:'אלף',
  chap:'פרק',of:'מתוך',moments:'רגעי מפתח',all:'כל הפרקים',chapters:'פרקי ההיסטוריה',
  comm:'קהילות',people:'דמויות',ally:'ידידים',enemy:'צוררים',mixed:'מורכבים',events:'אירועים',
  kComm:'קהילה יהודית',kPerson:'דמות יהודית',kAlly:'ידיד העם היהודי',kEnemy:'צורר',kMixed:'דמות מורכבת',kEvent:'אירוע',
  weighted:'לפי חשיבות',linear:'זמן אחיד',expand:'ציר מלא',collapse:'ציר מקוצר',play:'נגן',pause:'עצור',
  lRabbi:'תקופות בהלכה',lRulers:'השליטה בארץ ישראל',lEvents:'אירועים',lPeople:'דמויות יהודיות',lGent:'ידידים וצוררים',lDemo:'יהודים בעולם',
  goTime:'קפוץ לזמן הזה',showMap:'הראה במפה',close:'סגור',active:'שנות פעילות',role:'תפקיד',calendar:'בלוח השנה היהודי',honor:'הוקרה',works:'חיבורים',
  peak:'תור הזהב',endR:'סוף הקהילה',existing:'עד היום',popHist:'אוכלוסייה יהודית משוערת',traditional:'תיארוך מסורתי או משוער',sheet:'מהגיליון שלך',
  prev:'הפרק הקודם',next:'הפרק הבא',noRes:'לא מצאנו. נסו שם אחר.',search:'חפשו דמות, אירוע או קהילה',about:'אודות',lang:'English',
  coach:'גררו את ציר הזמן למטה וצאו למסע',zin:'התקרב בציר',zout:'התרחק בציר',zall:'כל ההיסטוריה',coachOk:'יאללה',more:'פתח',less:'סגור',map:'מפת גבולות',
  types:{catastrophe:'אסון',expulsion:'גירוש',migration:'הגירה ועלייה',political:'מדיני',religious:'דת והגות',cultural:'תרבות',founding:'ייסוד',war:'מלחמה',rescue:'הצלה'}},
 en:{title:'Jewish People Atlas',bce:'BCE',ce:'CE',pop:'Jews worldwide',popU:'≈ ',mil:'million',th:'thousand',
  chap:'Chapter',of:'of',moments:'Key moments',all:'All chapters',chapters:'Chapters of history',
  comm:'Communities',people:'Figures',ally:'Allies',enemy:'Persecutors',mixed:'Mixed',events:'Events',
  kComm:'Jewish community',kPerson:'Jewish figure',kAlly:'Friend of the Jewish people',kEnemy:'Persecutor',kMixed:'Mixed legacy',kEvent:'Event',
  weighted:'By significance',linear:'Even time',expand:'Full timeline',collapse:'Compact',play:'Play',pause:'Pause',
  lRabbi:'Rabbinic periods',lRulers:'Rule over the Land of Israel',lEvents:'Events',lPeople:'Jewish figures',lGent:'Allies & persecutors',lDemo:'Jews worldwide',
  goTime:'Jump to this time',showMap:'Show on map',close:'Close',active:'Active',role:'Role',calendar:'In the Jewish calendar',honor:'Honor',works:'Works',
  peak:'Golden age',endR:'End of the community',existing:'today',popHist:'Estimated Jewish population',traditional:'Traditional or approximate dating',sheet:'From your spreadsheet',
  prev:'Previous chapter',next:'Next chapter',noRes:'Nothing found. Try another name.',search:'Find a person, event or community',about:'About',lang:'עברית',
  coach:'Drag the timeline below to start the journey',zin:'Zoom in on time',zout:'Zoom out on time',zall:'All of history',coachOk:'Let’s go',more:'Open',less:'Close',map:'border map',
  types:{catastrophe:'Catastrophe',expulsion:'Expulsion',migration:'Migration & aliyah',political:'Politics',religious:'Religion & thought',cultural:'Culture',founding:'Founding',war:'War',rescue:'Rescue'}}
};
let lang=store.get('lang','he');if(!T[lang])lang='he';
const L=()=>T[lang];
const tx=o=>o==null?'':(typeof o==='string'?o:(o[lang]||o.en||o.he||''));
const rtl=()=>lang==='he';

/* ---------- glyphs ---------- */
const G={
 catastrophe:['f','M12 2.5c.8 3.6 5 5.6 5 10.4a5 5 0 0 1-10 0c0-2.6 1.6-3.8 2-6.4 1.8 1 2.7 2.8 2.6 4.6 1.3-2 1.4-5.2.4-8.6z'],
 expulsion:['s','M4 12h13M12 6l6 6-6 6'],
 migration:['s','M4 19c3-9 8-12 15-12M14.5 3.5l4.5 3.5-3.5 4.5'],
 political:['s','M4 20h16M6 10h12M12 3.5l8 4.5H4zM7.5 10v8M12 10v8M16.5 10v8'],
 religious:['s','M3.5 5.5c3-1 5.8-.8 8.5 1 2.7-1.8 5.5-2 8.5-1v13c-3-1-5.8-.8-8.5 1-2.7-1.8-5.5-2-8.5-1zM12 6.5v13'],
 cultural:['f','M12 3l2.6 5.5 6 .8-4.4 4.1 1.1 6L12 16.6 6.7 19.4l1.1-6L3.4 9.3l6-.8z'],
 founding:['s','M6 21V4M6 4.5h11l-2.2 4 2.2 4H6'],
 war:['s','M12 3l7.5 3v5.5c0 4.8-3.4 8-7.5 9.5-4.1-1.5-7.5-4.7-7.5-9.5V6z'],
 rescue:['f','M12 20.5s-7.5-4.6-7.5-10.3A4.2 4.2 0 0 1 12 7.6a4.2 4.2 0 0 1 7.5 2.6c0 5.7-7.5 10.3-7.5 10.3z'],
 calendar:['s','M4 6h16v14H4zM4 10h16M8 3v4M16 3v4'],
 comm:['f','M12 4l8 7h-2.5v9h-11v-9H4z']
};
const evTone=t=>(t==='catastrophe'||t==='expulsion'||t==='war')?'bad':(t==='rescue'||t==='founding'||t==='migration')?'good':'neutral';
const toneVar={bad:'var(--enemy)',good:'var(--ally)',neutral:'var(--neutral)'};
function glyphSvg(type,size){const g=G[type]||G.political;return `<svg viewBox="0 0 24 24" width="${size||16}" height="${size||16}"><path d="${g[1]}" style="${g[0]==='f'?'fill:#fff;stroke:none':'fill:none;stroke:#fff;stroke-width:2.3;stroke-linecap:round;stroke-linejoin:round'}"/></svg>`}
function appendGlyph(sel,type,scale){const g=G[type]||G.political;sel.append('path').attr('class','glyph'+(g[0]==='f'?' f':'')).attr('d',g[1]).attr('transform',`scale(${scale}) translate(-12,-12)`)}
const initial=it=>{const n=tx(it.name||it.title).replace(/^(רבי|רבן|רב|הרב|ר׳|רבנו|דון|דונה|המלך|המלכה|האפיפיור|הקיסר|הצאר|הסולטאן|הרוזן|Rabbi|Rabban|Rav|King|Queen|Pope|Emperor|Tsar|Sultan|Count|Don|Doña|Sir|Lord|Saint)\s+/,'').trim();return n.charAt(0)};

/* ---------- dates ---------- */
function fmtY(y){if(y==null)return '';const u=L();return y<0?Math.abs(y)+' '+u.bce:y+(lang==='he'?'':' '+u.ce)}
function fmtYfull(y){if(y==null)return '';const u=L();return y<0?Math.abs(y)+' '+u.bce:y+' '+u.ce}
function fmtRange(a,b){if(a==null&&b==null)return '';if(a==null)return '– '+fmtY(b);if(b==null)return fmtY(a)+' –';if(a<0&&b<0)return Math.abs(a)+'–'+Math.abs(b)+' '+L().bce;if(a>=0)return a+'–'+b;return fmtY(a)+' – '+fmtYfull(b)}
const HL=[[400,'ת'],[300,'ש'],[200,'ר'],[100,'ק'],[90,'צ'],[80,'פ'],[70,'ע'],[60,'ס'],[50,'נ'],[40,'מ'],[30,'ל'],[20,'כ'],[10,'י'],[9,'ט'],[8,'ח'],[7,'ז'],[6,'ו'],[5,'ה'],[4,'ד'],[3,'ג'],[2,'ב'],[1,'א']];
function gem(n){const th=Math.floor(n/1000);let r=n%1000;let out='';
 while(r>0){if(r===15){out+='טו';break}if(r===16){out+='טז';break}for(const [v,c] of HL){if(r>=v){out+=c;r-=v;break}}}
 if(out.length>1)out=out.slice(0,-1)+'״'+out.slice(-1);else if(out.length===1)out+='׳';
 return (th?(HL.find(h=>h[0]===th)||[0,''])[1]+'׳':'')+out}
function amYear(y){const am=y<0?3761+y:3760+y;return am>0?am:null}

/* ---------- eras & warped scale ---------- */
const eras=D.eras.slice().sort((a,b)=>a.start-b.start);
eras[0].start=Math.min(eras[0].start,MINY);
const segs=eras.map((e,i)=>({e,a:e.start,b:i<eras.length-1?eras[i+1].start:MAXY,w:e.weight}));
let linear=store.get('lin',false),open=store.get('open',false),tlZoom=store.get('tlz',1);const ZMAX=60;
const baseW=vw=>Math.max(vw*(open?7:5.5),3600);const zMin=vw=>Math.min(1,(vw-40)/baseW(vw));let fit=false;
let total=4000,PAD=400;
function layoutScale(vw){tlZoom=Math.max(zMin(vw),Math.min(ZMAX,tlZoom));const target=baseW(vw)*tlZoom;let sum=0;
 segs.forEach(s=>{const d=s.b-s.a;s.raw=linear?d:Math.pow(d,0.5)*(0.5+0.5*s.w);sum+=s.raw});
 let x=0;segs.forEach(s=>{s.px=s.raw/sum*target;s.x0=x;x+=s.px;s.x1=x});total=x}
function segOf(y){for(const s of segs){if(y<s.b)return s}return segs[segs.length-1]}
function xRaw(y){y=Math.max(MINY,Math.min(MAXY,y));const s=segOf(y);return s.x0+(y-s.a)/(s.b-s.a)*s.px}
function yRaw(x){x=Math.max(0,Math.min(total,x));for(const s of segs){if(x<=s.x1)return s.a+(x-s.x0)/s.px*(s.b-s.a)}return MAXY}
const X=y=>PAD+(rtl()?total-xRaw(y):xRaw(y));
const Yof=px=>{const x=px-PAD;return yRaw(rtl()?total-x:x)};
function eraAt(y){for(let i=eras.length-1;i>=0;i--)if(y>=eras[i].start)return i;return 0}
const yearsPerPx=y=>{const s=segOf(y);return (s.b-s.a)/s.px};

/* ---------- items ---------- */
const ITEMS=new Map();
D.communities.forEach(c=>{c.kind='comm';c.key='c:'+c.id;ITEMS.set(c.key,c)});
D.people.forEach(p=>{p.kind='person';p.key='p:'+p.id;ITEMS.set(p.key,p);if(!p.active)p.active=[p.born,p.died]});
D.gentiles.forEach(g=>{g.kind='gent';g.key='g:'+g.id;ITEMS.set(g.key,g);if(!g.active)g.active=[g.born,g.died]});
D.events.forEach(e=>{e.kind='event';e.key='e:'+e.id;ITEMS.set(e.key,e);e.endYear=e.endYear||e.year});
const span=it=>it.kind==='event'?[it.year,it.endYear]:it.kind==='comm'?[it.start,it.end==null?MAXY:it.end]:[it.active[0]??it.born,it.active[1]??it.died??it.active[0]];
const anchorYear=it=>{if(it.kind==='event')return it.year;const s=span(it);if(it.kind==='comm'&&it.pop&&it.pop.length){const m=it.pop.reduce((a,b)=>b[1]>a[1]?b:a)[0];return Math.max(s[0],Math.min(s[1],m))}return Math.round((s[0]+(s[1]??s[0]))/2)};
const layerOf=it=>it.kind==='comm'?'comm':it.kind==='person'?'people':it.kind==='event'?'events':it.stance;
const colorOf=it=>it.kind==='comm'?'var(--gold)':it.kind==='person'?'var(--brand)':it.kind==='event'?toneVar[evTone(it.type)]:`var(--${it.stance})`;
function interp(pts,y){if(!pts||!pts.length)return 0;if(y<=pts[0][0])return pts[0][1];for(let i=1;i<pts.length;i++){if(y<=pts[i][0]){const [a,va]=pts[i-1],[b,vb]=pts[i];return va+(vb-va)*(y-a)/(b-a)}}return pts[pts.length-1][1]}
function fmtPop(n){const u=L();if(n>=1e6)return u.popU+(n/1e6).toFixed(n>=1e7?1:2).replace(/\.?0+$/,'')+' '+u.mil;if(n>=1e3)return u.popU+Math.round(n/1e3)+' '+u.th;return u.popU+Math.round(n)}

/* ---------- state ---------- */
let year=1492,curEra=-1,selected=null;
const layers=Object.assign({comm:true,people:true,ally:true,enemy:true,mixed:true,events:true},store.get('layers',{}));
let lastUserMap=0;

/* ---------- map ---------- */
const svg=d3.select('#map');
const proj=d3.geoNaturalEarth1();const gpath=d3.geoPath(proj);
const root=svg.append('g');
const gSphere=root.append('path').attr('class','sphere');
const gLand=root.append('g'),gPoly=root.append('g'),gPL=root.append('g'),gOvl=root.append('g'),gPts=root.append('g');
const land=topojson.feature(LAND,LAND.objects.land);
let k=1,mw=800,mh=500;
const zoom=d3.zoom().scaleExtent([1,60]).on('zoom',ev=>{root.attr('transform',ev.transform);if(ev.sourceEvent)lastUserMap=Date.now();if(Math.abs(ev.transform.k-k)>1e-3){k=ev.transform.k;rescale()}}).on('end',()=>{placeLabels();drawPoints()});
svg.call(zoom).on('dblclick.zoom',null);
const SNAPS=Object.keys(MAPS).map(Number).sort((a,b)=>a-b);
const polyCache=new Map();let lastSnap=null;
const GENERIC=/hunter|gatherer|nomad|farmers|culture|peoples|pastoral|foraging|herders|tribes$|fishers/i;
function sizeMap(){const r=$('stage').getBoundingClientRect();mw=Math.max(200,r.width);mh=Math.max(150,r.height);svg.attr('viewBox',`0 0 ${mw} ${mh}`);
 proj.fitExtent([[4,4],[mw-4,mh-4]],{type:'Sphere'});gSphere.attr('d',gpath({type:'Sphere'}));
 gLand.selectAll('path').data([land]).join('path').attr('class','landbase').attr('d',gpath);
 zoom.translateExtent([[-mw*.3,-mh*.3],[mw*1.3,mh*1.3]]);polyCache.clear();lastSnap=null;drawBorders(true);drawPoints()}
function snapFor(y){let s=SNAPS[0];for(const v of SNAPS){if(v<=y)s=v;else break}return s}
function snapFeatures(s){if(polyCache.has(s))return polyCache.get(s);const t=MAPS[s];const o=t.objects[Object.keys(t.objects)[0]];
 const fs=topojson.feature(t,o).features.filter(f=>f.geometry);
 fs.forEach(f=>{let n=f.properties.NAME||'';if(n==='Israel'&&s<1948)n='Mandatory Palestine (GB)';if(n==='Kingdom of David and Solomon'){if(s<=-1500)n='Canaan';else if(s>=-700)n='Kingdom of Judah'}f.n=n;f.cls=GENERIC.test(n)?'pn':'';
  let best=null,ba=0;const polys=f.geometry.type==='MultiPolygon'?f.geometry.coordinates:[f.geometry.coordinates];
  polys.forEach(p=>{const g={type:'Polygon',coordinates:p};const a=gpath.area(g);if(a>ba){ba=a;best=g}});f.area=ba;f.c=best?gpath.centroid(best):[0,0];f.d=gpath(f)});
 polyCache.set(s,fs);return fs}
const PN=D.extras.polities;
function polyName(n){if(lang==='he')return PN[n]||null;return n.replace(/\s*\((GB|France|UK)\)$/,'')}
function drawBorders(force){const s=snapFor(year);
 if(s!==lastSnap||force){lastSnap=s;const fs=snapFeatures(s);
  gPoly.selectAll('path').data(fs,f=>f.n).join('path').attr('class',f=>'poly '+f.cls).attr('d',f=>f.d)
   .on('pointerenter',(e,f)=>showTip(e,polyName(f.n)||f.n,L().map+' · '+fmtYfull(s))).on('pointermove',moveTip).on('pointerleave',hideTip);
  placeLabels()}
 const ov=D.extras.overlays.filter(o=>year>=o.start&&year<=o.end);
 gOvl.selectAll('g').data(ov,o=>o.en).join(en=>{const g=en.append('g');g.append('path').attr('class','ovl');g.append('text').attr('class','olabel');return g})
  .each(function(o){const g=d3.select(this);let poly={type:'Polygon',coordinates:[o.poly.concat([o.poly[0]])]};if(d3.geoArea(poly)>2*Math.PI)poly={type:'Polygon',coordinates:[o.poly.concat([o.poly[0]]).reverse()]};
   g.select('path').attr('class','ovl'+(o.kind==='influence'?' inf':'')).attr('d',gpath(poly));g.select('text').classed('inf',o.kind==='influence');const c=o.kind==='influence'?proj([37.4,34.6]):gpath.centroid(poly);g.select('text').attr('x',c[0]).attr('y',c[1]).text(tx(o))});
 rescale()}
function placeLabels(){if(lastSnap==null)return;const fs=polyCache.get(lastSnap)||[];const fsz=11.5/k;
 const cand=fs.filter(f=>f.cls!=='pn'&&f.area*k*k>7000&&polyName(f.n)).sort((a,b)=>b.area-a.area).slice(0,40);
 const placed=[],out=[];
 for(const f of cand){const nm=polyName(f.n);const w=nm.length*fsz*0.6,h=fsz*1.4;const bb=[f.c[0]-w/2,f.c[1]-h/2,f.c[0]+w/2,f.c[1]+h/2];
  if(placed.some(p=>!(bb[2]<p[0]||bb[0]>p[2]||bb[3]<p[1]||bb[1]>p[3])))continue;placed.push(bb);out.push(f)}
 gPL.selectAll('text').data(out,f=>f.n).join('text').attr('class','plabel').attr('x',f=>f.c[0]).attr('y',f=>f.c[1]).attr('font-size',fsz).text(f=>polyName(f.n))}
function windowYears(){return Math.max(2,Math.min(160,yearsPerPx(year)*70))}
function visibleItems(){const w=windowYears();const out=[];const minP=k>=5?1:2,minE=k>=6?1:2;
 const ov=(a,b)=>a<=year+w&&b>=year-w;
 D.communities.forEach(c=>{const e=c.end==null?MAXY+1:c.end;if(year>=c.start&&year<=e)out.push(c)});
 D.events.forEach(e=>{if(e.importance>=minE&&ov(e.year,e.endYear))out.push(e)});
 D.people.forEach(p=>{const s=span(p);if(p.importance>=minP&&s[0]!=null&&ov(s[0],s[1]??s[0]))out.push(p)});
 D.gentiles.forEach(g=>{const s=span(g);if(g.importance>=minP&&s[0]!=null&&ov(s[0],s[1]??s[0]))out.push(g)});
 return out}
const commR=c=>3.2+Math.sqrt(Math.max(0,interp(c.pop,year)))/34;
const measure=document.createElement('canvas').getContext('2d');
function tw(s,size,weight){measure.font=`${weight||500} ${size||12}px Rubik,Arial`;return measure.measureText(s).width}
let visCache=[];
function drawPoints(){
 const all=visibleItems();visCache=all;
 const items=all.filter(it=>layers[layerOf(it)]||it===selected);
 const order={comm:0,person:2,gent:2,event:3};items.sort((a,b)=>order[a.kind]-order[b.kind]||(a.importance||0)-(b.importance||0)||(b===selected?-1:0));
 const sel=gPts.selectAll('g.mk').data(items,d=>d.key);sel.exit().remove();
 const en=sel.enter().append('g').attr('class',d=>'mk '+d.kind+(d.kind==='gent'?' '+d.stance:''))
  .on('click',(e,d)=>{e.stopPropagation();select(d,false)})
  .on('pointerenter',(e,d)=>showTip(e,tx(d.name||d.title),tipSub(d))).on('pointermove',moveTip).on('pointerleave',hideTip);
 en.each(function(d){const g=d3.select(this);const inner=g.append('g').attr('class','in');
  if(d.kind==='comm'){inner.append('circle').attr('class','halo');inner.append('circle').attr('class','dot')}
  else if(d.kind==='event'){const t='c-'+evTone(d.type);inner.append('circle').attr('class','pulse '+t).attr('r',11);inner.append('circle').attr('class','av '+t).attr('r',11);appendGlyph(inner,d.type,.55)}
  else{inner.append('circle').attr('class','av').attr('r',10.5);inner.append('text').attr('class','ini').text(initial(d))}
  const p=inner.append('g').attr('class','pill');p.append('rect');p.append('text')});
 const m=en.merge(sel);
 m.each(d=>{d._xy=proj([d.lon,d.lat])||[0,0]});
 m.classed('sel',d=>d===selected).classed('hot',d=>d.kind==='event'&&Math.abs(d.year-year)<=Math.max(1,yearsPerPx(year)*12));
 m.filter(d=>d.kind==='comm').each(function(d){const r=commR(d);const g=d3.select(this);g.select('.dot').attr('r',r);g.select('.halo').attr('r',r+5)});
 m.filter(d=>d.kind==='person'||d.kind==='gent').select('.ini').text(d=>initial(d));
 // labels with collision
 const want=items.filter(d=>labelFor(d)).sort((a,b)=>(b===selected)-(a===selected)||(b.importance||0)-(a.importance||0)||(a.kind==='event'&&b.kind==='event'?Math.abs(a.year-year)-Math.abs(b.year-year):0));
 const boxes=[],lab=new Map();
 want.forEach(d=>{const t=labelFor(d);const w=tw(t,12,600)+16;const r=d.kind==='comm'?commR(d):11;const sx=d._xy[0]*k,sy=d._xy[1]*k;
  const x0=rtl()?sx-r-6-w:sx+r+6,bb=[x0,sy-10,x0+w,sy+10];if(boxes.some(b=>!(bb[2]<b[0]||bb[0]>b[2]||bb[3]<b[1]||bb[1]>b[3])))return;boxes.push(bb);lab.set(d,{t,w,r})});
 m.each(function(d){const p=d3.select(this).select('.pill');const l=lab.get(d);if(!l){p.attr('display','none');return}
  p.attr('display',null);const x=rtl()?-l.r-6-l.w:l.r+6;p.select('rect').attr('x',x).attr('y',-10).attr('width',l.w).attr('height',20).attr('rx',10);
  p.select('text').attr('x',rtl()?x+l.w-8:x+8).attr('y',0).attr('text-anchor',rtl()?'end':'start').text(l.t)});
 rescale();renderCounts()}
function labelFor(d){if(d===selected)return tx(d.name||d.title);
 if(d.kind==='comm')return (k>=6||interp(d.pop,year)>=300000)?tx(d.name):'';
 if(d.kind==='event')return d.importance>=3&&Math.abs(d.year-year)<=Math.max(2,yearsPerPx(year)*30)?tx(d.title):'';
 return (d.importance>=3&&k>=3)||(k>=9)?tx(d.name):''}
function tipSub(d){if(d.kind==='event')return fmtYfull(d.year)+' · '+tx(d.place);if(d.kind==='comm')return fmtPop(interp(d.pop,year));const s=span(d);return tx(d.role)+' · '+fmtRange(d.born??s[0],d.died??s[1])}
let rsq=0;function rescale(){if(rsq)return;rsq=requestAnimationFrame(()=>{rsq=0;const ik=1/k;
 gPts.selectAll('g.mk').attr('transform',d=>`translate(${d._xy[0]},${d._xy[1]}) scale(${ik})`);
 gOvl.selectAll('text').attr('font-size',14/k).style('stroke-width',(3.5/k)+'px')})}
const zk=z=>Math.min(60,Math.max(1,Math.pow(2,Math.min(5,z||3)-1)*0.85));
function flyTo(lon,lat,z,dur){const p=proj([lon,lat]);if(!p)return;const kk=zk(z);
 // keep the target clear of the side card on desktop
 let cx=mw/2,cy=mh/2;if(!phone()){const off=Math.min(200,mw*0.14);cx+=rtl()?-off:off}else{cy=mh*0.38}
 const t=d3.zoomIdentity.translate(cx,cy).scale(kk).translate(-p[0],-p[1]);
 svg.transition().duration(reduceMotion()?0:(dur??1100)).ease(d3.easeCubicInOut).call(zoom.transform,t)}
$('zin').onclick=()=>svg.transition().duration(300).call(zoom.scaleBy,1.6);
$('zout').onclick=()=>svg.transition().duration(300).call(zoom.scaleBy,1/1.6);

/* tooltip */
const tip=$('tip');
function showTip(e,a,b){if(e.pointerType==='touch')return;tip.innerHTML='';const s=document.createElement('div');s.textContent=a;s.style.fontWeight=600;tip.appendChild(s);if(b){const sm=document.createElement('small');sm.textContent=b;tip.appendChild(sm)}tip.dir=rtl()?'rtl':'ltr';tip.hidden=false;moveTip(e)}
function moveTip(e){const w=tip.offsetWidth;let x=e.clientX+14;if(x+w>innerWidth-8)x=e.clientX-w-14;tip.style.left=x+'px';tip.style.top=(e.clientY+16)+'px'}
function hideTip(){tip.hidden=true}

/* ---------- counters ---------- */
const CNT=[['comm','var(--gold)','comm'],['people','var(--brand)',null],['ally','var(--ally)',null],['enemy','var(--enemy)',null],['mixed','var(--mixed)',null],['events','var(--neutral)','political']];
function buildCounts(){const el=$('counts');el.innerHTML='';el.setAttribute('aria-label',lang==='he'?'שכבות במפה':'Map layers');
 CNT.forEach(([key,col,gl])=>{const b=document.createElement('button');b.className='cnt';b.dataset.k=key;b.setAttribute('aria-pressed',layers[key]);
  const sw=document.createElement('span');sw.className='sw';sw.style.background=col;sw.innerHTML=gl?glyphSvg(gl,12):'<svg viewBox="0 0 24 24" width="12" height="12"><circle cx="12" cy="12" r="5" fill="#fff"/></svg>';
  const n=document.createElement('b');const lb=document.createElement('span');lb.textContent=L()[key];b.append(sw,n,lb);
  b.onclick=()=>{layers[key]=!layers[key];store.set('layers',layers);b.setAttribute('aria-pressed',layers[key]);drawPoints();renderTimeline()};el.appendChild(b)})}
function renderCounts(){const c={comm:0,people:0,ally:0,enemy:0,mixed:0,events:0};visCache.forEach(it=>c[layerOf(it)]++);
 document.querySelectorAll('#counts .cnt').forEach(b=>{b.querySelector('b').textContent=c[b.dataset.k];b.setAttribute('aria-label',c[b.dataset.k]+' '+L()[b.dataset.k])})}

/* ---------- timeline ---------- */
const sc=$('tlscroll'),tl=d3.select('#tl');
function pack(items,x0f,x1f,maxRows){const rows=[];const placed=[];
 for(const it of items){const a=x0f(it),b=x1f(it);const lo=Math.min(a,b),hi=Math.max(a,b);let r=0;
  for(;r<maxRows;r++){const row=rows[r]||(rows[r]=[]);if(!row.some(([p,q])=>lo<q+8&&hi>p-8)){row.push([lo,hi]);break}}
  if(r<maxRows){it._row=r;placed.push(it)}}
 return {placed,rows:Math.max(1,rows.length)}}
function onItem(g,it){g.attr('data-k',it.key).on('click',()=>select(it,true)).on('pointerenter',ev=>showTip(ev,tx(it.name||it.title),it.kind==='event'?fmtYfull(it.year)+' · '+L().types[it.type]:tx(it.role)+' · '+fmtRange(span(it)[0],span(it)[1]))).on('pointermove',moveTip).on('pointerleave',hideTip)}
function renderTimeline(){
 const vw=sc.clientWidth||800;layoutScale(vw);fit=total<=vw-39;PAD=fit?Math.round((vw-total)/2):Math.round(vw/2);sc.classList.toggle('fit',fit);
 const W=fit?vw:total+PAD*2;tl.attr('width',W);tl.selectAll('*').remove();
 const R=rtl();let y=30;const lanes=[];
 const gG=tl.append('g').attr('class','grid');
 // eras
 const eh=open?34:38;
 segs.forEach((s,i)=>{const xa=X(s.a),xb=X(s.b);const x=Math.min(xa,xb)+1.5,w=Math.abs(xb-xa)-3;
  const g=tl.append('g').attr('class','tl-era'+(i===curEra?' cur':'')).attr('data-i',i).on('click',()=>goEra(i));
  g.append('rect').attr('x',x).attr('y',y).attr('width',Math.max(1,w)).attr('height',eh).style('fill',`var(--e-${s.e.color})`);
  const nm=tx(s.e.name);const lw=tw(nm,13,600)+18;
  if(lw<w){const n=Math.max(1,Math.floor(w/760));for(let j=0;j<n;j++)g.append('text').attr('x',x+w*(j+.5)/n).attr('y',y+eh/2+4.5).attr('text-anchor','middle').text(nm)}
  else if(w>44){let t=nm;while(t.length>2&&tw(t+'…',13,600)+14>w)t=t.slice(0,-1);g.append('text').attr('x',x+w/2).attr('y',y+eh/2+4.5).attr('text-anchor','middle').text(t+'…')}});
 // ticks above eras
 const gT=tl.append('g');const steps=[1,2,5,10,20,25,50,100,200,250,500,1000];let last=-1e9;
 segs.forEach(s=>{const ppy=s.px/(s.b-s.a);const need=s.a<0?(lang==='he'?92:72):58;const st=steps.find(v=>v*ppy>=need)||1000;
  for(let t=Math.ceil(s.a/st)*st;t<s.b;t+=st){if(t===0)continue;const x=X(t);const rx=Math.abs(x-PAD);if(Math.abs(rx-last)<need)continue;last=rx;
   const g=gT.append('g').attr('class','tick');g.append('text').attr('x',x).attr('y',y-10).attr('text-anchor','middle').text(t<0?Math.abs(t)+(lang==='he'?' לפנה״ס':' BCE'):t);
   gG.append('line').attr('x1',x).attr('x2',x).attr('y1',y+eh).attr('y2',4000)}});
 y+=eh+10;
 // events: compact = beads in 1 row; open = packed rows with labels
 const evs=D.events.filter(e=>layers.events).sort((a,b)=>b.importance-a.importance||a.year-b.year);
 const gEv=tl.append('g');
 if(!open){
  // compact: two calm rows. Events (glyph beads) and gentiles (initial avatars). Overlapping marks are thinned by importance.
  const row=(items,cy,draw,labelOf,minGap,labMin)=>{const placed=[];const sorted=items.slice().sort((a,b)=>b.importance-a.importance||Math.abs(a._y-year)-Math.abs(b._y-year));
   sorted.forEach(it=>{const x=X(it._y);if(placed.some(p=>Math.abs(p.x-x)<minGap))return;placed.push({it,x})});
   const lbx=[];const labS=new Set();
   placed.slice().sort((a,b)=>b.it.importance-a.it.importance||Math.abs(a.it._y-year)-Math.abs(b.it._y-year)).forEach(o=>{const {it,x}=o;if(!placed.includes(o))return;if(it.importance<(labMin??(tlZoom>=2.5?2:3)))return;const w=tw(labelOf(it),12,600)+8;const lo=R?x-12-w:x+12,hi=R?x-12:x+12+w;
    if(lbx.some(([p,q])=>lo<q+8&&hi>p-8))return;const blk=placed.filter(p=>p.it!==it&&p.x>lo-10&&p.x<hi+10);if(blk.some(p=>p.it.importance>=it.importance||labS.has(p.it)))return;blk.forEach(p=>{const i=placed.indexOf(p);if(i>=0)placed.splice(i,1)});lbx.push([lo,hi]);labS.add(it)});
   const g0=tl.append('g');placed.forEach(({it,x})=>{const g=g0.append('g').attr('class','bead'+(it===selected?' sel':''));onItem(g,it);draw(g,it,x,cy)});
   const gL=tl.append('g').attr('class','bead').style('pointer-events','none');placed.filter(p=>labS.has(p.it)).forEach(({it,x})=>gL.append('text').attr('x',R?x-13:x+13).attr('y',cy+4.5).attr('text-anchor',R?'end':'start').text(labelOf(it)))};
  const ev=evs.filter(e=>e.importance>=3||(tlZoom>=2.5&&e.importance>=2));ev.forEach(e=>e._y=e.year);
  lanes.push([L().lEvents,y-2,'c']);row(ev,y+16,(g,e,x,cy)=>{g.append('circle').attr('cx',x).attr('cy',cy).attr('r',10).style('fill',toneVar[evTone(e.type)]);const gg=g.append('g').attr('transform',`translate(${x},${cy})`);appendGlyph(gg,e.type,.5)},e=>tx(e.title),22);
  const gs=D.gentiles.filter(g=>layers[g.stance]&&span(g)[0]!=null&&(g.importance>=2||tlZoom>=2.5));gs.forEach(g=>{const s=span(g);g._y=(s[0]+(s[1]??s[0]))/2});
  const js=layers.people?D.people.filter(p=>span(p)[0]!=null&&(p.importance>=2||tlZoom>=2.5)):[];js.forEach(p=>{const s=span(p);p._y=(s[0]+(s[1]??s[0]))/2});
  lanes.push([L().lPeople,y+30,'c']);row(js,y+46,(g,p,x,cy)=>{g.append('circle').attr('cx',x).attr('cy',cy).attr('r',10).style('fill','var(--brand)');g.append('text').attr('class','ini').attr('x',x).attr('y',cy).text(initial(p))},p=>tx(p.name),22,2);
  lanes.push([L().lGent,y+60,'c']);row(gs,y+76,(g,p,x,cy)=>{g.append('circle').attr('cx',x).attr('cy',cy).attr('r',10).style('fill',`var(--${p.stance})`);g.append('text').attr('class','ini').attr('x',x).attr('y',cy).text(initial(p))},p=>tx(p.name),22,2);
  y+=94;
 }else{
  lanes.push([L().lEvents,y]);const top=y+24;
  const items=evs.filter(e=>e.importance>=2);items.forEach(e=>{e._lw=tw(tx(e.title),12,e.importance>=3?600:500)+24});
  const pe=pack(items,e=>X(e.year),e=>X(e.year)+(R?-1:1)*e._lw,4);
  pe.placed.forEach(e=>{const cy=top+e._row*26,x=X(e.year);const g=gEv.append('g').attr('class','bead'+(e===selected?' sel':''));onItem(g,e);
   if(e.endYear>e.year){const x2=X(e.endYear);g.append('rect').attr('x',Math.min(x,x2)).attr('y',cy-3).attr('width',Math.abs(x2-x)).attr('height',6).attr('rx',3).style('fill',toneVar[evTone(e.type)]).style('opacity',.3)}
   g.append('circle').attr('cx',x).attr('cy',cy).attr('r',e.importance>=3?9.5:7).style('fill',toneVar[evTone(e.type)]);
   const gg=g.append('g').attr('transform',`translate(${x},${cy})`);appendGlyph(gg,e.type,e.importance>=3?.48:.36);
   g.append('text').attr('x',R?x-14:x+14).attr('y',cy+4.5).attr('text-anchor',R?'end':'start').text(tx(e.title)).style('font-weight',e.importance>=3?700:500)});
  y=top+pe.rows*26;
  const bars=(arr,label)=>{const its=arr.filter(p=>span(p)[0]!=null).sort((a,b)=>b.importance-a.importance||span(a)[0]-span(b)[0]);
   its.forEach(p=>{p._lw=tw(tx(p.name),12,p.importance>=3?700:500)+30});
   const bx=p=>{const s=span(p);const a=X(s[0]),b=X(s[1]??s[0]);return [Math.min(a,b),Math.max(a,b)]};
   const x0=p=>{const [a,b]=bx(p);return R?b:a},x1=p=>{const [a,b]=bx(p);return R?Math.min(a,b-p._lw):Math.max(b,a+p._lw)};
   lanes.push([label,y]);const top2=y+24;const pk=pack(its,x0,x1,4);const g0=tl.append('g');
   pk.placed.forEach(p=>{const [a,b]=bx(p);const w=Math.max(p._lw,b-a);const cy=top2+p._row*26;const x=R?b-w:a;
    const g=g0.append('g').attr('class','bar '+(p.kind==='gent'?p.stance:'person')+' imp'+p.importance+(p===selected?' sel':''));onItem(g,p);
    g.append('rect').attr('class','bg').attr('x',x).attr('y',cy-9).attr('width',w).attr('height',19);
    g.append('circle').attr('class','cap').attr('cx',R?b-9.5:a+9.5).attr('cy',cy+.5).attr('r',7);
    g.append('text').attr('x',R?b-22:a+22).attr('y',cy+4.5).attr('text-anchor',R?'end':'start').text(tx(p.name))});
   y=top2+pk.rows*26};
  bars(D.gentiles.filter(g=>layers[g.stance]),L().lGent);
  if(layers.people)bars(D.people,L().lPeople);
  const band=(arr,label)=>{lanes.push([label,y]);const g=tl.append('g');arr.forEach(r=>{const xa=X(r.start),xb=X(r.end);const x=Math.min(xa,xb)+1,w=Math.abs(xb-xa)-2;const gg=g.append('g').attr('class','tl-band '+(r.kind||''));gg.append('rect').attr('x',x).attr('y',y+24).attr('width',Math.max(1,w)).attr('height',20);const nm=tx(r);if(tw(nm,11.5)+10<w){const n=Math.max(1,Math.floor(w/700));for(let j=0;j<n;j++)gg.append('text').attr('x',x+w*(j+.5)/n).attr('y',y+38).attr('text-anchor','middle').text(nm)}});y+=50};
  band(D.extras.rabbinic,L().lRabbi);band(D.extras.rulers,L().lRulers);
  lanes.push([L().lDemo,y]);const dTop=y+26,dH=60;const wd=D.demography.world;const mx=d3.max(wd,d=>d[1]);
  const pts=[];for(let px=0;px<=total;px+=6){pts.push([PAD+(R?total-px:px),interp(wd,yRaw(px))])}
  tl.append('g').attr('class','demo').append('path').attr('d',d3.area().x(d=>d[0]).y0(dTop+dH).y1(d=>dTop+dH-d[1]/mx*dH).curve(d3.curveMonotoneX)(pts));
  y=dTop+dH+16;
 }
 tl.attr('height',y);
 const ln=$('lanes');ln.innerHTML='';ln.style.width=sc.clientWidth+'px';ln.dir=R?'rtl':'ltr';lanes.forEach(([t,yy,c])=>{const d=document.createElement('div');d.textContent=t;d.style.top=yy+'px';if(c)d.className='mini';ln.appendChild(d)});
 placeHead();
 sc.setAttribute('aria-label',lang==='he'?'ציר הזמן':'Timeline');
 scrollToYear(year,false);if($('tz-in'))requestAnimationFrame(updZoomUI)}
let ignoreScroll=false;
function placeHead(){$('playhead').style.left=(fit?X(year)-sc.scrollLeft:sc.clientWidth/2)+'px'}
function nudge(px){if(fit){setYear(Yof(X(year)+px))}else sc.scrollLeft+=px}
function scrollToYear(y,smooth){if(fit){sc.scrollLeft=0;setYear(y);return}const x=X(y)-sc.clientWidth/2;ignoreScroll=true;const sm=smooth&&!reduceMotion();sc.scrollTo({left:x,behavior:sm?'smooth':'auto'});
 if(sm)setTimeout(()=>{ignoreScroll=false},750);else requestAnimationFrame(()=>{ignoreScroll=false});setYear(y)}
sc.addEventListener('scroll',()=>{if(window.__zs)cancelAnimationFrame(window.__zs);window.__zs=requestAnimationFrame(()=>{try{$('tz-span').textContent=fmtSpan(visibleSpan())}catch(_){}});if(ignoreScroll||fit)return;setYear(Yof(sc.scrollLeft+sc.clientWidth/2),true);dismissCoach()},{passive:true});
sc.addEventListener('wheel',e=>{if(e.ctrlKey||e.metaKey){e.preventDefault();zoomBy(Math.exp(-e.deltaY*0.01));return}if(e.shiftKey&&open)return;if(Math.abs(e.deltaY)>Math.abs(e.deltaX)){e.preventDefault();nudge((rtl()?-1:1)*e.deltaY*(fit?.4:1))}},{passive:false});
(()=>{let down=null;const yAt=cx=>Yof(cx-sc.getBoundingClientRect().left+sc.scrollLeft);
 sc.addEventListener('pointerdown',e=>{if(e.button!==0)return;if(!fit&&e.pointerType!=='mouse')return;down={x:e.clientX,y:e.clientY,l:sc.scrollLeft,t:sc.scrollTop,moved:false,onItem:!!e.target.closest('[data-k],.tl-era')}});
 addEventListener('pointermove',e=>{if(!down)return;const dx=e.clientX-down.x,dy=e.clientY-down.y;if(!down.moved&&Math.hypot(dx,dy)<4)return;down.moved=true;sc.classList.add('drag');dismissCoach();if(fit){setYear(yAt(e.clientX));sc.scrollTop=down.t-dy}else{sc.scrollLeft=down.l-dx;sc.scrollTop=down.t-dy}});
 sc.addEventListener('click',e=>{if(fit&&!e.target.closest('[data-k],.tl-era'))setYear(yAt(e.clientX))});
 addEventListener('pointerup',()=>{if(down&&down.moved){const stop=e=>{e.stopPropagation();e.preventDefault()};sc.addEventListener('click',stop,{capture:true,once:true});setTimeout(()=>sc.removeEventListener('click',stop,{capture:true}),50)}down=null;sc.classList.remove('drag')})})();
$('s-weighted').onclick=()=>{linear=false;store.set('lin',false);syncSeg();renderTimeline()};
$('s-linear').onclick=()=>{linear=true;store.set('lin',true);syncSeg();renderTimeline()};
function syncSeg(){$('s-weighted').setAttribute('aria-pressed',!linear);$('s-linear').setAttribute('aria-pressed',linear)}
function setOpen(o){open=o;store.set('open',o);$('dock').dataset.open=o;$('expbtn').setAttribute('aria-expanded',o);$('exptxt').textContent=o?L().collapse:L().expand;requestAnimationFrame(()=>{renderTimeline()})}
$('expbtn').onclick=()=>setOpen(!open);
/* timeline zoom */
let zq=0,zPending=1;
function zoomBy(f){zPending*=f;if(zq)return;zq=requestAnimationFrame(()=>{zq=0;setTlZoom(tlZoom*zPending);zPending=1})}
function setTlZoom(z){const vw=sc.clientWidth||800;const nz=Math.max(zMin(vw),Math.min(ZMAX,z));if(Math.abs(nz-tlZoom)<1e-4&&z===nz)return;tlZoom=nz;store.set('tlz',tlZoom);renderTimeline();updZoomUI()}
function visibleSpan(){if(fit)return MAXY-MINY;const vw=sc.clientWidth||800;const a=Yof(sc.scrollLeft),b=Yof(sc.scrollLeft+vw);return Math.abs(b-a)}
function fmtSpan(n){n=Math.round(n);const he=lang==='he';if(n>=1000){const v=Math.round(n/100)/10;return he?`כ־${v.toLocaleString('he')} אלף שנה על המסך`:`≈ ${v}k years on screen`}if(n>=100){const v=Math.round(n/10)*10;return he?`כ־${v} שנה על המסך`:`≈ ${v} years on screen`}return he?`כ־${Math.max(1,n)} שנים על המסך`:`≈ ${Math.max(1,n)} years on screen`}
function updZoomUI(){const vw=sc.clientWidth||800;$('tz-out').disabled=tlZoom<=zMin(vw)+1e-4;$('tz-in').disabled=tlZoom>=ZMAX-1e-4;$('tz-span').textContent=fmtSpan(visibleSpan())}
$('tz-in').onclick=()=>setTlZoom(tlZoom*1.6);$('tz-out').onclick=()=>setTlZoom(tlZoom/1.6);$('tz-all').onclick=()=>setTlZoom(0);
// pinch on touch screens
(()=>{let d0=0,z0=1;const dist=t=>Math.hypot(t[0].clientX-t[1].clientX,t[0].clientY-t[1].clientY);
 sc.addEventListener('touchstart',e=>{if(e.touches.length===2){d0=dist(e.touches);z0=tlZoom}},{passive:true});
 sc.addEventListener('touchmove',e=>{if(e.touches.length===2&&d0){e.preventDefault();const f=dist(e.touches)/d0;zPending=1;zoomBy(z0*f/tlZoom)}},{passive:false});
 sc.addEventListener('touchend',e=>{if(e.touches.length<2)d0=0},{passive:true})})();

/* play */
let playing=false,lastT=0;
function tick(t){if(!playing)return;if(lastT){const dt=Math.min(60,t-lastT);nudge((rtl()?-1:1)*dt*(fit?0.02:0.085));if(year>=MAXY-0.5)togglePlay(false)}lastT=t;requestAnimationFrame(tick)}
function togglePlay(on){playing=on==null?!playing:on;lastT=0;$('playicon').setAttribute('d',playing?'M7 5h3.5v14H7zM13.5 5H17v14h-3.5z':'M8 5v14l11-7z');$('play').setAttribute('aria-label',playing?L().pause:L().play);if(playing){dismissCoach();if(year>=MAXY-1)scrollToYear(MINY,false);requestAnimationFrame(tick)}}
$('play').onclick=()=>togglePlay();

/* ---------- year & story ---------- */
let flyTimer=0;
function setYear(y,fromScroll){year=Math.max(MINY,Math.min(MAXY,y));const ry=Math.round(year);
 $('yr').textContent=Math.abs(ry);
 const am=amYear(ry);$('yrsub').textContent=(ry<0?L().bce:L().ce)+(am?' · '+(lang==='he'?gem(am):am):'');
 $('pop').innerHTML='';const b=document.createElement('b');b.textContent=fmtPop(interp(D.demography.world,year));$('pop').append(b,document.createTextNode(' '+L().pop));
 $('knob').textContent=ry<0?Math.abs(ry)+(lang==='he'?' לפנה״ס':' BCE'):ry;
 if(fit)placeHead();sc.setAttribute('aria-valuenow',ry);sc.setAttribute('aria-valuetext',fmtYfull(ry));
 const ei=eraAt(year);if(ei!==curEra){curEra=ei;renderStory(fromScroll)}
 drawBorders();drawPoints()}
function renderStory(fromScroll){const e=eras[curEra],s=segs[curEra];
 $('st-ribbon').style.background=`var(--e-${e.color})`;
 $('st-chap').innerHTML='';const bb=document.createElement('b');bb.textContent=L().chap+' '+(curEra+1);$('st-chap').append(bb,document.createTextNode(' '+L().of+' '+eras.length));
 $('st-name').textContent=tx(e.name);$('st-years').textContent=fmtRange(e.start,s.b);$('st-sub').textContent=tx(e.subtitle);$('st-sum').textContent=tx(e.summary);
 const h=$('st-heat');h.innerHTML='';for(let i=1;i<=5;i++){const d=document.createElement('i');if(i<=e.weight)d.className='on';h.appendChild(d)}
 $('st-mh').textContent=L().moments;
 const ms=$('st-moments');ms.innerHTML='';
 D.events.filter(v=>v.year>=e.start&&v.year<s.b).sort((a,b)=>b.importance-a.importance||a.year-b.year).slice(0,3).sort((a,b)=>a.year-b.year).forEach(v=>{
  const b=document.createElement('button');b.className='moment';const gl=document.createElement('span');gl.className='gl';gl.style.background=toneVar[evTone(v.type)];gl.innerHTML=glyphSvg(v.type,16);
  const t=document.createElement('span');t.textContent=tx(v.title);const sm=document.createElement('small');sm.textContent=fmtY(v.year);b.append(gl,t,sm);
  b.onclick=()=>{scrollToYear(v.year,true);select(v,true)};ms.appendChild(b)});
 $('st-prev').disabled=curEra===0;$('st-next').disabled=curEra===eras.length-1;
 tl.selectAll('.tl-era').classed('cur',function(){return +this.dataset.i===curEra});
 if(location.hash.slice(1)!==e.id){try{history.replaceState(null,'','#'+e.id)}catch(_){}}
 }
function goEra(i){const e=eras[i];scrollToYear(e.start+Math.min(3,(segs[i].b-e.start)*0.05),true)}
$('st-prev').onclick=()=>goEra(Math.max(0,curEra-1));$('st-next').onclick=()=>goEra(Math.min(eras.length-1,curEra+1));
$('st-toggle').onclick=()=>{const st=$('story');const o=st.dataset.open!=='true';st.dataset.open=o;$('st-toggle').setAttribute('aria-expanded',o);$('st-toggle').textContent=o?'⌄':'⌃';$('st-toggle').setAttribute('aria-label',o?L().less:L().more)};
$('st-all').onclick=openChapters;

/* chapters overlay */
function openChapters(){const g=$('chgrid');g.innerHTML='';$('ch-h').textContent=L().chapters;$('chapters').dir=rtl()?'rtl':'ltr';
 eras.forEach((e,i)=>{const b=document.createElement('button');b.className='ch';b.setAttribute('aria-current',i===curEra);
  const no=document.createElement('span');no.className='no';no.textContent=L().chap+' '+(i+1);const h=document.createElement('span');h.className='heat';for(let j=1;j<=5;j++){const d=document.createElement('i');if(j<=e.weight)d.className='on';h.appendChild(d)}
  const top=document.createElement('span');top.style.cssText='display:flex;justify-content:space-between;align-items:center';top.append(no,h);
  const nm=document.createElement('b');nm.textContent=tx(e.name);const sm=document.createElement('small');sm.textContent=fmtRange(e.start,segs[i].b);const st=document.createElement('span');st.className='strip';st.style.background=`var(--e-${e.color})`;
  b.append(top,nm,sm,st);b.onclick=()=>{closeOverlay('chapters');goEra(i)};g.appendChild(b)});
 openOverlay('chapters')}
let lastFocus=null;
function openOverlay(id){lastFocus=document.activeElement;$(id).hidden=false;const f=$(id).querySelector('input,button');if(f)f.focus()}
function closeOverlay(id){$(id).hidden=true;if(lastFocus&&lastFocus.focus)lastFocus.focus()}
document.querySelectorAll('.overlay').forEach(o=>{o.addEventListener('click',e=>{if(e.target===o||e.target.closest('[data-close]'))closeOverlay(o.id)})});

/* ---------- detail ---------- */
function el(tag,cls,text){const e=document.createElement(tag);if(cls)e.className=cls;if(text!=null)e.textContent=text;return e}
function select(it,fromTimeline){selected=it;hideTip();const p=$('detail');p.innerHTML='';p.hidden=false;p.dir=rtl()?'rtl':'ltr';
 const col=colorOf(it);const band=el('div','band');band.style.background=`linear-gradient(135deg, color-mix(in srgb, ${col} 85%, #000 0%), color-mix(in srgb, ${col} 55%, var(--paper)))`;
 const av=el('div','avatar');av.style.background=col;if(it.kind==='event')av.innerHTML=glyphSvg(it.type,26);else if(it.kind==='comm')av.innerHTML=glyphSvg('comm',26);else av.textContent=initial(it);
 const x=el('button','x','✕');x.setAttribute('aria-label',L().close);x.onclick=closeDetail;band.append(av,x);p.appendChild(band);
 const hd=el('div','hd');const kindKey=it.kind==='gent'?it.stance:it.kind;
 const kl={comm:L().kComm,person:L().kPerson,event:L().kEvent,ally:L().kAlly,enemy:L().kEnemy,mixed:L().kMixed}[kindKey]+(it.kind==='event'?' · '+L().types[it.type]:'');
 const k1=el('div','kind',kl);k1.style.color=col;hd.append(k1,el('h2',null,tx(it.name||it.title)));
 const tags=el('div','tags');const s=span(it);let when;
 if(it.kind==='event')when=it.endYear>it.year?fmtRange(it.year,it.endYear):fmtYfull(it.year);
 else if(it.kind==='comm')when=fmtY(it.start)+' – '+(it.end==null?L().existing:fmtYfull(it.end));
 else when=(it.born!=null||it.died!=null)?fmtRange(it.born,it.died):fmtRange(s[0],s[1]);
 tags.appendChild(el('span','tag',when));if(it.place)tags.appendChild(el('span','tag',tx(it.place)));
 if(lang==='he'&&it.kind==='event'){const am=amYear(it.year);if(am)tags.appendChild(el('span','tag',gem(am)))}
 if(it.kind==='comm')tags.appendChild(el('span','tag',fmtPop(interp(it.pop,year))));
 hd.appendChild(tags);p.appendChild(hd);
 const b=el('div','body');
 const main=it.bio||it.impact||it.desc||it.note;if(main)b.appendChild(el('p',null,tx(main)));
 if(it.calendar){const c=el('div','cal');c.innerHTML='<svg viewBox="0 0 24 24"><path d="'+G.calendar[1]+'"/></svg>';const d=el('div');d.append(el('b',null,L().calendar),document.createTextNode(tx(it.calendar)));c.appendChild(d);b.appendChild(c)}
 const dl=el('dl','facts');const add=(k,v)=>{if(!v)return;dl.append(el('dt',null,k),el('dd',null,v))};
 if(it.role)add(L().role,tx(it.role));
 if((it.kind==='person'||it.kind==='gent')&&it.active&&(it.active[0]!==it.born||it.active[1]!==it.died))add(L().active,fmtRange(it.active[0],it.active[1]));
 if(it.honor)add(L().honor,tx(it.honor));if(it.peak)add(L().peak,tx(it.peak));if(it.endReason)add(L().endR,tx(it.endReason));
 if(it.traditional)add('ⓘ',L().traditional);if(it.sheet)add('✓',L().sheet);
 if(dl.children.length)b.appendChild(dl);
 if(it.works&&it.works.length){b.appendChild(el('h3',null,L().works));const ul=el('ul','works');it.works.forEach(w=>ul.appendChild(el('li',null,tx(w))));b.appendChild(ul)}
 if(it.kind==='comm'&&it.pop&&it.pop.length>1){b.appendChild(el('h3',null,L().popHist));b.appendChild(spark(it))}
 const ac=el('div','acts2');const g1=el('button','btn pri',L().goTime);g1.onclick=()=>scrollToYear(anchorYear(it),true);
 const g2=el('button','btn',L().showMap);g2.onclick=()=>{lastUserMap=Date.now();flyTo(it.lon,it.lat,4);if(phone())closeDetail(true)};ac.append(g1,g2);b.appendChild(ac);
 p.appendChild(b);
 drawPoints();markSel();x.focus({preventScroll:true})}
function markSel(){tl.selectAll('[data-k]').classed('sel',function(){return !!selected&&this.dataset.k===selected.key})}
function closeDetail(keepSel){if(!keepSel)selected=null;$('detail').hidden=true;drawPoints();markSel()}
function spark(c){const w=320,h=76;const ns='http://www.w3.org/2000/svg';const s=document.createElementNS(ns,'svg');s.setAttribute('viewBox',`0 0 ${w} ${h}`);s.setAttribute('class','spark');s.style.width='100%';
 const pts=c.pop;const x=d3.scaleLinear().domain(d3.extent(pts,d=>d[0])).range(rtl()?[w-30,30]:[30,w-30]);const y=d3.scaleLinear().domain([0,d3.max(pts,d=>d[1])]).range([h-18,10]);
 const p=document.createElementNS(ns,'path');p.setAttribute('d',d3.area().x(d=>x(d[0])).y0(h-18).y1(d=>y(d[1])).curve(d3.curveMonotoneX)(pts));s.appendChild(p);
 const lab=(t,xx,yy)=>{const e=document.createElementNS(ns,'text');e.textContent=t;e.setAttribute('x',xx);e.setAttribute('y',yy);e.setAttribute('text-anchor','middle');s.appendChild(e)};
 lab(fmtY(pts[0][0]),x(pts[0][0]),h-4);lab(fmtY(pts[pts.length-1][0]),x(pts[pts.length-1][0]),h-4);
 const mxp=pts.reduce((a,b)=>b[1]>a[1]?b:a);lab(fmtPop(mxp[1]).replace(L().popU,''),x(mxp[0]),Math.max(10,y(mxp[1])-3));return s}
svg.on('click',()=>{if(selected&&!phone())closeDetail()});

/* ---------- search ---------- */
const q=$('q'),qres=$('qres');let qi=0,qlist=[];
const norm=s=>(s||'').toLowerCase().replace(/[״"׳'\-\s]/g,'');
function runSearch(){const v=norm(q.value);qres.innerHTML='';qi=0;
 if(v.length<2){qlist=[];return}
 qlist=[...ITEMS.values()].filter(it=>{const n=it.name||it.title;return norm(n.he).includes(v)||norm(n.en).includes(v)}).sort((a,b)=>(b.importance||2)-(a.importance||2)).slice(0,10);
 if(!qlist.length){const li=el('li','empty',L().noRes);qres.appendChild(li);return}
 qlist.forEach((it,i)=>{const li=el('li');li.setAttribute('role','option');li.setAttribute('aria-selected',i===0);const sw=el('span','sw');sw.style.background=colorOf(it);
  if(it.kind==='event')sw.innerHTML=glyphSvg(it.type,14);else if(it.kind==='comm')sw.innerHTML=glyphSvg('comm',14);else sw.textContent=initial(it);
  li.append(sw,el('span',null,tx(it.name||it.title)),el('small',null,it.kind==='event'?fmtYfull(it.year):it.kind==='comm'?L().kComm:fmtRange(span(it)[0],span(it)[1])));
  li.onclick=()=>pick(i);qres.appendChild(li)})}
q.addEventListener('input',runSearch);
q.addEventListener('keydown',e=>{const lis=qres.querySelectorAll('li[role=option]');if(e.key==='ArrowDown')qi=Math.min(lis.length-1,qi+1);else if(e.key==='ArrowUp')qi=Math.max(0,qi-1);else if(e.key==='Enter'){if(qlist.length)pick(qi);return}else return;e.preventDefault();lis.forEach((l,i)=>l.setAttribute('aria-selected',i===qi))});
function pick(i){const it=qlist[i];if(!it)return;closeOverlay('search');q.value='';qres.innerHTML='';scrollToYear(anchorYear(it),false);select(it,true)}
$('searchbtn').onclick=()=>{$('search').dir=rtl()?'rtl':'ltr';openOverlay('search')};

/* ---------- keyboard ---------- */
const KEYS=()=>{const he=lang==='he';return [
 [['←','→'],he?'לנוע בזמן (עם Shift: צעד גדול)':'Move through time (Shift: big step)'],
 [['Space'],he?'נגן / עצור':'Play / pause'],
 [['N','P'],he?'הפרק הבא / הקודם':'Next / previous chapter'],
 [['PgDn','PgUp'],he?'הפרק הבא / הקודם':'Next / previous chapter'],
 [['Home','End'],he?'לתחילת ההיסטוריה / להווה':'Start of history / today'],
 [['+','−'],he?'זום בציר הזמן':'Zoom the timeline'],
 [['0'],he?'כל ההיסטוריה בציר':'Whole history on the timeline'],
 [['Shift','+ / −'],he?'זום במפה':'Zoom the map'],
 [['T'],he?'ציר מלא / מקוצר':'Full / compact timeline'],
 [['C'],he?'כל הפרקים':'All chapters'],
 [['/','F'],he?'חיפוש':'Search'],
 [['L'],he?'החלפת שפה':'Switch language'],
 [['Esc'],he?'סגירת חלון או כרטיס':'Close a window or card'],
 [['?'],he?'רשימת הקיצורים':'This list of shortcuts']]};
function openKeys(){const b=$('keysbox');b.innerHTML='';b.dir=rtl()?'rtl':'ltr';
 const sh=el('div','sh');sh.append(el('h2',null,lang==='he'?'קיצורי מקלדת':'Keyboard shortcuts'));const x=el('button','ibtn','✕');x.setAttribute('data-close','');x.setAttribute('aria-label',L().close);sh.appendChild(x);b.appendChild(sh);
 const dl=el('dl','keys');KEYS().forEach(([ks,d])=>{const dt=el('dt');ks.forEach(k=>dt.appendChild(el('kbd',null,k)));dl.append(dt,el('dd',null,d))});b.appendChild(dl);openOverlay('keys')}
$('keysbtn').onclick=openKeys;
addEventListener('keydown',e=>{
 const tag=(e.target.tagName||'');const typing=tag==='INPUT'||tag==='TEXTAREA'||e.target.isContentEditable;
 const ovOpen=[...document.querySelectorAll('.overlay')].some(o=>!o.hidden);
 if(e.key==='Escape'){const o=[...document.querySelectorAll('.overlay')].find(o=>!o.hidden);if(o)closeOverlay(o.id);else if(selected)closeDetail();return}
 if(typing||ovOpen||e.metaKey||e.ctrlKey||e.altKey)return;
 const step=(e.shiftKey?240:40);const c=e.code,k=e.key;let done=true;
 if(k==='ArrowRight')nudge(step);
 else if(k==='ArrowLeft')nudge(-step);
 else if(c==='Space'){if(tag==='BUTTON')return;togglePlay()}
 else if(c==='KeyN'||k==='PageDown')goEra(Math.min(eras.length-1,curEra+1));
 else if(c==='KeyP'||k==='PageUp')goEra(Math.max(0,curEra-1));
 else if(k==='Home')scrollToYear(MINY,true);
 else if(k==='End')scrollToYear(MAXY,true);
 else if(e.shiftKey&&(c==='Equal'||c==='NumpadAdd'))svg.transition().duration(250).call(zoom.scaleBy,1.6);
 else if(e.shiftKey&&(c==='Minus'||c==='NumpadSubtract'))svg.transition().duration(250).call(zoom.scaleBy,1/1.6);
 else if(c==='Equal'||c==='NumpadAdd'||k==='+')setTlZoom(tlZoom*1.6);
 else if(c==='Minus'||c==='NumpadSubtract')setTlZoom(tlZoom/1.6);
 else if(c==='Digit0'||c==='Numpad0')setTlZoom(0);
 else if(c==='KeyT')setOpen(!open);
 else if(c==='KeyC')openChapters();
 else if(c==='Slash'&&e.shiftKey||k==='?')openKeys();
 else if(c==='Slash'||c==='KeyF')$('searchbtn').click();
 else if(c==='KeyL')$('langbtn').click();
 else done=false;
 if(done){e.preventDefault();dismissCoach()}});

/* ---------- about ---------- */
function openAbout(){const b=$('aboutbox');b.innerHTML='';b.dir=rtl()?'rtl':'ltr';const he=lang==='he';
 const sh=el('div','sh');sh.append(el('h2',null,L().title));const x=el('button','ibtn','✕');x.setAttribute('data-close','');x.setAttribute('aria-label',L().close);sh.appendChild(x);b.appendChild(sh);
 b.appendChild(el('p',null,he?'מסע בתולדות העם היהודי: מפה וציר זמן שזזים יחד. הציר לא אחיד בכוונה. תקופות צפופות כמו גירוש ספרד או השואה מקבלות יותר מקום מתקופות ארוכות ושקטות. במצב "זמן אחיד" רואים את הפרופורציות האמיתיות.':'A journey through Jewish history: a map and a timeline that move together. Time is uneven on purpose. Dense periods such as the Expulsion from Spain or the Holocaust get more room than long, quiet stretches. "Even time" shows true proportions.'));
 b.appendChild(el('h3',null,he?'איך משחקים':'How it works'));const ul=el('ul');
 (he?['גררו את הציר למטה, או לחצו ▶ ותנו לזמן לזרום.','כל תקופה היא פרק. הנקודות הזהובות מראות כמה הוא סוער.','לחצו על כל עיגול במפה או בציר כדי להכיר את הסיפור.','הכפתורים בתחתית המפה מסננים מה רואים, וגם סופרים כמה יש עכשיו.','לחצו ? כדי לראות את כל קיצורי המקלדת.']:['Drag the timeline below, or press ▶ and let time flow.','Each era is a chapter. The gold dots show how turbulent it was.','Tap any circle on the map or timeline to hear its story.','The buttons at the bottom of the map filter what you see and count what is there now.','Press ? to see all keyboard shortcuts.']).forEach(t=>ul.appendChild(el('li',null,t)));b.appendChild(ul);
 b.appendChild(el('h3',null,he?'מקורות':'Sources'));const src=el('ul');
 const link=(t,u,rest)=>{const li=el('li');const a=el('a',null,t);a.href=u;a.target='_blank';a.rel='noopener';li.appendChild(a);if(rest)li.appendChild(document.createTextNode(' · '+rest));src.appendChild(li)};
 link('OldMapsOnline · History','https://www.oldmapsonline.org/en/history',he?'השראה':'inspiration');
 link('historical-basemaps (A. Ourednik)','https://github.com/aourednik/historical-basemaps',he?'גבולות היסטוריים, GPL-3.0':'historical borders, GPL-3.0');
 link('Natural Earth / world-atlas','https://github.com/topojson/world-atlas',he?'קווי חוף':'coastlines');
 link('עודידע · Odyeda','https://www.odyeda.com/he/',he?'ציר זמן, דמוגרפיה, ריבונות':'timeline, demography, sovereignty');
 (D.demography.sources||[]).forEach(s=>{if(s.url&&!/odyeda/.test(s.url))link(tx(s),s.url)});b.appendChild(src);
 b.appendChild(el('p',null,he?'מספרי האוכלוסייה, בעיקר לפני 1800, הם הערכות גסות. תאריכי התקופה המקראית משוערים או מסורתיים ומסומנים ככאלה. הגבולות מקורבים ומתחלפים לפי שנות מפה קבועות.':'Population figures, especially before 1800, are rough estimates. Biblical-era dates are approximate or traditional and are marked so. Borders are approximate and change between fixed map years.'));
 openOverlay('about')}
$('aboutbtn').onclick=openAbout;

/* ---------- coach ---------- */
function showCoach(){if(store.get('coached',false))return;$('coach-t').textContent=L().coach;$('coach-b').textContent=L().coachOk;$('coach').hidden=false}
function dismissCoach(){if($('coach').hidden)return;$('coach').hidden=true;store.set('coached',true)}
$('coach-b').onclick=()=>{dismissCoach();togglePlay(true)};
addEventListener('pointerdown',e=>{if(!e.target.closest('#coach'))dismissCoach()},true);

/* ---------- language ---------- */
function applyLang(){const u=L();document.documentElement.lang=lang;document.documentElement.dir=rtl()?'rtl':'ltr';document.title=u.title;
 $('t-title').textContent=u.title;$('langbtn').textContent=lang==='he'?'EN':'עב';$('langbtn').setAttribute('aria-label',u.lang);
 $('searchbtn').setAttribute('aria-label',u.search);$('aboutbtn').setAttribute('aria-label',u.about);$('keysbtn').setAttribute('aria-label',lang==='he'?'קיצורי מקלדת':'Keyboard shortcuts');$('keysbtn').title=lang==='he'?'קיצורי מקלדת (?)':'Keyboard shortcuts (?)';$('q').placeholder=u.search;$('q').setAttribute('aria-label',u.search);
 $('tz-in').setAttribute('aria-label',u.zin);$('tz-in').title=u.zin;$('tz-out').setAttribute('aria-label',u.zout);$('tz-out').title=u.zout;$('tz-all').textContent=u.zall;$('s-weighted').textContent=u.weighted;$('s-linear').textContent=u.linear;$('exptxt').textContent=open?u.collapse:u.expand;
 $('play').setAttribute('aria-label',playing?u.pause:u.play);$('st-all').textContent=u.all+(rtl()?' ←':' →');
 $('st-prev').textContent=rtl()?'›':'‹';$('st-next').textContent=rtl()?'‹':'›';$('st-prev').setAttribute('aria-label',u.prev);$('st-next').setAttribute('aria-label',u.next);
 $('st-toggle').setAttribute('aria-label',$('story').dataset.open==='true'?u.less:u.more);
 $('map').setAttribute('aria-label',lang==='he'?'מפת העולם בשנה הנבחרת':'World map for the selected year');
 if(!$('coach').hidden){$('coach-t').textContent=u.coach;$('coach-b').textContent=u.coachOk}
 buildCounts();curEra=-1;lastSnap=null;gPts.selectAll('*').remove();renderTimeline();if(selected)select(selected,false)}
$('langbtn').onclick=()=>{lang=lang==='he'?'en':'he';store.set('lang',lang);applyLang()};

/* ---------- boot ---------- */
function boot(){
 if(!phone())$('story').dataset.open='true';
 const h=location.hash.slice(1);const ei=eras.findIndex(e=>e.id===h);
 year=ei>=0?eras[ei].start+Math.min(3,(segs[ei].b-eras[ei].start)*0.05):1492;
 syncSeg();$('dock').dataset.open=open;
 sizeMap();applyLang();
 flyTo(28,38,3.2,0);
 lastUserMap=Date.now()-4000;
 showCoach();
 addEventListener('hashchange',()=>{const i=eras.findIndex(e=>e.id===location.hash.slice(1));if(i>=0&&i!==curEra)goEra(i)});
 let lastWH='';try{new ResizeObserver(()=>{const r=$('stage').getBoundingClientRect();const wh=Math.round(r.width)+'x'+Math.round(r.height);if(wh===lastWH||r.width<50)return;lastWH=wh;
  const t=d3.zoomTransform(svg.node());const c=proj.invert(t.invert([mw/2,mh/2]));sizeMap();if(c){const p=proj(c);svg.call(zoom.transform,d3.zoomIdentity.translate(mw/2,mh/2).scale(t.k).translate(-p[0],-p[1]))}}).observe($('stage'))}catch(_){}
 let rt;addEventListener('resize',()=>{clearTimeout(rt);rt=setTimeout(()=>{const y=year;renderTimeline();scrollToYear(y,false)},150)});
}
boot();
})();
