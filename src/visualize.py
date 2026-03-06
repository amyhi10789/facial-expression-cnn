import os
import torch
import matplotlib.pyplot as plt
import seaborn as sns
import pandas as pd
from sklearn.metrics import confusion_matrix

from models.cnn import EmotionCNN
from src.dataset import get_dataloaders
from src.evaluate import evaluate
from src.utils import load_checkpoint


PLOT_DIR = "outputs/plots"
os.makedirs(PLOT_DIR, exist_ok=True)

CLASS_NAMES = ['angry','disgust','fear','happy','neutral','sad','surprised']

def plot_hyperparam_results():

    results = [
        {"config": "lr=0.0001", "f1": 0.1388},
        {"config": "lr=0.0003", "f1": 0.1479},
        {"config": "lr=0.001", "f1": 0.1652},
        {"config": "lr=0.003", "f1": 0.1617},
        {"config": "lr=0.005", "f1": 0.1586},

    ]

    df = pd.DataFrame(results)

    plt.figure(figsize=(8,5))
    sns.barplot(data=df, x="config", y="f1")

    plt.title("Hyperparameter Tuning Results")
    plt.xlabel("Configuration")
    plt.ylabel("Macro F1 Score")

    plt.tight_layout()
    plt.savefig(f"{PLOT_DIR}/hyperparam_results.png")
    plt.show()

def plot_conf_matrix():

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

    model = EmotionCNN()
    load_checkpoint(model, "outputs/checkpoints/best_model.pth", device)
    model.to(device)

    _, val_loader = get_dataloaders("data/raw", batch_size=64, subset_ratio=1.0)

    metrics = evaluate(model, val_loader, device)

    cm = confusion_matrix(metrics["labels"], metrics["predictions"])

    plt.figure(figsize=(7,6))
    sns.heatmap(
        cm,
        annot=True,
        fmt="d",
        xticklabels=CLASS_NAMES,
        yticklabels=CLASS_NAMES,
        cmap="Blues"
    )

    plt.xlabel("Predicted")
    plt.ylabel("True")
    plt.title("Confusion Matrix")

    plt.tight_layout()
    plt.savefig(f"{PLOT_DIR}/confusion_matrix.png")
    plt.show()


if __name__ == "__main__":
    plot_hyperparam_results()
    plot_conf_matrix()