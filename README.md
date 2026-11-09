# אטלס העם היהודי · Atlas of the Jewish People

מפה אינטראקטיבית דו-לשונית (עברית/אנגלית) של ההיסטוריה היהודית: ציר זמן לא-לינארי מסונכרן עם מפת עולם, מפת חום של מרכז הכובד של הקהילות לאורך הדורות, ומרכז משחקים לימודי.

An interactive bilingual atlas of Jewish history — a non-linear timeline synced to a world map, a center-of-gravity heatmap of Jewish communities over time, and a learning-games hub.

## בנייה / Build

```bash
npm run build      # → index.html  (עמוד סטטי יחיד, self-contained, בשורש)
npm run preview    # מגיש מקומית על http://localhost:8080
```

`build.js` מריץ את הצנרת לפי הסדר:

1. `build-data.js` → מאחד את `data/*.json` ואת מפות התקופות מ-`maps/out/` + `maps/land-110m.json` ל-`bundle-{data,maps,land}.json`.
2. `mkapp.js` → ממזג את מנוע האפליקציה (`app2.js` + `app3-main.js`) עם מודול המשחקים (`game.js`) ל-`app3.js`.
3. `assemble.js` → מטמיע הכל לתוך `jewish-atlas.html` (גוף ה-artifact) ו-`preview.html`.
4. `build-deploy.js` → עוטף ל-`index.html` (בשורש) עם `<head>` מלא (title, meta, favicon, OG).

התוצר `index.html` הוא קובץ יחיד עצמאי; D3 ו-topojson נטענים מ-cdnjs בזמן ריצה.

## מבנה / Structure

| נתיב | תיאור |
|------|-------|
| `app2.js` | מנוע ציר-הזמן המעוקם + פענוח הנתונים (103 השורות הראשונות נכנסות לבנייה) |
| `app3-main.js` | גוף האפליקציה — מפה, מרכזי כובד, שכבות, פאנל פרטים |
| `game.js` | מרכז המשחקים — מסע בזמן, קו הזמן, סדר אותם, מה הסיפור? |
| `app3.html` | מבנה ה-DOM + כל ה-CSS |
| `data/` | מקורות התוכן (תקופות, דמויות, ידידים/צוררים, אירועים, מרכזי כובד, חידון) |
| `maps/out/` | מפות גבולות היסטוריות מעובדות (TopoJSON לפי שנה) |

לעריכת תוכן (עובדות, תאריכים, השפעות) — ערוך את `data/*.json` והרץ `npm run build`.

## פריסה / Deploy (Vercel)

הרפו (`phizben/Jewish-History`) מחובר ל-Vercel דרך GitHub: כל `git push` ל-main מפעיל דיפלוי אוטומטי אל https://jewish-history-five.vercel.app.
האתר מוגש כקובץ סטטי בשורש — `index.html` (מחויב ל-git). לעדכון: `npm run build` ואז `git push`.
