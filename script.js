/* ==========================
   QUICK DAILY CONFIG (edit these)
   ========================== */

// Today’s Paul
const TODAY = {
  ticker: "$PP1",                                // e.g., "$PAUL29"
  imageUrl: "https://predictablepump.com/pp1.png",   // put today’s Paul image URL
  pumpLink: "https://pump.fun/coin/REPLACE_THIS"  // pump.fun link for today’s Paul
};

// Optional: public wallet addresses to display in Treasury
const WALLETS = [
  // { label: "Creator Fee Treasury", address: "So11111111111111111111111111111111111111112" },
  // { label: "Ops Wallet", address: "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" }
];

// Treasury allocation rows (editable copy)
const TREASURY_ALLOCATION = [
  { name: "Trader Rewards", pct: "60%", desc: "Payouts for top traders" },
  { name: "Development", pct: "20%", desc: "Project upgrades" },
  { name: "Marketing & Collabs", pct: "10%", desc: "Expanding the brand and streams of rev." },
  { name: "Team + Ops Reserve", pct: "10%", desc: "Team, security, audits, fees, etc." }
];

/* Demo Top-10 data — replace with your feed when ready */
const TOP10_DEMO = [
  { name: "Predictable Paul #1: OG Paul", ticker: "$PP1", peakMc: 0, date: "-", link: "https://pump.fun/coin/..." },
  { name: "-", ticker: "-", peakMc: 0, date: "-", link: "https://pump.fun/coin/..." },
  { name: "-", ticker: "-", peakMc: 0,  date: "-", link: "https://pump.fun/coin/..." },
  { name: "-", ticker: "-", peakMc: 0,  date: "-", link: "https://pump.fun/coin/..." },
  { name: "-", ticker: "-", peakMc: 0,  date: "-", link: "https://pump.fun/coin/..." },
  { name: "-", ticker: "-", peakMc: 0,  date: "-", link: "https://pump.fun/coin/..." },
  { name: "-", ticker: "-", peakMc: 0,  date: "-", link: "https://pump.fun/coin/..." },
  { name: "-", ticker: "-", peakMc: 0,  date: "-", link: "https://pump.fun/coin/..." },
  { name: "-", ticker: "-", peakMc: 0,  date: "-", link: "https://pump.fun/coin/..." },
  { name: "-", ticker: "-", peakMc: 0,  date: "-", link: "https://pump.fun/coin/..." }
];

/* ==========================
   RUNTIME
   ========================== */

document.addEventListener("DOMContentLoaded", () => {
  // Hero binds
  document.getElementById("paulTicker").textContent = TODAY.ticker;
  document.getElementById("paulImg").src = TODAY.imageUrl;
  document.getElementById("pumpLink").href = TODAY.pumpLink;

  // Modal
  const modal = document.getElementById("comingSoonModal");
  document.getElementById("launchDapp").addEventListener("click", () => modal.showModal());
  document.getElementById("closeModal").addEventListener("click", () => modal.close());

  // Footer year
  document.getElementById("year").textContent = new Date().getFullYear();

  // Render Top-10
  renderTop10(TOP10_DEMO);

  // Render Treasury
  renderTreasury(TREASURY_ALLOCATION, WALLETS);

  // Start countdown to next 9 PM EST
  startCountdownNY(21, 0, 0, document.getElementById("countdown"));
});

/* ==========================
   Leaderboard Rendering
   ========================== */
function renderTop10(rows) {
  const tbody = document.querySelector("#top10Table tbody");
  tbody.innerHTML = "";

  const sorted = [...rows].sort((a, b) => b.peakMc - a.peakMc).slice(0, 10);
  for (let i = 0; i < sorted.length; i++) {
    const r = sorted[i];
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${i + 1}</td>
      <td>${escapeHtml(r.name)}</td>
      <td><code>${escapeHtml(r.ticker)}</code></td>
      <td>$${formatNumber(r.peakMc)}</td>
      <td>${formatDate(r.date)}</td>
      <td><a href="${r.link}" target="_blank" rel="noopener">View</a></td>
    `;
    tbody.appendChild(tr);
  }
}

function escapeHtml(str=""){
  return str.replace(/[&<>"']/g, s => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[s]));
}
function formatNumber(n){
  return n.toLocaleString("en-US");
}
function formatDate(iso){
  const d = new Date(iso + "T00:00:00Z");
  return d.toLocaleDateString("en-US", { year:"numeric", month:"short", day:"2-digit" });
}

/* ==========================
   Treasury Rendering
   ========================== */
function renderTreasury(allocationRows, wallets) {
  const tbody = document.getElementById("treasuryTable");
  tbody.innerHTML = "";
  allocationRows.forEach(r => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${escapeHtml(r.name)}</td>
      <td>${escapeHtml(r.pct)}</td>
      <td>${escapeHtml(r.desc)}</td>
    `;
    tbody.appendChild(tr);
  });

  const walletsWrap = document.getElementById("wallets");
  walletsWrap.innerHTML = "";
  if (wallets && wallets.length) {
    const frag = document.createDocumentFragment();
    wallets.forEach(w => {
      const div = document.createElement("div");
      div.innerHTML = `<strong>${escapeHtml(w.label)}:</strong> <code>${escapeHtml(w.address)}</code>`;
      frag.appendChild(div);
    });
    walletsWrap.appendChild(frag);
  }
}

