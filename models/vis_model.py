import torch
from torchviz import make_dot
from cnn import EmotionCNN

model = EmotionCNN()
model.eval()

x = torch.randn(1, 1, 48, 48)
y = model(x)

make_dot(y, params=dict(model.named_parameters())).render("emotion_cnn", format="png")