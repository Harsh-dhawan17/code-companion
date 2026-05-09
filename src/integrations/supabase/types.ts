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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      achievements: {
        Row: {
          created_at: string
          criteria: Json
          description: string
          icon: string
          id: string
          key: string
          name: string
          tier: string
          xp_reward: number
        }
        Insert: {
          created_at?: string
          criteria?: Json
          description: string
          icon?: string
          id?: string
          key: string
          name: string
          tier?: string
          xp_reward?: number
        }
        Update: {
          created_at?: string
          criteria?: Json
          description?: string
          icon?: string
          id?: string
          key?: string
          name?: string
          tier?: string
          xp_reward?: number
        }
        Relationships: []
      }
      bookmarks: {
        Row: {
          created_at: string
          id: string
          problem_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          problem_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          problem_id?: string
          user_id?: string
        }
        Relationships: []
      }
      daily_challenges: {
        Row: {
          challenge_date: string
          created_at: string
          problem_id: string
        }
        Insert: {
          challenge_date: string
          created_at?: string
          problem_id: string
        }
        Update: {
          challenge_date?: string
          created_at?: string
          problem_id?: string
        }
        Relationships: []
      }
      editorials: {
        Row: {
          approach: string
          complexity: string
          created_at: string
          id: string
          intuition: string
          problem_id: string
          solutions: Json
        }
        Insert: {
          approach: string
          complexity: string
          created_at?: string
          id?: string
          intuition: string
          problem_id: string
          solutions?: Json
        }
        Update: {
          approach?: string
          complexity?: string
          created_at?: string
          id?: string
          intuition?: string
          problem_id?: string
          solutions?: Json
        }
        Relationships: []
      }
      problems: {
        Row: {
          acceptance: number | null
          companies: string[]
          constraints: string[]
          created_at: string
          description: string
          difficulty: Database["public"]["Enums"]["difficulty_level"]
          examples: Json
          function_name: string | null
          hints: string[]
          id: string
          number: number
          slug: string
          starter_code: Json
          test_cases: Json
          title: string
          topics: string[]
          youtube_query: string | null
        }
        Insert: {
          acceptance?: number | null
          companies?: string[]
          constraints?: string[]
          created_at?: string
          description: string
          difficulty: Database["public"]["Enums"]["difficulty_level"]
          examples?: Json
          function_name?: string | null
          hints?: string[]
          id?: string
          number: number
          slug: string
          starter_code?: Json
          test_cases?: Json
          title: string
          topics?: string[]
          youtube_query?: string | null
        }
        Update: {
          acceptance?: number | null
          companies?: string[]
          constraints?: string[]
          created_at?: string
          description?: string
          difficulty?: Database["public"]["Enums"]["difficulty_level"]
          examples?: Json
          function_name?: string | null
          hints?: string[]
          id?: string
          number?: number
          slug?: string
          starter_code?: Json
          test_cases?: Json
          title?: string
          topics?: string[]
          youtube_query?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          current_streak: number
          full_name: string | null
          id: string
          last_solved_date: string | null
          longest_streak: number
          updated_at: string
          username: string | null
          xp: number
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          current_streak?: number
          full_name?: string | null
          id: string
          last_solved_date?: string | null
          longest_streak?: number
          updated_at?: string
          username?: string | null
          xp?: number
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          current_streak?: number
          full_name?: string | null
          id?: string
          last_solved_date?: string | null
          longest_streak?: number
          updated_at?: string
          username?: string | null
          xp?: number
        }
        Relationships: []
      }
      submissions: {
        Row: {
          code: string
          created_at: string
          error_message: string | null
          id: string
          language: string
          memory_kb: number | null
          passed_count: number | null
          problem_id: string
          runtime_ms: number | null
          status: Database["public"]["Enums"]["submission_status"]
          total_count: number | null
          user_id: string
        }
        Insert: {
          code: string
          created_at?: string
          error_message?: string | null
          id?: string
          language: string
          memory_kb?: number | null
          passed_count?: number | null
          problem_id: string
          runtime_ms?: number | null
          status: Database["public"]["Enums"]["submission_status"]
          total_count?: number | null
          user_id: string
        }
        Update: {
          code?: string
          created_at?: string
          error_message?: string | null
          id?: string
          language?: string
          memory_kb?: number | null
          passed_count?: number | null
          problem_id?: string
          runtime_ms?: number | null
          status?: Database["public"]["Enums"]["submission_status"]
          total_count?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "submissions_problem_id_fkey"
            columns: ["problem_id"]
            isOneToOne: false
            referencedRelation: "problems"
            referencedColumns: ["id"]
          },
        ]
      }
      user_achievements: {
        Row: {
          achievement_id: string
          id: string
          unlocked_at: string
          user_id: string
        }
        Insert: {
          achievement_id: string
          id?: string
          unlocked_at?: string
          user_id: string
        }
        Update: {
          achievement_id?: string
          id?: string
          unlocked_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_achievements_achievement_id_fkey"
            columns: ["achievement_id"]
            isOneToOne: false
            referencedRelation: "achievements"
            referencedColumns: ["id"]
          },
        ]
      }
      user_progress: {
        Row: {
          id: string
          notes: string | null
          problem_id: string
          solved_at: string
          user_id: string
        }
        Insert: {
          id?: string
          notes?: string | null
          problem_id: string
          solved_at?: string
          user_id: string
        }
        Update: {
          id?: string
          notes?: string | null
          problem_id?: string
          solved_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_progress_problem_id_fkey"
            columns: ["problem_id"]
            isOneToOne: false
            referencedRelation: "problems"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      difficulty_level: "Easy" | "Medium" | "Hard"
      submission_status:
        | "Accepted"
        | "Wrong Answer"
        | "Runtime Error"
        | "Time Limit Exceeded"
        | "Compilation Error"
        | "Pending"
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
      difficulty_level: ["Easy", "Medium", "Hard"],
      submission_status: [
        "Accepted",
        "Wrong Answer",
        "Runtime Error",
        "Time Limit Exceeded",
        "Compilation Error",
        "Pending",
      ],
    },
  },
} as const
