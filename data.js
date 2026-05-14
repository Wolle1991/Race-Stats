function escapeHtml(text) {
  return String(text ?? "").replace(/[&<>"']/g, s => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
  }[s]));
}

function safeUrl(url) {
  const u = String(url || "").trim();
  if (!u) return "";
  if (u.startsWith("https://") || u.startsWith("http://")) return u;

  // Erlaubt lokale Dateien aus deinem GitHub-Repository, z.B.
  // images/wolle_91.png
  // ./images/wolle_91.png
  if (u.startsWith("images/") || u.startsWith("./images/")) return u;

  return "";
}

function playerUrl(name) {
  return `player.html?name=${encodeURIComponent(name)}`;
}

function normalizeName(name) {
  return String(name || "").trim();
}

function parseTimeToSeconds(time) {
  if (!time) return null;
  const clean = String(time).trim();

  if (!clean || clean === "-" || clean.toUpperCase() === "FF" || clean.toUpperCase() === "DNF") {
    return null;
  }

  const parts = clean.split(":");
  if (parts.length < 2 || parts.length > 3) return null;

  const nums = parts.map(p => Number(p));
  if (nums.some(n => Number.isNaN(n))) return null;

  let seconds = 0;
  if (nums.length === 3) seconds = nums[0] * 3600 + nums[1] * 60 + nums[2];
  else seconds = nums[0] * 60 + nums[1];

  if (seconds <= 5) return null;
  return seconds;
}

function formatSeconds(seconds) {
  if (seconds === null || seconds === undefined || Number.isNaN(seconds)) return "-";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds - h * 3600 - m * 60;
  return `${h}:${String(m).padStart(2, "0")}:${s.toFixed(1).padStart(4, "0")}`;
}

async function api(action, payload = null) {
  if (!SCRIPT_URL) throw new Error("SCRIPT_URL fehlt in config.js");

  if (payload === null) {
    const res = await fetch(`${SCRIPT_URL}?action=${encodeURIComponent(action)}`);
    return await res.json();
  }

  const res = await fetch(SCRIPT_URL, {
    method: "POST",
    body: JSON.stringify({ action, ...payload })
  });
  return await res.json();
}

async function fetchRows(statusBox) {
  if (!SCRIPT_URL) {
    if (statusBox) statusBox.innerHTML = "Bitte zuerst in <b>config.js</b> deine Google Apps Script URL eintragen.";
    return [];
  }
  const data = await api("list");
  if (!data.ok) throw new Error(data.error || "Unbekannter Fehler");
  return data.rows || [];
}

async function fetchProfiles() {
  const data = await api("profiles");
  if (!data.ok) throw new Error(data.error || "profile_error");
  return data.profiles || {};
}

async function fetchLinks() {
  const data = await api("links");
  if (!data.ok) throw new Error(data.error || "links_error");
  return data.links || [];
}

function buildPlayerStats(rows) {
  const players = {};

  for (const row of rows) {
    const name = normalizeName(row.name);
    if (!name) continue;

    if (!players[name]) {
      players[name] = {
        name,
        races: 0,
        finishes: 0,
        ff: 0,
        dnf: 0,
        first: 0,
        second: 0,
        third: 0,
        podiums: 0,
        totalPlace: 0,
        totalTime: 0,
        timedFinishes: 0,
        bestTime: null,
        rows: []
      };
    }

    const p = players[name];
    const place = Number(row.platz);
    const status = String(row.status || "").toUpperCase();
    const seconds = parseTimeToSeconds(row.zeit);

    p.races += 1;
    p.rows.push(row);

    if (status === "FF") p.ff += 1;
    if (status === "DNF") p.dnf += 1;

    if (status === "FINISH") {
      p.finishes += 1;
      if (!Number.isNaN(place) && place > 0) {
        p.totalPlace += place;
        if (place === 1) p.first += 1;
        if (place === 2) p.second += 1;
        if (place === 3) p.third += 1;
        if (place <= 3) p.podiums += 1;
      }

      if (seconds !== null) {
        p.totalTime += seconds;
        p.timedFinishes += 1;
        if (p.bestTime === null || seconds < p.bestTime) p.bestTime = seconds;
      }
    }
  }

  return Object.values(players).map(p => ({
    ...p,
    avgPlace: p.finishes ? p.totalPlace / p.finishes : null,
    avgTime: p.timedFinishes ? p.totalTime / p.timedFinishes : null
  }));
}

function medalForPlace(place) {
  const n = Number(place);
  if (n === 1) return "🥇";
  if (n === 2) return "🥈";
  if (n === 3) return "🥉";
  return "";
}

function fallbackAvatar(name) {
  return `<div class="avatarFallback">${escapeHtml((name || "?").slice(0, 1).toUpperCase())}</div>`;
}

function avatarSrc(profile) {
  return safeUrl(profile?.image);
}

function avatarHtml(profile, name, big = false) {
  const src = avatarSrc(profile);
  const cls = big ? "avatar bigAvatar" : "avatar";
  const letter = escapeHtml((name || "?").slice(0, 1).toUpperCase());

  if (src) {
    return `<img class="${cls}" src="${escapeHtml(src)}" alt="${escapeHtml(name)}">`;
  }

  return `<div class="${cls} avatarFallback">${letter}</div>`;
}
