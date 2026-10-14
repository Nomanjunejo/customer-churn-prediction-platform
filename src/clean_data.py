import pandas as pd
from sklearn.model_selection import train_test_split

# 1. Load the raw dataset
df = pd.read_csv(
    "data/raw/WA_Fn-UseC_-Telco-Customer-Churn.csv"
)

print("Original shape:", df.shape)

# 2. Convert TotalCharges to numeric
df["TotalCharges"] = pd.to_numeric(
    df["TotalCharges"],
    errors="coerce"
)

# 3. Handle missing TotalCharges
missing_count = df["TotalCharges"].isna().sum()

print("Missing TotalCharges before cleaning:", missing_count)

# Zero tenure means no accumulated monthly charges
df.loc[df["TotalCharges"].isna(), "TotalCharges"] = 0

print(
    "Missing TotalCharges after cleaning:",
    df["TotalCharges"].isna().sum()
)

# 4. Separate target (y) from features (X)
y = df["Churn"].map({"No": 0, "Yes": 1})

# Remove the target and customer ID from the features
X = df.drop(columns=["Churn", "customerID"])

print("\nFeatures shape:", X.shape)
print("Target shape:", y.shape)

# 5. Split into training and testing data
X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.20,
    random_state=42,
    stratify=y
)

print("\nTraining features:", X_train.shape)
print("Testing features:", X_test.shape)

print("\nTraining churn distribution:")
print(y_train.value_counts(normalize=True).round(3))

print("\nTesting churn distribution:")
print(y_test.value_counts(normalize=True).round(3))

# 6. Save the cleaned dataset
df.to_csv(
    "data/processed/cleaned_churn.csv",
    index=False
)

print("\nCleaned dataset saved successfully!")