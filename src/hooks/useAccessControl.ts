import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const FREE_SETS = 2;

export const useAccessControl = () => {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isPaid, setIsPaid] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setIsAdmin(false);
      setIsPaid(false);
      setLoading(false);
      return;
    }

    const fetchAccess = async () => {
      const [{ data: roles }, { data: sub }] = await Promise.all([
        supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id),
        supabase
          .from("user_subscriptions")
          .select("is_active")
          .eq("user_id", user.id)
          .maybeSingle(),
      ]);

      setIsAdmin(roles?.some((r) => r.role === "admin") ?? false);
      setIsPaid(sub?.is_active ?? false);
      setLoading(false);
    };

    fetchAccess();
  }, [user]);

  const canAccessSet = (setNumber: number) => {
    if (isAdmin || isPaid) return true;
    return setNumber <= FREE_SETS;
  };

  return { isAdmin, isPaid, loading, canAccessSet, FREE_SETS };
};
