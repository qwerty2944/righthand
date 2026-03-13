import type { Tables } from "./database";

// Domain type aliases
export type Clinic = Tables<"clinics">;
export type Profile = Tables<"profiles">;
export type Patient = Tables<"patients">;
export type AppointmentSlot = Tables<"appointment_slots">;
export type Appointment = Tables<"appointments">;
export type WaitlistEntry = Tables<"waitlist">;
export type AuditLogEntry = Tables<"audit_log">;
export type BillingItem = Tables<"billing_items">;
export type MedicalRecord = Tables<"medical_records">;
export type MedicalFile = Tables<"medical_files">;
export type HiraCode = Tables<"hira_codes">;
export type SlackWorkspace = Tables<"slack_workspaces">;
export type BriefingSetting = Tables<"briefing_settings">;
export type ClinicMember = Tables<"clinic_members">;
export type ClinicInvitation = Tables<"clinic_invitations">;

// Enums
export type UserRole = "owner" | "staff";
export type SignupRole = "general" | "director" | "staff";
export type InvitationStatus = "pending" | "accepted" | "cancelled" | "expired";
export type Gender = "male" | "female" | "other";
export type AppointmentStatus = "scheduled" | "confirmed" | "in_progress" | "completed" | "cancelled" | "no_show";
export type WaitlistStatus = "waiting" | "notified" | "booked" | "expired";
export type BillingStatus = "draft" | "confirmed" | "submitted" | "paid";
export type RecordStatus = "draft" | "finalized" | "amended";

// Pagination
export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Search
export interface SearchResult {
  id: string;
  source_table: string;
  content: string;
  similarity: number;
}

// Appointment with patient
export interface AppointmentWithPatient extends Appointment {
  patient: Patient;
}

// Billing with patient
export interface BillingWithPatient extends BillingItem {
  patient: Patient;
}

// Re-export database types
export type { Database, Json, Tables, InsertTables, UpdateTables } from "./database";
