import "https://deno.land/std@0.224.0/dotenv/load.ts";
import { assertEquals, assert } from "https://deno.land/std@0.224.0/assert/mod.ts";

// End-to-end PayPal checkout test.
//
// What it does (mirrors what the PayPalCheckout React component does):
//   1. Call paypal-create-order as a real user -> get PayPal orderId
//   2. Approve the order against PayPal's sandbox REST API (simulates the
//      buyer clicking "Pay" in the popup) using a sandbox personal account
//   3. Call paypal-capture-order -> assert HTTP 200
//   4. Query the DB and assert: upgrade_requests row is 'approved' for this
//      order, profile.subscription is upgraded, user_subscriptions has an
//      active row for the package
//
// Required env to run (otherwise the test auto-skips):
//   VITE_SUPABASE_URL, VITE_SUPABASE_PUBLISHABLE_KEY (already in .env)
//   SUPABASE_SERVICE_ROLE_KEY                 -- to read/clean DB rows
//   PAYPAL_TEST_USER_JWT                      -- access token for a real user
//   PAYPAL_TEST_USER_ID                       -- that user's auth.users.id (uuid)
//   PAYPAL_TEST_VIP_PACKAGE_ID                -- a vip subscription_packages.id
//   PAYPAL_SANDBOX_CLIENT_ID                  -- sandbox app client id
//   PAYPAL_SANDBOX_CLIENT_SECRET              -- sandbox app client secret
//   PAYPAL_SANDBOX_BUYER_EMAIL                -- sandbox personal account email
//   PAYPAL_SANDBOX_BUYER_PASSWORD             -- sandbox personal account password
//
// Note: PayPal's "headless buyer approval" path uses the Payments REST API's
// payment_source.token flow OR the Orders v2 /authorize endpoint after the
// buyer is asserted via the sandbox negative testing flow. For a fully
// automated CI run, the most reliable approach is to use a *Server-to-server*
// sandbox client that pre-authorizes the order via the
// /v2/checkout/orders/{id}/confirm-payment-source endpoint with the sandbox
// buyer's account token. That's what we do below.

import { createClient } from "npm:@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("VITE_SUPABASE_URL")!;
const ANON_KEY = Deno.env.get("VITE_SUPABASE_PUBLISHABLE_KEY")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

const USER_JWT = Deno.env.get("PAYPAL_TEST_USER_JWT") ?? "";
const USER_ID = Deno.env.get("PAYPAL_TEST_USER_ID") ?? "";
const VIP_PKG = Deno.env.get("PAYPAL_TEST_VIP_PACKAGE_ID") ?? "";

const PP_ID = Deno.env.get("PAYPAL_SANDBOX_CLIENT_ID") ?? "";
const PP_SECRET = Deno.env.get("PAYPAL_SANDBOX_CLIENT_SECRET") ?? "";
const BUYER_EMAIL = Deno.env.get("PAYPAL_SANDBOX_BUYER_EMAIL") ?? "";
const BUYER_PASSWORD = Deno.env.get("PAYPAL_SANDBOX_BUYER_PASSWORD") ?? "";

const READY =
  !!SERVICE_KEY && !!USER_JWT && !!USER_ID && !!VIP_PKG &&
  !!PP_ID && !!PP_SECRET && !!BUYER_EMAIL && !!BUYER_PASSWORD;

const FN = (name: string) => `${SUPABASE_URL}/functions/v1/${name}`;
const PP = "https://api-m.sandbox.paypal.com";

async function ppToken() {
  const res = await fetch(`${PP}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${btoa(`${PP_ID}:${PP_SECRET}`)}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });
  const j = await res.json();
  assert(res.ok, `paypal auth: ${JSON.stringify(j)}`);
  return j.access_token as string;
}

// Approve a sandbox order on behalf of the buyer using the
// confirm-payment-source endpoint. Works with sandbox personal accounts.
async function approveAsBuyer(orderId: string) {
  const token = await ppToken();
  const res = await fetch(
    `${PP}/v2/checkout/orders/${orderId}/confirm-payment-source`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        payment_source: {
          paypal: {
            email_address: BUYER_EMAIL,
            experience_context: {
              return_url: "https://example.com/return",
              cancel_url: "https://example.com/cancel",
            },
          },
        },
      }),
    },
  );
  const j = await res.json();
  assert(res.ok, `confirm-payment-source: ${JSON.stringify(j)}`);
  return j;
}

async function callFn(name: string, body: unknown) {
  const res = await fetch(FN(name), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${USER_JWT}`,
      apikey: ANON_KEY,
    },
    body: JSON.stringify(body),
  });
  const json = await res.json().catch(() => ({}));
  return { status: res.status, json };
}

Deno.test({
  name: "E2E: PayPal checkout creates order, captures it, upgrades user",
  ignore: !READY,
  fn: async () => {
    const admin = createClient(SUPABASE_URL, SERVICE_KEY);

    // 1. Snapshot the profile so we can verify the upgrade
    const { data: before } = await admin
      .from("profiles").select("subscription,status").eq("id", USER_ID).single();

    // 2. Create order via our edge function (same code the React button calls)
    const create = await callFn("paypal-create-order", {
      packageId: VIP_PKG, requestedTier: "vip", currency: "USD",
    });
    assertEquals(create.status, 200);
    const orderId = create.json.orderId as string;
    assert(orderId, "missing orderId");

    // 3. Simulate buyer approval against PayPal sandbox
    await approveAsBuyer(orderId);

    // 4. Capture via our edge function
    const capture = await callFn("paypal-capture-order", {
      orderId, packageId: VIP_PKG, requestedTier: "vip",
    });
    assertEquals(capture.status, 200, `capture failed: ${JSON.stringify(capture.json)}`);
    assertEquals(capture.json.success, true);

    // 5. Verify upgrade_requests row was inserted + approved
    const { data: req } = await admin
      .from("upgrade_requests")
      .select("status,requested_tier,requested_package_id,admin_notes")
      .eq("user_id", USER_ID)
      .ilike("admin_notes", `%${orderId}%`)
      .order("created_at", { ascending: false })
      .limit(1).maybeSingle();
    assert(req, "upgrade_requests row not found");
    assertEquals(req!.status, "approved");
    assertEquals(req!.requested_tier, "vip");
    assertEquals(req!.requested_package_id, VIP_PKG);

    // 6. Verify the apply_approved_upgrade trigger upgraded the profile
    const { data: after } = await admin
      .from("profiles").select("subscription,status").eq("id", USER_ID).single();
    assertEquals(after!.status, "approved");
    assert(["vip", "special"].includes(after!.subscription),
      `profile.subscription=${after!.subscription}, was ${before?.subscription}`);

    // 7. Verify user_subscriptions has an active row for this package
    const { data: sub } = await admin
      .from("user_subscriptions")
      .select("is_active,package_id,expires_at")
      .eq("user_id", USER_ID)
      .eq("package_id", VIP_PKG)
      .eq("is_active", true)
      .maybeSingle();
    assert(sub, "no active user_subscriptions row");
    assert(new Date(sub!.expires_at) > new Date(), "subscription already expired");
  },
});
