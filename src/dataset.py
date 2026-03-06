import torch
from torchvision import datasets, transforms
from torch.utils.data import DataLoader, Subset
import random


def get_dataloaders(data_dir, batch_size=64, subset_ratio=1.0):

    train_transform = transforms.Compose([
        transforms.Grayscale(num_output_channels=1),
        transforms.Resize((48, 48)),
        transforms.ToTensor(),
        transforms.Normalize((0.5,), (0.5,))
    ])

    test_transform = transforms.Compose([
        transforms.Grayscale(num_output_channels=1),
        transforms.Resize((48, 48)),
        transforms.ToTensor(),
        transforms.Normalize((0.5,), (0.5,))
    ])

    train_dataset = datasets.ImageFolder(
        root=f"{data_dir}/train",
        transform=train_transform
    )

    test_dataset = datasets.ImageFolder(
        root=f"{data_dir}/test",
        transform=test_transform
    )

    if subset_ratio < 1.0:
        subset_size = int(subset_ratio * len(train_dataset))
        indices = random.sample(range(len(train_dataset)), subset_size)
        train_dataset = Subset(train_dataset, indices)

        print(f"🔥 FAST MODE: using {subset_size} samples")

    train_loader = DataLoader(
        train_dataset,
        batch_size=batch_size,
        shuffle=True,
        num_workers=4,
        pin_memory=True
    )

    test_loader = DataLoader(
        test_dataset,
        batch_size=batch_size,
        shuffle=False,
        num_workers=4,
        pin_memory=True
    )

    return train_loader, test_loader