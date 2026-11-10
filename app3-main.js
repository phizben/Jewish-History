
/* ---------- extra strings ---------- */
Object.assign(T.he,{inYear:'בשנת',now:'מה קורה עכשיו',events:'אירועים',people:'דמויות יהודיות',ally:'ידידים',enemy:'צוררים',mixed:'דמויות מורכבות',comm:'קהילות גדולות',
 showAll:n=>`הצג את כולם (${n})`,showLess:'הצג פחות',nothing:'אין כאן פריטים בשנה הזו',back:'חזרה ל',hide:'הסתר מהמפה',show:'הצג במפה',
 rabbi:'בהלכה',rulers:'בארץ ישראל',help:'עזרה ומקלדת',full:'כל הדמויות',suggest:'דמויות בולטות',fullOff:'חזרה למפה',hintT:'גררו את ציר הזמן (או ▶) כדי לשנות את העולם · הקישו על נקודה ללמוד עוד · ונסו את "מה הסיפור?"',hintB:'הבנתי',
 lgEv:'אירוע',lgJ:'דמות יהודית',lgA:'ידיד',lgE:'צורר',open:'פתח',close2:'סגור',lgCen:'מרכזי חיים',heatT:'מרכזי החיים היהודיים (משוער, יחסי)',edgeTip:'מרכז מחוץ לתצוגה · לחצו למעבר',lgLayers:'שכבות',lgMarkers:'דמויות ואירועים'});
Object.assign(T.en,{inYear:'In',now:'What is happening now',events:'Events',people:'Jewish figures',ally:'Allies',enemy:'Persecutors',mixed:'Mixed legacy',comm:'Major communities',
 showAll:n=>`Show all (${n})`,showLess:'Show less',nothing:'Nothing here this year',back:'Back to ',hide:'Hide from map',show:'Show on map',
 rabbi:'Rabbinic era',rulers:'Land of Israel',help:'Help & keys',full:'All figures',suggest:'Notable figures',fullOff:'Back to map',hintT:'Drag the timeline (or ▶) to change the world · tap a dot to learn more · and try "What’s the Story?"',hintB:'Got it',
 lgEv:'Event',lgJ:'Jewish figure',lgA:'Ally',lgE:'Persecutor',open:'Open',close2:'Close',lgCen:'Centers of life',heatT:'Centers of Jewish life (approximate, relative)',edgeTip:'Off-screen center · click to go there',lgLayers:'Layers',lgMarkers:'Figures & events'});
linear=false;

/* ---------- state ---------- */
let year=1492,curEra=-1,selected=null,hovered=null,full=store.get('full3',false);
const layers=Object.assign({comm:true,people:true,ally:true,enemy:true,mixed:true,events:true},store.get('layers3',{}));
const expanded={};
const GROUPS=['events','people','ally','enemy','mixed'];
const groupColor={events:'var(--neutral)',people:'var(--brand)',ally:'var(--ally)',enemy:'var(--enemy)',mixed:'var(--mixed)',comm:'var(--gold)'};

/* ---------- map ---------- */
const svg=d3.select('#map');
const proj=d3.geoNaturalEarth1();const gpath=d3.geoPath(proj);
// console-skin glow filter (shared id used by CSS filter:url(#glow))
function ensureGlow(sel){if(sel.select('defs#fx').size())return;const d=sel.insert('defs',':first-child').attr('id','fx');const f=d.append('filter').attr('id','glow').attr('x','-80%').attr('y','-80%').attr('width','260%').attr('height','260%');f.append('feGaussianBlur').attr('stdDeviation','2.6').attr('result','b');const m=f.append('feMerge');m.append('feMergeNode').attr('in','b');m.append('feMergeNode').attr('in','SourceGraphic')}
ensureGlow(svg);
const graticule=d3.geoGraticule().step([10,10]);
const root=svg.append('g');
const gSphere=root.append('path').attr('class','sphere');
const gLand=root.append('g'),gHeat=root.append('g').attr('class','heatlayer'),gHL=root.append('g').attr('class','heatlabels'),gPoly=root.append('g'),gPL=root.append('g'),gOvl=root.append('g'),gPts=root.append('g');
(function(){const d=svg.select('defs#fx').empty()?svg.append('defs').attr('id','fx'):svg.select('defs#fx');
 const rg=d.append('radialGradient').attr('id','heatgrad');
 rg.append('stop').attr('offset','0%').attr('stop-color','var(--gold)').attr('stop-opacity',.62);
 rg.append('stop').attr('offset','45%').attr('stop-color','var(--gold)').attr('stop-opacity',.2);
 rg.append('stop').attr('offset','100%').attr('stop-color','var(--gold)').attr('stop-opacity',0)})();
let heatOn=store.get('heat3',true);
const gEdge=svg.append('g').attr('class','edgelayer');
const land=topojson.feature(LAND,LAND.objects.land);
let k=1,mw=800,mh=500;
const zoom=d3.zoom().scaleExtent([1,60]).on('zoom',ev=>{root.attr('transform',ev.transform);if(Math.abs(ev.transform.k-k)>1e-3){k=ev.transform.k;rescale()}drawEdgeT()}).on('end',()=>{placeLabels();drawPoints();drawEdge()});
svg.call(zoom).on('dblclick.zoom',null);
const SNAPS=Object.keys(MAPS).map(Number).sort((a,b)=>a-b);
const polyCache=new Map();let lastSnap=null;
const GENERIC=/hunter|gatherer|nomad|farmers|culture|peoples|pastoral|foraging|herders|tribes$|fishers/i;
function sizeMap(){const r=$('mapwrap').getBoundingClientRect();mw=Math.max(200,r.width);mh=Math.max(150,r.height);svg.attr('viewBox',`0 0 ${mw} ${mh}`);
 proj.fitExtent([[4,4],[mw-4,mh-4]],{type:'Sphere'});gSphere.attr('d',gpath({type:'Sphere'}));
 gLand.selectAll('path.landbase').data([land]).join('path').attr('class','landbase').attr('d',gpath);
 gLand.selectAll('path.graticule').data([graticule()]).join(e=>e.insert('path','.landbase').attr('class','graticule')).attr('d',gpath);
 zoom.translateExtent([[-mw*.3,-mh*.3],[mw*1.3,mh*1.3]]);polyCache.clear();lastSnap=null;drawBorders(true);drawCenters();drawPoints();drawEdge()}
function snapFor(y){let s=SNAPS[0];for(const v of SNAPS){if(v<=y)s=v;else break}return s}
function snapFeatures(s){if(polyCache.has(s))return polyCache.get(s);const t=MAPS[s];const o=t.objects[Object.keys(t.objects)[0]];
 const fs=topojson.feature(t,o).features.filter(f=>f.geometry);
 fs.forEach(f=>{let n=f.properties.NAME||'';if(n==='Israel'&&s<1948)n='Mandatory Palestine (GB)';if(n==='Kingdom of David and Solomon'){if(s<=-1500)n='Canaan';else if(s>=-700)n='Kingdom of Judah'}f.n=n;f.cls=GENERIC.test(n)?'pn':'';
  let best=null,ba=0;const polys=f.geometry.type==='MultiPolygon'?f.geometry.coordinates:[f.geometry.coordinates];
  polys.forEach(p=>{const g={type:'Polygon',coordinates:p};const a=gpath.area(g);if(a>ba){ba=a;best=g}});f.area=ba;f.best=best;f.c=best?gpath.centroid(best):[0,0];f.gbb=d3.geoBounds(f);f.d=gpath(f)});
 polyCache.set(s,fs);return fs}
const PN=D.extras.polities;
function polyName(n){if(lang==='he')return PN[n]||null;return n.replace(/\s*\((GB|France|UK)\)$/,'')}
function drawBorders(force){const s=snapFor(year);
 if(s!==lastSnap||force){lastSnap=s;const fs=snapFeatures(s);
  gPoly.selectAll('path').data(fs,f=>f.n).join('path').attr('class',f=>'poly '+f.cls).attr('d',f=>f.d);placeLabels()}
 const ov=D.extras.overlays.filter(o=>year>=o.start&&year<=o.end);
 gOvl.selectAll('g').data(ov,o=>o.en).join(en=>{const g=en.append('g');g.append('path');g.append('text').attr('class','olabel');return g})
  .each(function(o){const g=d3.select(this);let poly={type:'Polygon',coordinates:[o.poly.concat([o.poly[0]])]};if(d3.geoArea(poly)>2*Math.PI)poly={type:'Polygon',coordinates:[o.poly.concat([o.poly[0]]).reverse()]};
   g.select('path').attr('class','ovl'+(o.kind==='influence'?' inf':'')).attr('d',gpath(poly));
   const c=o.kind==='influence'?proj([37.4,34.6]):gpath.centroid(poly);g.select('text').classed('inf',o.kind==='influence').attr('x',c[0]).attr('y',c[1]).text(tx(o))});
 rescale()}
