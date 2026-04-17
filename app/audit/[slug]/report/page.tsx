import React from 'react';
import { notFound } from 'next/navigation';
import fs from 'fs';
import path from 'path';
import PrintReport from '@/components/PrintReport';

import { ScoredReport, ExtractionResult } from '@/lib/types';

export async function generateStaticParams() {
  return [
    { slug: 'kraken' },
    { slug: 'coinbase-exchange' },
  ];
}

async function getReportData(slug: string): Promise<{ content: string; report: ScoredReport; gapImpacts: Record<string, string> } | null> {
  const roePath = path.join(process.cwd(), 'audits', slug, 'roe_document.md');
  const scoredPath = path.join(process.cwd(), 'audits', slug, 'scored_report.json');
  const extractionPath = path.join(process.cwd(), 'audits', slug, 'extraction_result.json');
  const rubricPath = path.join(process.cwd(), 'cryptofix_master_rubric.json');

  if (!fs.existsSync(roePath) || !fs.existsSync(scoredPath)) return null;

  const content = fs.readFileSync(roePath, 'utf8');
  let report: ScoredReport = JSON.parse(fs.readFileSync(scoredPath, 'utf8'));
  const gapImpacts: Record<string, string> = {};

  if (fs.existsSync(rubricPath)) {
    const rubric = JSON.parse(fs.readFileSync(rubricPath, 'utf8'));
    rubric.tiers.forEach((tier: any) => {
      tier.checks.forEach((check: any) => {
        if (check.institutional_gap_if_missing) {
          gapImpacts[check.id] = check.institutional_gap_if_missing;
        }
      });
    });
  }

  // Augment report with extraction data if available
  if (fs.existsSync(extractionPath)) {
    const ext: ExtractionResult = JSON.parse(fs.readFileSync(extractionPath, 'utf8'));
    report = {
      ...report,
      spec_source: ext.spec_source,
      asset_classes_audited: ext.asset_classes_audited
    };
  }

  return { content, report, gapImpacts };
}

export default async function ReportPage({ params }: { params: { slug: string } }) {
  const data = await getReportData(params.slug);
  if (!data) notFound();
  return <PrintReport 
    content={data.content} 
    report={data.report} 
    exchangeName={data.report.exchange_name} 
    gapImpacts={data.gapImpacts}
  />;
}
