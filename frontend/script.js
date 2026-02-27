import { auth, db } from "./firebase.js";

import { collection, addDoc } from
    "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

let currentFile = null;

import { onAuthStateChanged } from
    "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

let currentUser = null;

onAuthStateChanged(auth, (user) => {
    currentUser = user;
});
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

const modelExplanation = document.getElementById("modelExplanation");
const confidenceExplanation = document.getElementById("confidenceExplanation");

const API_BASE = "https://percepta-ai.onrender.com";

function showView(view) {
    [uploadView, loadingView, resultView].forEach(v => {
        v?.classList.remove("active-view");
    });

    view?.classList.add("active-view");

    if (view === loadingView) {
        document.body.classList.add("loading-active");
    } else {
        document.body.classList.remove("loading-active");
    }
}

input?.addEventListener("change", () => {
    currentFile = input.files[0];
    if (currentFile) {
        uploadStatus?.classList.remove("hidden");
    }
});

uploadArea?.addEventListener("dragover", (e) => {
    e.preventDefault();
    uploadArea.style.borderColor = "white";
});

uploadArea?.addEventListener("dragleave", () => {
    uploadArea.style.borderColor = "rgba(255,255,255,0.5)";
});

uploadArea?.addEventListener("drop", (e) => {
    e.preventDefault();
    uploadArea.style.borderColor = "rgba(255,255,255,0.5)";
    currentFile = e.dataTransfer.files[0];

    if (currentFile) {
        uploadStatus?.classList.remove("hidden");
    }
});

document.addEventListener("paste", (e) => {
    for (let item of e.clipboardData.items) {
        if (item.type.includes("image")) {
            currentFile = item.getAsFile();
            uploadStatus?.classList.remove("hidden");
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
        if (loadingText) {
            loadingText.innerText = step;
        }
        await new Promise(r => setTimeout(r, 900));
    }

    try {

        const formData = new FormData();
        formData.append("file", currentFile);

        const response = await fetch(`${API_BASE}/predict`, {
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

        if (data.explanation) {
            modelExplanation.innerText = data.explanation;
        } else {
            modelExplanation.innerText =
                "The model analyzed facial structure and expression patterns to determine the most probable emotional classification.";
        }

        if (data.confidence > 0.75) {
            confidenceExplanation.innerText =
                "The model shows strong certainty in this classification. Detected facial features consistently aligned with learned training patterns.";
        }
        else if (data.confidence > 0.45) {
            confidenceExplanation.innerText =
                "The model shows moderate confidence. Some facial signals align clearly, while others overlap with alternative emotional categories.";
        }
        else {
            confidenceExplanation.innerText =
                "The model confidence is relatively low. Facial signals appear ambiguous or mixed, meaning multiple interpretations were possible.";
        }

        if (currentUser) {
            await addDoc(
                collection(db, "users", currentUser.uid, "history"),
                {
                    emotion: data.emotion,
                    confidence: data.confidence,
                    explanation: data.explanation || "",
                    timestamp: new Date()
                }
            );
        } else {
            confidenceExplanation.innerHTML +=
                "<br><br><em>Sign in to save this result to your analysis history.</em>";
        }

    } catch (error) {
        console.error(error);
        alert("Analysis failed. Make sure your backend server is running.");
        showView(uploadView);
    }
}

function resetApp() {
    showView(uploadView);
    confidenceBar.style.width = "0%";
    emotionBadge.innerText = "";
    confidenceLabel.innerText = "";
    modelExplanation.innerText = "";
    confidenceExplanation.innerText = "";
    currentFile = null;
    uploadStatus?.classList.add("hidden");
}

window.startAnalysis = startAnalysis;
window.resetApp = resetApp;