export interface CheckResult {
  check_id: string;
  message_type: string;
  message_name: string;
  level: 'message' | 'tag';
  fix_tag: string | number | null;
  field_name: string;
  status: 'full_credit' | 'partial_credit' | 'no_credit';
  points_available: number;
  evidence: string | null;
  asset_class_limitation: string | null;
  custom_tag_notes: string | null;
}

export interface ScoredCheckResult extends CheckResult {
  tier: number;
}

export interface Tier5CheckResult {
  check_id: string;
  title: string;
  status: 'full_credit' | 'partial_credit' | 'no_credit';
  evidence: string | null;
  notes: string;
}

export interface ExtractionResult {
  exchange_name: string;
  spec_source: string;
  asset_classes_audited: string[];
  extraction_date: string;
  extractor_notes: string;
  checks: CheckResult[];
}

export interface TierScore {
  label: string;
  earned: number;
  available: number;
  pct: number;
  is_informational?: boolean;
}

export interface GapSummaryItem {
  check_id: string;
  fix_tag: string;
  field_name: string;
  tier: number;
  status: 'partial_credit' | 'no_credit';
  points_lost: number;
  evidence: string | null;
}

export interface Tier5Results {
  label: string;
  informational_only: true;
  ep273_ratified_checks: string[];
  tbd_checks: string[];
  checks: Tier5CheckResult[];
  summary: string;
}

export interface Tier6Results {
  label: string;
  score: number;
  max_score: number;
  checks: CheckResult[];
  summary: string;
}

export interface Tier7Results {
  label: string;
  score: number;
  max_score: number;
  checks: CheckResult[];
  summary: string;
}

export interface Tier8Results {
  label: string;
  score: number;
  max_score: number;
  checks: CheckResult[];
  summary: string;
}

export interface SeparateTierScore {
  label: string;
  earned: number;
  available: number;
  pct: number;
  grade: string;
}

export interface ComplianceSubScore {
  total: number;
  max: number;
  grade: string;
  tiers: Record<string, TierScore>;
  label: string;
  audience: string;
}

export interface MarketDataSubScore {
  total: number;
  max: number;
  grade: string;
  label: string;
  audience: string;
}

export interface ScoredReport {
  exchange_name: string;
  audit_date: string;
  inputType?: string;
  spec_source?: string;
  asset_classes_audited?: string[];
  total_score: number;
  max_score: number;
  grade: 'Institutional grade' | 'Near-institutional' | 'Partial' | 'Basic' | 'Pre-institutional';
  tier_scores: Record<string, TierScore>;
  compliance_sub_score: ComplianceSubScore;
  market_data_sub_score: MarketDataSubScore;
  gap_count: number;
  gap_summary: GapSummaryItem[];
  full_detail: ScoredCheckResult[];
  tier5_results?: Tier5Results;
}
