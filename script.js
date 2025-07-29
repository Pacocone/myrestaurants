// Simplified rebuild ...
// star rating handling
const ratingWrap = byId('rating');
function paintStars(v){
  ratingWrap?.querySelectorAll('button[data-value]').forEach(btn=>{
    const val = parseInt(btn.dataset.value,10);
    btn.classList.toggle('filled', val<=v);
  });
}
ratingWrap?.querySelectorAll('button[data-value]').forEach(btn=>{
  btn.addEventListener('click',()=>{
    byId('ratingValue').value = btn.dataset.value;
    paintStars(parseInt(btn.dataset.value,10));
  });
});
byId('ratingClear')?.addEventListener('click', ()=>{
  byId('ratingValue').value = '0';
  paintStars(0);
});

const $=s=>document.querySelector(s);const byId=id=>document.getElementById(id);
let state={visits:[]};const DB_KEY='visitas_restaurantes_v1';function load(){try{state.visits=JSON.parse(localStorage.getItem(DB_KEY)||'[]')}catch(e){state.visits=[]}}function save(){localStorage.setItem(DB_KEY,JSON.stringify(state.visits));try{scheduleAutoPublish()}catch(e){}}
function uid(){return Math.random().toString(36).slice(2)+Date.now().toString(36)}
function todayISO(){return new Date().toISOString().slice(0,10)}
function norm(s){return (s||'').toString().trim().replace(/\s+/g,' ').toLocaleLowerCase('es-ES')}
function avg(a){return a.length?a.reduce((x,y)=>x+y,0)/a.length:0;}
document.addEventListener('DOMContentLoaded',()=>{initTheme();load();initForm();initFriendsUsers();})
// ---- Theme handling (light/dark) ----
function updateMetaThemeColor(){
  const meta = document.querySelector('meta[name="theme-color"]');
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  if(meta){ meta.setAttribute('content', isDark ? '#0b0e14' : '#ff4d6d'); }
}
function applyTheme(theme){
  if(theme === 'system'){
    document.documentElement.removeAttribute('data-theme');
  }else if(theme === 'dark'){
    document.documentElement.setAttribute('data-theme','dark');
  }else{
    document.documentElement.removeAttribute('data-theme'); // light
  }
  localStorage.setItem('rt_theme', theme);
  const btn = document.getElementById('themeToggle');
  if(btn){ btn.textContent = (document.documentElement.getAttribute('data-theme')==='dark') ? '☀️' : '🌙'; }
  updateMetaThemeColor();
}
function initTheme(){
  let pref = localStorage.getItem('rt_theme');
  if(!pref || pref==='system'){
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    applyTheme(prefersDark ? 'dark' : 'light');
  }else{
    applyTheme(pref);
  }
  const toggle = document.getElementById('themeToggle');
  if(toggle){
    toggle.addEventListener('click', ()=>{
      const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      applyTheme(isDark ? 'light' : 'dark');
    });
  }
  if(window.matchMedia){
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e)=>{
      const pref = localStorage.getItem('rt_theme') || 'system';
      if(pref==='system'){ applyTheme(e.matches ? 'dark' : 'light'); }
    });
  }
}


function initForm(){
const mapsBtn = byId('mapsSearch');
mapsBtn?.addEventListener('click', ()=>{
  const name = byId('restaurant').value.trim();
  if(!name){alert('Introduce el nombre del restaurante');return;}
  const q = encodeURIComponent(name);
  window.open('https://www.google.com/maps/search/?api=1&query='+q, '_blank');
});

  const dinersEl = byId('diners');
  const totalEl = byId('total');
  const avgEl   = byId('avgPerDiner');
  function updateAvg(){
    const diners = parseInt(dinersEl.value||'0',10);
    const total  = parseFloat(totalEl.value||'0');
    avgEl.value = diners>0 ? (Math.round((total/diners)*100)/100).toFixed(2)+' €' : '—';
  }
  dinersEl?.addEventListener('input', updateAvg);
  totalEl ?.addEventListener('input', updateAvg);
  updateAvg();
byId('date').value=todayISO();byId('visitForm')?.addEventListener('submit',e=>{e.preventDefault();const v={id:uid(),restaurant:byId('restaurant').value,date:byId('date').value,diners:parseInt(byId('diners').value,10)||1,total:parseFloat(byId('total').value)||0,rating:parseInt(byId('ratingValue').value,10)||0,city:byId('city').value||'',notes:byId('notes').value||'',avg:0,mapsUrl:byId('mapsUrl').value||''};v.avg=v.diners?v.total/v.diners:0;state.visits.unshift(v);save();alert('Visita guardada');});}

