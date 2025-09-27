/** CONFIG
 * Update these values. You can swap to live fetch later.
 */
const CONFIG = {
  links: {
    twitter: "https://x.com/predictablepaul",
    telegram: "https://t.me/predictablepaul",
    docs: "#",
    pump_home: "https://pump.fun"
  },
  wallets: {
    traderRewards: "PAUL_REWARDS_WALLET_ADDRESS",
    futureInvestment: "PAUL_FUTURE_WALLET_ADDRESS",
    teamReserve: "PAUL_TEAM_WALLET_ADDRESS"
  },
  currentCoin: {
    day: 2,
    title: "Predictable Paul #2: ???",
    ticker: "$PAUL2",
    ca: "REPLACE_WITH_TODAY_CA",
    imageUrl: "https://placehold.co/1200x750/png?text=TODAY",       // TODO: replace
    pumpUrl: "https://pump.fun",                                    // TODO: token page
    peakMc: 25000,                                                  // live or placeholder
    volume: 7400,
    holders: 310,
    nextLaunchAt: "2025-09-28T21:00:00-04:00"
  },
  tomorrow: {
    teaserUrl: "https://placehold.co/800x600/png?text=%3F", // blurred/?
    hints: ["Silhouette: broad shoulders", "Palette: electric cyan", "Mood: villain arc"]
  },
  // Include all prior Pauls here (sample has day 1)
  // 'graduated' marks ⭐; king auto-computed by highest peakMc
  archive: [
    { day: 1, title: "Predictable Paul #1: OG Paul", image: "https://placehold.co/800/png?text=PAUL1", peakMc: 17900, ticker: "$PAUL1", graduated: true }
    // Add more days as you go…
  ],
  wall: {
    chunkSize: 12 // how many cards append per "infinite" load
  }
};

/** Shortcuts */
const $ = (s) => document.querySelector(s);
const $$ = (s) => document.querySelectorAll(s);
const fmtUSD = (n) => (n == null ? "—" : `$${Math.round(n).toLocaleString()}`);

/** Header / Footer links */
(function initLinks(){
  $("#twitterLink").href = CONFIG.links.twitter;
  $("#telegramLink").href = CONFIG.links.telegram;
  $("#docsLink").href = CONFIG.links.docs;
  $("#pumpHome").href = CONFIG.links.pump_home;
  $("#pumpHome2").href = CONFIG.links.pump_home;
  $("#pumpExplore").href = CONFIG.links.pump_home;
  $("#year").textContent = new Date().getFullYear();
})();

/** Today’s Paul */
(function initToday(){
  const c = CONFIG.currentCoin;
  $("#currentImage").src = c.imageUrl;
  $("#currentTitle").textContent = `${c.title}`;
  $("#peakBadge").textContent = `Peak MC: ${fmtUSD(c.peakMc)}`;
  $("#statPeak").textContent = fmtUSD(c.peakMc);
  $("#statVol").textContent = fmtUSD(c.volume);
  $("#statHolders").textContent = c.holders?.toLocaleString() ?? "—";

  const caBtn = $("#copyCaBtn");
  caBtn.textContent = c.ca;
  caBtn.addEventListener("click", async () => {
    try{ await navigator.clipboard.writeText(c.ca); caBtn.textContent = "Copied ✓"; setTimeout(()=> caBtn.textContent = c.ca, 1200);}catch{}
  });

  const pumpBtn = $("#pumpTrade");
  pumpBtn.href = c.pumpUrl;

  // Countdown
  const nextAt = new Date(c.nextLaunchAt).getTime();
  const timerEl = $("#countdownTimer");
  const tick = () => {
    const now = Date.now();
    let diff = Math.max(0, nextAt - now);
    const h = Math.floor(diff / 3600000); diff -= h*3600000;
    const m = Math.floor(diff / 60000);    diff -= m*60000;
    const s = Math.floor(diff / 1000);
    timerEl.textContent = `${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`;
  };
  tick(); setInterval(tick, 1000);
})();

