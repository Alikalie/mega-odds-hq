import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';

const MODE = (Deno.env.get('PAYPAL_MODE') ?? 'sandbox').toLowerCase();
const BASE = MODE === 'live' ? 'https://api-m.paypal.com' : 'https://api-m.sandbox.paypal.com';
const ALLOWED_TIERS = new Set(['vip', 'special']);

async function getAccessToken() {
  const id = Deno.env.get('PAYPAL_CLIENT_ID');
  const secret = Deno.env.get('PAYPAL_CLIENT_SECRET');
  if (!id || !secret) throw new Error('PayPal credentials not configured');
  const auth = btoa(`${id}:${secret}`);
  const res = await fetch(`${BASE}/v1/oauth2/token`, {
    method: 'POST',
    headers: { Authorization: `Basic ${auth}`, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: 'grant_type=client_credentials',
  });
  const data = await res.json();
  if (!res.ok) {
    console.error('PayPal auth failed', data);
    throw new Error(`PayPal auth failed (${MODE}): ${data.error || 'unknown'} — check PAYPAL_CLIENT_ID/SECRET match PAYPAL_MODE`);
  }
  return data.access_token as string;
}

function fail(status: number, error: string, details?: unknown) {
  return new Response(JSON.stringify({ error, details }), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) return fail(401, 'Unauthorized');

    const userClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } },
    );
    const { data: claimsData, error: claimsErr } = await userClient.auth.getClaims(authHeader.replace('Bearer ', ''));
    if (claimsErr || !claimsData?.claims) return fail(401, 'Unauthorized');
    const userId = claimsData.claims.sub as string;

    const body = await req.json().catch(() => ({}));
    const requestedTier = String(body.requestedTier || '').toLowerCase();
    const packageId = body.packageId ? String(body.packageId) : '';
    const currency = String(body.currency || 'USD').toUpperCase();
    if (!ALLOWED_TIERS.has(requestedTier)) return fail(400, 'Invalid tier');
    if (!packageId) return fail(400, 'Missing package');
    if (!/^[A-Z]{3}$/.test(currency)) return fail(400, 'Invalid currency');

    // Derive amount + tier from the database, never trust the client
    const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const { data: pkg, error: pkgErr } = await admin
      .from('subscription_packages')
      .select('id,name,price,tier,is_active')
      .eq('id', packageId)
      .maybeSingle();
    if (pkgErr || !pkg) return fail(404, 'Package not found');
    if (!pkg.is_active) return fail(400, 'Package not available');
    if (String(pkg.tier).toLowerCase() !== requestedTier) return fail(400, 'Tier does not match package');

    const amount = Number(pkg.price);
    if (!Number.isFinite(amount) || amount <= 0) return fail(400, 'Invalid package price');

    const description = String(pkg.name || 'Subscription').slice(0, 127);

    const token = await getAccessToken();
    const res = await fetch(`${BASE}/v2/checkout/orders`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [{
          amount: { currency_code: currency, value: amount.toFixed(2) },
          description,
          custom_id: `${userId}:${pkg.id}:${requestedTier}`,
        }],
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      console.error('PayPal create order failed', data);
      return fail(502, data?.message || 'PayPal order failed', data);
    }
    return new Response(JSON.stringify({ orderId: data.id }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error('create-order exception', e);
    return fail(500, e instanceof Error ? e.message : String(e));
  }
});
