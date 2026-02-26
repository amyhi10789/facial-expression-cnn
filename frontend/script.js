const currentUser = localStorage.getItem("currentUser");

document.addEventListener("DOMContentLoaded", () => {

    const protectedPages = ["app.html", "history.html"];
    const currentPage = window.location.pathname.split("/").pop();

    if (protectedPages.includes(currentPage)) {

        const currentUser = localStorage.getItem("currentUser");

        if (!currentUser) {
            window.location.href = "signin.html";
            return;
        }

        const welcomeMessage = localStorage.getItem("welcomeMessage");

        if (welcomeMessage) {
            showWelcomePopup(welcomeMessage);
            localStorage.removeItem("welcomeMessage");
        }
    }

});

function showWelcomePopup(message) {

    const popup = document.createElement("div");
    popup.className = "welcome-popup";
    popup.innerText = message;

    document.body.appendChild(popup);

    void popup.offsetWidth;

    popup.classList.add("show");

    setTimeout(() => {
        popup.classList.remove("show");
        setTimeout(() => popup.remove(), 300);
    }, 3000);
}

let currentFile = null;

const input = document.getElementById("imageInput");
const uploadArea = document.getElementById("uploadArea");
const uploadStatus = document.getElementById("uploadStatus");

const uploadView = document.getElementById("uploadView");
const loadingView = document.getElementById("loadingView");
const resultView = document.getElementById("resultView");

const emotionBadge = document.getElementById("emotionBadge");
const confidenceLabel = document.getElementById("confidenceLabel");
const confidenceBar = document.getElementById("confidenceBar");
const loadingText = document.getElementById("loadingText");

function showView(view) {
    [uploadView, loadingView, resultView].forEach(v => {
        v.classList.remove("active-view");
    });

    view.classList.add("active-view");

    if (view === loadingView) {
        document.body.classList.add("loading-active");
    } else {
        document.body.classList.remove("loading-active");
    }
}

input.addEventListener("change", () => {
    currentFile = input.files[0];
    if (currentFile) {
        uploadStatus.classList.remove("hidden");
    }
});

uploadArea.addEventListener("dragover", e => {
    e.preventDefault();
    uploadArea.style.borderColor = "white";
});

uploadArea.addEventListener("dragleave", () => {
    uploadArea.style.borderColor = "rgba(255,255,255,0.5)";
});

uploadArea.addEventListener("drop", e => {
    e.preventDefault();
    uploadArea.style.borderColor = "rgba(255,255,255,0.5)";
    currentFile = e.dataTransfer.files[0];
    if (currentFile) {
        uploadStatus.classList.remove("hidden");
    }
});

document.addEventListener("paste", e => {
    for (let item of e.clipboardData.items) {
        if (item.type.includes("image")) {
            currentFile = item.getAsFile();
            uploadStatus.classList.remove("hidden");
        }
    }
});

async function startAnalysis() {

    if (!currentFile) {
        alert("Please upload or paste an image first.");
        return;
    }

    showView(loadingView);

    const steps = [
        "Analyzing facial structure...",
        "Detecting micro-expressions...",
        "Evaluating emotional features...",
        "Finalizing confidence score..."
    ];

    for (let step of steps) {
        loadingText.innerText = step;
        await new Promise(r => setTimeout(r, 900));
    }

    try {
        const formData = new FormData();
        formData.append("file", currentFile);

        const response = await fetch("http://127.0.0.1:8000/predict", {
            method: "POST",
            body: formData
        });

        if (!response.ok) {
            throw new Error("Server error");
        }

        const data = await response.json();

        showView(resultView);

        emotionBadge.innerText = data.emotion;
        confidenceLabel.innerText =
            `Confidence: ${(data.confidence * 100).toFixed(2)}%`;

        confidenceBar.style.width = `${data.confidence * 100}%`;

        const allHistory =
            JSON.parse(localStorage.getItem("emotionHistory")) || {};

        if (!allHistory[currentUser]) {
            allHistory[currentUser] = [];
        }

        allHistory[currentUser].unshift({
            date: new Date().toLocaleString([], {
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit"
            }),
            emotion: data.emotion,
            confidence: data.confidence
        });

        if (allHistory[currentUser].length > 50) {
            allHistory[currentUser].pop();
        }

        localStorage.setItem(
            "emotionHistory",
            JSON.stringify(allHistory)
        );

    } catch (error) {
        alert("Analysis failed. Make sure your backend server is running.");
        showView(uploadView);
    }
}

function resetApp() {
    showView(uploadView);
    confidenceBar.style.width = "0%";
    emotionBadge.innerText = "";
    confidenceLabel.innerText = "";
    currentFile = null;
    uploadStatus.classList.add("hidden");
}