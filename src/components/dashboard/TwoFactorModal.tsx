import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Mail, Shield, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface TwoFactorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (code: string) => void;
  isLoading: boolean;
  mode: "enable" | "disable";
}

export const TwoFactorModal: React.FC<TwoFactorModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isLoading,
  mode,
}) => {
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"email" | "verify">("email");
  const [userEmail, setUserEmail] = useState("");
  const [otpsend, setOtpSend] = useState(false);

  useEffect(() => {
    const getUserEmail = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user?.email) {
        setUserEmail(user?.email);
      } else {
        toast.error("Problem fetching email from Supabase Auth");
      }
    };
    getUserEmail();
  }, []);

  const sendOtp = async () => {
    if (!userEmail) {
      toast.error("Not find Email");
      return;
    }

    const { error } = await supabase.auth.signInWithOtp({
      email: userEmail,
      options: {
        shouldCreateUser: false,
        emailOtpType: "email", // 👈 forces Supabase to send a 6-digit code
      },
    });

    if (error) {
      setOtpSend(false);
      toast.error("Error while Sending Otp: ", error.message);
    } else {
      setOtpSend(true);
    }
  };

  const handleSendCode = () => {
    // Simulate sending email
    sendOtp();
    setStep("verify");
  };

  const handleVerifyCode = () => {
    if (code.length === 6) {
      onConfirm(code);
    }
  };

  const resetModal = () => {
    setStep("email");
    setCode("");
    onClose();
  };

  if (mode === "disable") {
    return (
      <Dialog open={isOpen} onOpenChange={resetModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Shield className="w-5 h-5 text-red-600" />
              <span>Disable Two-Factor Authentication</span>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <p className="text-gray-600">
              Are you sure you want to turn off two-factor authentication? This
              will make your account less secure.
            </p>

            <div className="flex space-x-3">
              <Button
                onClick={() => onConfirm("")}
                disabled={isLoading}
                variant="destructive"
                className="flex-1"
              >
                {isLoading ? "Disabling..." : "Yes, Disable 2FA"}
              </Button>
              <Button onClick={resetModal} variant="outline" className="flex-1">
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={resetModal}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Shield className="w-5 h-5 text-green-600" />
            <span>Enable Two-Factor Authentication</span>
          </DialogTitle>
        </DialogHeader>

        {step === "email" && (
          <div className="space-y-4">
            <div className="flex items-center space-x-3 p-4 bg-green-50 rounded-lg">
              <Mail className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-green-800">
                  We'll send a verification code to your email
                </p>
                <p className="text-xs text-green-600">
                  Check your inbox and enter the 6-digit code
                </p>
              </div>
            </div>

            <div className="flex space-x-3">
              <Button
                onClick={handleSendCode}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                Send Verification Code
              </Button>
              <Button onClick={resetModal} variant="outline" className="flex-1">
                Cancel
              </Button>
            </div>
          </div>
        )}

        {step === "verify" && (
          <div className="space-y-4">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-4">
                Enter the 6-digit code sent to your email
              </p>

              <div className="flex justify-center mb-4">
                <InputOTP
                  maxLength={6}
                  value={code}
                  onChange={(value) => setCode(value)}
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
            </div>

            <div className="flex space-x-3">
              <Button
                onClick={handleVerifyCode}
                disabled={code.length !== 6 || isLoading}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                {isLoading ? "Verifying..." : "Verify & Enable 2FA"}
              </Button>
              <Button
                onClick={() => setStep("email")}
                variant="outline"
                className="flex-1"
              >
                Back
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
