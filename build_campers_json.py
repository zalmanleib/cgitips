import pandas as pd
import json
import tkinter as tk
from tkinter import filedialog

def select_excel_file():
    root = tk.Tk(); root.withdraw()
    return filedialog.askopenfilename(filetypes=[("Excel files", "*.xlsx *.xls")], title="Select the Camper Excel File")

excel_file = select_excel_file()
if not excel_file:
    print("No file selected. Exiting."); raise SystemExit

df = pd.read_excel(excel_file)
required_cols = ["Grade", "First Name", "Last Name"]
for col in required_cols:
    if col not in df.columns:
        print(f"Error: Column '{col}' not found in Excel file."); raise SystemExit

# Any column other than Grade/First Name/Last Name is a category (e.g. "Bunk",
# "learning class") whose value should match a Selection under a similarly
# named Category in the staff sheet (staff.json). The name doesn't need to
# match exactly (matching is fuzzy on the page), but keep it close.
category_cols = [c for c in df.columns if c not in required_cols]

df["Grade"] = df["Grade"].astype(str)
campers = []
for _, row in df.iterrows():
    first = "" if pd.isna(row["First Name"]) else str(row["First Name"]).strip()
    last = "" if pd.isna(row["Last Name"]) else str(row["Last Name"]).strip()
    name = f"{first} {last}".strip()
    if not name:
        continue

    selections = {}
    for col in category_cols:
        val = row[col]
        if not pd.isna(val) and str(val).strip():
            selections[col] = str(val).strip()

    campers.append({
        "name": name,
        "grade": str(row["Grade"]),
        "selections": selections
    })

with open("campers.json", "w", encoding="utf-8") as f:
    json.dump(campers, f, indent=2, ensure_ascii=False)
print(f"campers.json generated successfully ({len(campers)} campers).")
