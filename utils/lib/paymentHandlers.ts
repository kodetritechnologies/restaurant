import crypto from "crypto";
import dbConnect from "@/utils/lib/dbConnect";
import Credential from "@/utils/models/Credential";

export interface OrderPayload {
  cartItems: any[];
  customerDetails: any;
  deliveryType: string;
  paymentMethod: string;
  subtotal: number;
  deliveryFee: number;
  totalAmount: number;
  [key: string]: any;
}

export interface PaymentResult {
  success: boolean;
  message?: string;
  transactionId?: string;
  gatewayResponse?: any;
  requiresWebhookConfirmation?: boolean;
}

async function handleCOD(_orderData: OrderPayload): Promise<PaymentResult> {
  return {
    success: true,
    transactionId: undefined,
    gatewayResponse: null,
  };
}

async function handlePayLater(_orderData: OrderPayload): Promise<PaymentResult> {
  return {
    success: true,
    transactionId: undefined,
    gatewayResponse: null,
  };
}


async function handleRazorpay(orderData: OrderPayload): Promise<PaymentResult> {
  const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = orderData;

  if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
    return {
      success: false,
      message: "Missing Razorpay payment details (orderId, paymentId, or signature).",
    };
  }

  await dbConnect();
  const credentials = await Credential.findOne({});

  if (!credentials?.razorpay?.secret) {
    return { success: false, message: "Razorpay credentials are not configured." };
  }

  const expectedSignature = crypto
    .createHmac("sha256", credentials.razorpay.secret.trim())
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest("hex");

  if (expectedSignature !== razorpaySignature) {
    return { success: false, message: "Payment verification failed. Invalid signature." };
  }

  return {
    success: true,
    transactionId: razorpayPaymentId,
    gatewayResponse: { razorpayOrderId, razorpayPaymentId, razorpaySignature },
  };
}

type PaymentHandler = (orderData: OrderPayload) => Promise<PaymentResult>;

const PAYMENT_HANDLERS: Record<string, PaymentHandler> = {
  cod: handleCOD,
  razorpay: handleRazorpay,
  paylater: handlePayLater,
};
export async function processPayment(
  paymentMethod: string,
  orderData: OrderPayload
): Promise<PaymentResult> {
  const normalizedMethod = paymentMethod?.toLowerCase().trim();
  const handler = PAYMENT_HANDLERS[normalizedMethod];

  if (!handler) {
    return {
      success: false,
      message: `Unsupported payment method: "${paymentMethod}". Accepted: ${Object.keys(PAYMENT_HANDLERS).join(", ")}.`,
    };
  }

  return handler(orderData);
}