/* ==========================
   Countdown to 9:00 PM EST/EDT
   (America/New_York) — DST safe
   ========================== */

/**
 * Produces a UNIX epoch (ms) for a given NY local date/time (y,m,d,h,mi,s).
 * We compute the current NY offset by comparing the "zoned" representation
 * with the local Date, then back out the UTC timestamp.
 */
function nyEpochMs(y, m, d, h=0, mi=0, s=0) {
  // Build a string in the NY zone for now and for the target
  const fmt = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    hour12: false,
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit'
  });

  // Get current NY time parts and current system now
  const sysNow = new Date();
  const nyNowParts = splitNYParts(fmt.format(sysNow));
  // Construct a UTC date using NY parts as if they were UTC
  const fauxUtcNow = Date.UTC(nyNowParts.y, nyNowParts.m-1, nyNowParts.d, nyNowParts.h, nyNowParts.min, nyNowParts.s);
  // Offset between faux UTC (built from NY view) and real now UTC
  const offsetMs = fauxUtcNow - sysNow.getTime();

  // Build target as if UTC from NY (y,m,d,h,mi,s), then subtract the same offset
  const targetFauxUtc = Date.UTC(y, m-1, d, h, mi, s);
  return targetFauxUtc - offsetMs;
}

function splitNYParts(s){
  // "MM/DD/YYYY, HH:MM:SS"
  const [datePart, timePart] = s.split(", ");
  const [mm, dd, yyyy] = datePart.split("/").map(Number);
  const [HH, MM, SS] = timePart.split(":").map(Number);
  return { y: yyyy, m: mm, d: dd, h: HH, min: MM, s: SS };
}

function getNYNowParts() {
  const fmt = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    hour12: false,
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit'
  });
  return splitNYParts(fmt.format(new Date()));
}

function nextNYNinePM() {
  const nowNY = getNYNowParts();
  // today 21:00:00 NY
  let targetY = nowNY.y, targetM = nowNY.m, targetD = nowNY.d;
  const targetH = 21, targetMin = 0, targetS = 0;

  // If we are at/after 21:00:00 NY, move to tomorrow
  if (nowNY.h > 21 || (nowNY.h === 21 && (nowNY.min > 0 || nowNY.s >= 0))) {
    // add one day in NY terms
    const tmpUtc = nyEpochMs(nowNY.y, nowNY.m, nowNY.d, 12, 0, 0) + 24*60*60*1000; // noon next day (NY safe)
    const nyNext = getNYFromEpoch(tmpUtc);
    targetY = nyNext.y; targetM = nyNext.m; targetD = nyNext.d;
  }
  const epoch = nyEpochMs(targetY, targetM, targetD, targetH, targetMin, targetS);
  return epoch;
}

function getNYFromEpoch(epochMs){
  const fmt = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    hour12: false,
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit'
  });
  return splitNYParts(fmt.format(new Date(epochMs)));
}

function startCountdownNY(hour=21, minute=0, second=0, targetEl){
  function tick(){
    const target = nextNYNinePM();
    const now = Date.now();
    let diff = target - now;

    if (diff <= 0) {
      targetEl.textContent = "00:00:00";
      setTimeout(tick, 1000);
      return;
    }
    const h = Math.floor(diff / 3_600_000); diff -= h*3_600_000;
    const m = Math.floor(diff / 60_000);    diff -= m*60_000;
    const s = Math.floor(diff / 1_000);

    targetEl.textContent = `${pad(h)}:${pad(m)}:${pad(s)}`;
    requestAnimationFrame(() => setTimeout(tick, 250)); // smooth & efficient
  }
  tick();
}

function pad(n){ return String(n).padStart(2,"0"); }
