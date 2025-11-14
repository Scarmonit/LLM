# Smart Find - Intelligent File Discovery

Find files in your workspace with fuzzy matching and intelligent filtering.

Usage: `/smart-find <pattern> [--type js|py|ts] [--recent] [--large]`

Examples:
- `/smart-find server` - Find all files matching "server"
- `/smart-find auth --type js` - Find JavaScript files with "auth"
- `/smart-find --recent` - Show recently modified files
- `/smart-find --large` - Show large files that might need attention

Execute the smart-find utility:

```bash
#!/bin/bash
PATTERN="${1:-}"
TYPE="${2:-}"

if [ -z "$PATTERN" ] && [[ ! "$TYPE" =~ ^--(recent|large)$ ]]; then
  echo "Usage: /smart-find <pattern> [options]"
  exit 1
fi

# Smart file search with multiple strategies
if [[ "$TYPE" == "--recent" ]]; then
  # Recent files
  find . -type f \( -name "*.js" -o -name "*.ts" -o -name "*.py" -o -name "*.md" \) \
    -not -path "*/node_modules/*" -not -path "*/.git/*" \
    -mtime -7 -exec ls -lht {} + 2>/dev/null | head -20
elif [[ "$TYPE" == "--large" ]]; then
  # Large files
  find . -type f \( -name "*.js" -o -name "*.ts" -o -name "*.py" \) \
    -not -path "*/node_modules/*" -not -path "*/.git/*" \
    -size +100k -exec ls -lh {} \; 2>/dev/null | sort -rh | head -15
else
  # Pattern-based search
  EXT_FILTER=""
  if [[ "$TYPE" =~ ^--type ]]; then
    EXT=$(echo "$TYPE" | cut -d'=' -f2)
    EXT_FILTER="-name \"*.$EXT\""
  fi

  # Use ripgrep if available, otherwise find
  if command -v rg &> /dev/null; then
    rg --files --hidden -g "!node_modules" -g "!.git" | \
      rg -i "$PATTERN" | head -30
  else
    find . -type f -iname "*${PATTERN}*" \
      -not -path "*/node_modules/*" -not -path "*/.git/*" \
      2>/dev/null | head -30
  fi
fi
```
