
import pandas as pd

from sklearn.model_selection import train_test_split
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.impute import SimpleImputer
from sklearn.pipeline import Pipeline
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    precision_score,
    recall_score,
    f1_score,
    roc_auc_score,
    confusion_matrix,
)

# 1. Load cleaned data
df = pd.read_csv("data/processed/cleaned_churn.csv")

y = df["Churn"].map({"No": 0, "Yes": 1})
X = df.drop(columns=["Churn", "customerID"])

# 2. Identify columns
categorical_cols = X.select_dtypes(
    include=["object", "str"]
).columns.tolist()

numerical_cols = X.select_dtypes(
    include=["number"]
).columns.tolist()

# 3. First split: 80% development, 20% final test
X_dev, X_test, y_dev, y_test = train_test_split(
    X,
    y,
    test_size=0.20,
    random_state=42,
    stratify=y,
)

# 4. Second split: divide development data into
# 75% training and 25% validation.
# Overall: 60% training, 20% validation, 20% test.
X_train, X_val, y_train, y_val = train_test_split(
    X_dev,
    y_dev,
    test_size=0.25,
    random_state=42,
    stratify=y_dev,
)

print("Training customers:", len(X_train))
print("Validation customers:", len(X_val))
print("Test customers:", len(X_test))

# 5. Build preprocessing pipeline
categorical_pipeline = Pipeline([
    ("imputer", SimpleImputer(strategy="most_frequent")),
    ("encoder", OneHotEncoder(handle_unknown="ignore")),
])

numerical_pipeline = Pipeline([
    ("imputer", SimpleImputer(strategy="median")),
    ("scaler", StandardScaler()),
])

preprocessor = ColumnTransformer([
    ("categorical", categorical_pipeline, categorical_cols),
    ("numerical", numerical_pipeline, numerical_cols),
])

# 6. Train model using training data only
model = Pipeline([
    ("preprocessor", preprocessor),
    ("classifier", LogisticRegression(max_iter=1000)),
])

model.fit(X_train, y_train)

# 7. Choose threshold using validation data
val_prob = model.predict_proba(X_val)[:, 1]

print("\n--- Validation Threshold Comparison ---")

for threshold in [0.30, 0.35, 0.40, 0.45, 0.50]:
    val_pred = (val_prob >= threshold).astype(int)

    precision = precision_score(
        y_val, val_pred, zero_division=0
    )
    recall = recall_score(
        y_val, val_pred, zero_division=0
    )
    f1 = f1_score(
        y_val, val_pred, zero_division=0
    )

    print(
        f"Threshold: {threshold:.2f} | "
        f"Precision: {precision:.3f} | "
        f"Recall: {recall:.3f} | "
        f"F1: {f1:.3f}"
    )

# 8. Select threshold based on validation results.
# This is a provisional choice for the exercise.
selected_threshold = 0.35

# 9. Evaluate once on the untouched test set
test_prob = model.predict_proba(X_test)[:, 1]
test_pred = (test_prob >= selected_threshold).astype(int)

print("\n--- Final Test Evaluation ---")
print("Selected threshold:", selected_threshold)
print(
    "Precision:",
    round(precision_score(y_test, test_pred, zero_division=0), 4),
)
print(
    "Recall:",
    round(recall_score(y_test, test_pred, zero_division=0), 4),
)
print(
    "F1 Score:",
    round(f1_score(y_test, test_pred, zero_division=0), 4),
)
print(
    "ROC-AUC:",
    round(roc_auc_score(y_test, test_prob), 4),
)
print("Confusion Matrix:")
print(confusion_matrix(y_test, test_pred))
