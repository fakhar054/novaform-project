import React, { useState } from "react";
import { SuperAdminSidebar } from "@/components/superadmin/SuperAdminSidebar";
import { SuperAdminOverview } from "@/components/superadmin/SuperAdminOverview";
import { SuperAdminUsers } from "@/components/superadmin/SuperAdminUsers";
import { SuperAdminPayments } from "@/components/superadmin/SuperAdminPayments";
import { SuperAdminAccounts } from "@/components/superadmin/SuperAdminAccounts";
import { SuperAdminInvoices } from "@/components/superadmin/SuperAdminInvoices";
import { SuperAdminActivityLogs } from "@/components/superadmin/SuperAdminActivityLogs";
import { SuperAdminSettings } from "@/components/superadmin/SuperAdminSettings";
import { SuperAdminRoles } from "@/components/superadmin/SuperAdminRoles";
import { SuperAdminEmail } from "@/components/superadmin/SuperAdminEmail";
import { SubscriptionPlan } from "./SubscriptionPlan";
import AllPlans from "./AllPlans";
import { SuperAdminSubscriptionPlans } from "@/components/superadmin/SuperAdminSubscriptionPlans";

import { useUserContext } from "@/components/UserContext";

export type SuperAdminSection =
  | "dashboard"
  | "users"
  | "payments"
  | "accounts"
  | "invoices"
  | "activity"
  | "email"
  | "settings"
  | "subscrption_plan"
  | "viewPlans"
  | "roles";

const SuperAdmin: React.FC = () => {
  const [activeSection, setActiveSection] =
    useState<SuperAdminSection>("dashboard");

  const { role, setRole } = useUserContext();
  console.log("Role from useContext api :", role);

  const renderContent = () => {
    switch (activeSection) {
      case "dashboard":
        return <SuperAdminOverview onSectionChange={setActiveSection} />;
      case "users":
        return <SuperAdminUsers />;
      case "payments":
        return <SuperAdminPayments />;
      case "accounts":
        return <SuperAdminAccounts />;
      case "invoices":
        return <SuperAdminInvoices />;
      case "activity":
        return <SuperAdminActivityLogs />;
      case "email":
        return <SuperAdminEmail />;
      case "subscrption_plan":
        return <SuperAdminSubscriptionPlans />;
      case "settings":
        return <SuperAdminSettings />;
      case "roles":
        return <SuperAdminRoles />;
      case "viewPlans":
        return <AllPlans />;

      case "email":
        return <SuperAdminEmail />;

      default:
        return <SuperAdminOverview onSectionChange={setActiveSection} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex w-full">
      <SuperAdminSidebar
        activeSection={activeSection}
        onSectionChange={setActiveSection}
      />

      {/* Main Content */}
      <div className="flex-1 lg:ml-64">
        <div className="p-4 lg:p-8">{renderContent()}</div>
      </div>
    </div>
  );
};

export default SuperAdmin;
