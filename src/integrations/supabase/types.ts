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
      accounting_settings: {
        Row: {
          access_token: string | null
          auto_export_invoices: boolean | null
          company_id: string | null
          created_at: string | null
          expense_mapping: Json | null
          id: string
          last_sync: string | null
          platform: string
          refresh_token: string | null
          status: Database["public"]["Enums"]["integration_status"] | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          access_token?: string | null
          auto_export_invoices?: boolean | null
          company_id?: string | null
          created_at?: string | null
          expense_mapping?: Json | null
          id?: string
          last_sync?: string | null
          platform: string
          refresh_token?: string | null
          status?: Database["public"]["Enums"]["integration_status"] | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          access_token?: string | null
          auto_export_invoices?: boolean | null
          company_id?: string | null
          created_at?: string | null
          expense_mapping?: Json | null
          id?: string
          last_sync?: string | null
          platform?: string
          refresh_token?: string | null
          status?: Database["public"]["Enums"]["integration_status"] | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      activity_logs: {
        Row: {
          action: string
          created_at: string | null
          description: string | null
          entity_id: string
          entity_type: string
          id: string
          metadata: Json | null
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string | null
          description?: string | null
          entity_id: string
          entity_type: string
          id?: string
          metadata?: Json | null
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string | null
          description?: string | null
          entity_id?: string
          entity_type?: string
          id?: string
          metadata?: Json | null
          user_id?: string
        }
        Relationships: []
      }
      api_keys: {
        Row: {
          created_at: string | null
          expires_at: string | null
          id: string
          key_hash: string
          last_used: string | null
          name: string
          permissions: string[] | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          key_hash: string
          last_used?: string | null
          name: string
          permissions?: string[] | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          key_hash?: string
          last_used?: string | null
          name?: string
          permissions?: string[] | null
          user_id?: string
        }
        Relationships: []
      }
      backups: {
        Row: {
          completed_at: string | null
          created_at: string | null
          error_message: string | null
          file_path: string | null
          id: string
          name: string
          size_bytes: number | null
          status: Database["public"]["Enums"]["backup_status"] | null
          tables_included: string[] | null
          type: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          error_message?: string | null
          file_path?: string | null
          id?: string
          name: string
          size_bytes?: number | null
          status?: Database["public"]["Enums"]["backup_status"] | null
          tables_included?: string[] | null
          type: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          error_message?: string | null
          file_path?: string | null
          id?: string
          name?: string
          size_bytes?: number | null
          status?: Database["public"]["Enums"]["backup_status"] | null
          tables_included?: string[] | null
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      barcode_logs: {
        Row: {
          barcode_type: string | null
          barcode_value: string
          id: string
          job_id: string | null
          location: Json | null
          metadata: Json | null
          scanned_at: string | null
          user_id: string
        }
        Insert: {
          barcode_type?: string | null
          barcode_value: string
          id?: string
          job_id?: string | null
          location?: Json | null
          metadata?: Json | null
          scanned_at?: string | null
          user_id: string
        }
        Update: {
          barcode_type?: string | null
          barcode_value?: string
          id?: string
          job_id?: string | null
          location?: Json | null
          metadata?: Json | null
          scanned_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "barcode_logs_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      calculator_submissions: {
        Row: {
          bathrooms: number | null
          budget: string | null
          created_at: string
          description: string | null
          email: string
          estimate_amount: number | null
          id: string
          name: string
          phone: string
          project_type: string
          square_footage: number | null
          timeline: string | null
          user_id: string | null
        }
        Insert: {
          bathrooms?: number | null
          budget?: string | null
          created_at?: string
          description?: string | null
          email: string
          estimate_amount?: number | null
          id?: string
          name: string
          phone: string
          project_type: string
          square_footage?: number | null
          timeline?: string | null
          user_id?: string | null
        }
        Update: {
          bathrooms?: number | null
          budget?: string | null
          created_at?: string
          description?: string | null
          email?: string
          estimate_amount?: number | null
          id?: string
          name?: string
          phone?: string
          project_type?: string
          square_footage?: number | null
          timeline?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      calendar_events: {
        Row: {
          all_day: boolean | null
          attendees: string[] | null
          created_at: string | null
          description: string | null
          end_time: string
          id: string
          job_id: string | null
          location: string | null
          start_time: string
          task_id: string | null
          title: string
          user_id: string
        }
        Insert: {
          all_day?: boolean | null
          attendees?: string[] | null
          created_at?: string | null
          description?: string | null
          end_time: string
          id?: string
          job_id?: string | null
          location?: string | null
          start_time: string
          task_id?: string | null
          title: string
          user_id: string
        }
        Update: {
          all_day?: boolean | null
          attendees?: string[] | null
          created_at?: string | null
          description?: string | null
          end_time?: string
          id?: string
          job_id?: string | null
          location?: string | null
          start_time?: string
          task_id?: string | null
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "calendar_events_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "calendar_events_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      calendar_integrations: {
        Row: {
          access_token: string | null
          calendar_id: string | null
          created_at: string | null
          id: string
          last_sync: string | null
          provider: string
          refresh_token: string | null
          status: Database["public"]["Enums"]["integration_status"] | null
          sync_enabled: boolean | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          access_token?: string | null
          calendar_id?: string | null
          created_at?: string | null
          id?: string
          last_sync?: string | null
          provider: string
          refresh_token?: string | null
          status?: Database["public"]["Enums"]["integration_status"] | null
          sync_enabled?: boolean | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          access_token?: string | null
          calendar_id?: string | null
          created_at?: string | null
          id?: string
          last_sync?: string | null
          provider?: string
          refresh_token?: string | null
          status?: Database["public"]["Enums"]["integration_status"] | null
          sync_enabled?: boolean | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      campaigns: {
        Row: {
          content: string | null
          created_at: string | null
          id: string
          metrics: Json | null
          name: string
          schedule_date: string | null
          status: Database["public"]["Enums"]["campaign_status"] | null
          subject: string | null
          target_audience: Json | null
          type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          id?: string
          metrics?: Json | null
          name: string
          schedule_date?: string | null
          status?: Database["public"]["Enums"]["campaign_status"] | null
          subject?: string | null
          target_audience?: Json | null
          type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          content?: string | null
          created_at?: string | null
          id?: string
          metrics?: Json | null
          name?: string
          schedule_date?: string | null
          status?: Database["public"]["Enums"]["campaign_status"] | null
          subject?: string | null
          target_audience?: Json | null
          type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      client_portal_tokens: {
        Row: {
          created_at: string
          customer_id: string
          expires_at: string
          id: string
          metadata: Json | null
          token: string
          used_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          customer_id: string
          expires_at: string
          id?: string
          metadata?: Json | null
          token: string
          used_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          customer_id?: string
          expires_at?: string
          id?: string
          metadata?: Json | null
          token?: string
          used_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_client_portal_tokens_customer"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      companies: {
        Row: {
          created_at: string | null
          custom_css: string | null
          domain: string | null
          id: string
          logo_url: string | null
          name: string
          owner_id: string
          primary_color: string | null
          secondary_color: string | null
          settings: Json | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          custom_css?: string | null
          domain?: string | null
          id?: string
          logo_url?: string | null
          name: string
          owner_id: string
          primary_color?: string | null
          secondary_color?: string | null
          settings?: Json | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          custom_css?: string | null
          domain?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          owner_id?: string
          primary_color?: string | null
          secondary_color?: string | null
          settings?: Json | null
          updated_at?: string | null
        }
        Relationships: []
      }
      customers: {
        Row: {
          address: string | null
          city: string | null
          company_name: string | null
          created_at: string | null
          email: string | null
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          first_name: string
          id: string
          last_name: string
          lead_id: string | null
          notes: string | null
          phone: string | null
          state: string | null
          updated_at: string | null
          user_id: string
          zip_code: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          company_name?: string | null
          created_at?: string | null
          email?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          first_name: string
          id?: string
          last_name: string
          lead_id?: string | null
          notes?: string | null
          phone?: string | null
          state?: string | null
          updated_at?: string | null
          user_id: string
          zip_code?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          company_name?: string | null
          created_at?: string | null
          email?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          first_name?: string
          id?: string
          last_name?: string
          lead_id?: string | null
          notes?: string | null
          phone?: string | null
          state?: string | null
          updated_at?: string | null
          user_id?: string
          zip_code?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customers_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      dashboard_layouts: {
        Row: {
          created_at: string | null
          id: string
          is_default: boolean | null
          layout: Json
          name: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_default?: boolean | null
          layout: Json
          name: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_default?: boolean | null
          layout?: Json
          name?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      dashboard_metrics_cache: {
        Row: {
          calculated_at: string
          expires_at: string
          id: string
          metadata: Json
          metric_type: string
          period: string
          user_id: string
          value: number
        }
        Insert: {
          calculated_at?: string
          expires_at: string
          id?: string
          metadata?: Json
          metric_type: string
          period: string
          user_id: string
          value: number
        }
        Update: {
          calculated_at?: string
          expires_at?: string
          id?: string
          metadata?: Json
          metric_type?: string
          period?: string
          user_id?: string
          value?: number
        }
        Relationships: []
      }
      dashboard_preferences: {
        Row: {
          created_at: string
          id: string
          layout: Json
          theme_settings: Json
          updated_at: string
          user_id: string
          visible_widgets: string[]
          widget_positions: Json
        }
        Insert: {
          created_at?: string
          id?: string
          layout?: Json
          theme_settings?: Json
          updated_at?: string
          user_id: string
          visible_widgets?: string[]
          widget_positions?: Json
        }
        Update: {
          created_at?: string
          id?: string
          layout?: Json
          theme_settings?: Json
          updated_at?: string
          user_id?: string
          visible_widgets?: string[]
          widget_positions?: Json
        }
        Relationships: []
      }
      dashboard_widgets: {
        Row: {
          config: Json
          created_at: string | null
          height: number | null
          id: string
          position_x: number | null
          position_y: number | null
          title: string
          type: string
          updated_at: string | null
          user_id: string
          width: number | null
        }
        Insert: {
          config: Json
          created_at?: string | null
          height?: number | null
          id?: string
          position_x?: number | null
          position_y?: number | null
          title: string
          type: string
          updated_at?: string | null
          user_id: string
          width?: number | null
        }
        Update: {
          config?: Json
          created_at?: string | null
          height?: number | null
          id?: string
          position_x?: number | null
          position_y?: number | null
          title?: string
          type?: string
          updated_at?: string | null
          user_id?: string
          width?: number | null
        }
        Relationships: []
      }
      documents: {
        Row: {
          created_at: string | null
          description: string | null
          entity_id: string | null
          entity_type: string | null
          file_name: string
          file_path: string
          file_size: number | null
          id: string
          mime_type: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          entity_id?: string | null
          entity_type?: string | null
          file_name: string
          file_path: string
          file_size?: number | null
          id?: string
          mime_type?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          entity_id?: string | null
          entity_type?: string | null
          file_name?: string
          file_path?: string
          file_size?: number | null
          id?: string
          mime_type?: string | null
          user_id?: string
        }
        Relationships: []
      }
      estimate_automations: {
        Row: {
          action_type: string
          conditions: Json
          created_at: string
          enabled: boolean
          estimate_id: string | null
          id: string
          name: string
          trigger_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          action_type: string
          conditions?: Json
          created_at?: string
          enabled?: boolean
          estimate_id?: string | null
          id?: string
          name: string
          trigger_type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          action_type?: string
          conditions?: Json
          created_at?: string
          enabled?: boolean
          estimate_id?: string | null
          id?: string
          name?: string
          trigger_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "estimate_automations_estimate_id_fkey"
            columns: ["estimate_id"]
            isOneToOne: false
            referencedRelation: "estimates"
            referencedColumns: ["id"]
          },
        ]
      }
      estimate_line_items: {
        Row: {
          created_at: string | null
          description: string
          estimate_id: string | null
          id: string
          quantity: number
          sort_order: number | null
          total: number | null
          unit_price: number
        }
        Insert: {
          created_at?: string | null
          description: string
          estimate_id?: string | null
          id?: string
          quantity?: number
          sort_order?: number | null
          total?: number | null
          unit_price: number
        }
        Update: {
          created_at?: string | null
          description?: string
          estimate_id?: string | null
          id?: string
          quantity?: number
          sort_order?: number | null
          total?: number | null
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "estimate_line_items_estimate_id_fkey"
            columns: ["estimate_id"]
            isOneToOne: false
            referencedRelation: "estimates"
            referencedColumns: ["id"]
          },
        ]
      }
      estimate_templates: {
        Row: {
          created_at: string
          description: string | null
          id: string
          line_items: Json
          name: string
          notes: string | null
          tax_rate: number
          terms: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          line_items?: Json
          name: string
          notes?: string | null
          tax_rate?: number
          terms?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          line_items?: Json
          name?: string
          notes?: string | null
          tax_rate?: number
          terms?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      estimates: {
        Row: {
          created_at: string | null
          customer_id: string | null
          description: string | null
          estimate_number: string
          id: string
          job_id: string | null
          notes: string | null
          status: Database["public"]["Enums"]["estimate_status"] | null
          subtotal: number | null
          tax_amount: number | null
          tax_rate: number | null
          terms: string | null
          title: string
          total_amount: number | null
          updated_at: string | null
          user_id: string
          valid_until: string | null
        }
        Insert: {
          created_at?: string | null
          customer_id?: string | null
          description?: string | null
          estimate_number: string
          id?: string
          job_id?: string | null
          notes?: string | null
          status?: Database["public"]["Enums"]["estimate_status"] | null
          subtotal?: number | null
          tax_amount?: number | null
          tax_rate?: number | null
          terms?: string | null
          title: string
          total_amount?: number | null
          updated_at?: string | null
          user_id: string
          valid_until?: string | null
        }
        Update: {
          created_at?: string | null
          customer_id?: string | null
          description?: string | null
          estimate_number?: string
          id?: string
          job_id?: string | null
          notes?: string | null
          status?: Database["public"]["Enums"]["estimate_status"] | null
          subtotal?: number | null
          tax_amount?: number | null
          tax_rate?: number | null
          terms?: string | null
          title?: string
          total_amount?: number | null
          updated_at?: string | null
          user_id?: string
          valid_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "estimates_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "estimates_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      file_policies: {
        Row: {
          allowed_file_types: string[] | null
          auto_organize: boolean | null
          created_at: string | null
          entity_type: string
          id: string
          max_file_size: number | null
          max_files_per_entity: number | null
          page_type: string
          require_approval: boolean | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          allowed_file_types?: string[] | null
          auto_organize?: boolean | null
          created_at?: string | null
          entity_type: string
          id?: string
          max_file_size?: number | null
          max_files_per_entity?: number | null
          page_type: string
          require_approval?: boolean | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          allowed_file_types?: string[] | null
          auto_organize?: boolean | null
          created_at?: string | null
          entity_type?: string
          id?: string
          max_file_size?: number | null
          max_files_per_entity?: number | null
          page_type?: string
          require_approval?: boolean | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      file_workflows: {
        Row: {
          created_at: string | null
          entity_type: string
          id: string
          is_active: boolean | null
          name: string
          page_type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          entity_type: string
          id?: string
          is_active?: boolean | null
          name: string
          page_type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          entity_type?: string
          id?: string
          is_active?: boolean | null
          name?: string
          page_type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      follow_up_reminders: {
        Row: {
          created_at: string
          entity_id: string
          entity_type: string
          id: string
          message: string
          reminder_date: string
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          entity_id: string
          entity_type: string
          id?: string
          message: string
          reminder_date: string
          status?: string
          user_id: string
        }
        Update: {
          created_at?: string
          entity_id?: string
          entity_type?: string
          id?: string
          message?: string
          reminder_date?: string
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      invoice_line_items: {
        Row: {
          created_at: string | null
          description: string
          id: string
          invoice_id: string | null
          quantity: number
          sort_order: number | null
          total: number | null
          unit_price: number
        }
        Insert: {
          created_at?: string | null
          description: string
          id?: string
          invoice_id?: string | null
          quantity?: number
          sort_order?: number | null
          total?: number | null
          unit_price: number
        }
        Update: {
          created_at?: string | null
          description?: string
          id?: string
          invoice_id?: string | null
          quantity?: number
          sort_order?: number | null
          total?: number | null
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "invoice_line_items_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          created_at: string | null
          customer_id: string | null
          description: string | null
          due_date: string | null
          estimate_id: string | null
          id: string
          invoice_number: string
          job_id: string | null
          notes: string | null
          paid_at: string | null
          payment_status: string | null
          payment_terms: string | null
          status: Database["public"]["Enums"]["invoice_status"] | null
          stripe_session_id: string | null
          subtotal: number | null
          tax_amount: number | null
          tax_rate: number | null
          title: string
          total_amount: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          customer_id?: string | null
          description?: string | null
          due_date?: string | null
          estimate_id?: string | null
          id?: string
          invoice_number: string
          job_id?: string | null
          notes?: string | null
          paid_at?: string | null
          payment_status?: string | null
          payment_terms?: string | null
          status?: Database["public"]["Enums"]["invoice_status"] | null
          stripe_session_id?: string | null
          subtotal?: number | null
          tax_amount?: number | null
          tax_rate?: number | null
          title: string
          total_amount?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          customer_id?: string | null
          description?: string | null
          due_date?: string | null
          estimate_id?: string | null
          id?: string
          invoice_number?: string
          job_id?: string | null
          notes?: string | null
          paid_at?: string | null
          payment_status?: string | null
          payment_terms?: string | null
          status?: Database["public"]["Enums"]["invoice_status"] | null
          stripe_session_id?: string | null
          subtotal?: number | null
          tax_amount?: number | null
          tax_rate?: number | null
          title?: string
          total_amount?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_estimate_id_fkey"
            columns: ["estimate_id"]
            isOneToOne: false
            referencedRelation: "estimates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      jobs: {
        Row: {
          actual_hours: number | null
          address: string | null
          budget: number | null
          created_at: string | null
          customer_id: string | null
          description: string | null
          end_date: string | null
          estimated_hours: number | null
          id: string
          notes: string | null
          start_date: string | null
          status: Database["public"]["Enums"]["job_status"] | null
          title: string
          total_cost: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          actual_hours?: number | null
          address?: string | null
          budget?: number | null
          created_at?: string | null
          customer_id?: string | null
          description?: string | null
          end_date?: string | null
          estimated_hours?: number | null
          id?: string
          notes?: string | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["job_status"] | null
          title: string
          total_cost?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          actual_hours?: number | null
          address?: string | null
          budget?: number | null
          created_at?: string | null
          customer_id?: string | null
          description?: string | null
          end_date?: string | null
          estimated_hours?: number | null
          id?: string
          notes?: string | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["job_status"] | null
          title?: string
          total_cost?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "jobs_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      kpis: {
        Row: {
          created_at: string | null
          date: string | null
          id: string
          metadata: Json | null
          name: string
          period: string | null
          target: number | null
          unit: string | null
          user_id: string
          value: number | null
        }
        Insert: {
          created_at?: string | null
          date?: string | null
          id?: string
          metadata?: Json | null
          name: string
          period?: string | null
          target?: number | null
          unit?: string | null
          user_id: string
          value?: number | null
        }
        Update: {
          created_at?: string | null
          date?: string | null
          id?: string
          metadata?: Json | null
          name?: string
          period?: string | null
          target?: number | null
          unit?: string | null
          user_id?: string
          value?: number | null
        }
        Relationships: []
      }
      leads: {
        Row: {
          address: string | null
          city: string | null
          created_at: string | null
          email: string | null
          estimated_value: number | null
          expected_close_date: string | null
          first_name: string
          id: string
          last_name: string
          notes: string | null
          phone: string | null
          score: number | null
          source: Database["public"]["Enums"]["lead_source"] | null
          state: string | null
          status: Database["public"]["Enums"]["lead_status"] | null
          updated_at: string | null
          user_id: string
          zip_code: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          created_at?: string | null
          email?: string | null
          estimated_value?: number | null
          expected_close_date?: string | null
          first_name: string
          id?: string
          last_name: string
          notes?: string | null
          phone?: string | null
          score?: number | null
          source?: Database["public"]["Enums"]["lead_source"] | null
          state?: string | null
          status?: Database["public"]["Enums"]["lead_status"] | null
          updated_at?: string | null
          user_id: string
          zip_code?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          created_at?: string | null
          email?: string | null
          estimated_value?: number | null
          expected_close_date?: string | null
          first_name?: string
          id?: string
          last_name?: string
          notes?: string | null
          phone?: string | null
          score?: number | null
          source?: Database["public"]["Enums"]["lead_source"] | null
          state?: string | null
          status?: Database["public"]["Enums"]["lead_status"] | null
          updated_at?: string | null
          user_id?: string
          zip_code?: string | null
        }
        Relationships: []
      }
      line_item_templates: {
        Row: {
          category: string | null
          created_at: string
          description: string
          id: string
          name: string
          unit_price: number
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          description: string
          id?: string
          name: string
          unit_price?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string
          id?: string
          name?: string
          unit_price?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      logo_settings: {
        Row: {
          created_at: string
          id: string
          logo_height: number | null
          logo_position: string | null
          logo_url: string | null
          logo_width: number | null
          show_on_approved: boolean | null
          show_on_drafts: boolean | null
          updated_at: string
          user_id: string
          watermark_opacity: number | null
        }
        Insert: {
          created_at?: string
          id?: string
          logo_height?: number | null
          logo_position?: string | null
          logo_url?: string | null
          logo_width?: number | null
          show_on_approved?: boolean | null
          show_on_drafts?: boolean | null
          updated_at?: string
          user_id: string
          watermark_opacity?: number | null
        }
        Update: {
          created_at?: string
          id?: string
          logo_height?: number | null
          logo_position?: string | null
          logo_url?: string | null
          logo_width?: number | null
          show_on_approved?: boolean | null
          show_on_drafts?: boolean | null
          updated_at?: string
          user_id?: string
          watermark_opacity?: number | null
        }
        Relationships: []
      }
      media_files: {
        Row: {
          created_at: string | null
          extracted_data: string | null
          file_path: string
          id: string
          job_id: string | null
          metadata: Json | null
          thumbnail_path: string | null
          type: Database["public"]["Enums"]["media_type"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          extracted_data?: string | null
          file_path: string
          id?: string
          job_id?: string | null
          metadata?: Json | null
          thumbnail_path?: string | null
          type: Database["public"]["Enums"]["media_type"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          extracted_data?: string | null
          file_path?: string
          id?: string
          job_id?: string | null
          metadata?: Json | null
          thumbnail_path?: string | null
          type?: Database["public"]["Enums"]["media_type"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "media_files_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_preferences: {
        Row: {
          created_at: string
          email_notifications: boolean
          frequency: string
          id: string
          notification_types: Json
          push_notifications: boolean
          quiet_hours: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email_notifications?: boolean
          frequency?: string
          id?: string
          notification_types?: Json
          push_notifications?: boolean
          quiet_hours?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email_notifications?: boolean
          frequency?: string
          id?: string
          notification_types?: Json
          push_notifications?: boolean
          quiet_hours?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      ocr_docs: {
        Row: {
          confidence_score: number | null
          extracted_text: string | null
          file_path: string
          id: string
          language: string | null
          metadata: Json | null
          processed_at: string | null
          user_id: string
        }
        Insert: {
          confidence_score?: number | null
          extracted_text?: string | null
          file_path: string
          id?: string
          language?: string | null
          metadata?: Json | null
          processed_at?: string | null
          user_id: string
        }
        Update: {
          confidence_score?: number | null
          extracted_text?: string | null
          file_path?: string
          id?: string
          language?: string | null
          metadata?: Json | null
          processed_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      offline_tasks: {
        Row: {
          action: string
          created_at: string | null
          data: Json
          error_message: string | null
          id: string
          synced: boolean | null
          synced_at: string | null
          table_name: string
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string | null
          data: Json
          error_message?: string | null
          id?: string
          synced?: boolean | null
          synced_at?: string | null
          table_name: string
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string | null
          data?: Json
          error_message?: string | null
          id?: string
          synced?: boolean | null
          synced_at?: string | null
          table_name?: string
          user_id?: string
        }
        Relationships: []
      }
      payment_methods: {
        Row: {
          created_at: string | null
          id: string
          is_default: boolean | null
          metadata: Json | null
          provider_id: string | null
          type: Database["public"]["Enums"]["payment_method_type"]
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_default?: boolean | null
          metadata?: Json | null
          provider_id?: string | null
          type: Database["public"]["Enums"]["payment_method_type"]
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_default?: boolean | null
          metadata?: Json | null
          provider_id?: string | null
          type?: Database["public"]["Enums"]["payment_method_type"]
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          created_at: string | null
          id: string
          invoice_id: string | null
          notes: string | null
          payment_date: string | null
          payment_method: string | null
          status: Database["public"]["Enums"]["payment_status"] | null
          transaction_id: string | null
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          id?: string
          invoice_id?: string | null
          notes?: string | null
          payment_date?: string | null
          payment_method?: string | null
          status?: Database["public"]["Enums"]["payment_status"] | null
          transaction_id?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          id?: string
          invoice_id?: string | null
          notes?: string | null
          payment_date?: string | null
          payment_method?: string | null
          status?: Database["public"]["Enums"]["payment_status"] | null
          transaction_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          company_name: string | null
          created_at: string | null
          email: string
          first_name: string | null
          id: string
          last_name: string | null
          phone: string | null
          role: Database["public"]["Enums"]["user_role"] | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          company_name?: string | null
          created_at?: string | null
          email: string
          first_name?: string | null
          id: string
          last_name?: string | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          company_name?: string | null
          created_at?: string | null
          email?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      reports: {
        Row: {
          created_at: string | null
          filters: Json | null
          id: string
          name: string
          query: Json
          schedule: Json | null
          type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          filters?: Json | null
          id?: string
          name: string
          query: Json
          schedule?: Json | null
          type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          filters?: Json | null
          id?: string
          name?: string
          query?: Json
          schedule?: Json | null
          type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          created_at: string
          helpful_count: number
          id: string
          name: string
          platform: string
          rating: number
          review_date: string
          text_content: string
          updated_at: string
          user_id: string
          verified: boolean
        }
        Insert: {
          created_at?: string
          helpful_count?: number
          id?: string
          name: string
          platform: string
          rating: number
          review_date: string
          text_content: string
          updated_at?: string
          user_id: string
          verified?: boolean
        }
        Update: {
          created_at?: string
          helpful_count?: number
          id?: string
          name?: string
          platform?: string
          rating?: number
          review_date?: string
          text_content?: string
          updated_at?: string
          user_id?: string
          verified?: boolean
        }
        Relationships: []
      }
      saved_searches: {
        Row: {
          created_at: string
          entity_types: string[]
          filters: Json
          id: string
          name: string
          query: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          entity_types?: string[]
          filters?: Json
          id?: string
          name: string
          query: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          entity_types?: string[]
          filters?: Json
          id?: string
          name?: string
          query?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      sentiment_logs: {
        Row: {
          emotions: Json | null
          entity_id: string
          entity_type: string
          id: string
          processed_at: string | null
          sentiment_label: string | null
          sentiment_score: number | null
          text_content: string
          user_id: string
        }
        Insert: {
          emotions?: Json | null
          entity_id: string
          entity_type: string
          id?: string
          processed_at?: string | null
          sentiment_label?: string | null
          sentiment_score?: number | null
          text_content: string
          user_id: string
        }
        Update: {
          emotions?: Json | null
          entity_id?: string
          entity_type?: string
          id?: string
          processed_at?: string | null
          sentiment_label?: string | null
          sentiment_score?: number | null
          text_content?: string
          user_id?: string
        }
        Relationships: []
      }
      signed_documents: {
        Row: {
          created_at: string | null
          document_name: string
          document_url: string
          expires_at: string | null
          id: string
          metadata: Json | null
          signature_data: string | null
          signed_at: string | null
          signer_email: string
          signer_name: string | null
          status: Database["public"]["Enums"]["document_status"] | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          document_name: string
          document_url: string
          expires_at?: string | null
          id?: string
          metadata?: Json | null
          signature_data?: string | null
          signed_at?: string | null
          signer_email: string
          signer_name?: string | null
          status?: Database["public"]["Enums"]["document_status"] | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          document_name?: string
          document_url?: string
          expires_at?: string | null
          id?: string
          metadata?: Json | null
          signature_data?: string | null
          signed_at?: string | null
          signer_email?: string
          signer_name?: string | null
          status?: Database["public"]["Enums"]["document_status"] | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      social_leads: {
        Row: {
          campaign_source: string | null
          created_at: string | null
          email: string | null
          id: string
          message: string | null
          metadata: Json | null
          name: string | null
          phone: string | null
          platform: string
          platform_lead_id: string | null
          processed: boolean | null
          user_id: string
        }
        Insert: {
          campaign_source?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          message?: string | null
          metadata?: Json | null
          name?: string | null
          phone?: string | null
          platform: string
          platform_lead_id?: string | null
          processed?: boolean | null
          user_id: string
        }
        Update: {
          campaign_source?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          message?: string | null
          metadata?: Json | null
          name?: string | null
          phone?: string | null
          platform?: string
          platform_lead_id?: string | null
          processed?: boolean | null
          user_id?: string
        }
        Relationships: []
      }
      subscribers: {
        Row: {
          created_at: string | null
          email: string | null
          id: string
          metadata: Json | null
          phone: string | null
          source: string | null
          status: string | null
          tags: string[] | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          id?: string
          metadata?: Json | null
          phone?: string | null
          source?: string | null
          status?: string | null
          tags?: string[] | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          email?: string | null
          id?: string
          metadata?: Json | null
          phone?: string | null
          source?: string | null
          status?: string | null
          tags?: string[] | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      tasks: {
        Row: {
          actual_hours: number | null
          assigned_to: string | null
          created_at: string | null
          description: string | null
          due_date: string | null
          estimated_hours: number | null
          id: string
          job_id: string | null
          priority: Database["public"]["Enums"]["task_priority"] | null
          status: Database["public"]["Enums"]["task_status"] | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          actual_hours?: number | null
          assigned_to?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          estimated_hours?: number | null
          id?: string
          job_id?: string | null
          priority?: Database["public"]["Enums"]["task_priority"] | null
          status?: Database["public"]["Enums"]["task_status"] | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          actual_hours?: number | null
          assigned_to?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          estimated_hours?: number | null
          id?: string
          job_id?: string | null
          priority?: Database["public"]["Enums"]["task_priority"] | null
          status?: Database["public"]["Enums"]["task_status"] | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      themes: {
        Row: {
          colors: Json
          company_id: string | null
          created_at: string | null
          fonts: Json | null
          id: string
          is_active: boolean | null
          layout: Json | null
          name: string
          updated_at: string | null
        }
        Insert: {
          colors: Json
          company_id?: string | null
          created_at?: string | null
          fonts?: Json | null
          id?: string
          is_active?: boolean | null
          layout?: Json | null
          name: string
          updated_at?: string | null
        }
        Update: {
          colors?: Json
          company_id?: string | null
          created_at?: string | null
          fonts?: Json | null
          id?: string
          is_active?: boolean | null
          layout?: Json | null
          name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "themes_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      uploads: {
        Row: {
          created_at: string | null
          file_name: string
          file_path: string
          file_size: number | null
          id: string
          mime_type: string | null
          synced: boolean | null
          synced_at: string | null
          uploaded_offline: boolean | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          file_name: string
          file_path: string
          file_size?: number | null
          id?: string
          mime_type?: string | null
          synced?: boolean | null
          synced_at?: string | null
          uploaded_offline?: boolean | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          file_name?: string
          file_path?: string
          file_size?: number | null
          id?: string
          mime_type?: string | null
          synced?: boolean | null
          synced_at?: string | null
          uploaded_offline?: boolean | null
          user_id?: string
        }
        Relationships: []
      }
      user_notifications: {
        Row: {
          action_url: string | null
          created_at: string
          dismissed: boolean
          dismissed_at: string | null
          entity_id: string | null
          entity_type: string | null
          id: string
          message: string
          metadata: Json
          priority: string
          read: boolean
          read_at: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          action_url?: string | null
          created_at?: string
          dismissed?: boolean
          dismissed_at?: string | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          message: string
          metadata?: Json
          priority?: string
          read?: boolean
          read_at?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          action_url?: string | null
          created_at?: string
          dismissed?: boolean
          dismissed_at?: string | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          message?: string
          metadata?: Json
          priority?: string
          read?: boolean
          read_at?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      user_preferences: {
        Row: {
          created_at: string
          default_discount_value: number | null
          discount_type: string | null
          id: string
          preferences: Json
          show_templates: boolean | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          default_discount_value?: number | null
          discount_type?: string | null
          id?: string
          preferences?: Json
          show_templates?: boolean | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          default_discount_value?: number | null
          discount_type?: string | null
          id?: string
          preferences?: Json
          show_templates?: boolean | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_settings: {
        Row: {
          created_at: string | null
          currency: string | null
          date_format: string | null
          id: string
          language: string | null
          number_format: string | null
          preferences: Json | null
          timezone: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          currency?: string | null
          date_format?: string | null
          id?: string
          language?: string | null
          number_format?: string | null
          preferences?: Json | null
          timezone?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          currency?: string | null
          date_format?: string | null
          id?: string
          language?: string | null
          number_format?: string | null
          preferences?: Json | null
          timezone?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      webhooks: {
        Row: {
          active: boolean | null
          created_at: string | null
          events: string[]
          failure_count: number | null
          id: string
          last_triggered: string | null
          name: string
          secret: string | null
          updated_at: string | null
          url: string
          user_id: string
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          events: string[]
          failure_count?: number | null
          id?: string
          last_triggered?: string | null
          name: string
          secret?: string | null
          updated_at?: string | null
          url: string
          user_id: string
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          events?: string[]
          failure_count?: number | null
          id?: string
          last_triggered?: string | null
          name?: string
          secret?: string | null
          updated_at?: string | null
          url?: string
          user_id?: string
        }
        Relationships: []
      }
      workflow_logs: {
        Row: {
          actions_executed: Json | null
          created_at: string | null
          error_message: string | null
          execution_time: number | null
          id: string
          success: boolean | null
          trigger_data: Json | null
          workflow_id: string | null
        }
        Insert: {
          actions_executed?: Json | null
          created_at?: string | null
          error_message?: string | null
          execution_time?: number | null
          id?: string
          success?: boolean | null
          trigger_data?: Json | null
          workflow_id?: string | null
        }
        Update: {
          actions_executed?: Json | null
          created_at?: string | null
          error_message?: string | null
          execution_time?: number | null
          id?: string
          success?: boolean | null
          trigger_data?: Json | null
          workflow_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workflow_logs_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "workflows"
            referencedColumns: ["id"]
          },
        ]
      }
      workflow_steps: {
        Row: {
          created_at: string | null
          id: string
          is_required: boolean | null
          step_config: Json | null
          step_order: number
          step_type: Database["public"]["Enums"]["file_step_type"]
          workflow_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_required?: boolean | null
          step_config?: Json | null
          step_order: number
          step_type: Database["public"]["Enums"]["file_step_type"]
          workflow_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_required?: boolean | null
          step_config?: Json | null
          step_order?: number
          step_type?: Database["public"]["Enums"]["file_step_type"]
          workflow_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workflow_steps_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "file_workflows"
            referencedColumns: ["id"]
          },
        ]
      }
      workflows: {
        Row: {
          actions: Json
          created_at: string | null
          id: string
          last_run: string | null
          name: string
          run_count: number | null
          status: Database["public"]["Enums"]["workflow_status"] | null
          trigger_conditions: Json | null
          trigger_type: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          actions?: Json
          created_at?: string | null
          id?: string
          last_run?: string | null
          name: string
          run_count?: number | null
          status?: Database["public"]["Enums"]["workflow_status"] | null
          trigger_conditions?: Json | null
          trigger_type: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          actions?: Json
          created_at?: string | null
          id?: string
          last_run?: string | null
          name?: string
          run_count?: number | null
          status?: Database["public"]["Enums"]["workflow_status"] | null
          trigger_conditions?: Json | null
          trigger_type?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_client_portal_token: {
        Args: {
          p_customer_id: string
          p_user_id: string
          p_expires_hours?: number
        }
        Returns: string
      }
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_user_role: {
        Args: { user_id: string }
        Returns: string
      }
      is_admin: {
        Args: { user_id: string }
        Returns: boolean
      }
      log_activity: {
        Args: {
          p_action: string
          p_entity_type: string
          p_entity_id: string
          p_description?: string
          p_metadata?: Json
        }
        Returns: undefined
      }
      validate_client_portal_token: {
        Args: { p_token: string }
        Returns: {
          customer_id: string
          user_id: string
          is_valid: boolean
        }[]
      }
    }
    Enums: {
      backup_status: "pending" | "completed" | "failed"
      campaign_status: "draft" | "active" | "paused" | "completed"
      document_status: "pending" | "signed" | "expired" | "cancelled"
      estimate_status:
        | "draft"
        | "sent"
        | "viewed"
        | "approved"
        | "rejected"
        | "expired"
      file_step_type: "upload" | "review" | "approve" | "organize" | "notify"
      integration_status: "active" | "inactive" | "error" | "pending"
      invoice_status:
        | "draft"
        | "sent"
        | "viewed"
        | "paid"
        | "overdue"
        | "cancelled"
      job_status:
        | "quoted"
        | "scheduled"
        | "in_progress"
        | "on_hold"
        | "completed"
        | "cancelled"
        | "approved"
      lead_source:
        | "website"
        | "referral"
        | "google_ads"
        | "facebook"
        | "direct_mail"
        | "cold_call"
        | "trade_show"
        | "other"
      lead_status:
        | "new"
        | "contacted"
        | "qualified"
        | "proposal_sent"
        | "negotiating"
        | "won"
        | "lost"
        | "converted"
      media_type: "photo" | "video" | "barcode" | "qr_code" | "document"
      payment_method_type: "stripe" | "paypal" | "ach" | "credit_card"
      payment_status: "pending" | "completed" | "failed" | "refunded"
      task_priority: "low" | "medium" | "high" | "urgent"
      task_status: "pending" | "in_progress" | "completed" | "cancelled"
      user_role: "admin" | "manager" | "staff" | "client"
      workflow_status: "active" | "inactive" | "error"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      backup_status: ["pending", "completed", "failed"],
      campaign_status: ["draft", "active", "paused", "completed"],
      document_status: ["pending", "signed", "expired", "cancelled"],
      estimate_status: [
        "draft",
        "sent",
        "viewed",
        "approved",
        "rejected",
        "expired",
      ],
      file_step_type: ["upload", "review", "approve", "organize", "notify"],
      integration_status: ["active", "inactive", "error", "pending"],
      invoice_status: [
        "draft",
        "sent",
        "viewed",
        "paid",
        "overdue",
        "cancelled",
      ],
      job_status: [
        "quoted",
        "scheduled",
        "in_progress",
        "on_hold",
        "completed",
        "cancelled",
        "approved",
      ],
      lead_source: [
        "website",
        "referral",
        "google_ads",
        "facebook",
        "direct_mail",
        "cold_call",
        "trade_show",
        "other",
      ],
      lead_status: [
        "new",
        "contacted",
        "qualified",
        "proposal_sent",
        "negotiating",
        "won",
        "lost",
        "converted",
      ],
      media_type: ["photo", "video", "barcode", "qr_code", "document"],
      payment_method_type: ["stripe", "paypal", "ach", "credit_card"],
      payment_status: ["pending", "completed", "failed", "refunded"],
      task_priority: ["low", "medium", "high", "urgent"],
      task_status: ["pending", "in_progress", "completed", "cancelled"],
      user_role: ["admin", "manager", "staff", "client"],
      workflow_status: ["active", "inactive", "error"],
    },
  },
} as const
