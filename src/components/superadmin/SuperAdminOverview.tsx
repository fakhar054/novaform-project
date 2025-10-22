import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Users,
  DollarSign,
  FileText,
  TrendingUp,
  TrendingDown,
  Calendar,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { SuperAdminSection } from "@/pages/SuperAdmin";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
// import { differenceInDays, parseISO, setDate } from "date-fns";
import Spinner from "../Spinner";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import { DateRangePicker } from "react-date-range"; //https://youtu.be/lO3MVkTPvIc video lecture and https://www.npmjs.com/package/605-react-date-range package link
import { format } from "date-fns";
type TimeFilter = "last7" | "last30" | "last90";

interface SuperAdminOverviewProps {
  onSectionChange: (section: SuperAdminSection) => void;
}

export const SuperAdminOverview: React.FC<SuperAdminOverviewProps> = ({
  onSectionChange,
}) => {
  const [totalUsers, setTotalUsers] = useState([]);
  const [timeFilter, setTimeFilter] = useState("last7");
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [activeUser, setActiveUsers] = useState(0);
  const [suspendedUser, setSuspendedUser] = useState(0);
  const [revenueAgainstTime, setRevenueAgainstTime] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [signupsAgainstTime, setSignupsAgainstTime] = useState(0);
  const [userChartData, setUserChartData] = useState<any[]>([]);

  //for line chart
  const [chartData, setChartData] = useState<any[]>([]);
  //for calnder
  const [openCalender, setOpenCalender] = useState(false);
  const calendarRef = useRef(null);

  const [Rdate, setRdate] = useState({
    startDate: new Date(),
    endDate: new Date(),
    key: "selection",
  });

  useEffect(() => {
    fetchUsers(timeFilter);
    fetchRevenue(timeFilter);
    fetchTotalRevenue();
    fetchSignups(timeFilter);
    fetchRevenueChart(timeFilter);
    fetchUserChart(timeFilter);

    const handleClickOutside = (event) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target)) {
        setOpenCalender(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [timeFilter]);

  const fetchUsers = async (filter: string) => {
    try {
      let days = 7;
      if (filter === "last30") days = 30;
      if (filter === "last90") days = 90;

      const fromDate = new Date();
      fromDate.setDate(fromDate.getDate() - days);

      const { data, error } = await supabase
        .from("users")
        .select("*")
        .gte("created_at", fromDate.toISOString());

      if (error) {
        console.log("Error in user Fetching in dashborad");
        setLoading(false);
        return;
      }
      console.log("data  Fetching in dashborad", data);
      setUsers(data);
      setLoading(false);

      const activeCount =
        data?.filter((u) => u.accountStatus === true).length || 0;
      const suspendedCount =
        data?.filter((u) => u.accountStatus === false).length || 0;
      setActiveUsers(activeCount);
      setSuspendedUser(suspendedCount);
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  };

  const fetchRevenue = async (filter: string) => {
    try {
      let days = 7;
      if (filter === "last30") days = 30;
      if (filter === "last90") days = 90;
      const fromDate = new Date();
      fromDate.setDate(fromDate.getDate() - days);

      const { data, error } = await supabase
        .from("subscription")
        .select("amount_paid, created_at")
        .gte("created_at", fromDate.toISOString());

      if (error) {
        console.error("Error fetching revenue:", error);
        return;
      }
      const totalRevenue =
        data?.reduce((sum, sub) => sum + Number(sub.amount_paid), 0) || 0;
      setRevenueAgainstTime(totalRevenue);
      console.log("Fetching data from mRevenue: ", data);
    } catch (err) {
      console.error("Error fetching revenue:", err);
    }
  };

  //for signup against
  const fetchSignups = async (filter: string) => {
    try {
      let days = 7;
      if (filter === "last30") days = 30;
      if (filter === "last90") days = 90;

      const fromDate = new Date();
      fromDate.setDate(fromDate.getDate() - days);

      const { data, error } = await supabase
        .from("users")
        .select("id, created_at")
        .gte("created_at", fromDate.toISOString());

      if (error) {
        console.error("Error fetching signups:", error);
        return;
      }

      setSignupsAgainstTime(data?.length || 0);
    } catch (err) {
      console.error("Error fetching signups:", err);
    }
  };

  // Fetch total revenue (no filter)
  const fetchTotalRevenue = async () => {
    try {
      const { data, error } = await supabase
        .from("subscription")
        .select("amount_paid");
      if (error) {
        console.error("Error fetching total revenue:", error);
        return;
      }
      const total =
        data?.reduce((sum, sub) => sum + Number(sub.amount_paid), 0) || 0;
      setTotalRevenue(total);
    } catch (err) {
      console.error("Error fetching total revenue:", err);
    }
  };

  //for line chat
  const fetchRevenueChart = async (filter: string) => {
    try {
      let days = 7;
      if (filter === "last30") days = 30;
      if (filter === "last90") days = 90;
      const fromDate = new Date();
      fromDate.setDate(fromDate.getDate() - days);

      const { data, error } = await supabase
        .from("subscription")
        .select("amount_paid, created_at")
        .gte("created_at", fromDate.toISOString());

      if (error) {
        console.error("Error fetching chart revenue:", error);
        return;
      }
      // ✅ Group by day if filter <= 30, otherwise by month
      const grouped: Record<string, number> = {};

      data?.forEach((sub) => {
        const date = new Date(sub.created_at);

        let key = "";
        if (days <= 30) {
          // group by day
          key = date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          });
        } else {
          // group by month
          key = date.toLocaleDateString("en-US", {
            month: "short",
            year: "numeric",
          });
        }

        grouped[key] = (grouped[key] || 0) + Number(sub.amount_paid);
      });

      // ✅ Convert into array for recharts
      const chartFormatted = Object.entries(grouped).map(([key, value]) => ({
        month: key,
        revenue: value,
      }));

      setChartData(chartFormatted);
    } catch (err) {
      console.error("Error fetching chart data:", err);
    }
  };

  //for user trend
  const fetchUserChart = async (filter: string) => {
    try {
      let days = 7;
      if (filter === "last30") days = 30;
      if (filter === "last90") days = 90;

      const fromDate = new Date();
      fromDate.setDate(fromDate.getDate() - days);

      const { data, error } = await supabase
        .from("users")
        .select("created_at")
        .gte("created_at", fromDate.toISOString());

      if (error) {
        console.error("Error fetching user chart:", error);
        return;
      }

      const grouped: Record<string, number> = {};

      data?.forEach((user) => {
        const date = new Date(user.created_at);

        let key = "";
        if (days <= 30) {
          key = date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          });
        } else {
          key = date.toLocaleDateString("en-US", {
            month: "short",
            year: "numeric",
          });
        }

        grouped[key] = (grouped[key] || 0) + 1;
      });

      const chartFormatted = Object.entries(grouped)
        .map(([key, value]) => ({
          month: key,
          count: value,
        }))
        .sort(
          (a, b) => new Date(a.month).getTime() - new Date(b.month).getTime()
        );

      setUserChartData(chartFormatted);
    } catch (err) {
      console.error("Error fetching user chart data:", err);
    }
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case "create-user":
        onSectionChange("users");
        break;
      case "generate-report":
        onSectionChange("activity");
        break;
      case "payment-link":
        onSectionChange("payments");
        break;
      case "view-analytics":
        onSectionChange("dashboard");
        break;
      default:
        break;
    }
  };

  function formatDate(dateInput) {
    const date = new Date(dateInput);
    if (isNaN(date)) return "Invalid Date";
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const year = date.getFullYear();
    return `${month}-${day}-${year}`;
  }

  const handleDateChange = async (ranges) => {
    const { startDate, endDate } = ranges.selection;
    setRdate(ranges.selection);

    const startFormattedDate = formatDate(startDate);
    const endFormattedDate = formatDate(endDate);

    if (startFormattedDate === endFormattedDate) {
      console.log("Both dates are equal");
      return;
    }

    console.log("Starting Date:", startFormattedDate);
    console.log("Ending Date:", endFormattedDate);

    try {
      setLoading(true);

      const startISO = new Date(startDate).toISOString();
      const endISO = new Date(endDate).toISOString();

      // --- 🧩 Fetch both tables in parallel ---
      const [usersRes, subsRes] = await Promise.all([
        supabase
          .from("users")
          .select("*")
          .gte("created_at", startISO)
          .lte("created_at", endISO),

        supabase
          .from("subscription")
          .select("amount_paid, created_at")
          .gte("created_at", startISO)
          .lte("created_at", endISO),
      ]);

      // --- 🧩 Handle Users (Data + Chart) ---
      if (usersRes.error) {
        console.error("Error fetching users:", usersRes.error);
        setUsers([]);
        setUserChartData([]);
      } else {
        const userData = usersRes.data || [];
        setUsers(userData);
        console.log("Fetched users:", userData);

        // ✅ Group users by day (or month if large range)
        const diffDays =
          (new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24);
        const groupedUsers = {};

        userData.forEach((user) => {
          const date = new Date(user.created_at);
          const key =
            diffDays <= 30
              ? date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })
              : date.toLocaleDateString("en-US", {
                  month: "short",
                  year: "numeric",
                });

          groupedUsers[key] = (groupedUsers[key] || 0) + 1;
        });

        const userChartFormatted = Object.entries(groupedUsers)
          .map(([key, value]) => ({
            date: key,
            count: value,
          }))
          .sort((a, b) => new Date(a.date) - new Date(b.date));

        setUserChartData(userChartFormatted);
        console.log("User Chart Data:", userChartFormatted);
      }

      // --- 🧩 Handle Subscriptions (Revenue + Chart) ---
      if (subsRes.error) {
        console.error("Error fetching revenue:", subsRes.error);
        setRevenueAgainstTime(0);
        setChartData([]);
      } else {
        const subsData = subsRes.data || [];

        const totalRevenue =
          subsData.reduce((sum, sub) => sum + Number(sub.amount_paid), 0) || 0;
        setRevenueAgainstTime(totalRevenue);
        console.log("Fetched subscriptions:", subsData);
        console.log("Total Revenue:", totalRevenue);

        // ✅ Group by day (or month)
        const diffDays =
          (new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24);
        const groupedRevenue = {};

        subsData.forEach((sub) => {
          const date = new Date(sub.created_at);
          const key =
            diffDays <= 30
              ? date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })
              : date.toLocaleDateString("en-US", {
                  month: "short",
                  year: "numeric",
                });

          groupedRevenue[key] =
            (groupedRevenue[key] || 0) + Number(sub.amount_paid);
        });

        const chartFormatted = Object.entries(groupedRevenue)
          .map(([key, value]) => ({
            date: key,
            revenue: value,
          }))
          .sort((a, b) => new Date(a.date) - new Date(b.date));

        setChartData(chartFormatted);
        console.log("Revenue Chart Data:", chartFormatted);
      }
    } catch (err) {
      console.error("Unexpected error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCalender = () => {
    setOpenCalender(!openCalender);
  };

  const KPICard = ({
    title,
    value,
    prefix = "",
    suffix = "",
    change,
    trend,
    icon: Icon,
  }: any) => (
    <Card className="bg-white border border-gray-200 hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-gray-600">
            {title}
          </CardTitle>
          <Icon className="w-5 h-5 text-[#1C9B7A]" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline justify-between">
          <div className="text-2xl font-bold text-gray-900">
            {prefix}
            {typeof value === "number" ? value.toLocaleString() : value}
            {suffix}
          </div>
          <div
            className={`flex items-center text-sm font-medium ${
              trend === "up" ? "text-green-600" : "text-red-600"
            }`}
          ></div>
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return <Spinner />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Super Admin Dashboard
          </h1>
          <p className="text-gray-600 mt-1 text-left">
            Monitor and manage your NovaFarm platform
          </p>
        </div>

        <div
          ref={calendarRef}
          className="flex items-center space-x-4 mt-4 sm:mt-0"
        >
          <Select
            value={timeFilter}
            onValueChange={(value) => {
              setTimeFilter(value);
              if (value === "customRange") {
                setOpenCalender((prev) => !prev);
              } else {
                setOpenCalender(false);
              }
            }}
          >
            <SelectTrigger className="w-48">
              <Calendar className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Select Time Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="last7">Last 7 days</SelectItem>
              <SelectItem value="last30">Last 30 days</SelectItem>
              <SelectItem value="last90">Last 90 days</SelectItem>
              <SelectItem value="customRange">Custom Range</SelectItem>
            </SelectContent>
          </Select>

          <div
            className={`absolute top-[100px] right-[50px] border border-black rounded shadow-2xl shadow-gray-800 bg-white transition-all duration-300 ease-in-out transform ${
              openCalender
                ? "opacity-100 translate-y-0 visible"
                : "opacity-0 -translate-y-4 invisible"
            }`}
          >
            <DateRangePicker
              ranges={[Rdate]}
              onChange={handleDateChange}
              maxDate={new Date()}
            />
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
        <KPICard
          title="Total Users"
          value={users?.length}
          trend=""
          icon={Users}
        />
        <KPICard
          title="Active Users"
          value={activeUser}
          // trend={kpiData.activeUsers.trend}
          icon={Users}
        />
        <KPICard
          title="Suspended Users"
          value={suspendedUser}
          // change={kpiData.suspendedUsers.change}
          // trend={kpiData.suspendedUsers.trend}
          icon={Users}
        />
        <KPICard
          title="Revenue (RR)"
          // value={monthlyAmount}
          value={revenueAgainstTime}
          prefix="€"
          // change={kpiData.mrr.change}
          // trend={kpiData.mrr.trend}
          icon={DollarSign}
        />
        <KPICard
          title="Total Revenue"
          value={totalRevenue}
          prefix="€"
          change={totalRevenue}
          trend={totalRevenue}
          icon={DollarSign}
        />

        <KPICard
          title="New Signups"
          value={signupsAgainstTime}
          // change={kpiData.newSignups.change}
          // trend={kpiData.newSignups.trend}
          icon={TrendingUp}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-left">
        <Card className="bg-white border border-gray-200">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900">
              Revenue Trend
            </CardTitle>
            <p className="text-sm text-gray-600">
              Monthly revenue over the last 6 months
            </p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#1C9B7A"
                  strokeWidth={3}
                  dot={{ fill: "#1C9B7A", strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-white border border-gray-200">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900">
              User Growth
            </CardTitle>
            <p className="text-sm text-gray-600">User registrations by month</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={userChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                  }}
                />
                <Bar dataKey="count" fill="#1C9B7A" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
      {/* Quick Actions */}
      <Card className="bg-white border border-gray-200 text-left">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <button
              onClick={() => handleQuickAction("create-user")}
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-[#1C9B7A] transition-all duration-200 text-left group"
            >
              <Users className="w-8 h-8 text-[#1C9B7A] mb-2 group-hover:scale-110 transition-transform" />
              <h3 className="font-semibold text-gray-900">Create User</h3>
              <p className="text-sm text-gray-600">Add new user account</p>
            </button>
            <button
              onClick={() => handleQuickAction("generate-report")}
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-[#1C9B7A] transition-all duration-200 text-left group"
            >
              <FileText className="w-8 h-8 text-[#1C9B7A] mb-2 group-hover:scale-110 transition-transform" />
              <h3 className="font-semibold text-gray-900">Generate Report</h3>
              <p className="text-sm text-gray-600">Export platform data</p>
            </button>
            <button
              onClick={() => handleQuickAction("payment-link")}
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-[#1C9B7A] transition-all duration-200 text-left group"
            >
              <DollarSign className="w-8 h-8 text-[#1C9B7A] mb-2 group-hover:scale-110 transition-transform" />
              <h3 className="font-semibold text-gray-900">Payment Link</h3>
              <p className="text-sm text-gray-600">Create payment link</p>
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