function placeLabels(){if(lastSnap==null)return;const fs=polyCache.get(lastSnap)||[];const fsz=11.5/k;
 const named=fs.filter(f=>f.cls!=='pn'&&polyName(f.n));
 // which polities contain a marker shown right now → those are the relevant ones
 const marks=gPts.selectAll('g.mk').data();const rel=new Map();
 const inBox=(f,lon,lat,m)=>{const bb=f.gbb;return bb&&lon>=bb[0][0]-m&&lon<=bb[1][0]+m&&lat>=bb[0][1]-m&&lat<=bb[1][1]+m};
 marks.forEach(d=>{const lon=d.lon,lat=d.lat;let hit=null,hb=Infinity;
  for(const f of named){if(!inBox(f,lon,lat,1))continue;if(d3.geoContains(f,[lon,lat])&&f.area<hb){hit=f;hb=f.area}}
  if(!hit){hb=Infinity;for(const f of named){if(inBox(f,lon,lat,0)&&f.area<hb){hit=f;hb=f.area}}}
  if(hit){let a=rel.get(hit);if(!a){a=[];rel.set(hit,a)}a.push([lon,lat])}});
 // label each relevant polity next to the figures that sit in it (not at the country centroid)
 const cand=[...rel.keys()].sort((a,b)=>rel.get(b).length-rel.get(a).length||b.area-a.area).slice(0,16);
 const placed=[],out=[];
 for(const f of cand){const ps=rel.get(f);const mlon=d3.mean(ps,q=>q[0]),mlat=d3.mean(ps,q=>q[1]);const sp=proj([mlon,mlat]);if(!sp)continue;
  const c=[sp[0],sp[1]+16/k];if(!(c[0]>4&&c[0]<mw-4&&c[1]>4&&c[1]<mh-4))continue;
  const nm=polyName(f.n);const w=nm.length*fsz*0.62,h=fsz*1.5;const bb=[c[0]-w/2,c[1]-h/2,c[0]+w/2,c[1]+h/2];
  if(placed.some(p=>!(bb[2]<p[0]||bb[0]>p[2]||bb[3]<p[1]||bb[1]>p[3])))continue;placed.push(bb);f._lc=c;out.push(f)}
 gPL.selectAll('text').data(out,f=>f.n).join('text').attr('class','plabel').attr('x',f=>f._lc[0]).attr('y',f=>f._lc[1]).attr('font-size',fsz).text(f=>polyName(f.n))}

/* what is "now": items active within a window around the year */
function windowYears(){return Math.max(2,Math.min(120,yearsPerPx(year)*60))}
function nowItems(){const w=windowYears();const ov=(a,b)=>a<=year+w&&b>=year-w;const out={events:[],people:[],ally:[],enemy:[],mixed:[]};
 D.events.forEach(e=>{if(ov(e.year,e.endYear))out.events.push(e)});
 D.people.forEach(p=>{const s=span(p);if(s[0]!=null&&ov(s[0],s[1]??s[0]))out.people.push(p)});
 D.gentiles.forEach(g=>{const s=span(g);if(s[0]!=null&&ov(s[0],s[1]??s[0]))out[g.stance].push(g)});
 out.events.sort((a,b)=>Math.abs(a.year-year)-Math.abs(b.year-year)||b.importance-a.importance);
 ['people','ally','enemy','mixed'].forEach(g=>out[g].sort((a,b)=>b.importance-a.importance||span(a)[0]-span(b)[0]));
 return out}
let NOW=nowItems();
const commR=c=>2.2+Math.min(8,Math.sqrt(Math.max(0,interp(c.pop,year)))/45);
const measure=document.createElement('canvas').getContext('2d');
function tw(s,size,weight){measure.font=`${weight||500} ${size||12}px Rubik,Arial`;return measure.measureText(s).width}
const majorNow=d=>d.kind==='event'?d.importance>=3&&Math.abs(d.year-year)<=Math.max(1,yearsPerPx(year)*25):d.kind!=='comm'&&d.importance>=3;
function drawPoints(){
 const items=[];GROUPS.forEach(g=>{if(layers[g])NOW[g].forEach(it=>items.push(it))});
 const order={comm:0,person:1,gent:1,event:2};items.sort((a,b)=>order[a.kind]-order[b.kind]);
 const sel=gPts.selectAll('g.mk').data(items,d=>d.key);sel.exit().remove();
 const en=sel.enter().append('g').attr('class',d=>'mk '+d.kind+(d.kind==='gent'?' '+d.stance:'')+(d.kind==='event'?' t-'+evTone(d.type):''))
  .on('click',(e,d)=>{e.stopPropagation();select(d)})
  .on('pointerenter',(e,d)=>{setHover(d);showTip(e,tx(d.name||d.title),tipSub(d))}).on('pointermove',moveTip).on('pointerleave',()=>{setHover(null);hideTip()});
 en.each(function(d){const g=d3.select(this);g.append('circle').attr('class','ring');g.append('circle').attr('class','m');const p=g.append('g').attr('class','pill');p.append('rect');p.append('text')});
 const m=en.merge(sel);
 m.each(function(d){d._xy=proj([d.lon,d.lat])||[0,0];const r=d.kind==='comm'?commR(d):d.kind==='event'?6:5;d._r=r;const g=d3.select(this);g.select('.m').attr('r',r);g.select('.ring').attr('r',r+5)});
 // labels: only a few majors, without collisions
 const boxes=[];const lab=new Set();
 items.filter(d=>d===selected||majorNow(d)).sort((a,b)=>(b===selected)-(a===selected)||(b.importance||0)-(a.importance||0)||(b.kind==='event')-(a.kind==='event')).forEach(d=>{const t=tx(d.name||d.title);const w=tw(t,12,600)+16;const sx=d._xy[0]*k,sy=d._xy[1]*k;const x0=rtl()?sx-d._r-6-w:sx+d._r+6;const bb=[x0,sy-10,x0+w,sy+10];
  if(d!==selected&&boxes.some(b=>!(bb[2]<b[0]||bb[0]>b[2]||bb[3]<b[1]||bb[1]>b[3])))return;boxes.push(bb);lab.add(d)});
 m.classed('lab',d=>lab.has(d)).classed('sel',d=>d===selected).classed('hl',d=>d===hovered).classed('minor',d=>!(lab.has(d)||d===selected));
 m.each(function(d){if(lab.has(d)||d===selected)return;const base=d.kind==='comm'?commR(d):d.kind==='event'?6:5;d._r=base*0.6;const g=d3.select(this);g.select('.m').attr('r',d._r);g.select('.ring').attr('r',d._r+5)});
 m.each(function(d){const p=d3.select(this).select('.pill');const t=tx(d.name||d.title);const w=tw(t,12,600)+16;const x=rtl()?-d._r-6-w:d._r+6;
  p.select('rect').attr('x',x).attr('y',-10).attr('width',w).attr('height',20).attr('rx',10);p.select('text').attr('x',rtl()?x+w-8:x+8).attr('y',0).attr('text-anchor',rtl()?'end':'start').text(t)});
 m.filter(d=>d===selected||d===hovered).raise();
 rescale()}
function tipSub(d){if(d.kind==='event')return fmtYfull(d.year)+' · '+tx(d.place);if(d.kind==='comm')return fmtPop(interp(d.pop,year));const s=span(d);return tx(d.role)+' · '+fmtRange(d.born??s[0],d.died??s[1])}
let rsq=0;function rescale(){if(rsq)return;rsq=requestAnimationFrame(()=>{rsq=0;const ik=1/k;
 gPts.selectAll('g.mk').attr('transform',d=>`translate(${d._xy[0]},${d._xy[1]}) scale(${ik})`);
 gOvl.selectAll('text').attr('font-size',14/k).style('stroke-width',(3.5/k)+'px');
 gHL.selectAll('text.heatlabel').attr('font-size',(12.5/k)+'px').style('stroke-width',(3/k)+'px')})}
function setHover(d){if(hovered===d)return;hovered=d;gPts.selectAll('g.mk').classed('hl',x=>x===d);gPts.selectAll('g.mk').filter(x=>x===d).raise();
 document.querySelectorAll('#list .item').forEach(b=>b.classList.toggle('hl',!!d&&b.dataset.k===d.key));tl.selectAll('.bead').classed('hl',function(){return !!d&&this.dataset.k===d.key})}
function centerOn(lon,lat){const p=proj([lon,lat]);if(!p)return;const t=d3.zoomTransform(svg.node());const kk=Math.max(t.k,3);
 svg.transition().duration(reduceMotion()?0:700).call(zoom.transform,d3.zoomIdentity.translate(mw/2,mh/2).scale(kk).translate(-p[0],-p[1]))}
