import React, { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

const AuthListener: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handlePostMagicLinkLogin = async () => {
      const { data } = await supabase.auth.getSession();

      if (data.session) {
        const token = data.session.access_token;
        const uuid = data.session.user.id;

        localStorage.setItem("token", token);
        localStorage.setItem("id", uuid);

        // Fetch role from your table
        const { data: profile, error } = await supabase
          .from("users")
          .select("role")
          .eq("user_id", uuid)
          .single();

        if (!error && profile?.role) {
          localStorage.setItem("role", profile.role);
        }

        navigate("/dashboard");
      } else {
        navigate("/login");
      }
    };

    handlePostMagicLinkLogin();
  }, [navigate]);

  return <div>Verifying your login...</div>;
};

export default AuthListener;
