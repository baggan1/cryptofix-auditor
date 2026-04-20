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
        level: 'message', tag_number: null, tag_name: null,
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
        level: 'tag', tag_number: check.tag_number, tag_name: check.tag_name,
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
    pct: Math.round((tierEarned / tier.weight_total) * 100)
  };
  total += tierEarned;
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
