import React, { useEffect, useState } from "react";
import {
  CreditCard,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  X,
} from "lucide-react";
import { AddPaymentMethodModal } from "./AddPaymentMethodModal";
import { supabase } from "@/integrations/supabase/client";
import { loadStripe } from "@stripe/stripe-js";
import Spinner from "../Spinner";

const stripePromise = loadStripe("pk_test_XnUVXcT65YQFYJOe88yYvrrh00gGazBh6a");

export const SubscriptionBilling: React.FC = () => {
  const [isAnnual, setIsAnnual] = useState(true);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showAddPaymentModal, setShowAddPaymentModal] = useState(false);

  const [billingType, setBillingType] = useState<"monthly" | "yearly">(
    "monthly"
  );
  const [subscription_plans, set_subscription_Plans] = useState([]);

  const [monthlyPlans, setMonthlyPlans] = useState([]);
  const [yearlyPlans, setYearlyPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [allPlans, setAllPlans] = useState([]);

  const [plan, setPlan] = useState();
  const [selectedPlanId, setSelectedPlanId] = useState();
  const [selectedPlanPrice, setSelectedPlanPrice] = useState();
  const [tags, setTags] = useState("");
  const [planInfo, setPlanInfo] = useState();

  const [selectedSubscription, setSelectedSubscription] = useState();

  const fetchPlans = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("subscription_plan")
      .select("*");

    if (error) {
      console.error("Error fetching plans:", error.message);
    } else {
      console.log("All plans coming from subscription_plan: ", data);
      const planFound = data.find(
        (plan) =>
          plan.stripe_price_monthly_id === selectedPlanId ||
          plan.stripe_price_yearly_id === selectedPlanId
      );

      setPlanInfo(planFound);
      console.log("Found plan: ", planFound);
      setAllPlans(data);

      const monthly = [];
      const yearly = [];
      data.forEach((plan) => {
        if (plan.price_monthly && plan.stripe_price_monthly_id) {
          monthly.push({
            id: plan.id,
            name: plan.plan_name,
            price: plan.price_monthly,
            description: plan.plan_description || "",
            stripePriceId: plan.stripe_price_monthly_id,
            features: plan.tags ? plan.tags.split(",") : [],
            currency: plan.currency || "EUR",
            tags: plan?.tags,
          });
        }
        if (plan.price_yearly && plan.stripe_price_yearly_id) {
          yearly.push({
            id: plan.id,
            name: plan.plan_name,
            price: plan.price_yearly,
            description: plan.plan_description || "",
            stripePriceId: plan.stripe_price_yearly_id,
            features: plan.tags ? plan.tags.split(",") : [],
            currency: plan.currency || "EUR",
            tags: plan?.tags,
          });
        }
      });
      setMonthlyPlans(monthly);
      setYearlyPlans(yearly);
    }
    setLoading(false);
  };

  console.log("Mothly Plans ", monthlyPlans);

  useEffect(() => {
    fetchPlans();
    if (selectedPlanId) {
      fetchPlans();
    }
  }, [selectedPlanId]);

  console.log("Monthly Plans:", monthlyPlans);
  console.log("Yearly Plans:", yearlyPlans);

  const saveSubscriptionHistory = async (userId) => {
    console.log("User id: ", userId);

    const { data, error } = await supabase.from("subscriptionHistory").upsert(
      [
        {
          user_id: userId,
          pervious_plan_name: selectedSubscription.plan_name,
          pervious_plan_price: selectedSubscription.amount_paid,
          pervious_plan_end_date: selectedSubscription.current_period_end,
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

  async function handleCheckout(priceId) {
    console.log("Price Id", priceId);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const {
      data: { session },
    } = await supabase.auth.getSession();

    // saveSubscriptionHistory(user.id);
    const res = await fetch(
      "https://ajbxscredobhqfksaqrk.supabase.co/functions/v1/checkout-fun",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({ priceId, user_id: user.id }),
      }
    );
    const data = await res.json();
    if (data.sessionId) {
      const stripe = await stripePromise;
      stripe?.redirectToCheckout({ sessionId: data.sessionId });
    } else {
      console.error("Checkout error:", data.error);
    }
  }

  const currentPlan = {
    name: "Premium",
    price: isAnnual ? 199 : 19.99,
    period: isAnnual ? "year" : "month",
    nextBilling: "January 15, 2025",
    features: [
      "Unlimited appointments",
      "Advanced analytics",
      "SMS notifications",
      "Priority support",
      "Custom branding",
    ],
  };

  useEffect(() => {
    const fetchCurrentPlan = async () => {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        console.error("Error fetching user:", userError.message);
        return;
      }

      if (!user) {
        console.error("No user logged in");
        return;
      }
      console.log("Uuser id ddd:", user.id);
      const { data, error } = await supabase
        .from("subscription")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error) {
        console.error("Error fetching plan:", error.message);
      } else {
        console.log("Selectd Subscription : ", data);
        setSelectedSubscription(data);

        console.log("Selectd Subscription id: ", data?.selected_plan_id);
        setPlan(data);
        setSelectedPlanId(data?.selected_plan_id);
        setSelectedPlanPrice(data?.amount_paid);
        setLoading(false);
      }
    };
    fetchCurrentPlan();
  }, []);

  const formatDate = (isoDate) => {
    if (!isoDate) return "";
    const date = new Date(isoDate);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getPlanType = (
    created_at: string,
    current_period_end: string
  ): string => {
    const start = new Date(created_at);
    const end = new Date(current_period_end);

    const diffMs = end.getTime() - start.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    // console.log("diffDays (UTC):", diffDays);
    return diffDays > 32 ? "Annual Billing" : "Monthly Billing";
  };

  const formatCurrencyItalian = (amount) => {
    const formatted = new Intl.NumberFormat("it-IT", {
      style: "currency",
      currency: "EUR",
    }).format(amount);

    // Force symbol in front
    return formatted.replace("€", "").trim().replace(/^/, "€ ");
  };

  if (loading) {
    return <Spinner />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-black mb-2 text-left">
          Subscription & Billing
        </h1>
        <p className="text-gray-600 text-left">
          Manage your subscription plan and billing information
        </p>
      </div>

      {/* Current Plan */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-xl font-bold text-black mb-6 text-left">
          Current Plan
        </h2>

        <div className="bg-[#078147]/5 border-2 border-[#078147]/20 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-2xl font-bold text-[#078147] text-left">
                {plan?.plan_name}
              </h3>
              <p className="text-gray-600 text-left">
                {plan?.amount_paid
                  ? formatCurrencyItalian(plan?.amount_paid)
                  : "0.00"}
                /{getPlanType(plan?.created_at, plan?.current_period_end)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Next billing</p>
              <p className="font-semibold text-black">
                {plan?.current_period_end
                  ? formatDate(plan?.current_period_end)
                  : "NULL"}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
            <div className="flex items-center space-x-2">
              {/* <div className="w-2 h-2 bg-[#078147] rounded-full"></div> */}
              <span className="text-sm text-gray-700">
                <div
                  className="prose featurs-list px-6 text-sm text-gray-700"
                  dangerouslySetInnerHTML={{ __html: planInfo?.tags }}
                />
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Billing Frequency */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-xl font-bold text-black mb-6 text-left">
          Billing Frequency
        </h2>

        <div className="flex bg-gray-100 rounded-lg p-1 max-w-xs">
          <button
            onClick={() => setIsAnnual(false)}
            className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              !isAnnual
                ? "bg-white text-[#078147] shadow-sm"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setIsAnnual(true)}
            className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              isAnnual
                ? "bg-white text-[#078147] shadow-sm"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            Annual
            {/* <span className="ml-1 text-xs bg-[#078147] text-white px-1.5 py-0.5 rounded">
              Save 17%
            </span> */}
          </button>
        </div>
      </div>

      {/* Available Plans */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-xl font-bold text-black mb-6 text-left">
          Available Plans
        </h2>

        {isAnnual ? (
          <div className="plan_parent flex  flex-wrap gap-4  text-left">
            {yearlyPlans.map((yearPlan) => (
              <div
                key={yearPlan.id}
                className="bg-white relative rounded-lg shadow-sm p-6 border mb-4 w-full sm:w-[48%] lg:w-[45%]"
              >
                {yearPlan.stripePriceId === selectedPlanId && (
                  <div className="absolute -top-3 left-4 bg-[#078147] text-white px-3 py-1 rounded-full text-sm font-medium">
                    Current Plan
                  </div>
                )}
                <h3 className="text-lg font-bold mb-2">{yearPlan.name}</h3>
                <p className="text-2xl font-bold mb-2 text-[#078147]">
                  {formatCurrencyItalian(yearPlan.price)} / Year
                </p>
                <div
                  dangerouslySetInnerHTML={{ __html: yearPlan?.tags }}
                  className="[&>ul]:list-disc [&>ul]:pl-5 [&>li]:marker:text-green-600 text-gray-700 space-y-2"
                />

                <button
                  onClick={() => handleCheckout(yearPlan.stripePriceId)}
                  className="w-full bg-[#078147] text-white py-3 rounded-lg font-semibold hover:bg-[#066139] transition-colors flex items-center justify-center space-x-2"
                >
                  {yearPlan.price > selectedPlanPrice ? (
                    <>
                      <span>Upgrade Plan</span>
                      <ArrowUpRight className="h-5 w-5" />
                    </>
                  ) : (
                    <>
                      <span>DownGrade Plan</span>
                      <ArrowDownRight className="h-5 w-5" />
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="plan_parent flex flex-wrap gap-4 text-left">
            {monthlyPlans.map((monthlyPlan) => (
              <div
                key={monthlyPlan.id}
                className="rounded-lg relative shadow-sm p-6 border mb-4 w-full sm:w-[48%] lg:w-[45%]"
              >
                {monthlyPlan.stripePriceId === selectedPlanId && (
                  <div className="absolute -top-3 left-4 bg-[#078147] text-white px-3 py-1 rounded-full text-sm font-medium">
                    Current Plan
                  </div>
                )}
                <h3 className="text-lg font-bold mb-2">{monthlyPlan.name}</h3>
                <p className="text-2xl font-bold mb-2 text-[#078147]">
                  {/* ${monthlyPlan.price} / month */}
                  {formatCurrencyItalian(monthlyPlan?.price)} / month
                </p>

                <div
                  dangerouslySetInnerHTML={{ __html: monthlyPlan?.tags }}
                  className="[&>ul]:list-disc [&>ul]:pl-5 [&>li]:marker:text-green-600 text-gray-700 space-y-2"
                />

                <button
                  className="w-full bg-[#078147] text-white py-3 rounded-lg font-semibold hover:bg-[#066139] transition-colors flex items-center justify-center space-x-2"
                  onClick={() => handleCheckout(monthlyPlan.stripePriceId)}
                >
                  {monthlyPlan.price > selectedPlanPrice ? (
                    <>
                      <span>Upgrade Plan</span>
                      <ArrowUpRight className="w-5 h-5" />
                    </>
                  ) : (
                    <>
                      <span>DownGrade Plan</span>
                      <ArrowDownRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Cancel Subscription Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-black">
                Cancel Subscription
              </h3>
              <button
                onClick={() => setShowCancelModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <p className="text-gray-600 mb-6">
              Are you sure you want to cancel your subscription? You'll lose
              access to all premium features at the end of your current billing
              period.
            </p>

            <div className="flex space-x-4">
              <button
                onClick={() => setShowCancelModal(false)}
                className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
              >
                Keep Subscription
              </button>
              <button className="flex-1 bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors">
                Cancel Subscription
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Payment Method Modal */}
      <AddPaymentMethodModal
        isOpen={showAddPaymentModal}
        onClose={() => setShowAddPaymentModal(false)}
      />
    </div>
  );
};
