# Quick Context - Instant Codebase Context Builder

Quickly gather relevant context for Claude Code about specific topics or files.

Usage: `/quick-context <topic|file>`

This command automatically:
1. Finds related files and functions
2. Extracts relevant code snippets
3. Identifies dependencies
4. Shows recent changes from git
5. Provides a comprehensive summary

Examples:
- `/quick-context authentication` - Get all auth-related context
- `/quick-context src/api/users.js` - Get context for specific file
- `/quick-context database` - Find all database-related code

```bash
#!/bin/bash
TOPIC="$1"

if [ -z "$TOPIC" ]; then
  echo "Usage: /quick-context <topic|file>"
  exit 1
fi

echo "🔍 Building context for: $TOPIC"
echo "========================================"
echo ""

# Check if it's a file
if [ -f "$TOPIC" ]; then
  echo "📄 File Analysis: $TOPIC"
  echo "   Lines: $(wc -l < "$TOPIC")"
  echo "   Size: $(du -h "$TOPIC" | cut -f1)"
  echo ""

  echo "📝 Recent Changes:"
  git log --oneline -5 -- "$TOPIC" 2>/dev/null || echo "   (not in git)"
  echo ""

  echo "🔗 Imports/Dependencies:"
  grep -E "^(import |from |require\()" "$TOPIC" 2>/dev/null | head -10
  echo ""

  echo "🎯 Key Functions:"
  grep -E "(function |def |class |const .* = )" "$TOPIC" 2>/dev/null | head -10

else
  # Topic search
  echo "📁 Files mentioning '$TOPIC':"
  rg -l -i "$TOPIC" --max-count 1 2>/dev/null | \
    grep -v node_modules | grep -v ".git" | head -15
  echo ""

  echo "🎯 Function References:"
  rg -i "function.*$TOPIC|def.*$TOPIC|class.*$TOPIC" \
    --max-count 1 2>/dev/null | head -10
  echo ""

  echo "📝 Recent Commits:"
  git log --all --oneline --grep="$TOPIC" -i -5 2>/dev/null || \
    echo "   (no git commits found)"
fi

echo ""
echo "========================================"
echo "✅ Context ready for Claude Code"
```
