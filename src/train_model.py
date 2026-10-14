
import pandas as pd
import joblib

from sklearn.model_selection import train_test_split
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.impute import SimpleImputer
from sklearn.pipeline import Pipeline
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    roc_auc_score,
    classification_report,
    confusion_matrix,
)

# 1. Load cleaned data
df = pd.read_csv("data/processed/cleaned_churn.csv")

# 2. Convert target into 0 and 1
y = df["Churn"].map({"No": 0, "Yes": 1})

# 3. Remove target and customer ID from features
X = df.drop(columns=["Churn", "customerID"])

# 4. Identify categorical and numerical columns
categorical_cols = X.select_dtypes(
    include=["object", "str"]
).columns.tolist()

numerical_cols = X.select_dtypes(
    include=["number"]
).columns.tolist()

print("Categorical columns:", categorical_cols)
print("Numerical columns:", numerical_cols)

# 5. Split data before fitting preprocessing
X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.20,
    random_state=42,
    stratify=y,
)

# 6. Preprocess categorical columns
categorical_pipeline = Pipeline([
    ("imputer", SimpleImputer(strategy="most_frequent")),
    ("encoder", OneHotEncoder(handle_unknown="ignore")),
])

# 7. Preprocess numerical columns
numerical_pipeline = Pipeline([
    ("imputer", SimpleImputer(strategy="median")),
    ("scaler", StandardScaler()),
])

# 8. Combine preprocessing
preprocessor = ColumnTransformer([
    ("categorical", categorical_pipeline, categorical_cols),
    ("numerical", numerical_pipeline, numerical_cols),
])

# 9. Build complete ML pipeline
model = Pipeline([
    ("preprocessor", preprocessor),
    ("classifier", LogisticRegression(max_iter=1000)),
])

# 10. Train model
model.fit(X_train, y_train)

# 11. Predict on unseen test data
y_pred = model.predict(X_test)
y_prob = model.predict_proba(X_test)[:, 1]

# 12. Evaluate performance
print("\n--- Model Evaluation ---")
print("Accuracy:", round(accuracy_score(y_test, y_pred), 4))
print("Precision:", round(precision_score(y_test, y_pred), 4))
print("Recall:", round(recall_score(y_test, y_pred), 4))
print("F1 Score:", round(f1_score(y_test, y_pred), 4))
print("ROC-AUC:", round(roc_auc_score(y_test, y_prob), 4))

print("\n--- Classification Report ---")
print(classification_report(
    y_test,
    y_pred,
    target_names=["No Churn", "Churn"],
))

print("\n--- Confusion Matrix ---")
print(confusion_matrix(y_test, y_pred))

# 13. Save the complete pipeline
joblib.dump(model, "models/churn_pipeline.joblib")

print("\nModel pipeline saved successfully!")