let SUPA={url: localStorage.getItem('rt_supabase_url') || (window.APP_CONFIG&&window.APP_CONFIG.SUPABASE_URL) || '', anon: localStorage.getItem('rt_supabase_anon') || (window.APP_CONFIG&&window.APP_CONFIG.SUPABASE_ANON_KEY) || ''};
let supa=null;function ensureSupa(){if(!SUPA.url||!SUPA.anon) return null; if(!supa){supa=window.supabase.createClient(SUPA.url,SUPA.anon);} return supa;}
async function getCurrentUser(){const c=ensureSupa();if(!c)return null;const {data}=await c.auth.getUser();return data?.user||null;}
async function signInWithEmail(email){const c=ensureSupa();if(!c) throw new Error('Configura SUPABASE_URL y ANON_KEY');const redirect=location.origin+location.pathname;const {error}=await c.auth.signInWithOtp({email,options:{emailRedirectTo:redirect}});if(error) throw error;}
async function signOut(){const c=ensureSupa();if(!c)return;await c.auth.signOut();}
async function upsertProfileUsername(username){const c=ensureSupa();if(!c) throw new Error('Configura Supabase');const user=await getCurrentUser();if(!user) throw new Error('Inicia sesión');const {error}=await c.from('profiles').upsert({id:user.id,username}).select();if(error) throw error;}
function myShareItemsUsers(){const map=new Map();for(const v of state.visits){const key=norm(v.restaurant)+'|'+norm(v.city||'');const item=map.get(key)||{restaurant:v.restaurant,city:v.city||'',totalsPP:[],ratings:[],visits:0,mapsUrl:v.mapsUrl||''};if(v.diners>0)item.totalsPP.push(v.total/v.diners);item.ratings.push(v.rating||0);item.visits++;if(v.mapsUrl)item.mapsUrl=v.mapsUrl;map.set(key,item);}return Array.from(map.values()).map(x=>({restaurant:x.restaurant,city:x.city,visits:x.visits,avgPP:avg(x.totalsPP),avgRating:avg(x.ratings),mapsUrl:x.mapsUrl}))}
async function publishMySummary(){const c=ensureSupa();if(!c) throw new Error('Configura Supabase');const user=await getCurrentUser();if(!user) throw new Error('Inicia sesión');const items=myShareItemsUsers();const {error}=await c.from('summaries').upsert({owner_id:user.id,items}).select();if(error) throw error;}
let autoPublishTimer=null;function scheduleAutoPublish(){if(autoPublishTimer) clearTimeout(autoPublishTimer);autoPublishTimer=setTimeout(()=>{publishMySummary().catch(()=>{})},2000)}

async function updateAccountInfo(){const info=byId('accountInfo');const c=ensureSupa();if(!c){info.textContent='Supabase no configurado';return;}const user=await getCurrentUser();if(user){info.innerHTML='Conectado: <strong>'+(user.email||user.id)+'</strong>';}else{info.textContent='No has iniciado sesión.';}}
function initFriendsUsers(){byId('supabaseUrlInput').value=SUPA.url;byId('supabaseAnonInput').value=SUPA.anon;
byId('saveSupabaseCfgBtn').addEventListener('click',()=>{SUPA.url=byId('supabaseUrlInput').value.trim();SUPA.anon=byId('supabaseAnonInput').value.trim();localStorage.setItem('rt_supabase_url',SUPA.url);localStorage.setItem('rt_supabase_anon',SUPA.anon);supa=null;updateAccountInfo();alert('Configuración guardada.');});
byId('clearSupabaseCfgBtn').addEventListener('click',()=>{localStorage.removeItem('rt_supabase_url');localStorage.removeItem('rt_supabase_anon');SUPA={url:(window.APP_CONFIG&&window.APP_CONFIG.SUPABASE_URL)||'',anon:(window.APP_CONFIG&&window.APP_CONFIG.SUPABASE_ANON_KEY)||''};supa=null;byId('supabaseUrlInput').value=SUPA.url;byId('supabaseAnonInput').value=SUPA.anon;updateAccountInfo();alert('Configuración borrada (se usarán las preconfiguradas).');});
byId('sendMagicLink').addEventListener('click',async()=>{try{const email=byId('authEmail').value.trim();if(!email){alert('Introduce un email');return;}await signInWithEmail(email);alert('Te enviamos un enlace de inicio de sesión a tu correo.');}catch(e){alert(e.message||e);}});
byId('checkSessionBtn').addEventListener('click',async()=>{try{await updateAccountInfo();const c=ensureSupa();const {data}=await c.auth.getUser();alert(data?.user?'Sesión activa':'No hay sesión');}catch(e){alert(e.message||e);}});
byId('signOutBtn').addEventListener('click',async()=>{try{await signOut();await updateAccountInfo();}catch(e){alert(e.message||e);}});
byId('saveUsernameBtn').addEventListener('click',async()=>{try{const uname=byId('usernameInput').value.trim();if(!uname){alert('Introduce un nombre de usuario');return;}await upsertProfileUsername(uname);alert('Nombre de usuario guardado.');await updateAccountInfo();}catch(e){alert(e.message||e);}});
updateAccountInfo();}
