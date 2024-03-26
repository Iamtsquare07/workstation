const shadow = document.querySelector(".workstation-shadow"),
  aside = document.querySelector("aside");

function viewMenu() {
  shadow.classList.add("workstation-active");
  aside.classList.add("workstation-active");
  aside.focus();
}

function closeMenu() {
  shadow.classList.remove("workstation-active");
  aside.classList.remove("workstation-active");
}

document.getElementById("workstation-menu").onclick = (e) => {
  e.preventDefault();
  viewMenu();
};

document.querySelector(".workstation-close").onclick = (e) => {
  e.preventDefault();
  closeMenu();
};

shadow.onclick = (e) => {
  e.preventDefault();
  closeMenu();
};

if (document.readyState == "complete") {
  document.body.addEventListener("contextmenu", (e) => {
    e.preventDefault();
  });
}
