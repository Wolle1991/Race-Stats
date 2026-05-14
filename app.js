const resultsEl = document.getElementById("results");
const statusBox = document.getElementById("statusBox");
const searchInput = document.getElementById("searchInput");
const reloadBtn = document.getElementById("reloadBtn");

let allRows = [];

function groupByRace(rows) {
  const grouped = {};
  for (const row of rows) {
    const key = `${row.datum || ""}|||${row.race || ""}`;
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(row);
  }
  return grouped;
}

function render(rows) {
  if (!rows.length) {
    resultsEl.innerHTML = `<div class="empty">Keine Ergebnisse gefunden.</div>`;
    return;
  }

  const grouped = groupByRace(rows);
  resultsEl.innerHTML = Object.entries(grouped).map(([key, racers]) => {
    racers.sort((a, b) => Number(a.platz) - Number(b.platz));
    const [datum, race] = key.split("|||");

    return `
      <section class="raceBlock">
        <div class="raceHead"><h2>${escapeHtml(race || "Race")}</h2><span>${escapeHtml(datum || "")}</span></div>
        <div class="tableWrap">
          <table>
            <thead><tr><th>Platz</th><th>Name</th><th>Status</th><th>Zeit</th></tr></thead>
            <tbody>
              ${racers.map(r => `
                <tr>
                  <td class="place">${medalForPlace(r.platz)} ${escapeHtml(r.platz)}</td>
                  <td><a href="${playerUrl(r.name)}">${escapeHtml(r.name)}</a></td>
                  <td><span class="badge ${escapeHtml(r.status || "").toLowerCase()}">${escapeHtml(r.status)}</span></td>
                  <td class="time">${escapeHtml(r.zeit || "-")}</td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>
      </section>
    `;
  }).join("");
}

function applySearch() {
  const q = searchInput.value.trim().toLowerCase();
  if (!q) return render(allRows);
  render(allRows.filter(r =>
    String(r.race || "").toLowerCase().includes(q) ||
    String(r.datum || "").toLowerCase().includes(q) ||
    String(r.name || "").toLowerCase().includes(q) ||
    String(r.status || "").toLowerCase().includes(q)
  ));
}

async function loadResults() {
  statusBox.textContent = "Lade Ergebnisse...";
  try {
    allRows = await fetchRows(statusBox);
    statusBox.textContent = `Geladen: ${allRows.length} Einträge`;
    render(allRows);
  } catch (err) {
    statusBox.textContent = "Fehler beim Laden: " + err.message;
  }
}

searchInput.addEventListener("input", applySearch);
reloadBtn.addEventListener("click", loadResults);
loadResults();
