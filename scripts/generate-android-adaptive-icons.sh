#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
VENV="$ROOT/.venv-icons"

if [[ ! -d "$VENV" ]]; then
  python3 -m venv "$VENV"
fi

"$VENV/bin/pip" install -q -r "$ROOT/scripts/requirements-icons.txt"
exec "$VENV/bin/python3" "$ROOT/scripts/generate_app_icons.py"
