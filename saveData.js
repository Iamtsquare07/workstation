// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.6.0/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendEmailVerification,
} from "https://www.gstatic.com/firebasejs/10.6.0/firebase-auth.js";
import {
  getDatabase,
  ref,
  set,
  child,
  get,
  update,
} from "https://www.gstatic.com/firebasejs/10.6.0/firebase-database.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional


// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth();

function signUp() {
  showLoader();
  let name = document.getElementById("name").value;
  let email = document.getElementById("new-user-email").value;
  let password = document.getElementById("password").value;

  if (!isValidPassword(password) || !isValidEmail(email)) {
    alert("Please enter a valid email and password");
    hideLoader();
    return;
  }

  createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      const user = userCredential.user;
      localStorage.setItem("wsUser", name);
      localStorage.setItem("currentUser", JSON.stringify(user));
      sendEmailVerification(auth.currentUser);

      setTimeout(() => {
        switchToLogin(email, password);
        name = "";
        email = "";
        password = "";
        hideLoader();
      }, 2000);
    })
    .then(() => {
      alert("Check your email to verify your account");
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      console.log(errorCode, errorMessage);
      hideLoader();
    });
}
document.getElementById("signup-btn").addEventListener("click", signUp);
document.getElementById("password").addEventListener("keypress", function (e) {
  if (e.key === "Enter") signUp();
});

async function logIn() {
  showLoader();

  const email = document.getElementById("email").value;
  const password = document.getElementById("login-password").value;

  if (!isValidEmail(email)) {
    hideLoader();
    alert("Please enter a valid email and password");
    return;
  }

  if (JSON.parse(localStorage.getItem("userLoggedIn")) === true) {
    hideLoader();
    alert(`You are already logged in as ${wsUser}`);
    return;
  }

  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;

    if (!user.emailVerified) {
      alert(
        "Please check your email and click the verify link we sent to continue."
      );
      hideLoader();
      return;
    }

    await validateUser(user.uid, user.email, true);

    localStorage.setItem("userLoggedIn", JSON.stringify(true));
    localStorage.setItem("currentUser", JSON.stringify(user));
    localStorage.setItem("currentUserEmail", user.email);
    localStorage.setItem("currentUserId", user.uid);

    location.reload(true);
  } catch (error) {
    const errorCode = error.code;
    const errorMessage = error.message;
    let errorText;
    hideLoader();
    if (errorCode === "auth/invalid-login-credentials") {
      errorText = "Invalid login credentials";
    } else if (errorCode === "auth/invalid-password-credentials") {
      errorText = "Invalid password";
    } else {
      errorText = errorCode;
    }

    alert(`${errorText}, please check your login details and try again.`);
    console.error(errorCode);
    console.error(errorMessage);
  } finally {
    hideLoader();
  }
}

document.getElementById("login-btn").addEventListener("click", logIn);
document
  .getElementById("login-password")
  .addEventListener("keypress", function (e) {
    if (e.key === "Enter") logIn();
  });

async function logOut() {
  showLoader();
  let userChoice = await askUserForConfirmation(
    "Are you sure you want to log out? Y/N",
    "Y"
  );
  if (userChoice.toLowerCase() === "n" || userChoice.toLowerCase() === "no") {
    alert("Aborted");
    hideLoader();
    return;
  }
  try {
    await signOut(auth);
    localStorage.setItem("userLoggedIn", JSON.stringify(false));
    document.querySelectorAll(".logout").forEach((element) => {
      element.innerText = "Login";
      element.classList.add("user-login");
      element.classList.remove("logout");
    });
    clearLocalStorage();
    location.reload(true);
  } catch (error) {
    console.error("Failed to log out:", error);
    alert("Failed to log out. Please try again.");
  } finally {
    hideLoader();
  }
}

