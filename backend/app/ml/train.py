import os
import time
import json
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
import joblib

# ML Models
from sklearn.model_selection import train_test_split, KFold, cross_val_score, GridSearchCV
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, roc_auc_score, confusion_matrix

from sklearn.linear_model import LogisticRegression
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier, ExtraTreesClassifier, GradientBoostingClassifier, AdaBoostClassifier
from sklearn.neighbors import KNeighborsClassifier
from sklearn.naive_bayes import GaussianNB
from sklearn.svm import LinearSVC
from sklearn.neural_network import MLPClassifier

# Advanced booster imports are executed dynamically to avoid start crashes if library compiling is incomplete
xgboost_installed = False
lightgbm_installed = False
catboost_installed = False

# Custom modules
from backend.app.ml.download_data import ensure_data, DATASET_PATH
from backend.app.ml.preprocess import MedicalPreprocessor, inspect_dataset
from backend.app.ml.scratch_lr import ScratchLogisticRegression

# Paths
SAVED_MODELS_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..", "saved_models"))
GRAPHS_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..", "graphs"))
REPORTS_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..", "reports"))

os.makedirs(SAVED_MODELS_DIR, exist_ok=True)
os.makedirs(GRAPHS_DIR, exist_ok=True)
os.makedirs(REPORTS_DIR, exist_ok=True)

