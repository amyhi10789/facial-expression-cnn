import { auth, db } from "./firebase.js";

import { onAuthStateChanged } from
    "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

import {
    collection,
    query,
    orderBy,
    onSnapshot
} from
    "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const tableBody = document.querySelector("#historyTable tbody");

onAuthStateChanged(auth, (user) => {

    if (!user) {
        window.location.href = "signin.html";
        return;
    }

    const q = query(
        collection(db, "users", user.uid, "history"),
        orderBy("timestamp", "desc")
    );

    onSnapshot(q, (snapshot) => {

        tableBody.innerHTML = "";

        if (snapshot.empty) {
            const row = document.createElement("tr");
            const cell = document.createElement("td");
            cell.colSpan = 3;
            cell.innerText = "No analysis history yet.";
            row.appendChild(cell);
            tableBody.appendChild(row);
            return;
        }

        snapshot.forEach(doc => {
            const entry = doc.data();

            const row = document.createElement("tr");

            const dateCell = document.createElement("td");
            dateCell.innerText =
                entry.timestamp?.toDate().toLocaleString() || "—";

            const emotionCell = document.createElement("td");
            emotionCell.innerText = entry.emotion;

            const confidenceCell = document.createElement("td");
            confidenceCell.innerText =
                (entry.confidence * 100).toFixed(2) + "%";

            row.appendChild(dateCell);
            row.appendChild(emotionCell);
            row.appendChild(confidenceCell);

            tableBody.appendChild(row);
        });

    });

});