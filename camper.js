const searchInput = document.getElementById("camperSearch");
const matchesBox = document.getElementById("camperMatches");
const results = document.getElementById("camperResults");
const loading = document.getElementById("loading");
const errorBox = document.getElementById("error");

let staffData = {};
let campers = [];

function normalizeCategory(value) {
  return String(value || "").toLowerCase().replace(/[^a-z0-9]/g, "");
}

// Camper sheet columns (e.g. "learning class") won't always match the staff
// sheet's Category text exactly (e.g. "Learning"). Match loosely: normalize
// both, then accept an exact match or either one containing the other.
function findCategoryKey(gradeData, rawCategory) {
  const target = normalizeCategory(rawCategory);
  const keys = Object.keys(gradeData || {});

  let match = keys.find(k => normalizeCategory(k) === target);
  if (match) return match;

  match = keys.find(k => {
    const nk = normalizeCategory(k);
    return nk.includes(target) || target.includes(nk);
  });
  return match || null;
}

// Loose search: first letter of the query must match the first letter of
// the target, and every letter after that just needs to appear somewhere
// later in the target, in order (not necessarily consecutive).
// e.g. "mar" or "mzv" both match "Marozov".
function looseMatch(query, target) {
  if (!query) return false;

  query = query.toLowerCase();
  target = target.toLowerCase();

  if (query[0] !== target[0]) return false;

  let qi = 1;
  let ti = 1;

  while (qi < query.length && ti < target.length) {
    if (query[qi] === target[ti]) qi++;
    ti++;
  }

  return qi === query.length;
}

// A camper matches if the query loose-matches their full name, or loose-
// matches any individual word in it (so searching by last name works too).
function camperMatchesQuery(camper, query) {
  if (looseMatch(query, camper.name)) return true;
  return camper.name.split(/\s+/).some(word => looseMatch(query, word));
}

function renderMatches() {
  const query = searchInput.value.trim().toLowerCase();
  matchesBox.innerHTML = "";
  results.innerHTML = "";

  if (query.length < 1) return;

  const matches = campers
    .filter(c => camperMatchesQuery(c, query))
    .slice(0, 15);

  if (!matches.length) {
    matchesBox.innerHTML = '<div class="no-payment">No campers found.</div>';
    return;
  }

  matches.forEach(camper => {
    const button = document.createElement("button");
    button.className = "selection-button";
    button.textContent = `${camper.name} · ${camper.grade}`;

    button.addEventListener("click", () => {
      document.querySelectorAll("#camperMatches .selection-button").forEach(b =>
        b.classList.remove("active")
      );
      button.classList.add("active");
      renderCamperResults(camper);
    });

    matchesBox.appendChild(button);
  });
}

function findSelectionKey(categoryData, rawSelection) {
  const target = normalizeCategory(rawSelection);
  const keys = Object.keys(categoryData || {});

  let match = keys.find(k => normalizeCategory(k) === target);
  if (match) return match;

  match = keys.find(k => {
    const nk = normalizeCategory(k);
    return nk.includes(target) || target.includes(nk);
  });
  return match || null;
}

function findGradeKey(rawGrade) {
  const target = normalizeCategory(rawGrade);
  const keys = Object.keys(staffData || {});

  let match = keys.find(k => normalizeCategory(k) === target);
  if (match) return match;

  match = keys.find(k => {
    const nk = normalizeCategory(k);
    return nk.includes(target) || target.includes(nk);
  });
  return match || null;
}

function renderCamperResults(camper) {
  results.innerHTML = "";

  const gradeKey = findGradeKey(camper.grade);
  const gradeData = gradeKey ? staffData[gradeKey] : null;
  const categories = Object.entries(camper.selections || {});

  if (!gradeData || !categories.length) {
    results.innerHTML = '<div class="no-payment">No bunk/class info found for this camper yet.</div>';
    return;
  }

  const heading = document.createElement("h2");
  heading.className = "results-heading";
  heading.textContent = `${camper.name} · ${camper.grade}`;
  results.appendChild(heading);

  categories.forEach(([rawCategory, rawSelection]) => {
    const categoryKey = findCategoryKey(gradeData, rawCategory);
    const categoryData = categoryKey ? gradeData[categoryKey] : null;
    const selectionKey = categoryData ? findSelectionKey(categoryData, rawSelection) : null;
    const staff = selectionKey ? categoryData[selectionKey] : null;

    const section = document.createElement("section");
    section.className = "category";

    const subHeading = document.createElement("h2");
    subHeading.textContent = `${rawCategory} · ${rawSelection}`;
    section.appendChild(subHeading);

    const grid = document.createElement("div");
    grid.className = "staff-grid";

    if (staff && staff.length) {
      staff.forEach(person => grid.appendChild(buildStaffCard(person)));
    } else {
      grid.innerHTML = '<div class="no-payment">No staff info listed for this yet.</div>';
    }

    section.appendChild(grid);
    results.appendChild(section);
  });

  results.scrollIntoView({ behavior: "smooth", block: "start" });
}

searchInput.addEventListener("input", renderMatches);

Promise.all([
  fetch("staff.json").then(r => {
    if (!r.ok) throw new Error("staff.json not found");
    return r.json();
  }),
  fetch("campers.json").then(r => {
    if (!r.ok) throw new Error("campers.json not found");
    return r.json();
  })
])
  .then(([staffJson, campersJson]) => {
    staffData = staffJson;
    campers = campersJson;
    loading.hidden = true;
  })
  .catch(() => {
    loading.hidden = true;
    errorBox.hidden = false;
  });

document.getElementById("copyright").textContent =
  `© ${new Date().getFullYear()} CGI Florida`;
