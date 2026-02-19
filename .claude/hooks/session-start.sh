#!/bin/bash
set -euo pipefail

# Only run setup in remote Claude Code on the web sessions
if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

echo "Session start: installing Node dependencies..."
cd "$CLAUDE_PROJECT_DIR"
npm install
echo "Session start: done."
