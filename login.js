const loginScreen = document.querySelector(".login-screen");
const loginModal = document.querySelector(".login-modal");
let loginBtn = document.querySelector(".user-login");
let mobileLoginBtn = document.querySelector(".user-login-mobile");
let userLSBool = localStorage.getItem("userLoggedIn");

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

document.body.addEventListener("click", function (event) {
  if (
    !loginScreen.contains(event.target) &&
    !event.target.classList.contains("user-login") &&
    !event.target.classList.contains("user-login-mobile") &&
    !event.target.classList.contains("sign-up") &&
    !event.target.classList.contains("login") &&
    !event.target.classList.contains("logout")
  ) {
    loginModal.style.display = "none";
  }
});

document
  .querySelector(".close-modal")
  .addEventListener("click", () => (loginModal.style.display = "none"));

document.getElementById("sign-up").addEventListener("click", () => {
  document.querySelector(".login-container").style.display = "none";
  document.querySelector(".signup-container").style.display = "block";
});

document.getElementById("login").addEventListener("click", () => {
  document.querySelector(".login-container").style.display = "block";
  document.querySelector(".signup-container").style.display = "none";
});
