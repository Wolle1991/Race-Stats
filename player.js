const statusBox = document.getElementById("statusBox");
const profileEl = document.getElementById("profile");
const playerTitle = document.getElementById("playerTitle");
const playerSub = document.getElementById("playerSub");

function createBigAvatar(profile, name) {
  const src = avatarSrc(profile);

  if (src) {
    return `<img class="avatar bigAvatar" src="${escapeHtml(src)}" alt="${escapeHtml(name)}">`;
  }

  return `<div class="avatar bigAvatar avatarFallback">${escapeHtml((name || "?").slice(0, 1).toUpperCase())}</div>`;
}

const params = new URLSearchParams(location.search);
const playerName = params.get("name") || "";

function linkButton(label, url) {
  const u = safeUrl(url);
  if (!u) return "";
  return `<a class="btn" href="${escapeHtml(u)}" target="_blank" rel="noopener">${escapeHtml(label)}</a>`;
}

function renderProfile(player, profile) {
  playerTitle.textContent = player.name;
  playerSub.textContent = `${player.races} eingetragene Races`;

  const rows = [...player.rows].sort((a, b) => String(b.datum).localeCompare(String(a.datum)));

  profileEl.innerHTML = `
    <section class="profileHeader">
      ${createBigAvatar(profile, player.name)}
      <div class="profileText">
        <h2>${escapeHtml(player.name)}</h2>
        ${profile.bio ? `<p>${escapeHtml(profile.bio).replaceAll("\n", "<br>")}</p>` : `<p class="muted">Noch keine Beschreibung eingetragen.</p>`}
        <div class="profileLinks">
          ${linkButton("Twitch", profile.twitch)}
          ${profile.discord ? `<span class="discordPill">Discord: ${escapeHtml(profile.discord)}</span>` : ""}
        </div>
      </div>
    </section>

    <div class="statsGrid">
      <div class="statBox"><b>${player.races}</b><span>Races</span></div>
      <div class="statBox gold"><b>${player.first}</b><span>1. Plätze</span></div>
      <div class="statBox silver"><b>${player.second}</b><span>2. Plätze</span></div>
      <div class="statBox bronze"><b>${player.third}</b><span>3. Plätze</span></div>
      <div class="statBox"><b>${player.podiums}</b><span>Podiums</span></div>
      <div class="statBox"><b>${player.finishes}</b><span>Finishes</span></div>
      <div class="statBox"><b>${player.ff}</b><span>FF</span></div>
      <div class="statBox"><b>${player.dnf}</b><span>DNF</span></div>
      <div class="statBox"><b>${player.avgPlace ? player.avgPlace.toFixed(2) : "-"}</b><span>Ø Platz</span></div>
      <div class="statBox"><b>${formatSeconds(player.bestTime)}</b><span>Bestzeit</span></div>
      <div class="statBox"><b>${formatSeconds(player.avgTime)}</b><span>Ø Zeit</span></div>
    </div>

    <h2 class="sectionTitle">Race Verlauf</h2>
    <div class="tableWrap">
      <table>
        <thead><tr><th>Datum</th><th>Race</th><th>Platz</th><th>Status</th><th>Zeit</th></tr></thead>
        <tbody>
          ${rows.map(r => `
            <tr>
              <td>${escapeHtml(r.datum || "")}</td>
              <td>${escapeHtml(r.race || "")}</td>
              <td class="place">${medalForPlace(r.platz)} ${escapeHtml(r.platz)}</td>
              <td><span class="badge ${escapeHtml(r.status || "").toLowerCase()}">${escapeHtml(r.status)}</span></td>
              <td class="time">${escapeHtml(r.zeit || "-")}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>
  `;
}

async function loadProfile() {
  if (!playerName) {
    statusBox.textContent = "Kein Racer angegeben.";
    return;
  }

  statusBox.textContent = "Lade Profil...";
  try {
    const rows = await fetchRows(statusBox);
    const profiles = await fetchProfiles();
    const players = buildPlayerStats(rows);
    const player = players.find(p => p.name.toLowerCase() === playerName.toLowerCase());

    if (!player) {
      statusBox.textContent = "Racer nicht gefunden.";
      return;
    }

    statusBox.textContent = "";
    renderProfile(player, profiles[player.name] || {});
  } catch (err) {
    statusBox.textContent = "Fehler beim Laden: " + err.message;
  }
}

loadProfile();
