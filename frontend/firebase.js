import { initializeApp } from
    "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";

import { getAuth } from
    "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

import { getFirestore } from
    "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyApc9e2YJ1NKo2J6ZJfBiT0BpNbI3HUeTU",
    authDomain: "percepta-ai-9e1cb.firebaseapp.com",
    projectId: "percepta-ai-9e1cb",
    storageBucket: "percepta-ai-9e1cb.firebasestorage.app",
    messagingSenderId: "315668225497",
    appId: "1:315668225497:web:b629f3e4241d36ec3d4dc8"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);