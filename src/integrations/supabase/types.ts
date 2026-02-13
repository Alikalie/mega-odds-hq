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
          created_at: string
          description: string
          id: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      app_information: {
        Row: {
          content: string
          id: string
          title: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          content?: string
          id?: string
          title?: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          content?: string
          id?: string
          title?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      free_tips: {
        Row: {
          away_team: string
          category: string
          created_at: string
          home_team: string
          id: string
          league: string
          match_time: string
          odds: string
          prediction: string
          status: Database["public"]["Enums"]["tip_status"]
          updated_at: string
        }
        Insert: {
          away_team: string
          category: string
          created_at?: string
          home_team: string
          id?: string
          league: string
          match_time: string
          odds: string
          prediction: string
          status?: Database["public"]["Enums"]["tip_status"]
          updated_at?: string
        }
        Update: {
          away_team?: string
          category?: string
          created_at?: string
          home_team?: string
          id?: string
          league?: string
          match_time?: string
          odds?: string
          prediction?: string
          status?: Database["public"]["Enums"]["tip_status"]
          updated_at?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string | null
          id: string
          is_read: boolean | null
          message: string
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      payment_methods: {
        Row: {
          account_name: string | null
          account_number: string
          country_code: string | null
          created_at: string | null
          display_order: number | null
          icon: string | null
          id: string
          is_active: boolean | null
          name: string
          updated_at: string | null
        }
        Insert: {
          account_name?: string | null
          account_number: string
          country_code?: string | null
          created_at?: string | null
          display_order?: number | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          updated_at?: string | null
        }
        Update: {
          account_name?: string | null
          account_number?: string
          country_code?: string | null
          created_at?: string | null
          display_order?: number | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      privacy_security: {
        Row: {
          content: string
          created_at: string
          display_order: number | null
          id: string
          is_active: boolean | null
          title: string
          updated_at: string
        }
        Insert: {
          content?: string
          created_at?: string
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          title: string
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          country: string | null
          country_code: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          package_type: string | null
          phone_number: string | null
          status: Database["public"]["Enums"]["user_status"]
          subscription: Database["public"]["Enums"]["subscription_tier"]
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          country?: string | null
          country_code?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          package_type?: string | null
          phone_number?: string | null
          status?: Database["public"]["Enums"]["user_status"]
          subscription?: Database["public"]["Enums"]["subscription_tier"]
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          country?: string | null
          country_code?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          package_type?: string | null
          phone_number?: string | null
          status?: Database["public"]["Enums"]["user_status"]
          subscription?: Database["public"]["Enums"]["subscription_tier"]
          updated_at?: string
        }
        Relationships: []
      }
      special_tips: {
        Row: {
          away_team: string
          category: string
          created_at: string
          home_team: string
          id: string
          league: string
          match_time: string
          odds: string
          prediction: string
          status: Database["public"]["Enums"]["tip_status"]
          updated_at: string
        }
        Insert: {
          away_team: string
          category: string
          created_at?: string
          home_team: string
          id?: string
          league: string
          match_time: string
          odds: string
          prediction: string
          status?: Database["public"]["Enums"]["tip_status"]
          updated_at?: string
        }
        Update: {
          away_team?: string
          category?: string
          created_at?: string
          home_team?: string
          id?: string
          league?: string
          match_time?: string
          odds?: string
          prediction?: string
          status?: Database["public"]["Enums"]["tip_status"]
          updated_at?: string
        }
        Relationships: []
      }
      subscription_packages: {
        Row: {
          created_at: string
          display_order: number | null
          duration_days: number
          features: string[] | null
          id: string
          is_active: boolean | null
          is_popular: boolean | null
          name: string
          price: number
          slug: string
          tier: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_order?: number | null
          duration_days?: number
          features?: string[] | null
          id?: string
          is_active?: boolean | null
          is_popular?: boolean | null
          name: string
          price: number
          slug: string
          tier?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_order?: number | null
          duration_days?: number
          features?: string[] | null
          id?: string
          is_active?: boolean | null
          is_popular?: boolean | null
          name?: string
          price?: number
          slug?: string
          tier?: string
          updated_at?: string
        }
        Relationships: []
      }
      support_contacts: {
        Row: {
          created_at: string | null
          display_order: number | null
          id: string
          is_active: boolean | null
          label: string | null
          type: string
          updated_at: string | null
          value: string
        }
        Insert: {
          created_at?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          label?: string | null
          type: string
          updated_at?: string | null
          value: string
        }
        Update: {
          created_at?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          label?: string | null
          type?: string
          updated_at?: string | null
          value?: string
        }
        Relationships: []
      }
      tip_categories: {
        Row: {
          created_at: string
          description: string | null
          display_order: number | null
          icon: string
          id: string
          is_active: boolean | null
          is_special: boolean | null
          is_vip: boolean | null
          name: string
          slug: string
          tip_count: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          display_order?: number | null
          icon?: string
          id?: string
          is_active?: boolean | null
          is_special?: boolean | null
          is_vip?: boolean | null
          name: string
          slug: string
          tip_count?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          display_order?: number | null
          icon?: string
          id?: string
          is_active?: boolean | null
          is_special?: boolean | null
          is_vip?: boolean | null
          name?: string
          slug?: string
          tip_count?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_subscriptions: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          is_active: boolean | null
          package_id: string
          starts_at: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at: string
          id?: string
          is_active?: boolean | null
          package_id: string
          starts_at?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          is_active?: boolean | null
          package_id?: string
          starts_at?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_subscriptions_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "subscription_packages"
            referencedColumns: ["id"]
          },
        ]
      }
      vip_tips: {
        Row: {
          away_team: string
          category: string
          created_at: string
          home_team: string
          id: string
          league: string
          match_time: string
          odds: string
          prediction: string
          status: Database["public"]["Enums"]["tip_status"]
          updated_at: string
        }
        Insert: {
          away_team: string
          category: string
          created_at?: string
          home_team: string
          id?: string
          league: string
          match_time: string
          odds: string
          prediction: string
          status?: Database["public"]["Enums"]["tip_status"]
          updated_at?: string
        }
        Update: {
          away_team?: string
          category?: string
          created_at?: string
          home_team?: string
          id?: string
          league?: string
          match_time?: string
          odds?: string
          prediction?: string
          status?: Database["public"]["Enums"]["tip_status"]
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "user" | "admin"
      subscription_tier: "free" | "vip" | "special"
      tip_status: "pending" | "won" | "lost" | "void"
      user_status: "pending" | "approved" | "blocked"
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
      app_role: ["user", "admin"],
      subscription_tier: ["free", "vip", "special"],
      tip_status: ["pending", "won", "lost", "void"],
      user_status: ["pending", "approved", "blocked"],
    },
  },
} as const
