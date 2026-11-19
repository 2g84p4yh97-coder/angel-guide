# Baut artifact.html (claude.ai-Seite) und dist/ (GitHub Pages, offline-fähig) aus src/
import json,os,hashlib
here=os.path.dirname(os.path.abspath(__file__)); s=lambda n:open(os.path.join(here,'src',n),encoding='utf-8').read()
regs=json.dumps(json.load(open(os.path.join(here,'src','regs.json'),encoding='utf-8')),ensure_ascii=False,separators=(',',':'))
imgs=json.load(open(os.path.join(here,'src','img_meta.json'),encoding='utf-8'))
imgs={k:v for k,v in imgs.items() if os.path.exists(os.path.join(here,'img',k+'.jpg'))}
js='window.REGS='+regs+';\nwindow.IMG='+json.dumps(imgs,ensure_ascii=False,separators=(',',':'))+';\n'+s('baits.js')+s('fish.js')+s('waters.js')+s('rigs.js')+s('spots.js')+s('methods.js')+s('app.js')
css=s('app.css')
body='<div id="app"></div>\n<nav class="tabs" id="tabs" aria-label="Bereiche"></nav>\n'
open(os.path.join(here,'artifact.html'),'w',encoding='utf-8').write(
 '<title>Köder-Guide</title>\n<meta name="claude:viewport-fit-sides" content="cover">\n<style>\n'+css+'</style>\n'+body+'<script>\n'+js+'</script>\n')
d=here  # GitHub Pages liefert das Repo-Wurzelverzeichnis aus
import shutil
if os.path.abspath(d)!=here: shutil.copytree(os.path.join(here,'img'),os.path.join(d,'img'),dirs_exist_ok=True)
ver=hashlib.sha1((js+css).encode()).hexdigest()[:8]
open(os.path.join(d,'index.html'),'w',encoding='utf-8').write('''<!doctype html>
<html lang="de"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>Köder-Guide</title>
<meta name="apple-mobile-web-app-capable" content="yes"><meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-title" content="Köder-Guide">
<meta name="apple-mobile-web-app-status-bar-style" content="default">
<meta name="theme-color" content="#edf2f0" media="(prefers-color-scheme: light)"><meta name="theme-color" content="#0b1615" media="(prefers-color-scheme: dark)">
<link rel="manifest" href="manifest.webmanifest"><link rel="apple-touch-icon" href="icon-180.png"><link rel="icon" href="icon-192.png">
<style>:root{padding:env(safe-area-inset-top,0px) 0 env(safe-area-inset-bottom,0px)}body{margin:0}[hidden]{display:none!important}
'''+css+'''</style></head><body>
'''+body+'''<script>
'''+js+'''
if("serviceWorker" in navigator){navigator.serviceWorker.register("sw.js").catch(function(){})}
</script></body></html>
''')
open(os.path.join(d,'manifest.webmanifest'),'w',encoding='utf-8').write(json.dumps({"name":"Köder-Guide","short_name":"Köder-Guide","lang":"de","start_url":"./","scope":"./","display":"standalone","background_color":"#0b1615","theme_color":"#0f5c5a","icons":[{"src":"icon-192.png","sizes":"192x192","type":"image/png"},{"src":"icon-512.png","sizes":"512x512","type":"image/png","purpose":"any maskable"}]},ensure_ascii=False,indent=1))
open(os.path.join(d,'sw.js'),'w',encoding='utf-8').write('''const C="koeder-guide-%s";const A=["./","index.html","manifest.webmanifest","icon-180.png","icon-192.png","icon-512.png"].concat(%s);
self.addEventListener("install",e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(A)).then(()=>self.skipWaiting()))});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener("fetch",e=>{if(e.request.method!=="GET")return;e.respondWith(fetch(e.request).then(r=>{const cp=r.clone();caches.open(C).then(c=>c.put(e.request,cp));return r}).catch(()=>caches.match(e.request,{ignoreSearch:true}).then(r=>r||caches.match("index.html"))))});
'''%(ver,json.dumps(['img/'+k+'.jpg' for k in imgs])))
print('ok',ver,len(js))
