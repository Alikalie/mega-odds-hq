const supported = () => typeof window !== "undefined" && "Notification" in window;

let swReg: ServiceWorkerRegistration | null = null;

export const registerNotificationWorker = async () => {
  if (!("serviceWorker" in navigator)) return;
  try {
    swReg = await navigator.serviceWorker.register("/notification-sw.js");
  } catch {
    swReg = null;
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
  const options: NotificationOptions = { body, icon: "/favicon.ico", badge: "/favicon.ico", data: { url }, tag: `${Date.now()}` };
  try {
    const reg = swReg || (await navigator.serviceWorker?.getRegistration("/notification-sw.js"));
    if (reg) return reg.showNotification(title, options);
    new Notification(title, options);
  } catch {
    try { new Notification(title, options); } catch { /* ignore */ }
  }
};
