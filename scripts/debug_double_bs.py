"""Debug: inspect what's actually in the files for double-backslash math."""
import os, re

textbook_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'textbook')

# Check ch09.html specifically
filepath = os.path.join(textbook_dir, 'ch09.html')
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

script_start = content.rfind('<script')
body = content[:script_start]

# The problem: in the HTML file, \ is just a single backslash character.
# When we read it in Python, \( is two characters: backslash + open-paren.
# The original double-backslash \\( in the file would be read as \\( by Python.

# Let's find all occurrences of \( and check what's around them
i = 0
inline_count = 0
problematic = []
while i < len(body):
    idx = body.find('\\(', i)  # Find literal \( in file
    if idx == -1:
        break
    # Check if this is \\( (double backslash) by looking at the char before
    if idx > 0 and body[idx-1] == '\\':
        # This is \\( — double backslash opener (BAD)
        close_idx = body.find('\\)', idx + 2)
        if close_idx > 0 and close_idx > 0 and body[close_idx-1] == '\\':
            # This is \\) — double backslash closer
            math_content = body[idx+2:close_idx-1]  # Content between \( and \)
            # Wait, this is wrong. Let me think about this differently.
            pass
    inline_count += 1
    i = idx + 2

# Let me just search for the raw text pattern that represents double-backslash math
# In the file, the problematic patterns look like: \(p(y_n \\mid \\Psi_t)\)
# where \\mid means: backslash-backslash-mid

# Search for patterns like: \(...\command...\)
# where \command has a double backslash before it

# Find all \( ... \) pairs
i = 0
count = 0
while i < len(body):
    idx = body.find('\\(', i)
    if idx == -1:
        break
    close_idx = body.find('\\)', idx + 2)
    if close_idx == -1:
        break
    
    math_content = body[idx+2:close_idx]
    
    # Check for double-backslash LaTeX commands: pattern \\letter
    # In the raw string, this is: backslash + backslash + letter
    for m in re.finditer(r'\\([a-zA-Z]+)', math_content):
        # Check if the character before the match is also a backslash
        cmd_start = m.start()
        if cmd_start > 0 and math_content[cmd_start-1] == '\\':
            count += 1
            print(f'  ch09.html pos {idx}: \\({math_content[:60]}...\\) -- double: \\{m.group(1)}')
            break
    
    i = close_idx + 2

print(f'Found {count} problematic inline math regions in ch09.html')
