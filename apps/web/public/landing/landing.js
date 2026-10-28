/* Travel OS landing: interactividad (simulación con datos ficticios + acceso a la demo real). */
(function(){
/* Interactividad de la landing pública (simulación con datos ficticios + acceso a la demo real). */
// Cuenta de la agencia demo. Es de solo lectura en la API (DEMO_READONLY_AGENCY_IDS), no es de administración real.
const DEMO = { email: "gerente@demo.travelos.local", password: "TravelOS!demo1", agencySlug: "demo-agencia" };
function initLanding(root) {
const $=s=>root.querySelector(s),$$=s=>[...root.querySelectorAll(s)];const cleanups=[];
const fmt=n=>'$'+n.toLocaleString('es-CO');
const WA='573015761939';let seg='Agencia de viajes';
function setCTA(){const t=`Hola PDP, me interesa Travel OS. Soy: ${seg}. Quiero agendar una demostración.\nEmpresa:\nCiudad:`;
 $('#wa').href=$('#wa2').href='https://wa.me/'+WA+'?text='+encodeURIComponent(t);
 $('#mail').href='mailto:contacto@pdpcomunica.com?subject='+encodeURIComponent('Me interesa Travel OS ('+seg+')')+'&body='+encodeURIComponent(t);}
setCTA();
$$('.seg button').forEach(b=>b.onclick=()=>{$$('.seg button').forEach(x=>x.classList.remove('on'));b.classList.add('on');seg=b.dataset.s;setCTA()});
$$('[data-seg]').forEach(a=>a.addEventListener('click',()=>{const m=a.dataset.seg==='mayorista';$$('.seg button')[m?1:0].click()}));
const onScroll=()=>$('#nav').classList.toggle('solid',scrollY>40);addEventListener('scroll',onScroll);onScroll();cleanups.push(()=>removeEventListener('scroll',onScroll));
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}}),{threshold:.12});
$$('.reveal').forEach(el=>io.observe(el));cleanups.push(()=>io.disconnect());
// tabs
$$('.tab').forEach(t=>t.onclick=()=>{$$('.tab').forEach(x=>x.classList.remove('on'));$$('.panel').forEach(x=>x.classList.remove('on'));t.classList.add('on');$('#p-'+t.dataset.t).classList.add('on');if(t.dataset.t==='tab')runTab()});
// cotizador
const CAT={
 cartagena:[['Hotel Mar Azul (ficticio) · 4 noches frente al mar',1980000],['Hotel Boutique Murallas (ficticio) · 4 noches centro histórico',2360000],['Hostal Brisa (ficticio) · 4 noches',1120000],['Plan Islas del Rosario (ficticio)',380000],['Traslados aeropuerto',120000],['Tour ciudad amurallada',150000]],
 'san andrés':[['Resort Coral (ficticio) · 5 noches todo incluido',6400000],['Posada Nativa (ficticia) · 5 noches con desayuno',3100000],['Tour Johnny Cay y acuario',520000],['Traslados',160000],['Vuelta a la isla',240000]],
 eje:[['Finca Cafetal (ficticia) · 3 noches con piscina',3600000],['Glamping Montaña (ficticio) · 3 noches',2700000],['Tour del café',450000],['Valle de Cocora',380000],['Transporte privado grupo',900000]],
 cusco:[['Hotel Inca Real (ficticio) · 6 noches',4200000],['Casa Andina Boutique (ficticia) · 6 noches',3300000],['Tour Machu Picchu con tren',2400000],['Valle Sagrado',600000],['Traslados',200000]]};
function pick(q){q=q.toLowerCase();if(q.includes('andr'))return['san andrés','San Andrés',4];if(q.includes('cafe')||q.includes('eje'))return['eje','Eje Cafetero',10];if(q.includes('cusco')||q.includes('machu'))return['cusco','Cusco',2];return['cartagena','Cartagena',2]}
$$('.chips button').forEach(b=>b.onclick=()=>{$('#req').value=b.dataset.q;gen()});
$('#gen').onclick=gen;
function gen(){const out=$('#cotout'),[k,name,pax]=pick($('#req').value),c=CAT[k];
 out.innerHTML='<div class="thinking"><span class="dots"><span></span><span></span><span></span></span>La IA está revisando el catálogo de la agencia…</div>';
 setTimeout(()=>{const alts=[{n:'Esencial',i:[c[2]||c[1],c[c.length-2]]},{n:'Recomendada',i:[c[0],c[3]||c[2],c[c.length-2]],best:1},{n:'Premium',i:[c[1],c[3]||c[2],c[4]||c[2],c[c.length-1]]}];
  out.innerHTML=`<div class="note" style="margin:0">Cotización para <b>${name}</b> · ${pax} viajeros · valores por persona en COP (ejemplo ficticio)</div>`+alts.map((a,ix)=>{const tot=a.i.reduce((s,x)=>s+x[1],0);return `<div class="opt ${a.best?'best':''}" style="animation-delay:${ix*.15}s"><h4>Alternativa ${a.n}${a.best?'<span class="badge">Sugerida</span>':''}</h4><div class="pr">${fmt(tot)}<small>Total grupo ${fmt(tot*pax)}</small></div><ul>${a.i.map(x=>'<li>• '+x[0]+'</li>').join('')}</ul></div>`}).join('')+
  `<div class="optact"><button onclick="this.textContent='✓ PDF generado (demo)'">Descargar PDF</button><button onclick="this.textContent='✓ Vinculada al prospecto (demo)'">Vincular al prospecto</button><button disabled title="En desarrollo">Enviar al viajero · Próximamente</button></div>`},1300)}
