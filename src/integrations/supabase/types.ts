export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      audit_interviews: {
        Row: {
          audit_id: string | null
          control_refs: string | null
          created_at: string
          description: string | null
          duration_minutes: number
          id: string
          location: string | null
          meeting_link: string | null
          start_time: string
          theme_id: string | null
          title: string
          topic_id: string | null
          updated_at: string
        }
        Insert: {
          audit_id?: string | null
          control_refs?: string | null
          created_at?: string
          description?: string | null
          duration_minutes?: number
          id?: string
          location?: string | null
          meeting_link?: string | null
          start_time: string
          theme_id?: string | null
          title: string
          topic_id?: string | null
          updated_at?: string
        }
        Update: {
          audit_id?: string | null
          control_refs?: string | null
          created_at?: string
          description?: string | null
          duration_minutes?: number
          id?: string
          location?: string | null
          meeting_link?: string | null
          start_time?: string
          theme_id?: string | null
          title?: string
          topic_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "audit_interviews_audit_id_fkey"
            columns: ["audit_id"]
            isOneToOne: false
            referencedRelation: "audits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_interviews_theme_id_fkey"
            columns: ["theme_id"]
            isOneToOne: false
            referencedRelation: "audit_topics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_interviews_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "audit_topics"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_reports: {
        Row: {
          audit_id: string
          classification: string | null
          generated_at: string
          markdown_content: string
          pdf_url: string | null
          updated_at: string
        }
        Insert: {
          audit_id: string
          classification?: string | null
          generated_at?: string
          markdown_content: string
          pdf_url?: string | null
          updated_at?: string
        }
        Update: {
          audit_id?: string
          classification?: string | null
          generated_at?: string
          markdown_content?: string
          pdf_url?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "audit_reports_audit_id_fkey"
            columns: ["audit_id"]
            isOneToOne: true
            referencedRelation: "audits"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_step_controls: {
        Row: {
          audit_step_id: string
          control_id: string
        }
        Insert: {
          audit_step_id: string
          control_id: string
        }
        Update: {
          audit_step_id?: string
          control_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "audit_step_controls_audit_step_id_fkey"
            columns: ["audit_step_id"]
            isOneToOne: false
            referencedRelation: "audit_steps"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_step_controls_control_id_fkey"
            columns: ["control_id"]
            isOneToOne: false
            referencedRelation: "framework_controls"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_steps: {
        Row: {
          audit_id: string
          created_at: string
          description: string | null
          id: string
          order: number
          title: string
          updated_at: string
        }
        Insert: {
          audit_id: string
          created_at?: string
          description?: string | null
          id?: string
          order: number
          title: string
          updated_at?: string
        }
        Update: {
          audit_id?: string
          created_at?: string
          description?: string | null
          id?: string
          order?: number
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "audit_steps_audit_id_fkey"
            columns: ["audit_id"]
            isOneToOne: false
            referencedRelation: "audits"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_themes: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      audit_topics: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      audit_users: {
        Row: {
          audit_id: string
          role_in_audit: string
          user_id: string
        }
        Insert: {
          audit_id: string
          role_in_audit: string
          user_id: string
        }
        Update: {
          audit_id?: string
          role_in_audit?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "audit_users_audit_id_fkey"
            columns: ["audit_id"]
            isOneToOne: false
            referencedRelation: "audits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_users_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      audits: {
        Row: {
          company_id: string
          created_at: string
          created_by_id: string
          end_date: string
          framework_id: string
          id: string
          scope: string | null
          start_date: string
          status: Database["public"]["Enums"]["audit_status"]
          updated_at: string
        }
        Insert: {
          company_id: string
          created_at?: string
          created_by_id: string
          end_date: string
          framework_id: string
          id?: string
          scope?: string | null
          start_date: string
          status?: Database["public"]["Enums"]["audit_status"]
          updated_at?: string
        }
        Update: {
          company_id?: string
          created_at?: string
          created_by_id?: string
          end_date?: string
          framework_id?: string
          id?: string
          scope?: string | null
          start_date?: string
          status?: Database["public"]["Enums"]["audit_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "audits_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audits_created_by_id_fkey"
            columns: ["created_by_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audits_framework_id_fkey"
            columns: ["framework_id"]
            isOneToOne: false
            referencedRelation: "frameworks"
            referencedColumns: ["id"]
          },
        ]
      }
      companies: {
        Row: {
          activity: string | null
          created_at: string
          creation_year: number | null
          id: string
          last_audit_date: string | null
          market_scope: string | null
          name: string
          parent_company: string | null
          updated_at: string
        }
        Insert: {
          activity?: string | null
          created_at?: string
          creation_year?: number | null
          id?: string
          last_audit_date?: string | null
          market_scope?: string | null
          name: string
          parent_company?: string | null
          updated_at?: string
        }
        Update: {
          activity?: string | null
          created_at?: string
          creation_year?: number | null
          id?: string
          last_audit_date?: string | null
          market_scope?: string | null
          name?: string
          parent_company?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      findings: {
        Row: {
          audit_step_id: string
          author_id: string
          category: Database["public"]["Enums"]["finding_category"]
          control_id: string
          created_at: string
          id: string
          raw_text: string
          refined_text: string | null
          status: Database["public"]["Enums"]["finding_status"]
          updated_at: string
        }
        Insert: {
          audit_step_id: string
          author_id: string
          category: Database["public"]["Enums"]["finding_category"]
          control_id: string
          created_at?: string
          id?: string
          raw_text: string
          refined_text?: string | null
          status?: Database["public"]["Enums"]["finding_status"]
          updated_at?: string
        }
        Update: {
          audit_step_id?: string
          author_id?: string
          category?: Database["public"]["Enums"]["finding_category"]
          control_id?: string
          created_at?: string
          id?: string
          raw_text?: string
          refined_text?: string | null
          status?: Database["public"]["Enums"]["finding_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "findings_audit_step_id_fkey"
            columns: ["audit_step_id"]
            isOneToOne: false
            referencedRelation: "audit_steps"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "findings_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "findings_control_id_fkey"
            columns: ["control_id"]
            isOneToOne: false
            referencedRelation: "framework_controls"
            referencedColumns: ["id"]
          },
        ]
      }
      framework_controls: {
        Row: {
          created_at: string
          description: string | null
          framework_id: string
          id: string
          reference_code: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          framework_id: string
          id?: string
          reference_code: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          framework_id?: string
          id?: string
          reference_code?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "framework_controls_framework_id_fkey"
            columns: ["framework_id"]
            isOneToOne: false
            referencedRelation: "frameworks"
            referencedColumns: ["id"]
          },
        ]
      }
      frameworks: {
        Row: {
          created_at: string
          id: string
          name: string
          updated_at: string
          version: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          updated_at?: string
          version: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
          version?: string
        }
        Relationships: []
      }
      interview_participants: {
        Row: {
          interview_id: string
          notification_sent: boolean | null
          role: string
          user_id: string
        }
        Insert: {
          interview_id: string
          notification_sent?: boolean | null
          role: string
          user_id: string
        }
        Update: {
          interview_id?: string
          notification_sent?: boolean | null
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "interview_participants_interview_id_fkey"
            columns: ["interview_id"]
            isOneToOne: false
            referencedRelation: "audit_interviews"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "interview_participants_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          amount: number | null
          audit_id: string
          created_at: string
          currency: string | null
          due_date: string | null
          status: string
          updated_at: string
          webhook_url: string | null
        }
        Insert: {
          amount?: number | null
          audit_id: string
          created_at?: string
          currency?: string | null
          due_date?: string | null
          status: string
          updated_at?: string
          webhook_url?: string | null
        }
        Update: {
          amount?: number | null
          audit_id?: string
          created_at?: string
          currency?: string | null
          due_date?: string | null
          status?: string
          updated_at?: string
          webhook_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invoices_audit_id_fkey"
            columns: ["audit_id"]
            isOneToOne: true
            referencedRelation: "audits"
            referencedColumns: ["id"]
          },
        ]
      }
      standard_clauses: {
        Row: {
          created_at: string
          description: string | null
          id: string
          reference_code: string
          standard_id: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          reference_code: string
          standard_id: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          reference_code?: string
          standard_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      topic_controls: {
        Row: {
          control_id: string
          topic_id: string
        }
        Insert: {
          control_id: string
          topic_id: string
        }
        Update: {
          control_id?: string
          topic_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "topic_controls_control_id_fkey"
            columns: ["control_id"]
            isOneToOne: false
            referencedRelation: "framework_controls"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "topic_controls_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "audit_topics"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          avatar: string | null
          created_at: string
          email: string
          id: string
          name: string
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
        }
        Insert: {
          avatar?: string | null
          created_at?: string
          email: string
          id: string
          name: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Update: {
          avatar?: string | null
          created_at?: string
          email?: string
          id?: string
          name?: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      estimate_audit_days: {
        Args: {
          framework_id: string
          company_size?: number
        }
        Returns: number
      }
      gtrgm_compress: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      gtrgm_decompress: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      gtrgm_in: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      gtrgm_options: {
        Args: {
          "": unknown
        }
        Returns: undefined
      }
      gtrgm_out: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      set_limit: {
        Args: {
          "": number
        }
        Returns: number
      }
      show_limit: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      show_trgm: {
        Args: {
          "": string
        }
        Returns: string[]
      }
      unaccent: {
        Args: {
          "": string
        }
        Returns: string
      }
      unaccent_init: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
    }
    Enums: {
      audit_status: "draft" | "in_progress" | "review" | "completed"
      finding_category:
        | "non_conformity_major"
        | "non_conformity_minor"
        | "sensitive_point"
        | "improvement_opportunity"
        | "strength"
      finding_status: "draft" | "pending_review" | "validated"
      user_role: "admin" | "auditor" | "reviewer"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
