import rubricData from '../cryptofix_master_rubric.json';

export interface Rubric {
  meta: any;
  scoring: {
    max_score: number;
    tier5_max_informational: number;
    tier_weights: Record<string, number>;
    scoring_logic: Record<string, number>;
  };
  tiers: {
    tier: number;
    id: string;
    label: string;
    description: string;
    weight_total: number;
    checks: {
      id: string;
      fix_tag: string;
      field_name: string;
      weight: number;
      required: boolean;
      description: string;
      scoring_logic: Record<string, string>;
    }[];
  }[];
}

export const rubric = rubricData as unknown as Rubric;

export function getRubric() {
  return rubric;
}
