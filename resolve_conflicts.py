import re

def resolve_conflicts_keep_head(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    pattern = r'<<<<<<< HEAD\n(.*?)\n=======\n(.*?)\n>>>>>>> origin/Krit_front'
    
    count = len(re.findall(pattern, content, re.DOTALL))
    
    resolved = re.sub(pattern, r'\1', content, flags=re.DOTALL)
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(resolved)
    
    print(f"Resolved {count} conflicts in {filepath}")

files = [
    r"d:\System_Analysis_and_Design\smart-moto-service-center\frontend\src\pages\mechanic\MechanicJobDetailPage.tsx",
    r"d:\System_Analysis_and_Design\smart-moto-service-center\frontend\src\pages\mechanic\MechanicHistoryPage.tsx",
    r"d:\System_Analysis_and_Design\smart-moto-service-center\frontend\src\pages\foreman\JobOrdersPage.tsx",
    r"d:\System_Analysis_and_Design\smart-moto-service-center\frontend\src\pages\foreman\JobHistoryPage.tsx",
    r"d:\System_Analysis_and_Design\smart-moto-service-center\frontend\src\pages\foreman\JobDetailPage.tsx",
]

for f in files:
    resolve_conflicts_keep_head(f)

print("Done!")
