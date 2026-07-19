import pandas as pd
import json
import tkinter as tk
from tkinter import filedialog

def select_excel_file():
    root = tk.Tk(); root.withdraw()
    return filedialog.askopenfilename(filetypes=[("Excel files", "*.xlsx *.xls")], title="Select an Excel File")

excel_file = select_excel_file()
if not excel_file:
    print("No file selected. Exiting."); raise SystemExit

df = pd.read_excel(excel_file)
required_cols = ["Grade", "Category", "Selection", "Name", "Preferred"]
for col in required_cols:
    if col not in df.columns:
        print(f"Error: Column '{col}' not found in Excel file."); raise SystemExit

# Any column other than the required ones is treated as a payment method
# (its header becomes the method name, e.g. "CashApp", "Zelle", "PayPal", "Venmo").
payment_cols = [c for c in df.columns if c not in required_cols]

df["Grade"] = df["Grade"].astype(str)
data = {}
for _, row in df.iterrows():
    grade, category, selection = str(row["Grade"]), str(row["Category"]), str(row["Selection"])

    payments = {}
    for col in payment_cols:
        val = row[col]
        if not pd.isna(val) and str(val).strip():
            payments[col] = str(val).strip()

    data.setdefault(grade, {}).setdefault(category, {}).setdefault(selection, []).append({
        "name": "" if pd.isna(row["Name"]) else str(row["Name"]),
        "preferred": "" if pd.isna(row["Preferred"]) else str(row["Preferred"]),
        "payments": payments
    })

with open("staff.json", "w", encoding="utf-8") as f:
    json.dump(data, f, indent=2, ensure_ascii=False)
print("staff.json generated successfully.")
