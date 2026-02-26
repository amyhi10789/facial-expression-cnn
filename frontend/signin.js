import { auth } from "./firebase.js";

import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    GoogleAuthProvider,
    signInWithPopup,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

const form = document.getElementById("authForm");
const message = document.getElementById("authMessage");
const googleBtn = document.getElementById("googleBtn");

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

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

googleBtn.addEventListener("click", async () => {
    const provider = new GoogleAuthProvider();

    try {
        await signInWithPopup(auth, provider);
        window.location.href = "app.html";
    } catch (error) {
        message.innerText = error.message;
    }
});

onAuthStateChanged(auth, (user) => {
    if (user) {
        console.log("Logged in as:", user.uid);
    }
});