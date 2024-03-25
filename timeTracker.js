let startTime;
let intervalId;
let restIntervalId;
let autoIntervalId;
let logged = false;
let isRunning = false;
const logField = document.getElementById("log");
const logList = document.getElementById("logList");
const restMessage = document.getElementById("restMessage");
const logging = document.getElementById("logging");
const stop = document.getElementById("stop");
const timeLog = JSON.parse(localStorage.getItem("timeLog")) || [];
let taskInput;
let restCounter = 30000 * 60;
let restInterval = 20000 * 60;
let ten = 10000 * 60;
let twenty = 30000 * 60;
const autoSaveData = [];
const AUTO_SAVE_TIMER = 30000;

function startTracking(taskText) {
  if (!isRunning) {
    isRunning = true;
  } else {
    alert("Your current task is still running");
    return;
  }

  document.querySelector('.workstation').scrollIntoView();
  taskInput = taskText;
  const taskName = taskInput;
  logging.style.visibility = "visible";
  if (!taskName) {
    alert("Please enter a task name.");
    return;
  }

  startTime = Date.now();
  intervalId = setInterval(updateTimer, 1000);
  restIntervalId = setInterval(startRestTimer, ten);
  restMessage.style.display = "block";
  restMessage.innerText = `Break time in 30 minutes`;
  stop.style.display = "block";
  addAutoSave();
  addBeforeUnloadWarning();
}

function addAutoSave() {
  // Set up an interval to periodically save the state
  autoIntervalId = setInterval(() => {
    if (isRunning) {
      const currentTime = Date.now();
      const elapsedMilliseconds = currentTime - startTime;
      const elapsedTime = elapsedMilliseconds / 1000; // in seconds
      const taskName = taskInput;

      // Push the data to the temporary array
      autoSaveData.push({ taskName, elapsedTime });

      // Save the most recent entry to localStorage
      localStorage.setItem(
        "lastAutoSave",
        JSON.stringify({ taskName, elapsedTime })
      );
      // Clear the temporary array for the next round of auto-saving
      autoSaveData.length = 0;
    }
  }, AUTO_SAVE_TIMER);
}

// Retrieve the most recent entry from localStorage
const lastAutoSave = JSON.parse(localStorage.getItem("lastAutoSave"));

if (lastAutoSave) {
  // Check if the entry already exists in timeLog
  const existingEntryIndex = timeLog.findIndex(
    (entry) => entry.taskName === lastAutoSave.taskName
  );

  if (existingEntryIndex === -1) {
    // If the entry doesn't exist, push it to timeLog
    timeLog.push(lastAutoSave);
    localStorage.setItem("timeLog", JSON.stringify(timeLog));
  }

  // Clear the localStorage entry for the next round
  localStorage.removeItem("lastAutoSave");
}

function stopTracking() {
  if (!startTime) {
    alert("No task is currently being tracked.");
    return;
  }

  document.querySelector('#logList').scrollIntoView();
  clearInterval(intervalId);
  clearInterval(restIntervalId);
  const endTime = Date.now();
  const elapsedTime = (endTime - startTime) / 1000; // in seconds
  const taskName = taskInput;

  // Save the task in localStorage
  timeLog.push({ taskName, elapsedTime });
  localStorage.setItem("timeLog", JSON.stringify(timeLog));

  startTime = null;
  displayTimeLog();
  logging.style.visibility = "hidden";
  stop.style.display = "none";
  restMessage.style.display = "none";
  isRunning = false;
  if (lastAutoSave) {
    localStorage.removeItem("lastAutoSave");
  }
  taskInput = "";
  removeBeforeUnloadWarning();
  clearInterval(autoIntervalId);
}

