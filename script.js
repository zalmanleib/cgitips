const CATEGORY_ICONS = {};

const gradeSelect = document.getElementById("grade");
const directory = document.getElementById("directory");
const results = document.getElementById("results");
const loading = document.getElementById("loading");
const errorBox = document.getElementById("error");

let data = {};
let activeSelectionButton = null;

function categoryLabel(category) {
  return category;
}

function renderGrades() {
  Object.keys(data).forEach(grade => {
    const option = document.createElement("option");
    option.value = grade;
    option.textContent = grade;
    gradeSelect.appendChild(option);
  });

  const savedGrade = localStorage.getItem("cgiTipsGrade");

  if (savedGrade && data[savedGrade]) {
    gradeSelect.value = savedGrade;
    renderDirectory();
  }
}

function renderDirectory() {
  const grade = gradeSelect.value;

  directory.innerHTML = "";
  results.innerHTML = "";
  activeSelectionButton = null;

  if (!grade || !data[grade]) return;

  localStorage.setItem("cgiTipsGrade", grade);

  Object.entries(data[grade]).forEach(([category, selections]) => {
    const section = document.createElement("section");
    section.className = "category";

    const heading = document.createElement("h2");
    heading.textContent = categoryLabel(category);

    section.appendChild(heading);

    const list = document.createElement("div");
    list.className = "selection-list";

    Object.keys(selections).forEach(selection => {
      const button = document.createElement("button");

      button.className = "selection-button";
      button.textContent = selection;

      button.addEventListener("click", () => {
        if (activeSelectionButton) {
          activeSelectionButton.classList.remove("active");
        }

        button.classList.add("active");
        activeSelectionButton = button;

        renderResults(
          category,
          selection,
          selections[selection]
        );
      });

      list.appendChild(button);
    });

    section.appendChild(list);
    directory.appendChild(section);
  });
}

function renderResults(category, selection, staff) {
  results.innerHTML = "";

  const heading = document.createElement("h2");

  heading.className = "results-heading";
  heading.textContent = `${category} · ${selection}`;

  results.appendChild(heading);

  const grid = document.createElement("div");
  grid.className = "staff-grid";

  staff.forEach(person => grid.appendChild(buildStaffCard(person)));

  results.appendChild(grid);

  results.scrollIntoView({
    behavior: "smooth",
    block: "start"
  });
}

gradeSelect.addEventListener("change", renderDirectory);

fetch("staff.json")
  .then(response => {
    if (!response.ok) {
      throw new Error("staff.json not found");
    }

    return response.json();
  })
  .then(json => {
    data = json;

    loading.hidden = true;

    renderGrades();
  })
  .catch(() => {
    loading.hidden = true;

    errorBox.hidden = false;
  });

document.getElementById("copyright").textContent =
  `© ${new Date().getFullYear()} CGI Florida`;
