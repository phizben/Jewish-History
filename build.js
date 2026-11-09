#!/usr/bin/env node
/* One-shot build: data bundles -> merged app -> artifact HTML -> deployable index.html */
const {execSync}=require('child_process');
const steps=[
 ['build-data.js','bundling data + maps'],
 ['mkapp.js','merging app + game modules'],
 ['assemble.js','inlining into jewish-atlas.html'],
 ['build-deploy.js','wrapping deployable index.html'],
];
for(const [f,label] of steps){
 process.stdout.write('→ '+label+' … ');
 execSync('node '+f,{stdio:['ignore','inherit','inherit']});
}
console.log('✓ build complete — index.html is ready to serve');
