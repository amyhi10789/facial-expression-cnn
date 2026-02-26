const form = document.getElementById("authForm");
const message = document.getElementById("authMessage");

const switchBtn = document.getElementById("switchMode");
const switchText = document.getElementById("switchText");
const authTitle = document.getElementById("authTitle");
const authSubtitle = document.getElementById("authSubtitle");
const authButton = document.getElementById("authButton");

const authSection = document.getElementById("authSection");
const accountSection = document.getElementById("accountSection");

const accountEmail = document.getElementById("accountEmail");
const accountCreated = document.getElementById("accountCreated");
const logoutBtn = document.getElementById("logoutBtn");

let isCreateMode = false;

/* ===== UTILITIES ===== */
function getUsers() {
    return JSON.parse(localStorage.getItem("users")) || {};
}

function saveUsers(users) {
    localStorage.setItem("users", JSON.stringify(users));
}

function setCurrentUser(email) {
    localStorage.setItem("currentUser", email);
}

function getCurrentUser() {
    return localStorage.getItem("currentUser");
}

function logout() {
    localStorage.removeItem("currentUser");
    location.reload();
}

/* ===== MODE SWITCH ===== */
switchBtn.addEventListener("click", () => {
    isCreateMode = !isCreateMode;

    if (isCreateMode) {
        authTitle.innerText = "Create Account";
        authSubtitle.innerText = "Set up your Percepta AI account.";
        authButton.innerText = "Create Account";
        switchText.innerText = "Already have an account?";
        switchBtn.innerText = "Sign in";
        message.innerText = "";
    } else {
        authTitle.innerText = "Sign In";
        authSubtitle.innerText = "Sign in to access your emotional insights.";
        authButton.innerText = "Sign In";
        switchText.innerText = "Don't have an account?";
        switchBtn.innerText = "Create one";
        message.innerText = "";
    }
});

/* ===== FORM SUBMIT ===== */
form.addEventListener("submit", (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    const users = getUsers();

    if (isCreateMode) {

        if (users[email]) {
            message.innerText = "Account already exists. Please sign in.";
            return;
        }

        users[email] = {
            password,
            createdAt: new Date().toLocaleString()
        };

        saveUsers(users);
        setCurrentUser(email);

        // Set welcome message
        localStorage.setItem(
            "welcomeMessage",
            "Thank you for creating an account. Welcome to Percepta AI!"
        );

        window.location.href = "app.html";

    } else {

        if (!users[email]) {
            message.innerText = "No account found. Please create one.";
            return;
        }

        if (users[email].password !== password) {
            message.innerText = "Incorrect password.";
            return;
        }

        setCurrentUser(email);

        localStorage.setItem(
            "welcomeMessage",
            "Thank you for signing in. Welcome back to Percepta AI!"
        );

        window.location.href = "app.html";
    }
});

/* ===== ACCOUNT DISPLAY ===== */
function showAccount() {
    const email = getCurrentUser();
    const users = getUsers();

    if (!email || !users[email]) return;

    authSection.classList.add("hidden");
    accountSection.classList.remove("hidden");

    accountEmail.innerText = email;
    accountCreated.innerText = users[email].createdAt;
}

logoutBtn.addEventListener("click", logout);

document.addEventListener("DOMContentLoaded", () => {
    const currentUser = getCurrentUser();

    if (currentUser) {
        showAccount();
    }
});