function updateTimer() {
  const currentTime = Date.now();
  const elapsedMilliseconds = currentTime - startTime;
  const hours = Math.floor(elapsedMilliseconds / 3600000);
  const minutes = Math.floor((elapsedMilliseconds % 3600000) / 60000);
  const seconds = ((elapsedMilliseconds % 3600000) % 60000) / 1000;
  let formattedTime;
  if (hours <= 1 && minutes <= 1) {
    formattedTime = `${hours} hour, ${minutes} minute, ${seconds.toFixed(
      0
    )} seconds`;
  } else if (minutes <= 1) {
    formattedTime = `${hours} hours, ${minutes} minute, ${seconds.toFixed(
      0
    )} seconds`;
  } else if (hours <= 1) {
    formattedTime = `${hours} hour, ${minutes} minutes, ${seconds.toFixed(
      0
    )} seconds`;
  } else {
    formattedTime = `${hours} hours, ${minutes} minutes, ${seconds.toFixed(
      0
    )} seconds`;
  }

  setTimeout(() => {
    logging.innerHTML = capitalizeFirstLetter(
      `Now tracking <span class="taskId">“${taskInput}”</span>: ${formattedTime}`
    );
  }, 1000);
}

function displayTimeLog() {
  const logTable = document.getElementById("logList");
  logged = true;

  // Clear existing rows
  logTable.innerHTML = "";

  if (!timeLog.length) {
    return;
  }

  timeLog.forEach((entry, index) => {
    const row = logTable.insertRow(index);
    const cell1 = row.insertCell(0);
    const cell2 = row.insertCell(1);

    cell1.innerHTML = capitalizeFirstLetter(entry.taskName);
    cell2.innerHTML = formatTime(entry.elapsedTime);
  });

  logField.style.display = "block";
}

displayTimeLog();

function formatTime(timeInSeconds) {
  if (timeInSeconds >= 3600) {
    const hours = Math.floor(timeInSeconds / 3600);
    const minutes = Math.floor((timeInSeconds % 3600) / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    if (hours <= 1 && minutes <= 1) {
      return `${hours} hour, ${minutes} minute, ${seconds} seconds`;
    } else if (minutes <= 1) {
      return `${hours} hours, ${minutes} minute, ${seconds} seconds`;
    } else if (hours <= 1) {
      return `${hours} hour, ${minutes} minutes, ${seconds} seconds`;
    } else {
      return `${hours} hours, ${minutes} minutes, ${seconds} seconds`;
    }
  } else if (timeInSeconds >= 60) {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    if (minutes <= 1) {
      return `${minutes} minute, ${seconds} seconds`;
    } else {
      return `${minutes} minutes, ${seconds} seconds`;
    }
  } else {
    return `${timeInSeconds} seconds`;
  }
}

function clearLogs() {
  if (!logged) {
    alert("No logs to clear");
    return;
  }
  logList.innerHTML = "";
  timeLog.length = 0;
  localStorage.removeItem("timeLog");
  if (lastAutoSave) {
    localStorage.removeItem("lastAutoSave");
  }
  logField.style.display = "none";
}

function startRestTimer() {
  restCounter -= ten;

  if (restCounter === 0) {
    restMessage.style.display = "block";
    restMessage.textContent = "Time to rest. Please take a 5 minutes break";

    setTimeout(() => {
      restMessage.textContent = "Resting time remaining: 2 minutes";
    }, 3000 * 60);

    setTimeout(() => {
      restMessage.textContent = "You are now refreshed.";
    }, 4000 * 60);

    setTimeout(() => {
      // Reset restCounter to the initial value
      restCounter = 30000 * 60;
      restMessage.innerText = `Break time in 30 minutes`;
    }, 5000 * 60);

    return;
  } else if (restCounter <= ten) {
    restMessage.innerText = `Break time is in ${restCounter / 60000} minutes`;
  } else if (restCounter <= twenty) {
    restMessage.innerText = `Break time is in ${restCounter / 60000} minutes`;
  }
}

function capitalizeFirstLetter(text) {
  // Split the string into words
  const words = text.split(" ");

  // Capitalize the first letter of each word
  const capitalizedWords = words.map((word) => {
    return word.charAt(0).toUpperCase() + word.slice(1);
  });

  // Join the capitalized words back together
  return capitalizedWords.join(" ");
}

function addBeforeUnloadWarning() {
  // Add the beforeunload event listener
  window.addEventListener("beforeunload", beforeUnloadHandler);
}

function removeBeforeUnloadWarning() {
  // Remove the beforeunload event listener
  window.removeEventListener("beforeunload", beforeUnloadHandler);
}

function beforeUnloadHandler(e) {
  e.preventDefault();
  e.returnValue =
    "You have unsaved changes. Are you sure you want to leave this page?";
}
