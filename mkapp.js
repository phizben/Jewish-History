const fs=require('fs');
const head=fs.readFileSync('app2.js','utf8').split('\n').slice(0,103).join('\n')
  .replace("open=store.get('open',false)","open=false");
const main=fs.readFileSync('app3-main.js','utf8');
const game=fs.readFileSync('game.js','utf8');
// app3-main ends with the outer IIFE closer "})();" — insert game.js just before it so it runs inside the closure (sees $, T, D, helpers)
const idx=main.lastIndexOf('})();');
if(idx<0)throw new Error('closer not found');
const merged=head+'\n'+main.slice(0,idx)+'\n/* --- game module --- */\n'+game+'\n'+main.slice(idx);
fs.writeFileSync('app3.js',merged);
console.log('app3.js built',(merged.length/1024).toFixed(0)+'KB');