/** Tomorrow Teaser */
(function initTomorrow(){
  $("#teaserImage").src = CONFIG.tomorrow.teaserUrl;
  const list = $("#hintsList"); list.innerHTML = "";
  CONFIG.tomorrow.hints.forEach(h => {
    const li = document.createElement("li");
    li.textContent = h;
    list.appendChild(li);
  });
})();

/** Compute merged list of all pauls */
function allPauls(){
  const arr = [];
  const c = CONFIG.currentCoin;
  if (c) arr.push({ day: c.day, title: c.title, image: c.imageUrl, peakMc: c.peakMc, ticker: c.ticker, graduated: (CONFIG.archive||[]).find(a=>a.day===c.day)?.graduated });
  (CONFIG.archive||[]).forEach(a => arr.push({ ...a }));
  return arr;
}

/** Compute King Paul (highest peak across current + archive) */
function computeKing(){
  const items = allPauls().slice().sort((a,b) => (b.peakMc||0) - (a.peakMc||0));
  return items[0];
}

/** King Paul highlight */
(function initKing(){
  const king = computeKing();
  if (!king) return;
  $("#kingImage").src = king.image;
  $("#kingTitle").textContent = king.title || "King Paul";
  $("#kingPeak").textContent = fmtUSD(king.peakMc);
  $("#kingDay").textContent = king.day != null ? `#${king.day}` : "—";
})();

/** Badges for Today (👑 if today is king, ⭐ if graduated) */
(function initTodayBadges(){
  const holder = $("#todayBadges");
  holder.innerHTML = "";
  const king = computeKing();
  if (king && king.day === CONFIG.currentCoin.day){
    const b = document.createElement("span"); b.title="King Paul — highest peak MC"; b.textContent="👑"; holder.appendChild(b);
  }
  const grad = (CONFIG.archive || []).find(a => a.day === CONFIG.currentCoin.day)?.graduated;
  if (grad){
    const s = document.createElement("span"); s.title="Graduated on pump.fun"; s.textContent="⭐"; holder.appendChild(s);
  }
})();

/** Sorting helpers */
function sortPauls(mode){
  const arr = allPauls().slice();
  if (mode === "dayAsc") arr.sort((a,b)=> (a.day||0)-(b.day||0));
  else if (mode === "dayDesc") arr.sort((a,b)=> (b.day||0)-(a.day||0));
  else /* peak */ arr.sort((a,b)=> (b.peakMc||0)-(a.peakMc||0));
  return arr;
}

/** TOP 10 rail (ranked by peak) */
(function initTop10(){
  const top10 = sortPauls("peak").slice(0,10);
  const rail = $("#top10Rail");
  rail.innerHTML = "";
  const king = computeKing();
  top10.forEach((it, idx)=>{
    const card = document.createElement("div");
    card.className = "top-card";
    const isKing = king && king.day === it.day;
    card.innerHTML = `
      <img loading="lazy" src="${it.image}" alt="Paul Day ${it.day}">
      <div class="rank-chip ${isKing ? "rank-king" : ""}">${isKing ? "👑" : "#"+(idx+1)}</div>
    `;
    rail.appendChild(card);
  });
})();

/** WALL: ranked + sort chips + infinite horizontal loading */
let WALL_STATE = { sortMode: "peak", items: [], loaded: 0 };

function buildWallReset(){
  WALL_STATE.items = sortPauls(WALL_STATE.sortMode);
  WALL_STATE.loaded = 0;
  $("#wallRail").innerHTML = "";
  loadMoreWall();
}

