import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent, act } from "@testing-library/react";

// PayPalCheckout is the same component that hosts the card funding source —
// the PayPal SDK renders both a PayPal button and a "Debit or Credit Card"
// button under one provider. This UI test mocks the SDK so we can simulate
// the user clicking the card button without opening any external popup.

const invokeMock = vi.fn();
vi.mock("@/integrations/supabase/client", () => ({
  supabase: { functions: { invoke: (...args: any[]) => invokeMock(...args) } },
}));

const toastSuccess = vi.fn();
const toastError = vi.fn();
vi.mock("sonner", () => ({
  toast: { success: (...a: any[]) => toastSuccess(...a), error: (...a: any[]) => toastError(...a) },
}));

// Render TWO funding-source buttons (paypal + card) and expose card handlers.
let cardProps: any = null;
vi.mock("@paypal/react-paypal-js", () => ({
  PayPalScriptProvider: ({ children }: any) => <div data-testid="provider">{children}</div>,
  PayPalButtons: (props: any) => {
    cardProps = props;
    return (
      <div>
        <button data-testid="paypal-funding">PayPal</button>
        <button
          data-testid="card-funding"
          onClick={async () => {
            try {
              const orderId = await props.createOrder?.();
              if (orderId) await props.onApprove?.({ orderID: orderId });
            } catch {
              /* error surfaced via setError */
            }
          }}
        >
          Debit or Credit Card
        </button>
      </div>
    );
  },
}));

import { PayPalCheckout } from "./PayPalCheckout";

const props = {
  amount: 25,
  currency: "USD",
  requestedTier: "vip",
  packageId: "pkg-card-1",
  packageName: "VIP Card Test",
};

beforeEach(() => {
  invokeMock.mockReset();
  toastSuccess.mockReset();
  toastError.mockReset();
  cardProps = null;
});

async function mount(extra: any = {}) {
  invokeMock.mockResolvedValueOnce({ data: { clientId: "test-id", mode: "sandbox" }, error: null });
  render(<PayPalCheckout {...props} {...extra} />);
  await screen.findByTestId("card-funding");
}

describe("Credit-card checkout (PayPal card funding source)", () => {
  it("shows success state when card payment captures successfully", async () => {
    const onSuccess = vi.fn();
    await mount({ onSuccess });

    invokeMock.mockResolvedValueOnce({ data: { orderId: "ORDER-CARD" }, error: null });
    invokeMock.mockResolvedValueOnce({ data: { success: true }, error: null });

    await act(async () => {
      fireEvent.click(screen.getByTestId("card-funding"));
    });

    await waitFor(() => expect(onSuccess).toHaveBeenCalledTimes(1));
    expect(toastSuccess).toHaveBeenCalledWith(expect.stringMatching(/payment confirmed/i));
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("shows failure panel when create-order rejects the card payment", async () => {
    await mount();
    invokeMock.mockResolvedValueOnce({
      data: null,
      error: { context: { json: { error: "Card declined", details: "do_not_honor" } } },
    });

    await act(async () => {
      fireEvent.click(screen.getByTestId("card-funding"));
    });

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent(/card declined/i);
    expect(alert).toHaveTextContent(/do_not_honor/);
    expect(screen.getByRole("button", { name: /try again/i })).toBeInTheDocument();
  });

  it("shows failure panel when capture-order rejects after approval", async () => {
    const onSuccess = vi.fn();
    await mount({ onSuccess });

    invokeMock.mockResolvedValueOnce({ data: { orderId: "ORDER-CARD-2" }, error: null });
    invokeMock.mockResolvedValueOnce({
      data: null,
      error: { context: { json: { error: "Capture failed" } } },
    });

    await act(async () => {
      fireEvent.click(screen.getByTestId("card-funding"));
    });

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent(/capture failed/i);
    expect(onSuccess).not.toHaveBeenCalled();
  });

  it("shows the card-popup error state when the SDK fires onError", async () => {
    await mount();
    await act(async () => {
      cardProps.onError(new Error("3DS challenge failed"));
    });
    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent(/paypal checkout error/i);
    expect(alert).toHaveTextContent(/3ds challenge failed/i);
  });

  it("retry button clears the error and allows a successful second attempt", async () => {
    const onSuccess = vi.fn();
    await mount({ onSuccess });

    // First attempt fails at create-order
    invokeMock.mockResolvedValueOnce({
      data: null,
      error: { context: { json: { error: "Temporary issue" } } },
    });
    await act(async () => {
      fireEvent.click(screen.getByTestId("card-funding"));
    });
    await screen.findByRole("alert");

    // Click Try again — triggers config reload; mock the reload + a clean second flow
    invokeMock.mockResolvedValueOnce({ data: { clientId: "test-id", mode: "sandbox" }, error: null });
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /try again/i }));
    });
    await waitFor(() => expect(screen.queryByRole("alert")).not.toBeInTheDocument());

    // Second attempt: create-order + capture succeed
    invokeMock.mockResolvedValueOnce({ data: { orderId: "ORDER-RETRY" }, error: null });
    invokeMock.mockResolvedValueOnce({ data: { success: true }, error: null });

    await act(async () => {
      fireEvent.click(screen.getByTestId("card-funding"));
    });

    await waitFor(() => expect(onSuccess).toHaveBeenCalledTimes(1));
    expect(toastSuccess).toHaveBeenCalledWith(expect.stringMatching(/payment confirmed/i));
  });
});
