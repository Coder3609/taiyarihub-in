import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const PLAN_PRICES: Record<string, { amount: number; label: string }> = {
  central: { amount: 69900, label: "Central Exams Bundle" },
  school: { amount: 59900, label: "School & Entrance Bundle" },
  central_full: { amount: 99900, label: "Central Exams Bundle" },
  school_full: { amount: 99900, label: "School & Entrance Bundle" },
};

// Single-exam pricing (smaller price)
const SINGLE_EXAM_OFFER = 14900; // ₹149
const SINGLE_EXAM_FULL = 19900;  // ₹199

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = user.id;
    const userEmail = user.email;

    const { plan_type } = await req.json();

    let plan: { amount: number; label: string } | undefined = PLAN_PRICES[plan_type];

    // Handle single-exam plans: format "single:<exam-slug>" or "single_full:<exam-slug>"
    if (!plan && typeof plan_type === "string") {
      if (plan_type.startsWith("single:")) {
        plan = { amount: SINGLE_EXAM_OFFER, label: `Single Exam: ${plan_type.slice(7)}` };
      } else if (plan_type.startsWith("single_full:")) {
        plan = { amount: SINGLE_EXAM_FULL, label: `Single Exam: ${plan_type.slice(12)}` };
      }
    }

    if (!plan) {
      return new Response(JSON.stringify({ error: "Invalid plan" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const keyId = Deno.env.get("RAZORPAY_KEY_ID")!;
    const keySecret = Deno.env.get("RAZORPAY_KEY_SECRET")!;

    const orderRes = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Basic " + btoa(`${keyId}:${keySecret}`),
      },
      body: JSON.stringify({
        amount: plan.amount,
        currency: "INR",
        receipt: `${plan_type}_${userId.slice(0, 8)}_${Date.now()}`,
        notes: {
          plan_type,
          user_id: userId,
          user_email: userEmail,
        },
      }),
    });

    if (!orderRes.ok) {
      const err = await orderRes.text();
      console.error("Razorpay order error:", err);
      return new Response(JSON.stringify({ error: "Failed to create order" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const order = await orderRes.json();

    return new Response(
      JSON.stringify({
        order_id: order.id,
        amount: order.amount,
        currency: order.currency,
        key_id: keyId,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("Error:", e);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
