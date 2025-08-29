import React, { useEffect, useState } from "react";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  Shield,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { useNavigate } from "react-router-dom";
// import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import logActivity from "@/integrations/supabase/logActivity";
import { useUserContext } from "@/components/UserContext";

type LoginStep = "credentials" | "2fa";

async function getUserLocation() {
  try {
    const res = await fetch("https://ipapi.co/json/");
    const data = await res.json();
    return `${data.city}, ${data.country_name}`;
  } catch (e) {
    return "Unknown";
  }
}

const SuperAdminLogin = () => {
  const [step, setStep] = useState<LoginStep>("credentials");
  const [isTwoStepEnabled, setIsTwoStepEnabled] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [errors, setErrors] = useState({ email: "", password: "", code: "" });
  const navigate = useNavigate();
  const { role, setRole } = useUserContext();
  const [qrCode, setQrCode] = useState(null);

  const fetchTwoStepAuth = async () => {
    try {
      const { data, error } = await supabase
        .from("settings")
        .select("two_factor_auth")
        .single();

      if (error) {
        console.error("Error fetching settings:", error);
        return;
      }

      if (data.two_factor_auth) {
        setIsTwoStepEnabled(true);
        console.log("2 fa on go to otp", data);
        setStep("otp");
      } else {
        setIsTwoStepEnabled(false);
        setStep("credentials");
        console.log("2 fa off go to dashboard");
        navigate("/super-admin");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({ email: "", password: "", code: "" });

    if (!email) {
      setErrors((prev) => ({ ...prev, email: "Email is required" }));
      return;
    }
    if (!password) {
      setErrors((prev) => ({ ...prev, password: "Password is required" }));
      return;
    }

    setIsLoading(true);

    try {
      const { data: authData, error: authError } =
        await supabase.auth.signInWithPassword({ email, password });

      if (authError || !authData?.user) {
        const risk = "high";
        toast.error("Login failed");
        //for getting user location
        const location = await getUserLocation();
        await logActivity({
          userId: null,
          username: "",
          email,
          actionType: "failed_login",
          location,
          risk,
        });
        return;
      }

      const userId = authData.user.id;
      const username = authData.user.user_metadata?.username || "not found";
      const location = await getUserLocation();

      console.log("Authenticated user ID:", userId);

      // Check users table
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("role")
        .eq("user_id", userId)
        .maybeSingle();

      if (userError) {
        console.log("error while fetching role");
      } else {
        console.log("role is ", userData?.role);
        setRole(userData?.role);
        localStorage.setItem("role", userData?.role);
      }

      if (
        userData?.role === "super-admin" ||
        userData?.role === "admin" ||
        userData.role === "staff" ||
        userData?.role === "billing"
      ) {
        await logActivity({
          userId,
          username,
          email,
          actionType: "login",
          location,
          risk: "normal",
        });

        await supabase
          .from("users")
          .update({ last_login: new Date().toISOString() })
          .eq("user_id", userId);

        fetchTwoStepAuth();
        setup2FA();

        // toast.success("Welcome Super Admin!");
        // navigate("/super-admin");
        return;
      }

      // Else check team_mate
      const { data: teamData } = await supabase
        .from("team_mate")
        .select("role")
        .eq("user_id", userId)
        .maybeSingle();

      if (teamData) {
        toast.success(`Welcome ${teamData.role}!`);
        navigate(`/super-admin`);
        return;
      }

      toast.error("User not found in either table.");
    } catch (err) {
      console.error("Unexpected error:", err);
      toast.error("Unexpected Error");
    } finally {
      setIsLoading(false);
    }
  };

  const setup2FA = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    const res = await fetch(
      "https://ajbxscredobhqfksaqrk.supabase.co/functions/v1/setup-2fa",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ userId: user.id, email: user.email }),
      }
    );

    console.log("response from setup 2fa:;", res);

    const { qr } = await res.json();
    setQrCode(qr);
  };

  // const verify2FA = async (token) => {
  //   const {
  //     data: { user },
  //   } = await supabase.auth.getUser();

  //   const res = await fetch("/functions/v1/verify-2fa", {
  //     method: "POST",
  //     headers: { "Content-Type": "application/json" },
  //     body: JSON.stringify({ userId: user.id, token }),
  //   });

  //   const { success } = await res.json();
  //   if (success) {
  //     alert("2FA verified!");
  //     navigate("/dashboard");
  //   } else {
  //     alert("Invalid code");
  //   }
  // };

  const verify2FA = async (token) => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      alert("You must be logged in first!");
      return;
    }

    const res = await fetch(
      `https://ajbxscredobhqfksaqrk.supabase.co/functions/v1/verify-2fa`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ token }),
      }
    );

    const { success } = await res.json();
    if (success) {
      toast.success("2FA verified!");
      localStorage.setItem("role", role);
      navigate("/super-admin");
    } else {
      toast.error("Invalid code");
    }
  };

  const handleTwoFactorSubmit = async () => {
    const code = verificationCode.trim();
    verify2FA(code);
    // console.log("verification code is :", verificationCode);
  };

  const handleResendCode = () => {
    setErrors({ ...errors, code: "" });
    toast.success("A new verification code has been sent to your email");
  };

  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const resetEmail = formData.get("resetEmail") as string;

    if (!resetEmail || !/\S+@\S+\.\S+/.test(resetEmail)) {
      toast.error("Please enter a valid email address");
      return;
    }

    // Simulate password reset
    toast(
      "If this email is registered, you'll receive reset instructions shortly"
    );
    setShowForgotPassword(false);
  };

  if (isTwoStepEnabled) {
    return (
      <div className="min-h-screen flex">
        {/* Left Side - Brand Section */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-green-50 to-green-100 flex-col justify-center items-center p-12 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-green-600/5 to-green-800/10"></div>
          <div className="relative z-10 text-center max-w-md">
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-green-800 mb-2">
                NovaFarm
              </h1>
              <div className="w-16 h-1 bg-green-600 mx-auto rounded-full"></div>
            </div>
            <div className="mb-6">
              <Shield className="w-16 h-16 text-green-600 mx-auto mb-4" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Secure Access Required
            </h2>
            <p className="text-gray-600 leading-relaxed">
              We've sent a verification code to your email to ensure secure
              access to the Super Admin Dashboard.
            </p>
          </div>
        </div>

        {/* Right Side - 2FA Form */}
        <div className="flex-1 flex flex-col justify-center px-8 sm:px-12 lg:px-16 xl:px-20 bg-white">
          <div className="w-full max-w-md mx-auto">
            {/* Mobile Logo */}
            <div className="lg:hidden text-center mb-8">
              <h1 className="text-3xl font-bold text-green-800 mb-2">
                NovaFarm
              </h1>
              <div className="w-12 h-1 bg-green-600 mx-auto rounded-full"></div>
            </div>

            <div className="mb-8">
              {qrCode && (
                <div>
                  <p>Scan this QR code in Google Authenticator:</p>
                  <img src={qrCode} alt="2FA QR Code" />
                </div>
              )}
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Enter Verification Code
              </h2>
              <div className="flex items-center space-x-2 text-gray-600">
                <Mail className="w-4 h-4" />
                <p>We've sent a 6-digit code to {email}</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 text-center">
                  Enter the 6-digit verification code
                </label>
                <div className="flex justify-center">
                  <InputOTP
                    maxLength={6}
                    value={verificationCode}
                    onChange={(value) => {
                      setVerificationCode(value);
                      setErrors({ ...errors, code: "" });
                    }}
                  >
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                </div>
                {errors.code && (
                  <p className="text-sm text-red-600 text-center mt-2">
                    {errors.code}
                  </p>
                )}
              </div>

              <Button
                onClick={handleTwoFactorSubmit}
                disabled={verificationCode.length !== 6 || isLoading}
                className="w-full h-12 bg-green-600 hover:bg-green-700 text-white font-semibold text-base"
              >
                {isLoading ? "Verifying..." : "Verify & Access Dashboard"}
              </Button>

              <div className="text-center space-y-4">
                <button
                  onClick={handleResendCode}
                  className="text-sm text-green-600 hover:text-green-700 font-medium"
                >
                  Didn't receive the code? Resend it
                </button>

                <button
                  onClick={() => setStep("credentials")}
                  className="flex items-center justify-center space-x-2 text-sm text-gray-600 hover:text-gray-800 mx-auto"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Login</span>
                </button>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200 text-center">
              <p className="text-xs text-gray-500">
                © 2025 NovaFarm Super Admin. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Brand Section */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-green-50 to-green-100 flex-col justify-center items-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-green-600/5 to-green-800/10"></div>
        <div className="relative z-10 text-center max-w-md">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-green-800 mb-2">NovaFarm</h1>
            <div className="w-16 h-1 bg-green-600 mx-auto rounded-full"></div>
          </div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Super Admin Access
          </h2>
          <p className="text-gray-600 leading-relaxed">
            Secure administrative portal for managing NovaFarm operations, user
            accounts, and system settings.
          </p>
          <div className="mt-8 space-y-3 text-sm text-gray-500">
            <div className="flex items-center justify-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Multi-Factor Authentication</span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Encrypted Data Access</span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Audit Trail Logging</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex flex-col justify-center px-8 sm:px-12 lg:px-16 xl:px-20 bg-white">
        <div className="w-full max-w-md mx-auto">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <h1 className="text-3xl font-bold text-green-800 mb-2">NovaFarm</h1>
            <div className="w-12 h-1 bg-green-600 mx-auto rounded-full"></div>
          </div>

          <div className="mb-8 text-left">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Admin Login
            </h2>
            <p className="text-gray-600">Access the Super Admin Dashboard</p>
          </div>

          <form onSubmit={handleCredentialsSubmit} className="space-y-6">
            <div className="space-y-2 text-left">
              <Label
                htmlFor="email"
                className="text-sm font-medium text-gray-700"
              >
                Email Address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`pl-10 h-12 border-gray-300 focus:border-green-500 focus:ring-green-500 ${
                    errors.email ? "border-red-500" : ""
                  }`}
                  placeholder="Enter your admin email"
                />
              </div>
              {errors.email && (
                <p className="text-sm text-red-600 mt-1">{errors.email}</p>
              )}
            </div>

            <div className="space-y-2 text-left">
              <Label
                htmlFor="password"
                className="text-sm font-medium text-gray-700"
              >
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`pl-10 pr-12 h-12 border-gray-300 focus:border-green-500 focus:ring-green-500 ${
                    errors.password ? "border-red-500" : ""
                  }`}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-red-600 mt-1">{errors.password}</p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="remember"
                  checked={rememberMe}
                  onCheckedChange={(checked) =>
                    setRememberMe(checked as boolean)
                  }
                />
                <Label htmlFor="remember" className="text-sm text-gray-600">
                  Remember me for 60 days
                </Label>
              </div>
              <button
                type="button"
                onClick={() => setShowForgotPassword(true)}
                className="text-sm text-green-600 hover:text-green-700 font-medium"
              >
                Forgot password?
              </button>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-green-600 hover:bg-green-700 text-white font-semibold text-base group transition-all duration-200"
            >
              {isLoading ? "Authenticating..." : "Continue to Verification"}
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-200 text-center">
            <p className="text-xs text-gray-500 mb-2">
              Restricted Access • Admin Personnel Only
            </p>
            <p className="text-xs text-gray-500">
              © 2025 NovaFarm Super Admin. All rights reserved.
            </p>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Reset Password</h3>
            <form onSubmit={handleForgotPassword}>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="resetEmail">Email Address</Label>
                  <Input
                    id="resetEmail"
                    name="resetEmail"
                    type="email"
                    placeholder="Enter your email address"
                    className="mt-1"
                  />
                </div>
                <div className="flex space-x-3">
                  <Button
                    type="submit"
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    Send Reset Link
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowForgotPassword(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuperAdminLogin;
