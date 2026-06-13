import re

with open('src/components/AdminLayout.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

start_idx = content.find('const menuItems = [')
end_idx = content.find('  ];\n\n  const getBreadcrumbItems')

if start_idx == -1 or end_idx == -1:
    print("Could not find menuItems array.")
    exit(1)

menu_items_str = content[start_idx:end_idx]

# We need to parse the items. Since they are separated by "    },\n    {", we can split carefully.
# Better way: we have the list of labels.
# I will just write the reordered text directly using the exact blocks from the file.

items_map = {}

# We extract each block by finding `{ key:`
# Wait, some start with `    {` and end with `    },`
blocks = re.split(r'(\n    \{\n      key:)', menu_items_str)

# blocks[0] is `const menuItems = [`
# blocks[1] is `\n    {\n      key:`
# blocks[2] is `"Dashboard"` block content, etc.

parsed_items = []
for i in range(1, len(blocks), 2):
    block_start = blocks[i]
    block_body = blocks[i+1]
    
    # find the end of this block
    # it might end with `    },` or `    }`
    # Actually, let's just use the fact that each block starts with `\n    {\n      key:`
    
    full_block = block_start + block_body
    # Find label to identify it
    match = re.search(r'label:\s*"([^"]+)"', full_block)
    if match:
        label = match.group(1)
        # trim trailing comma and newline if it exists
        if full_block.endswith(',\n'):
            full_block = full_block[:-2]
        parsed_items.append({"label": label, "content": full_block})

desired_order = [
    "Dashboard",
    "DIVIDER_1",
    "Courses",
    "Question Papers",
    "Hall Tickets",
    "DIVIDER_2",
    "Learners",
    "Memberships",
    "Institutions",
    "Centers",
    "Administrators",
    "DIVIDER_3",
    "Learner Certificates",
    "Certificates",
    "CIMAA Certificate",
    "DIVIDER_4",
    "Invoices",
    "Receipts",
    "Enquiries"
]

new_items_str = "const menuItems = ["
for label in desired_order:
    if label.startswith("DIVIDER"):
        new_items_str += "\n    { type: \"divider\" },"
        continue
        
    found = False
    for item in parsed_items:
        if item['label'] == label:
            new_items_str += item['content'] + ","
            found = True
            break
    if not found:
        print(f"Warning: could not find {label}")

# Remove trailing comma
if new_items_str.endswith(','):
    new_items_str = new_items_str[:-1]

new_content = content[:start_idx] + new_items_str + content[end_idx:]

with open('src/components/AdminLayout.tsx', 'w', encoding='utf-8') as f:
    f.write(new_content)

print("Successfully reordered menuItems.")
