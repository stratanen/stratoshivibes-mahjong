// Holder perks: read-only wallet connection. Never requests a transaction or signature.
(function(){
const HOLDER_CFG={
  rpc:'https://mainnet.helius-rpc.com/?api-key=b9b945b9-2831-4343-aab8-9d8a62c5719f',          // Helius RPC URL with a domain-restricted API key (DAS enabled)
  collection:'DDERmEEpPv5wuWNbNyiNQu5uVVVea6xmUdw6JcECGG6p'    // StratoshiVibes Vol.1 Degens collection address
};
// Words found in each card's on-chain name or attributes -> tile id
const MATCH=[['paperhands',/paper\s*hands?/i],['diamond',/diamond\s*hands?/i],['rugpuller',/rug/i],['shiller',/shill/i],['fudster',/fud/i],
 ['nocoiner',/no\s*coin/i],['whale',/whale/i],['shrimp',/shrimp/i],['crab',/crab/i],['maxi',/maxi/i],['bull',/bull/i],['bear',/bear/i],['degen',/degen/i]];
const owned=new Map(); // tile id -> count
let total=0, loading=false, addr=null, status='';
const short=a=>a.slice(0,4)+'…'+a.slice(-4);
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

const css=document.createElement('style');css.textContent=`
.wbtn{display:inline-flex;align-items:center;gap:6px;height:34px;border-radius:99px;border:1px solid #ffffff2a;background:#ffffff0d;color:var(--ink);font:700 12px var(--f-body);padding:0 10px;cursor:pointer;white-space:nowrap}
.wbtn svg{flex:none}
.wbtn.on{border-color:#e3b54a88}
.wbtn .dot{width:7px;height:7px;border-radius:50%;background:var(--gold);box-shadow:0 0 8px var(--gold)}
.wbtn:focus-visible{outline:2px solid var(--gold);outline-offset:2px}
.tile.holo{background:linear-gradient(135deg,#fff4cf,#f4ecd8 35%,#e9f4ff 55%,#f9e3ff 75%,#fff1c2)}
.tile.holo::after{content:"";position:absolute;inset:0;border-radius:inherit;border:2px solid var(--gold);pointer-events:none;
 background:linear-gradient(115deg,transparent 30%,#ffffff99 45%,transparent 60%);background-size:250% 100%;animation:holo 3.2s linear infinite;mix-blend-mode:soft-light}
@keyframes holo{from{background-position:120% 0}to{background-position:-130% 0}}
@media (prefers-reduced-motion:reduce){.tile.holo::after{animation:none}}
.wlist{display:flex;flex-direction:column;gap:8px}
.witem{display:flex;align-items:center;gap:12px;padding:12px;border-radius:12px;border:1px solid #ffffff1f;background:#ffffff0a;color:var(--ink);font:700 14px var(--f-body);cursor:pointer;text-align:left}
.witem img{width:32px;height:32px;border-radius:8px}
.witem small{display:block;font-weight:400;font-size:11px;color:var(--muted)}
.witem:focus-visible{outline:2px solid var(--gold);outline-offset:2px}
.note{font-size:12px!important;color:var(--muted)!important}
.addr{font:600 13px ui-monospace,Menlo,monospace;background:#ffffff0d;border-radius:8px;padding:8px 10px;word-break:break-all}
.owned{display:grid;grid-template-columns:repeat(5,1fr);gap:6px}
.owned figure{margin:0;text-align:center;font-size:9px;color:var(--muted);position:relative}
.owned img{width:100%;border-radius:6px;background:var(--ivory);display:block;border:2px solid var(--gold)}
.owned b{position:absolute;top:-4px;right:-4px;background:var(--gold);color:#1a1405;border-radius:99px;font-size:10px;padding:1px 5px}
`;document.head.appendChild(css);

const WICON='<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><rect x="3" y="6" width="18" height="13" rx="2.5"/><path d="M3 9h14a4 4 0 0 1 4 4"/><circle cx="16.5" cy="13" r="1.3" fill="currentColor"/></svg>';
const btn=document.createElement('button');btn.className='wbtn';btn.id='walletBtn';
document.querySelector('.hbtns').prepend(btn);

function paintBtn(){btn.classList.toggle('on',!!addr);
 btn.innerHTML=addr?`${total?'<span class="dot"></span>':WICON}${short(addr)}`:`${WICON}Connect`;
 btn.setAttribute('aria-label',addr?`Wallet ${short(addr)}${total?`, holder of ${total} Degens`:''}`:'Connect wallet');}

function applyHolo(){for(const t of st.tiles){if(!t.el)continue;const g=GROUPS[t.g];t.el.classList.toggle('holo',g.kind==='char'&&owned.has(g.id))}}
const _refresh=refresh;refresh=function(){_refresh();applyHolo()};

async function loadHoldings(a){owned.clear();total=0;
 if(!HOLDER_CFG.rpc||!HOLDER_CFG.collection){paintBtn();return 'unconfigured'}
 loading=true;status='';
 try{let page=1,items=[];
  while(page<=5){const r=await fetch(HOLDER_CFG.rpc,{method:'POST',headers:{'Content-Type':'application/json'},
    body:JSON.stringify({jsonrpc:'2.0',id:'sv',method:'searchAssets',params:{ownerAddress:a,grouping:['collection',HOLDER_CFG.collection],page,limit:1000}})});
   const j=await r.json();if(j.error)throw new Error(j.error.message);const it=(j.result&&j.result.items)||[];items=items.concat(it);if(it.length<1000)break;page++;}
  for(const it of items){const md=(it.content&&it.content.metadata)||{};
   const text=[md.name,...(md.attributes||[]).map(x=>x.value)].join(' ');
   const hit=MATCH.find(([,re])=>re.test(text));if(hit){owned.set(hit[0],(owned.get(hit[0])||0)+1);total++}}
  status='ok';return 'ok';
 }catch(e){console.warn(e);status='error';return 'error'}
 finally{loading=false;paintBtn();refresh()}}

function wallets(){return window.SVWallet?SVWallet.list():[]}
function openPicker(){const ws=wallets();
 showOv(`<h2>Connect wallet</h2>
 <p>Degens holders see their characters as gold holo tiles. The game only reads your public address. It never asks you to sign or send anything.</p>
 ${ws.length?`<div class="wlist">${ws.map((w,i)=>`<button class="witem" data-i="${i}"><img src="${esc(w.icon)}" alt="">
   <span>${w.mwa?'Seeker / Android wallet':esc(w.name)}<small>${w.mwa?'Seed Vault, Phantom, Solflare and more':'Browser wallet'}</small></span></button>`).join('')}</div>`
 :`<p>No wallet found. On Seeker, open the game from the dApp Store. On other phones, install a Solana wallet such as Phantom or Solflare.</p>`}
 <p class="note">Tip: always check that a wallet request matches what you expect. This game will never request a transaction.</p>
 <button class="btn ghost" id="closeOv">Not now</button>`);
 document.querySelectorAll('.witem').forEach(b=>b.onclick=async()=>{const w=ws[+b.dataset.i];
  b.disabled=true;b.querySelector('small').textContent='Waiting for approval in your wallet…';
  try{const a=await SVWallet.connect(w.name);closeOv();await onAddress(a,true)}
  catch(e){b.disabled=false;b.querySelector('small').textContent='Not connected. Tap to try again.'}});}

function openAccount(){const list=CHARS.filter(c=>owned.has(c.id));
 showOv(`<h2>Your wallet</h2><div class="addr">${esc(addr)}</div>
 ${loading?'<p>Checking your Degens…</p>':
   !HOLDER_CFG.collection?'<p>Holder perks switch on in the next update.</p>':
   status==='error'?'<p>Could not check your Degens right now. Check your internet connection and try again.</p><button class="btn" id="wRetry">Try again</button>':
   total?`<p>You hold ${total} Vol.1 Degens. Their tiles shine gold on every board.</p><div class="owned">${list.map(c=>`<figure><img src="${IMG[c.id]}" alt=""><b>${owned.get(c.id)}</b><figcaption>${c.name}</figcaption></figure>`).join('')}</div>`
   :'<p>No Vol.1 Degens found in this wallet yet.</p>'}
 <div class="btns"><button class="btn ghost" id="closeOv">Back to game</button><button class="btn ghost" id="wOut">Disconnect</button></div>`);
 const rb=$('wRetry');if(rb)rb.onclick=async()=>{closeOv();await onAddress(addr,true)};
 $('wOut').onclick=async()=>{await (window.SVWallet&&SVWallet.disconnect());addr=null;owned.clear();total=0;store.del('dm_addr');paintBtn();refresh();closeOv();toast('Wallet disconnected')};}

async function onAddress(a,fresh){addr=a;store.set('dm_addr',a);paintBtn();const r=await loadHoldings(a);
 if(fresh)toast(r==='ok'?(total?`Holder: ${total} Degens now shine gold`:'Connected. No Degens found yet.'):r==='error'?'Connected. Could not check Degens right now.':'Wallet connected');}

btn.onclick=()=>addr?openAccount():openPicker();
window.addEventListener('svwallet-ready',()=>SVWallet.onChange(a=>{if(a&&a!==addr)onAddress(a,false)}));
const saved=store.get('dm_addr');if(saved&&/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(saved))onAddress(saved,false);else paintBtn();
})();