def generate_eda_plots(df):
    """Generates and saves the required EDA visualizations."""
    print("Generating exploratory data analysis plots...")
    sns.set_theme(style="dark", rc={"axes.facecolor": "#18181B", "figure.facecolor": "#09090B", "text.color": "#FFFFFF", "axes.labelcolor": "#FFFFFF", "xtick.color": "#A1A1AA", "ytick.color": "#A1A1AA"})
    
    # 1. Target Variable (Cardio) Distribution
    plt.figure(figsize=(6, 5))
    ax = sns.countplot(x='cardio', data=df, palette=['#6366F1', '#EF4444'])
    plt.title("Cardiovascular Disease Distribution", color='white', fontsize=14, pad=15)
    plt.xlabel("Presence of Disease (0: No, 1: Yes)", color='white')
    plt.ylabel("Patient Count", color='white')
    ax.set_xticklabels(['Healthy', 'Cardiovascular Disease'])
    plt.tight_layout()
    plt.savefig(os.path.join(GRAPHS_DIR, "target_distribution.png"), facecolor='#09090B')
    plt.close()

    # 2. Age Distribution (converted to years)
    plt.figure(figsize=(8, 5))
    age_years = df['age'] / 365.25
    sns.histplot(age_years, bins=30, kde=True, color='#6366F1', facecolor='#6366F1', alpha=0.6)
    plt.title("Patient Age Distribution", color='white', fontsize=14, pad=15)
    plt.xlabel("Age (Years)", color='white')
    plt.ylabel("Density", color='white')
    plt.tight_layout()
    plt.savefig(os.path.join(GRAPHS_DIR, "age_distribution.png"), facecolor='#09090B')
    plt.close()

    # 3. BMI Distribution
    plt.figure(figsize=(8, 5))
    bmi = df['weight'] / ((df['height'] / 100) ** 2)
    bmi_clipped = np.clip(bmi, 15, 50) # Clip for aesthetics
    sns.histplot(bmi_clipped, bins=30, kde=True, color='#22C55E', facecolor='#22C55E', alpha=0.6)
    plt.title("BMI (Body Mass Index) Distribution", color='white', fontsize=14, pad=15)
    plt.xlabel("BMI (kg/m²)", color='white')
    plt.ylabel("Density", color='white')
    plt.tight_layout()
    plt.savefig(os.path.join(GRAPHS_DIR, "bmi_distribution.png"), facecolor='#09090B')
    plt.close()

    # 4. Blood Pressure Distribution (Systolic vs Diastolic Boxplots)
    plt.figure(figsize=(8, 5))
    # Filter physical outliers for plotting clarity
    bp_df = df[(df['ap_hi'] >= 70) & (df['ap_hi'] <= 220) & (df['ap_lo'] >= 40) & (df['ap_lo'] <= 140)]
    bp_melt = pd.melt(bp_df, value_vars=['ap_hi', 'ap_lo'], var_name='BP_Type', value_name='Pressure')
    ax = sns.boxplot(x='BP_Type', y='Pressure', data=bp_melt, palette=['#EF4444', '#F59E0B'])
    plt.title("Blood Pressure Distribution (Systolic & Diastolic)", color='white', fontsize=14, pad=15)
    plt.xlabel("Blood Pressure Measure", color='white')
    plt.ylabel("Value (mmHg)", color='white')
    ax.set_xticklabels(['Systolic (ap_hi)', 'Diastolic (ap_lo)'])
    plt.tight_layout()
    plt.savefig(os.path.join(GRAPHS_DIR, "blood_pressure_boxplot.png"), facecolor='#09090B')
    plt.close()

    # 5. Cholesterol & Glucose Analysis vs Target
    fig, axes = plt.subplots(1, 2, figsize=(14, 6))
    
    # Cholesterol Countplot colored by Cardio
    sns.countplot(ax=axes[0], x='cholesterol', hue='cardio', data=df, palette=['#22C55E', '#EF4444'])
    axes[0].set_title("Cholesterol Levels vs Cardiovascular Disease", color='white', fontsize=12)
    axes[0].set_xlabel("Cholesterol Level (1: Normal, 2: High, 3: Very High)", color='white')
    axes[0].set_ylabel("Count", color='white')
    axes[0].legend(['Healthy', 'Cardio Case'], facecolor='#18181B', edgecolor='#A1A1AA')
    
    # Glucose Countplot colored by Cardio
    sns.countplot(ax=axes[1], x='gluc', hue='cardio', data=df, palette=['#22C55E', '#EF4444'])
    axes[1].set_title("Glucose Levels vs Cardiovascular Disease", color='white', fontsize=12)
    axes[1].set_xlabel("Glucose Level (1: Normal, 2: High, 3: Very High)", color='white')
    axes[1].set_ylabel("Count", color='white')
    axes[1].legend(['Healthy', 'Cardio Case'], facecolor='#18181B', edgecolor='#A1A1AA')
    
    plt.tight_layout()
    plt.savefig(os.path.join(GRAPHS_DIR, "cholesterol_glucose_analysis.png"), facecolor='#09090B')
    plt.close()

    # 6. Lifestyle Risks (Smoking, Alcohol, Activity)
    fig, axes = plt.subplots(1, 3, figsize=(18, 5))
    
    sns.barplot(ax=axes[0], x='smoke', y='cardio', data=df, ci=None, palette=['#6366F1'])
    axes[0].set_title("Cardio Risk by Smoking", color='white', fontsize=12)
    axes[0].set_xlabel("Smoking Status (0: No, 1: Yes)", color='white')
    axes[0].set_ylabel("Cardio Occurrence Probability", color='white')
    axes[0].set_ylim(0, 1)

    sns.barplot(ax=axes[1], x='alco', y='cardio', data=df, ci=None, palette=['#F59E0B'])
    axes[1].set_title("Cardio Risk by Alcohol Consumption", color='white', fontsize=12)
    axes[1].set_xlabel("Alcohol Intake (0: No, 1: Yes)", color='white')
    axes[1].set_ylabel("Cardio Occurrence Probability", color='white')
    axes[1].set_ylim(0, 1)

    sns.barplot(ax=axes[2], x='active', y='cardio', data=df, ci=None, palette=['#22C55E'])
    axes[2].set_title("Cardio Risk by Physical Activity", color='white', fontsize=12)
    axes[2].set_xlabel("Active Lifestyle (0: No, 1: Yes)", color='white')
    axes[2].set_ylabel("Cardio Occurrence Probability", color='white')
    axes[2].set_ylim(0, 1)

    plt.tight_layout()
    plt.savefig(os.path.join(GRAPHS_DIR, "lifestyle_risks_analysis.png"), facecolor='#09090B')
    plt.close()

    # 7. Correlation Heatmap
    p = MedicalPreprocessor()
    df_temp = p.fit_transform(df)
    features = p.get_feature_names()
    corr_cols = features + ['cardio']
    corr_matrix = df_temp[corr_cols].corr()

    plt.figure(figsize=(14, 11))
    sns.heatmap(corr_matrix, annot=True, fmt=".2f", cmap="coolwarm", center=0,
                cbar_kws={'label': 'Correlation Coefficient'}, annot_kws={"size": 8})
    plt.title("Cardiovascular Feature Correlation Heatmap", color='white', fontsize=16, pad=20)
    plt.tight_layout()
    plt.savefig(os.path.join(GRAPHS_DIR, "correlation_heatmap.png"), facecolor='#09090B')
    plt.close()
    
    print("EDA plots successfully generated and saved.")