// CRM
const STAGES=['Prospecto','Cotizando','En cierre','Ganado','Perdido'];
let leads=[{n:'Laura Gómez',d:'Cartagena · 2 pax',s:0,sc:92,r:'Pidió cotización hace 2 días, sin respuesta'},{n:'Carlos Ruiz',d:'Cusco · 2 pax',s:1,sc:78,r:'Tarea vencida: enviar alternativas'},{n:'Familia Ortiz',d:'San Andrés · 4 pax',s:1,sc:64,r:'Comparando con otra agencia'},{n:'Grupo Andes',d:'Eje Cafetero · 10 pax',s:2,sc:88,r:'Pidió reservar esta semana'},{n:'Sofía Marín',d:'Punta Cana · 2 pax',s:0,sc:41,r:'Viaje para dentro de 6 meses'},{n:'Diego Vélez',d:'Santa Marta · 3 pax',s:3,sc:100,r:'Pagó la reserva'},{n:'Ana Restrepo',d:'Medellín · 2 pax',s:4,sc:12,r:'Cambió de planes'}];
function drawK(){const k=$('#kanban');k.innerHTML=STAGES.map((st,i)=>`<div class="col" data-s="${i}"><h5>${st}<span>${leads.filter(l=>l.s===i).length}</span></h5>${leads.map((l,j)=>l.s!==i?'':`<div class="lead-c" draggable="true" data-j="${j}" title="${l.r}"><b>${l.n} <small style="color:#94a3b8;font-weight:500">(ficticio)</small></b>${l.d}<div class="sc"><span class="score ${l.sc>75?'s-h':l.sc>40?'s-m':'s-l'}">${l.sc}</span>${l.r}</div></div>`).join('')}</div>`).join('');
 $$('.lead-c').forEach(c=>{c.ondragstart=e=>e.dataTransfer.setData('j',c.dataset.j);c.onclick=()=>{const l=leads[c.dataset.j];if(l.s<3){l.s++;drawK()}}});
 $$('.col').forEach(c=>{c.ondragover=e=>{e.preventDefault();c.classList.add('over')};c.ondragleave=()=>c.classList.remove('over');c.ondrop=e=>{e.preventDefault();leads[e.dataTransfer.getData('j')].s=+c.dataset.s;drawK()}})}
drawK();
// itinerario
const DAYS=[['Llegada a Cartagena','Traslado al hotel, check-in y atardecer en la ciudad amurallada.'],['Tour ciudad amurallada','Recorrido guiado por el centro histórico y Getsemaní.'],['Islas del Rosario','Día completo en lancha, almuerzo típico y snorkel.'],['Día libre','Playa y recomendaciones gastronómicas de la agencia.'],['Regreso','Check-out y traslado al aeropuerto.']];
$('#days').innerHTML=DAYS.map((d,i)=>`<li class="${i?'':'on'}" data-i="${i}"><div class="d">DÍA<b>${i+1}</b></div><div><b>${d[0]}</b><p>${d[1]}</p></div></li>`).join('');
let ptab='it',cur=0,chat=[['Hola Andrea, bienvenida. Tu traslado te espera en la salida nacional.',0]];
$$('#days li').forEach(li=>li.onclick=()=>{$$('#days li').forEach(x=>x.classList.remove('on'));li.classList.add('on');cur=+li.dataset.i;ptab='it';drawP()});
$$('.ptabs span').forEach(s=>s.onclick=()=>{ptab=s.dataset.p;drawP()});
function drawP(){$$('.ptabs span').forEach(s=>s.classList.toggle('on',s.dataset.p===ptab));const b=$('#pbody');
 if(ptab==='it')b.innerHTML=DAYS.map((d,i)=>`<div class="it" style="${i===cur?'outline:2px solid #ff7a59':''}"><b>Día ${i+1} · ${d[0]}</b>${d[1]}</div>`).join('');
 if(ptab==='doc')b.innerHTML=['Voucher hotel (PDF)','Tiquetes aéreos (PDF)','Seguro de viaje (PDF)','Recomendaciones del destino'].map(x=>`<div class="it">📄 ${x}<br><small style="color:#94a3b8">Documento de ejemplo</small></div>`).join('');
 if(ptab==='chat'){b.innerHTML=`<div class="msgs">${chat.map(m=>`<div class="msg ${m[1]?'me':''}">${m[0]}</div>`).join('')}</div><div class="chatin"><input id="ci" placeholder="Escribe a tu agencia…"><button id="cs">➤</button></div>`;
  const send=()=>{const v=$('#ci').value.trim();if(!v)return;chat.push([v,1]);drawP();setTimeout(()=>{chat.push(['¡Claro! Un asesor de la agencia te responde en minutos. (respuesta de demo)',0]);if(ptab==='chat')drawP()},900)};
  $('#cs').onclick=send;$('#ci').onkeydown=e=>{if(e.key==='Enter')send()};b.scrollTop=1e4}}
