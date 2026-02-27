import { auth } from "./firebase.js";
import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

const protectedPages = ["history.html"];

document.addEventListener("DOMContentLoaded", () => {

    const links = document.querySelectorAll(".nav-links a");

    links.forEach(link => {

        const href = link.getAttribute("href");

        if (protectedPages.includes(href)) {

            link.addEventListener("click", (e) => {

                const user = auth.currentUser;

                if (!user) {
                    e.preventDefault();

                    localStorage.setItem("redirectAfterLogin", href);

                    window.location.href = "signin.html";
                }

            });

        }

    });

});

document.documentElement.style.visibility = "hidden";

onAuthStateChanged(auth, (user) => {

    const currentPage = window.location.pathname.split("/").pop();

    if (protectedPages.includes(currentPage) && !user) {

        localStorage.setItem("redirectAfterLogin", currentPage);

        window.location.href = "signin.html";

    } else {
        document.documentElement.style.visibility = "visible";
    }

});