import "https://deno.land/std@0.224.0/dotenv/load.ts";
import { assertEquals, assert } from "https://deno.land/std@0.224.0/assert/mod.ts";

const SUPABASE_URL = Deno.env.get("VITE_SUPABASE_URL")!;
const ANON_KEY = Deno.env.get("VITE_SUPABASE_PUBLISHABLE_KEY")!;
const FN_URL = `${SUPABASE_URL}/functions/v1/paypal-create-order`;
// Optional: a real user access token to exercise post-auth validation paths.
const USER_JWT = Deno.env.get("PAYPAL_TEST_USER_JWT") ?? "";
// Optional package IDs of a vip and a special package in the test project.
const VIP_PKG = Deno.env.get("PAYPAL_TEST_VIP_PACKAGE_ID") ?? "";
const SPECIAL_PKG = Deno.env.get("PAYPAL_TEST_SPECIAL_PACKAGE_ID") ?? "";

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
    body: JSON.stringify({ packageId: "x", requestedTier: "vip" }),
  });
  const json = await res.json().catch(() => ({}));
  assertEquals(res.status, 401);
  assertEquals(json.error, "Unauthorized");
});

Deno.test("rejects anon JWT (non-user) as Unauthorized", async () => {
  const { status, json } = await call(
    { packageId: "00000000-0000-0000-0000-000000000000", requestedTier: "vip" },
    ANON_KEY,
  );
  assertEquals(status, 401);
  assertEquals(json.error, "Unauthorized");
});

Deno.test({
  name: "rejects invalid tier",
  ignore: !USER_JWT,
  fn: async () => {
    const { status, json } = await call({ packageId: VIP_PKG || "x", requestedTier: "admin" });
    assertEquals(status, 400);
    assertEquals(json.error, "Invalid tier");
  },
});

Deno.test({
  name: "rejects missing package id",
  ignore: !USER_JWT,
  fn: async () => {
    const { status, json } = await call({ requestedTier: "vip" });
    assertEquals(status, 400);
    assertEquals(json.error, "Missing package");
  },
});

Deno.test({
  name: "rejects invalid currency code",
  ignore: !USER_JWT || !VIP_PKG,
  fn: async () => {
    const { status, json } = await call({
      packageId: VIP_PKG, requestedTier: "vip", currency: "us$",
    });
    assertEquals(status, 400);
    assertEquals(json.error, "Invalid currency");
  },
});

Deno.test({
  name: "rejects unknown package id",
  ignore: !USER_JWT,
  fn: async () => {
    const { status, json } = await call({
      packageId: "00000000-0000-0000-0000-000000000000", requestedTier: "vip",
    });
    assertEquals(status, 404);
    assertEquals(json.error, "Package not found");
  },
});

Deno.test({
  name: "rejects tier that does not match the package",
  ignore: !USER_JWT || !VIP_PKG,
  fn: async () => {
    const { status, json } = await call({ packageId: VIP_PKG, requestedTier: "special" });
    assertEquals(status, 400);
    assert(/Tier does not match/i.test(json.error));
  },
});

Deno.test({
  name: "valid vip request returns a PayPal order id",
  ignore: !USER_JWT || !VIP_PKG,
  fn: async () => {
    const { status, json } = await call({ packageId: VIP_PKG, requestedTier: "vip" });
    assertEquals(status, 200);
    assert(typeof json.orderId === "string" && json.orderId.length > 0);
  },
});

Deno.test({
  name: "valid special request returns a PayPal order id",
  ignore: !USER_JWT || !SPECIAL_PKG,
  fn: async () => {
    const { status, json } = await call({ packageId: SPECIAL_PKG, requestedTier: "special" });
    assertEquals(status, 200);
    assert(typeof json.orderId === "string" && json.orderId.length > 0);
  },
});
