import { supabase } from "@/integrations/supabase/client";

const VAPID_PUBLIC_KEY = "BG4XDsKP4MjHIc1oWL7e50eHEBFQzgGJFXpy1ns0i8ZX6rF45DAWLglzkbcuJCDnj6YV87OENBQb7RxRuy2W2Ps";

const supported = () => typeof window !== "undefined" && "Notification" in window;

let swReg: ServiceWorkerRegistration | null = null;

const b64ToUint8 = (b64: string) => {
  const pad = "=".repeat((4 - (b64.length % 4)) % 4);
  const raw = atob((b64 + pad).replace(/-/g, "+").replace(/_/g, "/"));
  return Uint8Array.from(raw, (c) => c.charCodeAt(0));
};

export const registerNotificationWorker = async () => {
  if (!("serviceWorker" in navigator)) return;
  try {
    swReg = await navigator.serviceWorker.register("/notification-sw.js");
    await subscribeToPush();
  } catch {
    swReg = null;
  }
};

/** Saves a push subscription so notifications arrive even when the app is closed. */
export const subscribeToPush = async () => {
  if (!swReg || !("PushManager" in window) || Notification.permission !== "granted") return;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  try {
    await navigator.serviceWorker.ready;
    let sub = await swReg.pushManager.getSubscription();
    if (!sub) {
      sub = await swReg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: b64ToUint8(VAPID_PUBLIC_KEY),
      });
    }
    const j = sub.toJSON();
    if (!j.endpoint || !j.keys?.p256dh || !j.keys?.auth) return;
    await supabase.from("push_subscriptions").upsert(
      { user_id: user.id, endpoint: j.endpoint, p256dh: j.keys.p256dh, auth: j.keys.auth, user_agent: navigator.userAgent.slice(0, 300) },
      { onConflict: "endpoint" }
    );
  } catch (e) {
    console.warn("Push subscribe failed", e);
  }
};

/** Admin-only: deliver push notifications to approved users (server verifies admin role). */
export const sendPush = async (opts: { user_ids?: string[]; all?: boolean; title: string; message: string; url?: string }) => {
  try {
    await supabase.functions.invoke("send-push", { body: opts });
  } catch (e) {
    console.warn("send-push failed", e);
  }
};

export const notificationPermission = (): NotificationPermission | "unsupported" =>
  supported() ? Notification.permission : "unsupported";

export const requestNotificationPermission = async () => {
  if (!supported()) return "unsupported" as const;
  const result = await Notification.requestPermission();
  if (result === "granted") await registerNotificationWorker();
  return result;
};

export const showWebNotification = async (title: string, body: string, url = "/") => {
  if (!supported() || Notification.permission !== "granted") return;
  // When the page is hidden, the push message from the server will show it instead.
  if (document.visibilityState === "hidden" && swReg?.pushManager && (await swReg.pushManager.getSubscription())) return;
  const options: NotificationOptions = { body, icon: "/favicon.ico", badge: "/favicon.ico", data: { url }, tag: `${Date.now()}` };
  try {
    const reg = swReg || (await navigator.serviceWorker?.getRegistration("/notification-sw.js"));
    if (reg) return reg.showNotification(title, options);
    new Notification(title, options);
  } catch {
    try { new Notification(title, options); } catch { /* ignore */ }
  }
};
