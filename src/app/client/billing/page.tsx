"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";

interface SubscriptionTier {
  id: string;
  name: string;
  price: number;
  credits: number;
  rollover: number;
  features: string[];
}

interface BillingInfo {
  subscriptionTier?: string;
  subscriptionStatus?: string;
  credits: number;
  rolloverCredits: number;
  billingPeriodEnd?: string;
}

function BillingPageContent() {
  const searchParams = useSearchParams();
  const [tiers, setTiers] = useState<SubscriptionTier[]>([]);
  const [billing, setBilling] = useState<BillingInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState<string | null>(null);

  useEffect(() => {
    if (searchParams.get("success") === "true") {
      toast.success("Subscription activated successfully!");
    } else if (searchParams.get("canceled") === "true") {
      toast.info("Subscription canceled");
    }
  }, [searchParams]);

  useEffect(() => {
    Promise.all([fetchTiers(), fetchBilling()]).finally(() => setLoading(false));
  }, []);

  async function fetchTiers() {
    try {
      const response = await fetch("/api/payments/subscribe");
      const data = await response.json();
      if (data.success) {
        setTiers(data.data.tiers);
      }
    } catch (error) {
      console.error("Failed to fetch tiers:", error);
    }
  }

  async function fetchBilling() {
    try {
      const response = await fetch("/api/users/me/billing");
      const data = await response.json();
      if (data.success) {
        setBilling(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch billing:", error);
    }
  }

  async function subscribe(tierId: string) {
    setSubscribing(tierId);
    try {
      const response = await fetch("/api/payments/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tierId }),
      });

      const data = await response.json();
      if (data.success && data.data.url) {
        window.location.href = data.data.url;
      } else {
        toast.error(data.error?.message || "Failed to start subscription");
      }
    } catch (error) {
      console.error("Subscribe error:", error);
      toast.error("Failed to start subscription");
    } finally {
      setSubscribing(null);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  const hasActiveSubscription = billing?.subscriptionStatus === "active";

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Billing & Subscription</h1>
        <p className="text-muted-foreground mt-1">
          Manage your subscription and credits
        </p>
      </div>

      {/* Current Plan */}
      {hasActiveSubscription && billing && (
        <Card className="border-primary">
          <CardHeader>
            <CardTitle>Current Plan</CardTitle>
            <CardDescription>Your active subscription</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold capitalize">
                  {billing.subscriptionTier} Plan
                </p>
                <Badge variant="secondary" className="mt-1">
                  {billing.subscriptionStatus}
                </Badge>
              </div>
              <div className="text-right">
                <p className="text-4xl font-bold">{billing.credits}</p>
                <p className="text-sm text-muted-foreground">credits remaining</p>
              </div>
            </div>
            {billing.rolloverCredits > 0 && (
              <p className="text-sm text-muted-foreground">
                Includes {billing.rolloverCredits} rollover credits from last month
              </p>
            )}
            {billing.billingPeriodEnd && (
              <p className="text-sm text-muted-foreground">
                Next billing date:{" "}
                {new Date(billing.billingPeriodEnd).toLocaleDateString()}
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Credits Info */}
      {!hasActiveSubscription && (
        <Alert>
          <AlertDescription>
            You don&apos;t have an active subscription. Choose a plan below to get started.
          </AlertDescription>
        </Alert>
      )}

      {/* Pricing Tiers */}
      <div>
        <h2 className="text-xl font-bold mb-4">
          {hasActiveSubscription ? "Upgrade Your Plan" : "Choose a Plan"}
        </h2>
        <div className="grid gap-6 md:grid-cols-3">
          {tiers.map((tier) => {
            const isCurrentPlan = billing?.subscriptionTier === tier.id;
            return (
              <Card
                key={tier.id}
                className={isCurrentPlan ? "border-primary" : ""}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>{tier.name}</CardTitle>
                    {isCurrentPlan && (
                      <Badge variant="secondary">Current</Badge>
                    )}
                  </div>
                  <CardDescription>
                    <span className="text-3xl font-bold">${tier.price}</span>
                    <span className="text-muted-foreground">/month</span>
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center py-2 bg-muted rounded-lg">
                    <p className="text-2xl font-bold">{tier.credits}</p>
                    <p className="text-sm text-muted-foreground">
                      credits/month
                    </p>
                  </div>
                  <ul className="space-y-2">
                    {tier.features.map((feature, i) => (
                      <li key={i} className="text-sm flex items-start gap-2">
                        <span className="text-green-500">[+]</span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button
                    className="w-full"
                    variant={isCurrentPlan ? "outline" : "default"}
                    disabled={isCurrentPlan || subscribing !== null}
                    onClick={() => subscribe(tier.id)}
                  >
                    {subscribing === tier.id
                      ? "Loading..."
                      : isCurrentPlan
                      ? "Current Plan"
                      : hasActiveSubscription
                      ? "Upgrade"
                      : "Subscribe"}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function BillingPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      }
    >
      <BillingPageContent />
    </Suspense>
  );
}