$('zin').onclick=()=>svg.transition().duration(250).call(zoom.scaleBy,1.6);
$('zout').onclick=()=>svg.transition().duration(250).call(zoom.scaleBy,1/1.6);
svg.on('click',()=>{if(selected)closeDetail()});

/* tooltip */
const tip=$('tip');
function showTip(e,a,b){if(e.pointerType==='touch')return;tip.innerHTML='';const s=document.createElement('div');s.textContent=a;s.style.fontWeight=600;tip.appendChild(s);if(b){const sm=document.createElement('small');sm.textContent=b;tip.appendChild(sm)}tip.dir=rtl()?'rtl':'ltr';tip.hidden=false;moveTip(e)}
function moveTip(e){const w=tip.offsetWidth,h=tip.offsetHeight;let x=e.clientX+14;if(x+w>innerWidth-8)x=e.clientX-w-14;x=Math.max(8,x);let y=e.clientY+16;const inDock=e.target&&e.target.closest&&e.target.closest('.dock');if(inDock||y+h>innerHeight-8)y=e.clientY-h-14;y=Math.max(8,y);tip.style.left=x+'px';tip.style.top=y+'px'}
function hideTip(){tip.hidden=true}

/* ---------- panel ---------- */
function el(tag,cls,text){const e=document.createElement(tag);if(cls)e.className=cls;if(text!=null)e.textContent=text;return e}
const ICON={prev:'<svg viewBox="0 0 24 24"><path d="M15 6l-6 6 6 6"/></svg>',next:'<svg viewBox="0 0 24 24"><path d="M9 6l6 6-6 6"/></svg>',eye:'<svg viewBox="0 0 24 24"><path d="M2.5 12s3.5-6.5 9.5-6.5S21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="2.8"/></svg>',eyeOff:'<svg viewBox="0 0 24 24"><path d="M3 3l18 18M10.6 5.6A9.9 9.9 0 0 1 12 5.5c6 0 9.5 6.5 9.5 6.5a17 17 0 0 1-3 3.8M6.2 7.4A16.6 16.6 0 0 0 2.5 12s3.5 6.5 9.5 6.5c1.6 0 3-.4 4.3-1"/></svg>'};
function renderChapter(){const e=eras[curEra],s=segs[curEra];
 $('c-ribbon').style.background=`var(--e-${e.color})`;
 $('c-no').innerHTML='';const b=el('b',null,L().chap+' '+(curEra+1));$('c-no').append(b,document.createTextNode(' '+L().of+' '+eras.length));
 $('c-name').textContent=tx(e.name);$('c-yrs').textContent=fmtRange(e.start,s.b);$('c-sum').textContent=tx(e.summary);
 $('chap').dataset.more='false';$('c-more').textContent=lang==='he'?'קרא עוד':'Read more';
 $('c-prev').disabled=curEra===0;$('c-next').disabled=curEra===eras.length-1;
 tl.selectAll('.tl-era').classed('cur',function(){return +this.dataset.i===curEra});
 if(location.hash.slice(1)!==e.id){try{history.replaceState(null,'','#'+e.id)}catch(_){}}}
function renderCtx(){
 const box=$('c-ctx');if(!box)return;box.innerHTML='';
 const y=Math.round(year),he=lang==='he';
 const ru=(D.extras.rulers||[]).find(r=>y>=r.start&&y<=r.end);
 const rb=(D.extras.rabbinic||[]).find(r=>y>=r.start&&y<=r.end);
 if(ru){const s=el('span');const d=el('i','sdot');d.style.background=ru.kind==='jewish'?'var(--brand)':'var(--muted)';s.append(d,document.createTextNode(L().rulers+' '),el('b',null,tx(ru)));s.title=ru.kind==='jewish'?(he?'ריבונות יהודית':'Jewish sovereignty'):(he?'שלטון זר':'Foreign rule');box.appendChild(s)}
 if(rb){const s=el('span');s.append(document.createTextNode(L().rabbi+' '),el('b',null,tx(rb)));box.appendChild(s)}
}
function itemRow(it){const b=el('button','item'+(majorNow(it)?' major':''));b.dataset.k=it.key;
 const sub=it.kind==='event'?fmtY(it.year):it.kind==='comm'?fmtPop(interp(it.pop,year)).replace(L().popU,''):fmtRange(span(it)[0],span(it)[1]);
 b.append(el('span',null,tx(it.name||it.title)),el('small',null,sub));
 b.onclick=()=>select(it);b.onmouseenter=()=>setHover(it);b.onmouseleave=()=>setHover(null);b.onfocus=()=>setHover(it);b.onblur=()=>setHover(null);
 const li=el('li');li.appendChild(b);return li}
function renderList(){const L0=L();const box=$('list');const st=box.scrollTop;box.innerHTML='';
 const h=el('h3',null,L0.inYear+' '+fmtYfull(Math.round(year)));box.appendChild(h);
 GROUPS.forEach(g=>{const arr=NOW[g];if(!arr.length&&(g==='mixed'||g==='comm'))return;
  const grp=el('div','grp');grp.dataset.off=!layers[g];
  const hd=el('button','ghead');hd.setAttribute('aria-pressed',layers[g]);hd.title=layers[g]?L0.hide:L0.show;
  const dot=el('span','dot');dot.style.background=groupColor[g];if(g==='events'){dot.style.background='transparent';dot.style.border='2.5px solid var(--neutral)';dot.style.boxSizing='border-box'}
  const eye=el('span','eye');eye.innerHTML=layers[g]?ICON.eye:ICON.eyeOff;
  hd.append(dot,el('span','t',L0[g]),el('span','c',String(arr.length)),eye);
  hd.onclick=()=>{layers[g]=!layers[g];store.set('layers3',layers);drawPoints();renderTimeline();renderList()};
  grp.appendChild(hd);
  if(layers[g]){const ul=el('ul');const lim=expanded[g]?arr.length:(g==='comm'?4:5);
   if(!arr.length)grp.appendChild(el('div','empty',L0.nothing));
   arr.slice(0,lim).forEach(it=>ul.appendChild(itemRow(it)));grp.appendChild(ul);
   if(arr.length>(g==='comm'?4:5)){const m=el('button','showall',expanded[g]?L0.showLess:L0.showAll(arr.length));m.onclick=()=>{expanded[g]=!expanded[g];renderList()};grp.appendChild(m)}}
  box.appendChild(grp)});
 box.scrollTop=st}
$('c-prev').onclick=()=>goEra(Math.max(0,curEra-1));$('c-next').onclick=()=>goEra(Math.min(eras.length-1,curEra+1));
$('c-more').onclick=()=>{const c=$('chap');const m=c.dataset.more!=='true';c.dataset.more=m;$('c-more').textContent=m?(lang==='he'?'פחות':'Less'):(lang==='he'?'קרא עוד':'Read more')};
$('c-all').onclick=openChapters;
$('c-sheet').onclick=()=>setSheet($('panel').dataset.open!=='true');
function setSheet(o){$('panel').dataset.open=o;$('main').classList.toggle('sheet-open',!!o&&phone());$('c-sheet').setAttribute('aria-expanded',o);$('c-sheet').innerHTML=o?'<svg viewBox="0 0 24 24"><path d="M6 9l6 6 6-6"/></svg>':'<svg viewBox="0 0 24 24"><path d="M6 15l6-6 6 6"/></svg>';$('c-sheet').setAttribute('aria-label',o?L().close2:L().open)}

