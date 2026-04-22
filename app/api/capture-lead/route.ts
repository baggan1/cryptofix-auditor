import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { Resend } from 'resend';
import { getScoredReport } from '@/lib/audits';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const { email, company, role, exchange_name, audit_slug, opt_in } = await req.json();

    if (!email || !audit_slug) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // 1. Insert into Supabase
    const { error: supabaseError } = await supabase
      .from('audit_leads')
      .insert([
        { 
          email, 
          company, 
          role, 
          exchange_name, 
          audit_slug, 
          opt_in 
        }
      ]);

    if (supabaseError) {
      console.error('Supabase error:', supabaseError);
      // We continue even if DB insert fails to send the email, or should we abort?
      // Usually better to at least try sending the lead notification.
    }

    // Fetch report data for the confirmation email
    const report = await getScoredReport(audit_slug);
    const score = report ? report.total_score : 'XX';
    const grade = report ? report.grade : 'N/A';
    const exchange = exchange_name || (report ? report.exchange_name : 'Exchange');

    const timestamp = new Date().toLocaleString();

    // 2. Send notification to admin
    await resend.emails.send({
      from: 'CryptoFIX Auditor <system@send.opound.com>',
      to: 'navilla.bagga@gmail.com',
      subject: `New CryptoFIX audit lead — ${exchange}`,
      text: `
Email: ${email}
Company: ${company || 'N/A'}
Role: ${role || 'N/A'}
Exchange: ${exchange}
Audit Slug: ${audit_slug}
Timestamp: ${timestamp}
Opt-in for updates: ${opt_in ? 'Yes' : 'No'}
      `,
    });

    // 3. Send confirmation to user
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://fix.opound.com';
    const reportUrl = `${appUrl}/audit/${audit_slug}/report`;

    await resend.emails.send({
      from: 'Navilla Bagga <navilla@send.opound.com>',
      to: email,
      subject: `Your CryptoFIX RoE report for ${exchange}`,
      text: `
Thanks for using CryptoFIX Auditor.
Your Rules of Engagement report for ${exchange} is ready.

Score: ${score}/100 — ${grade}
View report: ${reportUrl}

If you'd like a custom institutional FIX implementation review or fractional product leadership engagement, reply to this email or book a call: https://calendly.com/navillabagga

— Navilla Bagga, Opound LLC
      `,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Lead capture error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
