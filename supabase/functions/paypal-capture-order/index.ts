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
    const userClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );
    const { data: claimsData, error: claimsErr } = await userClient.auth.getClaims(authHeader.replace('Bearer ', ''));
    if (claimsErr || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    const userId = claimsData.claims.sub as string;
    const userEmail = (claimsData.claims.email as string) || '';

    const body = await req.json().catch(() => ({}));
    const orderId = String(body.orderId || '');
    const requestedTier = String(body.requestedTier || '');
    const packageId = body.packageId ? String(body.packageId) : null;
    const packageName = body.packageName ? String(body.packageName) : null;
    if (!orderId || !requestedTier) {
      return new Response(JSON.stringify({ error: 'Missing orderId or requestedTier' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const token = await getAccessToken();
    const capRes = await fetch(`${BASE}/v2/checkout/orders/${orderId}/capture`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    });
    const cap = await capRes.json();
    if (!capRes.ok || cap.status !== 'COMPLETED') {
      return new Response(JSON.stringify({ error: 'Capture failed', details: cap }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Insert upgrade request with PayPal proof, using service role to bypass RLS safely
    const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const { data: profile } = await admin.from('profiles').select('full_name,phone_number,country,subscription,email').eq('id', userId).maybeSingle();

    const { error: insErr } = await admin.from('upgrade_requests').insert({
      user_id: userId,
      user_email: profile?.email || userEmail,
      user_name: profile?.full_name ?? null,
      user_phone: profile?.phone_number ?? null,
      user_country: profile?.country ?? null,
      current_tier: profile?.subscription || 'free',
      requested_tier: requestedTier,
      requested_package_id: packageId,
      requested_package_name: packageName,
      payment_proof_url: null,
      status: 'approved',
      admin_notes: `Auto-approved via PayPal. Order ID: ${orderId}`,
    });
    if (insErr) {
      return new Response(JSON.stringify({ error: 'Failed to record upgrade request', details: insErr }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    return new Response(JSON.stringify({ success: true, orderId }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
