// StratoshiVibes Arcade: Degen Passport.
// One progress card for all four games: XP and rank, badges, daily-challenge streak and personal records.
// Everything is stored on this device only (localStorage "sv_pass"). No account, no server.
// Games report what happened with SVPass.record(type, data); the Passport works out XP and badges.
(function(){
const KEY='sv_pass';
const BASE=(document.currentScript&&document.currentScript.src||location.href).replace(/[^/]*$/,'');
const get=k=>{try{return localStorage.getItem(k)}catch(e){return null}};
const today=()=>{const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')};
const dayNo=s=>Math.round(new Date(s+'T12:00:00').getTime()/864e5);
const load=()=>{try{return JSON.parse(get(KEY))||{}}catch(e){return {}}};
let P=load();
function norm(){P.xp=P.xp||0;P.c=P.c||{};P.b=P.b||{};P.daily=P.daily||{};P.streak=P.streak||{n:0,best:0,last:''};
  if(!P.id)P.id=Math.floor(1000+Math.random()*9000);}
norm();
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(P))}catch(e){}};
addEventListener('storage',e=>{if(e.key===KEY){P=load();norm();emit()}});
const subs=new Set();const emit=()=>{for(const f of subs){try{f(api)}catch(e){console.warn(e)}}};

// ---------- ranks ----------
const RANKS=[[1,'Nocoiner','nocoiner'],[2,'Shrimp','shrimp'],[3,'Crab','crab'],[5,'Paper Hands','paperhands'],[7,'Degen','degen'],
 [9,'Bull','bull'],[12,'Diamond Hands','diamond'],[15,'Bitcoin Maxi','maxi'],[20,'Whale','whale']];
const xpFor=l=>50*l*(l-1);                       // XP needed to reach level l
const levelOf=xp=>{let l=1;while(xp>=xpFor(l+1))l++;return l};
const rankOf=l=>{let r=RANKS[0];for(const k of RANKS)if(l>=k[0])r=k;return{name:r[1],id:r[2]}};

// ---------- derived numbers from the games' own saves ----------
function mjStars(){try{return JSON.parse(get('dm_lv')||'{}')||{}}catch(e){return {}}}
function stats(){const lv=mjStars();const st=Object.values(lv);
  const chap=c=>[0,1,2,3,4,5].every(i=>lv[c*6+i]);
  return{mjCleared:Object.keys(lv).length,mjStars:st.reduce((a,b)=>a+b,0),mjThree:st.filter(x=>x>=3).length,chap,
    bg:+(get('bg_progress')||0),rp:+(get('rp_beaten')||0),erBest:+(get('er_best')||0),erWins:+(get('er_wins')||0)};}
function streakNow(){const s=P.streak;if(!s.last)return 0;const gap=dayNo(today())-dayNo(s.last);return gap<=1?s.n:0}
const H=()=>window.SVHolder;
const SKR_TIERS=[[10000,'Gold'],[1000,'Silver'],[1,'Bronze']];
function skrTier(){const h=H();const n=h&&h.skr||0;for(const [min,name] of SKR_TIERS)if(n>=min)return name;return null}

