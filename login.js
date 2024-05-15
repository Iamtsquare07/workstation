const loginScreen = document.querySelector(".login-screen");
const loginModal = document.querySelector(".login-modal");
let loginBtn = document.querySelector(".user-login");
let mobileLoginBtn = document.querySelector(".user-login-mobile");
let userLSBool = localStorage.getItem("userLoggedIn");
let loading = document.querySelector(".loading");

function hideLoader() {
  loading.style.visibility = "hidden";
}

function showLoader() {
  loading.style.visibility = "visible";
}

!JSON.parse(userLSBool)
  ? (loginBtn.innerText = "Login")
  : (loginBtn.innerText = "Logout");

!JSON.parse(userLSBool)
  ? (mobileLoginBtn.innerText = "Login")
  : (mobileLoginBtn.innerText = "Logout");

document.querySelector(".user-login").addEventListener("click", showLoginModal);
document
  .querySelector(".user-login-mobile")
  .addEventListener("click", showLoginModal);

function showLoginModal() {
  closeMenu();
  loginModal.style.display = "block";
}

loginModal.addEventListener("click", function (event) {
  if (!loginScreen.contains(event.target)) {
    loginModal.style.display = "none";
  }
});

document
  .querySelector(".close-modal")
  .addEventListener("click", () => (loginModal.style.display = "none"));

document.getElementById("sign-up").addEventListener("click", () => {
  showLoader();

  setTimeout(() => {
    document.querySelector(".login-container").style.display = "none";
    document.querySelector(".signup-container").style.display = "block";
    hideLoader();
  }, 1000);
});

document.getElementById("login").addEventListener("click", () => {
  showLoader();

  setTimeout(() => {
    hideLoader();
    document.querySelector(".login-container").style.display = "block";
    document.querySelector(".signup-container").style.display = "none";
  }, 1000);
});
