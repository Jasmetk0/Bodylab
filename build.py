from pathlib import Path
root=Path(__file__).resolve().parent
src=root/'src'
html=(src/'index.template.html').read_text(encoding='utf-8')
css=(src/'styles.css').read_text(encoding='utf-8')
js='\n\n'.join((src/f).read_text(encoding='utf-8') for f in ['seed.js','math.js','app.js'])
result=html.replace('<!--APP_CSS-->',css).replace('<!--APP_JS-->',js)
standalone=result.replace('<!--PWA_HEAD-->','').replace('<!--PWA_REGISTER-->','')
(root/'standalone.html').write_text(standalone,encoding='utf-8')
pwaHead='<link rel="manifest" href="./manifest.webmanifest"/><link rel="icon" type="image/svg+xml" href="./assets/icon.svg"/>'
pwaScript='<script>if("serviceWorker" in navigator && (location.protocol==="https:" || location.hostname==="localhost" || location.hostname==="127.0.0.1")) { navigator.serviceWorker.register("./sw.js").catch(()=>{}); }</script>'
hosted=result.replace('<!--PWA_HEAD-->',pwaHead).replace('<!--PWA_REGISTER-->',pwaScript)
(root/'index.html').write_text(hosted,encoding='utf-8')
print('Built hosted:',len(hosted),'bytes; standalone:',len(standalone),'bytes')
