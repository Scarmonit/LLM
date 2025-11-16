# Code Snippets - Personal Code Library

Save and retrieve useful code snippets quickly.

Usage:
- `/code-snippets save <name>` - Save code from clipboard
- `/code-snippets list` - List all saved snippets
- `/code-snippets get <name>` - Retrieve a snippet
- `/code-snippets search <term>` - Search snippets

```bash
#!/bin/bash
SNIPPETS_DIR="$HOME/.claude/snippets"
mkdir -p "$SNIPPETS_DIR"

ACTION="$1"
NAME="$2"

case "$ACTION" in
  save)
    if [ -z "$NAME" ]; then
      echo "Usage: /code-snippets save <name>"
      exit 1
    fi
    echo "📝 Paste your code snippet (Ctrl+D when done):"
    cat > "$SNIPPETS_DIR/$NAME.snippet"
    echo "✅ Snippet '$NAME' saved"
    ;;

  list)
    echo "📚 Saved Snippets:"
    ls -1 "$SNIPPETS_DIR" 2>/dev/null | sed 's/\.snippet$//' | nl
    ;;

  get)
    if [ -z "$NAME" ]; then
      echo "Usage: /code-snippets get <name>"
      exit 1
    fi
    if [ -f "$SNIPPETS_DIR/$NAME.snippet" ]; then
      echo "📄 Snippet: $NAME"
      echo "----------------------------------------"
      cat "$SNIPPETS_DIR/$NAME.snippet"
      echo "----------------------------------------"
    else
      echo "❌ Snippet '$NAME' not found"
    fi
    ;;

  search)
    if [ -z "$NAME" ]; then
      echo "Usage: /code-snippets search <term>"
      exit 1
    fi
    echo "🔍 Searching snippets for: $NAME"
    grep -l -i "$NAME" "$SNIPPETS_DIR"/*.snippet 2>/dev/null | \
      xargs -I {} basename {} .snippet
    ;;

  *)
    echo "Usage: /code-snippets [save|list|get|search] <name>"
    ;;
esac
```
