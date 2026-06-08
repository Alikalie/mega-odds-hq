import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent, act } from "@testing-library/react";

// --- Mocks ---------------------------------------------------------------

const invokeMock = vi.fn();
vi.mock("@/integrations/supabase/client", () => ({
  supabase: { functions: { invoke: (...args: any[]) => invokeMock(...args) } },
}));

const toastSuccess = vi.fn();
const toastError = vi.fn();
vi.mock("sonner", () => ({
  toast: { success: (...a: any[]) => toastSuccess(...a), error: (...a: any[]) => toastError(...a) },
}));

// Capture PayPalButtons props so tests can drive createOrder/onApprove/onError/onCancel
let lastButtonProps: any = null;
vi.mock("@paypal/react-paypal-js", () => ({
  PayPalScriptProvider: ({ children }: any) => <div data-testid="paypal-provider">{children}</div>,
  PayPalButtons: (props: any) => {
    lastButtonProps = props;
    return (
      <button
        data-testid="paypal-button"
        onClick={async () => {
          try {
            const orderId = await props.createOrder?.();
            if (orderId) await props.onApprove?.({ orderID: orderId });
          } catch {
            /* createOrder threw — UI error state already set */
          }
        }}
      >
        PayPal
      </button>
    );
  },
}));

import { PayPalCheckout } from "./PayPalCheckout";

const baseProps = {
  amount: 10,
  currency: "USD",
  requestedTier: "vip",
  packageId: "pkg-1",
  packageName: "VIP Monthly",
};

beforeEach(() => {
  invokeMock.mockReset();
  toastSuccess.mockReset();
  toastError.mockReset();
  lastButtonProps = null;
});

async function renderReady(props = baseProps) {
  // First invoke loads paypal-config
  invokeMock.mockResolvedValueOnce({ data: { clientId: "test-client", mode: "sandbox" }, error: null });
  render(<PayPalCheckout {...props} />);
  await screen.findByTestId("paypal-button");
}

describe("PayPalCheckout UI", () => {
  it("shows a config error and a Try again button when paypal-config fails", async () => {
    invokeMock.mockResolvedValueOnce({ data: null, error: { message: "boom" } });
    render(<PayPalCheckout {...baseProps} />);

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent(/PayPal unavailable/i);
    expect(screen.getByRole("button", { name: /try again/i })).toBeInTheDocument();
  });

  it("renders the PayPal button when config loads", async () => {
    await renderReady();
    expect(screen.getByTestId("paypal-provider")).toBeInTheDocument();
    expect(screen.getByTestId("paypal-button")).toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("shows success state and calls onSuccess when capture succeeds", async () => {
    const onSuccess = vi.fn();
    await renderReady({ ...baseProps, onSuccess } as any);

    // createOrder -> orderId, then onApprove -> capture success
    invokeMock.mockResolvedValueOnce({ data: { orderId: "ORDER-123" }, error: null });
    invokeMock.mockResolvedValueOnce({ data: { success: true }, error: null });

    await act(async () => {
      fireEvent.click(screen.getByTestId("paypal-button"));
    });

    await waitFor(() => expect(onSuccess).toHaveBeenCalledTimes(1));
    expect(toastSuccess).toHaveBeenCalledWith(expect.stringMatching(/payment confirmed/i));
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("shows server error message when create-order fails", async () => {
    await renderReady();
    invokeMock.mockResolvedValueOnce({
      data: null,
      error: { context: { json: { error: "Amount mismatch", details: "expected 9.99" } } },
    });

    await act(async () => {
      fireEvent.click(screen.getByTestId("paypal-button"));
    });

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent(/amount mismatch/i);
    expect(alert).toHaveTextContent(/expected 9\.99/);
    expect(screen.getByRole("button", { name: /try again/i })).toBeInTheDocument();
  });

  it("shows capture failure message and does not call onSuccess when capture fails", async () => {
    const onSuccess = vi.fn();
    await renderReady({ ...baseProps, onSuccess } as any);

    invokeMock.mockResolvedValueOnce({ data: { orderId: "ORDER-XYZ" }, error: null });
    invokeMock.mockResolvedValueOnce({
      data: null,
      error: { context: { json: { error: "Capture declined" } } },
    });

    await act(async () => {
      fireEvent.click(screen.getByTestId("paypal-button"));
    });

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent(/capture declined/i);
    expect(onSuccess).not.toHaveBeenCalled();
  });

  it("shows the PayPal popup-error state when onError fires", async () => {
    await renderReady();
    await act(async () => {
      lastButtonProps.onError(new Error("popup blocked"));
    });
    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent(/paypal checkout error/i);
    expect(alert).toHaveTextContent(/popup blocked/i);
  });

  it("shows the cancelled state when onCancel fires", async () => {
    await renderReady();
    await act(async () => {
      lastButtonProps.onCancel();
    });
    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent(/payment cancelled/i);
  });

  it("blocks checkout and surfaces error when packageId is missing", async () => {
    invokeMock.mockResolvedValueOnce({ data: { clientId: "test-client", mode: "sandbox" }, error: null });
    render(<PayPalCheckout {...baseProps} packageId={undefined as any} />);
    await screen.findByTestId("paypal-button");

    await act(async () => {
      fireEvent.click(screen.getByTestId("paypal-button"));
    });

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent(/missing package/i);
    // create-order should not have been invoked (only the initial config call ran)
    expect(invokeMock).toHaveBeenCalledTimes(1);
  });

  it("Try again retriggers the paypal-config fetch", async () => {
    invokeMock.mockResolvedValueOnce({ data: null, error: { message: "down" } });
    render(<PayPalCheckout {...baseProps} />);
    await screen.findByRole("alert");

    invokeMock.mockResolvedValueOnce({ data: { clientId: "test-client", mode: "sandbox" }, error: null });
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /try again/i }));
    });

    await screen.findByTestId("paypal-button");
    expect(invokeMock).toHaveBeenCalledTimes(2);
  });
});
