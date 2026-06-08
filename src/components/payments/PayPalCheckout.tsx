import { useEffect, useState } from "react";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { AlertCircle, Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

interface PayPalCheckoutProps {
  amount: number;
  currency?: string;
  description?: string;
  requestedTier: string;
  packageId?: string;
  packageName?: string;
  onSuccess?: () => void;
}

interface CheckoutError {
  title: string;
  message: string;
  details?: string;
}

function extractError(err: unknown, fallback: string): CheckoutError {
  // Supabase functions.invoke returns { error: FunctionsHttpError } whose
  // .context holds the Response with the JSON body we returned from the function.
  const anyErr = err as any;
  let message = fallback;
  let details: string | undefined;

  if (anyErr?.context?.json) {
    const body = anyErr.context.json;
    if (typeof body?.error === "string") message = body.error;
    if (body?.details) details = typeof body.details === "string" ? body.details : JSON.stringify(body.details);
  } else if (typeof anyErr?.message === "string") {
    message = anyErr.message;
  } else if (typeof anyErr === "string") {
    message = anyErr;
  }
  return { title: fallback, message, details };
}

export const PayPalCheckout = ({
  amount,
  currency = "USD",
  description,
  requestedTier,
  packageId,
  packageName,
  onSuccess,
}: PayPalCheckoutProps) => {
  const [config, setConfig] = useState<{ clientId: string; mode: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<CheckoutError | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    setLoading(true);
    supabase.functions.invoke("paypal-config").then(async ({ data, error }) => {
      if (error || !data?.clientId) {
        setError({ title: "PayPal unavailable", message: "Could not load PayPal configuration. Please try again." });
      } else {
        setConfig(data);
        setError(null);
      }
      setLoading(false);
    });
  }, [reloadKey]);

  const retry = () => {
    setError(null);
    setReloadKey((k) => k + 1);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-4">
        <Loader2 className="w-5 h-5 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {error && (
        <div
          role="alert"
          className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm space-y-2"
        >
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 mt-0.5 text-destructive shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-destructive">{error.title}</p>
              <p className="text-foreground/80 break-words">{error.message}</p>
              {error.details && (
                <p className="text-xs text-muted-foreground mt-1 break-words">{error.details}</p>
              )}
            </div>
          </div>
          <Button size="sm" variant="outline" onClick={retry} className="gap-2">
            <RefreshCw className="w-3 h-3" /> Try again
          </Button>
        </div>
      )}

      {config && (
        <div className="rounded-xl overflow-hidden">
          <PayPalScriptProvider
            options={{
              clientId: config.clientId,
              currency,
              intent: "capture",
              components: "buttons,funding-eligibility",
              enableFunding: "card",
              disableFunding: "paylater,credit",
            }}
          >
            <PayPalButtons
              key={reloadKey}
              style={{ layout: "vertical", shape: "rect", label: "paypal" }}
              createOrder={async () => {
                setError(null);
                if (!packageId) {
                  const e: CheckoutError = { title: "Checkout error", message: "Missing package. Please reopen the checkout." };
                  setError(e);
                  throw new Error(e.message);
                }
                const { data, error: invokeErr } = await supabase.functions.invoke("paypal-create-order", {
                  body: { currency, requestedTier, packageId, packageName: packageName ?? description },
                });
                if (invokeErr || !data?.orderId) {
                  const e = extractError(invokeErr, "Could not start PayPal checkout");
                  setError(e);
                  throw new Error(e.message);
                }
                return data.orderId as string;
              }}
              onApprove={async (data) => {
                const { data: cap, error: invokeErr } = await supabase.functions.invoke("paypal-capture-order", {
                  body: { orderId: data.orderID, requestedTier, packageId, packageName },
                });
                if (invokeErr || !cap?.success) {
                  setError(extractError(invokeErr, "Payment could not be completed"));
                  return;
                }
                setError(null);
                toast.success("Payment confirmed! Your subscription is now active.");
                onSuccess?.();
              }}
              onError={(err) => {
                console.error("PayPal error", err);
                setError({
                  title: "PayPal checkout error",
                  message: "PayPal could not process your card or account. Please try a different payment method or retry.",
                  details: err instanceof Error ? err.message : undefined,
                });
              }}
              onCancel={() => {
                setError({ title: "Payment cancelled", message: "You cancelled the PayPal checkout. You can retry whenever you're ready." });
              }}
            />
          </PayPalScriptProvider>
        </div>
      )}
    </div>
  );
};