/* detail lives inside the panel */
function select(it){selected=it;hideTip();const p=$('detail');p.innerHTML='';p.hidden=false;p.dir=rtl()?'rtl':'ltr';if(phone())setSheet(true);
 const bar=el('div','bar');const bk=el('button','back');bk.innerHTML=(rtl()?ICON.next:ICON.prev);bk.appendChild(document.createTextNode(L().back+tx(eras[curEra].name)));bk.onclick=closeDetail;bar.appendChild(bk);p.appendChild(bar);
 const s=el('div','scroll');const kindKey=it.kind==='gent'?it.stance:it.kind;const col=colorOf(it);
 const kl={comm:L().kComm,person:L().kPerson,event:L().kEvent,ally:L().kAlly,enemy:L().kEnemy,mixed:L().kMixed}[kindKey]+(it.kind==='event'?' · '+L().types[it.type]:'');
 const kd=el('div','kind');const i=el('i');i.style.background=col;kd.append(i,el('span',null,kl));kd.style.color=col;s.append(kd,el('h2',null,tx(it.name||it.title)));
 const tags=el('div','tags');const sp=span(it);let when;
 if(it.kind==='event')when=it.endYear>it.year?fmtRange(it.year,it.endYear):fmtYfull(it.year);
 else if(it.kind==='comm')when=fmtY(it.start)+' – '+(it.end==null?L().existing:fmtYfull(it.end));
 else when=(it.born!=null||it.died!=null)?fmtRange(it.born,it.died):fmtRange(sp[0],sp[1]);
 tags.appendChild(el('span','tag',when));if(it.place)tags.appendChild(el('span','tag',tx(it.place)));
 if(lang==='he'&&it.kind==='event'){const am=amYear(it.year);if(am)tags.appendChild(el('span','tag',gem(am)))}
 s.appendChild(tags);
 const main=it.bio||it.impact||it.desc||it.note;if(main)s.appendChild(el('p',null,tx(main)));
 if(it.calendar){const c=el('div','cal');c.innerHTML='<svg viewBox="0 0 24 24"><path d="'+G.calendar[1]+'"/></svg>';const d=el('div');d.append(el('b',null,L().calendar),document.createTextNode(tx(it.calendar)));c.appendChild(d);s.appendChild(c)}
 const dl=el('dl','facts');const add=(k,v)=>{if(!v)return;dl.append(el('dt',null,k),el('dd',null,v))};
 if(it.role)add(L().role,tx(it.role));
 if((it.kind==='person'||it.kind==='gent')&&it.active&&(it.active[0]!==it.born||it.active[1]!==it.died))add(L().active,fmtRange(it.active[0],it.active[1]));
 if(it.honor)add(L().honor,tx(it.honor));if(it.peak)add(L().peak,tx(it.peak));if(it.endReason)add(L().endR,tx(it.endReason));
 if(it.traditional)add('ⓘ',L().traditional);if(it.sheet)add('✓',L().sheet);
 if(dl.children.length)s.appendChild(dl);
 if(it.works&&it.works.length){s.appendChild(el('h3',null,L().works));const ul=el('ul','works');it.works.forEach(w=>ul.appendChild(el('li',null,tx(w))));s.appendChild(ul)}
 if(it.kind==='comm'&&it.pop&&it.pop.length>1){s.appendChild(el('h3',null,L().popHist));s.appendChild(spark(it))}
 const ac=el('div','acts2');const g1=el('button','btn pri',L().goTime);g1.onclick=()=>scrollToYear(anchorYear(it),true);
 const g2=el('button','btn',L().showMap);g2.onclick=()=>{centerOn(it.lon,it.lat);if(phone())setSheet(false)};ac.append(g1,g2);s.appendChild(ac);
 p.appendChild(s);bk.focus({preventScroll:true});
 drawPoints();markSel()}
function markSel(){tl.selectAll('.bead').classed('sel',function(){return !!selected&&this.dataset.k===selected.key})}
function closeDetail(){selected=null;$('detail').hidden=true;drawPoints();markSel()}
function spark(c){const w=320,h=76;const ns='http://www.w3.org/2000/svg';const s=document.createElementNS(ns,'svg');s.setAttribute('viewBox',`0 0 ${w} ${h}`);s.setAttribute('class','spark');s.style.width='100%';
 const pts=c.pop;const x=d3.scaleLinear().domain(d3.extent(pts,d=>d[0])).range(rtl()?[w-30,30]:[30,w-30]);const y=d3.scaleLinear().domain([0,d3.max(pts,d=>d[1])]).range([h-18,10]);
 const p=document.createElementNS(ns,'path');p.setAttribute('d',d3.area().x(d=>x(d[0])).y0(h-18).y1(d=>y(d[1])).curve(d3.curveMonotoneX)(pts));s.appendChild(p);
 const lab=(t,xx,yy)=>{const e=document.createElementNS(ns,'text');e.textContent=t;e.setAttribute('x',xx);e.setAttribute('y',yy);e.setAttribute('text-anchor','middle');s.appendChild(e)};
 lab(fmtY(pts[0][0]),x(pts[0][0]),h-4);lab(fmtY(pts[pts.length-1][0]),x(pts[pts.length-1][0]),h-4);
 const mxp=pts.reduce((a,b)=>b[1]>a[1]?b:a);lab(fmtPop(mxp[1]).replace(L().popU,''),x(mxp[0]),Math.max(10,y(mxp[1])-3));return s}

/* ---------- timeline ---------- */
const sc=$('tlscroll'),tl=d3.select('#tl');
function onBead(g,it){g.attr('data-k',it.key).on('click',e=>{e.stopPropagation();select(it)}).on('pointerenter',ev=>{setHover(it);showTip(ev,tx(it.name||it.title),it.kind==='event'?fmtYfull(it.year):tx(it.role)+' · '+fmtRange(span(it)[0],span(it)[1]))}).on('pointermove',moveTip).on('pointerleave',()=>{setHover(null);hideTip()})}
function positionRowTags(rows){let c=$('rowtags');if(!c){c=document.createElement('div');c.id='rowtags';c.className='rowtags';$('tlwrap').appendChild(c)}c.innerHTML='';c.dir=rtl()?'rtl':'ltr';
 rows.forEach(([t,y])=>{const d=document.createElement('div');d.textContent=t;d.style.top=(y-9)+'px';c.appendChild(d)})}
function packRows(items,labelOf){const R=rtl();const rows=[];const out=[];
 items.slice().sort((a,b)=>a._y-b._y||b.importance-a.importance).forEach(it=>{const x=X(it._y);const w=tw(labelOf(it),12,it.importance>=3?600:500)+16;
  const lo=R?x-6-w:x-6,hi=R?x+6:x+6+w;let r=0;for(;r<60;r++){const row=rows[r]||(rows[r]=[]);if(!row.some(([p,q])=>lo<q+6&&hi>p-6)){row.push([lo,hi]);break}}it._row=r;out.push(it)});
 return {out,rows:Math.max(1,rows.length)}}
function sectionFull(items,startY,cls,labelOf){const R=rtl();const {out,rows}=packRows(items,labelOf);const g=tl.append('g');
 out.forEach(it=>{const x=X(it._y);const cy=startY+it._row*22+10;const gg=g.append('g').attr('class','bead '+cls(it)+(it===selected?' sel':''));onBead(gg,it);
  gg.append('circle').attr('class','m').attr('cx',x).attr('cy',cy).attr('r',it.kind==='event'?5.5:5);
  gg.append('text').attr('class','blab'+(it.importance>=3?' major':'')).attr('x',R?x-9:x+9).attr('y',cy+4).attr('text-anchor',R?'end':'start').text(labelOf(it))});
 return startY+rows*22+12}
