import os
import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler, MinMaxScaler
from sklearn.decomposition import PCA
import joblib

DATASET_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..", "dataset"))
DATASET_PATH = os.path.join(DATASET_DIR, "cardio_train.csv")
SAVED_MODELS_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..", "saved_models"))

class MedicalPreprocessor:
    def __init__(self, scaling_method="standard", n_components=None):
        self.scaling_method = scaling_method
        self.n_components = n_components
        
        # Initalize scaling, encoding, and PCA
        self.scaler = StandardScaler() if scaling_method == "standard" else MinMaxScaler()
        self.pca = PCA(n_components=n_components) if n_components else None
        
        # Track statistics for imputation and outlier handling
        self.medians = {}
        self.modes = {}
        self.iqr_bounds = {}
        self.z_bounds = {}
        self.columns_to_scale = ['age_years', 'height', 'weight', 'ap_hi', 'ap_lo', 'bmi', 'pulse_pressure']
        self.columns_to_encode = ['cholesterol', 'gluc']
        self.fitted = False

    def fit(self, df):
        """Learns preprocessing statistics from the training DataFrame."""
        # Work on a copy
        df_copy = df.copy()
        
        # 1. Clean blood pressure and health parameters (Basic outlier cleaning before profiling)
        df_copy = self._clean_physiological_boundaries(df_copy)
        
        # 2. Imputation statistics
        for col in df_copy.columns:
            if df_copy[col].dtype in [np.float64, np.int64]:
                self.medians[col] = df_copy[col].median()
            else:
                self.modes[col] = df_copy[col].mode()[0] if not df_copy[col].mode().empty else df_copy[col].iloc[0]

        # 3. Feature Engineering
        df_feats = self._engineer_features(df_copy)
        
        # 4. Outlier Bounds (IQR and Z-score limits on numerical variables)
        for col in self.columns_to_scale:
            if col in df_feats.columns:
                # IQR bounds
                q1 = df_feats[col].quantile(0.25)
                q3 = df_feats[col].quantile(0.75)
                iqr = q3 - q1
                self.iqr_bounds[col] = (q1 - 1.5 * iqr, q3 + 1.5 * iqr)
                
                # Z-score bounds (3 standard deviations)
                mean = df_feats[col].mean()
                std = df_feats[col].std()
                self.z_bounds[col] = (mean - 3 * std, mean + 3 * std)

        # 5. Fit Scaling
        # Pre-generate encoded columns to know their structure
        df_encoded = self._encode_categorical(df_feats)
        
        # Scale numerical columns
        self.scaler.fit(df_encoded[self.columns_to_scale])
        
        # 6. Fit PCA if components are set
        if self.pca:
            # We scale the columns first
            df_scaled = df_encoded.copy()
            df_scaled[self.columns_to_scale] = self.scaler.transform(df_encoded[self.columns_to_scale])
            features_for_pca = [c for c in df_scaled.columns if c not in ['id', 'cardio']]
            self.pca.fit(df_scaled[features_for_pca])
            
        self.fitted = True
        return self

    def transform(self, df, apply_outlier_clipping=True):
        """Transforms a raw input DataFrame using the learned statistics."""
        if not self.fitted:
            raise ValueError("Preprocessor has not been fitted yet. Call fit first.")
            
        df_copy = df.copy()
        
        # 1. Impute missing values
        for col in df_copy.columns:
            if df_copy[col].isnull().sum() > 0:
                if col in self.medians:
                    df_copy[col] = df_copy[col].fillna(self.medians[col])
                elif col in self.modes:
                    df_copy[col] = df_copy[col].fillna(self.modes[col])
                    
        # 2. Clean extreme physical violations (e.g., negative weights, diastolic > systolic)
        df_copy = self._clean_physiological_boundaries(df_copy)
        
        # 3. Engineer Features
        df_feats = self._engineer_features(df_copy)
        
        # 4. Outlier Handling (Clip outliers to IQR bounds to prevent predictions going crazy)
        if apply_outlier_clipping:
            for col in self.columns_to_scale:
                if col in df_feats.columns and col in self.iqr_bounds:
                    lower, upper = self.iqr_bounds[col]
                    df_feats[col] = np.clip(df_feats[col], lower, upper)
                    
        # 5. Encode Categoricals
        df_encoded = self._encode_categorical(df_feats)
        
        # 6. Scale numerical features
        df_encoded[self.columns_to_scale] = self.scaler.transform(df_encoded[self.columns_to_scale])
        
        # 7. Apply PCA if enabled
        if self.pca:
            features_for_pca = [c for c in df_encoded.columns if c not in ['id', 'cardio']]
            pca_feats = self.pca.transform(df_encoded[features_for_pca])
            pca_cols = [f'pca_{i}' for i in range(self.n_components)]
            df_pca = pd.DataFrame(pca_feats, columns=pca_cols, index=df_encoded.index)
            if 'cardio' in df_encoded.columns:
                df_pca['cardio'] = df_encoded['cardio']
            if 'id' in df_encoded.columns:
                df_pca['id'] = df_encoded['id']
            return df_pca
            
        return df_encoded

    def fit_transform(self, df):
        return self.fit(df).transform(df)

    def _clean_physiological_boundaries(self, df):
        """Cleans clinically impossible readings (standardizes blood pressure errors)."""
        df_copy = df.copy()
        
        # Semicolon cardio dataset values are sometimes multiplied by 10 or 100
        if 'ap_hi' in df_copy.columns:
            # Absolute and clip logic
            df_copy['ap_hi'] = df_copy['ap_hi'].abs()
            # If high values represent typos (e.g. 12000, 1600), divide out
            df_copy['ap_hi'] = df_copy['ap_hi'].apply(lambda x: x / 100 if x >= 1000 else (x / 10 if x >= 300 else x))
            # Boundaries: standard human limits
            df_copy['ap_hi'] = np.clip(df_copy['ap_hi'], 60, 250)
            
        if 'ap_lo' in df_copy.columns:
            df_copy['ap_lo'] = df_copy['ap_lo'].abs()
            df_copy['ap_lo'] = df_copy['ap_lo'].apply(lambda x: x / 100 if x >= 1000 else (x / 10 if x >= 200 else x))
            df_copy['ap_lo'] = np.clip(df_copy['ap_lo'], 40, 180)
            
        # Ensure systolic is greater than diastolic
        if 'ap_hi' in df_copy.columns and 'ap_lo' in df_copy.columns:
            mask = df_copy['ap_hi'] < df_copy['ap_lo']
            if mask.sum() > 0:
                # Swap values where they are inverted
                temp = df_copy.loc[mask, 'ap_hi'].copy()
                df_copy.loc[mask, 'ap_hi'] = df_copy.loc[mask, 'ap_lo']
                df_copy.loc[mask, 'ap_lo'] = temp
                
        # Height/Weight checks
        if 'height' in df_copy.columns:
            df_copy['height'] = np.clip(df_copy['height'], 100, 250)
        if 'weight' in df_copy.columns:
            df_copy['weight'] = np.clip(df_copy['weight'], 30, 250)
            
        return df_copy

    def _engineer_features(self, df):
        """Performs feature engineering on the cleaned dataset."""
        df_copy = df.copy()
        
        # Age conversion: days to years
        if 'age' in df_copy.columns:
            df_copy['age_years'] = df_copy['age'] / 365.25
        else:
            # Default if age not found but age_years given
            if 'age_years' not in df_copy.columns:
                df_copy['age_years'] = 50.0
                
        # Body Mass Index (BMI) = weight (kg) / height (m)^2
        if 'height' in df_copy.columns and 'weight' in df_copy.columns:
            height_m = df_copy['height'] / 100.0
            df_copy['bmi'] = df_copy['weight'] / (height_m ** 2)
            # Clip BMI to realistic bounds
            df_copy['bmi'] = np.clip(df_copy['bmi'], 12, 60)
        else:
            df_copy['bmi'] = 25.0
            
        # Pulse Pressure = Systolic BP - Diastolic BP
        if 'ap_hi' in df_copy.columns and 'ap_lo' in df_copy.columns:
            df_copy['pulse_pressure'] = df_copy['ap_hi'] - df_copy['ap_lo']
        else:
            df_copy['pulse_pressure'] = 40.0
            
        # Hypertension Stage categorizations
        # 0: Normal (sys < 120 and dia < 80)
        # 1: Elevated (sys 120-129 and dia < 80)
        # 2: Stage 1 Hypertension (sys 130-139 or dia 80-89)
        # 3: Stage 2 Hypertension (sys >= 140 or dia >= 90)
        if 'ap_hi' in df_copy.columns and 'ap_lo' in df_copy.columns:
            conditions = [
                (df_copy['ap_hi'] < 120) & (df_copy['ap_lo'] < 80),
                ((df_copy['ap_hi'] >= 120) & (df_copy['ap_hi'] < 130)) & (df_copy['ap_lo'] < 80),
                ((df_copy['ap_hi'] >= 130) & (df_copy['ap_hi'] < 140)) | ((df_copy['ap_lo'] >= 80) & (df_copy['ap_lo'] < 90)),
                (df_copy['ap_hi'] >= 140) | (df_copy['ap_lo'] >= 90)
            ]
            choices = [0, 1, 2, 3]
            df_copy['hypertension_stage'] = np.select(conditions, choices, default=3)
        else:
            df_copy['hypertension_stage'] = 0
            
        # Age-related risk groups (Young, Middle, Senior, Elderly)
        if 'age_years' in df_copy.columns:
            age_conds = [
                df_copy['age_years'] < 40,
                (df_copy['age_years'] >= 40) & (df_copy['age_years'] < 50),
                (df_copy['age_years'] >= 50) & (df_copy['age_years'] < 60),
                df_copy['age_years'] >= 60
            ]
            age_choices = [0, 1, 2, 3] # Representing age bands
            df_copy['age_group'] = np.select(age_conds, age_choices, default=2)
        else:
            df_copy['age_group'] = 2
            
        return df_copy

    def _encode_categorical(self, df):
        """Performs manual one-hot encoding for categorical variables (cholesterol, gluc)."""
        df_copy = df.copy()
        
        # Encode cholesterol (1: normal, 2: above normal, 3: well above normal)
        # We explicitly map dummy variables to keep model inputs consistent
        for val in [1, 2, 3]:
            df_copy[f'cholesterol_{val}'] = (df_copy['cholesterol'] == val).astype(int)
            df_copy[f'gluc_{val}'] = (df_copy['gluc'] == val).astype(int)
            
        # Drop raw categorical features
        df_copy = df_copy.drop(columns=['cholesterol', 'gluc'], errors='ignore')
        
        # Make sure gender is represented as binary 0/1 instead of 1/2
        if 'gender' in df_copy.columns:
            # Map gender 1 (female) -> 0, gender 2 (male) -> 1
            df_copy['gender_male'] = (df_copy['gender'] == 2).astype(int)
            df_copy = df_copy.drop(columns=['gender'], errors='ignore')
            
        # Keep consistent order of features for prediction model input
        return df_copy

    def get_feature_names(self):
        """Returns the final list of feature names expect by trained classifiers."""
        # Excludes non-feature parameters like 'id' and the target variable 'cardio'
        base_cols = [
            'age_years', 'height', 'weight', 'ap_hi', 'ap_lo', 'smoke', 'alco', 
            'active', 'bmi', 'pulse_pressure', 'hypertension_stage', 'age_group',
            'cholesterol_1', 'cholesterol_2', 'cholesterol_3', 
            'gluc_1', 'gluc_2', 'gluc_3', 'gender_male'
        ]
        if self.pca:
            return [f'pca_{i}' for i in range(self.n_components)]
        return base_cols

