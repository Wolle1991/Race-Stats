const statusBox = document.getElementById("statusBox");
const linksList = document.getElementById("linksList");

async function loadLinks() {
  statusBox.textContent = "Lade Links...";
  try {
    const links = await fetchLinks();
    statusBox.textContent = links.length ? `Geladen: ${links.length} Links` : "Noch keine Links eingetragen.";

    linksList.innerHTML = `
      <div class="linkGrid">
        ${links.map(link => `
          <a class="linkCard" href="${escapeHtml(safeUrl(link.url))}" target="_blank" rel="noopener">
            <h2>${escapeHtml(link.title)}</h2>
            ${link.description ? `<p>${escapeHtml(link.description)}</p>` : ""}
            <span>${escapeHtml(link.url)}</span>
          </a>
        `).join("")}
      </div>
    `;
  } catch (err) {
    statusBox.textContent = "Fehler beim Laden: " + err.message;
  }
}

loadLinks();
