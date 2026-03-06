import torch
import torch.nn as nn
from itertools import product

from models.cnn import EmotionCNN
from src.dataset import get_dataloaders
from src.evaluate import evaluate
from src.utils import save_checkpoint


def train_quick(model, train_loader, val_loader, epochs, lr, device):

    criterion = nn.CrossEntropyLoss()
    optimizer = torch.optim.Adam(model.parameters(), lr=lr)

    best_f1 = 0

    for epoch in range(epochs):

        model.train()
        total_loss = 0

        for images, labels in train_loader:
            images = images.to(device)
            labels = labels.to(device)

            optimizer.zero_grad()
            outputs = model(images)

            loss = criterion(outputs, labels)
            loss.backward()
            optimizer.step()

            total_loss += loss.item()

        metrics = evaluate(model, val_loader, device)

        print(f"\nEpoch {epoch+1}")
        print(f"Loss: {total_loss/len(train_loader):.4f}")
        print(f"Val Macro F1: {metrics['macro_f1']:.4f}")

        if metrics["macro_f1"] > best_f1:
            best_f1 = metrics["macro_f1"]

    return best_f1


def hyperparameter_tuning():

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

    learning_rates = [1e-3, 1e-4]
    batch_size = 64

    best_score = 0
    best_lr = None

    print("🔥 FAST TUNING START")

    for lr in learning_rates:

        print("\n====================")
        print(f"Tuning lr={lr}")

        train_loader, val_loader = get_dataloaders(
            "data/raw",
            batch_size=batch_size,
            subset_ratio=0.2 
        )

        model = EmotionCNN().to(device)

        score = train_quick(
            model,
            train_loader,
            val_loader,
            epochs=2,
            lr=lr,
            device=device
        )

        if score > best_score:
            best_score = score
            best_lr = lr

    print("\n🔥 BEST LR:", best_lr)

    print("\n🔥 FINAL TRAINING")

    train_loader, val_loader = get_dataloaders(
        "data/raw",
        batch_size=batch_size,
        subset_ratio=0.4
    )

    final_model = EmotionCNN().to(device)

    train_quick(
        final_model,
        train_loader,
        val_loader,
        epochs=5,
        lr=best_lr,
        device=device
    )

    save_checkpoint(final_model, "outputs/checkpoints/best_model.pth")

    print("✅ DONE")


if __name__ == "__main__":
    hyperparameter_tuning()