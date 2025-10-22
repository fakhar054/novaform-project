import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import {
  CheckCircle,
  CreditCard,
  Calendar,
  Unlock,
  Mail,
  MessageCircle,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Spinner from "@/components/Spinner";

export default function Success() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [sessionData, setSessionData] = useState(null);
  const [loading, setLoading] = useState(true);
  const sessionId = searchParams.get("session_id");
  const [plan_info, setPlanInfo] = useState([]);
  const [planDuration, setPlanDuration] = useState();
  const [invoiceSaved, setInvoiceSaved] = useState(false);
  const [inoviceData, setInvoiceData] = useState();
  const [selectedSubscription, setSelectedSubscription] = useState();

  function generateInvoiceNo() {
    const year = new Date().getFullYear();
    const randomNum = Math.floor(100 + Math.random() * 900);
    return `NF:${year}-${randomNum}`;
  }

  const gotoDashboard = () => {
    navigate("/dashboard");
  };

  const contactFirstName = "John";
  const planDetails = {
    name: "NovaFarm Monthly",
    type: "Monthly",
    amount: "€97",
    billingCycle: "Renews every month",
    nextBilling: "February 15, 2024",
  };
  let duration = null;

  const fetchUserSubscription = async (userId) => {
    const { data, error } = await supabase
      .from("subscription")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error) {
      console.error("Error fetching subscription:", error);
    } else {
      console.log("User subscription:", data);
      setSelectedSubscription(data);
      return data;
    }
  };

  const saveSubscriptionHistory = async (userId, subscription) => {
    console.log("User id: ", userId);
    const { data, error } = await supabase.from("subscriptionHistory").upsert(
      [
        {
          user_id: userId,
          pervious_plan_name: subscription?.plan_name,
          pervious_plan_price: subscription?.amount_paid,
          pervious_plan_end_date: subscription?.current_period_end,
        },
      ],
      { onConflict: "user_id" }
    );

    if (error) {
      console.error("Error saving subscription history:", error);
    } else {
      console.log("Subscription history saved:", data);
    }
  };

  useEffect(() => {
    const invoiceNo = generateInvoiceNo();
    const fetchSessionData = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        const accessToken = session?.access_token;
        const userId = session?.user?.id;
        // fetchUserSubscription(userId);
        const subscription = await fetchUserSubscription(userId);
        if (subscription) {
          await saveSubscriptionHistory(userId, subscription);
        }

        if (!sessionId || !accessToken || !userId) {
          console.error("Missing sessionId, accessToken, or userId");
          return;
        }

        const res = await fetch(
          `https://ajbxscredobhqfksaqrk.supabase.co/functions/v1/get-session`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              session_id: sessionId,
              user_id: userId,
            }),
          }
        );

        if (!res.ok) {
          const errorText = await res.text();
          console.error("Error from server:", errorText);
          return;
        }
        const data = await res.json();
        const plan_id = data?.session?.subscription?.items?.data?.[0]?.plan?.id;

        console.log("Plan ID:", plan_id);

        const { data: planData, error } = await supabase
          .from("subscription_plan")
          .select("*")
          .or(
            `stripe_price_monthly_id.eq.${plan_id},stripe_price_yearly_id.eq.${plan_id}`
          )
          .single();

        if (error) {
          console.error("Error fetching plan:", error);
        } else {
          if (planData.stripe_price_monthly_id === plan_id) {
            console.log("Matched Monthly Plan:", planData);
            setPlanDuration("monthly");
            duration = "monthly";
            setPlanInfo(planData);
          } else if (planData.stripe_price_yearly_id === plan_id) {
            console.log("Matched Yearly Plan:", planData);
            setPlanDuration("yearly");
            duration = "yearly";
            setPlanInfo(planData);
          }
        }

        setSessionData(data);
        if (data.success === true) {
          // 1. Fetch user info from users table
          const { data: userInfo, error: userError } = await supabase
            .from("users")
            .select("*")
            .eq("user_id", userId)
            .single();

          if (userError) {
            console.error("Error fetching user info:", userError.message);
            return;
          } else {
            console.log(
              "response from fetching data from users_table",
              userInfo
            );
          }

          // 2. Insert into invoices table
          const { error: insertError } = await supabase
            .from("invoices")
            .insert({
              user_id: userInfo.user_id,
              customer_name: userInfo.contactPerson,
              personal_email: userInfo.billingEmail,
              address: userInfo.address,
              city: userInfo.city,
              province: userInfo.province,
              vat: userInfo.vatNumber,
              sdi: userInfo.sdi_code,
              // session_id: data.session.id,
              amount_total: data.session.amount_total / 100,
              status: true,
              invoice_no: invoiceNo,
              plan_name: planData.plan_name,
              duration: duration,
              // created_at: new Date(),
            });

          if (insertError) {
            console.error("Error saving invoice:", insertError.message);
          } else {
            // console.log("Invoice saved successfully 🎉");
            setInvoiceSaved(true);
            setLoading(false);
          }
        }
      } catch (err) {
        console.error("Fetch session error:", err);
      } finally {
      }
    };

    fetchSessionData();
  }, [sessionId]);

  useEffect(() => {
    const fetchInovice = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const accessToken = session?.access_token;
      const userId = session?.user?.id;

      console.log("Access Token:", accessToken);
      console.log("Session ID from second useEffect:", sessionId);
      console.log("User UUID from second useEffect:", userId);

      if (!sessionId || !accessToken || !userId) {
        console.error("Missing sessionId, accessToken, or userId");
        return;
      }

      if (invoiceSaved) {
        const { data, error } = await supabase
          .from("invoices")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: false })
          .limit(1);

        if (error) {
          console.error("Error fetching invoices:", error.message);
        } else if (data && data.length > 0) {
          console.log("Latest invoice:", data[0]);
          setInvoiceData(data[0]);
          setLoading(false);
        }
      }
    };
    fetchInovice();
  }, [invoiceSaved]);

  console.log("Data in Invoice Data", inoviceData);
  const billingCycle =
    inoviceData?.duration === "yearly"
      ? "Renews every year"
      : "Renews every month";

  function getExpiryDate(createdAt, duration) {
    const d = new Date(createdAt);
    if (duration === "yearly") {
      return new Date(
        d.getFullYear() + 1,
        d.getMonth(),
        d.getDate(),
        d.getHours(),
        d.getMinutes(),
        d.getSeconds()
      );
    }
    return new Date(
      d.getFullYear(),
      d.getMonth() + 1,
      d.getDate(),
      d.getHours(),
      d.getMinutes(),
      d.getSeconds()
    );
  }

  const expiryDate = getExpiryDate(
    inoviceData?.created_at,
    inoviceData?.duration
  );
  const nextBillingDate = expiryDate.toLocaleDateString();
  console.log("Expires:", expiryDate.toLocaleDateString());

  const priceId =
    sessionData?.session?.subscription?.items?.data?.[0]?.price?.id;
  console.log("The selected price id: ", priceId);

  const formatCurrencyItalian = (amount) => {
    const formatted = new Intl.NumberFormat("it-IT", {
      style: "currency",
      currency: "EUR",
    }).format(amount);

    return formatted.replace("€", "").trim().replace(/^/, "€ ");
  };

  if (loading) {
    return <Spinner />;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center space-y-8">
          {/* Confirmation Block */}
          <div className="space-y-4 animate-fade-in">
            <div className="flex justify-center">
              <CheckCircle className="h-16 w-16 text-primary" />
            </div>
            <h1 className="text-4xl font-bold text-foreground">
              Thank you, {inoviceData?.customer_name}!
            </h1>
            <p className="text-xl text-muted-foreground">
              Your subscription was successful.
            </p>
          </div>

          {/* Plan Summary Block */}
          <Card className="animate-fade-in" style={{ animationDelay: "0.2s" }}>
            <CardContent className="p-8">
              <h2 className="text-2xl font-semibold text-foreground mb-6">
                Subscription Details
              </h2>
              <div className="space-y-4 text-left">
                <div className="flex justify-between items-center py-2 border-b border-border">
                  <span className="text-muted-foreground">Plan Name:</span>
                  <span className="font-medium text-foreground">
                    {inoviceData?.plan_name}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border">
                  <span className="text-muted-foreground">Plan Type:</span>
                  <span className="font-medium text-foreground">
                    {inoviceData?.duration}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border">
                  <span className="text-muted-foreground">Amount Paid:</span>
                  <span className="font-medium text-foreground text-primary">
                    {formatCurrencyItalian(inoviceData?.amount_total)}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border">
                  <span className="text-muted-foreground">Billing Cycle:</span>
                  <span className="font-medium text-foreground">
                    {billingCycle}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-muted-foreground">
                    Next Billing Date:
                  </span>
                  <span className="font-medium text-foreground">
                    {nextBillingDate}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* What's Next Block */}
          <div
            className="space-y-6 animate-fade-in"
            style={{ animationDelay: "0.4s" }}
          >
            <h2 className="text-2xl font-semibold text-foreground">
              What's Next?
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              You'll receive a confirmation email with your login details. You
              can now access your dashboard and start using all the features
              included in your plan.
            </p>

            <div className="grid gap-4 md:grid-cols-3 text-left">
              <div className="flex items-start space-x-3">
                <Unlock className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-medium text-foreground">
                    Access your dashboard
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Start using all premium features
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Mail className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-medium text-foreground">
                    Check your inbox
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Confirmation email on its way
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <MessageCircle className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-medium text-foreground">
                    Contact us if you need help
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    We're here to assist you
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div
            className="space-y-4 animate-fade-in"
            style={{ animationDelay: "0.6s" }}
          >
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="px-8" onClick={gotoDashboard}>
                Go to Dashboard
              </Button>
              {/* <Button variant="outline" size="lg" className="px-8">
                Need help? Contact us
              </Button> */}
            </div>
          </div>

          {/* Footer Logo */}
          <div
            className="pt-8 animate-fade-in"
            style={{ animationDelay: "0.8s" }}
          >
            <p className="text-sm text-muted-foreground">
              © 2024 NovaFarm. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