function wallCardHTML(it, rankNumber, isKing){
  const badges = [];
  if (isKing) badges.push("👑");
  if (it.graduated) badges.push("⭐");
  const rankClass = isKing ? "rank-badge king" : "rank-badge";
  return `
    <div class="wall-card" aria-label="Rank ${rankNumber} by peak MC">
      <img loading="lazy" src="${it.image}" alt="Paul Day ${it.day}">
      <div class="${rankClass}">${isKing ? "👑" : "#"+rankNumber}</div>
      <div class="meta">
        <span>Day ${it.day} · ${it.title?.split(":")[0] || ""}</span>
        <span class="b">${badges.join(" ")}</span>
      </div>
    </div>
  `;
}

function loadMoreWall(){
  const rail = $("#wallRail");
  const king = computeKing();
  const start = WALL_STATE.loaded;
  const end = Math.min(WALL_STATE.items.length, start + CONFIG.wall.chunkSize);
  for (let i=start; i<end; i++){
    const it = WALL_STATE.items[i];
    const isKing = king && king.day === it.day && WALL_STATE.sortMode === "peak" && i===0;
    rail.insertAdjacentHTML("beforeend", wallCardHTML(it, i+1, !!isKing));
  }
  WALL_STATE.loaded = end;
}

(function initWall(){
  // Sort chips
  $$(".chip").forEach(ch => {
    ch.addEventListener("click", ()=>{
      $$(".chip").forEach(c=>c.classList.remove("active"));
      ch.classList.add("active");
      WALL_STATE.sortMode = ch.dataset.sort;
      buildWallReset();
    });
  });

  buildWallReset();

  // Infinite loading: observe sentinel; when near end, load more
  const sentinel = $("#wallSentinel");
  const obs = new IntersectionObserver((entries)=>{
    entries.forEach(e=>{
      if (e.isIntersecting){
        if (WALL_STATE.loaded < WALL_STATE.items.length){
          loadMoreWall();
        }
      }
    });
  }, { root: null, threshold: 0.1 });
  obs.observe(sentinel);
})();

/** Archive grid */
(function initArchive(){
  const grid = $("#archiveGrid");
  grid.innerHTML = "";
  const king = computeKing();
  const items = (CONFIG.archive || []).slice().sort((a,b)=> (a.day||0)-(b.day||0));
  items.forEach(it => {
    const badges = [];
    if (king && king.day === it.day) badges.push("👑");
    if (it.graduated) badges.push("⭐");
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <div class="media"><img src="${it.image}" alt="Paul Day ${it.day}"></div>
      <div class="meta-row">
        <span>Day ${it.day} · ${it.title}</span>
        <span>${fmtUSD(it.peakMc)} ${badges.join(" ")}</span>
      </div>
    `;
    grid.appendChild(card);
  });
})();

/** Treasury copy buttons */
(function initWalletCopy(){
  const map = {
    wRewards: CONFIG.wallets.traderRewards,
    wFuture: CONFIG.wallets.futureInvestment,
    wTeam: CONFIG.wallets.teamReserve
  };
  Object.entries(map).forEach(([id, val]) => {
    const btn = document.getElementById(id);
    btn?.addEventListener("click", async ()=>{
      try{ await navigator.clipboard.writeText(val); btn.textContent="Copied ✓"; setTimeout(()=>btn.textContent="Copy", 1000);}catch{}
    });
  });
})();

/** Dapp Modal */
(function modal(){
  const dlg = document.getElementById("dappModal");
  const openBtn = document.getElementById("launchDappBtn");
  const closeBtn = document.getElementById("closeDapp");
  openBtn?.addEventListener("click", ()=> dlg.showModal());
  closeBtn?.addEventListener("click", ()=> dlg.close());
})();

/** Scroll reveal */
(function revealOnScroll(){
  const els = $$(".reveal");
  const obs = new IntersectionObserver((entries)=>{
    entries.forEach(e => {
      if (e.isIntersecting){ e.target.classList.add("visible"); obs.unobserve(e.target); }
    });
  }, { threshold: 0.15 });
  els.forEach(el => obs.observe(el));
})();

/** Footer links already wired above */
