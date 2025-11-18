import React, { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Users,
  CreditCard,
  UserPlus,
  FileText,
  Activity,
  Settings,
  Menu,
  X,
  Shield,
  Mail,
  ArrowRight,
  Package,
} from "lucide-react";
import { SuperAdminSection } from "@/pages/SuperAdmin";
import { SuperAdminSubscriptionPlans } from "./SuperAdminSubscriptionPlans";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import "../../App.css";
import { useUserContext } from "@/components/UserContext";
import { supabase } from "@/integrations/supabase/client";
import Spinner from "../Spinner";

interface SuperAdminSidebarProps {
  activeSection: SuperAdminSection;
  onSectionChange: (section: SuperAdminSection) => void;
}

export const SuperAdminSidebar: React.FC<SuperAdminSidebarProps> = ({
  activeSection,
  onSectionChange,
}) => {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [permissions, setPermissions] = useState();
  const [loadingPermissions, setLoadingPermissions] = useState(true);
  const [role, setRole] = useState();

  useEffect(() => {
    const storedRole = localStorage.getItem("role");
    setRole(storedRole);
  }, []);

  console.log("Role from useContext api :", role);

  useEffect(() => {
    const fetchPermissions = async () => {
      if (!role) {
        setLoadingPermissions(false);
        return;
      }
      const { data, error } = await supabase
        .from("permissions")
        .select("*")
        .eq("role", role)
        .maybeSingle();

      if (error) {
        console.error("Error fetching permissions:", error);
      } else {
        console.log("Permissions:", data);
        setPermissions(data);
      }
      setLoadingPermissions(false);
    };

    fetchPermissions();
  }, [role]);

  if (role === undefined || loadingPermissions) {
    return <Spinner />;
  }

  const menuItems: Array<any> = [];

  menuItems.push({
    id: "dashboard" as SuperAdminSection,
    label: "Dashboard",
    icon: LayoutDashboard,
  });

  if (permissions?.user_management || role === "super-admin") {
    menuItems.push({
      id: "users" as SuperAdminSection,
      label: "Users",
      icon: Users,
    });
  }

  if (permissions?.payment_processing || role === "super-admin") {
    menuItems.push({
      id: "payments" as SuperAdminSection,
      label: "Payments",
      icon: CreditCard,
    });
  }

  if (permissions?.billing_invoices || role === "super-admin") {
    menuItems.push({
      id: "invoices" as SuperAdminSection,
      label: "Invoices",
      icon: FileText,
    });
  }

  if (permissions?.analytics_reports || role === "super-admin") {
    menuItems.push({
      id: "accounts" as SuperAdminSection,
      label: "Accounts",
      icon: UserPlus,
    });
  }
  if (permissions?.system_settings || role === "super-admin") {
    menuItems.push({
      id: "settings" as SuperAdminSection,
      label: "Settings",
      icon: Settings,
    });
  }

  if (permissions?.email || role === "super-admin") {
    menuItems.push({
      id: "email" as SuperAdminSection,
      label: "Email",
      icon: Mail,
    });
  }

  //i will show only super admin if also other user then un-comment code below
  // if (permissions?.user_roles || role === "super-admin") {
  if (role === "super-admin") {
    menuItems.push({
      id: "roles" as SuperAdminSection,
      label: "User Roles",
      icon: Shield,
    });
  }

  menuItems.push({
    id: "subscrption_plan" as SuperAdminSection,
    label: "Subscription Plan",
    icon: Package,
  });

  // menuItems.push({
  //   id: "email" as SuperAdminSection,
  //   label: "Email",
  //   icon: Mail,
  // });

  // const menuItems = [
  //   {
  //     id: "dashboard" as SuperAdminSection,
  //     label: "Dashboard",
  //     icon: LayoutDashboard,
  //   },
  //   {
  //     id: "users" as SuperAdminSection,
  //     label: "Users",
  //     icon: Users,
  //   },
  //   {
  //     id: "payments" as SuperAdminSection,
  //     label: "Payments",
  //     icon: CreditCard,
  //   },
  //   { id: "accounts" as SuperAdminSection, label: "Accounts", icon: UserPlus },
  //   { id: "invoices" as SuperAdminSection, label: "Invoices", icon: FileText },
  //   {
  //     id: "activity" as SuperAdminSection,
  //     label: "Activity Logs",
  //     icon: Activity,
  //   },
  //   {
  //     id: "subscrption_plan" as SuperAdminSection,
  //     label: "Subscription Plan",
  //     icon: Package,
  //   },
  //   { id: "email" as SuperAdminSection, label: "Email", icon: Mail },
  //   { id: "roles" as SuperAdminSection, label: "User Roles", icon: Shield },
  //   { id: "settings" as SuperAdminSection, label: "Settings", icon: Settings },
  // ];

  const handleLogout = () => {
    localStorage.removeItem("sb-ajbxscredobhqfksaqrk-auth-token");
    localStorage.removeItem("role");
    navigate("/");
    toast.success("Logut Successful");
  };
  const handleMenuClick = (section: SuperAdminSection) => {
    onSectionChange(section);

    setIsMobileMenuOpen(false);
  };

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="bg-white p-2 rounded-lg shadow-lg border"
        >
          {isMobileMenuOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <Menu className="w-6 h-6" />
          )}
        </button>
      </div>

      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
        fixed top-0 left-0 h-full w-64 bg-[#1B1B1F] shadow-xl z-40 transform transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0 
      `}
      >
        <div className="p-6 border-b border-gray-700 text-left">
          <h1 className="text-xl font-bold text-[#1C9B7A]">NovaFarm</h1>
          <p className="text-sm text-gray-400 mt-1">Super Admin</p>
        </div>

        <nav className="p-4 space-y-2 h-[70%] overflow-y-auto custom-scrollbar">
          {/* <nav className="p-4 space-y-2 overflow-y-scroll"> */}
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleMenuClick(item.id)}
                className={`
                  w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors
                  ${
                    isActive
                      ? "bg-[#1C9B7A] text-white shadow-md"
                      : "text-gray-300 hover:bg-gray-700 hover:text-white"
                  }
                `}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>
        <div className="flex">
          <div
            className="py-3 px-7 flex gap-3 text-red-600 cursor-pointer button_border"
            onClick={handleLogout}
          >
            <ArrowRight />
            <p className="font-medium">Logout</p>
          </div>
        </div>
      </div>
    </>
  );
};
