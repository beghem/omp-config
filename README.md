# omp-config

Copilot premium-request usage shown in the omp status line.

- `extensions/copilot-usage/` – extension; polls `omp usage` every 5 min and calls `ctx.ui.setStatus()`
- `install.sh` – symlinks the extension into `~/.omp/agent/extensions/` and sets `statusLine.*` via `omp config set`
  (the `status` segment renders extension statuses inline; `showHookStatus: false` removes the extra line below)

Setup on a new host (requires `omp` and a github-copilot login):

    git clone <this repo> ~/omp-config && ~/omp-config/install.sh
