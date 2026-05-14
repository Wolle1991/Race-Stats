const loginCard = document.getElementById("loginCard");
const adminCard = document.getElementById("adminCard");
const loginForm = document.getElementById("loginForm");
const loginStatus = document.getElementById("loginStatus");
const passwordInput = document.getElementById("passwordInput");
const logoutBtn = document.getElementById("logoutBtn");

const racersEl = document.getElementById("racers");
const template = document.getElementById("racerTemplate");
const addRacerBtn = document.getElementById("addRacerBtn");
const raceForm = document.getElementById("raceForm");
const adminStatus = document.getElementById("adminStatus");

const profileForm = document.getElementById("profileForm");
const profileStatus = document.getElementById("profileStatus");
const linkForm = document.getElementById("linkForm");
const linkStatus = document.getElementById("linkStatus");

const LOGIN_KEY = "zeldaRaceAdminLogin";

function isLoggedIn() { return sessionStorage.getItem(LOGIN_KEY) === "yes"; }
function showAdmin() { loginCard.classList.add("hidden"); adminCard.classList.remove("hidden"); }
function showLogin() { loginCard.classList.remove("hidden"); adminCard.classList.add("hidden"); }
function checkLoginState() { if (isLoggedIn()) showAdmin(); else showLogin(); }

document.querySelectorAll(".tabBtn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".tabBtn").forEach(b => b.classList.remove("active"));
    document.querySelectorAll(".adminTab").forEach(t => t.classList.add("hidden"));
    btn.classList.add("active");
    document.getElementById(btn.dataset.tab).classList.remove("hidden");
  });
});

loginForm.addEventListener("submit", (e) => {
  e.preventDefault();
  if (passwordInput.value === ADMIN_PASSWORD) {
    sessionStorage.setItem(LOGIN_KEY, "yes");
    passwordInput.value = "";
    loginStatus.textContent = "";
    showAdmin();
  } else {
    loginStatus.textContent = "Falsches Passwort.";
  }
});

logoutBtn.addEventListener("click", () => {
  sessionStorage.removeItem(LOGIN_KEY);
  showLogin();
});

function addRacer(values = {}) {
  const node = template.content.cloneNode(true);
  const row = node.querySelector(".racerRow");

  row.querySelector('[name="platz"]').value = values.platz || "";
  row.querySelector('[name="name"]').value = values.name || "";
  row.querySelector('[name="zeit"]').value = values.zeit || "";
  row.querySelector('[name="status"]').value = values.status || "FINISH";

  row.querySelector(".removeBtn").addEventListener("click", () => row.remove());
  racersEl.appendChild(node);
}

function getRacers() {
  return [...document.querySelectorAll(".racerRow")].map(row => ({
    platz: row.querySelector('[name="platz"]').value.trim(),
    name: row.querySelector('[name="name"]').value.trim(),
    zeit: row.querySelector('[name="zeit"]').value.trim(),
    status: row.querySelector('[name="status"]').value
  })).filter(r => r.platz && r.name);
}

async function postAction(action, payload) {
  if (!SCRIPT_URL) throw new Error("SCRIPT_URL fehlt in config.js");
  const res = await fetch(SCRIPT_URL, {
    method: "POST",
    body: JSON.stringify({ action, ...payload })
  });
  const data = await res.json();
  if (!data.ok) throw new Error(data.error || "Unbekannter Fehler");
  return data;
}

addRacerBtn.addEventListener("click", () => addRacer());

raceForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  if (!isLoggedIn()) {
    adminStatus.textContent = "Du bist nicht eingeloggt.";
    showLogin();
    return;
  }

  const form = new FormData(raceForm);
  const payload = {
    race: form.get("race"),
    datum: form.get("datum"),
    racers: getRacers()
  };

  if (!payload.racers.length) {
    adminStatus.textContent = "Bitte mindestens einen Racer eintragen.";
    return;
  }

  adminStatus.textContent = "Speichere Race...";
  try {
    const data = await postAction("save", payload);
    adminStatus.textContent = `Race gespeichert. Einträge: ${data.saved}`;
  } catch (err) {
    adminStatus.textContent = "Fehler beim Speichern: " + err.message;
  }
});

profileForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const form = new FormData(profileForm);
  const payload = {
    name: String(form.get("name") || "").trim(),
    image: String(form.get("image") || "").trim(),
    twitch: String(form.get("twitch") || "").trim(),
    discord: String(form.get("discord") || "").trim(),
    bio: String(form.get("bio") || "").trim()
  };

  profileStatus.textContent = "Speichere Profil...";
  try {
    await postAction("saveProfile", payload);
    profileStatus.textContent = "Profil gespeichert.";
  } catch (err) {
    profileStatus.textContent = "Fehler: " + err.message;
  }
});

linkForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const form = new FormData(linkForm);
  const payload = {
    title: String(form.get("title") || "").trim(),
    url: String(form.get("url") || "").trim(),
    description: String(form.get("description") || "").trim()
  };

  linkStatus.textContent = "Speichere Link...";
  try {
    await postAction("saveLink", payload);
    linkStatus.textContent = "Link gespeichert.";
    linkForm.reset();
  } catch (err) {
    linkStatus.textContent = "Fehler: " + err.message;
  }
});

document.querySelector('[name="datum"]').valueAsDate = new Date();

addRacer({ platz: 1, name: "", zeit: "", status: "FINISH" });
addRacer({ platz: 2, name: "", zeit: "", status: "FINISH" });
addRacer({ platz: 3, name: "", zeit: "", status: "FINISH" });
addRacer({ platz: 4, name: "", zeit: "", status: "FINISH" });

checkLoginState();
