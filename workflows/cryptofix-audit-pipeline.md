---
name: cryptofix-audit-pipeline
description: >
  CryptoFIX institutional readiness audit pipeline.
  Accepts a FIX spec as a URL or uploaded PDF.
  Produces a scored JSON report and a Rules of Engagement document.
  Outputs are isolated per exchange under audits/{exchange_slug}/.
inputs:
  - name: exchange_name
    description: Name of the exchange (e.g. "Kraken", "Coinbase Exchange")
    required: true
  - name: spec_source
    description: >
      URL to the exchange FIX API docs, "multi-url" (you will list URLs in
      the prompt), or a PDF filename already in the workspace root.
    required: true
  - name: asset_classes
    description: Comma-separated asset classes (e.g. "spot, futures")
    default: "spot"
outputs:
  - "audits/{{exchange_slug}}/extraction_result.json"
  - "audits/{{exchange_slug}}/scored_report.json"
  - "audits/{{exchange_slug}}/roe_document.md"
derived_inputs:
  - name: exchange_slug
    description: >
      Auto-derived from exchange_name: lowercase, spaces to hyphens,
      special chars stripped. "Kraken" → "kraken",
      "Coinbase Exchange" → "coinbase-exchange"
---

# CryptoFIX audit pipeline

## Step 0 — Create output folder

// turbo

Run this inline Node.js one-liner to derive the slug and create the output folder:

```javascript
const fs = require('fs');
const name = process.argv[2];
const slug = name.toLowerCase().replace(/[^a-z0-9\s-]/g,'').trim().replace(/\s+/g,'-');
const dir = `audits/${slug}`;
fs.mkdirSync(dir, { recursive: true });
fs.writeFileSync(`${dir}/.exchange`, JSON.stringify({ name, slug, created: new Date().toISOString() }));
console.log(`Slug: ${slug} | Folder: ${dir}`);
```

Run as: `node -e "<script>" "{{exchange_name}}"`

Record the slug — used as `{{exchange_slug}}` in all subsequent steps.

---

## Step 1 — Extract FIX spec

// turbo

**Agent:** fix-extractor

**Before starting:** Read `.antigravity/instructions/extract-instructions.md`
for full extraction rules, scoring criteria, and output format.

**Inputs:**
- Rubric: `cryptofix_master_rubric.json`
- Spec: `{{spec_source}}` — URL to fetch, "multi-url" (see prompt for URL list),
  or PDF filename in workspace root

**Output:** `audits/{{exchange_slug}}/extraction_result.json`
covering all checks (T1 through T8).

---

## Step 2 — Score

// turbo

**Agent:** (Node.js — no AI)

Create and run `score.js`:

```javascript
const fs = require('fs');
const slug = process.argv[2];
const dir = `audits/${slug}`;
const rubric = JSON.parse(fs.readFileSync('cryptofix_master_rubric.json'));
const extraction = JSON.parse(fs.readFileSync(`${dir}/extraction_result.json`));
const factors = { full_credit: 1.0, partial_credit: 0.5, no_credit: 0.0 };
let total = 0;
const tierScores = {};
const details = [];

rubric.tiers.forEach(tier => {
  let earned = 0;
  tier.checks.forEach(check => {
    const r = extraction.checks.find(c => c.check_id === check.id);
    const f = r ? (factors[r.status] ?? 0) : 0;
    const pts = check.weight * f;
    earned += pts; total += pts;
    details.push({
      check_id: check.id, fix_tag: check.fix_tag, field_name: check.field_name,
      tier: tier.tier, weight: check.weight, status: r ? r.status : 'no_credit',
      points_earned: pts, points_available: check.weight,
      evidence: r ? r.evidence : null,
      asset_class_limitation: r ? r.asset_class_limitation : null
    });
  });
  tierScores[`tier${tier.tier}`] = {
    label: tier.label, earned, available: tier.weight_total,
    pct: Math.round((earned / tier.weight_total) * 100)
  };
});

const score = Math.round(total);
const grade = score>=90?'Institutional grade':score>=70?'Near-institutional':score>=50?'Partial':score>=30?'Basic':'Pre-institutional';
const gaps = details.filter(c=>c.status!=='full_credit').sort((a,b)=>b.weight-a.weight);

fs.writeFileSync(`${dir}/scored_report.json`, JSON.stringify({
  exchange_name: extraction.exchange_name,
  audit_date: extraction.extraction_date,
  total_score: score, max_score: 100, grade,
  tier_scores: tierScores,
  gap_count: gaps.length,
  gap_summary: gaps.map(c=>({ check_id:c.check_id, fix_tag:c.fix_tag,
    field_name:c.field_name, tier:c.tier, status:c.status,
    points_lost: c.weight-c.points_earned, evidence:c.evidence })),
  full_detail: details
}, null, 2));

console.log(`Score: ${score}/100 — ${grade} | Gaps: ${gaps.length}`);
Object.values(tierScores).forEach(t=>console.log(`  ${t.label}: ${t.earned}/${t.available} (${t.pct}%)`));
```

Run: `node score.js {{exchange_slug}}`

---

## Step 3 — Generate RoE document

**Agent:** roe-generator

**Before starting:** Read `.antigravity/instructions/roe-template.md`
for the complete 11-section document structure and formatting rules.

**Inputs:**
1. `cryptofix_master_rubric.json` — institutional rationale and tradfi references per check
2. `audits/{{exchange_slug}}/scored_report.json` — scores, tier results, gap list
3. `audits/{{exchange_slug}}/extraction_result.json` — evidence strings, extractor notes

**Output:** `audits/{{exchange_slug}}/roe_document.md`

Replace all EXCHANGE_NAME and SLUG placeholders with real values.
Replace all [bracketed] placeholders with data from the input files.

After writing, print one line:
`Done: audits/{{exchange_slug}}/roe_document.md | Score: [XX]/100 ([Grade]) | Gaps: [N]`
