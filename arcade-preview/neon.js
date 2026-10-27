/* StratoshiVibes Arcade neon backdrop: glowing blockchain cubes, a rising chart, a globe, the Solana mark and floating coins.
   Usage: <script src="../neon.js"></script> then SVNeon.backdrop({sol:[x,y,scale],coins:[[left%,top%,size,delay],...],opacity:.7}) */
(function(){
const CSS=`.bgfx{position:fixed;inset:0;z-index:0;pointer-events:none;overflow:hidden}.bgfx svg{position:absolute;inset:0;width:100%;height:100%}
.coin{position:absolute;border-radius:50%;background:radial-gradient(circle at 35% 30%,#fff2b0 0%,#f6c744 30%,#d99a12 62%,#8a5a06 100%);box-shadow:0 0 18px #f6c74466,inset -3px -4px 0 #00000033,inset 3px 3px 0 #ffffff55;display:grid;place-items:center;color:#7a4b00;font:900 var(--cs,20px)/1 system-ui,sans-serif;animation:coinbob 7s ease-in-out infinite alternate}
.coin::after{content:"₿";transform:rotate(-12deg);text-shadow:0 1px 0 #ffe9a6}
@keyframes coinbob{from{transform:translateY(0) rotate(-8deg)}to{transform:translateY(-14px) rotate(10deg)}}
.bgfx .coin{opacity:.85}
@media (prefers-reduced-motion:reduce){.coin{animation:none!important}}`;
function backdrop(opt){const o=Object.assign({sol:[318,214,.9],coins:[[2,58,40,0],[86,44,30,-2],[4,82,28,-4],[90,68,22,-1],[74,92,18,-3]],opacity:.72,z:0},opt||{});
 if(!document.getElementById('svneon-css')){const st=document.createElement('style');st.id='svneon-css';st.textContent=CSS;document.head.appendChild(st)}
 let B=document.querySelector('.bgfx');if(!B){B=document.createElement('div');B.className='bgfx';B.setAttribute('aria-hidden','true');document.body.prepend(B)}
 B.style.zIndex=o.z;const W=400,H=800;

 const f=n=>n.toFixed(1);
 const cube=(cx,cy,r,o)=>{const h=r*.866;
  const T=[[cx,cy-r],[cx+h,cy-r/2],[cx,cy],[cx-h,cy-r/2]],Lf=[[cx-h,cy-r/2],[cx,cy],[cx,cy+r],[cx-h,cy+r/2]],Rf=[[cx,cy],[cx+h,cy-r/2],[cx+h,cy+r/2],[cx,cy+r]];
  const P=a=>a.map(q=>f(q[0])+','+f(q[1])).join(' ');
  return `<g opacity="${o}" filter="url(#glow)"><polygon points="${P(T)}" fill="url(#cTop)" stroke="#9ff0ff" stroke-width="1.2"/><polygon points="${P(Lf)}" fill="url(#cL)" stroke="#5fd8ff" stroke-width="1.2"/><polygon points="${P(Rf)}" fill="url(#cR)" stroke="#3fb8ff" stroke-width="1.2"/></g>`};
 const C=[[34,300,24,.95],[86,330,20,.85],[30,372,18,.75],[76,398,22,.8],[22,452,16,.6],[64,480,14,.5],[110,276,12,.55]];
 let s=`<defs>
  <filter id="glow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="2.4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  <filter id="soft"><feGaussianBlur stdDeviation="18"/></filter>
  <linearGradient id="cTop" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7fe8ff" stop-opacity=".55"/><stop offset="1" stop-color="#1b7dff" stop-opacity=".25"/></linearGradient>
  <linearGradient id="cL" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#1b7dff" stop-opacity=".45"/><stop offset="1" stop-color="#0a2a6b" stop-opacity=".35"/></linearGradient>
  <linearGradient id="cR" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#0d3c8f" stop-opacity=".5"/><stop offset="1" stop-color="#061a45" stop-opacity=".4"/></linearGradient>
  <linearGradient id="sol" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="#9945FF"/><stop offset=".5" stop-color="#5f8bff"/><stop offset="1" stop-color="#14F195"/></linearGradient>
  <linearGradient id="arw" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="#1fae5a" stop-opacity="0"/><stop offset=".35" stop-color="#3dff7a" stop-opacity=".55"/><stop offset="1" stop-color="#b6ffcf"/></linearGradient>
  <radialGradient id="halo"><stop offset="0" stop-color="#2a6bff" stop-opacity=".35"/><stop offset="1" stop-color="#2a6bff" stop-opacity="0"/></radialGradient>
 </defs>`;
 // soft light pools
 s+=`<ellipse cx="200" cy="400" rx="210" ry="260" fill="url(#halo)"/><circle cx="40" cy="380" r="70" fill="#29c6ff" opacity=".10" filter="url(#soft)"/><circle cx="360" cy="560" r="80" fill="#3dff7a" opacity=".08" filter="url(#soft)"/><circle cx="330" cy="170" r="70" fill="#9945FF" opacity=".12" filter="url(#soft)"/>`;
 // cube network
 const lk=[[0,1],[0,2],[1,3],[2,3],[2,4],[3,5],[4,5],[1,6],[0,6]];
 s+=`<g stroke="#5fd8ff" stroke-opacity=".45" stroke-width="1" fill="none">${lk.map(([a,b])=>`<line x1="${C[a][0]}" y1="${C[a][1]}" x2="${C[b][0]}" y2="${C[b][1]}"/>`).join('')}</g>`;
 s+=C.map(c=>`<circle cx="${c[0]}" cy="${c[1]}" r="2" fill="#bff4ff"/>`).join('')+C.map(c=>cube(...c)).join('');
 // rising candle chart and arrow
 let y=650,cs='',pts=[];for(let i=0;i<13;i++){const x=292+i*8,up=i%4!==2,h=12+(i*7)%14;y-=up?15+(i%3)*4:-9;const top=y-(up?h:0),col=up?'#3dff7a':'#ff4d5e';pts.push([x+2.5,top]);
  cs+=`<line x1="${x+2.5}" x2="${x+2.5}" y1="${top-6}" y2="${top+h+6}" stroke="${col}" stroke-opacity=".8"/><rect x="${x}" y="${top}" width="5" height="${h}" rx="1" fill="${col}" opacity=".85"/>`}
 s+=`<g filter="url(#glow)">${cs}</g>`;
 s+=`<path d="M262 660 C 296 640, 316 600, 338 570 S 362 500, 374 474" fill="none" stroke="url(#arw)" stroke-width="7" stroke-linecap="round" filter="url(#glow)"/><path d="M362 474 L382 452 L386 486 Z" fill="#b6ffcf" filter="url(#glow)"/>`;
 // globe
 let g='';for(let k=1;k<=4;k++)g+=`<ellipse cx="352" cy="740" rx="${k*22}" ry="96" fill="none"/>`;
 for(let k=-3;k<=3;k++){const yy=740+k*28,rx=Math.sqrt(Math.max(0,96*96-(k*28)**2));g+=`<ellipse cx="352" cy="${yy}" rx="${f(rx)}" ry="${f(rx*.14)}" fill="none"/>`}
 s+=`<g stroke="#29c6ff" stroke-opacity=".3" filter="url(#glow)">${g}<circle cx="352" cy="740" r="96" fill="#29c6ff" fill-opacity=".05" stroke-opacity=".55"/></g>`;
 // Solana mark (three slanted bars), top right behind the level button
 const bar=(y0,dir)=>dir>0?`M${f(0)} ${y0+14}L${12} ${y0}H${60}L${48} ${y0+14}Z`:`M0 ${y0}H48L60 ${y0+14}H12Z`;
 s+=`<g transform="translate(${o.sol[0]} ${o.sol[1]}) scale(${o.sol[2]})" filter="url(#glow)" opacity=".9"><path d="${bar(0,1)}" fill="url(#sol)"/><path d="${bar(22,-1)}" fill="url(#sol)"/><path d="${bar(44,1)}" fill="url(#sol)"/></g>`;
 // sparkles
 for(let i=0;i<46;i++){const x=(i*97+13)%400,yy=(i*173+29)%800,r=(i%3)*.5+.6;s+=`<circle cx="${x}" cy="${yy}" r="${r}" fill="#bfe8ff" opacity="${.18+(i%4)*.1}"/>`}
 B.innerHTML=`<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice">${s}</svg>`+
  o.coins.map(([x,yy,sz,dl])=>`<div class="coin" style="left:${x}%;top:${yy}%;width:${sz}px;height:${sz}px;--cs:${Math.round(sz*.55)}px;animation-delay:${dl}s"></div>`).join('');
 const sv=B.querySelector('svg');if(sv)sv.style.opacity=o.opacity;return B}
window.SVNeon={backdrop};
})();
