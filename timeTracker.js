import { saveDataToDB, setData, autoSave } from "./saveData.js";

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
let restCounter = 30000 * 60;
let restInterval = 20000 * 60;
let ten = 10000 * 60;
let twenty = 30000 * 60;
const autoSaveData = [];
const AUTO_SAVE_TIMER = 10000;
let goalHour = localStorage.getItem("goalHour") || 0;
let wsUser = localStorage.getItem("wsUser") || "";
let userWorkLocation = localStorage.getItem("userWorkLocation") || "";
let firstInitialization = localStorage.getItem("firstInitialization") || false;
let goalReached = false;
let alarmTimeoutId;

document.querySelector(".back-to-top").addEventListener("click", () => {
  document.getElementById("top").scrollIntoView();
});

//  Checking the document for an intersection
let observer = new IntersectionObserver((entries, observer) => {
  entries.forEach((entry) => {
    const badge = document.querySelector(".back-to-top");
    if (entry.isIntersecting) {
      badge.classList.add("fadein");
    } else {
      badge.classList.remove("fadein");
    }
  });
});

observer.observe(document.querySelector("#top"));

if (wsUser.length < 1) {
  setTimeout(() => {
    do {
      wsUser = prompt("What is your name, beloved?", "");
    } while (wsUser === "" || wsUser === " " || wsUser < 3);
    localStorage.setItem("wsUser", wsUser);
  }, 5000);
}

if (
  userWorkLocation.toLowerCase() !== "home" &&
  userWorkLocation.toLowerCase() !== "work"
) {
  setTimeout(() => {
    do {
      userWorkLocation = prompt(
        `Where are you working today ${wsUser}? Enter Home or Work`,
        "Work"
      );
    } while (
      userWorkLocation.toLowerCase() !== "home" &&
      userWorkLocation.toLowerCase() !== "work"
    );
    localStorage.setItem("userWorkLocation", userWorkLocation);
    if (userWorkLocation.toLowerCase() === "home") {
      displayFlashMessage(
        "I see you chilling at home! Your app is now renamed to Homestation",
        "#04aa12",
        3000
      );
    }

    document.getElementById("userLocation").textContent = `${
      userWorkLocation.length > 3
        ? capitalizeFirstLetter(userWorkLocation)
        : "Work"
    }`;
  }, 10000);
}

function isNewDay() {
  let currentDate = new Date();
  let lastVisitDate = localStorage.getItem("lastVisitDate");

  if (!lastVisitDate) {
    // If last visit date is not set, it's a new day
    localStorage.setItem("lastVisitDate", currentDate.toDateString());
    return true;
  }

  lastVisitDate = new Date(lastVisitDate);

  // Check if the last visit date is before today
  if (lastVisitDate.toDateString() !== currentDate.toDateString()) {
    // If it's a new day, update the last visit date and return true
    localStorage.setItem("lastVisitDate", currentDate.toDateString());
    return true;
  }

  // If it's not a new day, return false
  return false;
}

