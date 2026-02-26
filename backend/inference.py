import torch
from torchvision import transforms
from PIL import Image
from models.cnn import EmotionCNN
from src.utils import load_checkpoint

CLASS_NAMES = ['angry', 'disgust', 'fear', 'happy', 'neutral', 'sad', 'surprise']

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

transform = transforms.Compose([
    transforms.Grayscale(num_output_channels=1),
    transforms.Resize((48, 48)),
    transforms.ToTensor(),
    transforms.Normalize((0.5,), (0.5,))
])

def predict_image(image_path):
    model = EmotionCNN()
    load_checkpoint(model, "outputs/checkpoints/best_model.pth", device)
    model.to(device)
    model.eval()

    image = Image.open(image_path)
    image = transform(image).unsqueeze(0).to(device)

    with torch.no_grad():
        outputs = model(image)
        probs = torch.softmax(outputs, dim=1)
        confidence, pred = torch.max(probs, 1)

    return CLASS_NAMES[pred.item()], float(confidence.item())


if __name__ == "__main__":
    emotion, conf = predict_image("test.jpg")
    print(f"Prediction: {emotion} ({conf:.2%})")