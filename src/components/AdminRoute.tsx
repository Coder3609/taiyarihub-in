import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useAccessControl } from "@/hooks/useAccessControl";
import { Loader2 } from "lucide-react";

/**
 * Wraps admin-only routes.
 * Redirects to / if user is not an admin.
 * Uses server-side role check via user_roles table + has_role() security definer.
 */
const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: accessLoading } = useAccessControl();

  if (authLoading || accessLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default AdminRoute;