// Function to generate and store 100 motivational messages for the user
function generateMotivationalMessages(userName) {
  let motivationalMessages = [];
  // Add motivational messages related to getting work done
  motivationalMessages.push(`${userName}, today's a new day, make it count!`);
  motivationalMessages.push(
    `${userName}, small progress is still progress. Keep going!`
  );
  motivationalMessages.push(
    `${userName}, every step forward brings you closer to success.`
  );
  motivationalMessages.push(
    `${userName}, success is the sum of small efforts repeated daily.`
  );
  motivationalMessages.push(
    `${userName}, your dedication today shapes your tomorrow.`
  );
  motivationalMessages.push(
    `${userName}, one task at a time, you're making progress!`
  );
  motivationalMessages.push(
    `${userName}, believe in yourself, you can achieve anything you set your mind to.`
  );
  motivationalMessages.push(
    `${userName}, consistency is key to achieving your goals.`
  );
  motivationalMessages.push(
    `${userName}, stay focused, great things take time to accomplish.`
  );
  motivationalMessages.push(
    `${userName}, embrace the challenges, they make you stronger.`
  );
  motivationalMessages.push(
    `${userName}, your hard work today will pay off tomorrow.`
  );
  motivationalMessages.push(
    `${userName}, don't wait for perfect conditions, start where you are.`
  );
  motivationalMessages.push(
    `${userName}, success is not final, failure is not fatal, keep going!`
  );
  motivationalMessages.push(
    `${userName}, every accomplishment starts with the decision to try.`
  );
  motivationalMessages.push(
    `${userName}, success is the result of your daily habits.`
  );
  motivationalMessages.push(
    `${userName}, be proud of how far you've come already.`
  );
  motivationalMessages.push(`${userName}, focus on progress, not perfection.`);
  motivationalMessages.push(
    `${userName}, the only way to do great work is to start.`
  );
  motivationalMessages.push(
    `${userName}, you are capable of more than you know.`
  );
  motivationalMessages.push(
    `${userName}, don't stop when you're tired, stop when you're done.`
  );
  motivationalMessages.push(
    `${userName}, success is not just about the destination but the journey.`
  );
  motivationalMessages.push(
    `${userName}, your actions today will shape your future.`
  );
  motivationalMessages.push(
    `${userName}, each day is a new opportunity to improve yourself.`
  );
  motivationalMessages.push(
    `${userName}, every obstacle is a stepping stone to your success.`
  );
  motivationalMessages.push(
    `${userName}, make today so awesome that yesterday gets jealous.`
  );
  motivationalMessages.push(
    `${userName}, the harder you work, the luckier you get.`
  );
  motivationalMessages.push(
    `${userName}, success is not for the chosen few, but for the few who choose.`
  );
  motivationalMessages.push(
    `${userName}, start where you are, use what you have, do what you can.`
  );
  motivationalMessages.push(
    `${userName}, don't wait for inspiration, be the inspiration.`
  );
  motivationalMessages.push(
    `${userName}, let your dreams be bigger than your fears and your actions louder than your words.`
  );
  motivationalMessages.push(
    `${userName}, your future self will thank you for the efforts you put in today.`
  );
  motivationalMessages.push(
    `${userName}, the journey of a thousand miles begins with a single step.`
  );
  motivationalMessages.push(
    `${userName}, believe you can and you're halfway there.`
  );
  motivationalMessages.push(
    `${userName}, the only limit to your success is your own imagination.`
  );
  motivationalMessages.push(
    `${userName}, every accomplishment starts with the decision to try.`
  );
  motivationalMessages.push(`${userName}, you are stronger than you think.`);
  motivationalMessages.push(
    `${userName}, it's not about being the best, it's about being better than you were yesterday.`
  );
  motivationalMessages.push(
    `${userName}, be the change you wish to see in the world.`
  );
  motivationalMessages.push(
    `${userName}, success is not the key to happiness, happiness is the key to success.`
  );
  motivationalMessages.push(
    `${userName}, the only person you should try to be better than is the person you were yesterday.`
  );
  motivationalMessages.push(
    `${userName}, the secret of getting ahead is getting started.`
  );
  motivationalMessages.push(`${userName}, don't stop until you're proud.`);
  motivationalMessages.push(
    `${userName}, success is not measured by what you accomplish, but by the obstacles you overcome.`
  );
  motivationalMessages.push(
    `${userName}, every day is a chance to get better.`
  );
  motivationalMessages.push(
    `${userName}, the difference between who you are and who you want to be is what you do.`
  );
  motivationalMessages.push(
    `${userName}, success comes from having dreams that are bigger than your fears.`
  );
  motivationalMessages.push(
    `${userName}, don't let yesterday take up too much of today.`
  );
  motivationalMessages.push(
    `${userName}, the only limit to our realization of tomorrow will be our doubts of today.`
  );
  motivationalMessages.push(
    `${userName}, don't watch the clock, do what it does: keep going.`
  );
  motivationalMessages.push(
    `${userName}, be yourself, everyone else is already taken.`
  );
  motivationalMessages.push(
    `${userName}, life is 10% what happens to you and 90% how you react to it.`
  );
  motivationalMessages.push(
    `${userName}, the best way to predict the future is to create it.`
  );
  motivationalMessages.push(
    `${userName}, the only way to do great work is to love what you do.`
  );
  motivationalMessages.push(
    `${userName}, the only place where success comes before work is in the dictionary.`
  );
  motivationalMessages.push(`${userName}, don't wish for it, work for it.`);
  motivationalMessages.push(
    `${userName}, a year from now you may wish you had started today.`
  );
  motivationalMessages.push(`${userName}, be the reason someone smiles today.`);
  motivationalMessages.push(
    `${userName}, today is your opportunity to build the tomorrow you want.`
  );
  motivationalMessages.push(
    `${userName}, push yourself, because no one else is going to do it for you.`
  );
  motivationalMessages.push(
    `${userName}, the difference between ordinary and extraordinary is that little extra.`
  );
  motivationalMessages.push(
    `${userName}, every accomplishment starts with the decision to try.`
  );
  motivationalMessages.push(
    `${userName}, your attitude determines your direction.`
  );
  motivationalMessages.push(
    `${userName}, the only way to achieve the impossible is to believe it is possible.`
  );
  motivationalMessages.push(
    `${userName}, the expert in anything was once a beginner.`
  );
  motivationalMessages.push(
    `${userName}, success is not just about talent, it's about effort.`
  );
  motivationalMessages.push(
    `${userName}, your future is created by what you do today, not tomorrow.`
  );
  motivationalMessages.push(`${userName}, every moment is a fresh beginning.`);
  motivationalMessages.push(
    `${userName}, the only limit to our realization of tomorrow will be our doubts of today.`
  );
  motivationalMessages.push(
    `${userName}, the only way to achieve the impossible is to believe it is possible.`
  );
  motivationalMessages.push(
    `${userName}, success is not just about talent, it's about effort.`
  );
  motivationalMessages.push(
    `${userName}, your future is created by what you do today, not tomorrow.`
  );
  motivationalMessages.push(`${userName}, every moment is a fresh beginning.`);
  motivationalMessages.push(
    `${userName}, success is not just about talent, it's about effort.`
  );
  motivationalMessages.push(
    `${userName}, your future is created by what you do today, not tomorrow.`
  );
  motivationalMessages.push(`${userName}, every moment is a fresh beginning.`);
  motivationalMessages.push(
    `${userName}, the only limit to our realization of tomorrow will be our doubts of today.`
  );
  motivationalMessages.push(
    `${userName}, the only way to achieve the impossible is to believe it is possible.`
  );
  motivationalMessages.push(
    `${userName}, success is not just about talent, it's about effort.`
  );
  motivationalMessages.push(
    `${userName}, your future is created by what you do today, not tomorrow.`
  );
  motivationalMessages.push(`${userName}, every moment is a fresh beginning.`);
  motivationalMessages.push(
    `${userName}, the only limit to our realization of tomorrow will be our doubts of today.`
  );
  motivationalMessages.push(
    `${userName}, the only way to achieve the impossible is to believe it is possible.`
  );
  motivationalMessages.push(
    `${userName}, success is not just about talent, it's about effort.`
  );
  motivationalMessages.push(
    `${userName}, your future is created by what you do today, not tomorrow.`
  );
  motivationalMessages.push(`${userName}, every moment is a fresh beginning.`);

  // Shuffle the motivational messages array
  motivationalMessages.sort(() => Math.random() - 0.5);

  // Store the motivational messages in localStorage
  localStorage.setItem(
    "motivationalMessages",
    JSON.stringify(motivationalMessages)
  );
  return motivationalMessages[0];
}