function renderTimeline(){
 const vw=sc.clientWidth||800;layoutScale(vw);fit=total<=vw-39;PAD=fit?Math.round((vw-total)/2):Math.round(vw/2);sc.classList.toggle('fit',fit);
 const W=fit?vw:total+PAD*2;tl.attr('width',W).attr('height',full?156:176);tl.selectAll('*').remove();ensureGlow(tl);
 const R=rtl();const gG=tl.append('g').attr('class','grid');
 // ticks
 const yT=16,yE=24,eh=28;const steps=[1,2,5,10,20,25,50,100,200,250,500,1000];let last=-1e9;const gT=tl.append('g');
 const ceLbl=lang==='he'?' לספירה':' CE';segs.forEach(s=>{const ppy=s.px/(s.b-s.a);const need=s.a<0?(lang==='he'?92:72):(s.b<1000?(lang==='he'?84:62):58);const st=steps.find(v=>v*ppy>=need)||1000;
  for(let t=Math.ceil(s.a/st)*st;t<s.b;t+=st){if(t===0)continue;const x=X(t);const rx=Math.abs(x-PAD);if(Math.abs(rx-last)<need)continue;last=rx;
   gT.append('text').attr('class','tick').attr('x',x).attr('y',yT-4).attr('text-anchor','middle').text(t<0?Math.abs(t)+(lang==='he'?' לפנה״ס':' BCE'):(t<1000?t+ceLbl:String(t)));
   gG.append('line').attr('x1',x).attr('x2',x).attr('y1',yE+eh).attr('y2',176)}});
 // eras
 segs.forEach((s,i)=>{const xa=X(s.a),xb=X(s.b);const x=Math.min(xa,xb)+1,w=Math.abs(xb-xa)-2;
  const g=tl.append('g').attr('class','tl-era'+(i===curEra?' cur':'')).attr('data-i',i).on('click',e=>{e.stopPropagation();goEra(i)});
  g.append('rect').attr('x',x).attr('y',yE).attr('width',Math.max(1,w)).attr('height',eh).style('fill',`var(--e-${s.e.color})`);
  const nm=tx(s.e.name);const lw=tw(nm,12.5,600)+16;
  if(lw<w){const n=Math.max(1,Math.floor(w/760));for(let j=0;j<n;j++)g.append('text').attr('x',x+w*(j+.5)/n).attr('y',yE+eh/2+4.5).attr('text-anchor','middle').text(nm)}
  else if(w>48){let t=nm;while(t.length>2&&tw(t+'…',12.5,600)+12>w)t=t.slice(0,-1);g.append('text').attr('x',x+w/2).attr('y',yE+eh/2+4.5).attr('text-anchor','middle').text(t+'…')}});
 // two rows: events, figures. Thin overlapping marks by importance; label only majors that have room.
 // one lane: draw EVERY point (never drop a dot); only labels are de-cluttered.
 const row=(items,cy,cls,labelOf)=>{const pts=items.map(it=>({it,x:X(it._y)}));
  const g0=tl.append('g');pts.forEach(({it,x})=>{const g=g0.append('g').attr('class','bead '+cls(it)+(it===selected?' sel':''));onBead(g,it);g.append('circle').attr('class','m').attr('cx',x).attr('cy',cy).attr('r',it.kind==='event'?5.5:5)})};
 const Eh=lang==='he'?'צוררים':'Persecutors',Ah=lang==='he'?'ידידים':'Allies',Jh=lang==='he'?'יהודים':'Jews';
 const setY=p=>{const s=span(p);p._y=s[0]==null?null:(s[0]+(s[1]??s[0]))/2};
 const ev0=(layers.events?D.events.slice():[]).map(e=>(e._y=e.year,e));
 const en0=D.gentiles.filter(g=>g.stance==='enemy'&&layers.enemy);en0.forEach(setY);
 const al0=D.gentiles.filter(g=>(g.stance==='ally'&&layers.ally)||(g.stance==='mixed'&&layers.mixed));al0.forEach(setY);
 const jew0=layers.people?D.people.slice():[];jew0.forEach(setY);
 if(full){let y=yE+eh+16;const secs=[];
  secs.push([L().lgEv,y]);y=sectionFull(ev0.filter(p=>p._y!=null),y,e=>'event t-'+evTone(e.type),e=>tx(e.title));y+=6;
  secs.push([Eh,y]);y=sectionFull(en0.filter(p=>p._y!=null),y,p=>p.stance,p=>tx(p.name));y+=6;
  secs.push([Ah,y]);y=sectionFull(al0.filter(p=>p._y!=null),y,p=>p.stance,p=>tx(p.name));y+=6;
  secs.push([Jh,y]);y=sectionFull(jew0.filter(p=>p._y!=null),y,p=>'person',p=>tx(p.name));
  const H=Math.max((sc.clientHeight||400),y+6);tl.attr('height',H);gG.selectAll('line').attr('y2',H);
  positionRowTags(secs);
 }else{
  const impMin=1;
  row(ev0.filter(e=>e.importance>=impMin),yE+eh+18,e=>'event t-'+evTone(e.type),e=>tx(e.title));
  row(en0.filter(p=>p._y!=null&&p.importance>=impMin),yE+eh+44,p=>p.stance,p=>tx(p.name));
  row(al0.filter(p=>p._y!=null&&p.importance>=impMin),yE+eh+70,p=>p.stance,p=>tx(p.name));
  row(jew0.filter(p=>p._y!=null&&p.importance>=impMin),yE+eh+96,p=>'person',p=>tx(p.name));
  positionRowTags([[L().lgEv,yE+eh+18],[Eh,yE+eh+44],[Ah,yE+eh+70],[Jh,yE+eh+96]]);
 }
 placeHead();updZoomUI();scrollToYear(year,false)}
function setFull(o){full=o;store.set('full3',o);$('app').classList.toggle('full',o);const b=$('fullbtn');if(b){b.setAttribute('aria-pressed',o);b.querySelector('span').textContent=o?L().fullOff:L().full}
 requestAnimationFrame(()=>{if(!o)sizeMap();renderTimeline()})}
function placeHead(){$('playhead').style.left=(fit?X(year)-sc.scrollLeft:sc.clientWidth/2)+'px'}
function nudge(px){if(fit)setYear(Yof(X(year)+px));else sc.scrollLeft+=px}
let ignoreScroll=false;
function scrollToYear(y,smooth){if(fit){sc.scrollLeft=0;setYear(y);return}const x=X(y)-sc.clientWidth/2;ignoreScroll=true;const sm=smooth&&!reduceMotion();sc.scrollTo({left:x,behavior:sm?'smooth':'auto'});
 if(sm)setTimeout(()=>{ignoreScroll=false},750);else requestAnimationFrame(()=>{ignoreScroll=false});setYear(y)}
sc.addEventListener('scroll',()=>{if(ignoreScroll||fit)return;setYear(Yof(sc.scrollLeft+sc.clientWidth/2));updSpan();dismissHint()},{passive:true});
sc.addEventListener('wheel',e=>{if(e.ctrlKey||e.metaKey){e.preventDefault();zoomBy(Math.exp(-e.deltaY*0.01));return}const d=Math.abs(e.deltaY)>Math.abs(e.deltaX)?e.deltaY:e.deltaX;if(!d)return;e.preventDefault();nudge((rtl()?-1:1)*d*(fit?.4:1))},{passive:false});
(()=>{let down=null;const yAt=cx=>Yof(cx-sc.getBoundingClientRect().left+sc.scrollLeft);
 sc.addEventListener('pointerdown',e=>{if(e.button!==0)return;if(!fit&&e.pointerType!=='mouse')return;down={x:e.clientX,l:sc.scrollLeft,moved:false}});
 addEventListener('pointermove',e=>{if(!down)return;const dx=e.clientX-down.x;if(!down.moved&&Math.abs(dx)<4)return;down.moved=true;sc.classList.add('drag');dismissHint();if(fit)setYear(yAt(e.clientX));else sc.scrollLeft=down.l-dx});
 addEventListener('pointerup',()=>{if(down&&down.moved){const stop=e=>{e.stopPropagation();e.preventDefault()};sc.addEventListener('click',stop,{capture:true,once:true});setTimeout(()=>sc.removeEventListener('click',stop,{capture:true}),50)}down=null;sc.classList.remove('drag')});
 sc.addEventListener('click',e=>{if(fit&&!e.target.closest('.bead,.tl-era'))setYear(yAt(e.clientX))})})();
/* timeline zoom */
let zq=0,zPending=1;
function zoomBy(f){zPending*=f;if(zq)return;zq=requestAnimationFrame(()=>{zq=0;setTlZoom(tlZoom*zPending);zPending=1})}
function setTlZoom(z){const vw=sc.clientWidth||800;const nz=Math.max(zMin(vw),Math.min(ZMAX,z));if(Math.abs(nz-tlZoom)<1e-4&&z===nz)return;tlZoom=nz;store.set('tlz',tlZoom);renderTimeline()}
function visibleSpan(){if(fit)return MAXY-MINY;const vw=sc.clientWidth||800;return Math.abs(Yof(sc.scrollLeft+vw)-Yof(sc.scrollLeft))}
function fmtSpan(n){n=Math.round(n);const he=lang==='he';if(n>=1000){const v=Math.round(n/100)/10;return he?`כ־${v} אלף שנה על המסך`:`≈ ${v}k years on screen`}if(n>=100){const v=Math.round(n/10)*10;return he?`כ־${v} שנה על המסך`:`≈ ${v} years on screen`}return he?`כ־${Math.max(1,n)} שנים על המסך`:`≈ ${Math.max(1,n)} years on screen`}
let spq=0;function updSpan(){const e=$('tz-span');if(!e)return;if(spq)return;spq=requestAnimationFrame(()=>{spq=0;e.textContent=fmtSpan(visibleSpan())})}
function updZoomUI(){const vw=sc.clientWidth||800;$('tz-out').disabled=tlZoom<=zMin(vw)+1e-4;$('tz-in').disabled=tlZoom>=ZMAX-1e-4;updSpan()}
$('tz-in').onclick=()=>setTlZoom(tlZoom*1.6);$('tz-out').onclick=()=>setTlZoom(tlZoom/1.6);$('tz-all').onclick=()=>setTlZoom(0);
(()=>{let d0=0,z0=1;const dist=t=>Math.hypot(t[0].clientX-t[1].clientX,t[0].clientY-t[1].clientY);
 sc.addEventListener('touchstart',e=>{if(e.touches.length===2){d0=dist(e.touches);z0=tlZoom}},{passive:true});
 sc.addEventListener('touchmove',e=>{if(e.touches.length===2&&d0){e.preventDefault();zPending=1;zoomBy(z0*dist(e.touches)/d0/tlZoom)}},{passive:false});
 sc.addEventListener('touchend',e=>{if(e.touches.length<2)d0=0},{passive:true})})();
