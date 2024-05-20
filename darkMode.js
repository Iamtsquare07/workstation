const body = document.getElementById("workstation-root");
const icon = document.getElementById("workstation-icon");

function toggleDarkMode() {
  const currentClass = body.className;
  body.className =
    currentClass == "workstation-dark-mode"
      ? "workstation-light-mode"
      : "workstation-dark-mode";

  // Update icon after class change
  setTimeout(function () {
    icon.innerHTML =
      body.className == "workstation-dark-mode"
        ? `<i class="fa-regular fa-sun"></i>`
        : `<i class="fa-regular fa-moon"></i>`;
  }, 0);

  const mode = body.className == "workstation-dark-mode" ? "dark" : "light";
  localStorage.setItem("mode", mode);
}

document.addEventListener("DOMContentLoaded", () => {
  const mode = localStorage.getItem("mode");
  if (mode === "dark") {
    body.className = "workstation-dark-mode";
    icon.innerHTML = `<i class="fa-regular fa-sun"></i>`;
  }
});
