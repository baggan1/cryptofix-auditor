import rubricData from '../cryptofix_master_rubric.json';

export interface Rubric {
  meta: any;
  scoring: {
    max_score: number;
    tier_weights: Record<string, number>;
    compliance_sub_score: {
      tiers: number[];
      max: number;
      tier4_weight: number;
      tier6_weight: number;
      label: string;
      audience: string;
    };
    market_data_sub_score: {
      tiers: number[];
      max: number;
      label: string;
      audience: string;
    };
    scoring_guide: Record<string, string>;
  };
  tiers: {
    tier: number;
    id: string;
    label: string;
    description?: string;
    weight_total: number;
    informational_only?: boolean;
    separate_score?: boolean;
    separate_score_label?: string;
    scoring_guide?: Record<string, string>;
    checks: {
      id: string;
      message_type: string;
      message_name: string;
      level: 'message' | 'tag';
      fix_tag: number | null;
      field_name: string | null;
      weight: number;
      required: boolean;
      conditional?: boolean;
      condition_note?: string;
      description: string;
      fix_reference?: string;
      valid_values?: Record<string, string>;
      institutional_gap_if_missing?: string;
      scoring_logic: Record<string, string>;
    }[];
  }[];
}

export const rubric = rubricData as unknown as Rubric;

export function getRubric() {
  return rubric;
}