async function validateUser(id, email, retrieve) {
  const dbref = ref(db);
  let data;
  try {
    const snapshot = await get(child(dbref, "workstation/users/" + id));
    if (snapshot.exists()) {
      data = snapshot.val();
      retrieve ? retriveDataFromDatabase(data) : null;
    } else {
      await setData(email, id);
    }
    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

async function setData(email, id) {
  let userdata = await validateUser(id, email, false);

  if (
    userdata.totalTrackedTime >
    JSON.parse(localStorage.getItem("totalTrackedTime"))
  ) {
    let userChoice = await askUserForConfirmation(
      "Warning: The data in your database seem to be more updated than this version you want to save. Do you want to continue? Y/N",
      "Y"
    );

    if (userChoice.toLowerCase() === "n" || userChoice.toLowerCase() === "no") {
      alert("Aborted");
      hideLoader();
      return;
    }
  }

  const user = localStorage.getItem("wsUser") || "";
  const userWorkLocation = localStorage.getItem("userWorkLocation") || "";
  const lastVisitDate = localStorage.getItem("lastVisitDate") || 0;
  const goalHour = localStorage.getItem("goalHour") || 0;
  const streak = localStorage.getItem("streak") || 0;
  const mode = localStorage.getItem("mode") || null;
  const tasks = JSON.parse(localStorage.getItem("tasks")) || null;
  const timeLog = JSON.parse(localStorage.getItem("timeLog")) || 0;
  let lastAutoSave = null;
  if (typeof localStorage.getItem("lastAutoSave") === "object") {
    lastAutoSave = JSON.parse(localStorage.getItem("lastAutoSave"));
  }
  const totalTrackedTime =
    JSON.parse(localStorage.getItem("totalTrackedTime")) || 0;
  const lastTrackedDate =
    JSON.parse(localStorage.getItem("lastTrackedDate")) || 0;
  const motivationalMessages =
    JSON.parse(localStorage.getItem("motivationalMessages")) || null;
  const yesterdayTotalTrackedTime =
    JSON.parse(localStorage.getItem("yesterdayTotalTrackedTime")) || 0;

  const userData = {
    userEmail: email,
    userName: user,
    userId: id,
    userWorkLocation: userWorkLocation,
    lastVisitDate: lastVisitDate,
    lastLogin: Date.now(),
    goalHour: goalHour,
    streak: streak,
    mode: mode,
    tasks: tasks,
    timeLog: timeLog,
    lastAutoSave: lastAutoSave,
    totalTrackedTime: totalTrackedTime,
    lastTrackedDate: lastTrackedDate,
    motivationalMessages: motivationalMessages,
    yesterdayTotalTrackedTime: yesterdayTotalTrackedTime,
  };

  if (isValidEmail(email)) {
    update(ref(db, "workstation/users/" + id), userData)
      .then(() => {
        alert(`Your tasks have been saved successfully`);
        hideLoader();
      })
      .catch((err) => {
        console.error(err);
        console.log(err);
      });
  } else {
    console.log("Something went wrong");
    alert("We are having trouble with your email address");
  }
}

function retriveDataFromDatabase(data) {
  localStorage.setItem("wsUser", data.userName);
  localStorage.setItem("currentUserEmail", data.userEmail);
  localStorage.setItem("userWorkLocation", data.userWorkLocation);
  localStorage.setItem("lastVisitDate", data.lastVisitDate);
  localStorage.setItem("lastLogin", data.lastLogin);
  localStorage.setItem("goalHour", data.goalHour);
  localStorage.setItem("streak", data.streak);
  localStorage.setItem("mode", data.mode);
  localStorage.setItem("tasks", JSON.stringify(data.tasks));
  localStorage.setItem("timeLog", JSON.stringify(data.timeLog));
  localStorage.setItem("lastAutoSave", JSON.stringify(data.lastAutoSave));
  localStorage.setItem(
    "totalTrackedTime",
    JSON.stringify(data.totalTrackedTime)
  );
  localStorage.setItem("lastTrackedDate", JSON.stringify(data.lastTrackedDate));
  localStorage.setItem(
    "motivationalMessages",
    JSON.stringify(data.motivationalMessages)
  );
  if (data.yesterdayTotalTrackedTime) {
    localStorage.setItem(
      "yesterdayTotalTrackedTime",
      JSON.stringify(data.yesterdayTotalTrackedTime)
    );
  }
}

function clearLocalStorage() {
  localStorage.removeItem("wsUser");
  localStorage.removeItem("currentUser");
  localStorage.removeItem("currentUserEmail");
  localStorage.removeItem("currentUserId");
  localStorage.removeItem("userWorkLocation");
  localStorage.removeItem("lastVisitDate");
  localStorage.removeItem("lastLogin");
  localStorage.removeItem("goalHour");
  localStorage.removeItem("streak");
  localStorage.removeItem("mode");
  localStorage.removeItem("tasks");
  localStorage.removeItem("timeLog");
  localStorage.removeItem("lastAutoSave");
  localStorage.removeItem("totalTrackedTime");
  localStorage.removeItem("lastTrackedDate");
  localStorage.removeItem("motivationalMessages");
  localStorage.removeItem("yesterdayTotalTrackedTime");
}

function saveDataToDB() {
  showLoader();
  const email = localStorage.getItem("currentUserEmail");
  const id = localStorage.getItem("currentUserId");
  if (!id) {
    alert("You are not logged in. Login and try again");
    hideLoader();
    return;
  }

  setTimeout(() => {
    setData(email, id);
  }, 1000);
}
document.querySelector(".save-progress").onclick = saveDataToDB;

async function loadDataFromDB() {
  showLoader();
  const email = localStorage.getItem("currentUserEmail");
  const id = localStorage.getItem("currentUserId");
  let message =
    "This action will replace your current data with your last saved data. Continue? Y/N";
  let userChoice = await askUserForConfirmation(message, "Y");
  if (!id) {
    alert("You are not logged in. Login and try again");
    hideLoader();
    return;
  }

  if (
    userChoice.toLowerCase() !== "y" &&
    userChoice.toLowerCase() !== "n" &&
    userChoice.toLowerCase() !== "yes" &&
    userChoice.toLowerCase() !== "no"
  ) {
    alert("Aborted");
    hideLoader();
    return;
  }

  if (userChoice.toLowerCase() === "n" || userChoice.toLowerCase() === "no") {
    alert("Aborted");
    hideLoader();
    return;
  }

  try {
    await validateUser(id, email, true);
    hideLoader();
    location.reload();
  } catch (error) {
    console.error("Failed to validate user:", error);
    alert("Failed to validate user. Please try again.");
    hideLoader();
  }
}

document.querySelector(".load-progress").onclick = loadDataFromDB;

async function askUserForConfirmation(message, placeholder) {
  let val;
  if (!message.length > 0) {
    console.log("Error: Provide a message to askUserForConfirmation");
    return;
  }

  do {
    val = prompt(message, placeholder);
  } while (
    val.toLowerCase() !== "y" &&
    val.toLowerCase() !== "n" &&
    val.toLowerCase() !== "yes" &&
    val.toLowerCase() !== "no"
  );

  return val;
}

function switchToLogin(email, password) {
  document.querySelector(".login-container").style.display = "block";
  document.querySelector(".signup-container").style.display = "none";

  document.getElementById("email").value = email;
  document.getElementById("login-password").value = password;
}

function isValidEmail(email) {
  // Regular expression for a simple email validation
  const emailInspector = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  return emailInspector.test(email);
}

function isValidPassword(password) {
  const passwordRegex = /(?=.*[A-Z])(?=.*[a-z])(?=.*\d).{8,}/;

  if (passwordRegex.test(password)) {
    null;
  } else {
    alert("Password must contain an uppercase/lowercase letter and a number.");
    return;
  }

  if (password.length > 5) {
    return true;
  }
}

window.onload = () => {
  if (JSON.parse(localStorage.getItem("userLoggedIn")) === true) {
    let loginBtn = document.querySelector(".user-login");
    let mobileLoginBtn = document.querySelector(".user-login-mobile");

    loginBtn.removeEventListener("click", showLoginModal);
    mobileLoginBtn.removeEventListener("click", showLoginModal);
    loginBtn.classList.add("logout");
    loginBtn.classList.remove("user-login");
    mobileLoginBtn.classList.add("logout");
    mobileLoginBtn.classList.remove("user-login-mobile");

    document.querySelectorAll(".logout").forEach((element) => {
      element.addEventListener("click", logOut);
    });
  }
};
