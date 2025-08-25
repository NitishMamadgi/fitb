import torch
import torch.nn as nn
import torch.optim as optim

# Create a random input tensor (batch_size=4, features=3)
x = torch.randn(4, 3)

# Define a simple linear model: y = Wx + b
model = nn.Linear(in_features=3, out_features=2)

# Define a loss function (Mean Squared Error)
loss_fn = nn.MSELoss()


optimizer = optim.SGD(model.parameters(), lr=0.01) # Define an optimizer (Stochastic Gradient Descent)

# Forward pass: compute predictions
y_pred = model(x)

# Compute dummy target tensor (same shape as output)
y_true = torch.randn(4, 2)

# Compute loss
loss = loss_fn(y_pred, y_true)

# Backpropagation: compute gradients
loss.backward()

# Update model parameters
optimizer.step()

print("Loss:", loss.item())
