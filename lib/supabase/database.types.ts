export type UserRole = "coach" | "athlete";

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
          notes?: string | null;
        };
        Update: {
          full_name?: string;
          role?: UserRole;
          phone?: string | null;
          birth_date?: string | null;
          club?: string | null;
          notes?: string | null;
        };
        Relationships: [];
      };
      competitions: {
        Row: {
          id: string;
          name: string;
          location: string | null;
          date: string;
          registration_start: string | null;
          registration_end: string | null;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          name: string;
          location?: string | null;
          date: string;
          registration_start?: string | null;
          registration_end?: string | null;
          notes?: string | null;
        };
        Update: {
          name?: string;
          location?: string | null;
          date?: string;
          registration_start?: string | null;
          registration_end?: string | null;
          notes?: string | null;
        };
        Relationships: [];
      };
      competition_events: {
        Row: {
          id: string;
          competition_id: string;
          name: string;
          event_time: string | null;
          created_at: string;
        };
        Insert: {
          competition_id: string;
          name: string;
          event_time?: string | null;
        };
        Update: {
          name?: string;
          event_time?: string | null;
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
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      user_role: UserRole;
    };
    CompositeTypes: Record<string, never>;
  };
}
