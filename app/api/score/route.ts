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
      // Group checks by message_type
      const byMessage: Record<string, { message: any, tags: any[] }> = {};
      tier.checks.forEach((check: any) => {
        const mt = check.message_type;
        if (!byMessage[mt]) byMessage[mt] = { message: null, tags: [] };
        if (check.level === 'message') byMessage[mt].message = check;
        else byMessage[mt].tags.push(check);
      });

      let tierEarned = 0;
      Object.entries(byMessage).forEach(([msgType, group]) => {
        // Score message-level check
        if (group.message) {
          const r = extraction.checks.find((c: any) => c.check_id === group.message.id);
          const st = r ? (r.status || 'no_credit') : 'no_credit';
          const f = factors[st as keyof typeof factors] ?? 0;
          const pts = group.message.weight * f;
          tierEarned += pts;
          details.push({
            check_id: group.message.id,
            message_type: msgType,
            message_name: group.message.message_name,
            level: 'message',
            fix_tag: null,
            field_name: group.message.field_name || group.message.message_name,
            status: st,
            points_earned: pts,
            points_available: group.message.weight,
            evidence: r ? r.evidence : null,
            asset_class_limitation: r ? r.asset_class_limitation : null,
            tier: tier.tier
          });
        }

        // Score tag-level checks
        group.tags.forEach((check: any) => {
          const r = extraction.checks.find((c: any) => c.check_id === check.id);
          const st = r ? (r.status || 'no_credit') : 'no_credit';
          const f = factors[st as keyof typeof factors] ?? 0;
          const pts = check.weight * f;
          tierEarned += pts;
          details.push({
            check_id: check.id,
            message_type: msgType,
            message_name: check.message_name,
            level: 'tag',
            fix_tag: check.fix_tag,
            field_name: check.field_name,
            status: st,
            points_earned: pts,
            points_available: check.weight,
            evidence: r ? r.evidence : null,
            asset_class_limitation: r ? r.asset_class_limitation : null,
            tier: tier.tier
          });
        });
      });

      tierEarned = Math.min(tierEarned, tier.weight_total);
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

    const gaps = details.filter((c: any) => c.status !== 'full_credit').sort((a: any, b: any) => b.weight - a.weight);

    const report: any = {
      exchange_name,
      audit_date: extraction.extraction_date || new Date().toISOString(),
      total_score: score,
      max_score: 100,
      grade,
      tier_scores: tierScores,
      gap_count: gaps.length,
      gap_summary: gaps.map((c: any) => ({
        check_id: c.check_id,
        fix_tag: c.fix_tag,
        field_name: c.field_name,
        tier: c.tier,
        status: c.status,
        points_lost: c.points_available - c.points_earned,
        evidence: c.evidence
      })),
      full_detail: details,
      tier5_results: {
        label: rubric.tiers.find((t: any) => t.tier === 5).label,
        informational_only: true,
        checks: details.filter((d: any) => d.tier === 5).map((d: any) => ({
          check_id: d.check_id, title: d.field_name, status: d.status,
          evidence: d.evidence, notes: "DAWG Extension"
        })),
        summary: `${details.filter((d: any) => d.tier === 5 && d.status !== 'no_credit').length} checks present`
      },
      tier6_results: {
        label: rubric.tiers.find((t: any) => t.tier === 6).label,
        score: tierScores.tier6.earned,
        max_score: tierScores.tier6.available,
        checks: details.filter((d: any) => d.tier === 6),
        summary: `Score ${tierScores.tier6.earned}/${tierScores.tier6.available}`
      },
      tier7_results: {
        label: rubric.tiers.find((t: any) => t.tier === 7).label,
        score: tierScores.tier7.earned,
        max_score: tierScores.tier7.available,
        checks: details.filter((d: any) => d.tier === 7),
        summary: `Score ${tierScores.tier7.earned}/${tierScores.tier7.available}`
      }
    };

    // Save to /tmp or local project directory if not in production
    const exchangeDir = path.join(process.cwd(), 'audits', exchange_slug);
    if (fs.existsSync(exchangeDir)) {
      fs.writeFileSync(path.join(exchangeDir, 'scored_report.json'), JSON.stringify(report, null, 2));
    }

    return NextResponse.json({ success: true, slug: exchange_slug, report });
  } catch (error: any) {
    console.error('Score API Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
