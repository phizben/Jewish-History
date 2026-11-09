const fs=require('fs');let h=fs.readFileSync('app3.html','utf8');
const esc=s=>s.replace(/<\//g,'<\\/');
h=h.replace('/*DATA*/',()=>esc(fs.readFileSync('bundle-data.json','utf8'))).replace('/*MAPS*/',()=>esc(fs.readFileSync('bundle-maps.json','utf8'))).replace('/*LAND*/',()=>esc(fs.readFileSync('bundle-land.json','utf8'))).replace('/*APP*/',()=>fs.readFileSync('app3.js','utf8'));
fs.mkdirSync('/mnt/user-data/outputs',{recursive:true});fs.writeFileSync('jewish-atlas.html',h);
fs.writeFileSync('preview.html','<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><style>[hidden]{display:none!important}body{margin:0}</style></head><body>'+h+'</body></html>');
console.log((h.length/1e6).toFixed(2)+'MB');
