# Workspace Navigator - Smart Project Navigation

Navigate your workspace intelligently with git-aware context.

Usage: `/workspace-nav [recent|projects|stats]`

Features:
- **recent**: Show recently modified files
- **projects**: List all projects/repos in workspace
- **stats**: Show workspace statistics

```bash
#!/bin/bash
ACTION="${1:-stats}"

case "$ACTION" in
  recent)
    echo "📅 Recently Modified Files (last 7 days):"
    echo "========================================"
    find . -type f \( -name "*.js" -o -name "*.ts" -o -name "*.py" -o -name "*.go" \) \
      -not -path "*/node_modules/*" -not -path "*/.git/*" \
      -mtime -7 -printf "%T@ %Tc %p\n" 2>/dev/null | \
      sort -rn | head -20 | cut -d' ' -f2- || \
      echo "Use: find . -type f -mtime -7 | head -20"
    ;;

  projects)
    echo "📁 Projects in Workspace:"
    echo "========================================"
    find . -name ".git" -type d 2>/dev/null | while read gitdir; do
      PROJ_DIR=$(dirname "$gitdir")
      BRANCH=$(git -C "$PROJ_DIR" branch --show-current 2>/dev/null)
      echo "   $PROJ_DIR [$BRANCH]"
    done | head -30
    ;;

  stats)
    echo "📊 Workspace Statistics:"
    echo "========================================"
    echo ""
    echo "📁 File Types:"
    find . -type f -not -path "*/node_modules/*" -not -path "*/.git/*" 2>/dev/null | \
      sed 's/.*\.//' | sort | uniq -c | sort -rn | head -10
    echo ""
    echo "📈 Largest Files:"
    find . -type f -not -path "*/node_modules/*" -not -path "*/.git/*" \
      -exec du -h {} + 2>/dev/null | sort -rh | head -10
    echo ""
    echo "🔥 Most Modified Files (git):"
    git log --all --format=format: --name-only 2>/dev/null | \
      sort | uniq -c | sort -rn | head -10 || \
      echo "   (not a git repository)"
    ;;

  *)
    echo "Usage: /workspace-nav [recent|projects|stats]"
    ;;
esac
```
