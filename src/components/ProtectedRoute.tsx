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
//       const {
//         data: { session },
//         error,
//       } = await supabase.auth.getSession();

//       // const role = localStorage.getItem("role");

//       if (!role) {
//         console.log("loading");
//       }

//       console.log("role is from protected route : ", role);

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
  const [role, setRole] = useState<string | null>(null);

  // 🔹 First effect: wait 2s then load role
  useEffect(() => {
    const timer = setTimeout(() => {
      const storedRole = localStorage.getItem("role");
      setRole(storedRole);
      console.log("First useEffect finished, role set:", storedRole);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  // 🔹 Second effect: only runs AFTER role is set
  useEffect(() => {
    const checkUser = async () => {
      if (!role) return; // wait until role is set

      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      console.log("role from state in protected route:", role);

      if (session && !error && role === "user") {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }

      setLoading(false);
    };

    checkUser();
  }, [role]);

  if (loading) {
    return <Spinner />;
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/" replace />;
};

export default ProtectedRoute;
