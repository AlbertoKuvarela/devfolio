import { createHmac, timingSafeEqual } from 'crypto';
import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { userIdFromOrderId, type NowPaymentsIpnPayload } from '@/lib/nowpayments';

// NOWPayments signs the IPN body with HMAC-SHA512 over the JSON-sorted
// payload, using the IPN secret as the key. See:
// https://documenter.getpostman.com/view/7907941/S1a4x1Hn#ipn
function sortObject(obj: unknown): unknown {
  if (Array.isArray(obj)) return obj.map(sortObject);
  if (obj && typeof obj === 'object') {
    return Object.keys(obj as Record<string, unknown>)
      .sort()
      .reduce((acc, key) => {
        acc[key] = sortObject((obj as Record<string, unknown>)[key]);
        return acc;
      }, {} as Record<string, unknown>);
  }
  return obj;
}

function isValidSignature(rawBody: string, signature: string | null): boolean {
  if (!signature) return false;
  const parsed = JSON.parse(rawBody);
  const sorted = JSON.stringify(sortObject(parsed));
  const expected = createHmac('sha512', process.env.NOWPAYMENTS_IPN_SECRET!).update(sorted).digest('hex');

  const a = Buffer.from(expected);
  const b = Buffer.from(signature);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get('x-nowpayments-sig');

  if (!isValidSignature(rawBody, signature)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  const payload = JSON.parse(rawBody) as NowPaymentsIpnPayload;

  if (payload.payment_status !== 'finished' && payload.payment_status !== 'confirmed') {
    return NextResponse.json({ ok: true, ignored: payload.payment_status });
  }

  const userId = userIdFromOrderId(payload.order_id);
  if (!userId) {
    return NextResponse.json({ error: 'Could not resolve user from order_id' }, { status: 400 });
  }

  const admin = createAdminClient();
  const planExpiresAt = new Date();
  planExpiresAt.setDate(planExpiresAt.getDate() + 30);

  const { error } = await admin
    .from('users')
    .update({ plan: 'pro', plan_expires_at: planExpiresAt.toISOString() })
    .eq('id', userId);

  if (error) {
    console.error('Failed to upgrade user plan', error);
    return NextResponse.json({ error: 'Failed to update plan' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
