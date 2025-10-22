import React, { useState, useEffect } from "react";
import {
  Edit,
  UserCheck,
  Shield,
  Eye,
  Settings,
  Users,
  Trash2,
  Key,
  UserPlus,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
// import { useToast } from "@/hooks/use-toast";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  lastLogin: string;
  status: "Active" | "Suspended";
}

interface Permission {
  id: string;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface EditUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: AdminUser | null;
  onSave: (user: AdminUser) => void;
}

const availableRoles = [
  { value: "admin", label: "Admin" },
  { value: "staff", label: "Support" },
  { value: "billing", label: "Billing" },
];

const availablePermissions: Permission[] = [
  {
    id: "users_mangement",
    label: "User Management",
    description: "Access to view all appointment data",
    icon: Users,
  },
  {
    id: "payments",
    label: "Payment Processing",
    description: "Access to view all appointment data",
    icon: Shield,
  },
  {
    id: "settings",
    label: "System Settings",
    description: "Access to view all appointment data",
    icon: Settings,
  },
  {
    id: "analytics",
    label: "Analytics & Reports",
    description: "Access to view all appointment data",
    icon: Eye,
  },
  {
    id: "billing",
    label: "Billing & Invoices",
    description: "Access to view all appointment data",
    icon: UserPlus,
  },
];

