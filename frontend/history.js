const currentUser = localStorage.getItem("currentUser");

if (!currentUser) {
    window.location.href = "signin.html";
}

const tableBody = document.querySelector("#historyTable tbody");

const allHistory =
    JSON.parse(localStorage.getItem("emotionHistory")) || {};

const userHistory = allHistory[currentUser] || [];

if (userHistory.length === 0) {

    const emptyRow = document.createElement("tr");
    const emptyCell = document.createElement("td");

    emptyCell.colSpan = 3;
    emptyCell.innerText = "No analysis history yet.";
    emptyCell.style.opacity = "0.7";

    emptyRow.appendChild(emptyCell);
    tableBody.appendChild(emptyRow);

} else {

    userHistory.forEach(entry => {

        const row = document.createElement("tr");

        const dateCell = document.createElement("td");
        dateCell.innerText = entry.date;

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
}