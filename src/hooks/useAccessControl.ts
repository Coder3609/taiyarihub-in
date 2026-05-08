import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const FREE_SETS = 2;
const BUNDLE_PLANS = ["central", "central_full", "school", "school_full"];

export const useAccessControl = () => {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [plans, setPlans] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const isPaid = plans.length > 0;
  const hasBundle = plans.some((p) => BUNDLE_PLANS.includes(p));

  useEffect(() => {
    if (!user) {
      setIsAdmin(false);
      setPlans([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    const fetchAccess = async () => {
      const [{ data: roles }, { data: subs }] = await Promise.all([
        supabase.from("user_roles").select("role").eq("user_id", user.id),
        supabase
          .from("user_subscriptions")
          .select("plan_type, is_active")
          .eq("user_id", user.id)
          .eq("is_active", true),
      ]);

      setIsAdmin(roles?.some((r) => r.role === "admin") ?? false);
      setPlans((subs ?? []).map((s: any) => s.plan_type));
      setLoading(false);
    };

    fetchAccess();
  }, [user]);

  const hasExamAccess = (examSlug?: string) => {
    if (isAdmin || hasBundle) return true;
    if (examSlug && plans.includes(`single:${examSlug}`)) return true;
    return false;
  };

  const canAccessSet = (setNumber: number, examSlug?: string) => {
    if (hasExamAccess(examSlug)) return true;
    return setNumber <= FREE_SETS;
  };

  return { isAdmin, isPaid, hasBundle, plans, loading, canAccessSet, hasExamAccess, FREE_SETS };
};
