export interface Database {
  public: {
    Tables: {
      activity_logs: {
        Row: {
          id: string;
          user_id: string;
          action: string;
          description: string;
          entity_type: string;
          entity_id: string;
          metadata: Record<string, unknown>;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          action: string;
          description: string;
          entity_type: string;
          entity_id: string;
          metadata?: Record<string, unknown>;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          action?: string;
          description?: string;
          entity_type?: string;
          entity_id?: string;
          metadata?: Record<string, unknown>;
          created_at?: string;
        };
      };
    };
    Functions: {
      generate_client_portal_token: {
        Args: Record<string, never>;
        Returns: string;
      };
      get_current_user_role: {
        Args: Record<string, never>;
        Returns: string;
      };
    };
  };
}
