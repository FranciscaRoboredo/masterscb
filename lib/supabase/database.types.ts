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
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      user_role: UserRole;
    };
    CompositeTypes: Record<string, never>;
  };
}
