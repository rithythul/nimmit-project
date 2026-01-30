import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connection";
import { User } from "@/lib/db/models";
import { constructWebhookEvent, SUBSCRIPTION_TIERS } from "@/lib/payments/stripe";
import { logger } from "@/lib/logger";
import type Stripe from "stripe";

// POST /api/payments/webhook - Handle Stripe webhooks
export async function POST(request: NextRequest) {
  try {
    const payload = await request.text();
    const signature = request.headers.get("stripe-signature");

    if (!signature) {
      return NextResponse.json(
        { error: "Missing stripe-signature header" },
        { status: 400 }
      );
    }

    const event = await constructWebhookEvent(payload, signature);

    await connectDB();

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(session);
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdated(subscription);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(subscription);
        break;
      }

      case "invoice.paid": {
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoicePaid(invoice);
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        await handlePaymentFailed(invoice);
        break;
      }

      default:
        logger.debug("Webhook", `Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    logger.error("Webhook", "Webhook handler failed", { error: String(error) });
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 400 }
    );
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  if (!session.customer || !session.subscription) return;

  const customerId = typeof session.customer === "string"
    ? session.customer
    : session.customer.id;

  const subscriptionId = typeof session.subscription === "string"
    ? session.subscription
    : session.subscription.id;

  const tierId = session.metadata?.tierId;
  const tier = tierId ? SUBSCRIPTION_TIERS[tierId] : null;

  // Find user by email and update billing info
  const customerEmail = session.customer_email || session.customer_details?.email;
  if (!customerEmail) return;

  await User.findOneAndUpdate(
    { email: customerEmail.toLowerCase() },
    {
      "clientProfile.billing.stripeCustomerId": customerId,
      "clientProfile.billing.subscriptionId": subscriptionId,
      "clientProfile.billing.subscriptionTier": tierId,
      "clientProfile.billing.subscriptionStatus": "active",
      "clientProfile.billing.credits": tier?.credits || 0,
    }
  );
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const customerId = typeof subscription.customer === "string"
    ? subscription.customer
    : subscription.customer.id;

  const status = mapSubscriptionStatus(subscription.status);

  // Access period dates from items if available
  const periodStart = (subscription as unknown as { current_period_start?: number }).current_period_start;
  const periodEnd = (subscription as unknown as { current_period_end?: number }).current_period_end;

  const updateData: Record<string, unknown> = {
    "clientProfile.billing.subscriptionStatus": status,
  };

  if (periodStart) {
    updateData["clientProfile.billing.billingPeriodStart"] = new Date(periodStart * 1000);
  }
  if (periodEnd) {
    updateData["clientProfile.billing.billingPeriodEnd"] = new Date(periodEnd * 1000);
  }

  await User.findOneAndUpdate(
    { "clientProfile.billing.stripeCustomerId": customerId },
    updateData
  );
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const customerId = typeof subscription.customer === "string"
    ? subscription.customer
    : subscription.customer.id;

  await User.findOneAndUpdate(
    { "clientProfile.billing.stripeCustomerId": customerId },
    {
      "clientProfile.billing.subscriptionStatus": "canceled",
      "clientProfile.billing.subscriptionId": null,
      "clientProfile.billing.subscriptionTier": null,
    }
  );
}

async function handleInvoicePaid(invoice: Stripe.Invoice) {
  // Type cast for subscription field
  const invoiceData = invoice as unknown as {
    subscription?: string | { id: string };
    customer?: string | { id: string };
    period_start?: number;
    period_end?: number;
  };

  if (!invoiceData.subscription) return;

  const customerId = typeof invoiceData.customer === "string"
    ? invoiceData.customer
    : invoiceData.customer?.id;

  if (!customerId) return;

  // Find the user
  const user = await User.findOne({
    "clientProfile.billing.stripeCustomerId": customerId,
  });

  if (!user || !user.clientProfile?.billing?.subscriptionTier) return;

  const tier = SUBSCRIPTION_TIERS[user.clientProfile.billing.subscriptionTier];
  if (!tier) return;

  // Calculate new credits with rollover
  const currentCredits = user.clientProfile.billing.credits || 0;
  const rolloverCredits = Math.min(currentCredits, tier.rollover);
  const newCredits = tier.credits + rolloverCredits;

  const updateData: Record<string, unknown> = {
    "clientProfile.billing.credits": newCredits,
    "clientProfile.billing.rolloverCredits": rolloverCredits,
  };

  if (invoiceData.period_start) {
    updateData["clientProfile.billing.billingPeriodStart"] = new Date(invoiceData.period_start * 1000);
  }
  if (invoiceData.period_end) {
    updateData["clientProfile.billing.billingPeriodEnd"] = new Date(invoiceData.period_end * 1000);
  }

  await User.findByIdAndUpdate(user._id, updateData);
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  const invoiceData = invoice as unknown as {
    customer?: string | { id: string };
  };

  const customerId = typeof invoiceData.customer === "string"
    ? invoiceData.customer
    : invoiceData.customer?.id;

  if (!customerId) return;

  await User.findOneAndUpdate(
    { "clientProfile.billing.stripeCustomerId": customerId },
    {
      "clientProfile.billing.subscriptionStatus": "past_due",
    }
  );
}

function mapSubscriptionStatus(status: Stripe.Subscription.Status): string {
  switch (status) {
    case "active":
      return "active";
    case "canceled":
      return "canceled";
    case "past_due":
      return "past_due";
    case "trialing":
      return "trialing";
    default:
      return "active";
  }
}
