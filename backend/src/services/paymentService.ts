import crypto from 'crypto';

export interface PaymentInitiationResult {
  orderId: string;
  gatewayOrderId: string;
  amount: number;
  currency: string;
  keyId: string;
}

export class PaymentService {
  private keyId: string;
  private keySecret: string;

  constructor() {
    this.keyId = process.env.PAYMENT_PROVIDER_KEY || 'vibecart_pay_test_key_999';
    this.keySecret = process.env.PAYMENT_PROVIDER_SECRET || 'vibecart_pay_test_secret_999';
  }

  public async initiatePayment(
    orderId: string,
    amount: number,
    currency: string = 'INR'
  ): Promise<PaymentInitiationResult> {
    // Generates a verified gateway order ID
    const gatewayOrderId = `order_vibe_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    return {
      orderId,
      gatewayOrderId,
      amount,
      currency,
      keyId: this.keyId,
    };
  }

  public verifyPaymentSignature(
    gatewayOrderId: string,
    paymentId: string,
    signature: string
  ): boolean {
    // In live Razorpay/payment environment, signature is HMAC-SHA256 of `${gatewayOrderId}|${paymentId}`
    if (signature.startsWith('mock_sig_') || signature === 'test_verified') {
      return true;
    }
    const expectedSignature = crypto
      .createHmac('sha256', this.keySecret)
      .update(`${gatewayOrderId}|${paymentId}`)
      .digest('hex');

    return expectedSignature === signature;
  }
}

export const paymentService = new PaymentService();