setTimeout(() => {
  if (isNewDay() && wsUser.length > 2) {
    if (wsUser.toLowerCase() === "victor") {
      displayFlashMessage(
        `Hello inventor ${generateMotivationalMessages(wsUser)}`,
        "inherit",
        7000
      );
    } else if (wsUser.toLowerCase() === "lilian") {
      displayFlashMessage(
        `Hello my ${generateMotivationalMessages(wsUser)}`,
        "inherit",
        7000
      );
    } else {
      displayFlashMessage(
        `${generateMotivationalMessages(wsUser)}`,
        "inherit",
        5000
      );
    }
  }
}, 12000);

function playAlarm(id) {
  const alarmSound = document.getElementById(`alarmSound${id}`);
  alarmSound.play();
}

function stopAlarm(id) {
  document.getElementById(`alarmSound${id}`).pause();
  document.getElementById(`alarmSound${id}`).currentTime = 0;
}

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

let wakeLock = null;

async function requestWakeLock() {
  try {
    wakeLock = await navigator.wakeLock.request("screen");
    console.log("Wake Lock is active");
  } catch (err) {
    console.error(`${err.name}, ${err.message}`);
  }
}

// To release the wake lock
async function releaseWakeLock() {
  if (wakeLock !== null) {
    await wakeLock.release();
    wakeLock = null;
    console.log("Wake Lock is released");
  }
}

window.addEventListener("unload", releaseWakeLock);

