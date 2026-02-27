import torch
from models.cnn import EmotionCNN
from src.dataset import get_dataloaders
from src.train import train_model


def main():

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

    train_loader, val_loader = get_dataloaders("data/raw", batch_size=64)

    model = EmotionCNN()

    train_model(
        model,
        train_loader,
        val_loader,
        epochs=10,
        lr=1e-5,
        device=device
    )


if __name__ == "__main__":
    main()