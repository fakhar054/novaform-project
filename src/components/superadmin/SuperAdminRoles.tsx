import React, { useEffect, useState } from "react";
import {
  Users,
  Plus,
  Edit,
  Trash2,
  Shield,
  Eye,
  Settings,
  UserPlus,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ConfirmActionModal } from "./ConfirmActionModal";
import { supabase } from "@/integrations/supabase/client";
import { permission } from "process";
import { toast } from "sonner";
import { EditUserModal } from "./EditUserModal";

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  lastLogin: string;
  status: "Active" | "Suspended";
}

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
}

const mockUsers: AdminUser[] = [
  {
    id: "1",
    name: "John Smith",
    email: "john@novafarm.com",
    role: "Super Admin",
    lastLogin: "2024-06-30 14:30",
    status: "Active",
  },
  {
    id: "2",
    name: "Sarah Johnson",
    email: "sarah@novafarm.com",
    role: "Support Staff",
    lastLogin: "2024-06-29 16:45",
    status: "Active",
  },
  {
    id: "3",
    name: "Mike Chen",
    email: "mike@novafarm.com",
    role: "Billing",
    lastLogin: "2024-06-28 09:15",
    status: "Suspended",
  },
];

const mockRoles: Role[] = [
  {
    id: "1",
    name: "Admin",
    description: "Full system access",
    permissions: ["users", "payments", "settings", "analytics", "billing"],
  },
  {
    id: "2",
    name: "Support Staff",
    description: "View clients, no payment actions",
    permissions: ["users", "analytics"],
  },
  {
    id: "3",
    name: "Billing",
    description: "Manage invoices only",
    permissions: ["payments", "billing"],
  },
];

const allPermissions = [
  { id: "users", label: "User Management", icon: Users },
  { id: "payments", label: "Payment Processing", icon: Shield },
  { id: "settings", label: "System Settings", icon: Settings },
  { id: "analytics", label: "Analytics & Reports", icon: Eye },
  { id: "billing", label: "Billing & Invoices", icon: UserPlus },
  { id: "userRoles", label: "User Roles", icon: UserPlus },
];

