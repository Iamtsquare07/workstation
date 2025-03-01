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

  // Load tasks from local storage when the page loads
  loadTasksFromStorage();
  if (listsContainer.textContent == "") {
    clearList();
  }
  submitButton.addEventListener("click", addTask);
  document.getElementById("toDo").addEventListener("keypress", function (e) {
    if (e.key === "Enter") addTask();
  });

  // Set the value of the date input to the current date (formatted as "YYYY-MM-DD")
  function renderDate() {
    const currentDate = new Date();
    const formattedDate = currentDate.toLocaleDateString("en-CA").split("T")[0];
    taskDateInput.value = formattedDate;
  }

  renderDate();

  function addTask() {
    const input = document.getElementById("toDo");
    const taskDate = taskDateInput.value;
    if (input.value.length === 0 || taskDate === "") {
      displayFlashMessage("Please enter a task", "red", 2000);
      input.focus();
      return;
    }
    // Parse the selected date and the current date
    const selectedDate = new Date(taskDate);
    const currentDate = new Date();
    selectedDate.setHours(0, 0, 0, 0); // Set time part to midnight
    currentDate.setHours(0, 0, 0, 0);

    // Compare the selected date with the current date
    if (selectedDate < currentDate && selectedDate !== currentDate) {
      displayFlashMessage(
        "Oops! It seems like you've discovered the secret to time travel, but our services are strictly for the present and future. Best of luck with your journey to the past! 🕰️🚀😍",
        "inherit",
        7000
      );
      return;
    }

    clearBtn.style.display = "block";
    taskHeader.textContent = "";
    const taskText = input.value.trim();

    const listItem = createTaskListItem(taskText, taskDate, true);
    const taskList = getOrCreateTaskList(taskDate);
    taskList.appendChild(listItem);

    input.value = "";
    taskDateInput.value = "";
    message.textContent = "Added!";
    setTimeout(() => {
      message.textContent = "";
    }, 2000);

    renderDate();
    saveTasksToStorage();
  }

  function createTaskListItem(taskText, taskDate, withDate) {
    const listItem = document.createElement("li");
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

    listItem.querySelector(".startTask").addEventListener("click", () => {
      const taskSpan = listItem.querySelector(".taskText");
      const startButton = listItem.querySelector(".startTask");
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
        saveTasksToStorage();
      }
    });

    listItem.querySelector(".deleteToDo").addEventListener("click", () => {
      listItem.remove();
      saveTasksToStorage();
      location.reload();
    });

    listItem.querySelector(".editToDo").addEventListener("click", () => {
      const taskSpan = listItem.querySelector(".taskText");
      const editedText = prompt("Edit the task:", taskSpan.textContent);
      if (editedText !== null) {
        taskSpan.textContent = editedText;
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
          ).toLocaleLowerCase();
        } while (
          !(
            askUserForConfirmation === "yes" ||
            askUserForConfirmation === "y" ||
            askUserForConfirmation === "no" ||
            askUserForConfirmation === "n"
          )
        );

        if (
          askUserForConfirmation === "yes" ||
          askUserForConfirmation === "y"
        ) {
          displayFlashMessage("Task moved to completed", "#04aa12", 2000);
        } else {
          displayFlashMessage("Task not moved to completed", "red", 2000);
          return;
        }
      }

      let taskList;
      if (withDate) {
        taskList = getOrCreateTaskList(taskDate);
      }

      if (checkbox.checked) {
        listItem.querySelector(".taskText").style.textDecoration =
          "line-through";
        if (taskList) {
          taskList.removeChild(listItem);
        }
        addToCompleted(listItem);
        completedHeader.style.display = "block";
      } else {
        listItem.querySelector(".taskText").style.textDecoration = "none";
        removeFromCompleted(listItem);
        if (taskList) {
          taskList.appendChild(listItem);
        }
        if (completedContainer.childElementCount === 0) {
          completedHeader.style.display = "none";
        }
      }
      saveTasksToStorage();
    }

    checkbox.addEventListener("change", () => {
      runTaskUpdate();
      saveTasksToStorage();
    });

    return listItem;
  }

  function clearList() {
    listsContainer.innerHTML = "";
    completedContainer.innerHTML = "";
    taskHeader.textContent = "Add to your tasklist";
    completedHeader.style.display = "none";
    clearBtn.style.display = "none";
    localStorage.removeItem("tasks");
  }

  clearBtn.addEventListener("click", clearList);

  // Get or create a task list based on the date
  function getOrCreateTaskList(dateString) {
    const formattedDate = formatDate(dateString);
    const listId = `list-${formattedDate}`;

    // Check if a list with this date already exists
    let taskList = document.getElementById(listId);

    if (!taskList) {
      // Create a new list if it doesn't exist
      taskList = document.createElement("ul");
      taskList.id = listId;
      taskList.className = "taskList";

      // Create a heading for the list with the selected date
      const listHeading = document.createElement("h2");
      listHeading.textContent = formattedDate;
      taskList.appendChild(listHeading);

      // Append the list to the lists container
      listsContainer.appendChild(taskList);
    }

    return taskList;
  }

  // Function to format the date
  function formatDate(dateString) {
    const options = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, options);
  }

  // Function to add completed task to the completed list
  function addToCompleted(taskItem) {
    completedContainer.appendChild(taskItem);
    saveTasksToStorage();
  }

  // Function to remove completed task from the completed list
  function removeFromCompleted(taskItem) {
    completedContainer.removeChild(taskItem);
  }

  // Function to save tasks to local storage

  function saveTasksToStorage() {
    const allTasks = listsContainer.querySelectorAll("li");
    const allCompletedTasks = completedContainer.querySelectorAll("li");
    const tasks = [];

    allTasks.forEach((task) => {
      const taskText = task.querySelector(".taskText").textContent;
      const taskDate = task.closest("ul").querySelector("h2").textContent;
      const isCompleted = task.closest("#completedList") !== null;

      tasks.push({
        text: taskText,
        date: taskDate,
        completed: isCompleted,
      });
    });

    allCompletedTasks.forEach((task) => {
      const taskText = task.querySelector(".taskText").textContent;
      const isCompleted = task.closest("#completedList") !== null;

      tasks.push({
        text: taskText,
        completed: isCompleted,
      });
    });

    localStorage.setItem("tasks", JSON.stringify(tasks));
  }

  // Function to load tasks from local storage
  function loadTasksFromStorage() {
    printDailyGoalHours();
    retrieveTrackedTime();
    checkLastVisitedDate(false);

    document.getElementById("username").textContent = wsUser + "'s";
    document.getElementById("userLocation").textContent = `${
      userWorkLocation.length > 3
        ? capitalizeFirstLetter(userWorkLocation)
        : "Work"
    }`;
    const storedTasks = localStorage.getItem("tasks");
    if (storedTasks) {
      const tasks = JSON.parse(storedTasks);
      tasks.forEach((task) => {
        const listItem = createTaskListItem(task.text, task.date, false);
        if (task.completed) {
          listItem.querySelector(".taskText").style.textDecoration =
            "line-through";
          listItem.querySelector(".taskCheckbox").checked = true;
          addToCompleted(listItem);
          completedHeader.style.display = "block";
        } else {
          const taskList = getOrCreateTaskList(task.date);
          taskList.appendChild(listItem);
        }
      });
      clearBtn.style.display = "block";
    } else {
      taskHeader.textContent = "Add tasks to your task list";
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
