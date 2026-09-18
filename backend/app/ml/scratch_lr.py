import numpy as np

class ScratchLogisticRegression:
    """Logistic Regression implemented from scratch using NumPy.
    
    Supports:
    - Gradient Descent optimization
    - Binary Cross-Entropy cost tracking
    - Predict & predict_proba methods compatible with scikit-learn API
    """
    def __init__(self, learning_rate=0.01, epochs=1000, verbose=False):
        self.learning_rate = learning_rate
        self.epochs = epochs
        self.verbose = verbose
        self.weights = None
        self.bias = None
        self.cost_history = []
        self.classes_ = np.array([0, 1])

    def _sigmoid(self, z):
        # Clip to prevent overflow issues in exp
        z_clipped = np.clip(z, -500, 500)
        return 1.0 / (1.0 + np.exp(-z_clipped))

    def _compute_cost(self, X, y, y_pred):
        m = len(y)
        # Add epsilon to prevent division by zero in log(0)
        epsilon = 1e-15
        y_pred = np.clip(y_pred, epsilon, 1 - epsilon)
        cost = - (1 / m) * np.sum(y * np.log(y_pred) + (1 - y) * np.log(1 - y_pred))
        return cost

    def fit(self, X, y):
        """Fits the model to training data using Gradient Descent."""
        # Convert pandas DataFrame or Series to numpy arrays if necessary
        if hasattr(X, "values"):
            X = X.values
        if hasattr(y, "values"):
            y = y.values
            
        m, n = X.shape
        # Initialize parameters
        self.weights = np.zeros(n)
        self.bias = 0.0
        self.cost_history = []

        # Gradient Descent loop
        for epoch in range(self.epochs):
            # Forward pass: compute linear combination and sigmoid activation
            z = np.dot(X, self.weights) + self.bias
            y_pred = self._sigmoid(z)
            
            # Compute Cost
            cost = self._compute_cost(X, y, y_pred)
            self.cost_history.append(cost)
            
            # Backpropagation: Compute gradients
            dw = (1 / m) * np.dot(X.T, (y_pred - y))
            db = (1 / m) * np.sum(y_pred - y)
            
            # Parameter Updates
            self.weights -= self.learning_rate * dw
            self.bias -= self.learning_rate * db
            
            if self.verbose and epoch % (self.epochs // 10 or 1) == 0:
                print(f"Epoch {epoch}/{self.epochs} - Cost: {cost:.6f}")

        return self

    def predict_proba(self, X):
        """Predicts probabilities of the positive class (1)."""
        if self.weights is None or self.bias is None:
            raise ValueError("Model is not trained yet. Call fit first.")
            
        if hasattr(X, "values"):
            X = X.values
            
        z = np.dot(X, self.weights) + self.bias
        prob = self._sigmoid(z)
        
        # Format as [P(class=0), P(class=1)] to match sklearn interface
        return np.column_stack((1 - prob, prob))

    def predict(self, X):
        """Predicts class labels (0 or 1)."""
        probabilities = self.predict_proba(X)[:, 1]
        return (probabilities >= 0.5).astype(int)

    def score(self, X, y):
        """Computes the mean accuracy on given test data and labels."""
        predictions = self.predict(X)
        if hasattr(y, "values"):
            y = y.values
        return np.mean(predictions == y)

    def get_params(self, deep=True):
        """Required for scikit-learn model compatibility (GridSearchCV)."""
        return {
            "learning_rate": self.learning_rate,
            "epochs": self.epochs,
            "verbose": self.verbose
        }

    def set_params(self, **params):
        """Required for scikit-learn model compatibility (GridSearchCV)."""
        for parameter, value in params.items():
            setattr(self, parameter, value)
        return self
