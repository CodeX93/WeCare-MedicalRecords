import fitz  # PyMuPDF
import json
import re

def extract_medicine_names(pdf_path):
    doc = fitz.open(pdf_path)
    medicine_names = []
    
    for page in doc:
        text = page.get_text()
        lines = text.split('\n')
        
        for line in lines:
            clean_line = line.strip()
            if "page" in clean_line.lower() or not clean_line:  # Skip 'page' lines or empty lines
                continue
            # Regex to match entries like 'medicine name ........ number'
            if re.match(r'^[a-zA-Z].*[\.\s]+\d+$', clean_line):
                medicine = ' '.join(clean_line.split()[:-1])  # Remove the last part (numbers and dots)
                if medicine:
                    medicine_names.append(medicine)
    
    doc.close()
    return medicine_names

pdf_path = r"C:/Users/Dell/Downloads/WHO-MHP-HPS-EML-2023.02-eng.pdf"  
medicine_names = extract_medicine_names(pdf_path)

# Store the names in a JSON file
with open("../medicine_names.json", "w") as file:
    json.dump(medicine_names, file, indent=4)

print(f"Extracted {len(medicine_names)} medicine names.")