drawP();
// mayorista
const PR=[['Caribe Mágico 5D/4N','Dic · Ene',18,2150000],['Ruta del Café 4D/3N','Todo el año',6,1480000],['Perú Esencial 7D/6N','Mar · Abr',3,4900000],['San Andrés Full 5D/4N','Semana Santa',24,2890000]];
$('#progs').innerHTML=PR.map((p,i)=>`<div class="tr"><span><b>${p[0]}</b><br><small class="muted">Programa ficticio</small></span><span>${p[1]}</span><span><span class="cup ${p[2]<8?'low':''}" id="cu${i}">${p[2]}</span></span><span>${fmt(p[3])}</span><button data-i="${i}">Reservar cupo</button></div>`).join('');
$$('#progs button').forEach(b=>b.onclick=()=>{const i=b.dataset.i;if(PR[i][2]>0){PR[i][2]--;const c=$('#cu'+i);c.textContent=PR[i][2];c.classList.toggle('low',PR[i][2]<8);b.textContent='✓ Reservado';b.classList.add('done');setTimeout(()=>{b.textContent='Reservar cupo';b.classList.remove('done')},1400)}});
$('#ags').innerHTML=[['Viajes Horizonte',14],['Rutas del Sol',9],['Andina Tours',7],['Mundo Azul Viajes',5]].map(a=>`<li>${a[0]} (ficticia)<b>${a[1]} reservas</b></li>`).join('');
// tablero
let ran=0;function runTab(){if(ran)return;ran=1;$$('[data-n]').forEach(el=>{const n=+el.dataset.n,t0=performance.now();const f=now=>{const p=Math.min(1,(now-t0)/1200),v=n*p;el.textContent=n===84.2?'$'+v.toFixed(1).replace('.',',')+' M':n===32?Math.round(v)+' %':Math.round(v);if(p<1)requestAnimationFrame(f)};requestAnimationFrame(f)});
 const hb=(id,arr)=>{$(id).innerHTML=arr.map(a=>`<div class="hb">${a[0]} <span class="muted">· ${a[1]}</span><div><i data-w="${a[2]}"></i></div></div>`).join('');setTimeout(()=>$$(id+' i').forEach(i=>i.style.width=i.dataset.w+'%'),60)};
 hb('#ases',[['Valentina (ficticia)','$31,5 M',100],['Mateo (ficticio)','$24,1 M',76],['Camila (ficticia)','$18,0 M',57],['Andrés (ficticio)','$10,6 M',34]]);
 hb('#dest',[['Cartagena','11 viajes',100],['San Andrés','8 viajes',73],['Eje Cafetero','6 viajes',55],['Cusco','2 viajes',18]])}

// capturas reales
$$('.shot').forEach(b=>b.onclick=()=>{$$('.shot').forEach(x=>x.classList.remove('on'));b.classList.add('on');const im=$('#shotimg');im.style.opacity='0';setTimeout(()=>{im.src='/landing/'+b.dataset.img+'.webp';im.style.opacity='1'},180);$('#shotcap').textContent=b.dataset.cap});
// demo real
const dl=$('#demoLogin');if(dl)dl.onclick=async()=>{const err=$('#demoErr');err.hidden=true;dl.disabled=true;dl.textContent='Entrando…';
 try{const r=await fetch('/api/auth/login',{method:'POST',credentials:'include',headers:{'content-type':'application/json'},body:JSON.stringify(DEMO)});
  if(!r.ok)throw new Error(String(r.status));const d=await r.json();localStorage.setItem('travelos.session.user',JSON.stringify(d.user));location.href='/';}
 catch(e){err.textContent='No pudimos abrir la demo en este momento. Intenta de nuevo o escríbenos por WhatsApp.';err.hidden=false;dl.disabled=false;dl.textContent='Entrar a la demo ▸'}};
return ()=>cleanups.forEach(f=>f());

}

function boot(){var r=document.querySelector(".lp"),n=r&&r.querySelector("#nav");if(n&&!n.dataset.ready){n.dataset.ready="1";if(window.__lpCleanup)window.__lpCleanup();window.__lpCleanup=initLanding(r);}}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot);else boot();
new MutationObserver(boot).observe(document.body,{childList:true,subtree:true});
})();