function buildLegend(){const l=$('legend');l.innerHTML='';[['ring',null,L().lgEv],['',`var(--brand)`,L().lgJ],['','var(--ally)',L().lgA],['','var(--enemy)',L().lgE],['heat','var(--gold)',L().lgCen]].forEach(([c,col,t])=>{const s=el('span');const i=el('i',c);if(col)i.style.background=col;s.append(i,document.createTextNode(t));l.appendChild(s)})}
let markersOn=store.get('markers3',true);
function applyMarkers(){if(typeof gPts!=='undefined'&&gPts)gPts.style('display',markersOn?null:'none')}
function renderLayersMenu(){const m=$('layersmenu');if(!m)return;m.innerHTML='';m.dir=rtl()?'rtl':'ltr';
 const row=(label,color,on,fn)=>{const btn=el('button');btn.setAttribute('aria-pressed',on);const d=el('span','dot');d.style.background=color;const t=el('span',null,label);t.style.flex='1';const sw=el('span','sw');btn.append(d,t,sw);btn.onclick=()=>{fn();renderLayersMenu()};return btn};
 m.append(
  row(L().lgCen,'var(--gold)',heatOn,()=>{heatOn=!heatOn;store.set('heat3',heatOn);drawCenters();drawEdge()}),
  row(L().lgMarkers,'var(--brand)',markersOn,()=>{markersOn=!markersOn;store.set('markers3',markersOn);applyMarkers();drawCenters()})
 )}
function syncLayers(){const b=$('layersbtn');if(b){b.title=L().lgLayers;b.setAttribute('aria-label',L().lgLayers);const s=$('layersbtn-lbl');if(s)s.textContent=L().lgLayers}renderLayersMenu()}
(function(){const b=$('layersbtn'),m=$('layersmenu');if(!b||!m)return;
 b.onclick=e=>{e.stopPropagation();const open=m.hidden;m.hidden=!open;b.setAttribute('aria-expanded',String(open));if(open)renderLayersMenu()};
 document.addEventListener('click',e=>{if(!m.hidden&&!b.contains(e.target)&&!m.contains(e.target)){m.hidden=true;b.setAttribute('aria-expanded','false')}});
 applyMarkers();syncLayers()})();

/* play */
let playing=false,lastT=0;
function tick(t){if(!playing)return;if(lastT){const dt=Math.min(60,t-lastT);nudge((rtl()?-1:1)*dt*(fit?0.02:0.08));if(year>=MAXY-0.5)togglePlay(false)}lastT=t;requestAnimationFrame(tick)}
function togglePlay(on){playing=on==null?!playing:on;lastT=0;$('playicon').setAttribute('d',playing?'M7 5h3.5v14H7zM13.5 5H17v14h-3.5z':'M8 5v14l11-7z');$('play').setAttribute('aria-label',playing?L().pause:L().play);if(playing){dismissHint();if(year>=MAXY-1)scrollToYear(MINY,false);requestAnimationFrame(tick)}}
$('play').onclick=()=>togglePlay();

/* ---------- centers of gravity (heatmap) ---------- */
const CEN=(D.centers||[]);
function cenVal(c){return year<c.w[0][0]?0:interp(c.w,year)}
function drawCenters(){
 if(!heatOn){gHeat.selectAll('*').remove();gHL.selectAll('*').remove();return}
 const R0=Math.min(mw,mh)*0.052;
 const rows=CEN.map(c=>({c,v:cenVal(c),p:proj([c.lon,c.lat])})).filter(r=>r.v>0.05&&r.p);
 gHeat.selectAll('circle').data(rows,r=>r.c.id).join('circle')
  .attr('cx',r=>r.p[0]).attr('cy',r=>r.p[1])
  .attr('r',r=>R0*(0.6+0.5*r.v)).attr('fill','url(#heatgrad)')
  .attr('opacity',r=>Math.min(.62,0.12+0.15*r.v));
 const ik=1/k;
 // current marker positions — region labels yield to figure/event markers (content beats context)
 const mpts=[];if(markersOn!==false)GROUPS.forEach(g=>{if(layers[g])NOW[g].forEach(it=>{const p=proj([it.lon,it.lat]);if(p)mpts.push(p)})});
 const cand=rows.filter(r=>r.v>=1.3&&!r.c.nolab).sort((a,b)=>b.v-a.v);
 const kept=[],minX=104,minY=30;
 for(const r of cand){let ok=true;
  for(const q of kept){if(Math.abs(r.p[0]-q.p[0])*k<minX&&Math.abs(r.p[1]-q.p[1])*k<minY){ok=false;break}}
  if(ok&&r.v<2)for(const m of mpts){if(Math.abs(r.p[0]-m[0])*k<80&&Math.abs(r.p[1]-m[1])*k<22){ok=false;break}}
  if(ok)kept.push(r);if(kept.length>=7)break}
 gHL.selectAll('text').data(kept,r=>r.c.id).join('text').attr('class','heatlabel')
  .attr('x',r=>r.p[0]).attr('y',r=>r.p[1]).attr('font-size',(12.5*ik)+'px')
  .text(r=>tx(r.c.name));
}
function drawEdge(){
 gEdge.selectAll('*').remove();
 if(!heatOn)return;
 const t=d3.zoomTransform(svg.node());
 const cx=mw/2,cy=mh/2;
 const halfW=Math.max(80,mw/2-Math.min(150,mw*0.2)),halfH=Math.max(60,mh/2-56);
 measure.font="600 13px Heebo, sans-serif";
 const cands=CEN.map(c=>({c,v:cenVal(c)})).filter(r=>r.v>=2&&!r.c.nolab).sort((a,b)=>b.v-a.v);
 const placed=[];let n=0;
 for(const r of cands){
  const p=proj([r.c.lon,r.c.lat]);if(!p)continue;
  const sx=t.x+t.k*p[0],sy=t.y+t.k*p[1];
  if(sx>=8&&sx<=mw-8&&sy>=8&&sy<=mh-8)continue; // on-screen
  let dx=sx-cx,dy=sy-cy;if(!dx&&!dy)continue;
  const sc=Math.min(halfW/Math.max(1,Math.abs(dx)),halfH/Math.max(1,Math.abs(dy)));
  let ex=cx+dx*sc,ey=cy+dy*sc;
  while(placed.some(q=>Math.abs(q[0]-ex)<120&&Math.abs(q[1]-ey)<26))ey+=28;
  if(ey>mh-30)break;placed.push([ex,ey]);
  const ang=Math.atan2(dy,dx);const label=tx(r.c.name);
  const tw=Math.ceil(measure.measureText(label).width);const W=tw+34,H=24;
  const g=gEdge.append('g').attr('class','edgechip').attr('transform',`translate(${ex},${ey})`);
  g.on('mousedown',e=>e.stopPropagation()).on('touchstart',e=>e.stopPropagation())
   .on('click',e=>{e.stopPropagation();hideTip();centerOn(r.c.lon,r.c.lat)})
   .on('pointerenter',ev=>showTip(ev,label,L().edgeTip)).on('pointermove',moveTip).on('pointerleave',hideTip);
  g.append('rect').attr('class','pill').attr('x',-W/2).attr('y',-H/2).attr('width',W).attr('height',H).attr('rx',12).attr('ry',12);
  g.append('text').attr('x',0).attr('y',1).text(label);
  g.append('path').attr('class','arw').attr('d','M0,-4 L7,0 L0,4 Z')
   .attr('transform',`translate(${Math.cos(ang)*(W/2+7)},${Math.sin(ang)*(H/2+7)}) rotate(${ang*180/Math.PI})`);
  if(++n>=4)break;
 }
}
let eq=0;function drawEdgeT(){if(eq)return;eq=requestAnimationFrame(()=>{eq=0;drawEdge()})}
/* ---------- year ---------- */
let listQ=0;
function setYear(y){year=Math.max(MINY,Math.min(MAXY,y));const ry=Math.round(year);
 $('yr').textContent=Math.abs(ry);const am=amYear(ry);
 $('yrsub').textContent=(ry<0?L().bce:L().ce)+(am?' · '+(lang==='he'?gem(am):am):'');
 $('pop').innerHTML='';const b=el('b',null,fmtPop(interp(D.demography.world,year)));$('pop').append(document.createTextNode(' · '),b,document.createTextNode(' '+L().pop));
 $('knob').textContent=ry<0?Math.abs(ry)+(lang==='he'?' לפנה״ס':' BCE'):ry+(lang==='he'?' לספירה':' CE');
 if(fit)placeHead();sc.setAttribute('aria-valuenow',ry);sc.setAttribute('aria-valuetext',fmtYfull(ry));
 const ei=eraAt(year);if(ei!==curEra){curEra=ei;renderChapter()}
 NOW=nowItems();drawBorders();drawCenters();drawPoints();drawEdge();
 if(!listQ)listQ=setTimeout(()=>{listQ=0;renderList();renderCtx()},playing?250:60)}
function goEra(i){const e=eras[i];scrollToYear(e.start+Math.min(3,(segs[i].b-e.start)*0.05),true)}

