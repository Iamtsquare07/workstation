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
const timeLog = JSON.parse(localStorage.getItem("timeLog")) || [];
let taskInput;
let restCounter = 30000 * 60;
let restInterval = 20000 * 60;
let ten = 10000 * 60;
let twenty = 30000 * 60;
const autoSaveData = [];
const AUTO_SAVE_TIMER = 30000;
let goalHour = localStorage.getItem("goalHour") || 0;

function editGoal() {
  do {
    goalHour = prompt("How many hours would you like to work today?", "");
  } while (!Number(goalHour));

  localStorage.setItem("goalHour", goalHour);
  printDailyGoalHours();
}

document.querySelector(".edit-goal").addEventListener("click", editGoal);

function printDailyGoalHours() {
  let dailyGoalHours;

  goalHour == 1 ? (dailyGoalHours = "hour") : (dailyGoalHours = `hours`);

  document.getElementById("daily-goal").textContent = goalHour;
  document.getElementById("daily-goal-hours").textContent = dailyGoalHours;
}

function startTracking(taskText) {
  if (!isRunning) {
    isRunning = true;
  } else {
    alert("Your current task is still running");
    return;
  }

  document.querySelector(".workstation").scrollIntoView();
  taskInput = taskText;
  const taskName = taskInput;
  if (!taskName) {
    alert("Please enter a task name.");
    return;
  }

  startTime = Date.now();
  intervalId = setInterval(updateTimer, 1000);
  restIntervalId = setInterval(startRestTimer, ten);
  restMessage.style.display = "block";
  document.getElementById("notracking").style.display = "none";
  logging.style.visibility = "visible";
  restMessage.innerText = `Break time in 30 minutes`;
  addAutoSave();
  addBeforeUnloadWarning();
  trackTime()
}

let goalStartTime = 0;
let totalTime = 0;

function trackTime() {
  const currentTime = Date.now();

  // If it's a new day, reset start time
  const today = new Date().toISOString().slice(0, 10);
  const lastTrackedDate = JSON.parse(localStorage.getItem("lastTrackedDate"));
  if (!lastTrackedDate || lastTrackedDate !== today) {
    goalStartTime = currentTime;
    localStorage.setItem("lastTrackedDate", JSON.stringify(today));
  }

  // Calculate elapsed time since last call
  const elapsedTime = currentTime - goalStartTime;
  totalTime += elapsedTime; // Add elapsed time to total tracked time

  // Save total time to localStorage
  localStorage.setItem("totalTrackedTime", JSON.stringify(totalTime));

  console.log("Time tracked:", elapsedTime, "milliseconds");
}

function stopTimeTracking() {
  const currentTime = Date.now();

  // Calculate elapsed time since tracking started
  const elapsedTime = currentTime - goalStartTime;
  totalTime += elapsedTime; // Add elapsed time to total tracked time

  // Reset startTime for next tracking session
  goalStartTime = currentTime;

  // Save total time to localStorage
  localStorage.setItem("totalTrackedTime", JSON.stringify(totalTime));

  console.log("Time stopped:", elapsedTime, "milliseconds");
}

function retrieveTrackedTime() {
  const today = new Date().toISOString().slice(0, 10);
  const lastTrackedDate = JSON.parse(localStorage.getItem("lastTrackedDate"));
  const trackedTime = JSON.parse(localStorage.getItem("totalTrackedTime")) || 0;
  let streak = parseInt(localStorage.getItem("streak")) || 0;

  // Check if there was tracked time on the previous two days
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayKey = yesterday.toISOString().slice(0, 10);
  const dayBeforeYesterday = new Date();
  dayBeforeYesterday.setDate(dayBeforeYesterday.getDate() - 2);
  const dayBeforeYesterdayKey = dayBeforeYesterday.toISOString().slice(0, 10);

  const yesterdayTrackedTime = JSON.parse(localStorage.getItem(yesterdayKey)) || [];
  const dayBeforeYesterdayTrackedTime = JSON.parse(localStorage.getItem(dayBeforeYesterdayKey)) || [];

  if (lastTrackedDate === today) {
    if (yesterdayTrackedTime.length > 0 && dayBeforeYesterdayTrackedTime.length > 0) {
      streak++;
    } else {
      streak = 0;
    }
  } else {
    if (yesterdayTrackedTime.length > 0 && dayBeforeYesterdayTrackedTime.length > 0) {
      streak++;
    } else {
      streak = 0;
    }
  }

  console.log("Current streak: ", streak);
  document.getElementById("streak-days").textContent = streak;

  // Save streak to local storage
  localStorage.setItem("streak", streak);

  // Calculate total tracked time for yesterday
  let totalYesterdayMilliseconds = 0;
  yesterdayTrackedTime.forEach(startTime => {
    totalYesterdayMilliseconds += Date.now() - startTime;
  });
  const totalYesterdayHours = totalYesterdayMilliseconds / (1000 * 60 * 60);

  console.log("Total time tracked for yesterday: ", totalYesterdayHours.toFixed(2), "hours");
  document.getElementById("yesterday-tracked-time").textContent = totalYesterdayHours.toFixed(0);

  let totalTrackedTime;
  if (trackedTime < 3600000) { // Less than an hour
    totalTrackedTime = trackedTime / (1000 * 60); // Convert milliseconds to minutes
    document.getElementById("completed-goal-time").textContent = new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(totalTrackedTime) + " minutes";
    console.log("Total time tracked for today: ", totalTrackedTime.toFixed(0), "minutes");
  } else { // Equal to or more than an hour
    totalTrackedTime = trackedTime / (1000 * 60 * 60); // Convert milliseconds to hours
    document.getElementById("completed-goal-time").textContent = new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(totalTrackedTime) + " hours";
    console.log("Total time tracked for today: ", totalTrackedTime.toFixed(2), "hours");
  }
}


// localStorage.removeItem("totalTrackedTime")
retrieveTrackedTime()

function getFormattedTime(milliseconds) {
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    return hours === 1 ? "hour" : `hours`;
  } else if (minutes > 0) {
    return minutes === 1 ? "minute" : `minutes`;
  }
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

  document.querySelector("#logList").scrollIntoView();
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
  document.getElementById("notracking").style.display = "block";
  logging.style.visibility = "hidden";
  restMessage.style.display = "none";
  isRunning = false;
  if (lastAutoSave) {
    localStorage.removeItem("lastAutoSave");
  }
  taskInput = "";
  removeBeforeUnloadWarning();
  clearInterval(autoIntervalId);
  stopTimeTracking()
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
      `Now tracking <span class="taskId">“${taskInput}”</span>:<br /> ${formattedTime}`
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
