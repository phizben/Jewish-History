const fs=require('fs');
const body=fs.readFileSync('jewish-atlas.html','utf8'); // app markup+style+data+script, no skeleton
const fav="data:image/svg+xml,"+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 34 34"><circle cx="17" cy="17" r="17" fill="%234C7FE0"/><path d="M17 7l8.7 15H8.3z M17 27L8.3 12h17.4z" fill="none" stroke="%23fff" stroke-width="2.4" stroke-linejoin="round"/></svg>');
const head=`<!doctype html>
<html lang="he">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>אטלס העם היהודי · Atlas of the Jewish People</title>
<meta name="description" content="אטלס אינטראקטיבי של ההיסטוריה היהודית — ידידים וצוררים, דמויות, אירועים ומרכזי החיים לאורך הדורות, על מפה וציר זמן. An interactive atlas of Jewish history.">
<meta name="theme-color" content="#0A0F1A">
<link rel="icon" href="${fav}">
<meta property="og:type" content="website">
<meta property="og:title" content="אטלס העם היהודי">
<meta property="og:description" content="מסע אינטראקטיבי בהיסטוריה היהודית — על מפה וציר זמן.">
<meta name="twitter:card" content="summary">
<style>[hidden]{display:none!important}*{box-sizing:border-box}html,body{margin:0;height:100%}body{background:#0A0F1A}img{max-width:100%}</style>
<script>window.va=window.va||function(){(window.vaq=window.vaq||[]).push(arguments)};</script>
<script defer src="/_vercel/insights/script.js"></script>
</head>
<body>
`;

fs.writeFileSync('index.html',head+body+'\n</body>\n</html>\n');
console.log('index.html',( (head.length+body.length)/1e6).toFixed(2)+'MB');
