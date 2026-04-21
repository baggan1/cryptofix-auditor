import { rubric } from './rubric';
import { 
  ExtractionResult, 
  ScoredReport, 
  TierScore, 
  GapSummaryItem, 
  CheckResult,
  Tier5Results,
  Tier5CheckResult,
  Tier6Results,
  Tier7Results,
  Tier8Results,
  SeparateTierScore
} from './types';

export function scoreExtraction(extraction: ExtractionResult): ScoredReport {
  const factors: Record<string, number> = { 
    full_credit: 1.0, 
    partial_credit: 0.5, 
    no_credit: 0.0 
  };

  // Helper: score a single tier's checks
  function scoreTier(tier: any, extractionChecks: any[]) {
    let earned = 0;
    const details: CheckResult[] = [];
    tier.checks.forEach((check: any) => {
      const r = extractionChecks.find(c => c.check_id === check.id);
      const f = factors[r?.status ?? 'no_credit'] ?? 0;
      const pts = check.weight * f;
      earned += pts;
      details.push({
        check_id: check.id,
        fix_tag: check.fix_tag ?? check.tag_number?.toString() ?? '',
        field_name: check.field_name ?? check.tag_name ?? '',
        message_type: check.message_type ?? '',
        message_name: check.message_name ?? '',
        level: check.level,
        tier: tier.tier,
        status: (r?.status ?? 'no_credit') as any,
        points_available: check.weight,
        evidence: r?.evidence ?? null,
        asset_class_limitation: r?.asset_class_limitation ?? null,
        custom_tag_notes: null
      });
    });
    return { earned: Math.round(earned * 10) / 10, details };
  }

  // PART A — Main score (T1, T2, T3, T8)
  const MAIN_TIERS = [1, 2, 3, 8];
  let mainTotal = 0;
  const tierScores: Record<string, TierScore> = {};
  const allDetails: CheckResult[] = [];

  MAIN_TIERS.forEach(tierNum => {
    const tier = rubric.tiers.find(t => t.tier === tierNum);
    if (!tier) return;
    const { earned, details } = scoreTier(tier, extraction.checks);
    const cap = (rubric.scoring.tier_weights as any)[`tier${tier.tier}_${tier.id}`] ?? tier.weight_total;
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
  const grade = mainScore >= 90 ? 'Institutional grade'
    : mainScore >= 70 ? 'Near-institutional'
    : mainScore >= 50 ? 'Partial'
    : mainScore >= 30 ? 'Basic'
    : 'Pre-institutional';

  // PART B — Compliance sub-score (T4 + T6)
  const complianceCfg = rubric.scoring.compliance_sub_score as any;
  let complianceTotal = 0;
  const complianceDetails: Record<string, TierScore> = {};

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
  const complianceGrade = complianceTotal >= 12 ? 'Compliance ready'
    : complianceTotal >= 7 ? 'Partial compliance coverage'
    : 'Significant compliance gaps';

  // PART C — Market data sub-score (T7)
  const mdCfg = rubric.scoring.market_data_sub_score as any;
  const tier7 = rubric.tiers.find(t => t.tier === 7);
  let mdScore = 0;
  if (tier7) {
    const { earned, details } = scoreTier(tier7, extraction.checks);
    mdScore = Math.min(Math.round(earned * 10) / 10, mdCfg.max);
    allDetails.push(...details);
  }
  const mdGrade = mdScore >= 4 ? 'Full market data feed'
    : mdScore >= 2 ? 'Partial' : 'Not available';

  // Tier 5 Informational
  const tier5Rubric = rubric.tiers.find(t => t.tier === 5);
  let tier5Results: Tier5Results | undefined;
  if (tier5Rubric) {
    const { details } = scoreTier(tier5Rubric, extraction.checks);
    tier5Results = {
      label: tier5Rubric.label,
      informational_only: true,
      ep273_ratified_checks: ["T5_001", "T5_002", "T5_003"],
      tbd_checks: ["T5_004", "T5_005"],
      checks: details.map(d => ({
        check_id: d.check_id, title: d.field_name, status: d.status,
        evidence: d.evidence, notes: "DAWG Extension"
      })),
      summary: `${details.filter(d => d.status !== 'no_credit').length} checks present`
    };
  }

  // Gaps
  const gapItems = allDetails
    .filter(c => c.status !== 'full_credit')
    .map(c => ({
      check_id: c.check_id,
      fix_tag: String(c.fix_tag),
      field_name: c.field_name,
      tier: c.tier,
      status: c.status as any,
      points_lost: Math.round((c.points_available - (factors[c.status] * c.points_available)) * 10) / 10,
      evidence: c.evidence
    }))
    .filter(c => c.points_lost > 0)
    .sort((a, b) => b.points_lost - a.points_lost);

  return {
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
    gap_count: gapItems.length,
    gap_summary: gapItems,
    full_detail: allDetails,
    tier5_results: tier5Results
  };
}
