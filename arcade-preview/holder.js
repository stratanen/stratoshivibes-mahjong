// StratoshiVibes Arcade: holder perks, shared by every game.
// Read-only: the wallet only shares its public address. Never requests a signature or a transaction.
// Connect once (in the Arcade lobby or in Mahjong) and every game knows which Vol.1 Degens you hold.
//
// Pages mark character elements with data-hid="<id>"; owned ones get the class "svh-on" (gold glow + star).
// A page that wants a Connect button puts an element with data-svh-slot where the button should go.
(function(){
const CFG={
  rpc:'https://mainnet.helius-rpc.com/?api-key=b9b945b9-2831-4343-aab8-9d8a62c5719f', // key restricted to stratanen.github.io
  collection:'DDERmEEpPv5wuWNbNyiNQu5uVVVea6xmUdw6JcECGG6p'                           // StratoshiVibes Vol.1 Degens
};
// Words found in each card's on-chain name or attributes -> character id
const MATCH=[['paperhands',/paper\s*hands?/i],['diamond',/diamond\s*hands?/i],['rugpuller',/rug/i],['shiller',/shill/i],['fudster',/fud/i],
 ['nocoiner',/no\s*coin/i],['whale',/whale/i],['shrimp',/shrimp/i],['crab',/crab/i],['maxi',/maxi/i],['bull',/bull/i],['bear',/bear/i],['degen',/degen/i]];
const NAME={bull:'Bull',bear:'Bear',whale:'Whale',diamond:'Diamond Hands',rugpuller:'Rugpuller',maxi:'Bitcoin Maxi',degen:'Degen',
 shiller:'Serial Shiller',fudster:'Serial FUDster',crab:'Crab',shrimp:'Shrimp',paperhands:'Paper Hands',nocoiner:'Nocoiner'};
const KEY='sv_holder';
const BASE=(document.currentScript&&document.currentScript.src||location.href).replace(/[^/]*$/,'');
const valid=a=>typeof a==='string'&&/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(a);
const load=()=>{try{return JSON.parse(localStorage.getItem(KEY))||{}}catch(e){return {}}};
const persist=()=>{try{localStorage.setItem(KEY,JSON.stringify(st))}catch(e){}};
let st=load();
if(!valid(st.addr)){st={};try{const a=localStorage.getItem('dm_addr');if(valid(a))st.addr=a}catch(e){}}   // earlier Mahjong-only versions
st.owned=st.owned||{};
let loading=false;
const subs=new Set();
const short=a=>a.slice(0,4)+'…'+a.slice(-4);
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

const api={
  get address(){return st.addr||null},
  get total(){return st.total||0},
  get loading(){return loading},
  get status(){return st.status||''},
  owned(){return Object.assign({},st.owned)},
  has(id){return !!st.owned[id]},
  count(id){return st.owned[id]||0},
  name(id){return NAME[id]||id},
  img(id){return BASE+'arcade-art/tile_'+id+'.webp'},
  onChange(f){subs.add(f);return()=>subs.delete(f)},
  refresh, openPicker, openAccount, disconnect
};
window.SVHolder=api;
function emit(){paint();decorate(document);for(const f of subs){try{f(api)}catch(e){console.warn(e)}}}
addEventListener('storage',e=>{if(e.key===KEY){st=load();st.owned=st.owned||{};emit()}});

async function refresh(force){
  if(!st.addr||loading)return st.status;
  if(!force&&st.status==='ok'&&Date.now()-(st.t||0)<5*60e3)return 'ok';
  loading=true;emit();
  try{let page=1,items=[];
    while(page<=5){
      const r=await fetch(CFG.rpc,{method:'POST',headers:{'Content-Type':'application/json'},
        body:JSON.stringify({jsonrpc:'2.0',id:'sv',method:'searchAssets',params:{ownerAddress:st.addr,grouping:['collection',CFG.collection],page,limit:1000}})});
      const j=await r.json();if(j.error)throw new Error(j.error.message);
      const it=(j.result&&j.result.items)||[];items=items.concat(it);if(it.length<1000)break;page++;}
    const owned={};let total=0;
    for(const it of items){const md=(it.content&&it.content.metadata)||{};
      const hit=MATCH.find(([,re])=>re.test(md.name||''))||MATCH.find(([,re])=>re.test((md.attributes||[]).map(x=>x.value).join(' ')));
      if(hit){owned[hit[0]]=(owned[hit[0]]||0)+1;total++}}
    st.owned=owned;st.total=total;st.status='ok';st.t=Date.now();
  }catch(e){console.warn(e);st.status='error'}
  finally{loading=false;persist();emit()}
  return st.status;}

async function setAddress(a,fresh){
  if(a!==st.addr){st={addr:a,owned:{},total:0}}
  persist();emit();
  const r=await refresh(fresh);
  if(fresh)toast(r==='ok'?(st.total?`Holder: ${st.total} Degens now shine gold`:'Connected. No Degens found yet.'):'Connected. Could not check Degens right now.');}

async function disconnect(){try{window.SVWallet&&await SVWallet.disconnect()}catch(e){}
  st={owned:{}};try{localStorage.removeItem(KEY);localStorage.removeItem('dm_addr')}catch(e){}emit();toast('Wallet disconnected');}

// ---------- look ----------
const css=document.createElement('style');css.textContent=`
.svh-btn{display:inline-flex;align-items:center;gap:6px;height:34px;border-radius:99px;border:1px solid #ffffff2a;background:#ffffff0d;color:#eef0f7;font:700 12px "Commissioner",system-ui,sans-serif;padding:0 11px;cursor:pointer;white-space:nowrap}
.svh-btn svg{flex:none}
.svh-btn.on{border-color:#e3b54a88}
.svh-btn .dot{width:7px;height:7px;border-radius:50%;background:#e3b54a;box-shadow:0 0 8px #e3b54a}
.svh-btn:focus-visible{outline:2px solid #e3b54a;outline-offset:2px}
.svh-on{position:relative}
.svh-on img{box-shadow:0 0 0 2px #e3b54a,0 0 14px #e3b54aaa!important}
.svh-star{position:absolute;top:var(--svh-t,4px);right:var(--svh-r,4px);left:var(--svh-l,auto);z-index:3;width:var(--svh-s,18px);height:var(--svh-s,18px);border-radius:50%;background:#e3b54a;color:#1a1405;font:900 calc(var(--svh-s,18px)*.6)/var(--svh-s,18px) system-ui,sans-serif;text-align:center;box-shadow:0 1px 4px #0008;pointer-events:none}
.svh-ov{position:fixed;inset:0;z-index:9999;background:#05070dcc;display:grid;place-items:center;padding:16px;font-family:"Commissioner",system-ui,sans-serif}
.svh-box{width:min(420px,100%);max-height:calc(100% - 24px);overflow:auto;box-sizing:border-box;background:linear-gradient(160deg,#232c4a,#171d31);border:1px solid #e3b54a66;border-radius:18px;padding:20px;color:#eef0f7;box-shadow:0 20px 60px #000a}
.svh-box h2{margin:0 0 10px;font:800 22px "Commissioner",system-ui,sans-serif;color:#e3b54a}
.svh-box p{margin:0 0 12px;font-size:14px;line-height:1.45;color:#d6dae8}
.svh-box .note{font-size:12px;color:#9aa3c0}
.svh-list{display:flex;flex-direction:column;gap:8px;margin-bottom:12px}
.svh-item{display:flex;align-items:center;gap:12px;padding:12px;border-radius:12px;border:1px solid #ffffff1f;background:#ffffff0a;color:#eef0f7;font:700 14px "Commissioner",system-ui,sans-serif;cursor:pointer;text-align:left}
.svh-item img{width:32px;height:32px;border-radius:8px}
.svh-item small{display:block;font-weight:400;font-size:11px;color:#9aa3c0}
.svh-addr{font:600 13px ui-monospace,Menlo,monospace;background:#ffffff0d;border-radius:8px;padding:8px 10px;word-break:break-all;margin-bottom:12px}
.svh-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:12px}
.svh-grid figure{margin:0;text-align:center;font-size:10px;color:#9aa3c0;position:relative}
.svh-grid img{width:100%;aspect-ratio:1;object-fit:cover;border-radius:8px;background:#f4ecd8;display:block;border:2px solid #e3b54a}
.svh-grid b{position:absolute;top:-5px;right:-5px;background:#e3b54a;color:#1a1405;border-radius:99px;font-size:10px;padding:1px 6px}
.svh-btns{display:flex;gap:8px;flex-wrap:wrap}
.svh-b{flex:1;min-width:120px;height:44px;border-radius:12px;border:1px solid #ffffff22;background:#ffffff10;color:#eef0f7;font:800 14px "Commissioner",system-ui,sans-serif;cursor:pointer}
.svh-b.gold{background:#e3b54a;color:#1a1405;border-color:#e3b54a}
.svh-b:focus-visible,.svh-item:focus-visible{outline:2px solid #e3b54a;outline-offset:2px}
.svh-toast{position:fixed;left:50%;bottom:calc(24px + env(safe-area-inset-bottom,0px));transform:translateX(-50%);z-index:10000;background:#000d;color:#fff;border:1px solid #e3b54a66;border-radius:14px;padding:9px 14px;font:700 13px "Commissioner",system-ui,sans-serif;max-width:calc(100% - 32px);text-align:center;pointer-events:none;transition:opacity .4s}
`;document.head.appendChild(css);

let tt=0;
function toast(msg){let t=document.querySelector('.svh-toast');if(!t){t=document.createElement('div');t.className='svh-toast';t.setAttribute('role','status');document.body.appendChild(t)}
  t.textContent=msg;t.style.opacity=1;clearTimeout(tt);tt=setTimeout(()=>t.style.opacity=0,2600);}

function decorate(root){
  const els=(root.querySelectorAll?root:document).querySelectorAll('[data-hid]');
  for(const el of els){const on=api.has(el.dataset.hid);el.classList.toggle('svh-on',on);
    let s=el.querySelector(':scope > .svh-star');
    if(on&&!s){s=document.createElement('span');s.className='svh-star';s.textContent='★';s.setAttribute('aria-hidden','true');el.appendChild(s)}
    else if(!on&&s)s.remove();}}
new MutationObserver(ms=>{for(const m of ms)for(const n of m.addedNodes)if(n.nodeType===1&&(n.dataset&&n.dataset.hid||n.querySelector&&n.querySelector('[data-hid]')))decorate(n.parentNode||n)})
  .observe(document.documentElement,{subtree:true,childList:true});

// ---------- connect button and dialogs (only on pages with a slot) ----------
const WICON='<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="6" width="18" height="13" rx="2.5"/><path d="M3 9h14a4 4 0 0 1 4 4"/><circle cx="16.5" cy="13" r="1.3" fill="currentColor"/></svg>';
let btn=null;
function paint(){if(!btn)return;const a=st.addr;btn.classList.toggle('on',!!a);
  btn.innerHTML=a?`${st.total?'<span class="dot"></span>':WICON}${short(a)}`:`${WICON}<span>Connect</span>`;
  btn.setAttribute('aria-label',a?`Wallet ${short(a)}${st.total?`, holder of ${st.total} Degens`:''}`:'Connect wallet');}

function ov(html){closeOv();const o=document.createElement('div');o.className='svh-ov';o.innerHTML=`<div class="svh-box" role="dialog" aria-modal="true">${html}</div>`;
  o.addEventListener('click',e=>{if(e.target===o)closeOv()});document.body.appendChild(o);const f=o.querySelector('button');if(f)f.focus();return o}
function closeOv(){document.querySelectorAll('.svh-ov').forEach(o=>o.remove())}
addEventListener('keydown',e=>{if(e.key==='Escape')closeOv()});

function openPicker(){const ws=window.SVWallet?SVWallet.list():[];
  const o=ov(`<h2>Connect wallet</h2>
  <p>Degens holders see their characters in gold in every game. The game only reads your public address. It never asks you to sign or send anything.</p>
  ${ws.length?`<div class="svh-list">${ws.map((w,i)=>`<button class="svh-item" data-i="${i}"><img src="${esc(w.icon)}" alt="">
    <span>${w.mwa?'Seeker / Android wallet':esc(w.name)}<small>${w.mwa?'Seed Vault, Phantom, Solflare and more':'Browser wallet'}</small></span></button>`).join('')}</div>`
  :`<p>No wallet found. On Seeker, open the game from the dApp Store. On other phones, install a Solana wallet such as Phantom or Solflare.</p>`}
  <p class="note">Tip: always check that a wallet request matches what you expect. This game will never request a transaction.</p>
  <div class="svh-btns"><button class="svh-b" data-x>Not now</button></div>`);
  o.querySelector('[data-x]').onclick=closeOv;
  o.querySelectorAll('.svh-item').forEach(b=>b.onclick=async()=>{const w=ws[+b.dataset.i];
    b.disabled=true;b.querySelector('small').textContent='Waiting for approval in your wallet…';
    try{const a=await SVWallet.connect(w.name);closeOv();await setAddress(a,true)}
    catch(e){b.disabled=false;b.querySelector('small').textContent='Not connected. Tap to try again.'}});}

function openAccount(){const ids=Object.keys(st.owned);
  const o=ov(`<h2>Your wallet</h2><div class="svh-addr">${esc(st.addr)}</div>
  ${loading?'<p>Checking your Degens…</p>':
    st.status==='error'?'<p>Could not check your Degens right now. Check your internet connection and try again.</p>':
    st.total?`<p>You hold ${st.total} Vol.1 Degens. They shine gold in every game.</p><div class="svh-grid">${ids.map(id=>`<figure><img src="${api.img(id)}" alt=""><b>${st.owned[id]}</b><figcaption>${NAME[id]}</figcaption></figure>`).join('')}</div>`
    :'<p>No Vol.1 Degens found in this wallet yet.</p>'}
  <div class="svh-btns">${st.status==='error'?'<button class="svh-b gold" data-r>Try again</button>':''}<button class="svh-b" data-x>Back to game</button><button class="svh-b" data-d>Disconnect</button></div>`);
  o.querySelector('[data-x]').onclick=closeOv;
  o.querySelector('[data-d]').onclick=()=>{closeOv();disconnect()};
  const r=o.querySelector('[data-r]');if(r)r.onclick=async()=>{closeOv();await setAddress(st.addr,true)};}

function init(){
  const slot=document.querySelector('[data-svh-slot]');
  if(slot){
    btn=document.createElement('button');btn.className='svh-btn';btn.type='button';
    btn.onclick=()=>st.addr?openAccount():openPicker();
    slot.prepend(btn);paint();
    const s=document.createElement('script');s.src=BASE+'wallet.bundle.js';document.head.appendChild(s);
    addEventListener('svwallet-ready',()=>SVWallet.onChange(a=>{if(a&&a!==st.addr)setAddress(a,false)}));}
  decorate(document);
  if(st.addr)refresh(false);}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
