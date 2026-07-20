CGI Florida Tips Site — Folder Guide
=====================================

TO TEST RIGHT NOW:
Open index.html (or bunk.html) in a browser. staff.json and campers.json
already have sample data in them so you can click around.

TO GO LIVE WITH YOUR OWN DATA:
1. Open staff_template.xlsx, paste your real staff list under the headers,
   save it, then run: python3 build_json.py
   -> select your staff Excel file -> it creates/overwrites staff.json

2. Open campers_template.xlsx, paste your real camper list under the
   headers, save it, then run: python3 build_campers_json.py
   -> select your camper Excel file -> it creates/overwrites campers.json

3. Upload the whole folder (including the new staff.json / campers.json)
   to your host, replacing the old files.

FILES:
- index.html / camper.js       -> homepage, search by camper name
- bunk.html / script.js        -> browse by grade + bunk/category
- payments.js                  -> shared staff-card/payment-button code
- style.css                    -> styling
- staff.json / campers.json    -> the live data the site reads
- staff_template.xlsx          -> paste staff list here, headers pre-set
- campers_template.xlsx        -> paste camper list here, headers pre-set
- build_json.py                -> Excel -> staff.json
- build_campers_json.py        -> Excel -> campers.json

NOTES:
- Any extra column you add to staff_template.xlsx besides Grade/Category/
  Selection/Name/Preferred becomes a new payment method automatically
  (logo shown if it's CashApp/Zelle/PayPal/Venmo, generic icon otherwise).
- Camper sheet columns (e.g. "Bunk", "learning class") don't need to match
  staff sheet Category text exactly — matching is fuzzy.
