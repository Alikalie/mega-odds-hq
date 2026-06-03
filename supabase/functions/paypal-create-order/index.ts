import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';

const MODE = (Deno.env.get('PAYPAL_MODE') ?? 'sandbox').toLowerCase();
const BASE = MODE === 'live' ? 'https://api-m.paypal.com' : 'https://api-m.sandbox.paypal.com';

async function getAccessToken() {
  const id = Deno.env.get('PAYPAL_CLIENT_ID')!;
  const secret = Deno.env.get('PAYPAL_CLIENT_SECRET')!;
  const auth = btoa(`${id}:${secret}`);
  const res = await fetch(`${BASE}/v1/oauth2/token`, {
    method: 'POST',
    headers: { Authorization: `Basic ${auth}`, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: 'grant_type=client_credentials',
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`PayPal auth failed: ${JSON.stringify(data)}`);
  return data.access_token as string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );
    const { data: claimsData, error: claimsErr } = await supabase.auth.getClaims(authHeader.replace('Bearer ', ''));
    if (claimsErr || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const body = await req.json().catch(() => ({}));
    const amount = Number(body.amount);
    const currency = String(body.currency || 'USD').toUpperCase();
    const description = String(body.description || 'Subscription').slice(0, 127);
    if (!amount || amount <= 0) {
      return new Response(JSON.stringify({ error: 'Invalid amount' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const token = await getAccessToken();
    const res = await fetch(`${BASE}/v2/checkout/orders`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [{ amount: { currency_code: currency, value: amount.toFixed(2) }, description }],
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      return new Response(JSON.stringify({ error: 'PayPal order failed', details: data }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    return new Response(JSON.stringify({ orderId: data.id }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
