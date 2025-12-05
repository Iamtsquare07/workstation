import {
  printDailyGoalHours,
  retrieveTrackedTime,
  checkLastVisitedDate,
  startTracking,
  stopTracking,
  capitalizeFirstLetter,
  generateMotivationalMessages,
  wsUser,
  userWorkLocation,
  isRunning,
} from "./timeTracker.js";

document.addEventListener("DOMContentLoaded", function () {
  const taskDateInput = document.getElementById("taskDate");
  const submitButton = document.getElementById("smbtn");
  const message = document.getElementById("message");
  const listsContainer = document.getElementById("lists");
  const completedContainer = document.getElementById("completedList");
  const completedHeader = document.getElementById("completedHeader");
  const clearBtn = document.getElementById("clear");
  const taskHeader = document.querySelector(".taskHeader");
  const completedToggleBtn = document.getElementById("toggleCompletedTasks");

  let completedVisibleCount = 10;

  submitButton.addEventListener("click", addTask);
  document.getElementById("toDo").addEventListener("keypress", function (e) {
    if (e.key === "Enter") addTask();
  });
  clearBtn.addEventListener("click", clearList);

  completedToggleBtn.addEventListener("click", () => {
    const completedTasks = completedContainer.querySelectorAll("li");
    if (completedVisibleCount < completedTasks.length) {
      completedVisibleCount += 10;
    } else {
      completedVisibleCount = 10;
    }
    updateCompletedVisibility();
  });

  renderDate();
  loadTasksFromStorage();
  if (!listsContainer.hasChildNodes() && !completedContainer.hasChildNodes()) {
    clearList();
  }

  // -------------------------------------------------------------
  // DAILY DEFAULT TASKS (FULLY PATCHED + SAFE)
  // -------------------------------------------------------------

  // Editable default task labels
  const DEFAULT_TASKS = [
    "Take Vitamins and Drink Water",
    "Morning workout / Stretching",
    "Play brain games / Puzzles",
    "Get Sunlight Exposure",
    "Create or Edit Content",
    "Plan The Day's Tasks",
  ];

  // --- Validate & repair dates loaded from storage ---
  function sanitizeTaskDate(dateString) {
    const d = new Date(dateString);
    if (isNaN(d)) {
      // Autorepair corrupted date
      return new Date().toISOString().split("T")[0];
    }
    return dateString;
  }

  // --- Create today’s default tasks if not already created ---
  function createDefaultTasksForToday() {
    const today = new Date().toISOString().split("T")[0];
    const flag = localStorage.getItem("defaultsCreatedFor");

    if (flag === today) {
      return; // Already created
    }

    const taskList = getOrCreateTaskList(today);

    DEFAULT_TASKS.forEach((taskText) => {
      const timestamp = Date.now() + Math.floor(Math.random() * 1000);

      const li = createTaskListItem(taskText, today, true, timestamp);
      taskList.appendChild(li);
    });

    // Save the success flag safely
    try {
      localStorage.setItem("defaultsCreatedFor", today);
    } catch (e) {
      console.warn("Could not save default-task flag to storage:", e);
    }

    saveTasksToStorage();
  }

  // --- Automatically regenerate every midnight ---
  function scheduleMidnightCheck() {
    const now = new Date();
    const nextMidnight = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + 1,
      0,
      0,
      0,
      100
    );

    const msUntilMidnight = nextMidnight - now;

    setTimeout(() => {
      createDefaultTasksForToday();
      scheduleMidnightCheck(); // Re-arm for next midnight
    }, msUntilMidnight);
  }

  // --- Ensure corrupted tasks never break the grouping ---
  function repairLoadedTask(task) {
    if (!task.created) {
      // Recover missing timestamps
      task.created = Date.now();
    }

    if (!task.date || isNaN(new Date(task.date))) {
      // Repair invalid dates
      task.date = new Date().toISOString().split("T")[0];
    }

    return task;
  }

  // OPTIONAL: If you load tasks manually,
  // run repairLoadedTask() for each task before using them.
  // Example (if needed):
  //
  // tasks = tasks.map(t => repairLoadedTask(t));

  // -------------------------------------------------------------
  // INITIALIZATION — CALL THESE AFTER loadTasksFromStorage()
  // -------------------------------------------------------------

  // Create today's defaults if needed
  createDefaultTasksForToday();

  // Schedule tomorrow’s default creation
  scheduleMidnightCheck();

  function renderDate() {
    const currentDate = new Date();
    const formattedDate = currentDate.toISOString().split("T")[0];
    taskDateInput.value = formattedDate;
  }

  function addTask() {
    const input = document.getElementById("toDo");
    const taskDate = taskDateInput.value;
    if (input.value.trim() === "" || taskDate === "") {
      displayFlashMessage("Please enter a task", "red", 2000);
      input.focus();
      return;
    }

    const selectedDate = new Date(taskDate);
    const currentDate = new Date();
    selectedDate.setHours(0, 0, 0, 0);
    currentDate.setHours(0, 0, 0, 0);

    if (selectedDate < currentDate) {
      displayFlashMessage(
        "Oops! It seems like you've discovered the secret to time travel, but our services are strictly for the present and future. Best of luck with your journey to the past!",
        "inherit",
        7000
      );
      return;
    }

    clearBtn.style.display = "block";
    taskHeader.textContent = "";
    const taskText = input.value.trim();

    const timestamp = Date.now(); // Add this line
    const listItem = createTaskListItem(taskText, taskDate, true, timestamp);
    const taskList = getOrCreateTaskList(taskDate);
    taskList.appendChild(listItem);

    input.value = "";
    message.textContent = "Added!";
    setTimeout(() => (message.textContent = ""), 2000);

    renderDate();
    saveTasksToStorage();
  }

  function createTaskListItem(
    taskText,
    taskDate,
    withDate,
    timestamp = Date.now()
  ) {
    const listItem = document.createElement("li");
    listItem.dataset.created = timestamp;
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "taskCheckbox";

    listItem.innerHTML = `
      <span class="taskText">${taskText}</span>
      <button class="startTask">Start</button>
      <button class="editToDo"><i class="fas fa-pen-square"></i> Edit</button>
      <button class="deleteToDo"><i class="fas fa-trash-alt"></i> Delete</button>
    `;
    listItem.insertBefore(checkbox, listItem.firstChild);

    const startButton = listItem.querySelector(".startTask");
    const taskSpan = listItem.querySelector(".taskText");

    startButton.addEventListener("click", () => {
      if (startButton.textContent === "Start") {
        if (isRunning) {
          displayFlashMessage(
            "Your current task is still running",
            "red",
            2000
          );
          return;
        }
        startButton.textContent = "Stop";
        startTracking(taskSpan.textContent);
      } else {
        startButton.textContent = "Start";
        checkbox.checked = true;
        stopTracking(taskSpan.textContent);
        runTaskUpdate(true);
      }
    });

    listItem.querySelector(".deleteToDo").addEventListener("click", () => {
      const parent = listItem.parentElement;
      const isInCompleted = completedContainer.contains(listItem);

      listItem.remove();

      if (
        parent &&
        parent.querySelectorAll("li").length === 0 &&
        parent !== completedContainer
      ) {
        parent.remove();
      }

      saveTasksToStorage();

      if (
        isInCompleted &&
        completedContainer.querySelectorAll("li").length === 0 &&
        listsContainer.querySelectorAll("li").length === 0
      ) {
        resetToInitialState();
      }

      updateCompletedVisibility();
    });

    listItem.querySelector(".editToDo").addEventListener("click", () => {
      const editedText = prompt("Edit the task:", taskSpan.textContent);
      if (editedText !== null && editedText.trim() !== "") {
        taskSpan.textContent = editedText.trim();
        saveTasksToStorage();
      }
    });

    function runTaskUpdate(isStarted) {
      if (!isStarted) {
        let askUserForConfirmation;
        do {
          askUserForConfirmation = prompt(
            "Task not started yet! Are you sure you want to mark this task as completed? Y/N",
            "Yes"
          )?.toLowerCase();
        } while (!["yes", "y", "no", "n"].includes(askUserForConfirmation));

        if (["no", "n"].includes(askUserForConfirmation)) {
          displayFlashMessage("Task not moved to completed", "red", 2000);
          return;
        }

        displayFlashMessage("Task moved to completed", "#04aa12", 2000);
      }

      const taskList = withDate ? getOrCreateTaskList(taskDate) : null;

      if (checkbox.checked) {
        if (completedHeader) completedHeader.style.display = "block";
        taskSpan.style.textDecoration = "line-through";
        if (taskList?.contains(listItem)) taskList.removeChild(listItem);
        if (taskList && taskList.querySelectorAll("li").length === 0) {
          taskList.remove();
        }

        const startButton = listItem.querySelector(".startTask");
        if (startButton) {
          startButton.disabled = true;
          startButton.classList.add("disabled");
        }

        addToCompleted(listItem);
      } else {
        taskSpan.style.textDecoration = "none";
        removeFromCompleted(listItem);
        if (taskList && !taskList.contains(listItem)) {
          taskList.appendChild(listItem);
        }
        if (completedHeader && completedContainer.childElementCount === 0) {
          completedHeader.style.display = "none";
        }
      }

      saveTasksToStorage();
    }

    checkbox.addEventListener("change", () => runTaskUpdate(false));

    return listItem;
  }

  function clearList() {
    listsContainer.innerHTML = "";
    completedContainer.innerHTML = "";
    taskHeader.textContent = "Add to your tasklist";
    if (completedHeader) completedHeader.style.display = "none";
    clearBtn.style.display = "none";
    localStorage.removeItem("tasks");
    updateCompletedVisibility();
  }

  function resetToInitialState() {
    listsContainer.innerHTML = "";
    completedContainer.innerHTML = "";
    clearBtn.style.display = "none";
    if (completedHeader) completedHeader.style.display = "none";
    taskHeader.textContent = "Add to your tasklist";
    document.getElementById("notracking").style.display = "block";
    localStorage.removeItem("tasks");
    updateCompletedVisibility();
  }

  function getOrCreateTaskList(dateString) {
    const formattedDate = formatDate(dateString);
    const listId = `list-${formattedDate}`;
    let taskList = document.getElementById(listId);

    if (!taskList) {
      taskList = document.createElement("ul");
      taskList.id = listId;
      taskList.className = "taskList";

      const listHeading = document.createElement("h2");
      listHeading.textContent = formattedDate;
      taskList.appendChild(listHeading);
      listsContainer.appendChild(taskList);
    }

    return taskList;
  }

  function formatDate(dateString) {
    const options = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  }

  function addToCompleted(taskItem) {
    completedContainer.appendChild(taskItem);
    sortContainerByTimestamp(completedContainer);
    saveTasksToStorage();
    updateCompletedVisibility();
  }

  function sortContainerByTimestamp(container) {
    const tasks = Array.from(container.querySelectorAll("li"));
    tasks.sort((a, b) => {
      return (
        parseInt(b.dataset.created || "0") - parseInt(a.dataset.created || "0")
      );
    });
    tasks.forEach((task) => container.appendChild(task));
  }

  function removeFromCompleted(taskItem) {
    if (completedContainer.contains(taskItem)) {
      completedContainer.removeChild(taskItem);
      updateCompletedVisibility();
    }
  }

  function saveTasksToStorage() {
    const allTasks = listsContainer.querySelectorAll("li");
    const allCompletedTasks = completedContainer.querySelectorAll("li");
    const tasks = [];

    allTasks.forEach((task) => {
      const taskText = task.querySelector(".taskText")?.textContent || "";
      const taskDate =
        task.closest("ul")?.querySelector("h2")?.textContent || "";
      const startButton = task.querySelector(".startTask");
      const timestamp = task.dataset?.created
        ? parseInt(task.dataset.created)
        : Date.now(); // 🛡️ Defensive check

      tasks.push({
        text: taskText,
        date: taskDate,
        completed: false,
        startDisabled: startButton?.disabled || false,
        created: timestamp,
      });
    });

    allCompletedTasks.forEach((task) => {
      const taskText = task.querySelector(".taskText")?.textContent || "";
      const timestamp = task.dataset?.created
        ? parseInt(task.dataset.created)
        : Date.now(); // 🛡️ Defensive check

      tasks.push({
        text: taskText,
        completed: true,
        startDisabled: true,
        created: timestamp,
      });
    });

    localStorage.setItem("tasks", JSON.stringify(tasks));
  }

  function loadTasksFromStorage() {
    printDailyGoalHours();
    retrieveTrackedTime();
    checkLastVisitedDate(false);

    document.getElementById("username").textContent = wsUser + "'s";
    document.getElementById("userLocation").textContent =
      userWorkLocation.length > 3
        ? capitalizeFirstLetter(userWorkLocation)
        : "Work";

    const storedTasks = localStorage.getItem("tasks");
    let tasks = [];
    try {
      if (
        storedTasks &&
        storedTasks !== "undefined" &&
        storedTasks !== "null"
      ) {
        tasks = JSON.parse(storedTasks);
      }
    } catch (e) {
      console.error("Failed to parse tasks from localStorage:", e);
    }

    if (Array.isArray(tasks) && tasks.length > 0) {
      // ✅ Add timestamps to tasks that don’t have one
      tasks.forEach((task, index) => {
        if (!task.created) {
          // Spread out timestamps to preserve visual order
          task.created = Date.now() - (tasks.length - index) * 1000;
        }
      });

      // ✅ Sort tasks by most recently created first
      tasks.sort((a, b) => b.created - a.created);

      // ✅ Optional: Save updated timestamps back to storage
      localStorage.setItem("tasks", JSON.stringify(tasks));

      // ✅ Render tasks
      tasks.forEach((task) => {
        const listItem = createTaskListItem(
          task.text,
          task.date,
          false,
          task.created
        );
        const taskCheckbox = listItem.querySelector(".taskCheckbox");
        const taskTextSpan = listItem.querySelector(".taskText");
        const startButton = listItem.querySelector(".startTask");

        if (task.completed) {
          taskTextSpan.style.textDecoration = "line-through";
          taskCheckbox.checked = true;
          addToCompleted(listItem);
          if (completedHeader) completedHeader.style.display = "block";
        } else {
          const taskList = getOrCreateTaskList(task.date);
          taskList.appendChild(listItem);
        }

        if (task.startDisabled) {
          startButton.disabled = true;
          startButton.classList.add("disabled");
        }
      });

      clearBtn.style.display = "block";
      updateCompletedVisibility();
    } else {
      taskHeader.textContent = "Add tasks to your task list";
    }
  }

  function updateCompletedVisibility() {
    const completedTasks = completedContainer.querySelectorAll("li");
    completedTasks.forEach((task, index) => {
      task.style.display = index < completedVisibleCount ? "list-item" : "none";
    });

    if (completedTasks.length > 10) {
      completedToggleBtn.style.display = "block";
      completedToggleBtn.textContent =
        completedVisibleCount < completedTasks.length
          ? "Load more"
          : "Show less";
    } else {
      completedToggleBtn.style.display = "none";
    }
  }

  function showMotivation() {
    showLoader();
    setTimeout(() => {
      hideLoader();
      setTimeout(() => {
        closeMenu();
        document.getElementById("axiom").style.display = "block";
        displayFlashMessage(
          generateMotivationalMessages(wsUser),
          "#04aa12",
          10000
        );
      }, 200);
    }, 500);
  }

  function hideMotivation() {
    document.getElementById("axiom").style.display = "none";
  }

  document
    .querySelector("#motivation")
    .addEventListener("click", showMotivation);
  document
    .querySelector(".hide-axiom")
    .addEventListener("click", hideMotivation);
});
