import pandas as pd

# 1. Load the dataset
file_path = (
    "data/raw/WA_Fn-UseC_-Telco-Customer-Churn.csv"
)
df = pd.read_csv(file_path)

# 2. Basic information
print("\n--- Dataset Shape ---")
print(df.shape)

print("\n--- First 5 Customers ---")
print(df.head())

print("\n--- Column Names ---")
print(df.columns.tolist())

print("\n--- Data Types and Missing Values ---")
df.info()

print("\n--- Churn Distribution ---")
print(df["Churn"].value_counts())



print("\n--- Churn Percentage ---")
print(df["Churn"].value_counts(normalize=True) * 100)





# --- Data Quality Checks ---

print("\n--- Missing Values ---")
print(df.isnull().sum())

print("\n--- Blank TotalCharges ---")
blank_charges = df["TotalCharges"].str.strip().eq("")
print("Blank rows:", blank_charges.sum())

print("\n--- Duplicate Customer IDs ---")
print(df["customerID"].duplicated().sum())

print("\n--- Duplicate Rows ---")
print(df.duplicated().sum())

print("\n--- Unique Values in Important Columns ---")
for col in ["gender", "Contract", "InternetService", "Churn"]:
    print(f"\n{col}:")
    print(df[col].value_counts())

print("\n--- Numeric Summary ---")
print(df[["tenure", "MonthlyCharges"]].describe())