def inspect_dataset(df):
    """Detects and returns data issues such as missing values, duplicates, imbalance, and correlation."""
    stats = {}
    
    # Shape and general info
    stats['num_rows'] = int(df.shape[0])
    stats['num_cols'] = int(df.shape[1])
    
    # Missing values
    stats['missing_values'] = df.isnull().sum().to_dict()
    stats['total_missing'] = int(df.isnull().sum().sum())
    
    # Duplicates
    stats['duplicate_rows'] = int(df.duplicated().sum())
    
    # Target (cardio) distribution and class imbalance
    if 'cardio' in df.columns:
        counts = df['cardio'].value_counts().to_dict()
        stats['class_distribution'] = {str(k): int(v) for k, v in counts.items()}
        total = sum(counts.values())
        stats['class_proportions'] = {str(k): float(v / total) for k, v in counts.items()}
        
        # Check imbalance (e.g. if one class is < 40%)
        minority_class_pct = min(stats['class_proportions'].values())
        stats['data_imbalance'] = bool(minority_class_pct < 0.40)
    else:
        stats['class_distribution'] = {}
        stats['class_proportions'] = {}
        stats['data_imbalance'] = False

    # Outliers detection via IQR
    outlier_counts = {}
    numerical_cols = ['age', 'height', 'weight', 'ap_hi', 'ap_lo']
    for col in numerical_cols:
        if col in df.columns:
            q1 = df[col].quantile(0.25)
            q3 = df[col].quantile(0.75)
            iqr = q3 - q1
            lower = q1 - 1.5 * iqr
            upper = q3 + 1.5 * iqr
            outliers = df[(df[col] < lower) | (df[col] > upper)]
            outlier_counts[col] = int(outliers.shape[0])
            
    stats['outliers'] = outlier_counts
    
    # Preprocess a temporary set for correlations
    p = MedicalPreprocessor()
    df_temp = p.fit_transform(df)
    features = p.get_feature_names()
    
    # Compute correlation
    corr_matrix = df_temp[features + (['cardio'] if 'cardio' in df_temp.columns else [])].corr()
    
    # Find highly correlated features (> 0.7)
    high_corr = []
    for i in range(len(corr_matrix.columns)):
        for j in range(i):
            if abs(corr_matrix.iloc[i, j]) > 0.7:
                col1 = corr_matrix.columns[i]
                col2 = corr_matrix.columns[j]
                high_corr.append((col1, col2, float(corr_matrix.iloc[i, j])))
                
    stats['high_correlation_pairs'] = high_corr
    
    return stats

if __name__ == "__main__":
    # Test loading and inspection
    if os.path.exists(DATASET_PATH):
        df = pd.read_csv(DATASET_PATH, sep=';')
        print("Inspection Results Summary:")
        stats = inspect_dataset(df)
        print(f"Rows: {stats['num_rows']}, Missing: {stats['total_missing']}, Duplicates: {stats['duplicate_rows']}")
        print(f"Imbalance: {stats['data_imbalance']}, Distribution: {stats['class_distribution']}")
        print(f"Outliers: {stats['outliers']}")
        print(f"High Corr Pairs: {stats['high_correlation_pairs']}")
    else:
        print(f"Dataset does not exist at {DATASET_PATH}. Run download_data.py first.")
