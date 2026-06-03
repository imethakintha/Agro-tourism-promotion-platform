import Stripe from 'stripe';
import dotenv from 'dotenv';
dotenv.config();

const isMock = !process.env.STRIPE_SECRET_KEY;
const stripe = isMock ? null : new Stripe(process.env.STRIPE_SECRET_KEY);

export const createStripePaymentIntent = async (amount, currency = 'lkr', metadata = {}) => {
  if (isMock) {
    console.log('[MOCK STRIPE] Creating Payment Intent:', { amount, currency });
    return {
      id: `pi_mock_${Date.now()}`,
      client_secret: `secret_mock_${Date.now()}`,
      amount,
      currency
    };
  }

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency,
      metadata,
      automatic_payment_methods: {
        enabled: true,
      },
    });
    return paymentIntent;
  } catch (error) {
    console.error('Stripe Error:', error);
    throw error;
  }
};

export const processStripeRefund = async (paymentIntentId, amount) => {
    if (isMock) {
        console.log('[MOCK STRIPE] Processing Refund:', { paymentIntentId, amount });
        return { id: `re_mock_${Date.now()}`, status: 'succeeded' };
    }

    try {
        const refund = await stripe.refunds.create({
            payment_intent: paymentIntentId,
            amount: Math.round(amount * 100),
        });
        return refund;
    } catch (error) {
        console.error('Stripe Refund Error:', error);
        throw error;
    }
};