export const SuperAdminRoles: React.FC = () => {
  const [users, setUsers] = useState<AdminUser[]>(mockUsers);
  const [roles, setRoles] = useState<Role[]>(mockRoles);
  const [all_users, set_all_users] = useState([]);
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [isManagePermissionsOpen, setIsManagePermissionsOpen] = useState(false);

  const [selectedRole_main, setSelectedRole_main] = useState({
    name: "",
    permission: [],
  });

  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [confirmAction, setConfirmAction] = useState<{
    isOpen: boolean;
    action: () => void;
    title: string;
    message: string;
  } | null>(null);

  const [newUser, setNewUser] = useState({
    firstName: "",
    lastName: "",
    email: "",
    role: "",
    password: "",
  });

  const permissionColumnMap: { [key: string]: string } = {
    users: "user_management",
    payments: "payment_processing",
    settings: "system_settings",
    analytics: "analytics_reports",
    billing: "billing_invoices",
    userRoles: "user_roles",
  };

  const [isEditUserOpen, setIsEditUserOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const fetchPermissionsForRoles = async () => {
    const updatedRoles = await Promise.all(
      mockRoles.map(async (role) => {
        const dbRole = roleNameToDb(role.name);
        const { data, error } = await supabase
          .from("permissions")
          .select("*")
          .eq("role", dbRole)
          .single();

        if (error || !data) {
          console.warn(`No permissions found for role: ${role.name}`);
          return role;
        }

        const selectedPermissions: string[] = [];
        for (const [key, value] of Object.entries(data)) {
          const match = Object.entries(permissionColumnMap).find(
            ([permKey, column]) => column === key && value === true
          );
          if (match) selectedPermissions.push(match[0]);
        }

        return {
          ...role,
          permissions: selectedPermissions,
        };
      })
    );

    setRoles(updatedRoles);
  };

  const fetchUsers = async () => {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .in("role", ["staff", "billing", "admin"])
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching users:", error.message);
      return [];
    }
    set_all_users(data);

    return data;
  };

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

  useEffect(() => {
    fetchUsers();
    fetchPermissionsForRoles();
  }, []);

  console.log("Fetched users from state:", all_users);

  const handleDeleteUser_main = async (userId: string) => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const accessToken = session?.access_token;

    const user_id = userId.id;

    const res = await fetch(
      "https://ajbxscredobhqfksaqrk.supabase.co/functions/v1/delete-teamate",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ user_id: user_id }),
      }
    );
    if (!res.ok) {
      const err = await res.json();
      console.error("Delete failed:", err);
      alert("Failed to delete user");
    } else {
      toast.success("User deleted!");
      fetchUsers();
    }
  };

  const getAccessToken = async () => {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error) {
      console.error("Error getting session:", error.message);
      return null;
    }

    const accessToken = session?.access_token;
    console.log("Access token:", accessToken);
    return accessToken;
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    const accessToken = await getAccessToken();
    const { firstName, lastName, email, role, password } = newUser;
    const fullName = `${firstName} ${lastName}`;

    try {
      const response = await fetch(
        "https://ajbxscredobhqfksaqrk.supabase.co/functions/v1/add-user-with-role",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            // firstName,
            // lastName,
            businessName: fullName,
            email,
            password,
            role: roleNameToDb(role),
          }),
        }
      );

      const result = await response.json();

      if (response.ok) {
        console.log("✅ User added successfully:", result);
        setIsAddUserOpen(false);
        toast.success("User added successfully");
        fetchUsers();
      } else {
        console.error("❌ Error:", result.error || result.message);
      }
    } catch (error) {
      console.error("❌ Unexpected error:", error.message);
    }
  };

  const handleSuspendUser = async (userId, newStatus) => {
    set_all_users((prev) =>
      prev.map((user) =>
        user.user_id === userId ? { ...user, accountStatus: newStatus } : user
      )
    );

    const { data, error } = await supabase
      .from("users")
      .update({ accountStatus: newStatus })
      .eq("user_id", userId);

    if (error) {
      console.error("Error updating user status:", error.message);
      return;
    } else {
      toast.success("Status Updated");
    }
  };

  const handleDeleteUser = (userId: string) => {
    setUsers(users.filter((user) => user.id !== userId));
  };

  const handleManagePermissions = async (role: Role) => {
    try {
      const dbRole = roleNameToDb(role.name);
      const { data, error } = await supabase
        .from("permissions")
        .select("*")
        .eq("role", dbRole)
        .single();

      if (error) {
        console.error("Error fetching permissions:", error.message);
      }
      const selectedPermissions: string[] = [];
      if (data) {
        for (const [key, value] of Object.entries(data)) {
          const match = Object.entries(permissionColumnMap).find(
            ([permKey, column]) => column === key && value === true
          );
          if (match) selectedPermissions.push(match[0]);
        }
      }
      setSelectedRole({
        ...role,
        permissions: selectedPermissions,
      });

      setIsManagePermissionsOpen(true);
    } catch (err) {
      console.error("Unexpected error fetching permissions:", err);
    }
  };

  const handlePermissionToggle_main = (permissionId) => {
    setSelectedRole((prev) => {
      const hasPermission = prev.permissions.includes(permissionId);
      return {
        ...prev,
        permissions: hasPermission
          ? prev.permissions.filter((id) => id !== permissionId)
          : [...prev.permissions, permissionId],
      };
    });
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setIsEditUserOpen(true);
  };

  const handleSaveUser = (updatedUser: AdminUser) => {
    setUsers(
      users.map((user) => (user.id === updatedUser.id ? updatedUser : user))
    );
  };

  const roleNameToDb = (role: string) => {
    switch (role.toLowerCase()) {
      case "admin":
        return "admin";
      case "support staff":
        return "staff";
      case "billing":
        return "billing";
      default:
        return role.toLowerCase().replace(/\s+/g, "_");
    }
  };

  // const handleSave_permissions = async () => {
  //   if (!selectedRole) return;

  //   // Build the payload for upsert
  //   const payload: { [key: string]: boolean | string } = {
  //     role: roleNameToDb(selectedRole.name),
  //   };

  //   // Set all permissions to false first
  //   Object.entries(permissionColumnMap).forEach(([permKey, column]) => {
  //     payload[column] = false;
  //   });

  //   // Set selected permissions to true
  //   selectedRole.permissions.forEach((perm) => {
  //     const column = permissionColumnMap[perm];
  //     if (column) payload[column] = true;
  //   });

  //   // Upsert to Supabase
  //   const { error } = await supabase
  //     .from("permissions")
  //     .upsert([payload], { onConflict: "role" });

  //   if (error) {
  //     toast.error("Error saving permissions: " + error.message);
  //     return;
  //   }

  //   // Update roles in UI
  //   setRoles((prevRoles) =>
  //     prevRoles.map((role) =>
  //       role.name === selectedRole.name
  //         ? { ...role, permissions: selectedRole.permissions }
  //         : role
  //     )
  //   );

  //   toast.success("Permissions saved successfully!");
  //   setIsManagePermissionsOpen(false);
  // };

  const handleSave_permissions = async () => {
    if (!selectedRole) return;

    const payload: { [key: string]: boolean | string } = {
      role: roleNameToDb(selectedRole.name),
    };

    Object.entries(permissionColumnMap).forEach(([permKey, column]) => {
      payload[column] = false;
    });

    selectedRole.permissions.forEach((perm) => {
      const column = permissionColumnMap[perm];
      if (column) payload[column] = true;
    });

    const { error } = await supabase
      .from("permissions")
      .upsert([payload], { onConflict: "role" });

    if (error) {
      toast.error("Error saving permissions: " + error.message);
      return;
    }

    // Fetch updated permissions from Supabase
    await fetchPermissionsForRoles();

    toast.success("Permissions saved successfully!");
    setIsManagePermissionsOpen(false);
  };

  const handlePermissionToggle = (permissionId: string) => {
    if (!selectedRole) return;

    const updatedPermissions = selectedRole.permissions.includes(permissionId)
      ? selectedRole.permissions.filter((p) => p !== permissionId)
      : [...selectedRole.permissions, permissionId];

    console.log("Selected Permissions:", updatedPermissions);
    console.log("Selected role:", selectedRole.name);

    setSelectedRole({ ...selectedRole, permissions: updatedPermissions });
    setRoles(
      roles.map((role) =>
        role.id === selectedRole.id
          ? { ...role, permissions: updatedPermissions }
          : role
      )
    );
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800";
      case "staff":
        return "bg-blue-100 text-blue-800";
      case "billing":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Team Members & Access Control
          </h1>
          <p className="text-gray-600 mt-1 text-left">
            Manage internal team access and permissions
          </p>
        </div>

        <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#27AE60] hover:bg-[#1e8449] mt-4 sm:mt-0">
              <Plus className="w-4 h-4 mr-2" />
              Add New Admin
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Team Member</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={newUser.firstName}
                    onChange={(e) =>
                      setNewUser({ ...newUser, firstName: e.target.value })
                    }
                    placeholder="John"
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={newUser.lastName}
                    onChange={(e) =>
                      setNewUser({ ...newUser, lastName: e.target.value })
                    }
                    placeholder="Smith"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={newUser.email}
                  onChange={(e) =>
                    setNewUser({ ...newUser, email: e.target.value })
                  }
                  placeholder="john@novafarm.com"
                />
              </div>
              <div>
                <Label htmlFor="role">Role</Label>
                <Select
                  value={newUser.role}
                  onValueChange={(value) =>
                    setNewUser({ ...newUser, role: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((role) => (
                      <SelectItem key={role.id} value={role.name}>
                        {role.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={newUser.password}
                  onChange={(e) =>
                    setNewUser({ ...newUser, password: e.target.value })
                  }
                  placeholder="Enter temporary password"
                />
              </div>
              <Button
                onClick={handleAddUser}
                className="w-full bg-[#27AE60] hover:bg-[#1e8449]"
                disabled={
                  !newUser.firstName ||
                  !newUser.lastName ||
                  !newUser.email ||
                  !newUser.role
                }
              >
                Send Access Invitation
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="users" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="users">Admin Users</TabsTrigger>
          <TabsTrigger value="roles">Role Manager</TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="w-5 h-5 mr-2 text-[#27AE60]" />
                Team Members ({all_users.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead className="hidden sm:table-cell">
                        Email
                      </TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead className="hidden md:table-cell">
                        Last Login
                      </TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {all_users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium text-left">
                          <div>
                            <div>{`${user?.businessName} `}</div>
                            <div className="text-sm text-gray-500 sm:hidden">
                              {user.email}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell text-left">
                          {user.email}
                        </TableCell>
                        <TableCell className="text-left">
                          <Badge className={getRoleColor(user.role)}>
                            {user.role}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-sm text-gray-600 text-left">
                          {formatCreatedAt(user?.last_login)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Switch
                              checked={user.accountStatus === true}
                              onCheckedChange={(checked) =>
                                handleSuspendUser(
                                  user.user_id,
                                  checked ? true : false
                                )
                              }
                            />
                            <span className="text-sm">
                              {user.accountStatus === "active"
                                ? "Active"
                                : "Suspended"}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditUser(user)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>

                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                setConfirmAction({
                                  isOpen: true,
                                  action: () => handleDeleteUser_main(user),
                                  title: "Delete Team Member",
                                  message: `Are you sure you want to delete ${user.firstName}? This action cannot be undone.`,
                                })
                              }
                            >
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="roles">
          <div className="grid gap-6">
            {roles.map((role) => (
              <Card key={role.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg text-left">
                        {role.name}
                      </CardTitle>
                      <p className="text-sm text-gray-600">
                        {role.description}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => handleManagePermissions(role)}
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      Manage Permissions
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {role.permissions.map((permission) => {
                      const perm = allPermissions.find(
                        (p) => p.id === permission
                      );
                      return perm ? (
                        <Badge
                          key={permission}
                          variant="secondary"
                          className="bg-[#27AE60]/10 text-[#27AE60]"
                        >
                          <perm.icon className="w-3 h-3 mr-1" />
                          {perm.label}
                        </Badge>
                      ) : null;
                    })}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Manage Permissions Modal */}
      <Dialog
        open={isManagePermissionsOpen}
        onOpenChange={setIsManagePermissionsOpen}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Manage Permissions - {selectedRole?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {allPermissions.map((permission) => (
              <div key={permission.id} className="flex items-center space-x-3">
                <Checkbox
                  id={permission.id}
                  checked={selectedRole?.permissions.includes(permission.id)}
                  onCheckedChange={() => handlePermissionToggle(permission.id)}
                />
                <div className="flex items-center space-x-2">
                  <permission.icon className="w-4 h-4 text-gray-600" />
                  <Label htmlFor={permission.id}>{permission.label}</Label>
                </div>
              </div>
            ))}
            <Button
              onClick={handleSave_permissions}
              className="w-full bg-[#27AE60] hover:bg-[#1e8449]"
            >
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit User Modal */}
      <EditUserModal
        isOpen={isEditUserOpen}
        onClose={() => setIsEditUserOpen(false)}
        user={selectedUser}
        onSave={handleSaveUser}
        updateUserAgain={fetchUsers}
      />

      {/* Confirmation Modal */}
      {confirmAction && (
        <ConfirmActionModal
          isOpen={confirmAction.isOpen}
          title={confirmAction.title}
          message={confirmAction.message}
          onConfirm={() => {
            confirmAction.action();
            setConfirmAction(null);
          }}
          onCancel={() => setConfirmAction(null)}
          isDestructive={true}
          confirmButtonText="Delete"
        />
      )}
    </div>
  );
};
