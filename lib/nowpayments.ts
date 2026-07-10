const NOWPAYMENTS_API = 'https://api.nowpayments.io/v1';

function headers() {
  return {
    'x-api-key': process.env.NOWPAYMENTS_API_KEY!,
    'Content-Type': 'application/json',
  };
}

export interface CreatePaymentInput {
  userId: string;
  priceAmount: number;
  priceCurrency?: string;
  payCurrency?: string;
}

export interface NowPaymentsInvoice {
  id: string;
  invoice_url: string;
  order_id: string;
}

// Creates an invoice for the $30/mo Pro plan, paid in USDT.
export async function createProSubscriptionInvoice(input: CreatePaymentInput): Promise<NowPaymentsInvoice> {
  const orderId = `pro-${input.userId}-${Date.now()}`;

  const res = await fetch(`${NOWPAYMENTS_API}/invoice`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({
      price_amount: input.priceAmount,
      price_currency: input.priceCurrency ?? 'usd',
      pay_currency: input.payCurrency ?? 'usdt',
      order_id: orderId,
      order_description: 'DevFolio Pro — monthly subscription',
      ipn_callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/payments/webhook`,
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?upgraded=1`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings`,
    }),
  });

  if (!res.ok) {
    throw new Error(`NOWPayments invoice creation failed: ${res.status} ${await res.text()}`);
  }

  return res.json();
}

export interface NowPaymentsIpnPayload {
  payment_status: string;
  order_id: string;
  price_amount: number;
  pay_amount: number;
  actually_paid: number;
}

// order_id format is `pro-<userId>-<timestamp>`; extract the user id.
export function userIdFromOrderId(orderId: string): string | null {
  const match = orderId.match(/^pro-([^-]+(?:-[^-]+){4})-\d+$/);
  return match ? match[1] : null;
}
