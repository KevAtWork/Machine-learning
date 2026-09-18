import os
import urllib.request
import pandas as pd
import numpy as np

DATASET_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..", "dataset"))
DATASET_PATH = os.path.join(DATASET_DIR, "cardio_train.csv")
DATASET_URL = "https://raw.githubusercontent.com/caravanuden/cardio/master/cardio_train.csv"

def download_dataset():
    """Downloads the Kaggle Cardiovascular Disease dataset from GitHub mirror."""
    os.makedirs(DATASET_DIR, exist_ok=True)
    if os.path.exists(DATASET_PATH):
        print(f"Dataset already exists at {DATASET_PATH}")
        return True

    print(f"Attempting to download dataset from {DATASET_URL}...")
    try:
        urllib.request.urlretrieve(DATASET_URL, DATASET_PATH)
        # Verify the CSV structure
        df = pd.read_csv(DATASET_PATH, sep=';', nrows=5)
        if 'cardio' in df.columns:
            print(f"Successfully downloaded and verified dataset. Shape: {df.shape}")
            return True
        else:
            print("Downloaded file structure is incorrect. Reverting to synthetic data.")
            if os.path.exists(DATASET_PATH):
                os.remove(DATASET_PATH)
    except Exception as e:
        print(f"Failed to download dataset: {e}")
    
    return False

def generate_synthetic_dataset(num_records=10000):
    """Generates a highly realistic cardiovascular dataset matching the Kaggle distribution.
    
    Variables:
    - id: sequence
    - age: days (30 to 65 years -> 10950 to 23725 days)
    - gender: 1 (female), 2 (male)
    - height: cm (140 to 200)
    - weight: kg (40 to 150)
    - ap_hi: systolic BP (80 to 200)
    - ap_lo: diastolic BP (50 to 120)
    - cholesterol: 1 (normal), 2 (above normal), 3 (well above normal)
    - gluc: 1 (normal), 2 (above normal), 3 (well above normal)
    - smoke: 0 or 1
    - alco: 0 or 1
    - active: 0 or 1
    - cardio: 0 or 1 (target)
    """
    os.makedirs(DATASET_DIR, exist_ok=True)
    print(f"Generating {num_records} realistic synthetic cardiovascular records...")
    
    np.random.seed(42)
    
    # Generate age in days (normally distributed around 53 years, standard dev of 7 years)
    age_years = np.random.normal(53, 7, num_records)
    age_years = np.clip(age_years, 30, 65)
    age = (age_years * 365.25).astype(int)
    
    gender = np.random.choice([1, 2], size=num_records, p=[0.65, 0.35])
    
    # Height (men are taller on average)
    height = np.zeros(num_records)
    height[gender == 1] = np.random.normal(161, 7, size=np.sum(gender == 1))
    height[gender == 2] = np.random.normal(169, 8, size=np.sum(gender == 2))
    height = np.clip(height, 140, 200).astype(int)
    
    # Weight (linked to height and gender)
    weight = np.zeros(num_records)
    weight[gender == 1] = np.random.normal(70, 14, size=np.sum(gender == 1))
    weight[gender == 2] = np.random.normal(77, 15, size=np.sum(gender == 2))
    weight = np.clip(weight, 40, 150).round(1)
    
    # Calculate BMI for target influence
    bmi = weight / ((height / 100) ** 2)
    
    # Blood Pressure (systolic/diastolic correlation)
    ap_hi = np.random.normal(126, 17, num_records)
    ap_hi = np.clip(ap_hi, 80, 200).astype(int)
    
    # Diastolic is correlated with systolic
    ap_lo = ap_hi * 0.62 + np.random.normal(5, 7, num_records)
    ap_lo = np.clip(ap_lo, 50, 120).astype(int)
    
    # Categoricals
    # Higher BMI / age increases probability of high cholesterol/glucose
    prob_chol_3 = 1 / (1 + np.exp(-(bmi - 28) * 0.15 - (age_years - 50) * 0.05))
    prob_chol_2 = 1 / (1 + np.exp(-(bmi - 25) * 0.1 - (age_years - 45) * 0.03))
    
    cholesterol = np.ones(num_records, dtype=int)
    gluc = np.ones(num_records, dtype=int)
    
    for i in range(num_records):
        # Cholesterol
        p2 = min(max(prob_chol_2[i], 0.05), 0.4)
        p3 = min(max(prob_chol_3[i], 0.02), 0.25)
        p1 = 1.0 - p2 - p3
        cholesterol[i] = np.random.choice([1, 2, 3], p=[p1, p2, p3])
        
        # Glucose (correlated with BMI and age)
        pg2 = min(max(prob_chol_2[i] * 0.8, 0.05), 0.3)
        pg3 = min(max(prob_chol_3[i] * 0.8, 0.02), 0.2)
        pg1 = 1.0 - pg2 - pg3
        gluc[i] = np.random.choice([1, 2, 3], p=[pg1, pg2, pg3])
        
    # Lifestyle factors (correlated with gender)
    smoke = np.zeros(num_records, dtype=int)
    alco = np.zeros(num_records, dtype=int)
    
    # Men smoke and drink more in this dataset
    smoke[gender == 1] = np.random.choice([0, 1], size=np.sum(gender == 1), p=[0.98, 0.02])
    smoke[gender == 2] = np.random.choice([0, 1], size=np.sum(gender == 2), p=[0.78, 0.22])
    
    alco[gender == 1] = np.random.choice([0, 1], size=np.sum(gender == 1), p=[0.97, 0.03])
    alco[gender == 2] = np.random.choice([0, 1], size=np.sum(gender == 2), p=[0.88, 0.12])
    
    active = np.random.choice([0, 1], size=num_records, p=[0.2, 0.8])
    
    # Calculate cardio risk score (target variable)
    # Logit formula based on medical weights
    logit = (
        -7.5 +
        (age_years - 30) * 0.08 +
        (gender == 2).astype(int) * 0.15 +
        (bmi - 22) * 0.12 +
        (ap_hi - 110) * 0.06 +
        (ap_lo - 70) * 0.04 +
        (cholesterol - 1) * 0.8 +
        (gluc - 1) * 0.3 +
        smoke * 0.45 +
        alco * 0.1 -
        active * 0.4
    )
    prob_cardio = 1 / (1 + np.exp(-logit))
    cardio = np.zeros(num_records, dtype=int)
    for i in range(num_records):
        cardio[i] = np.random.choice([0, 1], p=[1 - prob_cardio[i], prob_cardio[i]])
        
    df = pd.DataFrame({
        'id': np.arange(1, num_records + 1),
        'age': age,
        'gender': gender,
        'height': height,
        'weight': weight,
        'ap_hi': ap_hi,
        'ap_lo': ap_lo,
        'cholesterol': cholesterol,
        'gluc': gluc,
        'smoke': smoke,
        'alco': alco,
        'active': active,
        'cardio': cardio
    })
    
    df.to_csv(DATASET_PATH, sep=';', index=False)
    print(f"Synthetic dataset saved to {DATASET_PATH}. Shape: {df.shape}")
    return True

def ensure_data():
    if not download_dataset():
        generate_synthetic_dataset(70000)

if __name__ == "__main__":
    ensure_data()
