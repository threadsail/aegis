export type ProfileRole = "manager" | "staff";

export type TicketStatus =
  | "open"
  | "in_progress"
  | "awaiting"
  | "pending_approval"
  | "approved";

export interface Profile {
  id: string;
  role: ProfileRole;
  display_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Ticket {
  id: string;
  time_entered: string;
  submitted_by: string;
  building: string;
  priority: string;
  assigned: string | null;
  status: TicketStatus;
  created_at: string;
  updated_at: string;
  approved_by: string | null;
}

export interface CompanySettings {
  id: string;
  name: string | null;
  address: string | null;
  support_email: string | null;
  created_at: string;
  updated_at: string;
}
