const fs=require('fs');const R=f=>JSON.parse(fs.readFileSync('data/'+f));
const g=R('gentiles.json').concat(R('gentiles_extra.json'));
const sheet=['pharaoh-exodus','amalek','ruth','shishak','hazael','sennacherib','taharqa','nebuchadnezzar-ii','haman','cyrus-the-great','antiochus-iv','pompey','vespasian','titus','hadrian','theodosius-i','constantine-the-great','theodosius-ii','shapur-i','justinian-i','muhammad','umar-ibn-al-khattab','bulan','charlemagne','al-hakim','emicho-of-leiningen','innocent-iii','boleslaw-the-pious','edward-i','philip-iv','casimir-iii','ferdinand-isabella','bayezid-ii','joao-iii','martin-luther','suleiman','william-the-silent','khmelnytsky','oliver-cromwell','al-mahdi-ahmad','catherine-the-great','napoleon','franz-joseph','alexander-iii','arthur-balfour','symon-petliura','winston-churchill','malcolm-macdonald','adolf-hitler','joseph-stalin','haj-amin-al-husseini','harry-truman','gamal-abdel-nasser','bourges-maunoury','richard-nixon','anwar-sadat','ruhollah-khomeini','mikhail-gorbachev','donald-trump'];
const over={napoleon:'ally','joseph-stalin':'enemy','constantine-the-great':'enemy','anwar-sadat':'mixed','richard-nixon':'mixed','alexander-the-great':'mixed'};
const keepGentiles=new Set(['abd-al-rahman-iii','alexander-the-great']);
const ids=new Set(g.map(x=>x.id));sheet.filter(s=>!ids.has(s)).forEach(s=>console.log('missing sheet id',s));
g.forEach(x=>{if(sheet.includes(x.id))x.sheet=1;if(over[x.id])x.stance=over[x.id];});
let eras=R('eras.json').filter(e=>e.start<1881);
eras.push(
{id:'zionism',start:1881,end:1932,weight:4,color:'modern',view:{lon:-10,lat:46,zoom:2},
 name:{he:'התעוררות ציונית ובניין הארץ',en:'Zionism & Building the Land'},
 subtitle:{he:'פוגרומים, הגירה המונית וחלום הבית הלאומי',en:'Pogroms, mass migration and the dream of a national home'},
 summary:{he:'גל הפוגרומים ברוסיה (1881) מוציא מיליוני יהודים לדרכים: רובם לאמריקה, ומיעוט עולה לארץ ישראל ומקים מושבות. הרצל הופך את הרעיון הציוני לתנועה מדינית, הצהרת בלפור (1917) מבטיחה בית לאומי, ותחת המנדט הבריטי קמים תל אביב, הקיבוצים והעברית המדוברת.',en:'The 1881 pogroms in Russia set millions of Jews moving, most to America and a minority to the Land of Israel, where they found new villages. Herzl turns Zionism into a political movement, the Balfour Declaration (1917) promises a national home, and under the British Mandate Tel Aviv, the kibbutzim and spoken Hebrew take shape.'}},
{id:'holocaust',start:1933,end:1945,weight:5,color:'holocaust',view:{lon:18,lat:51,zoom:4},
 name:{he:'השואה',en:'The Holocaust'},subtitle:{he:'מעליית הנאצים ועד השמדת שליש מהעם',en:'From the Nazi rise to the murder of a third of the people'},
 summary:(R('eras.json').find(e=>e.id==='holocaust')||{}).summary},
{id:'state-of-israel',start:1946,end:2026,weight:3,color:'israel',view:{lon:35,lat:31.5,zoom:4},
 name:{he:'מדינת ישראל',en:'The State of Israel'},
 subtitle:{he:'עצמאות, קיבוץ גלויות ומלחמות על הבית',en:'Independence, the ingathering of exiles and wars for the home'},
 summary:{he:'אחרי השואה מחליט האו״ם על חלוקת הארץ, ובמאי 1948 קמה מדינת ישראל. בתוך שנים ספורות היא קולטת ניצולי שואה ויהודים מארצות ערב, ובהמשך עולים מאתיופיה ומברית המועצות. לצד מלחמות וטרור יש גם הסכמי שלום, ובפעם הראשונה מזה אלפיים שנה מרכז העם היהודי חוזר לארצו.',en:'After the Holocaust the UN votes to partition the land, and in May 1948 the State of Israel is founded. Within a few years it absorbs Holocaust survivors and Jews from Arab lands, and later immigrants from Ethiopia and the Soviet Union. Alongside wars and terror come peace treaties, and for the first time in two thousand years the center of the Jewish people returns to its land.'}});

// --- FOCUS: gentiles (friends & foes) are the spine; Jewish figures are context; a few landmark events as anchors. ---
const keepEv=new Set(['sinai','first-temple','kingdom-split','assyrian-exile','first-temple-destruction','cyrus-declaration','second-temple','hanukkah','second-temple-destruction','bar-kokhba','tanakh-canon','mishnah','rhineland-massacres','expulsion-england','black-death','inquisition','expulsion-spain','portugal-conversion','chmielnicki','zionist-congress','dreyfus-affair','balfour-declaration','nuremberg-laws','death-camps','independence','six-day-war','yom-kippur-war','october-7','exodus','babylonian-talmud']);
const gentiles=g.filter(x=>x.sheet||x.importance>=2||keepGentiles.has(x.id));
const keepPeople=new Set(['abravanel','gracia-nasi','maharal','moses-montefiore','ovadia-yosef','menachem-mendel-schneerson','rav-ashi','shabbetai-zvi','ezekiel','zerubbabel','joseph','herod']);
const dropPeople=new Set(['elie-wiesel','golda-meir','hannah-senesh']);
const people=R('people.json').filter(p=>p.id!=='ruth'&&!dropPeople.has(p.id)&&(p.importance>=2||keepPeople.has(p.id)));
const events=R('events.json').filter(e=>e.importance>=3||keepEv.has(e.id)).map(e=>Object.assign({},e,{importance:3}));
const D={communities:[],centers:R('centers.json'),quiz:R('quiz.json'),demography:R('demography.json'),people,gentiles,events,eras,extras:R('extras.json')};
fs.writeFileSync('bundle-data.json',JSON.stringify(D));
const M={};for(const f of fs.readdirSync('maps/out')){const y=f.replace('.json','');const yr=y.startsWith('bc')?-parseInt(y.slice(2)):parseInt(y);M[yr]=JSON.parse(fs.readFileSync('maps/out/'+f));}
// State of Israel borders should show from 1948, not from the 1960 snapshot (the 1945 snapshot renames Israel->Mandatory Palestine). Reuse the pre-1967 (1960) topology for 1948.
if(M[1960]&&!M[1948])M[1948]=M[1960];
fs.writeFileSync('bundle-maps.json',JSON.stringify(M));
fs.writeFileSync('bundle-land.json',fs.readFileSync('maps/land-50m.json'));
console.log('ok events',events.length,'people',people.length,'gentiles',gentiles.length);
