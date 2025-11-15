#!/usr/bin/env bash
set -euo pipefail

# Extensions this script will attempt to uninstall (safe/low-risk candidates)
candidates=(
  "octref.vetur"
  "sdras.vue-vscode-extensionpack"
)

if ! command -v code >/dev/null 2>&1; then
  cat <<'MSG'
VS Code CLI `code` not found in PATH.
To enable it:
  1. Open Visual Studio Code.
  2. Press Cmd+Shift+P and run: "Shell Command: Install 'code' command in PATH".
  3. Restart your terminal.
MSG
  exit 1
fi

echo "This will attempt to uninstall the following extensions: ${candidates[*]}"
read -r -p "Proceed? [y/N] " ans
if [[ "$ans" != "y" && "$ans" != "Y" ]]; then
  echo "Aborted by user. No changes made."
  exit 0
fi

for ext in "${candidates[@]}"; do
  echo "\nAttempting to uninstall $ext..."
  if code --uninstall-extension "$ext"; then
    echo "Uninstalled $ext"
  else
    echo "Failed to uninstall $ext. It may be required by another installed extension or VS Code reports a dependency." 
    echo "Tips:"
    echo " - Open the Extensions view in VS Code and search for the extension to see dependents."
    echo " - Consider disabling dependent extensions first, then try uninstalling again."
    echo " - You can uninstall dependent extensions via the GUI or with 'code --uninstall-extension <id>' if you accept the consequences."
  fi
done

echo "\nFinished. If uninstalls failed due to dependencies, review the Extensions view in VS Code and remove dependents manually."
