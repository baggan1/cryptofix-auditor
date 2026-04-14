# CryptoFIX Auditor — project rules
# These rules apply to every agent interaction in this workspace.

## Files you must never modify
- `cryptofix_master_rubric.json` — this is source data, not generated output. Read it, never write it.
- `.antigravity/agents/*.yaml` — agent definitions are fixed unless I explicitly ask you to update them.
- `.antigravity/workflows/*.md` — workflow definitions are fixed unless I explicitly ask.
- `.gitignore`

## Files that are generated per-run (do not commit these)
- `extraction_result.json`
- `scored_report.json`
- `roe_document.md`
These are outputs of the audit pipeline. They get overwritten on each run. Never include them in a git commit.

## Security
- Never write API keys, secrets, or credentials into any file.
- Environment variables belong in `.env.local` (local only, gitignored) or Vercel dashboard.
- `.env.local` must always be in `.gitignore` — check before any commit suggestion.

## Code style
- TypeScript strict mode for all `.ts` and `.tsx` files.
- No `any` types without an explicit comment explaining why.
- All API routes go in `/app/api/` following Next.js app router conventions.

## Commit hygiene
- Never suggest or run `git push` automatically. Always stop and ask me to review before pushing.
- Commit messages: `type: short description` — e.g. `feat: add scorer`, `fix: extraction prompt`, `docs: update README`.

## Rubric integrity
- The scoring formula is: `points_earned = check.weight * score_factor` where score_factor is 1.0 / 0.5 / 0.0.
- Never change check weights or scoring logic without explicit instruction.
- If you are unsure whether a FIX field is present in a spec, default to `partial_credit`, not `full_credit`.