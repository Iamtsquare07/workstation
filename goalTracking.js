window.closeGoalSettingModal = function () {
    document.querySelector(".goal-tracking-modal").style.display = "none";
  };

document.getElementById("add-aspects").addEventListener("click", () => {
  document.querySelector(".goal-tracking-modal").style.display = "block";
  closeMenu();
})