def evaluate_model(model, name, X_train, X_test, y_train, y_test):
    """Fits and evaluates a single model, returning performance statistics."""
    print(f"Training and evaluating: {name}...")
    start_train = time.time()
    model.fit(X_train, y_train)
    end_train = time.time()
    train_time = end_train - start_train
    
    start_pred = time.time()
    y_pred = model.predict(X_test)
    end_pred = time.time()
    pred_time = end_pred - start_pred
    
    # Probabilities for ROC AUC
    if hasattr(model, "predict_proba"):
        y_prob = model.predict_proba(X_test)[:, 1]
    else:
        # Decision function fallback or mock
        if hasattr(model, "decision_function"):
            y_prob = model.decision_function(X_test)
            # Normalize to 0-1 range
            y_prob = (y_prob - y_prob.min()) / (y_prob.max() - y_prob.min() + 1e-15)
        else:
            y_prob = y_pred.astype(float)
            
    # Calculate Metrics
    accuracy = accuracy_score(y_test, y_pred)
    precision = precision_score(y_test, y_pred, zero_division=0)
    recall = recall_score(y_test, y_pred, zero_division=0)
    f1 = f1_score(y_test, y_pred, zero_division=0)
    try:
        roc_auc = roc_auc_score(y_test, y_prob)
    except Exception:
        roc_auc = accuracy
        
    cm = confusion_matrix(y_test, y_pred).tolist()
    
    # 3-Fold Cross-Validation for computational speed on larger dataset
    cv = KFold(n_splits=3, shuffle=True, random_state=42)
    try:
        # Avoid CV on custom scratch LR if speed/grid issues arise, but we support it
        cv_scores = cross_val_score(model, X_train, y_train, cv=cv, scoring='accuracy')
        cv_mean = float(np.mean(cv_scores))
    except Exception as e:
        print(f"Warning: CV failed for {name} ({e}). Defaulting to standard accuracy.")
        cv_mean = float(accuracy)
        
    return {
        "Accuracy": float(accuracy),
        "Precision": float(precision),
        "Recall": float(recall),
        "F1 Score": float(f1),
        "ROC AUC": float(roc_auc),
        "CV Score": cv_mean,
        "Training Time": float(train_time),
        "Prediction Time": float(pred_time),
        "Confusion Matrix": cm
    }

def run_model_comparison(X_train, X_test, y_train, y_test):
    """Benchmarks multiple classifiers and outputs comparison results."""
    global xgboost_installed, lightgbm_installed, catboost_installed
    
    # List of baseline classifiers to evaluate (always available in sklearn)
    models = {
        "Logistic Regression": LogisticRegression(max_iter=1000, random_state=42),
        "Decision Tree": DecisionTreeClassifier(max_depth=6, random_state=42),
        "Random Forest": RandomForestClassifier(n_estimators=100, max_depth=8, random_state=42, n_jobs=-1),
        "Extra Trees": ExtraTreesClassifier(n_estimators=100, max_depth=8, random_state=42, n_jobs=-1),
        "Gradient Boosting": GradientBoostingClassifier(n_estimators=100, learning_rate=0.1, max_depth=4, random_state=42),
        "AdaBoost": AdaBoostClassifier(n_estimators=50, random_state=42),
        "KNN": KNeighborsClassifier(n_neighbors=9, n_jobs=-1),
        "Naive Bayes": GaussianNB(),
        "Support Vector Machine": LinearSVC(max_iter=2000, dual=False, random_state=42),
        "Neural Network (MLP)": MLPClassifier(hidden_layer_sizes=(64, 32), max_iter=300, random_state=42, early_stopping=True),
        "Logistic Regression from Scratch": ScratchLogisticRegression(learning_rate=0.05, epochs=500)
    }

    # Try loading XGBoost
    try:
        import xgboost as xgb
        models["XGBoost"] = xgb.XGBClassifier(n_estimators=100, max_depth=5, learning_rate=0.1, random_state=42, verbosity=0, n_jobs=-1)
        xgboost_installed = True
        print("XGBoost library successfully imported and verified.")
    except Exception as e:
        print(f"Skipping XGBoost (installation pending or compilation failed: {e})")

    # Try loading LightGBM
    try:
        import lightgbm as lgb
        models["LightGBM"] = lgb.LGBMClassifier(n_estimators=100, max_depth=5, learning_rate=0.1, random_state=42, verbosity=-1, n_jobs=-1)
        lightgbm_installed = True
        print("LightGBM library successfully imported.")
    except Exception as e:
        print(f"Skipping LightGBM ({e})")

    # Try loading CatBoost
    try:
        from catboost import CatBoostClassifier
        models["CatBoost"] = CatBoostClassifier(iterations=100, depth=5, learning_rate=0.1, random_seed=42, verbose=0)
        catboost_installed = True
        print("CatBoost library successfully imported.")
    except Exception as e:
        print(f"Skipping CatBoost ({e})")

    comparison_results = {}
    
    for name, model in models.items():
        try:
            metrics = evaluate_model(model, name, X_train, X_test, y_train, y_test)
            comparison_results[name] = metrics
        except Exception as e:
            print(f"Error evaluating model {name}: {e}")
            
    # Save comparison to disk
    with open(os.path.join(SAVED_MODELS_DIR, "model_comparison.json"), "w") as f:
        json.dump(comparison_results, f, indent=4)
        
    return comparison_results

