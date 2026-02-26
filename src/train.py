import torch
import torch.nn as nn
from torch.utils.data import DataLoader
from tqdm import tqdm
from src.evaluate import evaluate
from src.utils import save_checkpoint

def train_model(model, train_loader, val_loader, epochs, lr, device):

    criterion = nn.CrossEntropyLoss()
    optimizer = torch.optim.Adam(model.parameters(), lr=lr)

    best_f1 = 0

    model.to(device)

    for epoch in range(epochs):
        model.train()
        train_loss = 0

        for images, labels in tqdm(train_loader):
            images = images.to(device)
            labels = labels.to(device)

            optimizer.zero_grad()
            outputs = model(images)
            loss = criterion(outputs, labels)
            loss.backward()
            optimizer.step()

            train_loss += loss.item()

        train_loss /= len(train_loader)

        metrics = evaluate(model, val_loader, device)

        print(f"\nEpoch {epoch+1}")
        print(f"Train Loss: {train_loss:.4f}")
        print(f"Val Loss: {metrics['loss']:.4f}")
        print(f"Val Accuracy: {metrics['accuracy']:.4f}")
        print(f"Val Macro F1: {metrics['macro_f1']:.4f}")

        # Save best model
        if metrics["macro_f1"] > best_f1:
            best_f1 = metrics["macro_f1"]
            save_checkpoint(model, "outputs/checkpoints/best_model.pth")
            print("Saved new best model.\n")