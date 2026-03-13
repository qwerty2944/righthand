export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      clinics: {
        Row: {
          id: string;
          name: string;
          business_number: string | null;
          address: string | null;
          phone: string | null;
          owner_name: string | null;
          license_number: string | null;
          settings: Json;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          business_number?: string | null;
          address?: string | null;
          phone?: string | null;
          owner_name?: string | null;
          license_number?: string | null;
          settings?: Json;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          business_number?: string | null;
          address?: string | null;
          phone?: string | null;
          owner_name?: string | null;
          license_number?: string | null;
          settings?: Json;
          updated_at?: string;
          deleted_at?: string | null;
        };
      };
      profiles: {
        Row: {
          id: string;
          clinic_id: string | null;
          email: string;
          name: string;
          role: "owner" | "staff";
          is_active: boolean;
          last_login_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          clinic_id?: string | null;
          email: string;
          name: string;
          role?: "owner" | "staff";
          is_active?: boolean;
          last_login_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          clinic_id?: string | null;
          email?: string;
          name?: string;
          role?: "owner" | "staff";
          is_active?: boolean;
          last_login_at?: string | null;
          updated_at?: string;
        };
      };
      clinic_members: {
        Row: {
          id: string;
          user_id: string;
          clinic_id: string;
          role: "owner" | "staff";
          is_active: boolean;
          joined_at: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          clinic_id: string;
          role?: "owner" | "staff";
          is_active?: boolean;
          joined_at?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          role?: "owner" | "staff";
          is_active?: boolean;
          updated_at?: string;
        };
      };
      clinic_invitations: {
        Row: {
          id: string;
          clinic_id: string;
          invited_by: string;
          email: string | null;
          code: string;
          role: "owner" | "staff";
          status: "pending" | "accepted" | "cancelled" | "expired";
          expires_at: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          clinic_id: string;
          invited_by: string;
          email?: string | null;
          code: string;
          role?: "owner" | "staff";
          status?: "pending" | "accepted" | "cancelled" | "expired";
          expires_at?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          email?: string | null;
          role?: "owner" | "staff";
          status?: "pending" | "accepted" | "cancelled" | "expired";
          expires_at?: string;
          updated_at?: string;
        };
      };
      patients: {
        Row: {
          id: string;
          clinic_id: string;
          chart_number: string | null;
          name: string;
          birth_date: string;
          gender: "male" | "female" | "other";
          phone: string | null;
          email: string | null;
          address: string | null;
          notes: string | null;
          kakao_user_id: string | null;
          consent_status: Json;
          embedding: string | null;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          clinic_id: string;
          chart_number?: string | null;
          name: string;
          birth_date: string;
          gender: "male" | "female" | "other";
          phone?: string | null;
          email?: string | null;
          address?: string | null;
          notes?: string | null;
          kakao_user_id?: string | null;
          consent_status?: Json;
          embedding?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          chart_number?: string | null;
          name?: string;
          birth_date?: string;
          gender?: "male" | "female" | "other";
          phone?: string | null;
          email?: string | null;
          address?: string | null;
          notes?: string | null;
          kakao_user_id?: string | null;
          consent_status?: Json;
          embedding?: string | null;
          updated_at?: string;
          deleted_at?: string | null;
        };
      };
      appointment_slots: {
        Row: {
          id: string;
          clinic_id: string;
          slot_date: string;
          start_time: string;
          end_time: string;
          max_capacity: number;
          booked_count: number;
          is_available: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          clinic_id: string;
          slot_date: string;
          start_time: string;
          end_time: string;
          max_capacity?: number;
          booked_count?: number;
          is_available?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          slot_date?: string;
          start_time?: string;
          end_time?: string;
          max_capacity?: number;
          booked_count?: number;
          is_available?: boolean;
          updated_at?: string;
        };
      };
      appointments: {
        Row: {
          id: string;
          clinic_id: string;
          patient_id: string;
          slot_id: string | null;
          appointment_date: string;
          start_time: string;
          end_time: string;
          status: "scheduled" | "confirmed" | "in_progress" | "completed" | "cancelled" | "no_show";
          cancel_reason: string | null;
          notes: string | null;
          reminder_sent: boolean;
          created_by: string;
          embedding: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          clinic_id: string;
          patient_id: string;
          slot_id?: string | null;
          appointment_date: string;
          start_time: string;
          end_time: string;
          status?: "scheduled" | "confirmed" | "in_progress" | "completed" | "cancelled" | "no_show";
          cancel_reason?: string | null;
          notes?: string | null;
          reminder_sent?: boolean;
          created_by: string;
          embedding?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          patient_id?: string;
          slot_id?: string | null;
          appointment_date?: string;
          start_time?: string;
          end_time?: string;
          status?: "scheduled" | "confirmed" | "in_progress" | "completed" | "cancelled" | "no_show";
          cancel_reason?: string | null;
          notes?: string | null;
          reminder_sent?: boolean;
          embedding?: string | null;
          updated_at?: string;
        };
      };
      waitlist: {
        Row: {
          id: string;
          clinic_id: string;
          patient_id: string;
          desired_date: string;
          desired_start: string | null;
          desired_end: string | null;
          status: "waiting" | "notified" | "booked" | "expired";
          notified_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          clinic_id: string;
          patient_id: string;
          desired_date: string;
          desired_start?: string | null;
          desired_end?: string | null;
          status?: "waiting" | "notified" | "booked" | "expired";
          notified_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          desired_date?: string;
          desired_start?: string | null;
          desired_end?: string | null;
          status?: "waiting" | "notified" | "booked" | "expired";
          notified_at?: string | null;
          updated_at?: string;
        };
      };
      audit_log: {
        Row: {
          id: string;
          clinic_id: string;
          user_id: string;
          action: string;
          resource_type: string;
          resource_id: string;
          old_values: Json | null;
          new_values: Json | null;
          ip_address: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          clinic_id: string;
          user_id: string;
          action: string;
          resource_type: string;
          resource_id: string;
          old_values?: Json | null;
          new_values?: Json | null;
          ip_address?: string | null;
          created_at?: string;
        };
        Update: never;
      };
      message_queue: {
        Row: {
          id: string;
          clinic_id: string;
          channel: string;
          recipient: string;
          subject: string | null;
          body: string;
          status: "pending" | "sent" | "failed";
          scheduled_at: string | null;
          sent_at: string | null;
          error: string | null;
          retry_count: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          clinic_id: string;
          channel: string;
          recipient: string;
          subject?: string | null;
          body: string;
          status?: "pending" | "sent" | "failed";
          scheduled_at?: string | null;
          retry_count?: number;
          created_at?: string;
        };
        Update: {
          status?: "pending" | "sent" | "failed";
          sent_at?: string | null;
          error?: string | null;
          retry_count?: number;
        };
      };
      billing_items: {
        Row: {
          id: string;
          clinic_id: string;
          patient_id: string;
          appointment_id: string | null;
          billing_code: string;
          description: string;
          amount: number;
          quantity: number;
          status: "draft" | "confirmed" | "submitted" | "paid";
          created_by: string;
          embedding: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          clinic_id: string;
          patient_id: string;
          appointment_id?: string | null;
          billing_code: string;
          description: string;
          amount?: number;
          quantity?: number;
          status?: "draft" | "confirmed" | "submitted" | "paid";
          created_by: string;
          embedding?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          billing_code?: string;
          description?: string;
          amount?: number;
          quantity?: number;
          status?: "draft" | "confirmed" | "submitted" | "paid";
          embedding?: string | null;
          updated_at?: string;
        };
      };
      medical_records: {
        Row: {
          id: string;
          clinic_id: string;
          patient_id: string;
          appointment_id: string | null;
          chief_complaint: string | null;
          subjective: string | null;
          objective: string | null;
          assessment: string | null;
          plan: string | null;
          ai_draft_id: string | null;
          ai_draft_status: "none" | "generating" | "pending_review" | "approved" | "rejected";
          ai_confidence: number | null;
          finalized_by: string | null;
          finalized_at: string | null;
          status: "draft" | "finalized" | "amended";
          embedding: string | null;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          clinic_id: string;
          patient_id: string;
          appointment_id?: string | null;
          chief_complaint?: string | null;
          subjective?: string | null;
          objective?: string | null;
          assessment?: string | null;
          plan?: string | null;
          ai_draft_id?: string | null;
          ai_draft_status?: "none" | "generating" | "pending_review" | "approved" | "rejected";
          ai_confidence?: number | null;
          finalized_by?: string | null;
          finalized_at?: string | null;
          status?: "draft" | "finalized" | "amended";
          embedding?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          chief_complaint?: string | null;
          subjective?: string | null;
          objective?: string | null;
          assessment?: string | null;
          plan?: string | null;
          ai_draft_id?: string | null;
          ai_draft_status?: "none" | "generating" | "pending_review" | "approved" | "rejected";
          ai_confidence?: number | null;
          finalized_by?: string | null;
          finalized_at?: string | null;
          status?: "draft" | "finalized" | "amended";
          embedding?: string | null;
          updated_at?: string;
          deleted_at?: string | null;
        };
      };
      hira_codes: {
        Row: {
          id: string;
          code: string;
          name: string;
          category: string;
          unit_price: number;
          description: string | null;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          code: string;
          name: string;
          category: string;
          unit_price?: number;
          description?: string | null;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          code?: string;
          name?: string;
          category?: string;
          unit_price?: number;
          description?: string | null;
          is_active?: boolean;
        };
      };
      medical_files: {
        Row: {
          id: string;
          clinic_id: string;
          medical_record_id: string;
          file_name: string;
          file_type: string;
          file_size: number;
          storage_path: string;
          uploaded_by: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          clinic_id: string;
          medical_record_id: string;
          file_name: string;
          file_type: string;
          file_size: number;
          storage_path: string;
          uploaded_by: string;
          created_at?: string;
        };
        Update: {
          file_name?: string;
          storage_path?: string;
        };
      };
      slack_workspaces: {
        Row: {
          id: string;
          clinic_id: string;
          team_id: string;
          team_name: string;
          bot_token: string;
          channel_id: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          clinic_id: string;
          team_id: string;
          team_name: string;
          bot_token: string;
          channel_id?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          team_name?: string;
          bot_token?: string;
          channel_id?: string | null;
          is_active?: boolean;
          updated_at?: string;
        };
      };
      slack_user_mappings: {
        Row: {
          id: string;
          clinic_id: string;
          slack_user_id: string;
          profile_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          clinic_id: string;
          slack_user_id: string;
          profile_id: string;
          created_at?: string;
        };
        Update: {
          slack_user_id?: string;
          profile_id?: string;
        };
      };
      slack_event_log: {
        Row: {
          id: string;
          clinic_id: string;
          event_type: string;
          event_data: Json;
          processed: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          clinic_id: string;
          event_type: string;
          event_data: Json;
          processed?: boolean;
          created_at?: string;
        };
        Update: {
          processed?: boolean;
        };
      };
      briefing_settings: {
        Row: {
          id: string;
          clinic_id: string;
          is_enabled: boolean;
          schedule_time: string;
          channel_id: string;
          include_appointments: boolean;
          include_waitlist: boolean;
          include_billing: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          clinic_id: string;
          is_enabled?: boolean;
          schedule_time?: string;
          channel_id: string;
          include_appointments?: boolean;
          include_waitlist?: boolean;
          include_billing?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          is_enabled?: boolean;
          schedule_time?: string;
          channel_id?: string;
          include_appointments?: boolean;
          include_waitlist?: boolean;
          include_billing?: boolean;
          updated_at?: string;
        };
      };
      briefing_logs: {
        Row: {
          id: string;
          clinic_id: string;
          briefing_date: string;
          content: Json;
          slack_message_ts: string | null;
          status: "pending" | "sent" | "failed";
          created_at: string;
        };
        Insert: {
          id?: string;
          clinic_id: string;
          briefing_date: string;
          content: Json;
          slack_message_ts?: string | null;
          status?: "pending" | "sent" | "failed";
          created_at?: string;
        };
        Update: {
          slack_message_ts?: string | null;
          status?: "pending" | "sent" | "failed";
        };
      };
    };
    Functions: {
      search_by_embedding: {
        Args: {
          query_embedding: string;
          match_threshold: number;
          match_count: number;
          p_clinic_id: string;
        };
        Returns: {
          id: string;
          source_table: string;
          content: string;
          similarity: number;
        }[];
      };
    };
    Enums: {};
  };
};

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];
export type InsertTables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];
export type UpdateTables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"];
