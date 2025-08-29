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
  const [billingCycle, setBillingCycle] = useState("");
  const [AllPlans, setAllPlans] = useState([]);

  const [newPlan, setNewPlan] = useState();

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
  };

  const getCurrentPlan = () => AllPlans.find((p) => p.id === latestPlan);
  const getSelectedPlan = () => AllPlans.find((p) => p.id === selectedPlan);

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
                console.log("Selected plan:", value);

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
