import React from 'react';
import { notFound } from 'next/navigation';
import fs from 'fs';
import path from 'path';
import PrintReport from '@/components/PrintReport';

export async function generateStaticParams() {
  return [
    { slug: 'kraken' },
    { slug: 'coinbase-exchange' },
  ];
}

async function getRoEDocument(slug: string): Promise<{ content: string, exchangeName: string } | null> {
  const filePath = path.join(process.cwd(), 'audits', slug, 'roe_document.md');
  const scoredReportPath = path.join(process.cwd(), 'audits', slug, 'scored_report.json');
  if (!fs.existsSync(filePath)) return null;
  const content = fs.readFileSync(filePath, 'utf8');
  let exchangeName = slug;
  if (fs.existsSync(scoredReportPath)) {
    const report = JSON.parse(fs.readFileSync(scoredReportPath, 'utf8'));
    exchangeName = report.exchange_name;
  }
  return { content, exchangeName };
}

export default async function ReportPage({ params }: { params: { slug: string } }) {
  const doc = await getRoEDocument(params.slug);
  if (!doc) notFound();
  return <PrintReport content={doc.content} exchangeName={doc.exchangeName} />;
}
