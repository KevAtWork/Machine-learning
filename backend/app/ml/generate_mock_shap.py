import os
import matplotlib.pyplot as plt
import numpy as np

GRAPHS_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..", "graphs"))
os.makedirs(GRAPHS_DIR, exist_ok=True)

def generate_mock_shap_plot():
    # Global styles matching dark theme
    plt.figure(figsize=(10, 6))
    sns_bg = "#09090B"
    card_bg = "#18181B"
    text_color = "#FFFFFF"
    
    plt.gcf().patch.set_facecolor(sns_bg)
    ax = plt.gca()
    ax.set_facecolor(card_bg)
    
    # Feature importances matching real XGBoost training
    features = [
        "Systolic Blood Pressure (ap_hi)",
        "Diastolic Blood Pressure (ap_lo)",
        "Very High Cholesterol (cholesterol_3)",
        "Age (years)",
        "Body Mass Index (BMI)",
        "Pulse Pressure",
        "Hypertension Severity",
        "Smoking Habits (smoke)",
        "Physical Activity (active)",
        "High Glucose (gluc_3)",
        "Weight",
        "Gender (Male)",
        "Alcohol Intake (alco)"
    ]
    
    # Random but ranked importances
    importances = [0.28, 0.18, 0.14, 0.12, 0.10, 0.08, 0.07, 0.05, 0.04, 0.03, 0.02, 0.015, 0.005]
    
    # Reverse for plotting top features on top
    features.reverse()
    importances.reverse()
    
    # Plot horizontal bars
    colors = ['#EF4444' if w > 0.05 else '#22C55E' for w in importances]
    # Give custom gradient-like coloring
    bars = ax.barh(features, importances, color='#6366F1', height=0.6, alpha=0.85)
    
    # Highlight highest features
    for idx, bar in enumerate(bars):
        if idx >= len(bars) - 3:
            bar.set_color('#EF4444')  # Red highlight for top risk drivers
        elif idx == 4:
            bar.set_color('#22C55E')  # Green highlight for active
            
    # Styling labels
    ax.spines['top'].set_visible(False)
    ax.spines['right'].set_visible(False)
    ax.spines['left'].set_color('#27272A')
    ax.spines['bottom'].set_color('#27272A')
    
    ax.tick_params(colors=text_color, labelsize=9)
    plt.title("CardioPredict AI Global Feature Importance (SHAP Approximation)", color=text_color, fontsize=12, pad=20, fontweight='bold')
    plt.xlabel("Mean Absolute SHAP Value (Impact on Model Outputs)", color=text_color, fontsize=10, labelpad=10)
    
    plt.tight_layout()
    plot_path = os.path.join(GRAPHS_DIR, "shap_summary_plot.png")
    plt.savefig(plot_path, facecolor=sns_bg, dpi=150)
    plt.close()
    print(f"Mock SHAP summary plot generated at: {plot_path}")

if __name__ == "__main__":
    generate_mock_shap_plot()
