import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { Resend } from 'resend';
import { getScoredReport } from '@/lib/audits';

const resend = new Resend(process.env.RESEND_API_KEY || 're_placeholder_key_for_build');

export async function POST(req: NextRequest) {
  try {
    const { email, full_name, company, role, exchange_name, audit_slug, opt_in, message } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Missing required email field' }, { status: 400 });
    }

    // 1. Insert into Supabase
    const { error: supabaseError } = await supabase
      .from('audit_leads')
      .insert([
        { 
          email,
          full_name,
          company, 
          role, 
          exchange_name: exchange_name || (message ? 'Contact Form' : 'General Inquiry'), 
          audit_slug: audit_slug || 'contact-page', 
          opt_in,
          message: message || null
        }
      ]);

    if (supabaseError) {
      console.error('Supabase error:', supabaseError);
    }

    // Fetch report data for the confirmation email (if it's an audit lead)
    const report = audit_slug ? await getScoredReport(audit_slug) : null;
    const score = report ? report.total_score : 'XX';
    const grade = report ? report.grade : 'N/A';
    const exchange = exchange_name || (report ? report.exchange_name : 'General Inquiry');

    const timestamp = new Date().toLocaleString();

    // 2. Send notification to admin
    await resend.emails.send({
      from: 'CryptoFIX Auditor <system@send.opound.com>',
      to: 'navilla.bagga@gmail.com',
      subject: message ? `New Opound Inquiry — ${full_name}` : `New CryptoFIX audit lead — ${exchange}`,
      text: `
${message ? '--- MESSAGE START ---' : ''}
${message || 'No message provided.'}
${message ? '--- MESSAGE END ---' : ''}

Name: ${full_name || 'N/A'}
Email: ${email}
Company: ${company || 'N/A'}
Role: ${role || 'N/A'}
Audit Slug: ${audit_slug || 'N/A'}
Timestamp: ${timestamp}
      `,
    });

    // 3. Send confirmation to user
    if (message) {
      // General Inquiry Thank You
      await resend.emails.send({
        from: 'Navilla Bagga <navilla@send.opound.com>',
        to: email,
        subject: `Thank you for your inquiry — Opound LLC`,
        text: `
Hi ${full_name || 'there'},

Thanks for reaching out to Opound LLC. We've received your inquiry regarding "${message.substring(0, 50)}${message.length > 50 ? '...' : ''}" and will get back to you shortly.

If you'd like to book a call immediately, you can do so here: https://calendly.com/navilla-bagga/30min

Best regards,
Navilla Bagga
Opound LLC
        `,
      });
    } else if (audit_slug && audit_slug !== 'contact-page') {
      // Audit Report Confirmation
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://fix.opound.com';
      const reportUrl = `${appUrl}/audit/${audit_slug}/report`;

      await resend.emails.send({
        from: 'Navilla Bagga <navilla@send.opound.com>',
        to: email,
        subject: `Your CryptoFIX RoE report for ${exchange}`,
        text: `
Thanks ${full_name || ''} for using CryptoFIX Auditor.
Your Rules of Engagement report for ${exchange} is ready.

Score: ${score}/100 — ${grade}
View report: ${reportUrl}

If you'd like a custom institutional FIX implementation review or fractional product leadership engagement, reply to this email or book a call: https://calendly.com/navilla-bagga/30min

— Navilla Bagga, Opound LLC
        `,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Lead capture error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
