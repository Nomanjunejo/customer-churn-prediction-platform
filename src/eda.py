import pandas as pd
import matplotlib.pyplot as plt

# 1. Load cleaned dataset
df = pd.read_csv("data/processed/cleaned_churn.csv")

# 2. Convert Churn into readable labels for analysis
df["ChurnLabel"] = df["Churn"]

print("\n--- Overall Churn Rate ---")
print((df["Churn"].eq("Yes").mean() * 100).round(2), "%")

# 3. Churn rate by contract type
print("\n--- Churn Rate by Contract ---")

contract_churn = (
    df.groupby("Contract")["Churn"]
    .apply(lambda x: (x == "Yes").mean() * 100)
    .sort_values(ascending=False)
)

print(contract_churn.round(2))

# 4. Churn rate by tenure group
print("\n--- Churn Rate by Tenure Group ---")

df["TenureGroup"] = pd.cut(
    df["tenure"],
    bins=[-1, 12, 24, 48, 72],
    labels=["0-12 months", "13-24 months",
            "25-48 months", "49-72 months"]
)

tenure_churn = (
    df.groupby("TenureGroup", observed=False)["Churn"]
    .apply(lambda x: (x == "Yes").mean() * 100)
)

print(tenure_churn.round(2))

# 5. Churn rate by monthly charges
print("\n--- Monthly Charges Summary by Churn ---")

print(
    df.groupby("Churn")["MonthlyCharges"]
    .agg(["mean", "median"])
    .round(2)
)

# 6. Visualize churn by contract
contract_churn.plot(kind="bar", rot=0)

plt.title("Churn Rate by Contract Type")
plt.xlabel("Contract Type")
plt.ylabel("Churn Rate (%)")
plt.tight_layout()
plt.savefig("data/processed/churn_by_contract.png")
plt.show()

# 7. Visualize churn by tenure group
tenure_churn.plot(kind="bar", rot=0)

plt.title("Churn Rate by Tenure Group")
plt.xlabel("Customer Tenure")
plt.ylabel("Churn Rate (%)")
plt.tight_layout()
plt.savefig("data/processed/churn_by_tenure.png")
plt.show()