/* chapters overlay */
function openChapters(){const g=$('chgrid');g.innerHTML='';$('ch-h').textContent=L().chapters;$('chapters').dir=rtl()?'rtl':'ltr';
 eras.forEach((e,i)=>{const b=el('button','ch');b.setAttribute('aria-current',i===curEra);const st=el('span','strip');st.style.background=`var(--e-${e.color})`;
  b.append(el('span','no',L().chap+' '+(i+1)),el('b',null,tx(e.name)),el('small',null,fmtRange(e.start,segs[i].b)),st);b.onclick=()=>{closeOverlay('chapters');goEra(i)};g.appendChild(b)});
 openOverlay('chapters')}
let lastFocus=null;
function openOverlay(id){document.querySelectorAll('.overlay').forEach(o=>{if(o.id!==id)o.hidden=true});if(!$(id).hidden)return;lastFocus=document.activeElement;const o=$(id);o.hidden=false;const sh=o.querySelector('.sheet');if(sh&&!matchMedia('(prefers-reduced-motion:reduce)').matches){sh.style.animation='none';void sh.offsetWidth;sh.style.animation='';}const f=o.querySelector('input,button');if(f)f.focus()}
function closeOverlay(id){$(id).hidden=true;if(lastFocus&&lastFocus.focus)lastFocus.focus()}
document.querySelectorAll('.overlay').forEach(o=>o.addEventListener('click',e=>{if(e.target===o||e.target.closest('[data-close]'))closeOverlay(o.id)}));

