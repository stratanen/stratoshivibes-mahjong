// StratoshiVibes Arcade: Shop.
// Optional extras paid in SKR, SOL or USDC, straight to the creator's wallet, inside the app.
// One purchase = one transfer with a memo ("svarcade:<item>"). Nothing else is ever requested from the wallet.
// What you bought is saved on this device and can be restored on any device from the chain ("Restore purchases").
(function(){
const CFG={
  treasury:'9PRzwoMb8ULXYHXFRjcT685BYvdKioC6sUjGkLuqJdY6',   // Arcade revenue wallet (receives payments only)
  prefix:'svarcade:',
  skrDiscount:.10,
  priceApi:'https://lite-api.jup.ag/price/v3?ids=',
  mints:{SOL:'So11111111111111111111111111111111111111112',SKR:'SKRbvo6Gf7GondiT3BbTfuRDPqLWei4j2Qy2NPGZhW3',USDC:'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'}
};
const PRODUCTS=[
  {id:'season',ic:'🀄',name:'Seeker Season',usd:1.99,txt:'Mahjong chapter 5: six bigger boards, up to 84 tiles and four layers high.',gives:['season']},
  {id:'supporter',ic:'💛',name:'Supporter Pack',usd:4.99,txt:'Seeker Season, gold Mahjong tiles, a Supporter badge and a gold Passport frame. Thank you for backing the Arcade.',gives:['season','gold_tiles','supporter']}
];
const KEY='sv_shop';
const BASE=(document.currentScript&&document.currentScript.src||location.href).replace(/[^/]*$/,'');
const load=()=>{try{return JSON.parse(localStorage.getItem(KEY))||{}}catch(e){return {}}};
let S=load();S.own=S.own||{};
const persist=()=>{try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}};
const subs=new Set();const emit=()=>{for(const f of subs){try{f(api)}catch(e){}}try{window.SVPass&&SVPass.check()}catch(e){}};
addEventListener('storage',e=>{if(e.key===KEY){S=load();S.own=S.own||{};emit()}});
const owns=id=>!!S.own[id];
const has=f=>PRODUCTS.some(p=>owns(p.id)&&p.gives.includes(f));
const esc=x=>String(x).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const short=a=>a.slice(0,4)+'…'+a.slice(-4);
const usd=n=>'$'+n.toFixed(2);

// ---------- prices ----------
let prices=null,pricesT=0;
async function getPrices(){if(prices&&Date.now()-pricesT<60e3)return prices;
  try{const r=await fetch(CFG.priceApi+[CFG.mints.SOL,CFG.mints.SKR].join(','));const j=await r.json();
    const p=k=>{const v=j[CFG.mints[k]]||(j.data&&j.data[CFG.mints[k]]);return v?+(v.usdPrice||v.price):null};
    prices={SOL:p('SOL'),SKR:p('SKR'),USDC:1};pricesT=Date.now();}catch(e){console.warn(e);prices={SOL:null,SKR:null,USDC:1}}
  return prices;}
function quote(prod,sym){const pr=prices&&prices[sym];if(!pr)return null;
  const u=prod.usd*(sym==='SKR'?1-CFG.skrDiscount:1);const raw=u/pr;
  const dp=sym==='SOL'?4:2;const amt=Math.ceil(raw*10**dp)/10**dp;return{sym,amount:amt,usd:u};}

// ---------- chain helpers (loaded only when the Shop is used) ----------
let payLib=null;
function loadPay(){if(payLib)return Promise.resolve(payLib);
  return new Promise((res,rej)=>{if(window.SVPay){payLib=SVPay.make(SVHolder.rpc);return res(payLib)}
    const s=document.createElement('script');s.src=BASE+'pay.bundle.js';s.onload=()=>{payLib=SVPay.make(SVHolder.rpc);res(payLib)};s.onerror=()=>rej(new Error('Could not load the payment module'));document.head.appendChild(s)});}

// ---------- UI ----------
const css=document.createElement('style');css.textContent=`
.sh-item{display:flex;gap:12px;align-items:flex-start;padding:12px;border-radius:14px;border:1px solid #ffffff1f;background:#ffffff08;margin-bottom:10px}
.sh-item .ic{font-size:30px;line-height:1;flex:none;width:44px;height:44px;display:grid;place-items:center;border-radius:12px;background:#e3b54a1f}
.sh-item b{display:block;font:800 15px "Commissioner",system-ui,sans-serif;color:#fff}
.sh-item p{margin:4px 0 8px!important;font-size:12.5px!important;color:#c9d0e4!important}
.sh-item .row{display:flex;align-items:center;justify-content:space-between;gap:8px}
.sh-item .pr{font:800 16px "Commissioner",system-ui,sans-serif;color:#e3b54a}
.sh-own{font:800 12px "Commissioner",system-ui,sans-serif;color:#3fbf7a}
.sh-buy{height:36px;border-radius:99px;border:0;background:#e3b54a;color:#1a1405;font:800 13px "Commissioner",system-ui,sans-serif;padding:0 16px;cursor:pointer}
.sh-cur{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin:10px 0}
.sh-cur button{padding:10px 6px;border-radius:12px;border:1px solid #ffffff2a;background:#ffffff0a;color:#eef0f7;font:800 13px "Commissioner",system-ui,sans-serif;cursor:pointer;text-align:center}
.sh-cur button small{display:block;font-weight:600;font-size:11px;color:#9aa3c0;margin-top:3px}
.sh-cur button.on{border-color:#e3b54a;background:#e3b54a22}
.sh-cur button:disabled{opacity:.4;cursor:default}
.sh-cur .disc{color:#3fbf7a}
.sh-sum{display:grid;grid-template-columns:auto 1fr;gap:6px 12px;font-size:13px;background:#0b0f1b;border-radius:12px;padding:12px;margin-bottom:10px}
.sh-sum span{color:#9aa3c0}.sh-sum b{color:#fff;text-align:right;word-break:break-all}
.sh-ok{display:flex;gap:8px;align-items:flex-start;font-size:12px;color:#c9d0e4;margin-bottom:12px}
.sh-ok input{margin-top:2px;accent-color:#e3b54a}
.sh-spin{width:34px;height:34px;border-radius:50%;border:3px solid #ffffff22;border-top-color:#e3b54a;animation:shs 1s linear infinite;margin:10px auto}
@keyframes shs{to{transform:rotate(360deg)}}
.sh-err{color:#ffb4ad;font-size:13px}`;
document.head.appendChild(css);

function ov(html){document.querySelectorAll('.svh-ov.sh').forEach(o=>o.remove());const o=document.createElement('div');o.className='svh-ov sh';
  o.innerHTML=`<div class="svh-box" role="dialog" aria-modal="true" aria-label="Shop">${html}</div>`;o.addEventListener('click',e=>{if(e.target===o&&!o.dataset.busy)o.remove()});document.body.appendChild(o);return o}
const close=()=>document.querySelectorAll('.svh-ov.sh').forEach(o=>o.remove());

function openShop(){const o=ov(`<h2>Arcade Shop</h2>
  <p>Optional extras. The games stay free. Paid with SKR, SOL or USDC, straight to the creator's wallet.</p>
  ${PRODUCTS.map(p=>`<div class="sh-item"><span class="ic" aria-hidden="true">${p.ic}</span><div style="flex:1;min-width:0"><b>${p.name}</b><p>${p.txt}</p>
   <div class="row"><span class="pr">${usd(p.usd)}</span>${owns(p.id)?'<span class="sh-own">✓ Owned</span>':p.gives.every(g=>has(g))?'<span class="sh-own">✓ Included in your purchases</span>':`<button class="sh-buy" data-id="${p.id}">Buy</button>`}</div></div></div>`).join('')}
  <p class="note">Pay with SKR and get ${Math.round(CFG.skrDiscount*100)}% off. Your wallet will ask you to approve one transfer to ${short(CFG.treasury)} and nothing else.</p>
  <div class="svh-btns"><button class="svh-b" id="shRestore">Restore purchases</button><button class="svh-b" id="shClose">Close</button></div>`);
  o.querySelector('#shClose').onclick=close;o.querySelector('#shRestore').onclick=()=>restore(true);
  o.querySelectorAll('.sh-buy').forEach(b=>b.onclick=()=>checkout(PRODUCTS.find(p=>p.id===b.dataset.id)));}

async function needWallet(){const H=window.SVHolder;if(H&&H.address)return H.address;
  close();if(H){H.openPicker();}return null;}

async function checkout(prod){const addr=await needWallet();if(!addr)return;
  let o=ov(`<h2>${esc(prod.name)}</h2><div class="sh-spin" aria-label="Loading"></div><p style="text-align:center">Getting today's prices…</p>`);
  await getPrices();let sym=prices.SKR?'SKR':prices.SOL?'SOL':'USDC';
  const draw=()=>{const q=quote(prod,sym);
    o=ov(`<h2>${esc(prod.name)}</h2><p>${esc(prod.txt)}</p>
    <div class="sh-cur">${['SKR','SOL','USDC'].map(k=>{const qq=quote(prod,k);return `<button data-k="${k}" class="${k===sym?'on':''}" ${qq?'':'disabled'}>${k}<small>${qq?`${qq.amount} ${k}`:'price unavailable'}</small>${k==='SKR'&&qq?`<small class="disc">−${Math.round(CFG.skrDiscount*100)}%</small>`:''}</button>`}).join('')}</div>
    <div class="sh-sum"><span>You pay</span><b>${q.amount} ${sym} (≈ ${usd(q.usd)})</b><span>To</span><b>${short(CFG.treasury)}</b><span>From</span><b>${short(addr)}</b><span>Note on chain</span><b>${CFG.prefix}${prod.id}</b></div>
    <label class="sh-ok"><input type="checkbox" id="shOk"> <span>I want the item delivered right away. I understand that a payment on the blockchain is final, and that after delivery I lose the 14-day right of withdrawal.</span></label>
    <p class="sh-err" id="shErr" hidden></p>
    <div class="svh-btns"><button class="svh-b gold" id="shPay" disabled>Pay ${q.amount} ${sym}</button><button class="svh-b" id="shBack">Back</button></div>`);
    o.querySelectorAll('.sh-cur button').forEach(b=>b.onclick=()=>{sym=b.dataset.k;draw()});
    const ok=o.querySelector('#shOk'),pay=o.querySelector('#shPay');ok.onchange=()=>pay.disabled=!ok.checked;
    o.querySelector('#shBack').onclick=openShop;pay.onclick=()=>pay2(prod,q,addr);};
  draw();}

async function pay2(prod,q,addr){const o=ov(`<h2>${esc(prod.name)}</h2><div class="sh-spin"></div><p style="text-align:center" id="shStep">Checking your balance…</p>`);o.dataset.busy='1';
  const step=t=>{const e=o.querySelector('#shStep');if(e)e.textContent=t};
  const fail=(msg)=>{o.dataset.busy='';o.querySelector('.svh-box').innerHTML=`<h2>${esc(prod.name)}</h2><p class="sh-err">${esc(msg)}</p><div class="svh-btns"><button class="svh-b gold" id="shAgain">Try again</button><button class="svh-b" id="shX">Close</button></div>`;
    o.querySelector('#shAgain').onclick=()=>checkout(prod);o.querySelector('#shX').onclick=close;};
  try{if(!window.SVWallet)return fail('The wallet is still loading. Try again in a moment.');
    const L=await loadPay();
    const bal=await L.balance(addr,q.sym);
    if(bal<q.amount+(q.sym==='SOL'?0.0002:0))return fail(`Not enough ${q.sym} in this wallet. You have ${+bal.toFixed(4)} ${q.sym}.`);
    if(q.sym!=='SOL'&&await L.balance(addr,'SOL')<0.0001)return fail('You need a little SOL for the network fee (about 0.0001 SOL).');
    step('Approve the payment in your wallet…');
    await SVWallet.ensure();
    if(SVWallet.address&&SVWallet.address!==addr)return fail('The wallet that opened is not the one connected to the Arcade. Connect the same wallet and try again.');
    const {bytes}=await L.build({payer:addr,treasury:CFG.treasury,sym:q.sym,amount:q.amount,memo:CFG.prefix+prod.id});
    let sig;
    try{const r=await SVWallet.signAndSend(bytes);sig=r.signature?L.bs58.encode(r.signature):await L.send(r.signed)}
    catch(e){console.warn(e);return fail('Payment cancelled in the wallet. Nothing was charged.')}
    step('Waiting for the network to confirm…');
    const okc=await L.confirm(sig);
    if(!okc)return fail('The payment was sent but is not confirmed yet. Wait a minute, then tap Restore purchases in the Shop.');
    S.own[prod.id]={sig,sym:q.sym,amount:q.amount,t:Date.now()};persist();emit();
    o.dataset.busy='';
    o.querySelector('.svh-box').innerHTML=`<h2>Thank you</h2><p><b>${esc(prod.name)}</b> is unlocked on this device and saved to your wallet's history.</p>
     <div class="sh-sum"><span>Paid</span><b>${q.amount} ${q.sym}</b><span>Receipt</span><b><a href="https://solscan.io/tx/${sig}" target="_blank" rel="noopener" style="color:#e3b54a">${short(sig)}</a></b></div>
     <div class="svh-btns"><button class="svh-b gold" id="shX">Done</button></div>`;
    o.querySelector('#shX').onclick=close;
  }catch(e){console.warn(e);fail('Something went wrong before any payment was made. Check your connection and try again.')}}

async function restore(show){const H=window.SVHolder;if(!H||!H.address){if(show)needWallet();return}
  let o=show?ov(`<h2>Restore purchases</h2><div class="sh-spin"></div><p style="text-align:center">Reading your wallet's history…</p>`):null;
  try{const L=await loadPay();await getPrices();
    const pays=await L.payments(H.address,CFG.treasury,CFG.prefix);let found=0;
    for(const p of pays){const id=p.memo.slice(CFG.prefix.length);const prod=PRODUCTS.find(x=>x.id===id);if(!prod)continue;
      // a payment counts if it was worth at least the price (USDC) or a reasonable share of it at today's prices (SOL/SKR move)
      const worth=p.sym==='USDC'?p.amount:(prices[p.sym]?p.amount*prices[p.sym]:null);
      const floor=p.sym==='USDC'?prod.usd*.95*(1-CFG.skrDiscount):prod.usd*.4*(1-CFG.skrDiscount);
      if(worth!=null&&worth<floor)continue;
      if(!S.own[id]){S.own[id]={sig:p.sig,sym:p.sym,amount:p.amount,t:(p.time||0)*1000,restored:true};found++}}
    persist();emit();
    if(o)o.querySelector('.svh-box').innerHTML=`<h2>Restore purchases</h2><p>${found?`Restored ${found} item${found>1?'s':''}.`:Object.keys(S.own).length?'Everything you bought is already unlocked.':'No Arcade purchases found for this wallet.'}</p><div class="svh-btns"><button class="svh-b" id="shX">Back to the Shop</button></div>`,o.querySelector('#shX').onclick=openShop;
  }catch(e){console.warn(e);if(o)o.querySelector('.svh-box').innerHTML=`<h2>Restore purchases</h2><p class="sh-err">Could not read your wallet's history right now. Try again later.</p><div class="svh-btns"><button class="svh-b" id="shX">Back</button></div>`,o.querySelector('#shX').onclick=openShop}}

const api={products:PRODUCTS,owns,has,open:openShop,restore,onChange(f){subs.add(f);return()=>subs.delete(f)},treasury:CFG.treasury};
window.SVShop=api;
})();
