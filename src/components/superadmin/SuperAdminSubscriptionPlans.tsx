import React, { useEffect, useState } from "react";
import {
  Plus,
  Edit,
  Trash2,
  MoreVertical,
  DollarSign,
  Users,
  Calendar,
  Tag,
  Package,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ConfirmActionModal } from "./ConfirmActionModal";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

interface SubscriptionPlan {
  id: number;
  name: string;
  description: string;
  status: "active" | "inactive";
  type: "monthly" | "annual" | "one-time" | "free-trial";
  price: number;
  billingCycle: string;
  setupFee?: number;
  annualDiscount?: number;
  currency: string;
  includeVAT: boolean;
  autoRenewal: boolean;
  trialPeriod?: number;
  maxUsers?: number;
  tags: string[];
  activeSubscribers: number;
  createdAt: string;
}

const mockPlans: SubscriptionPlan[] = [
  {
    id: 1,
    name: "NovaFarm Basic",
    description: "Essential features for small pharmacies",
    status: "active",
    type: "monthly",
    price: 29.99,
    billingCycle: "Every month",
    currency: "EUR",
    includeVAT: true,
    autoRenewal: true,
    trialPeriod: 14,
    maxUsers: 5,
    tags: ["basic", "starter"],
    activeSubscribers: 142,
    createdAt: "2024-01-10",
  },
  {
    id: 2,
    name: "NovaFarm Premium",
    description: "Advanced features for growing businesses",
    status: "active",
    type: "monthly",
    price: 79.99,
    billingCycle: "Every month",
    annualDiscount: 20,
    currency: "EUR",
    includeVAT: true,
    autoRenewal: true,
    trialPeriod: 30,
    maxUsers: 25,
    tags: ["premium", "popular"],
    activeSubscribers: 89,
    createdAt: "2024-01-10",
  },
  {
    id: 3,
    name: "NovaFarm Enterprise",
    description: "Complete solution for large pharmacy chains",
    status: "active",
    type: "annual",
    price: 1999.99,
    billingCycle: "Every year",
    setupFee: 500,
    currency: "EUR",
    includeVAT: true,
    autoRenewal: true,
    tags: ["enterprise", "custom"],
    activeSubscribers: 23,
    createdAt: "2024-01-10",
  },
];

