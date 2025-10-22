import React, { useEffect, useState, useMemo } from "react";
import {
  Search,
  MoreVertical,
  Eye,
  Ban,
  CreditCard,
  RefreshCw,
  Mail,
  AlertCircle,
  Plus,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { UserDetailView } from "./UserDetailView";
import { ChangePlanModal } from "./ChangePlanModal";
import { ResetPasswordModal } from "./ResetPasswordModal";
import { SendEmailModal } from "./SendEmailModal";
import { ConfirmActionModal } from "./ConfirmActionModal";
// import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { CreateAccountForm } from "../CreateAccountForm";
import Spinner from "../Spinner";
import { toast } from "sonner";

export const SuperAdminUsers: React.FC = () => {
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  // Filter states
  const [statusFilter, setStatusFilter] = useState("all");
  const [planFilter, setPlanFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Modals and selected user state
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showUserDetail, setShowUserDetail] = useState(false);
  const [showChangePlan, setShowChangePlan] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [showSendEmail, setShowSendEmail] = useState(false);
  const [showConfirmAction, setShowConfirmAction] = useState(false);
  const [accountStatus, setAccountStatus] = useState("");
  const [plans, setPlans] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [suspendedUsers, setSuspendedUsers] = useState(0);
  const [activeUsers, setActiveUser] = useState(0);
  const [plateFormName, setPlateForm] = useState("");
  const [templateName, setTemplateName] = useState("");
  const [description, setDescription] = useState();
  const [supportEmail, setSupportEmail] = useState("");

  const [confirmAction, setConfirmAction] = useState<{
    type: string;
    message: string;
  } | null>(null);

  const handleFormSuccess = () => {
    setIsCreating(false);
    fetchUsers();
  };

  const handleFormCancel = () => {
    setIsCreating(false);
  };

  const fetchPlans = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("subscription_plan")
      .select("*");

    if (error) {
      console.error("Error fetching plans:", error);
    } else {
      // console.log("Data coming in Plans: ", data);
      setPlans(data);
    }
    setLoading(false);
  };

  const fetchUsers = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("users").select("*");
    if (error) {
      console.error("Error fetching users:", error.message);
    } else {
      const nonAdminUsers = data.filter(
        (user) => user.role !== "admin" && user.role !== "super-admin"
      );

      const suspendedCount = nonAdminUsers.filter(
        (user) => !user.accountStatus
      ).length;

      const activeCount = nonAdminUsers.filter(
        (user) => user.accountStatus
      ).length;

      setAllUsers(nonAdminUsers);
      setSuspendedUsers(suspendedCount);
      setActiveUser(activeCount);

      setAccountStatus(nonAdminUsers.accountStatus ? "Active" : "Suspended");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
    fetchPlans();
    fetchSettings();
    fetchEmailTemplate();
  }, []);

  const displayUsers = useMemo(() => {
    let filteredList = [...allUsers];
    // Apply search term filter
    if (searchTerm) {
      filteredList = filteredList.filter(
        (user) =>
          user.businessName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filteredList = filteredList.filter((user) => {
        const status = user.accountStatus ? "active" : "suspended";
        return status === statusFilter;
      });
    }

    // Apply plan filter
    if (planFilter !== "all") {
      filteredList = filteredList.filter(
        (user) => user.plan?.toLowerCase() === planFilter.toLowerCase()
      );
    }

    return filteredList;
  }, [allUsers, searchTerm, statusFilter, planFilter]);

  // Handlers for filter changes
  const handleStatusChange = (status: string) => {
    setStatusFilter(status);
  };

  const handlePlansChange = (plan: string) => {
    setPlanFilter(plan);
  };

  // Helper functions for badges
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Active":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            Active
          </Badge>
        );
      case "Suspended":
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
            Suspended
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
            Pending
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getPlanBadge = (plan: string) => {
    const colors = {
      Basic: "bg-gray-100 text-gray-800",
      Standard: "bg-blue-100 text-blue-800",
      Premium: "bg-purple-100 text-purple-800",
    };

    const badgeColorClass =
      colors[plan as keyof typeof colors] || "bg-gray-100 text-gray-800";

    return (
      <Badge className={`${badgeColorClass} hover:${badgeColorClass}`}>
        {plan}
      </Badge>
    );
  };

  // Action handlers
  const handleViewUser = (user: any) => {
    setSelectedUser(user);
    setShowUserDetail(true);
  };

  const handleChangePlan = (user: any) => {
    setSelectedUser(user);
    setShowChangePlan(true);
  };

  const handleResetPassword = (user: any) => {
    setSelectedUser(user);
    setShowResetPassword(true);
  };

  const handleSendEmail = (user: any) => {
    setSelectedUser(user);
    setShowSendEmail(true);
  };

  const handleSuspendActivate = async (user: any) => {
    try {
      // Step 1: Get latest user data by ID
      const { data: freshUser, error } = await supabase
        .from("users")
        .select("user_id, accountStatus, businessName,email")
        .eq("user_id", user.user_id)
        .single();
      if (error || !freshUser) {
        toast.error("Failed to fetch latest user data");
        return;
      }
      console.log("Fresh User: ", freshUser);
      const action = freshUser.accountStatus ? "Suspend" : "Active";
      setAccountStatus(action);
      setSelectedUser(freshUser);
      setConfirmAction({
        type: action,
        message: `Are you sure you want to ${action} ${freshUser.businessName}?`,
      });
      setShowConfirmAction(true);
    } catch (err) {
      console.error(err);
      toast.error("An unexpected error occurred");
    }
  };

  const fetchSettings = async () => {
    const { data, error } = await supabase
      .from("settings")
      .select("platform_name,support_email")
      .single();

    if (error) {
      console.error("Error fetching platform_name:", error);
    } else {
      setPlateForm(data?.platform_name);
      setSupportEmail(data?.support_email);
    }
  };

  const fetchEmailTemplate = async () => {
    const { data, error } = await supabase
      .from("email_template_table")
      .select("template_name,description")
      .eq("template_name", "Account suspended/deactivated ")
      .single();

    if (error) {
      console.error("Error fetching template:", error);
    } else {
      setTemplateName(data?.template_name);
      console.log("Data in templates: ", data);
      setDescription(data?.description);
    }
  };

  const today = new Date();
  const formattedDate = today.toISOString().split("T")[0];

  const emailwithTemplate = async (useremail) => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    const accessToken = session?.access_token;
    const routeSuspended =
      "https://ajbxscredobhqfksaqrk.supabase.co/storage/v1/object/public/emailTemplate/acountSuspended.html";
    const accountRenewed =
      "https://ajbxscredobhqfksaqrk.supabase.co/storage/v1/object/public/emailTemplate/activated_subscription.html";
    const route = accountStatus === "Suspend" ? routeSuspended : accountRenewed;

    const res = await fetch(
      "https://ajbxscredobhqfksaqrk.supabase.co/functions/v1/email-with-template",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          to: useremail,
          subject:
            accountStatus === "Suspend"
              ? templateName
              : "Your account has been activated",
          route,
          templateName: "emailFile",
          data: {
            title: "Welcome!",
            heading: "Welcome to NovaFarm",
            message: description,
            user_email: useremail,
            userName: selectedUser.businessName,
            platform_name: plateFormName,
            support_email: supportEmail,
            date: formattedDate,
            bodyText: "Thanks for joining. We're glad to have you!",
            footerText: "© 2025 Your Company. All rights reserved.",
          },
        }),
      }
    );
    const text = await res.text();
    if (!res.ok) {
      console.error("Function error:", res.status, text);
      toast.error("Failed to send Email");
    } else {
      console.log("Function success:", text);
      toast.success("Email send successfully");
    }
  };

  const handleConfirmAction = async () => {
    console.log("Confrim Clicked for User: ", selectedUser);
    console.log("Account Status: ", accountStatus);

    const newStatus = selectedUser.accountStatus ? false : true;

    const { error } = await supabase
      .from("users")
      .update({ accountStatus: newStatus })
      .eq("user_id", selectedUser.user_id);

    if (error) {
      console.error("Error updating account status:", error.message);
      toast.error("Failed to update status");
      return;
    }

    toast.success("Account Updated Successfully");
    console.log("Confrim Clicked for User: ", selectedUser);
    const useremail = selectedUser?.email;
    emailwithTemplate(useremail);

    await fetchUsers();
    setShowConfirmAction(false);
    setConfirmAction(null);
    setSelectedUser(null);
  };

  // Conditional rendering for UserDetailView
  if (showUserDetail && selectedUser) {
    return (
      <UserDetailView
        user={selectedUser}
        onUserUpdated={(updatedUser) => setSelectedUser(updatedUser)}
        onBack={() => {
          setShowUserDetail(false);
          setSelectedUser(null);
        }}
      />
    );
  }

  const fmtDateTime = new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Europe/Rome",
  });

  const formatCreatedAt = (iso?: string) =>
    iso
      ? fmtDateTime
          .format(new Date(iso))
          .replaceAll("/", "-")
          .replace(",", "")
          .replace(/\s+/, " ")
          .trim()
      : "";

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const paginatedUsers = displayUsers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(displayUsers.length / itemsPerPage);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {isCreating ? (
        <CreateAccountForm
          onSuccessfulSubmission={handleFormSuccess}
          onCancel={handleFormCancel}
          onBack={() => {
            setIsCreating(false);
          }}
        />
      ) : (
        <>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 text-left">
                Users Management
              </h1>
              <p className="text-gray-600 mt-1">
                Manage all registered pharmacy accounts
              </p>
            </div>
            <Button
              onClick={() => setIsCreating(true)}
              className="bg-[#1C9B7A] hover:bg-[#158a69] mt-4 sm:mt-0"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create New User
            </Button>
          </div>
          {/* Search and Filters */}
          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search users by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 focus:ring-[#1C9B7A] focus:border-[#1C9B7A]"
                  />
                </div>

                <Select value={statusFilter} onValueChange={handleStatusChange}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                    {/* <SelectItem value="pending">Pending</SelectItem> */}
                  </SelectContent>
                </Select>

                <Select value={planFilter} onValueChange={handlePlansChange}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="Filter by plan" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Plans</SelectItem>
                    {plans.map((plan) => (
                      <SelectItem key={plan?.id} value={plan?.plan_name}>
                        {plan.plan_name.charAt(0).toUpperCase() +
                          plan?.plan_name.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Users Table */}
          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900 text-left">
                Users ({displayUsers.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto my-4">
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-200 bg-gray-50">
                      <TableHead className="font-semibold text-gray-700">
                        Business
                      </TableHead>
                      <TableHead className="font-semibold text-gray-700">
                        Status
                      </TableHead>
                      <TableHead className="font-semibold text-gray-700">
                        Plan
                      </TableHead>
                      <TableHead className="font-semibold text-gray-700">
                        Last Login
                      </TableHead>
                      <TableHead className="font-semibold text-gray-700">
                        Location
                      </TableHead>
                      <TableHead className="font-semibold text-gray-700 text-right">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {displayUsers.length > 0 ? (
                      paginatedUsers.map((user) => (
                        <TableRow
                          key={user.id}
                          className="border-gray-200 hover:bg-gray-50"
                        >
                          <TableCell>
                            <div>
                              <div className="font-medium text-gray-900 text-left">
                                {user.businessName}
                              </div>
                              <div className="text-sm text-gray-500 text-left">
                                {user.email}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-left">
                            {getStatusBadge(
                              user.accountStatus ? "Active" : "Suspended"
                            )}
                          </TableCell>
                          <TableCell className="text-left">
                            {getPlanBadge(user.plan)}
                          </TableCell>
                          <TableCell className="text-sm text-gray-500 text-left">
                            {formatCreatedAt(user.last_login)}
                          </TableCell>
                          <TableCell className="text-sm text-gray-500  text-left">
                            {user.city}, {user.country}
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="hover:bg-gray-100"
                                >
                                  <MoreVertical className="w-4 h-4 mr-2" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent
                                align="end"
                                className="w-48 bg-white shadow-lg rounded-md border border-gray-100"
                              >
                                <DropdownMenuItem
                                  onClick={() => handleViewUser(user)}
                                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                                >
                                  <Eye className="w-4 h-4 mr-2" />
                                  View User Details
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleChangePlan(user)}
                                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                                >
                                  <CreditCard className="w-4 h-4 mr-2" />
                                  Change Plan
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleResetPassword(user)}
                                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                                >
                                  <RefreshCw className="w-4 h-4 mr-2" />
                                  Reset Password
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleSendEmail(user)}
                                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                                >
                                  <Mail className="w-4 h-4 mr-2" />
                                  Send Email
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 cursor-pointer"
                                  onClick={() => handleSuspendActivate(user)}
                                >
                                  <Ban className="w-4 h-4 mr-2" />
                                  {user.accountStatus
                                    ? "Suspend "
                                    : "Activate "}
                                  Account
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={6}
                          className="text-center py-8 text-gray-500"
                        >
                          No users found matching your criteria.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
                <div className="btn_div flex justify-between items-center px-2">
                  <div className="left_div flex justify-start items-center">
                    <button
                      className="border border-green-600 p-2 cursor-pointer rounded-sm"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage((prev) => prev - 1)}
                    >
                      Previous
                    </button>
                  </div>
                  <span>
                    Page {currentPage} of {totalPages}{" "}
                  </span>
                  <div className="right_div left_div flex justify-end items-center">
                    <button
                      className="border border-green-600 p-2 cursor-pointer rounded-sm"
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage((prev) => prev + 1)}
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-white border border-gray-200 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between text-left">
                  <div>
                    <p className="text-sm text-gray-600">Total Users</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {allUsers.length}
                    </p>
                  </div>
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <AlertCircle className="w-4 h-4 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border border-gray-200 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between text-left">
                  <div>
                    <p className="text-sm text-gray-600">Active</p>
                    <p className="text-2xl font-bold text-green-600">
                      {activeUsers}
                    </p>
                  </div>
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <AlertCircle className="w-4 h-4 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border border-gray-200 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between text-left">
                  <div>
                    <p className="text-sm text-gray-600">Suspended</p>
                    <p className="text-2xl font-bold text-red-600">
                      {suspendedUsers}
                    </p>
                  </div>
                  <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                    <Ban className="w-4 h-4 text-red-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          {/* Modals */}
          {showChangePlan && selectedUser && (
            <ChangePlanModal
              user={selectedUser}
              isOpen={showChangePlan}
              onClose={() => {
                setShowChangePlan(false);
                setSelectedUser(null);
                fetchUsers();
              }}
            />
          )}
          {showResetPassword && selectedUser && (
            <ResetPasswordModal
              user={selectedUser}
              isOpen={showResetPassword}
              onClose={() => {
                setShowResetPassword(false);
                setSelectedUser(null);
              }}
            />
          )}
          {showSendEmail && selectedUser && (
            <SendEmailModal
              user={selectedUser}
              isOpen={showSendEmail}
              onClose={() => {
                setShowSendEmail(false);
                setSelectedUser(null);
              }}
            />
          )}
          {showConfirmAction && selectedUser && confirmAction && (
            <ConfirmActionModal
              isOpen={showConfirmAction}
              title={`${
                confirmAction.type === "suspend" ? "Suspend" : "Activate"
              } Account`}
              message={confirmAction.message}
              onConfirm={handleConfirmAction}
              onCancel={() => {
                setShowConfirmAction(false);
                setConfirmAction(null);
                setSelectedUser(null);
              }}
              confirmButtonText={accountStatus}
              isDestructive={confirmAction.type === "suspend"}
            />
          )}
        </>
      )}
    </div>
  );
};