// ---------- badges ----------
const BADGES=[
 ['first_trade','🀄','First Trade','Clear your first Mahjong board',(s,c)=>c.mj_clears>=1||s.mjCleared>=1],
 ['ch1','🐂','Bull Market','Clear Mahjong chapter 1',s=>s.chap(0)],
 ['ch2','🚀','Altseason','Clear Mahjong chapter 2',s=>s.chap(1)],
 ['ch3','🐻','Survived the Bear','Clear Mahjong chapter 3',s=>s.chap(2)],
 ['ch4','🏦','Market Maker','Clear all 24 Mahjong levels',s=>s.chap(3)&&s.mjCleared>=24],
 ['three10','⭐','Perfectionist','Earn 3 stars on 10 levels',s=>s.mjThree>=10],
 ['combo8','🧠','Gigabrain','Reach a x8 combo in Mahjong',(s,c)=>(c.mj_combo||0)>=8],
 ['bg_first','⚔️','First Blood','Win a Battlegrounds fight',(s,c)=>c.bg_wins>=1||s.bg>=1],
 ['bg_flawless','🛡️','Not a Scratch','Win a fight without losing a Degen',(s,c)=>c.bg_flawless>=1],
 ['bg_camp','👑','Campaign Done','Beat all 8 Battlegrounds teams',s=>s.bg>=8],
 ['rp_first','🃏','Poker Face','Win a Rugpull Poker match',(s,c)=>c.rp_wins>=1||s.rp>=1],
 ['rp_whale','🐋','Whale Hunter','Beat The Whale at poker',s=>s.rp>=3],
 ['rug_boss','🧹','Boss Down','Defeat a boss in Escape the Rug',(s,c)=>c.rug_bosses>=1],
 ['rug_squad','👥','Full Squad','Have 4 Degens in one run',(s,c)=>(c.rug_party||0)>=4],
 ['rug_escape','🚪','Escaped the Rug','Escape all 3 floors',(s,c)=>s.erWins>=1],
 ['daily1','📅','Daily Grind','Finish a daily challenge',(s,c)=>c.dailies>=1],
 ['streak3','🔥','On a Roll','Daily streak of 3 days',()=>P.streak.best>=3],
 ['streak7','💎','Diamond Streak','Daily streak of 7 days',()=>P.streak.best>=7],
 ['streak30','🗿','Never Selling','Daily streak of 30 days',()=>P.streak.best>=30],
 ['all4','🕹️','Arcade Regular','Win at least once in all 4 games',(s,c)=>(c.mj_clears>=1||s.mjCleared>=1)&&(c.bg_wins>=1||s.bg>=1)&&(c.rp_wins>=1||s.rp>=1)&&(c.rug_bosses>=1||s.erWins>=1)],
 ['holder','✨','Vol.1 Holder','Hold a StratoshiVibes Vol.1 Degen',()=>{const h=H();return !!(h&&h.total>0)}],
 ['skr','📱','Seeker','Hold SKR in your connected wallet',()=>!!skrTier()]];

const queue=[];let showing=false;
function check(silent){const s=stats();let gained=0;
  for(const [id,ic,name,,test] of BADGES){if(P.b[id])continue;let ok=false;try{ok=test(s,P.c)}catch(e){}
    if(ok){P.b[id]=today();gained++;P.xp+=25;if(!silent)notify(ic,'Badge unlocked',name)}}
  return gained;}

const XP={mj_clear:d=>10+Math.round((d.tiles||72)/6)+(d.stars||0)*5,bg_win:()=>30,bg_loss:()=>5,rp_win:()=>30,rp_loss:()=>5,
  rug_room:()=>3,rug_boss:()=>40,rug_escape:()=>100,rug_end:()=>0,rug_party:()=>0};
function record(type,d){d=d||{};const before=levelOf(P.xp);const c=P.c;
  if(type==='mj_clear'){c.mj_clears=(c.mj_clears||0)+1;c.mj_combo=Math.max(c.mj_combo||0,d.combo||0)}
  else if(type==='bg_win'){c.bg_wins=(c.bg_wins||0)+1;if(d.flawless)c.bg_flawless=(c.bg_flawless||0)+1}
  else if(type==='rp_win')c.rp_wins=(c.rp_wins||0)+1;
  else if(type==='rug_boss')c.rug_bosses=(c.rug_bosses||0)+1;
  else if(type==='rug_escape')c.rug_escapes=(c.rug_escapes||0)+1;
  else if(type==='rug_party')c.rug_party=Math.max(c.rug_party||0,d.n||0);
  P.xp+=(XP[type]||(()=>0))(d);
  check(false);
  const after=levelOf(P.xp);if(after>before){const r=rankOf(after);notify('⬆️',`Level ${after}`,r.name)}
  save();emit();}

