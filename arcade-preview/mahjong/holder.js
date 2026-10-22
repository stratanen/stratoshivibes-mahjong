// Mahjong holder perk: tiles of the Degens you hold shine as gold holo tiles. Wallet logic lives in ../holder.js.
(function(){const H=window.SVHolder;if(!H)return;
const css=document.createElement('style');css.textContent=`
.tile.holo{background:linear-gradient(135deg,#fff4cf,#f4ecd8 35%,#e9f4ff 55%,#f9e3ff 75%,#fff1c2)}
.tile.holo::after{content:"";position:absolute;inset:0;border-radius:inherit;border:2px solid var(--gold);pointer-events:none;
 background:linear-gradient(115deg,transparent 30%,#ffffff99 45%,transparent 60%);background-size:250% 100%;animation:holo 3.2s linear infinite;mix-blend-mode:soft-light}
@keyframes holo{from{background-position:120% 0}to{background-position:-130% 0}}
@media (prefers-reduced-motion:reduce){.tile.holo::after{animation:none}}`;document.head.appendChild(css);
function applyHolo(){for(const t of st.tiles){if(!t.el)continue;const g=GROUPS[t.g];t.el.classList.toggle('holo',g.kind==='char'&&H.has(g.id))}}
const _refresh=refresh;refresh=function(){_refresh();applyHolo()};
H.onChange(applyHolo);applyHolo();
})();
