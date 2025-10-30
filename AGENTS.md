# AGENTS.md

## 1. Purpose
Defines the autonomous agent system for this repository. Agents manage creative, operational, and publishing workflows using GitHub Actions and a static build pipeline.

## 2. Agent Directory
Use a short prefix for clarity. Set it in `.chatgpt-context.yml` under `agent_prefix`. This project uses the `menu` prefix.

| Agent Name        | Role                                                               | Trigger                         | Linked Script/Workflow                         |
|-------------------|--------------------------------------------------------------------|---------------------------------|-----------------------------------------------|
| `menu-content`    | Builds and updates site pages, product catalog, docs, and blog     | On push, manual, schedule       | `.github/workflows/ai-agents.yml` (content job)  |
| `menu-image`      | Generates and optimizes images for responsive use                  | Manual or schedule              | `ai/scripts/image-optimize.mjs`               |
| `menu-packaging`  | Produces printable menu exports and collateral                     | Manual dispatch or `/design/` updates    | `ai/scripts/package-render.mjs`               |
| `menu-data`       | Syncs structured data to collections and JSON caches               | On change to `/data/`           | `ai/scripts/data-sync.mjs`                    |
| `menu-analytics`  | Aggregates build stats or traffic snapshots into `/ai/logs/`       | Nightly                         | `ai/scripts/analytics.mjs`                    |

## 3. Capabilities Matrix
Each agent specifies:
- Inputs: files, directories, or env flags
- Outputs: rendered pages, optimized assets, JSON logs
- Context: GitHub Actions runner using Node.js ≥ 20
- Fallback: rollback via prior commit; artifacts rebuilt from `main`

## 4. Interaction Protocol
Agents communicate through file signaling and workflow logs:
- File queue: `/ai/_state/agents.json` (optional)
- Logs: `/ai/logs/<agent>.jsonl` via `ai/scripts/log-agent-run.mjs`
- Artifacts: `output/`, `_site/`, `dist/`, or framework-specific output

All agents must:
- Produce deterministic, idempotent outputs
- Avoid overwriting user-authored Markdown/templates
- Tag AI outputs in frontmatter or JSON with:
  ```yaml
  ai-generated: true
  ```

## 5. Autonomy & Oversight
- Agents execute independently via GitHub Actions
- PR review remains the final authority for content changes
- Conflict resolution precedence: data → layouts → assets

## 6. Data Boundaries
- No data leaves GitHub runners without explicit configuration
- Secrets live in `Settings → Secrets and variables → Actions`
- Only publishing workflows may push to production

## 7. Deployment
- Detects `package.json` and runs `npm ci && npm run build` if present
- Pages deployment remains in your existing Pages workflow (if used)
- Extend automation via `.github/workflows/ai-agents.yml`

## 8. Contributing Agents
1. Name with the chosen prefix (here `menu-<role>`)
2. Add a `README.md` in `ai/agents/<role>/` (optional)
3. Register status in `ai/_state/agents.json` (optional)
4. Test locally (`npm run build`) before committing
5. Ensure outputs are reversible via Git history

## 9. Versioning
This file is part of the **AI Integration Template v1.0**. Track changes in `CHANGELOG.md` or within this file.
