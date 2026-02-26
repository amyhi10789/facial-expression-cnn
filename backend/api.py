from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
import torch
from PIL import Image
from io import BytesIO
from torchvision import transforms
from models.cnn import EmotionCNN
from src.utils import load_checkpoint
from openai import OpenAI
from dotenv import load_dotenv
import os

load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), ".env"))
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
print("KEY LOADED:", OPENAI_API_KEY)
client = OpenAI(api_key=OPENAI_API_KEY)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

CLASS_NAMES = ['angry', 'disgust', 'fear', 'happy', 'neutral', 'sad', 'surprised']

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

model = EmotionCNN()
load_checkpoint(model, "outputs/checkpoints/best_model.pth", device)
model.to(device)
model.eval()

transform = transforms.Compose([
    transforms.Grayscale(num_output_channels=1),
    transforms.Resize((48, 48)),
    transforms.ToTensor(),
    transforms.Normalize((0.5,), (0.5,))
])

@app.post("/predict")
async def predict(file: UploadFile = File(...)):

    image = Image.open(BytesIO(await file.read()))
    image = transform(image).unsqueeze(0).to(device)

    with torch.no_grad():
        outputs = model(image)
        probs = torch.softmax(outputs, dim=1)
        confidence, pred = torch.max(probs, 1)

    predicted_emotion = CLASS_NAMES[pred.item()]
    predicted_confidence = float(confidence.item())

    prob_dict = {
        CLASS_NAMES[i]: float(probs[0][i].item())
        for i in range(len(CLASS_NAMES))
    }

    prompt = f"""
    A facial emotion recognition CNN predicted:

    Primary emotion: {predicted_emotion}
    Confidence: {predicted_confidence:.2f}

    Full probability distribution:
    {prob_dict}

    Generate a concise, technically accurate but user-friendly explanation 
    describing what visible facial features could have contributed 
    to this classification.

    Only reference observable facial signals 
    (e.g., mouth curvature, eyebrow tension, eye openness).
    Do NOT speculate about identity, personality, or mental state.
    Keep it under 120 words.
    """

    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You explain AI model decisions clearly and responsibly."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
        )

        explanation = response.choices[0].message.content.strip()

    except Exception as e:
        explanation = "The model analyzed facial landmark structure and expression patterns to determine the most probable emotional classification."

    return {
        "emotion": predicted_emotion,
        "confidence": predicted_confidence,
        "probabilities": prob_dict,
        "explanation": explanation
    }