// import { ReactNode, useEffect, useState } from "react";
// import { Navigate } from "react-router-dom";
// import { supabase } from "@/integrations/supabase/client";
// import Spinner from "./Spinner";

// interface ProtectedRouteProps {
//   children: ReactNode;
// }

// const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
//   const [loading, setLoading] = useState(true);
//   const [isAuthenticated, setIsAuthenticated] = useState(false);
//   const [role, setRole] = useState<string | null>(null);

//   // 🔹 First effect: wait 2s then load role
//   useEffect(() => {
//     const timer = setTimeout(() => {
//       const storedRole = localStorage.getItem("role");
//       setRole(storedRole);
//       console.log("First useEffect finished, role set:", storedRole);
//     }, 2000);

//     return () => clearTimeout(timer);
//   }, []);

//   useEffect(() => {
//     const checkUser = async () => {
//       if (!role) return;

//       const {
//         data: { session },
//         error,
//       } = await supabase.auth.getSession();

//       console.log("role from state in protected route:", role);

//       if (session && !error && role === "user") {
//         setIsAuthenticated(true);
//       } else {
//         setIsAuthenticated(false);
//       }

//       setLoading(false);
//     };

//     checkUser();
//   }, [role]);

//   if (loading) {
//     return <Spinner />;
//   }

//   return isAuthenticated ? <>{children}</> : <Navigate to="/" replace />;
// };

// export default ProtectedRoute;

/////////////
import { ReactNode, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Spinner from "./Spinner";

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const storedRole = localStorage.getItem("role");
        const { data, error } = await supabase.auth.getSession();

        const session = data?.session;
        console.log("Stored Role:", storedRole);
        console.log("Supabase Session:", session);

        // check: must have session + correct role
        if (session && storedRole === "user" && !error) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      } catch (err) {
        console.error("Error checking auth:", err);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();

    // Listen for login/logout changes
    const { data: listener } = supabase.auth.onAuthStateChange(() => {
      checkAuth();
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  if (loading) return <Spinner />;

  // Redirect if not authenticated
  if (!isAuthenticated) {
    console.log("❌ Not authenticated → redirecting to /");
    return <Navigate to="/" replace />;
  }

  // If authenticated, show child route
  return <>{children}</>;
};

export default ProtectedRoute;
