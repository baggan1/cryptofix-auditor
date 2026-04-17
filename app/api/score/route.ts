import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import os from 'os';

export async function POST(req: NextRequest) {
  try {
    const extraction = await req.json();

    if (!extraction || !extraction.checks || !extraction.exchange_name) {
      return NextResponse.json({ error: 'Invalid extraction payload' }, { status: 400 });
    }

    const { exchange_name, exchange_slug } = extraction;
    if (!exchange_slug) {
      return NextResponse.json({ error: 'Missing exchange_slug' }, { status: 400 });
    }

    const rubricFile = path.join(process.cwd(), 'cryptofix_master_rubric.json');
    if (!fs.existsSync(rubricFile)) {
      return NextResponse.json({ error: 'Rubric not found' }, { status: 500 });
    }

    const rubric = JSON.parse(fs.readFileSync(rubricFile, 'utf8'));
    const factors = { full_credit: 1.0, partial_credit: 0.5, no_credit: 0.0 };
    let total = 0;
    const tierScores: any = {};
    const details: any[] = [];

    rubric.tiers.forEach((tier: any) => {
      let earned = 0;
      tier.checks.forEach((check: any) => {
        const r = extraction.checks.find((c: any) => c.check_id === check.id);
        const f = r ? (factors[r.status as keyof typeof factors] ?? 0) : 0;
        const pts = (check.weight ?? 0) * f;
        earned += pts;
        total += pts;
        details.push({
          check_id: check.id,
          fix_tag: check.fix_tag,
          field_name: check.field_name,
          tier: tier.tier,
          weight: check.weight,
          status: r ? r.status : 'no_credit',
          points_earned: pts,
          points_available: check.weight,
          evidence: r ? r.evidence : null,
          asset_class_limitation: r ? r.asset_class_limitation : null
        });
      });
      tierScores[`tier${tier.tier}`] = {
        label: tier.label,
        earned,
        available: tier.weight_total,
        pct: Math.round((earned / tier.weight_total) * 100)
      };
    });

    const score = Math.round(total);
    let grade = 'Pre-institutional';
    if (score >= 90) grade = 'Institutional grade';
    else if (score >= 70) grade = 'Near-institutional';
    else if (score >= 50) grade = 'Partial';
    else if (score >= 30) grade = 'Basic';

    const gaps = details.filter(c => c.status !== 'full_credit').sort((a, b) => b.weight - a.weight);

    const report = {
      exchange_name,
      audit_date: extraction.extraction_date || new Date().toISOString(),
      total_score: score,
      max_score: 100,
      grade,
      tier_scores: tierScores,
      gap_count: gaps.length,
      gap_summary: gaps.map(c => ({
        check_id: c.check_id,
        fix_tag: c.fix_tag,
        field_name: c.field_name,
        tier: c.tier,
        status: c.status,
        points_lost: c.weight - c.points_earned,
        evidence: c.evidence
      })),
      full_detail: details
    };

    // Save to /tmp
    const tmpDir = path.join(os.tmpdir(), exchange_slug);
    fs.mkdirSync(tmpDir, { recursive: true });
    
    // Save report
    fs.writeFileSync(path.join(tmpDir, 'scored_report.json'), JSON.stringify(report, null, 2));

    return NextResponse.json({ success: true, slug: exchange_slug });
  } catch (error: any) {
    console.error('Score API Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