export const EditUserModal: React.FC<EditUserModalProps> = ({
  isOpen,
  onClose,
  user,
  onSave,
  updateUserAgain,
}) => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    role: "",
  });
  console.log("User has this information: ", user);

  console.log("users infromation from edit user model", user);
  const [userPermissions, setUserPermissions] = useState<string[]>([]);

  useEffect(() => {
    if (user) {
      const fullName = user?.businessName;
      const [firstName, lastName] = fullName.split(" ");

      setFormData({
        firstName,
        lastName,
        email: user.email,
        phone: (user as any).phone || "",
        role: user.role.toLowerCase(),
      });

      // Set default permissions based on role
      const defaultPermissions = getDefaultPermissionsForRole(
        user.role.toLowerCase()
      );
      setUserPermissions(defaultPermissions);
    }
  }, [user]);

  const getDefaultPermissionsForRole = (role: string): string[] => {
    switch (role) {
      case "admin":
        return ["users", "payments", "settings", "analytics", "billing"];
      case "support":
        return ["users", "analytics"];
      case "billing":
        return ["payments", "billing"];
      default:
        return [];
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleRoleChange = (newRole: string) => {
    setFormData((prev) => ({ ...prev, role: newRole }));
    // Update permissions based on new role
    const defaultPermissions = getDefaultPermissionsForRole(newRole);
    setUserPermissions(defaultPermissions);
  };

  // const handlePermissionToggle = (permissionId: string) => {
  //   setUserPermissions((prev) =>
  //     prev.includes(permissionId)
  //       ? prev.filter((p) => p !== permissionId)
  //       : [...prev, permissionId]
  //   );
  // };

  // const handleSave = async () => {
  //   if (!user) return;
  //   const updatedUser = {
  //     firstName: formData.firstName,
  //     lastName: formData.lastName,
  //     email: formData.email,
  //     phone: formData.phone,
  //     role: formData.role,
  //   };

  //   const { error } = await supabase
  //     .from("users")
  //     .update(updatedUser)
  //     .eq("id", user.id);

  //   if (error) {
  //     console.log("error while updating users table infor");
  //     return;
  //   }

  //   console.log("error while updating users table infor");

  //   onSave({ ...user, ...updatedUser });

  //   onClose();
  // };

  const handlePermissionToggle = (permissionId: string) => {
    setUserPermissions((prev) => {
      const isAlreadySet = prev.includes(permissionId);

      console.log(
        `${isAlreadySet ? "Removed" : "Added"} permission: ${permissionId}`
      );

      return isAlreadySet
        ? prev.filter((p) => p !== permissionId)
        : [...prev, permissionId];
    });
  };

  const handleSave = async () => {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    const userId = user.user_id;
    const { firstName, lastName, role, phone, email } = formData;
    const fullName = `${firstName} ${lastName}`;

    try {
      const { data, error: updateError } = await supabase
        .from("users")
        .update({
          businessName: fullName,
          phone: phone,
          role: role,
          email: email,
        })
        .eq("user_id", userId);

      if (updateError) {
        console.error("Error updating user:", updateError.message);
      } else {
        console.log("User updated successfully:", data);
        updateUserAgain();
        toast.success("Data Updated Successfully");

        onClose();
      }
    } catch (err) {
      console.error("Unexpected error:", err.message);
    }
  };

  // const handleSave = async () => {
  //   const {
  //     data: { session },
  //     error,
  //   } = await supabase.auth.getSession();
  //   // console.log("Access token is:", session?.access_token);
  //   const userId = user.user_id;
  //   const { firstName, lastName, role, phone, email } = formData;
  //   const fullName = `${firstName} ${lastName}`;
  //   try {
  //     const response = await fetch(
  //       "https://ajbxscredobhqfksaqrk.supabase.co/functions/v1/update-teamates",
  //       {
  //         method: "POST",
  //         headers: {
  //           "Content-Type": "application/json",
  //           Authorization: `Bearer ${session?.access_token}`,
  //         },
  //         body: JSON.stringify({
  //           user_id: userId,
  //           businessName: fullName,
  //           phone,
  //           role,
  //           email,
  //         }),
  //       }
  //     );
  //     const result = await response.json();
  //     if (!response.ok) {
  //       console.error("Error updating user:", result.error);
  //     } else {
  //       console.log("User updated successfully:", result.message);
  //     }
  //   } catch (err) {
  //     console.error("Unexpected error:", err.message);
  //   }

  //   //for permissions
  //   const permissionsPayload = {
  //     user_management: userPermissions.includes("user_management"),
  //     payment_processing: userPermissions.includes("payment_processing"),
  //     system_settings: userPermissions.includes("system_settings"),
  //     analytics_reports: userPermissions.includes("analytics_reports"),
  //     billing_invoices: userPermissions.includes("billing_invoices"),
  //   };

  //   const { error: permissionsError } = await supabase
  //     .from("permissions")
  //     .update(permissionsPayload)
  //     .eq("role", role);

  //   if (permissionsError) {
  //     console.error("Error updating permissions:", permissionsError.message);
  //   } else {
  //     console.log("Permissions updated successfully");
  //   }
  // };

  const handleResetPassword = () => {};

  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center text-xl">
            <Edit className="w-5 h-5 mr-2 text-primary" />
            Edit User Profile & Permissions
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Info Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 mb-3">
              <UserCheck className="w-4 h-4 text-primary" />
              <h3 className="text-lg font-semibold">Basic Information</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) =>
                    handleInputChange("firstName", e.target.value)
                  }
                  placeholder="Enter first name"
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) =>
                    handleInputChange("lastName", e.target.value)
                  }
                  placeholder="Enter last name"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                readOnly
                placeholder="Enter email address"
              />
            </div>

            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                placeholder="Enter phone number (optional)"
              />
            </div>
          </div>

          <Separator />

          {/* Role Management Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 mb-3">
              <Shield className="w-4 h-4 text-primary" />
              <h3 className="text-lg font-semibold">Role Management</h3>
            </div>

            <div>
              <Label htmlFor="role">User Role *</Label>
              <Select value={formData.role} onValueChange={handleRoleChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  {availableRoles.map((role) => (
                    <SelectItem key={role.value} value={role.value}>
                      {role.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator />

          {/* Permissions Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 mb-3">
              <Settings className="w-4 h-4 text-primary" />
              <h3 className="text-lg font-semibold">Permissions</h3>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {availablePermissions.map((permission) => (
                <div
                  key={permission.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <permission.icon className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <div className="font-medium text-sm">
                        {permission.label}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {permission.description}
                      </div>
                    </div>
                  </div>
                  <Switch
                    checked={userPermissions.includes(permission.id)}
                    onCheckedChange={() =>
                      handlePermissionToggle(permission.id)
                    }
                  />
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Additional Actions */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 mb-3">
              <Key className="w-4 h-4 text-primary" />
              <h3 className="text-lg font-semibold">Security Actions</h3>
            </div>

            <Button
              variant="outline"
              onClick={handleResetPassword}
              className="w-full sm:w-auto"
            >
              <Key className="w-4 h-4 mr-2" />
              Reset Password
            </Button>
          </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={onClose}
            className="order-2 sm:order-1"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className="bg-primary hover:bg-primary/90 order-1 sm:order-2"
            disabled={
              !formData.firstName ||
              !formData.lastName ||
              !formData.email ||
              !formData.role
            }
          >
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
