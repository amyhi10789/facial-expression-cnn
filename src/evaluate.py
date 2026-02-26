import torch
import torch.nn as nn
from sklearn.metrics import f1_score

def evaluate(model, loader, device):
    model.eval()

    criterion = nn.CrossEntropyLoss()

    total_loss = 0
    correct = 0
    total = 0

    all_preds = []
    all_labels = []

    with torch.no_grad():
        for images, labels in loader:
            images = images.to(device)
            labels = labels.to(device)

            outputs = model(images)
            loss = criterion(outputs, labels)

            total_loss += loss.item()

            _, preds = torch.max(outputs, 1)

            correct += (preds == labels).sum().item()
            total += labels.size(0)

            all_preds.extend(preds.cpu().numpy())
            all_labels.extend(labels.cpu().numpy())

    accuracy = correct / total
    macro_f1 = f1_score(all_labels, all_preds, average="macro")

    avg_loss = total_loss / len(loader)

    return {
        "loss": avg_loss,
        "accuracy": accuracy,
        "macro_f1": macro_f1,
        "predictions": all_preds,
        "labels": all_labels
    }