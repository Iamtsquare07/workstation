const addAspectBtn = document.getElementById("add-aspect");
const trackingContainer = document.getElementById("tracking-container");
let goalInput = document.getElementById("daily-goal-input");

function addAspectGoal() {
  const aspect = goalInput.value.trim();
  if (aspect === "") {
    return alert("Please enter an aspect.");
  }
  const aspectItem = document.createElement("div");
  aspectItem.classList.add("aspect-item");
  aspectItem.textContent = aspect;
  trackingContainer.appendChild(aspectItem);
  goalInput.value = "";
  goalInput.focus();
}

addAspectBtn.addEventListener("click", addAspectGoal);
