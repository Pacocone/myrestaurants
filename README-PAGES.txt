# Mis Restaurantes — paquete listo para GitHub Pages (v12-final)

## Contenido
- index.html
- styles.css
- script.js
- config.js (Supabase preconfigurado)
- service-worker.js (PWA; caché rt-v12)
- manifest.webmanifest
- icons/icon-192.png, icon-512.png
- .nojekyll

## Publicar en GitHub Pages
1) Crea un repo y sube **todo el contenido** de esta carpeta a la **raíz del repo** (que `index.html` quede arriba).
2) Repo → Settings → Pages → **Deploy from a branch** → Branch: `main` → Folder: `/ (root)` → Save.
3) Espera 1–2 minutos y visita la URL que te da Pages.
4) Si ves una versión vieja, haz *hard refresh* (Cmd+Shift+R) o desregistra el SW en la consola:
   navigator.serviceWorker.getRegistrations().then(rs => rs.forEach(r => r.unregister()));
   caches.keys().then(keys => Promise.all(keys.map(k => caches.delete(k))));

## Supabase
- Ya viene con SUPABASE_URL y ANON_KEY preconfiguradas.
- En tu proyecto: Auth → URL Configuration, añade tu dominio de Pages a *Site URL* y *Redirect URLs*.
- Para rotar la anon key: Settings → API → Regenerate, actualiza `config.js` y vuelve a subir.

¡Listo!