/* ---------- search ---------- */
const q=$('q'),qres=$('qres');let qi=0,qlist=[];
const norm=s=>(s||'').toLowerCase().replace(/[״"׳'\-\s]/g,'');
function renderRes(sugg){qres.innerHTML='';qi=0;
 if(sugg){const h=el('li','qhint',L().suggest);h.setAttribute('aria-disabled','true');qres.appendChild(h);}
 qlist.forEach((it,i)=>{const li=el('li');li.setAttribute('role','option');li.setAttribute('aria-selected',i===0);const d=el('i');d.style.background=colorOf(it);
  li.append(d,el('span',null,tx(it.name||it.title)),el('small',null,it.kind==='event'?fmtYfull(it.year):it.kind==='comm'?L().kComm:fmtRange(span(it)[0],span(it)[1])));li.onclick=()=>pick(i);qres.appendChild(li)})}
function showSuggestions(){const pick=(arr,n)=>arr.filter(x=>x.importance>=3).sort((a,b)=>(a.name?span(a)[0]:a.year)-(b.name?span(b)[0]:b.year)).slice(0,n);
 const ppl=[...ITEMS.values()].filter(x=>x.kind==='person');const gen=[...ITEMS.values()].filter(x=>x.kind==='gent');
 const ids=['moses','david','maimonides','theodor-herzl','ferdinand-isabella','haman','pharaoh-exodus','cyrus-the-great'];
 qlist=ids.map(id=>[...ITEMS.values()].find(x=>x.id===id)).filter(Boolean);
 if(qlist.length<6)qlist=pick(ppl,6);
 renderRes(true)}
q.addEventListener('input',()=>{const v=norm(q.value);if(v.length<2){showSuggestions();return}
 qlist=[...ITEMS.values()].filter(it=>{const n=it.name||it.title;return norm(n.he).includes(v)||norm(n.en).includes(v)}).sort((a,b)=>(b.importance||2)-(a.importance||2)).slice(0,10);
 if(!qlist.length){qres.innerHTML='';qlist=[];qres.appendChild(el('li','none',L().noRes));return}
 renderRes(false)});
q.addEventListener('keydown',e=>{const lis=qres.querySelectorAll('li[role=option]');if(e.key==='ArrowDown')qi=Math.min(lis.length-1,qi+1);else if(e.key==='ArrowUp')qi=Math.max(0,qi-1);else if(e.key==='Enter'){if(qlist.length)pick(qi);return}else return;e.preventDefault();lis.forEach((l,i)=>l.setAttribute('aria-selected',i===qi))});
function pick(i){const it=qlist[i];if(!it)return;closeOverlay('search');q.value='';qres.innerHTML='';scrollToYear(anchorYear(it),false);select(it)}
$('searchbtn').onclick=()=>{$('search').dir=rtl()?'rtl':'ltr';q.value='';showSuggestions();openOverlay('search')};

/* ---------- help (about + keys) ---------- */
const KEYS=()=>{const he=lang==='he';return [[['←','→'],he?'לנוע בזמן (Shift: צעד גדול)':'Move through time (Shift: big step)'],[['Space'],he?'נגן / עצור':'Play / pause'],[['N','P'],he?'הפרק הבא / הקודם':'Next / previous chapter'],[['Home','End'],he?'התחלה / היום':'Start / today'],[['+','−'],he?'זום בציר הזמן':'Zoom the timeline'],[['0'],he?'כל ההיסטוריה':'All of history'],[['Shift','+ / −'],he?'זום במפה':'Zoom the map'],[['C'],he?'כל הפרקים':'All chapters'],[['/'],he?'חיפוש':'Search'],[['L'],he?'שפה':'Language'],[['Esc'],he?'סגירה':'Close'],[['?'],he?'החלון הזה':'This window']]};
function openHelp(){const b=$('helpbox');b.innerHTML='';b.dir=rtl()?'rtl':'ltr';const he=lang==='he';
 const sh=el('div','sh');sh.append(el('h2',null,L().title));const x=el('button','ibtn','✕');x.setAttribute('data-close','');x.setAttribute('aria-label',L().close);sh.appendChild(x);b.appendChild(sh);
 b.appendChild(el('p',null,he?'שלושה חלקים: ציר הזמן למטה קובע את השנה, הרשימה בצד אומרת מה קורה בה, והמפה מראה איפה. ציר הזמן לא אחיד: תקופות סוערות מקבלות יותר מקום.':'Three parts: the timeline at the bottom sets the year, the side list says what is happening, and the map shows where. Time is uneven on purpose: turbulent eras get more room.'));
 b.appendChild(el('h3',null,he?'צבעי התקופות':'Era colors'));
 b.appendChild(el('p',null,he?'הפסים הצבעוניים בציר הזמן מסמנים את תקופות־העל של ההיסטוריה היהודית:':'The colored bands on the timeline mark the grand eras of Jewish history:'));
 const eg=el('div','erakey');
 [['ancient',he?'תקופת המקרא':'Biblical era'],['exile',he?'גלות בבל':'Babylonian Exile'],['classical',he?'בית שני, חז״ל והתלמוד':'Second Temple, Sages & Talmud'],['medieval',he?'ימי הביניים':'Middle Ages'],['early-modern',he?'ראשית העת החדשה':'Early modern'],['modern',he?'העת החדשה':'Modern era'],['holocaust',he?'השואה':'The Holocaust'],['israel',he?'מדינת ישראל':'State of Israel']].forEach(([c,name])=>{const row=el('div','erakey-i');const sw=el('i');sw.style.background='var(--e-'+c+')';row.append(sw,el('span',null,name));eg.appendChild(row)});
 b.appendChild(eg);
 b.appendChild(el('h3',null,he?'קיצורי מקלדת':'Keyboard'));const dl=el('dl','keys');KEYS().forEach(([ks,d])=>{const dt=el('dt');ks.forEach(k=>dt.appendChild(el('kbd',null,k)));dl.append(dt,el('dd',null,d))});b.appendChild(dl);
 b.appendChild(el('h3',null,he?'מקורות':'Sources'));const src=el('ul');
 const link=(t,u,rest)=>{const li=el('li');const a=el('a',null,t);a.href=u;a.target='_blank';a.rel='noopener';li.appendChild(a);if(rest)li.appendChild(document.createTextNode(' · '+rest));src.appendChild(li)};
 link('OldMapsOnline · History','https://www.oldmapsonline.org/en/history',he?'השראה':'inspiration');
 link('historical-basemaps (A. Ourednik)','https://github.com/aourednik/historical-basemaps',he?'גבולות היסטוריים, GPL-3.0':'historical borders, GPL-3.0');
 link('Natural Earth / world-atlas','https://github.com/topojson/world-atlas',he?'קווי חוף':'coastlines');
 link('עודידע · Odyeda','https://www.odyeda.com/he/',he?'ציר זמן, דמוגרפיה, ריבונות':'timeline, demography, sovereignty');
 (D.demography.sources||[]).forEach(s=>{if(s.url&&!/odyeda/.test(s.url))link(tx(s),s.url)});b.appendChild(src);
 b.appendChild(el('p',null,he?'מספרי האוכלוסייה, בעיקר לפני 1800, הם הערכות גסות. תאריכי התקופה המקראית משוערים או מסורתיים. הגבולות מקורבים.':'Population figures, especially before 1800, are rough estimates. Biblical dates are approximate or traditional. Borders are approximate.'));
 const re=el('button','btn',he?'הצג מדריך פתיחה':'Show the intro guide');re.style.marginTop='6px';re.onclick=()=>{closeOverlay('help');showIntro(true)};b.appendChild(re);
 openOverlay('help')}
$('helpbtn').onclick=openHelp;
$('fullbtn').onclick=()=>setFull(!full);

/* ---------- keyboard ---------- */
addEventListener('keydown',e=>{const tag=e.target.tagName||'';const typing=tag==='INPUT'||tag==='TEXTAREA';
 const ov=[...document.querySelectorAll('.overlay')].find(o=>!o.hidden);
 if(e.key==='Escape'){if(ov)closeOverlay(ov.id);else if(selected)closeDetail();return}
 if(typing||ov||e.metaKey||e.ctrlKey||e.altKey)return;
 const c=e.code,k=e.key,step=e.shiftKey?240:40;let done=true;
 if(k==='ArrowRight')nudge(step);else if(k==='ArrowLeft')nudge(-step);
 else if(c==='Space'){if(tag==='BUTTON')return;togglePlay()}
 else if(c==='KeyN'||k==='PageDown')goEra(Math.min(eras.length-1,curEra+1));
 else if(c==='KeyP'||k==='PageUp')goEra(Math.max(0,curEra-1));
 else if(k==='Home')scrollToYear(MINY,true);else if(k==='End')scrollToYear(MAXY,true);
 else if(e.shiftKey&&(c==='Equal'||c==='NumpadAdd'))svg.transition().duration(250).call(zoom.scaleBy,1.6);
 else if(e.shiftKey&&(c==='Minus'||c==='NumpadSubtract'))svg.transition().duration(250).call(zoom.scaleBy,1/1.6);
 else if(c==='Equal'||c==='NumpadAdd')setTlZoom(tlZoom*1.6);else if(c==='Minus'||c==='NumpadSubtract')setTlZoom(tlZoom/1.6);
 else if(c==='Digit0'||c==='Numpad0')setTlZoom(0);
 else if(c==='KeyC')openChapters();
 else if((c==='Slash'&&e.shiftKey)||k==='?')openHelp();
 else if(c==='Slash'||c==='KeyF')$('searchbtn').click();
 else if(c==='KeyL')$('langbtn').click();
 else if(c==='KeyM')setFull(!full);
 else done=false;
 if(done){e.preventDefault();dismissHint()}});

/* ---------- hint ---------- */
function showHint(){if(store.get('hinted3',false))return;$('hint-t').textContent=L().hintT;$('hint-b').textContent=L().hintB;$('hint').hidden=false}
function dismissHint(){if($('hint').hidden)return;$('hint').hidden=true;store.set('hinted3',true)}
$('hint-b').onclick=dismissHint;

/* ---------- onboarding intro ---------- */
function introData(){const he=lang==='he';return{
 title:he?'ברוכים הבאים לאטלס':'Welcome to the Atlas',
 sub:he?'מסע אינטראקטיבי של כ־3,800 שנה בהיסטוריה היהודית — על מפה וציר זמן.':'An interactive ~3,800-year journey through Jewish history — on a map and a timeline.',
 steps:[
  {ic:'🕰️',t:he?'גללו בזמן':'Travel through time',s:he?'הזיזו את ציר הזמן למטה (או הקישו ▶) וראו איך העולם היהודי משתנה — קהילות, דמויות ואירועים.':'Move the timeline below (or tap ▶) and watch the Jewish world change — communities, figures and events.'},
  {ic:'📍',t:he?'חקרו את המפה':'Explore the map',s:he?'הקישו על נקודה כדי ללמוד על דמות, אירוע או מרכז חיים יהודי.':'Tap a dot to learn about a figure, an event, or a center of Jewish life.'},
  {ic:'🎮',t:he?'שחקו ולמדו':'Play & learn',s:he?'פתחו את "משחקים": מסע בזמן, קו הזמן, סדר אותם ועוד.':'Open “Games”: Time Journey, Timeline, Put-in-Order and more.'}
 ],
 go:he?'יוצאים לדרך':'Let’s go'
};}
function showIntro(force){
 if(!force&&store.get('introSeen',false))return;
 if(!force){store.set('introSeen',true);store.set('hinted3',true)}
 const d=introData();
 $('intro').dir=rtl()?'rtl':'ltr';
 $('intro-h').textContent=d.title;$('intro-sub').textContent=d.sub;
 const box=$('intro-steps');box.innerHTML='';
 d.steps.forEach(s=>{const row=el('div','intro-step');const tx2=el('div','intro-tx');tx2.append(el('b',null,s.t),el('span',null,s.s));row.append(el('div','intro-ic',s.ic),tx2);box.appendChild(row)});
 const go=$('intro-go');go.textContent=d.go;go.onclick=()=>closeOverlay('intro');
 openOverlay('intro');
}

/* ---------- language ---------- */
function applyLang(){const u=L();document.documentElement.lang=lang;document.documentElement.dir=rtl()?'rtl':'ltr';document.title=u.title;
 $('t-title').textContent=u.title;$('langbtn').textContent=lang==='he'?'EN':'עב';$('langbtn').setAttribute('aria-label',u.lang);
 $('searchbtn').setAttribute('aria-label',u.search);$('searchbtn').title=u.search;$('helpbtn').setAttribute('aria-label',u.help);$('helpbtn').title=u.help+' (?)';if($('fullbtn')){$('fullbtn').querySelector('span').textContent=full?u.fullOff:u.full;$('fullbtn').setAttribute('aria-pressed',full)}if($('gamebtn-lbl')&&u.gTitle)$('gamebtn-lbl').textContent=u.gTitle
 $('q').placeholder=u.search;$('q').setAttribute('aria-label',u.search);
 $('c-prev').innerHTML=rtl()?ICON.next:ICON.prev;$('c-next').innerHTML=rtl()?ICON.prev:ICON.next;$('c-prev').setAttribute('aria-label',u.prev);$('c-prev').title=u.prev;$('c-next').setAttribute('aria-label',u.next);$('c-next').title=u.next;$('c-all').setAttribute('aria-label',u.all);$('c-all').title=u.all;
 $('tz-in').setAttribute('aria-label',u.zin);$('tz-in').title=u.zin;$('tz-out').setAttribute('aria-label',u.zout);$('tz-out').title=u.zout;$('tz-all').textContent=u.zall;
 $('zin').setAttribute('aria-label',lang==='he'?'הגדל מפה':'Zoom in map');$('zout').setAttribute('aria-label',lang==='he'?'הקטן מפה':'Zoom out map');
 $('play').setAttribute('aria-label',playing?u.pause:u.play);$('map').setAttribute('aria-label',lang==='he'?'מפת העולם בשנה הנבחרת':'World map for the selected year');
 setSheet($('panel').dataset.open==='true');buildLegend();if(!$('hint').hidden){$('hint-t').textContent=u.hintT;$('hint-b').textContent=u.hintB}
 curEra=-1;lastSnap=null;gPts.selectAll('*').remove();syncLayers();drawCenters();drawEdge();renderTimeline();renderList();renderCtx();if(selected)select(selected)}
$('langbtn').onclick=()=>{lang=lang==='he'?'en':'he';store.set('lang',lang);applyLang()};

/* ---------- boot ---------- */
(function boot(){
 const h=location.hash.slice(1);const ei=eras.findIndex(e=>e.id===h);
 year=ei>=0?eras[ei].start+Math.min(3,(segs[ei].b-eras[ei].start)*0.05):1492;
 $('app').classList.toggle('full',full);sizeMap();applyLang();
 const p=proj([24,38]);const k0=phone()?2.2:3;svg.call(zoom.transform,d3.zoomIdentity.translate(mw/2,mh/2).scale(k0).translate(-p[0],-p[1]));
 showIntro();
 addEventListener('hashchange',()=>{const i=eras.findIndex(e=>e.id===location.hash.slice(1));if(i>=0&&i!==curEra)goEra(i)});
 let lastWH='';try{new ResizeObserver(()=>{const r=$('mapwrap').getBoundingClientRect();const wh=Math.round(r.width)+'x'+Math.round(r.height);if(wh===lastWH||r.width<50)return;lastWH=wh;
  const t=d3.zoomTransform(svg.node());const c=proj.invert(t.invert([mw/2,mh/2]));sizeMap();if(c){const pp=proj(c);svg.call(zoom.transform,d3.zoomIdentity.translate(mw/2,mh/2).scale(t.k).translate(-pp[0],-pp[1]))}}).observe($('mapwrap'))}catch(_){}
 let rt;addEventListener('resize',()=>{clearTimeout(rt);rt=setTimeout(()=>{renderTimeline()},150)});
})();
})();
