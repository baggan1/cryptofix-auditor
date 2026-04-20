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
  // Group checks by message_type
  const byMessage = {};
  tier.checks.forEach(check => {
    const mt = check.message_type;
    if (!byMessage[mt]) byMessage[mt] = { message: null, tags: [] };
    if (check.level === 'message') byMessage[mt].message = check;
    else byMessage[mt].tags.push(check);
  });

  let tierEarned = 0;
  Object.entries(byMessage).forEach(([msgType, group]) => {
    // Score message-level check (if exists)
    let msgFactor = 0;
    if (group.message) {
      const msgResult = extraction.checks.find(c => c.check_id === group.message.id);
      msgFactor = factors[msgResult?.status ?? 'no_credit'] ?? 0;
      const pts = group.message.weight * msgFactor;
      tierEarned += pts;
      details.push({
        check_id: group.message.id, message_type: msgType, message_name: group.message.message_name,
        level: 'message', fix_tag: null, field_name: null,
        tier: tier.tier, weight: group.message.weight, status: msgResult ? msgResult.status : 'no_credit',
        points_earned: pts, points_available: group.message.weight,
        evidence: msgResult ? msgResult.evidence : null
      });
    }

    // Score tag-level checks
    group.tags.forEach(check => {
      const result = extraction.checks.find(c => c.check_id === check.id);
      const factor = factors[result?.status ?? 'no_credit'] ?? 0;
      const pts = check.weight * factor;
      tierEarned += pts;
      details.push({
        check_id: check.id, message_type: msgType, message_name: check.message_name,
        level: 'tag', fix_tag: check.fix_tag, field_name: check.field_name,
        tier: tier.tier, weight: check.weight, status: result ? result.status : 'no_credit',
        points_earned: pts, points_available: check.weight,
        evidence: result ? result.evidence : null
      });
    });
  });

  tierEarned = Math.min(tierEarned, tier.weight_total); // cap at tier max
  tierScores[`tier${tier.tier}`] = {
    label: tier.label,
    earned: Math.round(tierEarned * 10) / 10,
    available: tier.weight_total,
    pct: tier.weight_total > 0 ? Math.round((tierEarned / tier.weight_total) * 100) : 0
  };
  
  if (tier.tier <= 4) {
    total += tierEarned;
  }
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
  full_detail: details,
  tier5_results: {
    label: rubric.tiers.find(t=>t.tier===5).label,
    informational_only: true,
    checks: details.filter(d=>d.tier===5).map(d=>({
      check_id: d.check_id, title: d.field_name, status: d.status,
      evidence: d.evidence, notes: "DAWG Extension"
    })),
    summary: `${details.filter(d=>d.tier===5 && d.status!=='no_credit').length} checks present`
  },
  tier6_results: {
    label: rubric.tiers.find(t=>t.tier===6).label,
    score: tierScores.tier6.earned,
    max_score: tierScores.tier6.available,
    checks: details.filter(d=>d.tier===6),
    summary: `Score ${tierScores.tier6.earned}/${tierScores.tier6.available}`
  },
  tier7_results: {
    label: rubric.tiers.find(t=>t.tier===7).label,
    score: tierScores.tier7.earned,
    max_score: tierScores.tier7.available,
    checks: details.filter(d=>d.tier===7),
    summary: `Score ${tierScores.tier7.earned}/${tierScores.tier7.available}`
  },
  tier8_results: {
    label: rubric.tiers.find(t=>t.tier===8).label,
    score: tierScores.tier8.earned,
    max_score: tierScores.tier8.available,
    checks: details.filter(d=>d.tier===8),
    summary: `Score ${tierScores.tier8.earned}/${tierScores.tier8.available}`
  }
};

// Separate scoring for Tiers 6, 7, 8
const separateTierScores = {};
[6, 7, 8].forEach(tierNum => {
  const tier = rubric.tiers.find(t => t.tier === tierNum);
  if (!tier) return;

  const earned = tierScores[`tier${tierNum}`].earned;
  const label = tier.separate_score_label || tier.label;
  const guide = tier.scoring_guide;
  let grade = 'Not available';
  if (earned >= 8) grade = guide["8-10"];
  else if (earned >= 5) grade = guide["5-7"];
  else grade = guide["0-4"];

  separateTierScores[`tier${tierNum}`] = {
    label,
    earned,
    available: tier.weight_total,
    pct: Math.round((earned / tier.weight_total) * 100),
    grade
  };
});

report.separate_tier_scores = separateTierScores;

fs.writeFileSync(`${dir}/scored_report.json`, JSON.stringify(report, null, 2));

console.log(`Score: ${score}/100 — ${grade} | Gaps: ${gaps.length}`);
Object.values(tierScores).forEach(t=>console.log(`  ${t.label}: ${t.earned}/${t.available} (${t.pct}%)`));
