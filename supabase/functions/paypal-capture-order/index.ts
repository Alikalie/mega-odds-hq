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
  if (!res.ok) throw new Error(`PayPal auth failed (${MODE}): ${data.error || 'unknown'}`);
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
    const userEmail = (claimsData.claims.email as string) || '';

    const body = await req.json().catch(() => ({}));
    const orderId = String(body.orderId || '').trim();
    const requestedTier = String(body.requestedTier || '').toLowerCase();
    const packageId = body.packageId ? String(body.packageId) : '';
    if (!orderId) return fail(400, 'Missing orderId');
    if (!ALLOWED_TIERS.has(requestedTier)) return fail(400, 'Invalid tier');
    if (!packageId) return fail(400, 'Missing package');

    // Verify package belongs to the requested tier and get expected amount
    const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const { data: pkg, error: pkgErr } = await admin
      .from('subscription_packages')
      .select('id,name,price,tier,is_active')
      .eq('id', packageId)
      .maybeSingle();
    if (pkgErr || !pkg) return fail(404, 'Package not found');
    if (!pkg.is_active) return fail(400, 'Package not available');
    if (String(pkg.tier).toLowerCase() !== requestedTier) return fail(400, 'Tier does not match package');

    const expectedAmount = Number(pkg.price);
    if (!Number.isFinite(expectedAmount) || expectedAmount <= 0) return fail(400, 'Invalid package price');

    const token = await getAccessToken();

    // 1) Fetch the order and verify it matches this user, package and amount
    const getRes = await fetch(`${BASE}/v2/checkout/orders/${encodeURIComponent(orderId)}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const order = await getRes.json();
    if (!getRes.ok) return fail(400, 'Could not load PayPal order', order);

    const unit = order?.purchase_units?.[0];
    const orderAmount = Number(unit?.amount?.value);
    const orderCustom = String(unit?.custom_id || '');
    if (!Number.isFinite(orderAmount) || Math.abs(orderAmount - expectedAmount) > 0.009) {
      return fail(400, 'Order amount does not match package price');
    }
    // custom_id is set by create-order as `${userId}:${packageId}:${tier}`
    const [orderUserId, orderPkgId, orderTier] = orderCustom.split(':');
    if (orderUserId && orderUserId !== userId) return fail(403, 'Order does not belong to this user');
    if (orderPkgId && orderPkgId !== packageId) return fail(400, 'Order package mismatch');
    if (orderTier && orderTier.toLowerCase() !== requestedTier) return fail(400, 'Order tier mismatch');

    // 2) Capture
    const capRes = await fetch(`${BASE}/v2/checkout/orders/${encodeURIComponent(orderId)}/capture`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    });
    const cap = await capRes.json();
    if (!capRes.ok || cap.status !== 'COMPLETED') {
      console.error('PayPal capture failed', cap);
      return fail(400, cap?.message || 'Capture failed', cap);
    }

    // 3) Insert approved upgrade request (trigger applies the tier + subscription)
    const { data: profile } = await admin
      .from('profiles')
      .select('full_name,phone_number,country,subscription,email')
      .eq('id', userId)
      .maybeSingle();

    const { error: insErr } = await admin.from('upgrade_requests').insert({
      user_id: userId,
      user_email: profile?.email || userEmail,
      user_name: profile?.full_name ?? null,
      user_phone: profile?.phone_number ?? null,
      user_country: profile?.country ?? null,
      current_tier: profile?.subscription || 'free',
      requested_tier: requestedTier,
      requested_package_id: packageId,
      requested_package_name: pkg.name,
      payment_proof_url: null,
      status: 'approved',
      admin_notes: `Auto-approved via PayPal. Order ID: ${orderId}. Amount: ${orderAmount.toFixed(2)}`,
    });
    if (insErr) {
      console.error('insert upgrade_request failed', insErr);
      return fail(500, 'Payment captured but recording failed. Contact support with your order ID.', { orderId });
    }

    return new Response(JSON.stringify({ success: true, orderId }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error('capture-order exception', e);
    return fail(500, e instanceof Error ? e.message : String(e));
  }
});
