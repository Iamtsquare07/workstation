// import { updateBudget, updateTableFromLocalStorage } from "./index.js";
// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.6.0/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "https://www.gstatic.com/firebasejs/10.6.0/firebase-auth.js";
import {
  getDatabase,
  ref,
  set,
  child,
  get,
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
  let name = document.getElementById("name").value;
  let email = document.getElementById("new-user-email").value;
  let password = document.getElementById("password").value;
  console.log(name, email, password);

  if (!isValidPassword(password) || !isValidEmail(email)) {
    alert("Please enter a valid email and password");
    return;
  }

  createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      const user = userCredential.user;
      localStorage.setItem("wsUser", name);
      console.log(user);
      alert("Signed up successfully");
      switchToLogin(email, password);
      name = "";
      email = "";
      password = "";
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      console.log(errorCode, errorMessage);
    });
}
document.getElementById("signup-btn").addEventListener("click", signUp);
document.getElementById("password").addEventListener("keypress", function (e) {
  if (e.key === "Enter") signUp();
});

function switchToLogin(email, password) {
  document.querySelector(".login-container").style.display = "block";
  document.querySelector(".signup-container").style.display = "none";

  document.getElementById("email").value = email;
  document.getElementById("login-password").value = password;
}

function logIn() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("login-password").value;

  if (!isValidEmail(email)) {
    alert("Please enter a valid email and password");
    return;
  }

  if (JSON.parse(localStorage.getItem("userLoggedIn")) === true) {
    alert(`You are already logged in as ${wsUser}`);
    return;
  }

  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      const user = userCredential.user;
      console.log(user);
      localStorage.setItem("userLoggedIn", JSON.stringify(true));
      localStorage.setItem("currentUser", user);
      localStorage.setItem("currentUserEmail", email);
      alert("Login successful");
      location.reload(true);
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      let errorText;
      if (errorCode == "auth/invalid-login-credentials") {
        errorText = "Invalid login credentials";
      } else if (errorCode == "auth/invalid-password-credentials") {
        errorText = "Invalid password";
      } else {
        errorText = errorCode;
      }

      alert(`${errorText}, please check your login details and try again.`);
      console.log(errorCode);
      console.log(errorMessage);
    });
}
document.getElementById("login-btn").addEventListener("click", logIn);
document
  .getElementById("login-password")
  .addEventListener("keypress", function (e) {
    if (e.key === "Enter") logIn();
  });

function logOut() {
  signOut(auth)
    .then(() => {
      localStorage.setItem("userLoggedIn", JSON.stringify(false));
      localStorage.setItem("currentUserEmail", "");
      document.querySelectorAll(".logout").forEach((element) => {
        element.innerText = "Login";
        element.classList.add("user-login");
        element.classList.remove("logout");
      });

      alert("Logged out successfully");
      location.reload(true);
    })
    .catch((error) => {
      console.log(error);
    });
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

async function setData(email, id) {
  const user = localStorage.getItem("wsUser") || null;
  const userWorkLocation = localStorage.getItem("userWorkLocation") || null;
  const lastVisitDate = localStorage.getItem("lastVisitDate") || null;
  const goalHour = localStorage.getItem("goalHour") || null;
  const streak = localStorage.getItem("streak") || null;
  const mode = localStorage.getItem("mode") || null;
  const tasks = JSON.parse(localStorage.getItem("tasks")) || null;
  const timeLog = JSON.parse(localStorage.getItem("timeLog")) || null;
  const lastAutoSave = JSON.parse(localStorage.getItem("lastAutoSave")) || null;
  const totalTrackedTime =
    JSON.parse(localStorage.getItem("totalTrackedTime")) || null;
  const lastTrackedDate =
    JSON.parse(localStorage.getItem("lastTrackedDate")) || null;
  const motivationalMessages =
    JSON.parse(localStorage.getItem("motivationalMessages")) || null;
  const yesterdayTotalTrackedTime =
    JSON.parse(localStorage.getItem("yesterdayTotalTrackedTime")) || null;
  if (isValidEmail(email)) {
    set(ref(db, "workstation/user/" + id), {
      userEmail: email,
      userName: user,
      userId: id,
      userWorkLocation: userWorkLocation,
      lastVisitDate: lastVisitDate,
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
    })
      .then(() => {
        console.log("Data saved successfully");
        alert(`Your tasks have been saved successfully`);
        JSON.stringify(
          localStorage.setItem("messageFired", (messageFired = true))
        );
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

async function sendData(email) {
  if (isValidEmail(email)) {
    setData(email);
  } else {
    alert("Invalid email");
  }
}

function isValidEmail(email) {
  // Regular expression for a simple email validation
  const emailInspector = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  return emailInspector.test(email);
}

function isValidPassword(password) {
  const passwordRegex = /(?=.*[A-Z])(?=.*[a-z])(?=.*\d).{8,}/;

  if (passwordRegex.test(password)) {
    console.log("Password is valid.");
  } else {
    alert("Password must contain an uppercase/lowercase letter and a number.");
    return;
  }

  if (password.length > 5) {
    return true;
  }
}

async function retriveDataFromDatabase(email) {
  let data;
  const id = email.replace(/[.]/g, "");
  const dbref = ref(db);

  get(child(dbref, "workstation/user/" + id))
    .then((snapshot) => {
      if (snapshot.exists()) {
        data = snapshot.val();
        localStorage.setItem("wsUser", data.user);
        localStorage.setItem("userWorkLocation", data.userWorkLocation);
        localStorage.setItem("lastVisitDate", data.lastVisitDate);
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
        localStorage.setItem(
          "lastTrackedDate",
          JSON.stringify(data.lastTrackedDate)
        );
        localStorage.setItem(
          "motivationalMessages",
          JSON.stringify(data.motivationalMessages)
        );
        localStorage.setItem(
          "yesterdayTotalTrackedTime",
          JSON.stringify(data.yesterdayTotalTrackedTime)
        );
      } else {
        console.log("Data not found");
      }
    })
    .catch((err) => {
      console.log(err);
    });
}

export { sendData, retriveDataFromDatabase, isValidEmail };
