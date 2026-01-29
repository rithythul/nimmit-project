import Stripe from "stripe";

let stripeInstance: Stripe | null = null;

function getStripe(): Stripe {
  if (!stripeInstance) {
    stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY!);
  }
  return stripeInstance;
}

// ===========================================
// Subscription Tiers
// ===========================================

export interface SubscriptionTier {
  id: string;
  name: string;
  price: number;
  credits: number;
  rollover: number;
  features: string[];
}

export const SUBSCRIPTION_TIERS: Record<string, SubscriptionTier> = {
  starter: {
    id: "starter",
    name: "Starter",
    price: 499,
    credits: 10,
    rollover: 2,
    features: [
      "10 task credits/month",
      "Up to 2 rollover credits",
      "48-hour delivery",
      "Email support",
    ],
  },
  growth: {
    id: "growth",
    name: "Growth",
    price: 999,
    credits: 25,
    rollover: 3,
    features: [
      "25 task credits/month",
      "Up to 3 rollover credits",
      "24-hour delivery option",
      "Priority support",
      "Dedicated account manager",
    ],
  },
  scale: {
    id: "scale",
    name: "Scale",
    price: 1999,
    credits: 60,
    rollover: 6,
    features: [
      "60 task credits/month",
      "Up to 6 rollover credits",
      "Rush delivery (12h) included",
      "Priority queue placement",
      "Dedicated team",
      "Custom workflows",
    ],
  },
};

// ===========================================
// Checkout
// ===========================================

export interface CreateCheckoutParams {
  tierId: string;
  customerId?: string;
  customerEmail: string;
  successUrl: string;
  cancelUrl: string;
}

export async function createCheckoutSession(
  params: CreateCheckoutParams
): Promise<{ sessionId: string; url: string }> {
  const stripe = getStripe();
  const tier = SUBSCRIPTION_TIERS[params.tierId];

  if (!tier) {
    throw new Error(`Invalid tier: ${params.tierId}`);
  }

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    payment_method_types: ["card"],
    customer: params.customerId,
    customer_email: params.customerId ? undefined : params.customerEmail,
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: `Nimmit ${tier.name} Plan`,
            description: `${tier.credits} task credits per month`,
          },
          unit_amount: tier.price * 100,
          recurring: {
            interval: "month",
          },
        },
        quantity: 1,
      },
    ],
    metadata: {
      tierId: params.tierId,
    },
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
  });

  return {
    sessionId: session.id,
    url: session.url!,
  };
}

// ===========================================
// Customer Portal
// ===========================================

export async function createPortalSession(
  customerId: string,
  returnUrl: string
): Promise<{ url: string }> {
  const stripe = getStripe();

  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });

  return { url: session.url };
}

// ===========================================
// Customer Management
// ===========================================

export async function createCustomer(
  email: string,
  name: string,
  metadata?: Record<string, string>
): Promise<string> {
  const stripe = getStripe();

  const customer = await stripe.customers.create({
    email,
    name,
    metadata,
  });

  return customer.id;
}

export async function getCustomer(customerId: string): Promise<Stripe.Customer | null> {
  const stripe = getStripe();

  try {
    const customer = await stripe.customers.retrieve(customerId);
    if (customer.deleted) return null;
    return customer as Stripe.Customer;
  } catch {
    return null;
  }
}

// ===========================================
// Subscription Management
// ===========================================

export async function getSubscription(
  subscriptionId: string
): Promise<Stripe.Subscription | null> {
  const stripe = getStripe();

  try {
    return await stripe.subscriptions.retrieve(subscriptionId);
  } catch {
    return null;
  }
}

export async function cancelSubscription(
  subscriptionId: string,
  immediately = false
): Promise<Stripe.Subscription> {
  const stripe = getStripe();

  if (immediately) {
    return await stripe.subscriptions.cancel(subscriptionId);
  }

  return await stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: true,
  });
}

// ===========================================
// Webhook Handling
// ===========================================

export async function constructWebhookEvent(
  payload: string,
  signature: string
): Promise<Stripe.Event> {
  const stripe = getStripe();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

  return stripe.webhooks.constructEvent(payload, signature, webhookSecret);
}

export { getStripe };
