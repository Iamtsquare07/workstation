const addAspectBtn = document.getElementById("add-aspect");
const trackingContainer = document.getElementById("tracking-container");
let goalInput = document.getElementById("daily-goal-input");
const alertBox = document.querySelector(".aspect-alert");

// Load goals from localStorage
function loadGoals() {
  trackingContainer.innerHTML = "";
  const goals = JSON.parse(localStorage.getItem("aspectGoals")) || [];
  resetCompletedGoalsIfNewDay(goals);
  goals.forEach((goal) => createAspectGoalElement(goal.text, goal.completed));
  toggleAlert();
}

// Save goals to localStorage
function saveGoals() {
  const goals = Array.from(document.querySelectorAll(".aspect-item")).map(
    (item) => ({
      text: item.querySelector(".goal-text").textContent,
      completed: item.querySelector(".goal-checkbox").checked,
    })
  );
  localStorage.setItem("aspectGoals", JSON.stringify(goals));
  localStorage.setItem("lastSavedDate", new Date().toDateString());
  toggleAlert();
}

// Toggle alert based on aspect items
function toggleAlert() {
  const hasGoals = document.querySelectorAll(".aspect-item").length > 0;
  alertBox.style.display = hasGoals ? "block" : "none";
}

// Reset completed goals if a new day starts
function resetCompletedGoalsIfNewDay(goals) {
  const lastSavedDate = localStorage.getItem("lastSavedDate");
  const today = new Date().toDateString();

  if (lastSavedDate !== today) {
    goals.forEach((goal) => (goal.completed = false));
    localStorage.setItem("aspectGoals", JSON.stringify(goals));
    localStorage.setItem("lastSavedDate", today);
  }
}

// Create aspect goal element
function createAspectGoalElement(text, completed = false) {
  const aspectItem = document.createElement("div");
  aspectItem.classList.add("aspect-item");

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.classList.add("goal-checkbox");
  checkbox.checked = completed;
  checkbox.addEventListener("change", saveGoals);

  const goalText = document.createElement("span");
  goalText.classList.add("goal-text");
  goalText.textContent = text;

  const editBtn = document.createElement("button");
  editBtn.innerHTML = "<i class='fas fa-edit'></i>";
  editBtn.classList.add("edit-btn");
  editBtn.addEventListener("click", () => editGoal(goalText));

  const deleteBtn = document.createElement("button");
  deleteBtn.innerHTML = "<i class='fas fa-trash'></i>";
  deleteBtn.classList.add("delete-btn");
  deleteBtn.addEventListener("click", () => {
    aspectItem.remove();
    saveGoals();
  });

  aspectItem.appendChild(checkbox);
  aspectItem.appendChild(goalText);
  aspectItem.appendChild(editBtn);
  aspectItem.appendChild(deleteBtn);
  trackingContainer.appendChild(aspectItem);
  saveGoals();
}

// Edit goal function
function editGoal(goalText) {
  const newText = prompt("Edit your goal:", goalText.textContent);
  if (newText !== null && newText.trim() !== "") {
    goalText.textContent = newText.trim();
    saveGoals();
  }
}

// Add new aspect goal
function addAspectGoal() {
  const aspect = goalInput.value.trim();
  if (aspect === "") {
    return alert("Please enter an aspect.");
  }
  createAspectGoalElement(aspect);
  goalInput.value = "";
  goalInput.focus();
}

addAspectBtn.addEventListener("click", () => {
  addAspectGoal();
  toggleAlert();
});

goalInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    addAspectGoal();
    toggleAlert();
  }
});

// Load goals on page load
document.addEventListener("DOMContentLoaded", () => {
  loadGoals();
  toggleAlert();
});
