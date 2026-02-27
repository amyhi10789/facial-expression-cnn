import { auth } from "./firebase.js";

import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    GoogleAuthProvider,
    signInWithPopup,
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

const form = document.getElementById("authForm");
const message = document.getElementById("authMessage");
const googleBtn = document.getElementById("googleBtn");

const authSection = document.getElementById("authSection");
const accountSection = document.getElementById("accountSection");

const accountEmail = document.getElementById("accountEmail");
const accountCreated = document.getElementById("accountCreated");
const accountLastLogin = document.getElementById("accountLastLogin");
const logoutBtn = document.getElementById("logoutBtn");

form?.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    try {
        await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
        try {
            await createUserWithEmailAndPassword(auth, email, password);
        } catch (error) {
            message.innerText = error.message;
            return;
        }
    }

    window.location.href = "app.html";
});

googleBtn?.addEventListener("click", async () => {
    const provider = new GoogleAuthProvider();

    try {
        await signInWithPopup(auth, provider);
        window.location.href = "app.html";
    } catch (error) {
        message.innerText = error.message;
    }
});

onAuthStateChanged(auth, (user) => {

    if (!authSection || !accountSection) return;

    if (user) {

        authSection.classList.add("hidden");
        accountSection.classList.remove("hidden");

        if (accountEmail) {
            accountEmail.innerText = user.email;
        }

        if (accountCreated) {
            accountCreated.innerText =
                new Date(user.metadata.creationTime).toLocaleString();
        }

        if (accountLastLogin) {
            accountLastLogin.innerText =
                new Date(user.metadata.lastSignInTime).toLocaleString();
        }

    } else {
        authSection.classList.remove("hidden");
        accountSection.classList.add("hidden");
    }

});

logoutBtn?.addEventListener("click", async () => {
    await signOut(auth);
    location.reload();
});