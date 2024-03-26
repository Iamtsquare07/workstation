function toggleDarkMode() {
  var body = document.getElementById("workstation-root");
  var currentClass = body.className;
  body.className =
    currentClass == "workstation-dark-mode"
      ? "workstation-light-mode"
      : "workstation-dark-mode";

  // Update icon after class change
  var icon = document.getElementById("workstation-icon");
  setTimeout(function() {
    icon.innerHTML =
      body.className == "workstation-dark-mode"
        ? `<i class="fa-regular fa-moon"></i>`
        : `<i class="fa-regular fa-sun"></i>`;
  }, 0);
}