export const SuperAdminSubscriptionPlans: React.FC = () => {
  const [plans, setPlans] = useState<SubscriptionPlan[]>(mockPlans);
  const [dyniamc_plans, set_Daynamic_Plans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stateChanged, setStateChanged] = useState(false);
  const [plan_Full_Info, set_Plan_Full_Info] = useState({});
  const [noOfActivePlans, setNoOfActivePlans] = useState(0);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    planId: number | null;
    planName: string;
  }>({
    isOpen: false,
    planId: null,
    planName: "",
  });
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectdPlanid, setSeletcedPlanId] = useState();
  const [totalPlans, setTotalPlans] = useState(0);
  const [totalSubscribers, setTotalSubscribers] = useState(0);
  const [revenue, setRevenue] = useState(0);
  const [popularPlanName, setPopularPlanName] = useState();

  // Form state
  const [formData, setFormData] = useState({
    plan_name: "",
    plan_description: "",
    status: "active",
    type: "monthly",
    price_yearly: null,
    price_monthly: null,
    billingCycle: "Every month",
    setupFee: "",
    annualDiscount: "",
    currency: "EUR",
    includeVAT: true,
    autoRenewal: true,
    trialPeriod: null,
    maxUsers: "",
    tags: "",
  });

  const fetchSubscribers = async () => {
    try {
      const { data, error } = await supabase.from("subscription").select("*");

      if (error) throw error;
      const count = data ? data.length : 0;
      setTotalSubscribers(count);
    } catch (err) {
      console.error("Error fetching subscriptions:", err.message);
    }
  };

  const fetchRevenue = async () => {
    try {
      const { data, error } = await supabase
        .from("subscription")
        .select("amount_paid, created_at");

      if (error) throw error;

      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();

      const total = data.reduce((sum, row) => {
        const date = new Date(row.created_at);
        if (
          date.getMonth() === currentMonth &&
          date.getFullYear() === currentYear
        ) {
          return sum + Number(row.amount_paid || 0);
        }
        return sum;
      }, 0);

      setRevenue(total);
    } catch (err) {
      console.error("Error fetching revenue:", err.message);
    }
  };

  const resetForm = () => {
    setFormData({
      plan_name: "",
      plan_description: "",
      status: "active",
      type: "monthly",
      price_yearly: null,
      price_monthly: null,
      billingCycle: "Every month",
      setupFee: "",
      annualDiscount: "",
      currency: "EUR",
      includeVAT: true,
      autoRenewal: true,
      trialPeriod: "",
      maxUsers: "",
      tags: "",
    });
  };

  const fetchPlans = async () => {
    const { data, error } = await supabase
      .from("subscription_plan")
      .select("*");

    if (error) {
      console.error("Error fetching plans:", error.message);
    } else {
      console.log("Data coming in plan: ", data);
      const highestObject = data?.reduce((max, obj) =>
        obj.subscriber_count > max.subscriber_count ? obj : max
      );
      console.log("Object with max count: ", highestObject);
      setPopularPlanName(highestObject?.plan_name);

      set_Daynamic_Plans(data || []);
      setTotalPlans(data?.length);
      const activePlans = data?.filter((plan) => plan.status === true).length;
      setNoOfActivePlans(activePlans);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPlans();
    fetchSubscribers();
    fetchRevenue();
  }, [noOfActivePlans]);

  const authDataString = localStorage.getItem(
    "sb-ajbxscredobhqfksaqrk-auth-token"
  );
  let accessToken = null;
  if (authDataString) {
    try {
      const authDataObject = JSON.parse(authDataString);

      accessToken = authDataObject.access_token;
    } catch (error) {
      console.error("Error parsing auth data from localStorage:", error);
    }
  } else {
    console.log("No auth token found in localStorage.");
  }

  const deletePlan = async (id: number) => {
    const { data, error } = await supabase
      .from("subscription_plan")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Failed to delete:", error.message);
    } else {
      toast.success("Plan Deleted Successfully");
      fetchPlans();
    }
  };

  const handleCreatePlan = async () => {
    const newPlan: SubscriptionPlan = {
      id: Date.now(),
      plan_name: formData.plan_name,
      plan_description: formData.plan_description,
      status: formData.status as "active" | "inactive",
      type: formData.type as any,
      price_yearly: formData.price_yearly,
      price_monthly: formData.price_monthly,
      billingCycle: formData.billingCycle,
      setupFee: formData.setupFee ? parseFloat(formData.setupFee) : undefined,
      annualDiscount: formData.annualDiscount
        ? parseFloat(formData.annualDiscount)
        : undefined,
      currency: formData.currency,
      includeVAT: formData.includeVAT,
      autoRenewal: formData.autoRenewal,
      trialPeriod: formData.trialPeriod
        ? parseInt(formData.trialPeriod)
        : undefined,
      maxUsers: formData.maxUsers ? parseInt(formData.maxUsers) : undefined,
      tags: formData.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag),
      activeSubscribers: 0,
      createdAt: new Date().toISOString().split("T")[0],
    };

    const statusCheck = formData.status === "active" ? true : false;
    try {
      const response = await fetch(
        "https://ajbxscredobhqfksaqrk.supabase.co/functions/v1/create-plans",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
          },
          body: JSON.stringify({
            plan_name: formData.plan_name.trim(),
            plan_description: formData.plan_description.trim(),
            price_monthly: Number(formData.price_monthly),
            price_yearly: Number(formData.price_yearly),
            status: statusCheck,
            tags: formData.tags,
            annualDiscount: Number(formData.annualDiscount), //this is for annual discount
            trialPeriod: Number(formData.trialPeriod),
          }),
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success("Plan created and updated successfully.");
        setStateChanged(true);
      } else {
        toast.error(`Failed to create plan: ${data.error || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Error creating plan:", error);
      toast.error("Something went wrong. Please try again.");
    }

    fetchPlans();
    setPlans([...plans, newPlan]);
    setIsCreateModalOpen(false);
    resetForm();
  };

  const fetchSubscriptionPlanById = async (planId: string) => {
    console.log("Calling Supabase with planId:", planId);
    const { data, error } = await supabase
      .from("subscription_plan")
      .select("*")
      .eq("id", planId)
      .single();

    if (error) {
      console.error("Error fetching plan:", error.message);
      return null;
    }
    console.log("data of fetched plan ", data);
    setIsCreateModalOpen(true);

    setFormData({
      plan_name: data.plan_name,
      status: data.status ? "active" : "inactive",
      plan_description: data.plan_description,
      price_monthly: data.price_monthly,
      price_yearly: data.price_yearly,
      annualDiscount: data.annualDiscount,
      currency: data.currency,
      trialPeriod: data.trialPeriod,
      tags: data.tags,
    });

    return data;
  };

  const handleEditPlan = async (plan: SubscriptionPlan) => {
    console.log("handleEditPlan clicked and plan information", plan);
    set_Plan_Full_Info(plan);
    setSeletcedPlanId(plan.id);
    await fetchSubscriptionPlanById(plan.id);

    setEditingPlan(plan);
  };

  const handleUpdatePlan = async () => {
    console.log("Updated Plan clicked and plan object: ", plan_Full_Info);
    const plan_product_id = plan_Full_Info.plan_product_id;
    const statusCheck = formData.status === "active" ? true : false;

    const response = await fetch(
      "https://ajbxscredobhqfksaqrk.supabase.co/functions/v1/update-plan",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
        },
        body: JSON.stringify({
          id: plan_Full_Info.id,
          plan_product_id: plan_product_id,
          plan_name: formData.plan_name,
          plan_description: formData.plan_description,
          trialPeriod: formData.trialPeriod,
          annualDiscount: formData.annualDiscount,
          tags: formData.tags,
          status: statusCheck,
        }),
      }
    );
    if (response.ok) {
      const data = await response.json();

      toast.success("Plan Updated Successfully");
      console.log("Data after updating ::", data);
      setIsCreateModalOpen(false);
      fetchPlans();
    }
  };

  const handleDeleteClick = (plan: SubscriptionPlan) => {
    setDeleteConfirmation({
      isOpen: true,
      planId: plan.id,
      plan_name: plan.plan_name,
    });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirmation.planId) return;

    setIsDeleting(true);

    await deletePlan(deleteConfirmation.planId);
    // await new Promise((resolve) => setTimeout(resolve, 1000));
    // setPlans(plans.filter((p) => p.id !== deleteConfirmation.planId));
    setDeleteConfirmation({
      isOpen: false,
      planId: null,
      planName: "",
    });
    setIsDeleting(false);
  };

  const handleDeleteCancel = () => {
    setDeleteConfirmation({
      isOpen: false,
      planId: null,
      planName: "",
    });
  };

  const toggleStatus = async (planId: string, currentStatus: boolean) => {
    const { data, error } = await supabase
      .from("subscription_plan")
      .update({ status: !currentStatus })
      .eq("id", planId);

    if (error) {
      console.error("Failed to update status:", error.message);
      toast.error("Failed to update status");
    } else {
      toast.success("Status updated successfully");
      fetchPlans();
    }
  };

  const fmtDateOnly = new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "Asia/Karachi",
  });

  const formatCreatedAt = (iso?: string) =>
    iso ? fmtDateOnly.format(new Date(iso)).replaceAll("/", "-") : "";

  const getTypeColor = (type: string) => {
    switch (type) {
      case "monthly":
        return "bg-blue-100 text-blue-800";
      case "annual":
        return "bg-green-100 text-green-800";
      case "one-time":
        return "bg-purple-100 text-purple-800";
      case "free-trial":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatCurrencyItalian = (amount) => {
    const formatted = new Intl.NumberFormat("it-IT", {
      style: "currency",
      currency: "EUR",
    }).format(amount);

    return formatted.replace("€", "").trim().replace(/^/, "€ ");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 text-left">
            Subscription Plans
          </h1>
          <p className="text-gray-600 mt-1">
            Create and manage billing plans for your platform
          </p>
        </div>

        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#1C9B7A] hover:bg-[#16845C] text-white">
              <Plus className="w-4 h-4 mr-2" />
              Create New Plan
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingPlan
                  ? "Edit Subscription Plan"
                  : "Create New Subscription Plan"}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-6">
              {/* General Info */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  General Information
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Plan Name *</Label>
                    <Input
                      id="name"
                      value={formData.plan_name}
                      onChange={(e) =>
                        setFormData({ ...formData, plan_name: e.target.value })
                      }
                      placeholder="e.g. NovaFarm Monthly"
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={formData.status === "active"}
                      onCheckedChange={(checked) =>
                        setFormData({
                          ...formData,
                          status: checked ? "active" : "inactive",
                        })
                      }
                    />
                    <Label>Plan Active</Label>
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.plan_description}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        plan_description: e.target.value,
                      })
                    }
                    placeholder="Short description of this plan"
                    rows={3}
                  />
                </div>
              </div>

              {/* Pricing Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Pricing Details
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="price_monthly">Price (€) Monthly *</Label>
                    <Input
                      id="price_monthly"
                      type="number"
                      step="0.01"
                      value={formData.price_monthly}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          price_monthly: e.target.value,
                        })
                      }
                      placeholder="29.99"
                      readOnly={!!editingPlan}
                    />
                  </div>
                  <div>
                    <Label htmlFor="price_yearly">Price (€) Yearly *</Label>
                    <Input
                      id="price_yearly"
                      type="number"
                      step="0.01"
                      value={formData.price_yearly}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          price_yearly: e.target.value,
                        })
                      }
                      placeholder="29.99"
                      readOnly={!!editingPlan}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="annualDiscount">Annual Discount (%)</Label>
                  <Input
                    id="annualDiscount"
                    type="number"
                    value={formData.annualDiscount}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        annualDiscount: e.target.value,
                      })
                    }
                    placeholder="20"
                  />
                </div>
              </div>

              {/* Payment Options */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Payment Options
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="currency">Currency</Label>
                    <br />
                    <Input
                      type="text"
                      value={formData.currency}
                      onChange={(value) =>
                        setFormData({ ...formData, currency: value })
                      }
                      readOnly
                    />
                  </div>
                </div>
              </div>

              {/* Advanced Settings */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Advanced Settings
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="trialPeriod">Trial Period (days)</Label>
                    <Input
                      id="trialPeriod"
                      type="number"
                      value={formData.trialPeriod}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          trialPeriod: e.target.value,
                        })
                      }
                      placeholder="14"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="tags">Tags/Labels</Label>
                  <ReactQuill
                    id="tags"
                    theme="snow"
                    value={formData.tags}
                    onChange={(content) =>
                      setFormData({ ...formData, tags: content })
                    }
                    placeholder="Write tags here..."
                    modules={{
                      toolbar: [
                        ["bold", "italic", "underline"],
                        [{ list: "ordered" }, { list: "bullet" }],
                        ["clean"],
                      ],
                    }}
                    formats={["bold", "italic", "underline", "list", "bullet"]}
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-3 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsCreateModalOpen(false);
                    setEditingPlan(null);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={editingPlan ? handleUpdatePlan : handleCreatePlan}
                  className="bg-[#1C9B7A] hover:bg-[#16845C] text-white"
                  disabled={
                    !formData.plan_name ||
                    !formData.price_monthly ||
                    !formData.price_yearly
                  }
                >
                  {editingPlan ? "Update Plan" : "Create Plan"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-left">
              Total Plans
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-left">{totalPlans}</div>
            <p className="text-xs text-muted-foreground text-left">
              {noOfActivePlans}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium ">
              Total Subscribers
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-left ">
              {totalSubscribers}
            </div>
            <p className="text-xs text-muted-foreground text-left">
              Across all plans
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium ">
              Monthly Revenue
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-left">
              {formatCurrencyItalian(revenue)}
            </div>
            <p className="text-xs text-muted-foreground text-left">
              From monthly plans
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Popular Plan</CardTitle>
            <Tag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-left">
              {popularPlanName}
            </div>
            <p className="text-xs text-muted-foreground text-left">
              Most subscribers
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Plans Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-left">Subscription Plans</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Plan Name</TableHead>
                <TableHead>Price(Monthly)</TableHead>
                <TableHead>Price (Yearly)</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Subscribers</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dyniamc_plans.map((plan) => (
                <TableRow key={plan.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium text-left">
                        {plan.plan_name}
                      </div>
                      <div className="text-sm text-gray-500 text-left">
                        {plan.plan_description}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium text-left">
                    {plan.price_monthly}
                    <div className="text-sm text-gray-500">Every Month</div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium text-left">
                      ${plan.price_yearly}
                      <div className="text-sm text-gray-500">Every Year</div>
                    </div>
                  </TableCell>
                  <TableCell className="text-left">
                    <Badge
                      variant={plan.status === true ? "default" : "secondary"}
                    >
                      {plan.status === true ? "active" : "In-active"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Users className="w-4 h-4 mr-1 text-gray-400" />
                      {plan?.subscriber_count}
                    </div>
                  </TableCell>
                  <TableCell>{formatCreatedAt(plan.created_at)}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEditPlan(plan)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Plan
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => toggleStatus(plan.id, plan.status)}
                        >
                          <Calendar className="mr-2 h-4 w-4" />
                          {plan.status === true ? "Deactivate" : "Activate"}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDeleteClick(plan)}
                          className="text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete Plan
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Delete Confirmation Modal */}
      <ConfirmActionModal
        isOpen={deleteConfirmation.isOpen}
        title="Are you sure you want to delete this plan?"
        message={`This action cannot be undone. Deleting the plan "${deleteConfirmation.plan_name}" will remove it permanently from the system.`}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        confirmButtonText="Delete Plan"
        isDestructive={true}
      />
    </div>
  );
};
