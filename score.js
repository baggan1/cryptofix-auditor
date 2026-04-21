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

// Helper: score a single tier's checks
function scoreTier(tier, extractionChecks) {
  let earned = 0;
  const details = [];
  tier.checks.forEach(check => {
    const r = extractionChecks.find(c => c.check_id === check.id);
    const f = factors[r?.status ?? 'no_credit'] ?? 0;
    const pts = check.weight * f;
    earned += pts;
    details.push({
      check_id: check.id,
      fix_tag: check.fix_tag ?? check.tag_number?.toString() ?? '',
      field_name: check.field_name ?? check.tag_name ?? '',
      message_type: check.message_type ?? '',
      tier: tier.tier,
      weight: check.weight,
      status: r?.status ?? 'no_credit',
      points_earned: Math.round(pts * 10) / 10,
      points_available: check.weight,
      evidence: r?.evidence ?? null,
      asset_class_limitation: r?.asset_class_limitation ?? null
    });
  });
  return { earned: Math.round(earned * 10) / 10, details };
}

// PART A — Main score (T1, T2, T3, T8)
const MAIN_TIERS = [1, 2, 3, 8];
let mainTotal = 0;
const tierScores = {};
const allDetails = [];

MAIN_TIERS.forEach(tierNum => {
  const tier = rubric.tiers.find(t => t.tier === tierNum);
  if (!tier) return;
  const { earned, details } = scoreTier(tier, extraction.checks);
  const cap = rubric.scoring.tier_weights[`tier${tier.tier}_${tier.id}`] ?? tier.weight_total;
  const capped = Math.min(earned, cap);
  mainTotal += capped;
  allDetails.push(...details);
  tierScores[`tier${tier.tier}`] = {
    label: tier.label,
    earned: capped,
    available: cap,
    pct: Math.round((capped / cap) * 100)
  };
});

mainTotal = Math.min(Math.round(mainTotal * 10) / 10, 100);
const mainScore = mainTotal;
const grades = rubric.scoring.scoring_guide;
const grade = mainScore >= 90 ? 'Institutional grade'
  : mainScore >= 70 ? 'Near-institutional'
  : mainScore >= 50 ? 'Partial'
  : mainScore >= 30 ? 'Basic'
  : 'Pre-institutional';

// PART B — Compliance sub-score (T4 + T6)
const complianceCfg = rubric.scoring.compliance_sub_score;
let complianceTotal = 0;
const complianceDetails = {};

[4, 6].forEach(tierNum => {
  const tier = rubric.tiers.find(t => t.tier === tierNum);
  if (!tier) return;
  const cap = tierNum === 4 ? complianceCfg.tier4_weight : complianceCfg.tier6_weight;
  const { earned, details } = scoreTier(tier, extraction.checks);
  const capped = Math.min(earned, cap);
  complianceTotal += capped;
  allDetails.push(...details);
  complianceDetails[`tier${tierNum}`] = {
    label: tier.label,
    earned: capped,
    available: cap,
    pct: Math.round((capped / cap) * 100)
  };
});

complianceTotal = Math.min(Math.round(complianceTotal * 10) / 10, complianceCfg.max);
const complianceGuide = complianceCfg.scoring_guide;
const complianceGrade = complianceTotal >= 12 ? 'Compliance ready'
  : complianceTotal >= 7 ? 'Partial compliance coverage'
  : 'Significant compliance gaps';

// PART C — Market data sub-score (T7)
const mdCfg = rubric.scoring.market_data_sub_score;
const tier7 = rubric.tiers.find(t => t.tier === 7);
let mdScore = 0;
if (tier7) {
  const { earned, details } = scoreTier(tier7, extraction.checks);
  mdScore = Math.min(Math.round(earned * 10) / 10, mdCfg.max);
  allDetails.push(...details);
}
const mdGrade = mdScore >= 4 ? 'Full market data feed'
  : mdScore >= 2 ? 'Partial'
  : 'Not available';

// Gaps — all tiers including compliance and market data
const gaps = allDetails
  .filter(c => c.status !== 'full_credit')
  .sort((a, b) => (b.points_available - b.points_earned) - (a.points_available - a.points_earned));

// Build report
const report = {
  exchange_name: extraction.exchange_name,
  audit_date: extraction.extraction_date,
  total_score: mainScore,
  max_score: 100,
  grade,
  tier_scores: tierScores,
  compliance_sub_score: {
    total: complianceTotal,
    max: complianceCfg.max,
    grade: complianceGrade,
    tiers: complianceDetails,
    label: complianceCfg.label,
    audience: complianceCfg.audience
  },
  market_data_sub_score: {
    total: mdScore,
    max: mdCfg.max,
    grade: mdGrade,
    label: mdCfg.label,
    audience: mdCfg.audience
  },
  gap_count: gaps.filter(c => c.points_available - c.points_earned > 0).length,
  gap_summary: gaps.map(c => ({
    check_id: c.check_id,
    fix_tag: c.fix_tag,
    field_name: c.field_name,
    message_type: c.message_type,
    tier: c.tier,
    status: c.status,
    points_lost: Math.round((c.points_available - c.points_earned) * 10) / 10,
    evidence: c.evidence
  })).filter(c => c.points_lost > 0),
  full_detail: allDetails
};

// Add Tier 5 informational
const tier5 = rubric.tiers.find(t => t.tier === 5);
if (tier5) {
  const { details } = scoreTier(tier5, extraction.checks);
  tierScores[`tier5`] = {
    label: tier5.label,
    earned: 0,
    available: 0,
    pct: 0,
    is_informational: true
  };
  allDetails.push(...details); // Ensure Tier 5 details are in allDetails
  report.tier5_results = {
    label: tier5.label,
    informational_only: true,
    checks: details.map(d => ({
      check_id: d.check_id, title: d.field_name, status: d.status,
      evidence: d.evidence, notes: "DAWG Extension"
    })),
    summary: `${details.filter(d => d.status !== 'no_credit').length} checks present`
  };
}

fs.writeFileSync(`${dir}/scored_report.json`, JSON.stringify(report, null, 2));
console.log(`\nMain score:       ${mainScore}/100 — ${grade}`);
console.log(`Compliance score: ${complianceTotal}/15 — ${complianceGrade}`);
console.log(`Market data:      ${mdScore}/5 — ${mdGrade}`);
console.log(`Gaps: ${report.gap_count}`);
Object.values(tierScores).forEach(t =>
  console.log(`  ${t.label}: ${t.earned}/${t.available} (${t.pct}%)`)
);