// daily challenges: one per game per day; finishing any of them keeps the streak alive
function dailyDone(game){const d=P.daily[today()];return !!(d&&d[game])}
function dailyResult(game){const d=P.daily[today()];return d&&d[game]||null}
function finishDaily(game,res,lowerIsBetter){const t=today();const day=P.daily[t]=P.daily[t]||{};const prev=day[game];const first=!prev;
  const best=prev?(lowerIsBetter?Math.min(prev.best,res.score):Math.max(prev.best,res.score)):res.score;
  day[game]=Object.assign({},res,{best,tries:(prev&&prev.tries||0)+1});
  if(first){P.c.dailies=(P.c.dailies||0)+1;P.xp+=50;
    const s=P.streak;if(s.last!==t){const gap=s.last?dayNo(t)-dayNo(s.last):99;s.n=gap===1?s.n+1:1;s.last=t;s.best=Math.max(s.best||0,s.n)}}
  // keep only the last 40 days
  const keys=Object.keys(P.daily).sort();while(keys.length>40)delete P.daily[keys.shift()];
  check(false);save();emit();return{first,streak:P.streak.n};}

// seeded random numbers, the same for every player on the same day
function hash(str){let h=1779033703^str.length;for(let i=0;i<str.length;i++){h=Math.imul(h^str.charCodeAt(i),3432918353);h=h<<13|h>>>19}return()=>{h=Math.imul(h^h>>>16,2246822507);h=Math.imul(h^h>>>13,3266489909);return(h^=h>>>16)>>>0}}
function rng(seed){let a=hash(String(seed))();return()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
function withSeed(seed,fn){const r=rng(seed),orig=Math.random;Math.random=r;try{return fn()}finally{Math.random=orig}}

// ---------- notifications ----------
const css=document.createElement('style');css.textContent=`
.svp-note{position:fixed;left:50%;top:calc(12px + env(safe-area-inset-top,0px));transform:translate(-50%,-140%);z-index:10001;display:flex;align-items:center;gap:10px;
 background:linear-gradient(160deg,#2a2412,#171d31);border:1px solid #e3b54a;border-radius:14px;padding:9px 14px;color:#eef0f7;font:700 13px "Commissioner",system-ui,sans-serif;
 box-shadow:0 10px 30px #000a;transition:transform .35s cubic-bezier(.2,.9,.3,1.2);pointer-events:none;max-width:calc(100% - 24px)}
.svp-note.on{transform:translate(-50%,0)}
.svp-note .ic{font-size:22px}.svp-note small{display:block;font:800 10px "Commissioner",system-ui,sans-serif;letter-spacing:.12em;text-transform:uppercase;color:#e3b54a}`;
document.head.appendChild(css);
function notify(ic,head,name){queue.push([ic,head,name]);if(!showing)next()}
function next(){const n=queue.shift();if(!n){showing=false;return}showing=true;
  let el=document.querySelector('.svp-note');if(!el){el=document.createElement('div');el.className='svp-note';el.setAttribute('role','status');document.body.appendChild(el)}
  el.innerHTML=`<span class="ic" aria-hidden="true">${n[0]}</span><span><small>${n[1]}</small>${n[2]}</span>`;
  requestAnimationFrame(()=>el.classList.add('on'));
  setTimeout(()=>{el.classList.remove('on');setTimeout(next,400)},2600);}

const api={
  get xp(){return P.xp},get level(){return levelOf(P.xp)},get rank(){return rankOf(levelOf(P.xp))},
  get name(){return P.name||('Degen #'+P.id)},setName(n){P.name=String(n||'').trim().slice(0,18);save();emit()},
  xpFor,levelOf,rankOf,RANKS,BADGES,stats,streak:()=>({now:streakNow(),best:P.streak.best||0}),
  badges:()=>BADGES.map(([id,ic,name,txt])=>({id,ic,name,txt,got:P.b[id]||null})),
  skrTier,record,check:()=>{if(check(true)){save();emit()}},
  today,dailyDone,dailyResult,finishDaily,rng,withSeed,img:id=>BASE+'arcade-art/tile_'+id+'.webp',
  onChange(f){subs.add(f);return()=>subs.delete(f)}};
window.SVPass=api;
// badges that come from older saves or from the wallet are granted quietly on load
if(check(true))save();
if(window.SVHolder)SVHolder.onChange(()=>{if(check(false)){save();emit()}});
})();
