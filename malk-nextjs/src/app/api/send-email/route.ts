import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

console.log('RESEND_API_KEY (masked):', process.env.RESEND_API_KEY ? `${process.env.RESEND_API_KEY.slice(0,3)}...${process.env.RESEND_API_KEY.slice(-3)}` : 'undefined');

export async function POST(req: NextRequest) {
  try {
    const { to, subject, html } = await req.json();
    if (!to || !subject || !html) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }
    const data = await resend.emails.send({
      from: 'no-reply@malk.tv',
      to,
      subject,
      html,
    });
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
} 