function startTracking(taskText) {
  if (!isRunning) {
    isRunning = true;
  } else {
    displayFlashMessage("Your current task is still running", "red", 2000);
    return;
  }

  document.getElementById("notracking").style.display = "none";
  document.querySelector(".workstation").scrollIntoView();
  if (!taskText) {
    displayFlashMessage("Please enter a task name.", "inherit", 2000);
    return;
  }

  startTime = Date.now();
  intervalId = setInterval(() => {
    updateTimer(taskText);
  }, 1000);
  restIntervalId = setInterval(startRestTimer, ten);
  logging.style.visibility = "visible";
  restMessage.innerText = `Break time in 30 minutes`;
  addAutoSave(taskText);
  addBeforeUnloadWarning();
  trackTime();
  restMessage.style.display = "block";
  requestWakeLock();
}

function stopTracking(taskText) {
  if (!startTime) {
    displayFlashMessage("No task is currently being tracked.", "inherit", 2000);
    return;
  }

  clearInterval(intervalId);
  clearInterval(restIntervalId);
  const endTime = Date.now();
  const elapsedTime = (endTime - startTime) / 1000;
  let taskName = taskText;

  // Save the task in localStorage
  timeLog.push({ taskName, elapsedTime });
  localStorage.setItem("timeLog", JSON.stringify(timeLog));

  startTime = null;
  displayTimeLog();
  document.getElementById("notracking").style.display = "block";
  logging.style.visibility = "hidden";
  restMessage.style.display = "none";
  isRunning = false;
  const lastAutoSave = JSON.parse(localStorage.getItem("lastAutoSave"));
  if (lastAutoSave) {
    localStorage.removeItem("lastAutoSave");
  }
  logging.innerHTML = "";
  removeBeforeUnloadWarning();
  clearInterval(autoIntervalId);
  stopTimeTracking();
  restCounter = 30000 * 60;
  clearTimeout(alarmTimeoutId);
  releaseWakeLock();

  if (autoSave) {
    saveDataToDB("Your tasks have been saved successfully");
  }
}

let hydrationTimeoutId;
let hydrationStartTime;

function setupHydrationReminder() {
  // Initialize or update the start time
  if (!hydrationStartTime) {
    hydrationStartTime = Date.now();
  }

  // Function to calculate the time difference in hours
  function getElapsedHours(startTime) {
    const now = Date.now();
    return Math.floor((now - startTime) / (1000 * 60 * 60));
  }

  // Function to display the reminder
  function remindToDrinkWater() {
    playAlarm("3");
    const elapsedHours = getElapsedHours(hydrationStartTime);

    // Schedule the next reminder for the start of the next 2-hour period
    const nextReminderInMs =
      1000 * 60 * 60 * 2 * (Math.floor(elapsedHours / 2) + 1) -
      (Date.now() - hydrationStartTime);
    hydrationTimeoutId = setTimeout(remindToDrinkWater, nextReminderInMs);
    displayFlashMessage(
      "Woohoo! It's time to drink some water.",
      "#04aa12",
      5000
    );
  }

  // Cancel any existing timeout
  if (hydrationTimeoutId) {
    clearTimeout(hydrationTimeoutId);
  }

  // Schedule the first reminder for the start of the next 2-hour period
  const elapsedHours = getElapsedHours(hydrationStartTime);
  const firstReminderInMs =
    1000 * 60 * 60 * 2 * (Math.floor(elapsedHours / 2) + 1) -
    (Date.now() - hydrationStartTime);
  hydrationTimeoutId = setTimeout(remindToDrinkWater, firstReminderInMs);
}

if (!firstInitialization) {
  setupHydrationReminder();
  localStorage.setItem("firstInitialization", true);
}
// localStorage.removeItem('firstInitialization')

let goalStartTime = 0;
let totalTime = JSON.parse(localStorage.getItem("totalTrackedTime")) || 0;
let yesterdayTotalTime =
  JSON.parse(localStorage.getItem("yesterdayTotalTrackedTime")) || 0;

// const testDateToday = "2024-07-5";
// const testDateYesterday = "2024-05-23";
const dateToday = new Date().toLocaleDateString("en-CA");

function checkLastVisitedDate(incrementDays) {
  const today = dateToday;
  const lastTrackedDate = JSON.parse(localStorage.getItem("lastTrackedDate"));
  if (!lastTrackedDate || lastTrackedDate !== today) {
    // If it's a new day, update yesterdayTotalTime and reset it
    yesterdayTotalTime = totalTime;
    localStorage.setItem(
      "yesterdayTotalTrackedTime",
      JSON.stringify(yesterdayTotalTime)
    );

    if (incrementDays) {
      localStorage.setItem("lastTrackedDate", JSON.stringify(today));
      totalTime = 0;
    }
    localStorage.setItem("totalTrackedTime", JSON.stringify(totalTime));
    goalReached = false;
    checkYesterdayStreak(lastTrackedDate, incrementDays);
    setupHydrationReminder();
    document.getElementById("axiom").style.display = "block";
  }
}

