export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      announcements: {
        Row: {
          content: string
          created_at: string
          exam_category: string | null
          id: string
          is_active: boolean
          published_at: string
          title: string
        }
        Insert: {
          content: string
          created_at?: string
          exam_category?: string | null
          id?: string
          is_active?: boolean
          published_at?: string
          title: string
        }
        Update: {
          content?: string
          created_at?: string
          exam_category?: string | null
          id?: string
          is_active?: boolean
          published_at?: string
          title?: string
        }
        Relationships: []
      }
      exam_set_names: {
        Row: {
          created_at: string
          display_name: string
          exam_id: string
          id: string
          section_type: string
          set_number: number
        }
        Insert: {
          created_at?: string
          display_name: string
          exam_id: string
          id?: string
          section_type?: string
          set_number?: number
        }
        Update: {
          created_at?: string
          display_name?: string
          exam_id?: string
          id?: string
          section_type?: string
          set_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "exam_set_names_exam_id_fkey"
            columns: ["exam_id"]
            isOneToOne: false
            referencedRelation: "exams"
            referencedColumns: ["id"]
          },
        ]
      }
      exams: {
        Row: {
          category: string
          created_at: string
          description: string | null
          duration_minutes: number
          id: string
          name: string
          slug: string
          total_questions: number
        }
        Insert: {
          category?: string
          created_at?: string
          description?: string | null
          duration_minutes?: number
          id?: string
          name: string
          slug: string
          total_questions?: number
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          duration_minutes?: number
          id?: string
          name?: string
          slug?: string
          total_questions?: number
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          gender: string | null
          id: string
          preparing_for: string[] | null
          profile_completed: boolean
          updated_at: string
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          gender?: string | null
          id: string
          preparing_for?: string[] | null
          profile_completed?: boolean
          updated_at?: string
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          gender?: string | null
          id?: string
          preparing_for?: string[] | null
          profile_completed?: boolean
          updated_at?: string
          username?: string | null
        }
        Relationships: []
      }
      questions: {
        Row: {
          correct_answer: string
          created_at: string
          exam_id: string
          explanation: string | null
          explanation_hi: string | null
          id: string
          option_a: string
          option_a_hi: string | null
          option_b: string
          option_b_hi: string | null
          option_c: string
          option_c_hi: string | null
          option_d: string
          option_d_hi: string | null
          question_category: string
          question_number: number
          question_text: string
          question_text_hi: string | null
          question_type: string
          set_number: number
          source_label: string | null
        }
        Insert: {
          correct_answer: string
          created_at?: string
          exam_id: string
          explanation?: string | null
          explanation_hi?: string | null
          id?: string
          option_a: string
          option_a_hi?: string | null
          option_b: string
          option_b_hi?: string | null
          option_c: string
          option_c_hi?: string | null
          option_d: string
          option_d_hi?: string | null
          question_category?: string
          question_number?: number
          question_text: string
          question_text_hi?: string | null
          question_type?: string
          set_number?: number
          source_label?: string | null
        }
        Update: {
          correct_answer?: string
          created_at?: string
          exam_id?: string
          explanation?: string | null
          explanation_hi?: string | null
          id?: string
          option_a?: string
          option_a_hi?: string | null
          option_b?: string
          option_b_hi?: string | null
          option_c?: string
          option_c_hi?: string | null
          option_d?: string
          option_d_hi?: string | null
          question_category?: string
          question_number?: number
          question_text?: string
          question_text_hi?: string | null
          question_type?: string
          set_number?: number
          source_label?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "questions_exam_id_fkey"
            columns: ["exam_id"]
            isOneToOne: false
            referencedRelation: "exams"
            referencedColumns: ["id"]
          },
        ]
      }
      user_results: {
        Row: {
          answers: Json
          correct_count: number
          created_at: string
          exam_id: string
          id: string
          incorrect_count: number
          score: number
          section_type: string
          set_number: number
          tab_switches: number
          time_taken_seconds: number
          total: number
          unanswered_count: number
          user_id: string
        }
        Insert: {
          answers?: Json
          correct_count?: number
          created_at?: string
          exam_id: string
          id?: string
          incorrect_count?: number
          score?: number
          section_type?: string
          set_number?: number
          tab_switches?: number
          time_taken_seconds?: number
          total?: number
          unanswered_count?: number
          user_id: string
        }
        Update: {
          answers?: Json
          correct_count?: number
          created_at?: string
          exam_id?: string
          id?: string
          incorrect_count?: number
          score?: number
          section_type?: string
          set_number?: number
          tab_switches?: number
          time_taken_seconds?: number
          total?: number
          unanswered_count?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_results_exam_id_fkey"
            columns: ["exam_id"]
            isOneToOne: false
            referencedRelation: "exams"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_subscriptions: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          plan_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          plan_type?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          plan_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
