import "https://deno.land/std@0.224.0/dotenv/load.ts";
import { assertEquals, assert } from "https://deno.land/std@0.224.0/assert/mod.ts";

const SUPABASE_URL = Deno.env.get("VITE_SUPABASE_URL")!;
const ANON_KEY = Deno.env.get("VITE_SUPABASE_PUBLISHABLE_KEY")!;
const FN_URL = `${SUPABASE_URL}/functions/v1/paypal-capture-order`;

// Optional integration env. Without these, only auth/shape tests run.
const USER_JWT = Deno.env.get("PAYPAL_TEST_USER_JWT") ?? "";
const OTHER_USER_JWT = Deno.env.get("PAYPAL_TEST_OTHER_USER_JWT") ?? "";
const VIP_PKG = Deno.env.get("PAYPAL_TEST_VIP_PACKAGE_ID") ?? "";
const SPECIAL_PKG = Deno.env.get("PAYPAL_TEST_SPECIAL_PACKAGE_ID") ?? "";
// An order id created by USER_JWT for VIP_PKG (use the create-order tests to mint one)
const VALID_ORDER_ID = Deno.env.get("PAYPAL_TEST_VALID_ORDER_ID") ?? "";

async function call(body: unknown, token = USER_JWT || ANON_KEY) {
  const res = await fetch(FN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      apikey: ANON_KEY,
    },
    body: JSON.stringify(body),
  });
  const json = await res.json().catch(() => ({}));
  return { status: res.status, json };
}

Deno.test("CORS preflight returns 200", async () => {
  const res = await fetch(FN_URL, { method: "OPTIONS" });
  await res.text();
  assertEquals(res.status, 200);
});

Deno.test("rejects requests without an Authorization header", async () => {
  const res = await fetch(FN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", apikey: ANON_KEY },
    body: JSON.stringify({ orderId: "x", packageId: "y", requestedTier: "vip" }),
  });
  const json = await res.json().catch(() => ({}));
  assertEquals(res.status, 401);
  assertEquals(json.error, "Unauthorized");
});

Deno.test("rejects anon JWT (non-user) as Unauthorized", async () => {
  const { status, json } = await call(
    { orderId: "ORDER1", packageId: "PKG1", requestedTier: "vip" }, ANON_KEY);
  assertEquals(status, 401);
  assertEquals(json.error, "Unauthorized");
});

Deno.test({
  name: "rejects missing orderId",
  ignore: !USER_JWT,
  fn: async () => {
    const { status, json } = await call({ packageId: VIP_PKG || "x", requestedTier: "vip" });
    assertEquals(status, 400);
    assertEquals(json.error, "Missing orderId");
  },
});

Deno.test({
  name: "rejects invalid tier",
  ignore: !USER_JWT,
  fn: async () => {
    const { status, json } = await call({
      orderId: "ORDER1", packageId: VIP_PKG || "x", requestedTier: "admin",
    });
    assertEquals(status, 400);
    assertEquals(json.error, "Invalid tier");
  },
});

Deno.test({
  name: "rejects missing packageId",
  ignore: !USER_JWT,
  fn: async () => {
    const { status, json } = await call({ orderId: "ORDER1", requestedTier: "vip" });
    assertEquals(status, 400);
    assertEquals(json.error, "Missing package");
  },
});

Deno.test({
  name: "rejects unknown package id",
  ignore: !USER_JWT,
  fn: async () => {
    const { status, json } = await call({
      orderId: "ORDER1",
      packageId: "00000000-0000-0000-0000-000000000000",
      requestedTier: "vip",
    });
    assertEquals(status, 404);
    assertEquals(json.error, "Package not found");
  },
});

Deno.test({
  name: "rejects tier mismatch with package",
  ignore: !USER_JWT || !VIP_PKG,
  fn: async () => {
    const { status, json } = await call({
      orderId: "ORDER1", packageId: VIP_PKG, requestedTier: "special",
    });
    assertEquals(status, 400);
    assert(/Tier does not match/i.test(json.error));
  },
});

Deno.test({
  name: "rejects a non-existent PayPal order",
  ignore: !USER_JWT || !VIP_PKG,
  fn: async () => {
    const { status, json } = await call({
      orderId: "DOES_NOT_EXIST_123", packageId: VIP_PKG, requestedTier: "vip",
    });
    assertEquals(status, 400);
    assert(/PayPal order|Capture failed|amount/i.test(json.error));
  },
});

Deno.test({
  name: "rejects capture from a user that does not own the order",
  ignore: !VALID_ORDER_ID || !OTHER_USER_JWT || !VIP_PKG,
  fn: async () => {
    const { status, json } = await call(
      { orderId: VALID_ORDER_ID, packageId: VIP_PKG, requestedTier: "vip" },
      OTHER_USER_JWT,
    );
    assertEquals(status, 403);
    assert(/does not belong/i.test(json.error));
  },
});

Deno.test({
  name: "rejects capture when packageId does not match order's custom_id",
  ignore: !VALID_ORDER_ID || !USER_JWT || !SPECIAL_PKG,
  fn: async () => {
    // Use a different (but valid) package — server should detect mismatch
    const { status, json } = await call({
      orderId: VALID_ORDER_ID, packageId: SPECIAL_PKG, requestedTier: "special",
    });
    // Could be amount-mismatch or package-mismatch depending on prices
    assertEquals(status, 400);
    assert(/package mismatch|amount does not match|tier mismatch/i.test(json.error));
  },
});
