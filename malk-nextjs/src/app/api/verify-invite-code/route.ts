import { NextRequest, NextResponse } from 'next/server';
import { getInviteCodeRecord } from '@/lib/airtable';

export async function POST(req: NextRequest) {
  const { inviteCode } = await req.json();

  if (!inviteCode) {
    return NextResponse.json({ valid: false, reason: 'No invite code provided' }, { status: 400 });
  }

  const record = await getInviteCodeRecord(inviteCode);

  if (!record) {
    return NextResponse.json({ valid: false, reason: 'Invite code not found' }, { status: 404 });
  }

  // The 'Active' field should be 'Active' if the code is currently valid
  const isActive = record.fields['Active'] === 'Active';

  if (!isActive) {
    return NextResponse.json({ valid: false, reason: 'Invite code is not active' }, { status: 403 });
  }

  return NextResponse.json({ valid: true });
} 