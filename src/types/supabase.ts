// FILE: src/types/supabase.ts
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          avatar_url: string | null;
          created_at: string | null;
          full_name: string | null;
          id: string;
        };
        Insert: {
          avatar_url?: string | null;
          created_at?: string | null;
          full_name?: string | null;
          id: string;
        };
        Update: {
          avatar_url?: string | null;
          created_at?: string | null;
          full_name?: string | null;
          id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey";
            columns: ["id"];
            isOneToOne: true;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      sessions: {
        Row: {
          created_at: string | null;
          duration_seconds: number | null;
          exercise: "squat" | "deadlift" | "pushup";
          feedback: Json;
          id: string;
          score: number;
          thumbnail_url: string | null;
          user_id: string;
          video_url: string | null;
        };
        Insert: {
          created_at?: string | null;
          duration_seconds?: number | null;
          exercise: "squat" | "deadlift" | "pushup";
          feedback: Json;
          id?: string;
          score: number;
          thumbnail_url?: string | null;
          user_id: string;
          video_url?: string | null;
        };
        Update: {
          created_at?: string | null;
          duration_seconds?: number | null;
          exercise?: "squat" | "deadlift" | "pushup";
          feedback?: Json;
          id?: string;
          score?: number;
          thumbnail_url?: string | null;
          user_id?: string;
          video_url?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "sessions_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};
