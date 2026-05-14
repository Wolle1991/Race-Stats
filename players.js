const playersEl = document.getElementById("players");
const statusBox = document.getElementById("statusBox");
const playerSearch = document.getElementById("playerSearch");
const reloadBtn = document.getElementById("reloadBtn");

function createAvatar(profile, name) {
  const src = avatarSrc(profile);

  if (src) {
    return `<img class="avatar" src="${escapeHtml(src)}" alt="${escapeHtml(name)}">`;
  }

  return `<div class="avatar avatarFallback">${escapeHtml((name || "?").slice(0, 1).toUpperCase())}</div>`;
}

let allPlayers = [];
let profiles = {};

function renderPlayers(players) {
  if (!players.length) {
    playersEl.innerHTML = `<div class="empty">Keine Racer gefunden.</div>`;
    return;
  }

  players.sort((a, b) => {
    if (b.first !== a.first) return b.first - a.first;
    if (b.podiums !== a.podiums) return b.podiums - a.podiums;
    return b.races - a.races;
  });

  playersEl.innerHTML = `
    <div class="playerGrid">
      ${players.map(p => {
        const profile = profiles[p.name] || {};
        return `
        <a class="playerCard" href="${playerUrl(p.name)}">
          <div class="playerCardTop">
            ${createAvatar(profile, p.name)}
            <div>
              <div class="playerName">${escapeHtml(p.name)}</div>
              ${profile.discord ? `<div class="mutedSmall">Discord: ${escapeHtml(profile.discord)}</div>` : ""}
            </div>
          </div>
          <div class="statLine"><b>${p.races}</b><span>Races</span></div>
          <div class="medalRow"><span>🥇 ${p.first}</span><span>🥈 ${p.second}</span><span>🥉 ${p.third}</span></div>
          <div class="smallStats"><span>Finish: ${p.finishes}</span><span>FF: ${p.ff}</span><span>DNF: ${p.dnf}</span></div>
        </a>`;
      }).join("")}
    </div>
  `;
}

function applySearch() {
  const q = playerSearch.value.trim().toLowerCase();
  if (!q) return renderPlayers([...allPlayers]);
  renderPlayers(allPlayers.filter(p => p.name.toLowerCase().includes(q)));
}

async function loadPlayers() {
  statusBox.textContent = "Lade Racer...";
  try {
    const rows = await fetchRows(statusBox);
    profiles = await fetchProfiles();
    allPlayers = buildPlayerStats(rows);
    statusBox.textContent = `Gefunden: ${allPlayers.length} Racer`;
    renderPlayers([...allPlayers]);
  } catch (err) {
    statusBox.textContent = "Fehler beim Laden: " + err.message;
  }
}

playerSearch.addEventListener("input", applySearch);
reloadBtn.addEventListener("click", loadPlayers);
loadPlayers();