def tune_best_model(X_train, y_train):
    """Performs parameter tuning on the top-performing ensemble classifier."""
    global xgboost_installed
    
    if xgboost_installed:
        print("Performing hyperparameter optimization for XGBoost using GridSearch...")
        import xgboost as xgb
        param_grid = {
            'max_depth': [4, 6],
            'learning_rate': [0.05, 0.1],
            'n_estimators': [100, 150]
        }
        base_model = xgb.XGBClassifier(random_state=42, verbosity=0, n_jobs=-1)
        grid_search = GridSearchCV(base_model, param_grid, cv=3, scoring='accuracy', n_jobs=-1)
        grid_search.fit(X_train, y_train)
        print(f"Best Hyperparameters: {grid_search.best_params_}")
        return grid_search.best_estimator_
    else:
        print("XGBoost not available. Tuning Random Forest Classifier as fallback...")
        param_grid = {
            'max_depth': [6, 8],
            'n_estimators': [100, 150]
        }
        base_model = RandomForestClassifier(random_state=42, n_jobs=-1)
        grid_search = GridSearchCV(base_model, param_grid, cv=3, scoring='accuracy', n_jobs=-1)
        grid_search.fit(X_train, y_train)
        print(f"Best Fallback Hyperparameters: {grid_search.best_params_}")
        return grid_search.best_estimator_

def build_and_train():
    # 1. Ensure raw dataset exists
    ensure_data()
    
    # 2. Read dataset
    df = pd.read_csv(DATASET_PATH, sep=';')
    print(f"Loaded dataset: {df.shape}")
    
    # Generate EDA visuals
    generate_eda_plots(df)
    
    # 3. Fit preprocessing pipeline
    preprocessor = MedicalPreprocessor()
    df_processed = preprocessor.fit_transform(df)
    
    # Save the fitted preprocessor
    joblib.dump(preprocessor, os.path.join(SAVED_MODELS_DIR, "preprocessor.joblib"))
    print("Preprocessing pipeline fitted and saved successfully.")
    
    # 4. Split data
    feature_names = preprocessor.get_feature_names()
    X = df_processed[feature_names]
    y = df_processed['cardio']
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
    
    # 5. Run comparison
    comparison = run_model_comparison(X_train, X_test, y_train, y_test)
    
    # Print metrics table formatted
    print("\n" + "="*80)
    print(f"{'Model Name':<35} | {'Accuracy':<10} | {'F1 Score':<10} | {'ROC AUC':<10} | {'CV Score':<10}")
    print("="*80)
    for model_name, metrics in comparison.items():
        print(f"{model_name:<35} | {metrics['Accuracy']:.4f}     | {metrics['F1 Score']:.4f}     | {metrics['ROC AUC']:.4f}     | {metrics['CV Score']:.4f}")
    print("="*80 + "\n")
    
    # 6. Fine-tune best classifier (XGBoost is typically highly suitable for cardiovascular tabular features)
    best_tuned = tune_best_model(X_train, y_train)
    
    # Retest best tuned model
    best_tuned.fit(X_train, y_train)
    final_preds = best_tuned.predict(X_test)
    final_acc = accuracy_score(y_test, final_preds)
    print(f"Final Best Tuned Model Accuracy: {final_acc:.4f}")
    
    # Save final model
    joblib.dump(best_tuned, os.path.join(SAVED_MODELS_DIR, "best_model.joblib"))
    print(f"Best model saved to {os.path.join(SAVED_MODELS_DIR, 'best_model.joblib')}")

if __name__ == "__main__":
    build_and_train()