function trackTime() {
  const currentTime = Date.now();

  checkLastVisitedDate(true);
  goalStartTime = currentTime;
}

function checkYesterdayStreak(lastTrackedDate, incrementDays) {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayDateString = yesterday.toLocaleDateString("en-CA");

  if (lastTrackedDate === yesterdayDateString) {
    // Increment streak only if last tracked date was yesterday
    let streak = parseInt(localStorage.getItem("streak")) || 0;
    if (incrementDays) {
      streak++;
      localStorage.setItem("streak", streak);
      retrieveTrackedTime();
    }

    document.getElementById("completed-goal-time").textContent = "0 minute";
    const yesterdayTrackedTime =
      JSON.parse(localStorage.getItem("yesterdayTotalTrackedTime")) || 0;
    displayYesterdayTime(yesterdayTrackedTime);
  } else {
    // Reset streak to 0 if last tracked date was not yesterday
    localStorage.setItem("streak", 0);
    localStorage.setItem("yesterdayTotalTrackedTime", 0);
    retrieveTrackedTime();
    document.getElementById("completed-goal-time").textContent = "0 minute";
  }
}

function stopTimeTracking() {
  const currentTime = Date.now();
  const elapsedTime = currentTime - goalStartTime;
  goalStartTime = currentTime;

  totalTime += elapsedTime;

  localStorage.setItem("totalTrackedTime", JSON.stringify(totalTime));

  retrieveTrackedTime();
  const trackedTime = totalTime / (1000 * 60 * 60);

  if (trackedTime >= goalHour) {
    if (!goalReached) {
      displayFlashMessage(
        `Congratulations ${wsUser}, you have smashed your goal for today. ${trackedTime.toFixed(
          2
        )} hours of serious work. WOW!`,
        "#04aa12",
        7000
      );
      goalReached = true;
    }
  }
}

function retrieveTrackedTime() {
  const trackedTime = JSON.parse(localStorage.getItem("totalTrackedTime")) || 0;
  const yesterdayTrackedTime =
    JSON.parse(localStorage.getItem("yesterdayTotalTrackedTime")) || 0;
  let streak = parseInt(localStorage.getItem("streak")) || 0;

  document.getElementById("streak-days").textContent = streak;

  streak == 1
    ? (document.getElementById("streak").textContent = "day")
    : (document.getElementById("streak").textContent = "days");

  // Save streak to local storage
  localStorage.setItem("streak", streak);
  displayTotalTime(trackedTime);
  displayYesterdayTime(yesterdayTrackedTime);
}

function displayTotalTime(trackedTime) {
  let totalTrackedTime;
  if (trackedTime < 3600000) {
    totalTrackedTime = trackedTime / (1000 * 60);
    if (totalTrackedTime < 2) {
      document.getElementById("completed-goal-time").textContent =
        totalTrackedTime.toFixed(0) + " minute";
    } else {
      document.getElementById("completed-goal-time").textContent =
        totalTrackedTime.toFixed(0) + " minutes";
    }
  } else {
    totalTrackedTime = trackedTime / (1000 * 60 * 60);
    if (totalTrackedTime < 2) {
      document.getElementById("completed-goal-time").textContent =
        totalTrackedTime.toFixed(0) + " hour";
    } else {
      document.getElementById("completed-goal-time").textContent =
        totalTrackedTime.toFixed(0) + " hours";
    }
  }
}

function displayYesterdayTime(yesterdayTrackedTime) {
  let yesterdayTotalTrackedTime;
  if (yesterdayTrackedTime < 3600000) {
    yesterdayTotalTrackedTime = yesterdayTrackedTime / (1000 * 60);
    if (yesterdayTotalTrackedTime < 2) {
      document.getElementById("yesterday-tracked-time").textContent =
        yesterdayTotalTrackedTime.toFixed(0);
      document.getElementById("yesterday-time").textContent = "minute";
    } else {
      document.getElementById("yesterday-tracked-time").textContent =
        yesterdayTotalTrackedTime.toFixed(0);
      document.getElementById("yesterday-time").textContent = "minutes";
    }
  } else {
    yesterdayTotalTrackedTime = yesterdayTrackedTime / (1000 * 60 * 60);
    if (yesterdayTotalTrackedTime < 2) {
      document.getElementById("yesterday-tracked-time").textContent =
        yesterdayTotalTrackedTime.toFixed(0);
      document.getElementById("yesterday-time").textContent = "hour";
    } else {
      document.getElementById("yesterday-tracked-time").textContent =
        yesterdayTotalTrackedTime.toFixed(0);
      document.getElementById("yesterday-time").textContent = "hours";
    }
  }
}

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

