import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
// import { useSession } from "@supabase/auth-helpers-react";

interface ChangePlanModalProps {
  user: any;
  isOpen: boolean;
  onClose: () => void;
  onPlanChange?: (plan: string) => void;
}

export const ChangePlanModal: React.FC<ChangePlanModalProps> = ({
  user,
  isOpen,
  onClose,
  onPlanChange,
}) => {
  const [selectedPlan, setSelectedPlan] = useState(user.plan);
  const [latestPlan, setLatestPlan] = useState(user.plan);
  const [billingCycle, setBillingCycle] = useState("monthly");
  const [AllPlans, setAllPlans] = useState([]);

  const [newPlan, setNewPlan] = useState();
  // console.log("User details : ", user?.user_id);

  console.log("Billing Cycle is : ", billingCycle);

  const userId = user.id;
  const fetchSubscriptionPlans = async () => {
    const { data, error } = await supabase
      .from("subscription_plan")
      .select("*");
    if (error) {
      console.error("Error fetching subscription plans:", error.message);
      return;
    }
    setAllPlans(data || []);
  };

  const fetchLatestPlan = async () => {
    const { data, error } = await supabase
      .from("users")
      .select("plan")
      .eq("uuid", user.id)
      .single();
    if (!error && data?.plan) {
      setLatestPlan(data.plan);
      setSelectedPlan(data.plan);
    }
  };

  useEffect(() => {
    fetchSubscriptionPlans();
    if (user?.uuid) {
      fetchLatestPlan();
    }
  }, [user]);

  console.log("ALl plans", AllPlans);
  const handleSave = async () => {
    console.log("Clicked save button");
    updatePlanInSupabase(user?.user_id);
    updatePlanInUser(user?.user_id);
    onClose();
  };

  function getLocalCreatedAt(): string {
    const date = new Date();

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");

    const millis = String(date.getMilliseconds()).padStart(3, "0") + "000";

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}.${millis}+00`;
  }

  const getCurrentPlan = () => AllPlans.find((p) => p.id === latestPlan);
  const getSelectedPlan = () => AllPlans.find((p) => p.id === selectedPlan);

  function addOneMonth(createdAt: string): string {
    const [datePart, timePart] = createdAt.split(" ");
    const isoString = datePart + "T" + timePart.replace("+00", "Z");
    const date = new Date(isoString);

    date.setMonth(date.getMonth() + 1);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");
    const millis = String(date.getMilliseconds()).padStart(3, "0") + "000"; // 6 digits

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}.${millis}+00`;
  }

  function addOneYear(createdAt) {
    const date = new Date(createdAt);
    date.setFullYear(date.getFullYear() + 1);

    const formatted =
      date.getFullYear() +
      "-" +
      String(date.getMonth() + 1).padStart(2, "0") +
      "-" +
      String(date.getDate()).padStart(2, "0") +
      " " +
      String(date.getHours()).padStart(2, "0") +
      ":" +
      String(date.getMinutes()).padStart(2, "0") +
      ":" +
      String(date.getSeconds()).padStart(2, "0") +
      "." +
      String(date.getMilliseconds()).padEnd(6, "0") +
      "+00";

    return formatted;
  }

  //this code not working
  // const updatePlanInSupabase = async (userId) => {
  //   console.log("User id while updating plan: ", userId);
  //   const plan = getSelectedPlan();
  //   if (!plan) {
  //     toast.error("No plan selected");
  //     return;
  //   }

  //   const createdAt = getLocalCreatedAt();
  //   const currentPeriodEnd =
  //     billingCycle === "monthly"
  //       ? addOneMonth(createdAt)
  //       : addOneYear(createdAt);

  //   console.log("Created at: ", createdAt);
  //   console.log("Current Period End: ", currentPeriodEnd);

  //   try {
  //     const { data, error } = await supabase
  //       .from("subscription")
  //       .update({
  //         plan_name: "updated Plan",
  //         // created_at: createdAt,
  //         // current_period_end: currentPeriodEnd,
  //         // plan_name: plan.plan_name,
  //         // amount_paid:
  //         //   billingCycle === "monthly" ? plan.price_monthly : plan.price_yearly,
  //         // plan_id: plan.plan_product_id,
  //         // currency: plan.currency || "EUR",
  //       })
  //       .eq("user_id", userId)
  //       .single();
  //     console.log("Data after update:", data);
  //     if (error) {
  //       console.error("Error updating plan:", error);
  //       toast.error("Failed to update");
  //     } else {
  //       console.log("Plan updated successfully:", data);
  //       toast.success("Plan updated Successfully");
  //     }
  //   } catch (err) {
  //     console.error("Unexpected error:", err);
  //     toast.error("Unexpected error occurred");
  //   }
  // };

  const updatePlanInSupabase = async (userId: string) => {
    if (!userId) {
      toast.error("Missing user id");
      return;
    }
    const plan = getSelectedPlan();
    console.log("select plan inforation: ", plan);
    if (!plan) {
      toast.error("No plan selected");
      return;
    }

    const createdAt = getLocalCreatedAt();
    const currentPeriodEnd =
      billingCycle === "monthly"
        ? addOneMonth(createdAt)
        : addOneYear(createdAt);

    try {
      const { data, error } = await supabase
        .from("subscription")
        .update({
          plan_name: newPlan?.plan_name,
          created_at: createdAt,
          current_period_end: currentPeriodEnd,
          amount_paid:
            billingCycle === "monthly" ? plan.price_monthly : plan.price_yearly,
          plan_id: plan.plan_product_id,
        })
        .eq("user_id", userId)
        .select()
        .single();

      if (error) {
        console.error("Error upserting plan:", error);
        toast.error(error.message || "Failed to update");
        return;
      }

      console.log("Plan updated successfully:", data);
      toast.success("Plan updated successfully");
    } catch (err: any) {
      console.error("Unexpected error:", err);
      toast.error(err?.message || "Unexpected error occurred");
    }
  };

  const updatePlanInUser = async (userId: string) => {
    if (!userId) {
      toast.error("Missing user id");
      return;
    }
    const plan = getSelectedPlan();
    console.log("select plan inforation: ", plan);
    if (!plan) {
      toast.error("No plan selected");
      return;
    }

    try {
      const { data, error } = await supabase
        .from("users")
        .update({
          plan: newPlan?.plan_name,
        })
        .eq("user_id", userId)
        .select()
        .single();

      if (error) {
        console.error("Error upserting plan:", error);
        toast.error(error.message || "Failed to update");
        return;
      }

      // console.log("Plan updated successfully in user table:", data);
      // toast.success("Plan updated successfully in user table");
    } catch (err: any) {
      console.error("Unexpected error:", err);
      toast.error(err?.message || "Unexpected error occurred");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Change Plan for {user.businessName}</DialogTitle>
          <DialogDescription>
            Select a different subscription plan for this user.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div>
            <Label className="text-gray-600">Current Plan</Label>
            <div className="mt-2 p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{user.plan}</p>
                  <p className="text-sm text-gray-600">
                    {getCurrentPlan()?.price}
                  </p>
                </div>
                <Badge className="bg-blue-100 text-blue-800">Current</Badge>
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor="newPlan">Select New Plan</Label>
            <Select
              value={selectedPlan}
              onValueChange={(value) => {
                setSelectedPlan(value);
                // console.log("Selected plan is:", value);
                const chosenPlan = AllPlans.find((p) => p.id === value);
                console.log("Selected plan id:", value);
                console.log("Full plan object:", chosenPlan);
                if (chosenPlan) {
                  setNewPlan(chosenPlan);
                }

                if (onPlanChange) onPlanChange(value);
              }}
            >
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Select a plan" />
              </SelectTrigger>
              <SelectContent>
                {AllPlans.map((plan) => (
                  <SelectItem key={plan.id} value={plan.id}>
                    <div className="flex flex-col">
                      <span className="font-medium">{plan.plan_name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedPlan && selectedPlan !== latestPlan && (
            <>
              <div>
                <Label className="mb-2 block">Billing Cycle</Label>
                <RadioGroup
                  value={billingCycle}
                  onValueChange={(value) =>
                    setBillingCycle(value as "monthly" | "yearly")
                  }
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="monthly" id="monthly" />
                    <Label htmlFor="monthly">Monthly</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yearly" id="yearly" />
                    <Label htmlFor="yearly">Yearly</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                <h4 className="font-medium text-green-800 mb-2">
                  New Plan Features:
                </h4>
                <ul className="text-sm text-green-700 space-y-1">
                  {getSelectedPlan()?.features?.map((feature, index) => (
                    <li key={index}>• {feature}</li>
                  ))}
                </ul>
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={selectedPlan === latestPlan}
            className="bg-[#1C9B7A] hover:bg-[#158a69]"
          >
            Change Plan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
