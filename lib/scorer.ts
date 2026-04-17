import { rubric } from './rubric';
import { 
  ExtractionResult, 
  ScoredReport, 
  TierScore, 
  GapSummaryItem, 
  CheckResult,
  Tier5Results,
  Tier5CheckResult
} from './types';

export function scoreExtraction(extraction: ExtractionResult): ScoredReport {
  const factors: Record<string, number> = { 
    full_credit: 1.0, 
    partial_credit: 0.5, 
    no_credit: 0.0 
  };
  
  let totalScore = 0;
  const tierScores: Record<string, TierScore> = {};
  const fullDetail: CheckResult[] = [];
  const gaps: GapSummaryItem[] = [];

  // Tiers 1-4 are scored
  rubric.tiers.forEach(tier => {
    if (tier.tier > 4) return;

    let earned = 0;
    tier.checks.forEach(check => {
      const result = extraction.checks.find(c => c.check_id === check.id);
      const status = result?.status || 'no_credit';
      const factor = factors[status] || 0;
      const pts = check.weight * factor;
      
      earned += pts;
      totalScore += pts;

      const detail: CheckResult = {
        check_id: check.id,
        fix_tag: check.fix_tag,
        field_name: check.field_name,
        status: status,
        points_available: check.weight,
        evidence: result?.evidence || null,
        asset_class_limitation: result?.asset_class_limitation || null,
        custom_tag_notes: result?.custom_tag_notes || null
      };
      
      fullDetail.push(detail);

      if (status !== 'full_credit') {
        gaps.push({
          check_id: check.id,
          fix_tag: check.fix_tag,
          field_name: check.field_name,
          tier: tier.tier,
          status: status as 'partial_credit' | 'no_credit',
          points_lost: check.weight - pts,
          evidence: detail.evidence
        });
      }
    });

    tierScores[`tier${tier.tier}`] = {
      label: tier.label,
      earned,
      available: tier.weight_total,
      pct: Math.round((earned / tier.weight_total) * 100)
    };
  });

  const finalScore = Math.round(totalScore);
  let grade: ScoredReport['grade'] = 'Pre-institutional';
  if (finalScore >= 90) grade = 'Institutional grade';
  else if (finalScore >= 70) grade = 'Near-institutional';
  else if (finalScore >= 50) grade = 'Partial';
  else if (finalScore >= 30) grade = 'Basic';

  // Tier 5 (DAWG)
  const tier5Rubric = rubric.tiers.find(t => t.tier === 5);
  let tier5Results: Tier5Results | undefined;
  
  if (tier5Rubric) {
    const tier5Checks: Tier5CheckResult[] = tier5Rubric.checks.map(check => {
      const result = extraction.checks.find(c => c.check_id === check.id);
      return {
        check_id: check.id,
        title: check.field_name,
        status: result?.status || 'no_credit',
        evidence: result?.evidence || null,
        notes: "Informational only — does not affect score"
      };
    });

    const presentCount = tier5Checks.filter(c => c.status !== 'no_credit').length;

    tier5Results = {
      label: tier5Rubric.label,
      informational_only: true,
      ep273_ratified_checks: ["T5_001", "T5_002", "T5_003"],
      tbd_checks: ["T5_004", "T5_005"],
      checks: tier5Checks,
      summary: `${presentCount} of ${tier5Checks.length} DAWG extension checks present or partially implemented`
    };
  }

  return {
    exchange_name: extraction.exchange_name,
    audit_date: extraction.extraction_date,
    total_score: finalScore,
    max_score: 100,
    grade,
    tier_scores: tierScores,
    gap_count: gaps.length,
    gap_summary: gaps.sort((a, b) => b.points_lost - a.points_lost).slice(0, 10),
    full_detail: fullDetail,
    tier5_results: tier5Results
  };
}