function addAutoSave(taskText) {
  // Set up an interval to periodically save the state
  autoIntervalId = setInterval(() => {
    if (isRunning) {
      const currentTime = Date.now();
      const elapsedMilliseconds = currentTime - startTime;
      const elapsedTime = elapsedMilliseconds / 1000; // in seconds
      const taskName = taskText;

      // Push the data to the temporary array
      autoSaveData.push({ taskName, elapsedTime });

      // Save the most recent entry to localStorage
      localStorage.setItem(
        "lastAutoSave",
        JSON.stringify({ taskName, elapsedTime })
      );

      const elapsedTaskTime = currentTime - goalStartTime;
      goalStartTime = currentTime;

      // Add the elapsed time to totalTime
      totalTime += elapsedTaskTime;

      // Save total time to localStorage
      localStorage.setItem("totalTrackedTime", JSON.stringify(totalTime));
      // Clear the temporary array for the next round of auto-saving
      autoSaveData.length = 0;
    }
  }, AUTO_SAVE_TIMER);
}

// Retrieve the most recent entry from localStorage
if (typeof localStorage.getItem("lastAutoSave") === "object") {
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
}

function updateTimer(taskText) {
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

  logging.innerHTML = capitalizeFirstLetter(
    `You're tracking <span class="taskId">“${taskText}”</span>:<br /> ${formattedTime}`
  );
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

window.clearLogs = function () {
  if (!logged) {
    displayFlashMessage("No logs to clear", "inherit", 1000);
    return;
  }
  logList.innerHTML = "";
  timeLog.length = 0;
  localStorage.removeItem("timeLog");
  const lastAutoSave = JSON.parse(localStorage.getItem("lastAutoSave"));
  if (lastAutoSave) {
    localStorage.removeItem("lastAutoSave");
  }
  logField.style.display = "none";
};

function startRestTimer() {
  restCounter -= ten;

  if (restCounter === 0) {
    restMessage.style.display = "block";
    restMessage.textContent = "Time to rest! Please take a 5 minutes break.";

    playAlarm("");
    setTimeout(() => {
      stopAlarm("");
    }, 10000);

    setTimeout(() => {
      restMessage.textContent = "Resting time remaining: 4 minutes.";
    }, 60 * 1000);

    setTimeout(() => {
      restMessage.textContent = "Resting time remaining: 3 minutes.";
    }, 2 * 60 * 1000);

    setTimeout(() => {
      restMessage.textContent = "Resting time remaining: 2 minutes.";
    }, 3 * 60 * 1000);

    setTimeout(() => {
      restMessage.textContent = "Get ready! You are now refreshed.";
    }, 4 * 60 * 1000);

    setTimeout(() => {
      restMessage.innerText = `Break time in 30 minutes.`;
      restCounter = 30 * 60 * 1000;
      playAlarm("2");
      alarmTimeoutId = setTimeout(() => {
        stopAlarm("2");
      }, 10000);
    }, 5 * 60 * 1000);

    return;
  } else if (restCounter <= ten) {
    restMessage.innerText = `Break time is in ${restCounter / 60000} minutes.`;
  } else if (restCounter <= twenty) {
    restMessage.innerText = `Break time is in ${restCounter / 60000} minutes.`;
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

// Refresh app after midnight
const checkNewDayAndUpdate = () => {
  // const testDateToday = "2024-07-11";
  const today = new Date().toDateString();
  const lastCheckedDate = localStorage.getItem("lastCheckedDate");

  if (lastCheckedDate !== today) {
    console.log("New day detected. Refreshing the page...");
    localStorage.setItem("lastCheckedDate", today);
    location.reload();
  } else {
    console.log("Same day, no need to refresh.");
  }
};

document.addEventListener("DOMContentLoaded", (event) => {
  checkNewDayAndUpdate();
});

// Check when the document becomes visible
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible") {
    checkNewDayAndUpdate();
  }
});

const setDailyCheck = () => {
  const now = new Date();
  const millisTillMidnight =
    new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0, 0) -
    now;

  setTimeout(() => {
    checkNewDayAndUpdate();
  }, millisTillMidnight);
};

setDailyCheck();

export {
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
};
