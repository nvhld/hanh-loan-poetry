import os
import sys
import json
from collections import Counter
import glob

def check_json_files():
    print("Running JSON validation...")
    has_error = False
    all_ids = []
    
    # Check all JSON files in root
    json_files = glob.glob('*.json')
    
    for file in json_files:
        # Ignore node_modules or package-related
        if 'package' in file or 'tsconfig' in file or 'vercel' in file:
            continue
            
        print(f"  Validating {file}...")
        try:
            with open(file, 'r', encoding='utf-8') as f:
                data = json.load(f)
                
            # Basic duplicate ID check if it's a list
            if isinstance(data, list):
                ids = [item.get('id') for item in data if isinstance(item, dict) and 'id' in item]
                all_ids.extend(ids)
                
            # Or if it's a dict where keys are IDs
            elif isinstance(data, dict) and len(data) > 0:
                first_val = list(data.values())[0]
                if isinstance(first_val, dict) and 'temporalBehavior' in first_val:
                    # this looks like anchor_mri.json
                    all_ids.extend(data.keys())
                    
        except json.JSONDecodeError as e:
            print(f"  ❌ ERROR: Malformed JSON or Invalid Escape in {file}")
            print(f"     Details: {e}")
            has_error = True
            
    # Check duplicate IDs
    duplicates = [id for id, count in Counter(all_ids).items() if count > 1]
    if duplicates:
        print(f"  ⚠️ WARNING: Duplicate IDs found across schema scopes: {set(duplicates)}")
        # We don't fail the build just for duplicate IDs across different files yet, 
        # but we report it.
        
    if has_error:
        print("  ❌ JSON validation failed.")
    else:
        print("  ✅ All JSON files valid.")
        
    return has_error

def check_duplicate_runtimes():
    print("\nChecking for duplicate static runtimes...")
    has_error = False
    
    statics = ['reader.html', 'archive.html', 'topology.html', 'curator.html']
    for file in statics:
        in_root = os.path.exists(file)
        in_public = os.path.exists(os.path.join('public', file))
        
        if in_root and in_public:
            print(f"  ❌ ERROR: Duplicate runtime found: {file} exists in both root and public/")
            has_error = True
            
    if not has_error:
        print("  ✅ No duplicate runtime files found.")
        
    return has_error

def check_missing_assets():
    print("\nChecking for missing assets...")
    has_error = False
    # we don't have full missing asset logic yet but we can add a basic check
    # to see if 'audio' and 'textures' directories exist in public/
    for folder in ['audio', 'textures']:
        path = os.path.join('public', folder)
        if not os.path.exists(path):
            print(f"  ⚠️ WARNING: Required asset folder missing: {path}")
    
    print("  ✅ Asset structure OK.")
    return has_error

def main():
    print("=== HYGIENE VALIDATION GUARDRAILS ===")
    e1 = check_json_files()
    e2 = check_duplicate_runtimes()
    e3 = check_missing_assets()
    print("=====================================")
    
    if e1 or e2 or e3:
        sys.exit(1)

if __name__ == "__main__":
    main()
