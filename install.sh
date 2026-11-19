#!/usr/bin/env bash
# Install copilot-usage extension + status line config into the active omp agent dir.
# Usage: ./install.sh [--profile NAME]
set -euo pipefail
here="$(cd "$(dirname "$0")" && pwd)"
omp_args=("$@")
agent_dir="${PI_CODING_AGENT_DIR:-$HOME/.omp/agent}"
[ "${1:-}" = "--profile" ] && agent_dir="$HOME/.omp/profiles/$2/agent"

mkdir -p "$agent_dir/extensions"
ln -sfn "$here/extensions/copilot-usage" "$agent_dir/extensions/copilot-usage"

set_() { omp "${omp_args[@]}" config set "$@"; }
set_ statusLine.preset custom
set_ statusLine.separator powerline-thin
set_ statusLine.showHookStatus false
set_ statusLine.leftSegments '["pi","vim","model","mode","collab","stream","path","git","pr","context_pct","cost","status"]'
set_ statusLine.rightSegments '["session_name"]'
set_ statusLine.segmentOptions '{"model":{"showThinkingLevel":true},"path":{"abbreviate":true,"maxLength":40,"stripWorkPrefix":true},"git":{"showBranch":true,"showStaged":true,"showUnstaged":true,"showUntracked":true}}'
echo "Done. Restart omp."
