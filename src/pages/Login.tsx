import React, { useState } from "react";
import { Eye, EyeOff, Mail, Lock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
// import { logActivity } from "@/integrations/supabase/activity";
import logActivity from "@/integrations/supabase/logActivity";

const Login = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [twoStepEnabled, setTwoStepEnabled] = useState();
  const [myToken, setMyToken] = useState("");
  const [myUUID, setMyUUID] = useState("");

  const [step, setStep] = useState("login");
  const [otp, setOtp] = useState("");
  // const handleSubmit = async (e: React.FormEvent) => {
  //   e.preventDefault();
  //   const newErrors = { email: "", password: "" };

  //   if (!email) {
  //     newErrors.email = "Email is required";
  //   } else if (!/\S+@\S+\.\S+/.test(email)) {
  //     newErrors.email = "Please enter a valid email";
  //   }

  //   if (!password) {
  //     newErrors.password = "Password is required";
  //   } else if (password.length < 6) {
  //     newErrors.password = "Password must be at least 6 characters";
  //   }
  //   setErrors(newErrors);
  //   if (newErrors.email || newErrors.password) return;

  //   try {
  //     setLoading(true);
  //     const { data: loginData, error: loginError } =
  //       await supabase.auth.signInWithPassword({
  //         email,
  //         password,
  //       });

  //     // Default values
  //     let actionType = "login";
  //     let user_id = null;

  //     if (loginData?.user) {
  //       const { data: userData, error: userFetchError } = await supabase
  //         .from("users")
  //         .select("firstName,lastName")
  //         .eq("email", userEmail)
  //         .single();

  //       user_id = loginData.user.id;
  //       const userEmail = loginData.user.email;

  //       const username = `${userData.firstName} ${userData.lastName}`;
  //       const userId = userData.id;
  //       await logActivity({
  //         userId,
  //         username,
  //         email: userEmail,
  //         actionType: "login",
  //         location: "dashboard",
  //         risk: "low",
  //       });

  //       toast.success("Welcome back!");
  //       // console.log("User logged in:", loginData.user);

  //       await supabase
  //         .from("users")
  //         .update({ last_login: new Date().toISOString() })
  //         .eq("email", userEmail);

  //       navigate("/dashboard");
  //       return;
  //     }

  //     // Handle failed login
  //     if (loginError) {
  //       actionType = "failed";

  //       // Optional: try to fetch user_id from users table
  //       const { data: userRow } = await supabase
  //         .from("users")
  //         .select("user_id")
  //         .eq("email", email)
  //         .maybeSingle();

  //       if (userRow) {
  //         user_id = userRow.user_id;
  //       }

  //       await logActivity(user_id, email, actionType);
  //       alert(loginError.message);
  //     }
  //   } catch (err) {
  //     alert("Unexpected error. Please try again.");
  //     console.error(err);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  function getFormattedDateTime() {
    const now = new Date();

    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");

    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");

    return `${year}-${month}-${day} ${hours}:${minutes}`;
  }

  const updateLastLogin = async (userId: string) => {
    const formattedDateTime = getFormattedDateTime();

    const { error } = await supabase
      .from("users")
      .update({ last_login: formattedDateTime })
      .eq("user_id", userId);

    if (error) {
      console.error("Failed to update lastLogin:", error.message);
      return false;
    }

    console.log(`lastLogin updated for user ${userId}: ${formattedDateTime}`);
    return true;
  };

  const fetchTwostep = async (user_id) => {
    setLoading(true);
    const { data, error } = await supabase
      .from("users")
      .select("two_step_verification")
      .eq("user_id", user_id)
      .single();

    if (error) {
      console.error("Error fetching two_step_verification:", error.message);
    } else {
      console.log("Two step_varifiaction: ", data?.two_step_verification);
      setTwoStepEnabled(data?.two_step_verification);
    }
    setLoading(false);
    return data?.two_step_verification;
  };

  const getUserRole = async (uuid) => {
    const { data, error } = await supabase
      .from("users")
      .select("role")
      .eq("user_id", uuid)
      .single();
    if (error) {
      console.error("Error fetching user role:", error.message);
    } else {
      localStorage.setItem("role", data.role);
      const userRole = localStorage.getItem("role");
      return userRole;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors = { email: "", password: "" };
    if (!email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Please enter a valid email";
    }
    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    setErrors(newErrors);
    if (newErrors.email || newErrors.password) return;

    try {
      setLoading(true);

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.log("Error while Login ", error.message);
        toast.error(error.message);
        setLoading(false);
        return;
      }

      const token = data.session?.access_token;
      const uuid = data.user?.id;
      const emailFromUser = data.user?.email;

      console.log("Login successful → UUID:", uuid);

      getUserRole(uuid);

      const twoStep = await fetchTwostep(uuid);
      console.log("Two-step verification status:", twoStep);

      if (twoStep) {
        // Step 4a: Send OTP if enabled
        const { error: otpError } = await supabase.auth.signInWithOtp({
          email: emailFromUser,
          options: {
            emailRedirectTo: "http://localhost:8080/auth-listener",
          },
        });

        if (otpError) {
          toast.error(otpError.message);
          console.log("OTP Error:", otpError.message);
        } else {
          setStep("success");
          toast.success("Verification link sent to your email");
        }
      } else {
        // Step 4b: Direct login if disabled
        localStorage.setItem("token", token!);
        localStorage.setItem("id", uuid!);

        updateLastLogin(uuid);

        toast.success("Login Successfully");
        navigate("/dashboard");
      }

      setLoading(false);
    } catch (err) {
      console.log("Error while login:", err);
      toast.error("Something went wrong!");
      setLoading(false);
    }
  };

  // const handleSubmit = async (e: React.FormEvent) => {
  //   e.preventDefault();
  //   const newErrors = { email: "", password: "" };
  //   if (!email) {
  //     newErrors.email = "Email is required";
  //   } else if (!/\S+@\S+\.\S+/.test(email)) {
  //     newErrors.email = "Please enter a valid email";
  //   }
  //   if (!password) {
  //     newErrors.password = "Password is required";
  //   } else if (password.length < 6) {
  //     newErrors.password = "Password must be at least 6 characters";
  //   }
  //   setErrors(newErrors);
  //   if (newErrors.email || newErrors.password) return;

  //   try {
  //     const { data, error } = await supabase.auth.signInWithPassword({
  //       email,
  //       password,
  //     });

  //     if (error) {
  //       console.log("Error while Login ", error.message);
  //       toast.error(error.message);
  //       return;
  //     } else {
  //       await supabase.auth.signOut();
  //       console.log("Data from login: ", data);
  //       const token = data.session.access_token;
  //       const uuid = data.user.id;
  //       console.log("UUID is :", uuid);

  //       const email = data.user.email;
  //       getUserRole(uuid);
  //       const twoStep = await fetchTwostep(uuid);

  //       console.log("To check two step verfication ::", twoStep);

  //       const { error: otpError } = await supabase.auth.signInWithOtp({
  //         email,
  //         options: {
  //           emailRedirectTo: "http://localhost:8080/auth-listener",
  //         },
  //       });
  //       setLoading(false);

  //       if (otpError) {
  //         toast.error(otpError.message);
  //         console.log("Error of optError: ", otpError.message);
  //         return;
  //       } else {
  //         setStep("success");
  //         toast.success("Link Send to Registered Email Address");

  //         setLoading(false);
  //       }
  //     }
  //   } catch (error) {
  //     console.log("Error while sending emial: ", error);
  //   }
  // };

  //       localStorage.setItem("token", token);
  //       localStorage.setItem("id", uuid);
  //       // const role = localStorage.getItem("role");
  //       // console.log("Role From login: ", role);

  //       toast.success("Login Successfully");
  //       navigate("/dashboard");
  //     }
  // };

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-green-50 to-green-100 flex-col justify-center items-center p-12 relative overflow-hidden ">
        <div className="absolute inset-0 bg-gradient-to-br from-green-600/5 to-green-800/10"></div>
        <div className="relative z-10 text-center max-w-md">
          <div className="mb-8 ">
            <h1 className="text-4xl font-bold text-green-800 mb-2">NovaFarm</h1>
            <div className="w-16 h-1 bg-green-600 mx-auto rounded-full"></div>
          </div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Welcome Back
          </h2>
          <p className="text-gray-600 leading-relaxed">
            The smart appointment system for modern pharmacies. Sign in to
            access your dashboard and manage your practice efficiently.
          </p>
          <div className="mt-8 space-y-3 text-sm text-gray-500">
            <div className="flex items-center justify-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>AI-Powered Scheduling</span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Automated Reminders</span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Secure Patient Management</span>
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Sign In</h1>
            <p className="text-gray-600">Access your NovaFarm dashboard</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
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
                  placeholder="Enter your email"
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
                  Remember me
                </Label>
              </div>
              <Link
                to="/forgot-password"
                className="text-sm text-green-600 hover:text-green-700 font-medium"
              >
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-green-600 hover:bg-green-700 text-white font-semibold text-base group transition-all duration-200"
            >
              {loading ? "Processing..." : "Sign In"}
              {!loading && (
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              )}
            </Button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-gray-600">
              Don't have an account?{" "}
              <Link
                to="/book-demo"
                className="text-green-600 hover:text-green-700 font-semibold"
              >
                Request access here
              </Link>
            </p>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200 text-center">
            <p className="text-xs text-gray-500">
              © 2025 NovaFarm. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
