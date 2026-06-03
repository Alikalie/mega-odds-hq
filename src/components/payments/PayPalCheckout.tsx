import { useEffect, useState } from "react";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
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

  useEffect(() => {
    supabase.functions.invoke("paypal-config").then(({ data, error }) => {
      if (error || !data?.clientId) {
        toast.error("PayPal is not configured");
      } else {
        setConfig(data);
      }
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-4">
        <Loader2 className="w-5 h-5 animate-spin text-primary" />
      </div>
    );
  }

  if (!config) {
    return <p className="text-sm text-destructive text-center">PayPal unavailable</p>;
  }

  return (
    <div className="rounded-xl overflow-hidden">
      <PayPalScriptProvider
        options={{
          clientId: config.clientId,
          currency,
          intent: "capture",
          components: "buttons",
        }}
      >
        <PayPalButtons
          style={{ layout: "vertical", shape: "rect", label: "paypal" }}
          createOrder={async () => {
            const { data, error } = await supabase.functions.invoke("paypal-create-order", {
              body: { amount, currency, description: description || packageName || "Subscription" },
            });
            if (error || !data?.orderId) {
              toast.error("Could not start PayPal checkout");
              throw new Error(error?.message || "Failed to create order");
            }
            return data.orderId as string;
          }}
          onApprove={async (data) => {
            const { data: cap, error } = await supabase.functions.invoke("paypal-capture-order", {
              body: {
                orderId: data.orderID,
                requestedTier,
                packageId,
                packageName,
              },
            });
            if (error || !cap?.success) {
              toast.error("Payment captured but request failed. Contact support.");
              return;
            }
            toast.success("Payment received! Awaiting admin approval.");
            onSuccess?.();
          }}
          onError={(err) => {
            console.error("PayPal error", err);
            toast.error("PayPal checkout error");
          }}
        />
      </PayPalScriptProvider>
    </div>
  );
};
