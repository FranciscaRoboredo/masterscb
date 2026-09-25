export type UserRole = "coach" | "athlete";
export type EventSession = "manha" | "tarde";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string;
          role: UserRole;
          phone: string | null;
          birth_date: string | null;
          club: string | null;
          federation_number: string | null;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name: string;
          role?: UserRole;
          phone?: string | null;
          birth_date?: string | null;
          club?: string | null;
          federation_number?: string | null;
          notes?: string | null;
        };
        Update: {
          full_name?: string;
          role?: UserRole;
          phone?: string | null;
          birth_date?: string | null;
          club?: string | null;
          federation_number?: string | null;
          notes?: string | null;
        };
        Relationships: [];
      };
      competitions: {
        Row: {
          id: string;
          name: string;
          location: string | null;
          start_date: string;
          end_date: string;
          registration_start: string | null;
          registration_end: string | null;
          published: boolean;
          counts_for_cem: boolean;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          name: string;
          location?: string | null;
          start_date: string;
          end_date: string;
          registration_start?: string | null;
          registration_end?: string | null;
          published?: boolean;
          counts_for_cem?: boolean;
          notes?: string | null;
        };
        Update: {
          name?: string;
          location?: string | null;
          start_date?: string;
          end_date?: string;
          registration_start?: string | null;
          registration_end?: string | null;
          counts_for_cem?: boolean;
          published?: boolean;
          notes?: string | null;
        };
        Relationships: [];
      };
      competition_events: {
        Row: {
          id: string;
          competition_id: string;
          name: string;
          event_date: string;
          event_time: string | null;
          session: EventSession | null;
          created_at: string;
        };
        Insert: {
          competition_id: string;
          name: string;
          event_date: string;
          event_time?: string | null;
          session?: EventSession | null;
        };
        Update: {
          name?: string;
          event_date?: string;
          event_time?: string | null;
          session?: EventSession | null;
        };
        Relationships: [];
      };
      registrations: {
        Row: {
          id: string;
          athlete_id: string;
          competition_event_id: string;
          created_at: string;
        };
        Insert: {
          athlete_id: string;
          competition_event_id: string;
        };
        Update: Record<string, never>;
        Relationships: [];
      };
      results: {
        Row: {
          id: string;
          athlete_id: string;
          competition_event_id: string;
          time: string | null;
          position: number | null;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          athlete_id: string;
          competition_event_id: string;
          time?: string | null;
          position?: number | null;
          notes?: string | null;
        };
        Update: {
          time?: string | null;
          position?: number | null;
          notes?: string | null;
        };
        Relationships: [];
      };
      competition_relay_responses: {
        Row: {
          id: string;
          athlete_id: string;
          competition_id: string;
          wants_relay: boolean;
          created_at: string;
        };
        Insert: {
          athlete_id: string;
          competition_id: string;
          wants_relay: boolean;
        };
        Update: {
          wants_relay?: boolean;
        };
        Relationships: [];
      };
      daily_trainings: {
        Row: {
          id: string;
          training_date: string;
          dry_land_training: string | null;
          material: string | null;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          training_date: string;
          dry_land_training?: string | null;
          material?: string | null;
          notes?: string | null;
        };
        Update: {
          dry_land_training?: string | null;
          material?: string | null;
          notes?: string | null;
        };
        Relationships: [];
      };
      roster_athletes: {
        Row: {
          id: string;
          full_name: string;
          gender: "M" | "F" | null;
          birth_date: string | null;
          federation_number: string | null;
          club: string;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          full_name: string;
          gender?: "M" | "F" | null;
          birth_date?: string | null;
          federation_number?: string | null;
          club?: string;
          notes?: string | null;
        };
        Update: {
          full_name?: string;
          gender?: "M" | "F" | null;
          birth_date?: string | null;
          federation_number?: string | null;
          club?: string;
          notes?: string | null;
        };
        Relationships: [];
      };
      cem_clubs: {
        Row: {
          id: string;
          lenex_code: string;
          name: string;
          created_at: string;
        };
        Insert: {
          lenex_code: string;
          name: string;
        };
        Update: {
          name?: string;
        };
        Relationships: [];
      };
      cem_swimmers: {
        Row: {
          id: string;
          license: string;
          first_name: string;
          last_name: string;
          birth_date: string | null;
          gender: "M" | "F" | null;
          nation: string | null;
          roster_athlete_id: string | null;
          created_at: string;
        };
        Insert: {
          license: string;
          first_name: string;
          last_name: string;
          birth_date?: string | null;
          gender?: "M" | "F" | null;
          nation?: string | null;
          roster_athlete_id?: string | null;
        };
        Update: {
          first_name?: string;
          last_name?: string;
          birth_date?: string | null;
          gender?: "M" | "F" | null;
          nation?: string | null;
          roster_athlete_id?: string | null;
        };
        Relationships: [];
      };
      cem_meets: {
        Row: {
          id: string;
          name: string;
          city: string | null;
          course: "SCM" | "LCM" | null;
          organizer: string | null;
          start_date: string;
          end_date: string | null;
          counts_for_cem: boolean;
          source_file: string | null;
          created_at: string;
        };
        Insert: {
          name: string;
          city?: string | null;
          course?: "SCM" | "LCM" | null;
          organizer?: string | null;
          start_date: string;
          end_date?: string | null;
          counts_for_cem?: boolean;
          source_file?: string | null;
        };
        Update: {
          counts_for_cem?: boolean;
        };
        Relationships: [];
      };
      cem_events: {
        Row: {
          id: string;
          meet_id: string;
          lenex_eventid: string;
          gender: "M" | "F" | "X";
          distance: number;
          stroke: "FREE" | "BACK" | "BREAST" | "FLY" | "MEDLEY";
          relaycount: number;
          created_at: string;
        };
        Insert: {
          meet_id: string;
          lenex_eventid: string;
          gender: "M" | "F" | "X";
          distance: number;
          stroke: "FREE" | "BACK" | "BREAST" | "FLY" | "MEDLEY";
          relaycount?: number;
        };
        Update: Record<string, never>;
        Relationships: [];
      };
      cem_agegroups: {
        Row: {
          id: string;
          event_id: string;
          lenex_agegroupid: string;
          age_min: number | null;
          age_max: number | null;
          created_at: string;
        };
        Insert: {
          event_id: string;
          lenex_agegroupid: string;
          age_min?: number | null;
          age_max?: number | null;
        };
        Update: Record<string, never>;
        Relationships: [];
      };
      cem_results: {
        Row: {
          id: string;
          event_id: string;
          agegroup_id: string | null;
          swimmer_id: string;
          club_id: string | null;
          place_in_file: number | null;
          swimtime: string | null;
          entrytime: string | null;
          entrycourse: string | null;
          dsv_points: number | null;
          lenex_resultid: string | null;
          created_at: string;
        };
        Insert: {
          event_id: string;
          agegroup_id?: string | null;
          swimmer_id: string;
          club_id?: string | null;
          place_in_file?: number | null;
          swimtime?: string | null;
          entrytime?: string | null;
          entrycourse?: string | null;
          dsv_points?: number | null;
          lenex_resultid?: string | null;
        };
        Update: Record<string, never>;
        Relationships: [];
      };
    };
    Views: {
      cem_meet_stats: {
        Row: {
          meet_id: string;
          swimmers_count: number;
          clubs_count: number;
          results_count: number;
        };
      };
    };
    Functions: Record<string, never>;
    Enums: {
      user_role: UserRole;
    };
    CompositeTypes: Record<string, never>;
  };
}
