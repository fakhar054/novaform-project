import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CreditCard, Calendar, Plus, HeadphonesIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import Spinner from "../Spinner";

export const DashboardOverview: React.FC = () => {
  const [subscription, setSubscription] = useState();
  const [loading, setLoading] = useState(true);
  const [businessName, setBusinessName] = useState();
  const [profileChange, setProfileChange] = useState();
  const [updateDate, setUpdateDate] = useState();
  const [profileData, setProfileData] = useState();

  const navigate = useNavigate();

  useEffect(() => {
    const fetchSubscription = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();
      const userId = user.id;

      if (error) {
        console.error("Error getting user:", error.message);
      } else {
        console.log("User UUID:", userId);
      }

      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("subscription")
          .select("*")
          .eq("user_id", userId)
          .single();

        if (error) {
          console.error("Error fetching subscriptions:", error.message);
        } else {
          console.log("Subscriptions:", data);
          setSubscription(data);
        }
      } catch (err) {
        console.error("Unexpected error:", err);
      } finally {
        setLoading(false);
      }
    };

    const fetchUsers = async () => {
      setLoading(true);
      const { data, error } = await supabase.auth.getUser();
      const userId = data.user.id;

      try {
        const { data, error } = await supabase
          .from("users")
          .select("businessName")
          .eq("user_id", userId)
          .single();

        if (error) {
          console.error("Error fetching businessName:", error.message);
          return null;
        }

        console.log("Name based on userid: ", data);
        setBusinessName(data?.businessName);
        setLoading(false);
      } catch (err) {
        console.error("Unexpected error:", err);
        return null;
      }
    };

    fetchSubscription();
    fetchUsers();
  }, []);

  const formatDate = (isoDate) => {
    if (!isoDate) return "";
    return new Date(isoDate).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getDaysAgo = (dateString) => {
    if (!dateString) return "";
    const planDate = new Date(dateString);
    const today = new Date();

    const planDateOnly = new Date(planDate.toDateString());
    const todayOnly = new Date(today.toDateString());

    const diffTime = todayOnly - planDateOnly;
    const diffDays = diffTime / (1000 * 60 * 60 * 24);

    return `${diffDays} days ago `;
  };
  const handleBookSupport = () => {
    navigate("/book-demo");
  };

  const getPlanType = (
    created_at: string,
    current_period_end: string
  ): string => {
    const start = new Date(created_at);
    const end = new Date(current_period_end);

    const diffMs = end.getTime() - start.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    console.log("diffDays (UTC):", diffDays);

    return diffDays > 30 ? "Annual Billing" : "Monthly Billing";
  };

  useEffect(() => {
    // console.log("i am runnning");
    const fetchProfileByUserId = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const user_Id = user.id;
      console.log("Logged in User UUID:", user.id);

      const { data, error } = await supabase
        .from("profile_Update")
        .select("*")
        .eq("user_id", user_Id)
        .maybeSingle();

      if (error) {
        console.error("Error fetching profile:", error.message);
        return null;
      }

      console.log("Fetched profile Table:", data);
      setProfileChange(data?.changed_col);
      setProfileData(data);
      return data;
    };
    fetchProfileByUserId();
  }, []);

  const formatCurrencyItalian = (amount) => {
    const formatted = new Intl.NumberFormat("it-IT", {
      style: "currency",
      currency: "EUR",
    }).format(amount);

    // Force symbol in front
    return formatted.replace("€", "").trim().replace(/^/, "€ ");
  };

  function subtractDatesInDays(date) {
    if (!date) {
      return "";
    }
    const today = new Date();
    const givenDate = new Date(date);

    today.setHours(0, 0, 0, 0);
    givenDate.setHours(0, 0, 0, 0);

    const diffMs = givenDate - today;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays > 0) return diffDays + " day(s) remaining";
    return Math.abs(diffDays) + " day(s) ago";
  }

  if (loading) {
    return <Spinner />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-left text-2xl sm:text-3xl font-bold text-black mb-2">
          Welcome back, {businessName}!
        </h1>
        <p className="text-left text-gray-600">
          Here's an overview of your NovaFarm account
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 ">
        <div className="bg-white rounded-lg shadow-sm border p-6 text-left">
          <div className="flex items-center justify-between mb-4 ">
            <div className="w-12 h-12 bg-[#078147]/10 rounded-lg flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-[#078147]" />
            </div>
          </div>
          <h3 className="font-semibold text-black mb-1">Current Plan</h3>
          <p className="text-2xl font-bold text-[#078147] mb-1">
            {subscription?.plan_name ?? "No Plan"}
          </p>
          <p className="text-sm text-gray-600">
            {getPlanType(
              subscription?.created_at,
              subscription?.current_period_end
            )}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-[#078147]/10 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-[#078147]" />
            </div>
          </div>
          <h3 className="font-semibold text-black mb-1 text-left">
            Next Billing
          </h3>
          <p className="text-2xl font-bold text-black mb-1 text-left">
            {formatDate(subscription?.current_period_end ?? "None")}
          </p>
          <p className="text-sm text-gray-600 text-left">
            {formatCurrencyItalian(subscription?.amount_paid ?? 0)}
          </p>
        </div>

        {/* <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-[#078147]/10 rounded-lg flex items-center justify-center">
              <Plus className="w-6 h-6 text-[#078147]" />
            </div>
          </div>
          <h3 className="font-semibold text-black mb-1 text-left">
            Active Add-ons
          </h3>
          <p className="text-2xl font-bold text-black mb-1 text-left">3</p>
          <p className="text-sm text-gray-600 text-left">
            SMS notifications, Analytics+
          </p>
        </div> */}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-xl font-bold text-black mb-4 text-left">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            onClick={handleBookSupport}
            className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50 transition-colors text-left"
          >
            <div className="w-10 h-10 bg-[#078147]/10 rounded-lg flex items-center justify-center">
              <HeadphonesIcon className="w-5 h-5 text-[#078147]" />
            </div>
            <div>
              <h3 className="font-semibold text-black">Book Support Call</h3>
              <p className="text-sm text-gray-600">Get help from our team</p>
            </div>
          </button>

          <button
            onClick={handleBookSupport}
            className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50 transition-colors text-left"
          >
            <div className="w-10 h-10 bg-[#078147]/10 rounded-lg flex items-center justify-center">
              <Plus className="w-5 h-5 text-[#078147]" />
            </div>
            <div>
              <h3 className="font-semibold text-black">Access Help Center</h3>
              <p className="text-sm text-gray-600">Browse FAQs and guides</p>
            </div>
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-xl font-bold text-black mb-4 text-left">
          Recent Activity
        </h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b last:border-b-0">
            <div>
              <p className="font-medium text-black">Payment processed</p>
              <p className="text-sm text-gray-600 text-left">
                {subscription?.plan_name ?? "No Plan"}
                {/* renewal */}
              </p>
            </div>
            <span className="text-sm text-gray-500">
              {getDaysAgo(subscription?.created_at)}
            </span>
          </div>
          <div className="flex items-center justify-between py-3 border-b last:border-b-0">
            <div>
              <p className="font-medium text-black text-left">
                Profile updated
              </p>
              <p className="text-sm text-gray-600">{profileChange}</p>
            </div>
            <span className="text-sm text-gray-500">
              {subtractDatesInDays(profileData?.password_date)}
            </span>
          </div>

          <div className="flex items-center justify-between py-3 border-b last:border-b-0">
            <div>
              <p className="font-medium text-black text-left">Email Updated</p>
              <p className="text-sm text-gray-600 text-left">Email Changed</p>
            </div>
            <span className="text-sm text-gray-500">
              {subtractDatesInDays(profileData?.email_date)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
