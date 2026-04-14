const fs = require('fs');
const slug = process.argv[2];
if (!slug) {
  console.error('Usage: node score.js <exchange-slug>');
  process.exit(1);
}

const dir = `audits/${slug}`;
if (!fs.existsSync(dir)) {
  console.error(`Error: Directory ${dir} not found.`);
  process.exit(1);
}

const rubricFile = 'cryptofix_master_rubric.json';
const extractionFile = `${dir}/extraction_result.json`;

if (!fs.existsSync(rubricFile)) {
  console.error(`Error: ${rubricFile} not found.`);
  process.exit(1);
}
if (!fs.existsSync(extractionFile)) {
  console.error(`Error: ${extractionFile} not found.`);
  process.exit(1);
}

const rubric = JSON.parse(fs.readFileSync(rubricFile));
const extraction = JSON.parse(fs.readFileSync(extractionFile));
const factors = { full_credit: 1.0, partial_credit: 0.5, no_credit: 0.0 };
let total = 0;
const tierScores = {};
const details = [];

rubric.tiers.forEach(tier => {
  let earned = 0;
  tier.checks.forEach(check => {
    const r = extraction.checks.find(c => c.check_id === check.id);
    const f = r ? (factors[r.status] ?? 0) : 0;
    const pts = (check.weight ?? 0) * f;
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
let grade = 'Pre-institutional';
if (score >= 90) grade = 'Institutional grade';
else if (score >= 70) grade = 'Near-institutional';
else if (score >= 50) grade = 'Partial';
else if (score >= 30) grade = 'Basic';

const gaps = details.filter(c=>c.status!=='full_credit').sort((a,b)=>b.weight-a.weight);

const report = {
  exchange_name: extraction.exchange_name,
  audit_date: extraction.extraction_date,
  total_score: score, max_score: 100, grade,
  tier_scores: tierScores,
  gap_count: gaps.length,
  gap_summary: gaps.map(c=>({ check_id:c.check_id, fix_tag:c.fix_tag,
    field_name:c.field_name, tier:c.tier, status:c.status,
    points_lost: c.weight-c.points_earned, evidence:c.evidence })),
  full_detail: details
};

fs.writeFileSync(`${dir}/scored_report.json`, JSON.stringify(report, null, 2));

console.log(`Score: ${score}/100 — ${grade} | Gaps: ${gaps.length}`);
Object.values(tierScores).forEach(t=>console.log(`  ${t.label}: ${t.earned}/${t.available} (${t.pct}%)`));
