# Notebooks — Data Preparation and Model Development

This directory contains the complete **data analysis, preprocessing, feature engineering, model training, evaluation, and optimization workflows** for the Cervical Cancer Risk Prediction System. All experiments were conducted using Python in Jupyter Notebooks to ensure reproducibility and transparency.

---

## Directory Structure

```
notebooks/
├── Decision_Tree.ipynb
├── SVM.ipynb
├── risk_factors_cervical_cancer.csv
└── README.md
```

---

## Dataset Description

**File:** `risk_factors_cervical_cancer.csv`

The dataset consists of medical, behavioral, and diagnostic indicators associated with cervical cancer risk. The target variable is:

* **Biopsy**

  * `0` – No cervical cancer
  * `1` – Cervical cancer confirmed via biopsy

### Dataset Characteristics

* Medical domain dataset
* Contains both numerical and binary clinical features
* Significant missing values represented as `'?'`
* Severe class imbalance (approximately 94% negative, 6% positive)

---

## Data Preprocessing

Comprehensive preprocessing was applied to ensure data quality and model reliability.

### Handling Missing Values

* All `'?'` values were replaced with `NaN`
* **Numerical features** were imputed using the **median**

  * Chosen due to the presence of outliers and the sensitivity of medical data
* **Binary and categorical features** were imputed using the **mode**

### Feature Removal

Two features were removed due to excessive missing values (>90%):

* `STDs: Time since first diagnosis`
* `STDs: Time since last diagnosis`

Including these features would negatively impact model performance and reliability.

### Duplicate Removal

Duplicate rows were detected and removed to prevent bias and data leakage.

### Data Type Standardization

All features were converted to `float` to ensure consistency and compatibility with machine learning algorithms.

---

## Feature Engineering and Selection

### Feature Grouping

* **Numerical features:** age, number of pregnancies, years of smoking, etc.
* **Binary features:** STDs, HIV, HPV, cytology results, and diagnostic indicators

### Variance Filtering

* Features with zero variance were removed using `VarianceThreshold` to eliminate non-informative predictors.

### Statistical Feature Selection

* **SelectKBest (ANOVA F-test)** was applied
* The **top 10 most informative features** were selected
* Reduced dimensionality while preserving predictive relevance

---

## Class Imbalance Challenge

The dataset exhibits a severe class imbalance, which is particularly problematic in medical prediction tasks.

### Risks

* False negatives may result in missed cancer cases
* False positives may cause unnecessary anxiety and follow-up procedures

### Mitigation Strategies

* **SMOTE (Synthetic Minority Oversampling Technique)** applied only to training data
* **Stratified train-test splitting**
* **F1-score** prioritized over accuracy
* **Class weighting** applied for SVM

---

## Decision Tree Model Development

**Notebook:** `Decision_Tree.ipynb`

### Training Pipeline

1. Feature selection
2. Stratified train-test split (80:20)
3. SMOTE applied to training data
4. Initial Decision Tree training

### Model Optimization

* Hyperparameter tuning using **GridSearchCV**
* Tuned parameters:

  * `max_depth`
  * `min_samples_split`
  * `min_samples_leaf`
* **Threshold tuning** applied using predicted probabilities

### Validation

* 5-fold **Stratified K-Fold Cross-Validation**
* Mean F1 score approximately **0.72**

### Outcome

The optimized Decision Tree model achieved improved recall and F1 score, making it suitable for controlled medical risk estimation.

---

## Support Vector Machine (SVM) Model Development

**Notebook:** `SVM.ipynb`

### Motivation

SVM was selected due to its effectiveness in high-dimensional feature spaces and robustness when properly scaled.

### Training Steps

1. Feature selection
2. Standardization using `StandardScaler`
3. SMOTE applied to training data
4. Linear SVM training with class weighting

### Key Adjustments

* Linear kernel selected over RBF to improve generalization
* `class_weight='balanced'` applied to address imbalance

### Validation

* 5-fold **Stratified K-Fold Cross-Validation**
* Mean accuracy approximately **95.5%**
* Mean F1 score approximately **0.73**

### Outcome

The SVM model demonstrated strong consistency and a balanced trade-off between precision and recall.

---

## Model Persistence

Final trained models and preprocessing artifacts were saved using `joblib`:

### Stored Artifacts

* `model.pkl` – trained model
* `features.pkl` – ordered feature list
* `scaler.pkl` – feature scaler (SVM only)

These artifacts are consumed directly by the FastAPI backend for real-time inference.

---

## Key Observations

* Accuracy alone is insufficient for imbalanced medical datasets
* F1 score provides a more reliable performance measure
* SMOTE must be applied strictly to training data
* Cross-validation is essential to assess model stability

---

## Limitations and Future Improvements

* Dataset imbalance limits recall despite mitigation techniques
* Results depend heavily on available clinical features
* Future work may include:

  * Larger and more balanced datasets
  * Ensemble models
  * Explainability techniques such as SHAP

---

## Disclaimer

This project is intended for **educational and research purposes only**.
The predictions generated by the models **do not constitute medical diagnoses** and must not replace professional medical consultation.
