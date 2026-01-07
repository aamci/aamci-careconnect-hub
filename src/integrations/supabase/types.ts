export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      allergen_reference: {
        Row: {
          category: string
          code: string
          created_at: string
          is_common: boolean
          name: string
        }
        Insert: {
          category?: string
          code: string
          created_at?: string
          is_common?: boolean
          name: string
        }
        Update: {
          category?: string
          code?: string
          created_at?: string
          is_common?: boolean
          name?: string
        }
        Relationships: []
      }
      appointment_history: {
        Row: {
          action: string
          appointment_id: string
          created_at: string
          details: string | null
          id: string
          new_value: Json | null
          previous_value: Json | null
          user_id: string | null
          user_name: string | null
        }
        Insert: {
          action: string
          appointment_id: string
          created_at?: string
          details?: string | null
          id?: string
          new_value?: Json | null
          previous_value?: Json | null
          user_id?: string | null
          user_name?: string | null
        }
        Update: {
          action?: string
          appointment_id?: string
          created_at?: string
          details?: string | null
          id?: string
          new_value?: Json | null
          previous_value?: Json | null
          user_id?: string | null
          user_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "appointment_history_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
        ]
      }
      appointment_motifs: {
        Row: {
          color: string | null
          created_at: string
          duration: number
          id: string
          instructions: string | null
          is_active: boolean | null
          is_online_bookable: boolean | null
          name: string
          requires_room: boolean | null
          short_name: string | null
          type: string
          updated_at: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          duration?: number
          id?: string
          instructions?: string | null
          is_active?: boolean | null
          is_online_bookable?: boolean | null
          name: string
          requires_room?: boolean | null
          short_name?: string | null
          type: string
          updated_at?: string
        }
        Update: {
          color?: string | null
          created_at?: string
          duration?: number
          id?: string
          instructions?: string | null
          is_active?: boolean | null
          is_online_bookable?: boolean | null
          name?: string
          requires_room?: boolean | null
          short_name?: string | null
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      appointment_recurrences: {
        Row: {
          created_at: string
          created_by: string | null
          day_of_month: number | null
          day_of_week: number | null
          duration: number
          end_date: string | null
          id: string
          is_active: boolean | null
          max_occurrences: number | null
          motif_id: string
          notes: string | null
          occurrences_created: number | null
          patient_id: string
          practitioner_id: string
          recurrence_pattern: string
          room_id: string | null
          site_id: string | null
          start_date: string
          time_slot: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          day_of_month?: number | null
          day_of_week?: number | null
          duration: number
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          max_occurrences?: number | null
          motif_id: string
          notes?: string | null
          occurrences_created?: number | null
          patient_id: string
          practitioner_id: string
          recurrence_pattern: string
          room_id?: string | null
          site_id?: string | null
          start_date: string
          time_slot: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          day_of_month?: number | null
          day_of_week?: number | null
          duration?: number
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          max_occurrences?: number | null
          motif_id?: string
          notes?: string | null
          occurrences_created?: number | null
          patient_id?: string
          practitioner_id?: string
          recurrence_pattern?: string
          room_id?: string | null
          site_id?: string | null
          start_date?: string
          time_slot?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointment_recurrences_motif_id_fkey"
            columns: ["motif_id"]
            isOneToOne: false
            referencedRelation: "appointment_motifs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointment_recurrences_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointment_recurrences_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "v_patient_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointment_recurrences_practitioner_id_fkey"
            columns: ["practitioner_id"]
            isOneToOne: false
            referencedRelation: "practitioners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointment_recurrences_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointment_recurrences_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      appointments: {
        Row: {
          created_at: string
          created_by: string | null
          duration: number
          end_time: string
          id: string
          internal_notes: string | null
          is_first_visit: boolean | null
          is_on_waiting_list: boolean | null
          motif_id: string
          notes: string | null
          patient_id: string
          practitioner_id: string
          referred_by: string | null
          room_id: string | null
          start_time: string
          status: string
          type: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          duration: number
          end_time: string
          id?: string
          internal_notes?: string | null
          is_first_visit?: boolean | null
          is_on_waiting_list?: boolean | null
          motif_id: string
          notes?: string | null
          patient_id: string
          practitioner_id: string
          referred_by?: string | null
          room_id?: string | null
          start_time: string
          status?: string
          type: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          duration?: number
          end_time?: string
          id?: string
          internal_notes?: string | null
          is_first_visit?: boolean | null
          is_on_waiting_list?: boolean | null
          motif_id?: string
          notes?: string | null
          patient_id?: string
          practitioner_id?: string
          referred_by?: string | null
          room_id?: string | null
          start_time?: string
          status?: string
          type?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "appointments_motif_id_fkey"
            columns: ["motif_id"]
            isOneToOne: false
            referencedRelation: "appointment_motifs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "v_patient_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_practitioner_id_fkey"
            columns: ["practitioner_id"]
            isOneToOne: false
            referencedRelation: "practitioners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string
          id: string
          ip_address: unknown
          new_data: Json | null
          old_data: Json | null
          performed_by: string | null
          record_id: string | null
          table_name: string
          user_agent: string | null
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          ip_address?: unknown
          new_data?: Json | null
          old_data?: Json | null
          performed_by?: string | null
          record_id?: string | null
          table_name: string
          user_agent?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          ip_address?: unknown
          new_data?: Json | null
          old_data?: Json | null
          performed_by?: string | null
          record_id?: string | null
          table_name?: string
          user_agent?: string | null
        }
        Relationships: []
      }
      consultations: {
        Row: {
          appointment_id: string | null
          chief_complaint: string | null
          created_at: string
          created_by: string | null
          diagnosis: Json | null
          end_time: string | null
          follow_up_instructions: string | null
          history_of_present_illness: string | null
          id: string
          notes: string | null
          patient_id: string
          physical_examination: Json | null
          practitioner_id: string
          prescriptions: Json | null
          start_time: string
          status: string
          treatment_plan: string | null
          updated_at: string
        }
        Insert: {
          appointment_id?: string | null
          chief_complaint?: string | null
          created_at?: string
          created_by?: string | null
          diagnosis?: Json | null
          end_time?: string | null
          follow_up_instructions?: string | null
          history_of_present_illness?: string | null
          id?: string
          notes?: string | null
          patient_id: string
          physical_examination?: Json | null
          practitioner_id: string
          prescriptions?: Json | null
          start_time?: string
          status?: string
          treatment_plan?: string | null
          updated_at?: string
        }
        Update: {
          appointment_id?: string | null
          chief_complaint?: string | null
          created_at?: string
          created_by?: string | null
          diagnosis?: Json | null
          end_time?: string | null
          follow_up_instructions?: string | null
          history_of_present_illness?: string | null
          id?: string
          notes?: string | null
          patient_id?: string
          physical_examination?: Json | null
          practitioner_id?: string
          prescriptions?: Json | null
          start_time?: string
          status?: string
          treatment_plan?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "consultations_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consultations_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consultations_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "v_patient_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consultations_practitioner_id_fkey"
            columns: ["practitioner_id"]
            isOneToOne: false
            referencedRelation: "practitioners"
            referencedColumns: ["id"]
          },
        ]
      }
      conversation_participants: {
        Row: {
          conversation_id: string
          id: string
          is_muted: boolean | null
          joined_at: string
          last_read_at: string | null
          left_at: string | null
          role: string | null
          user_id: string
        }
        Insert: {
          conversation_id: string
          id?: string
          is_muted?: boolean | null
          joined_at?: string
          last_read_at?: string | null
          left_at?: string | null
          role?: string | null
          user_id: string
        }
        Update: {
          conversation_id?: string
          id?: string
          is_muted?: boolean | null
          joined_at?: string
          last_read_at?: string | null
          left_at?: string | null
          role?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversation_participants_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          is_archived: boolean | null
          last_message_at: string | null
          metadata: Json | null
          organization_id: string | null
          patient_id: string | null
          title: string | null
          type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          is_archived?: boolean | null
          last_message_at?: string | null
          metadata?: Json | null
          organization_id?: string | null
          patient_id?: string | null
          title?: string | null
          type?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          is_archived?: boolean | null
          last_message_at?: string | null
          metadata?: Json | null
          organization_id?: string | null
          patient_id?: string | null
          title?: string | null
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "v_patient_summary"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          appointment_id: string | null
          category: string | null
          created_at: string
          file_path: string | null
          file_size: number | null
          id: string
          mime_type: string | null
          name: string
          patient_id: string
          storage_bucket: string | null
          type: string | null
          updated_at: string
          uploaded_by: string | null
        }
        Insert: {
          appointment_id?: string | null
          category?: string | null
          created_at?: string
          file_path?: string | null
          file_size?: number | null
          id?: string
          mime_type?: string | null
          name: string
          patient_id: string
          storage_bucket?: string | null
          type?: string | null
          updated_at?: string
          uploaded_by?: string | null
        }
        Update: {
          appointment_id?: string | null
          category?: string | null
          created_at?: string
          file_path?: string | null
          file_size?: number | null
          id?: string
          mime_type?: string | null
          name?: string
          patient_id?: string
          storage_bucket?: string | null
          type?: string | null
          updated_at?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "documents_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "v_patient_summary"
            referencedColumns: ["id"]
          },
        ]
      }
      invoice_items: {
        Row: {
          code: string | null
          created_at: string
          description: string
          discount_percent: number | null
          id: string
          invoice_id: string
          metadata: Json | null
          quantity: number
          sort_order: number | null
          tax_rate: number | null
          total_price: number
          unit_price: number
        }
        Insert: {
          code?: string | null
          created_at?: string
          description: string
          discount_percent?: number | null
          id?: string
          invoice_id: string
          metadata?: Json | null
          quantity?: number
          sort_order?: number | null
          tax_rate?: number | null
          total_price: number
          unit_price: number
        }
        Update: {
          code?: string | null
          created_at?: string
          description?: string
          discount_percent?: number | null
          id?: string
          invoice_id?: string
          metadata?: Json | null
          quantity?: number
          sort_order?: number | null
          tax_rate?: number | null
          total_price?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "invoice_items_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          appointment_id: string | null
          billing_address: Json | null
          cancelled_at: string | null
          consultation_id: string | null
          created_at: string
          created_by: string | null
          currency: string | null
          discount_amount: number | null
          due_date: string | null
          id: string
          invoice_number: string | null
          issue_date: string
          metadata: Json | null
          notes: string | null
          organization_id: string | null
          paid_amount: number | null
          paid_at: string | null
          patient_id: string
          payment_terms: string | null
          practitioner_id: string | null
          sent_at: string | null
          status: string
          subtotal: number
          tax_amount: number | null
          total_amount: number
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          appointment_id?: string | null
          billing_address?: Json | null
          cancelled_at?: string | null
          consultation_id?: string | null
          created_at?: string
          created_by?: string | null
          currency?: string | null
          discount_amount?: number | null
          due_date?: string | null
          id?: string
          invoice_number?: string | null
          issue_date?: string
          metadata?: Json | null
          notes?: string | null
          organization_id?: string | null
          paid_amount?: number | null
          paid_at?: string | null
          patient_id: string
          payment_terms?: string | null
          practitioner_id?: string | null
          sent_at?: string | null
          status?: string
          subtotal?: number
          tax_amount?: number | null
          total_amount?: number
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          appointment_id?: string | null
          billing_address?: Json | null
          cancelled_at?: string | null
          consultation_id?: string | null
          created_at?: string
          created_by?: string | null
          currency?: string | null
          discount_amount?: number | null
          due_date?: string | null
          id?: string
          invoice_number?: string | null
          issue_date?: string
          metadata?: Json | null
          notes?: string | null
          organization_id?: string | null
          paid_amount?: number | null
          paid_at?: string | null
          patient_id?: string
          payment_terms?: string | null
          practitioner_id?: string | null
          sent_at?: string | null
          status?: string
          subtotal?: number
          tax_amount?: number | null
          total_amount?: number
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invoices_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_consultation_id_fkey"
            columns: ["consultation_id"]
            isOneToOne: false
            referencedRelation: "consultations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "v_patient_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_practitioner_id_fkey"
            columns: ["practitioner_id"]
            isOneToOne: false
            referencedRelation: "practitioners"
            referencedColumns: ["id"]
          },
        ]
      }
      lab_results: {
        Row: {
          category: string | null
          created_at: string
          document_id: string | null
          id: string
          interpretation: string | null
          is_abnormal: boolean | null
          lab_name: string | null
          notes: string | null
          patient_id: string
          practitioner_id: string | null
          received_date: string | null
          results: Json
          reviewed_at: string | null
          reviewed_by: string | null
          status: string | null
          test_date: string
          updated_at: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          document_id?: string | null
          id?: string
          interpretation?: string | null
          is_abnormal?: boolean | null
          lab_name?: string | null
          notes?: string | null
          patient_id: string
          practitioner_id?: string | null
          received_date?: string | null
          results?: Json
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          test_date: string
          updated_at?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          document_id?: string | null
          id?: string
          interpretation?: string | null
          is_abnormal?: boolean | null
          lab_name?: string | null
          notes?: string | null
          patient_id?: string
          practitioner_id?: string | null
          received_date?: string | null
          results?: Json
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          test_date?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lab_results_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lab_results_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lab_results_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "v_patient_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lab_results_practitioner_id_fkey"
            columns: ["practitioner_id"]
            isOneToOne: false
            referencedRelation: "practitioners"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          attachments: Json | null
          content: string
          conversation_id: string
          created_at: string
          deleted_at: string | null
          edited_at: string | null
          id: string
          is_deleted: boolean | null
          is_edited: boolean | null
          metadata: Json | null
          reply_to_id: string | null
          sender_id: string | null
          type: string | null
          updated_at: string
        }
        Insert: {
          attachments?: Json | null
          content: string
          conversation_id: string
          created_at?: string
          deleted_at?: string | null
          edited_at?: string | null
          id?: string
          is_deleted?: boolean | null
          is_edited?: boolean | null
          metadata?: Json | null
          reply_to_id?: string | null
          sender_id?: string | null
          type?: string | null
          updated_at?: string
        }
        Update: {
          attachments?: Json | null
          content?: string
          conversation_id?: string
          created_at?: string
          deleted_at?: string | null
          edited_at?: string | null
          id?: string
          is_deleted?: boolean | null
          is_edited?: boolean | null
          metadata?: Json | null
          reply_to_id?: string | null
          sender_id?: string | null
          type?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_reply_to_id_fkey"
            columns: ["reply_to_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
        ]
      }
      notes: {
        Row: {
          appointment_id: string | null
          author_id: string | null
          author_name: string | null
          content: string
          created_at: string
          id: string
          is_urgent: boolean | null
          patient_id: string | null
          send_to_secretariat: boolean | null
          updated_at: string
        }
        Insert: {
          appointment_id?: string | null
          author_id?: string | null
          author_name?: string | null
          content: string
          created_at?: string
          id?: string
          is_urgent?: boolean | null
          patient_id?: string | null
          send_to_secretariat?: boolean | null
          updated_at?: string
        }
        Update: {
          appointment_id?: string | null
          author_id?: string | null
          author_name?: string | null
          content?: string
          created_at?: string
          id?: string
          is_urgent?: boolean | null
          patient_id?: string | null
          send_to_secretariat?: boolean | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "notes_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notes_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notes_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "v_patient_summary"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_preferences: {
        Row: {
          channels: Json
          created_at: string
          email_digest: string | null
          id: string
          quiet_hours: Json | null
          types: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          channels?: Json
          created_at?: string
          email_digest?: string | null
          id?: string
          quiet_hours?: Json | null
          types?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          channels?: Json
          created_at?: string
          email_digest?: string | null
          id?: string
          quiet_hours?: Json | null
          types?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      opening_motifs: {
        Row: {
          created_at: string
          id: string
          max_appointments: number | null
          motif_id: string
          opening_id: string | null
          series_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          max_appointments?: number | null
          motif_id: string
          opening_id?: string | null
          series_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          max_appointments?: number | null
          motif_id?: string
          opening_id?: string | null
          series_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "opening_motifs_motif_id_fkey"
            columns: ["motif_id"]
            isOneToOne: false
            referencedRelation: "appointment_motifs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "opening_motifs_opening_id_fkey"
            columns: ["opening_id"]
            isOneToOne: false
            referencedRelation: "practitioner_openings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "opening_motifs_opening_id_fkey"
            columns: ["opening_id"]
            isOneToOne: false
            referencedRelation: "v_openings_with_details"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "opening_motifs_series_id_fkey"
            columns: ["series_id"]
            isOneToOne: false
            referencedRelation: "opening_series"
            referencedColumns: ["id"]
          },
        ]
      }
      opening_series: {
        Row: {
          color: string | null
          created_at: string
          created_by: string | null
          id: string
          is_active: boolean | null
          practitioner_id: string
          recurrence_days: number[] | null
          recurrence_end_date: string | null
          recurrence_interval: number | null
          recurrence_type: string
          site_id: string | null
          title: string
          updated_at: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          practitioner_id: string
          recurrence_days?: number[] | null
          recurrence_end_date?: string | null
          recurrence_interval?: number | null
          recurrence_type: string
          site_id?: string | null
          title?: string
          updated_at?: string
        }
        Update: {
          color?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          practitioner_id?: string
          recurrence_days?: number[] | null
          recurrence_end_date?: string | null
          recurrence_interval?: number | null
          recurrence_type?: string
          site_id?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "opening_series_practitioner_id_fkey"
            columns: ["practitioner_id"]
            isOneToOne: false
            referencedRelation: "practitioners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "opening_series_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_members: {
        Row: {
          created_at: string
          id: string
          is_active: boolean | null
          joined_at: string
          left_at: string | null
          organization_id: string
          permissions: Json | null
          role: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean | null
          joined_at?: string
          left_at?: string | null
          organization_id: string
          permissions?: Json | null
          role?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean | null
          joined_at?: string
          left_at?: string | null
          organization_id?: string
          permissions?: Json | null
          role?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_members_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          address: string | null
          city: string | null
          created_at: string
          created_by: string | null
          email: string | null
          id: string
          is_active: boolean | null
          logo_url: string | null
          name: string
          phone: string | null
          postal_code: string | null
          settings: Json | null
          slug: string | null
          type: string | null
          updated_at: string
          updated_by: string | null
          website: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          created_at?: string
          created_by?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          name: string
          phone?: string | null
          postal_code?: string | null
          settings?: Json | null
          slug?: string | null
          type?: string | null
          updated_at?: string
          updated_by?: string | null
          website?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          created_at?: string
          created_by?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          name?: string
          phone?: string | null
          postal_code?: string | null
          settings?: Json | null
          slug?: string | null
          type?: string | null
          updated_at?: string
          updated_by?: string | null
          website?: string | null
        }
        Relationships: []
      }
      patient_alerts: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          is_active: boolean | null
          message: string
          patient_id: string
          resolved_at: string | null
          resolved_by: string | null
          severity: string
          type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          message: string
          patient_id: string
          resolved_at?: string | null
          resolved_by?: string | null
          severity: string
          type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          message?: string
          patient_id?: string
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "patient_alerts_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patient_alerts_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "v_patient_summary"
            referencedColumns: ["id"]
          },
        ]
      }
      patient_allergies: {
        Row: {
          allergen_code: string
          confirmed_by: string | null
          confirmed_date: string | null
          created_at: string
          created_by: string | null
          id: string
          is_active: boolean
          notes: string | null
          patient_id: string
          reaction_description: string | null
          severity: Database["public"]["Enums"]["antecedent_severity"]
          source: string
          updated_at: string
        }
        Insert: {
          allergen_code: string
          confirmed_by?: string | null
          confirmed_date?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          notes?: string | null
          patient_id: string
          reaction_description?: string | null
          severity?: Database["public"]["Enums"]["antecedent_severity"]
          source?: string
          updated_at?: string
        }
        Update: {
          allergen_code?: string
          confirmed_by?: string | null
          confirmed_date?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          notes?: string | null
          patient_id?: string
          reaction_description?: string | null
          severity?: Database["public"]["Enums"]["antecedent_severity"]
          source?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "patient_allergies_allergen_code_fkey"
            columns: ["allergen_code"]
            isOneToOne: false
            referencedRelation: "allergen_reference"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "patient_allergies_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patient_allergies_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "v_patient_summary"
            referencedColumns: ["id"]
          },
        ]
      }
      patient_antecedents: {
        Row: {
          category: Database["public"]["Enums"]["antecedent_category"]
          created_at: string
          description: string | null
          id: string
          is_active: boolean | null
          notes: string | null
          occurrence_date: string | null
          patient_id: string
          severity: Database["public"]["Enums"]["antecedent_severity"] | null
          title: string
          updated_at: string
        }
        Insert: {
          category: Database["public"]["Enums"]["antecedent_category"]
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          notes?: string | null
          occurrence_date?: string | null
          patient_id: string
          severity?: Database["public"]["Enums"]["antecedent_severity"] | null
          title: string
          updated_at?: string
        }
        Update: {
          category?: Database["public"]["Enums"]["antecedent_category"]
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          notes?: string | null
          occurrence_date?: string | null
          patient_id?: string
          severity?: Database["public"]["Enums"]["antecedent_severity"] | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      patient_memos: {
        Row: {
          content: string
          created_at: string
          id: string
          patient_id: string
          updated_at: string
        }
        Insert: {
          content?: string
          created_at?: string
          id?: string
          patient_id: string
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          patient_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      patients: {
        Row: {
          address: string | null
          birth_place: string | null
          city: string | null
          created_at: string
          created_by: string | null
          date_of_birth: string
          email: string | null
          first_name: string
          gender: string
          id: string
          insurance_number: string | null
          insurance_provider: string | null
          is_active: boolean | null
          last_name: string
          notes: string | null
          phone: string | null
          phone_secondary: string | null
          postal_code: string | null
          referring_doctor: string | null
          updated_at: string
          updated_by: string | null
          used_first_name: string | null
          used_last_name: string | null
        }
        Insert: {
          address?: string | null
          birth_place?: string | null
          city?: string | null
          created_at?: string
          created_by?: string | null
          date_of_birth: string
          email?: string | null
          first_name: string
          gender: string
          id?: string
          insurance_number?: string | null
          insurance_provider?: string | null
          is_active?: boolean | null
          last_name: string
          notes?: string | null
          phone?: string | null
          phone_secondary?: string | null
          postal_code?: string | null
          referring_doctor?: string | null
          updated_at?: string
          updated_by?: string | null
          used_first_name?: string | null
          used_last_name?: string | null
        }
        Update: {
          address?: string | null
          birth_place?: string | null
          city?: string | null
          created_at?: string
          created_by?: string | null
          date_of_birth?: string
          email?: string | null
          first_name?: string
          gender?: string
          id?: string
          insurance_number?: string | null
          insurance_provider?: string | null
          is_active?: boolean | null
          last_name?: string
          notes?: string | null
          phone?: string | null
          phone_secondary?: string | null
          postal_code?: string | null
          referring_doctor?: string | null
          updated_at?: string
          updated_by?: string | null
          used_first_name?: string | null
          used_last_name?: string | null
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          created_by: string | null
          id: string
          invoice_id: string | null
          metadata: Json | null
          notes: string | null
          patient_id: string
          payment_date: string
          payment_method: string
          reference: string | null
          status: string
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          created_by?: string | null
          id?: string
          invoice_id?: string | null
          metadata?: Json | null
          notes?: string | null
          patient_id: string
          payment_date?: string
          payment_method: string
          reference?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          created_by?: string | null
          id?: string
          invoice_id?: string | null
          metadata?: Json | null
          notes?: string | null
          patient_id?: string
          payment_date?: string
          payment_method?: string
          reference?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "v_patient_summary"
            referencedColumns: ["id"]
          },
        ]
      }
      practitioner_availability: {
        Row: {
          created_at: string
          day_of_week: number
          effective_from: string | null
          effective_to: string | null
          end_time: string
          id: string
          is_recurring: boolean | null
          practitioner_id: string
          site_id: string | null
          start_time: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          day_of_week: number
          effective_from?: string | null
          effective_to?: string | null
          end_time: string
          id?: string
          is_recurring?: boolean | null
          practitioner_id: string
          site_id?: string | null
          start_time: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          day_of_week?: number
          effective_from?: string | null
          effective_to?: string | null
          end_time?: string
          id?: string
          is_recurring?: boolean | null
          practitioner_id?: string
          site_id?: string | null
          start_time?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "practitioner_availability_practitioner_id_fkey"
            columns: ["practitioner_id"]
            isOneToOne: false
            referencedRelation: "practitioners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "practitioner_availability_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      practitioner_exceptions: {
        Row: {
          created_at: string
          created_by: string | null
          end_time: string | null
          exception_date: string
          id: string
          is_all_day: boolean | null
          practitioner_id: string
          reason: string | null
          start_time: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          end_time?: string | null
          exception_date: string
          id?: string
          is_all_day?: boolean | null
          practitioner_id: string
          reason?: string | null
          start_time?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          end_time?: string | null
          exception_date?: string
          id?: string
          is_all_day?: boolean | null
          practitioner_id?: string
          reason?: string | null
          start_time?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "practitioner_exceptions_practitioner_id_fkey"
            columns: ["practitioner_id"]
            isOneToOne: false
            referencedRelation: "practitioners"
            referencedColumns: ["id"]
          },
        ]
      }
      practitioner_openings: {
        Row: {
          color: string | null
          created_at: string
          created_by: string | null
          end_time: string
          id: string
          is_cancelled: boolean | null
          is_exception: boolean | null
          opening_date: string
          practitioner_id: string
          series_id: string | null
          site_id: string | null
          start_time: string
          substitute_id: string | null
          title: string
          updated_at: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          created_by?: string | null
          end_time: string
          id?: string
          is_cancelled?: boolean | null
          is_exception?: boolean | null
          opening_date: string
          practitioner_id: string
          series_id?: string | null
          site_id?: string | null
          start_time: string
          substitute_id?: string | null
          title?: string
          updated_at?: string
        }
        Update: {
          color?: string | null
          created_at?: string
          created_by?: string | null
          end_time?: string
          id?: string
          is_cancelled?: boolean | null
          is_exception?: boolean | null
          opening_date?: string
          practitioner_id?: string
          series_id?: string | null
          site_id?: string | null
          start_time?: string
          substitute_id?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "practitioner_openings_practitioner_id_fkey"
            columns: ["practitioner_id"]
            isOneToOne: false
            referencedRelation: "practitioners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "practitioner_openings_series_id_fkey"
            columns: ["series_id"]
            isOneToOne: false
            referencedRelation: "opening_series"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "practitioner_openings_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "practitioner_openings_substitute_id_fkey"
            columns: ["substitute_id"]
            isOneToOne: false
            referencedRelation: "practitioners"
            referencedColumns: ["id"]
          },
        ]
      }
      practitioners: {
        Row: {
          avatar_url: string | null
          color: string | null
          created_at: string
          email: string | null
          first_name: string
          id: string
          is_active: boolean | null
          last_name: string
          phone: string | null
          site_ids: string[] | null
          specialty: string | null
          title: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          avatar_url?: string | null
          color?: string | null
          created_at?: string
          email?: string | null
          first_name: string
          id?: string
          is_active?: boolean | null
          last_name: string
          phone?: string | null
          site_ids?: string[] | null
          specialty?: string | null
          title?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          avatar_url?: string | null
          color?: string | null
          created_at?: string
          email?: string | null
          first_name?: string
          id?: string
          is_active?: boolean | null
          last_name?: string
          phone?: string | null
          site_ids?: string[] | null
          specialty?: string | null
          title?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      prescriptions: {
        Row: {
          appointment_id: string | null
          consultation_id: string | null
          content: Json
          created_at: string
          created_by: string | null
          duration_days: number | null
          end_date: string | null
          id: string
          max_renewals: number | null
          notes: string | null
          patient_id: string
          practitioner_id: string
          renewable: boolean | null
          renewal_count: number | null
          signed_at: string | null
          signed_by: string | null
          start_date: string | null
          status: string
          type: string
          updated_at: string
        }
        Insert: {
          appointment_id?: string | null
          consultation_id?: string | null
          content?: Json
          created_at?: string
          created_by?: string | null
          duration_days?: number | null
          end_date?: string | null
          id?: string
          max_renewals?: number | null
          notes?: string | null
          patient_id: string
          practitioner_id: string
          renewable?: boolean | null
          renewal_count?: number | null
          signed_at?: string | null
          signed_by?: string | null
          start_date?: string | null
          status?: string
          type?: string
          updated_at?: string
        }
        Update: {
          appointment_id?: string | null
          consultation_id?: string | null
          content?: Json
          created_at?: string
          created_by?: string | null
          duration_days?: number | null
          end_date?: string | null
          id?: string
          max_renewals?: number | null
          notes?: string | null
          patient_id?: string
          practitioner_id?: string
          renewable?: boolean | null
          renewal_count?: number | null
          signed_at?: string | null
          signed_by?: string | null
          start_date?: string | null
          status?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "prescriptions_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prescriptions_consultation_id_fkey"
            columns: ["consultation_id"]
            isOneToOne: false
            referencedRelation: "consultations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prescriptions_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prescriptions_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "v_patient_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prescriptions_practitioner_id_fkey"
            columns: ["practitioner_id"]
            isOneToOne: false
            referencedRelation: "practitioners"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          department: string | null
          full_name: string | null
          id: string
          job_title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          department?: string | null
          full_name?: string | null
          id?: string
          job_title?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          department?: string | null
          full_name?: string | null
          id?: string
          job_title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      rooms: {
        Row: {
          capacity: number | null
          created_at: string
          equipment: Json | null
          id: string
          is_active: boolean | null
          name: string
          site_id: string
          updated_at: string
        }
        Insert: {
          capacity?: number | null
          created_at?: string
          equipment?: Json | null
          id?: string
          is_active?: boolean | null
          name: string
          site_id: string
          updated_at?: string
        }
        Update: {
          capacity?: number | null
          created_at?: string
          equipment?: Json | null
          id?: string
          is_active?: boolean | null
          name?: string
          site_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "rooms_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      sites: {
        Row: {
          address: string | null
          city: string | null
          created_at: string
          created_by: string | null
          email: string | null
          id: string
          is_active: boolean | null
          name: string
          phone: string | null
          postal_code: string | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          created_at?: string
          created_by?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          phone?: string | null
          postal_code?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          created_at?: string
          created_by?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          phone?: string | null
          postal_code?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      tasks: {
        Row: {
          appointment_id: string | null
          assignee_id: string | null
          assignee_name: string | null
          completed_at: string | null
          created_at: string
          created_by: string | null
          description: string | null
          due_date: string | null
          id: string
          patient_id: string | null
          priority: string
          status: string
          title: string
          type: string
          updated_at: string
        }
        Insert: {
          appointment_id?: string | null
          assignee_id?: string | null
          assignee_name?: string | null
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          patient_id?: string | null
          priority?: string
          status?: string
          title: string
          type: string
          updated_at?: string
        }
        Update: {
          appointment_id?: string | null
          assignee_id?: string | null
          assignee_name?: string | null
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          patient_id?: string | null
          priority?: string
          status?: string
          title?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "v_patient_summary"
            referencedColumns: ["id"]
          },
        ]
      }
      user_preferences: {
        Row: {
          created_at: string
          id: string
          preference_key: string
          preference_value: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          preference_key: string
          preference_value: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          preference_key?: string
          preference_value?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      vaccinations: {
        Row: {
          administration_date: string
          administration_site: string | null
          batch_number: string | null
          created_at: string
          created_by: string | null
          dose_number: number | null
          id: string
          manufacturer: string | null
          next_dose_date: string | null
          notes: string | null
          patient_id: string
          practitioner_id: string | null
          updated_at: string
          vaccine_code: string | null
          vaccine_name: string
        }
        Insert: {
          administration_date: string
          administration_site?: string | null
          batch_number?: string | null
          created_at?: string
          created_by?: string | null
          dose_number?: number | null
          id?: string
          manufacturer?: string | null
          next_dose_date?: string | null
          notes?: string | null
          patient_id: string
          practitioner_id?: string | null
          updated_at?: string
          vaccine_code?: string | null
          vaccine_name: string
        }
        Update: {
          administration_date?: string
          administration_site?: string | null
          batch_number?: string | null
          created_at?: string
          created_by?: string | null
          dose_number?: number | null
          id?: string
          manufacturer?: string | null
          next_dose_date?: string | null
          notes?: string | null
          patient_id?: string
          practitioner_id?: string | null
          updated_at?: string
          vaccine_code?: string | null
          vaccine_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "vaccinations_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vaccinations_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "v_patient_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vaccinations_practitioner_id_fkey"
            columns: ["practitioner_id"]
            isOneToOne: false
            referencedRelation: "practitioners"
            referencedColumns: ["id"]
          },
        ]
      }
      vital_signs: {
        Row: {
          blood_glucose: number | null
          bmi: number | null
          consultation_id: string | null
          created_at: string
          diastolic_bp: number | null
          heart_rate: number | null
          height_cm: number | null
          id: string
          notes: string | null
          oxygen_saturation: number | null
          patient_id: string
          recorded_at: string
          recorded_by: string | null
          respiratory_rate: number | null
          systolic_bp: number | null
          temperature_c: number | null
          weight_kg: number | null
        }
        Insert: {
          blood_glucose?: number | null
          bmi?: number | null
          consultation_id?: string | null
          created_at?: string
          diastolic_bp?: number | null
          heart_rate?: number | null
          height_cm?: number | null
          id?: string
          notes?: string | null
          oxygen_saturation?: number | null
          patient_id: string
          recorded_at?: string
          recorded_by?: string | null
          respiratory_rate?: number | null
          systolic_bp?: number | null
          temperature_c?: number | null
          weight_kg?: number | null
        }
        Update: {
          blood_glucose?: number | null
          bmi?: number | null
          consultation_id?: string | null
          created_at?: string
          diastolic_bp?: number | null
          heart_rate?: number | null
          height_cm?: number | null
          id?: string
          notes?: string | null
          oxygen_saturation?: number | null
          patient_id?: string
          recorded_at?: string
          recorded_by?: string | null
          respiratory_rate?: number | null
          systolic_bp?: number | null
          temperature_c?: number | null
          weight_kg?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "vital_signs_consultation_id_fkey"
            columns: ["consultation_id"]
            isOneToOne: false
            referencedRelation: "consultations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vital_signs_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vital_signs_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "v_patient_summary"
            referencedColumns: ["id"]
          },
        ]
      }
      waiting_list: {
        Row: {
          contacted_at: string | null
          created_at: string
          created_by: string | null
          expires_at: string | null
          id: string
          motif_id: string | null
          notes: string | null
          patient_id: string
          practitioner_id: string | null
          preferred_days: number[] | null
          priority: number | null
          requested_date_from: string | null
          requested_date_to: string | null
          requested_time_from: string | null
          requested_time_to: string | null
          scheduled_appointment_id: string | null
          site_id: string | null
          status: string
          updated_at: string
        }
        Insert: {
          contacted_at?: string | null
          created_at?: string
          created_by?: string | null
          expires_at?: string | null
          id?: string
          motif_id?: string | null
          notes?: string | null
          patient_id: string
          practitioner_id?: string | null
          preferred_days?: number[] | null
          priority?: number | null
          requested_date_from?: string | null
          requested_date_to?: string | null
          requested_time_from?: string | null
          requested_time_to?: string | null
          scheduled_appointment_id?: string | null
          site_id?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          contacted_at?: string | null
          created_at?: string
          created_by?: string | null
          expires_at?: string | null
          id?: string
          motif_id?: string | null
          notes?: string | null
          patient_id?: string
          practitioner_id?: string | null
          preferred_days?: number[] | null
          priority?: number | null
          requested_date_from?: string | null
          requested_date_to?: string | null
          requested_time_from?: string | null
          requested_time_to?: string | null
          scheduled_appointment_id?: string | null
          site_id?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "waiting_list_motif_id_fkey"
            columns: ["motif_id"]
            isOneToOne: false
            referencedRelation: "appointment_motifs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "waiting_list_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "waiting_list_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "v_patient_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "waiting_list_practitioner_id_fkey"
            columns: ["practitioner_id"]
            isOneToOne: false
            referencedRelation: "practitioners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "waiting_list_scheduled_appointment_id_fkey"
            columns: ["scheduled_appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "waiting_list_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      v_active_patient_alerts: {
        Row: {
          created_at: string | null
          created_by: string | null
          id: string | null
          message: string | null
          patient_id: string | null
          severity: string | null
          type: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          id?: string | null
          message?: string | null
          patient_id?: string | null
          severity?: string | null
          type?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          id?: string | null
          message?: string | null
          patient_id?: string | null
          severity?: string | null
          type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "patient_alerts_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patient_alerts_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "v_patient_summary"
            referencedColumns: ["id"]
          },
        ]
      }
      v_active_patient_allergies: {
        Row: {
          allergen_category: string | null
          allergen_code: string | null
          allergen_name: string | null
          confirmed_date: string | null
          created_at: string | null
          id: string | null
          patient_id: string | null
          reaction_description: string | null
          severity: Database["public"]["Enums"]["antecedent_severity"] | null
          source: string | null
        }
        Relationships: [
          {
            foreignKeyName: "patient_allergies_allergen_code_fkey"
            columns: ["allergen_code"]
            isOneToOne: false
            referencedRelation: "allergen_reference"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "patient_allergies_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patient_allergies_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "v_patient_summary"
            referencedColumns: ["id"]
          },
        ]
      }
      v_openings_with_details: {
        Row: {
          color: string | null
          created_at: string | null
          end_time: string | null
          id: string | null
          is_cancelled: boolean | null
          is_exception: boolean | null
          is_recurring: boolean | null
          motifs: Json | null
          opening_date: string | null
          practitioner_color: string | null
          practitioner_first_name: string | null
          practitioner_id: string | null
          practitioner_last_name: string | null
          recurrence_days: number[] | null
          recurrence_interval: number | null
          recurrence_type: string | null
          series_id: string | null
          site_id: string | null
          site_name: string | null
          start_time: string | null
          substitute_id: string | null
          title: string | null
          updated_at: string | null
        }
        Relationships: [
          {
            foreignKeyName: "practitioner_openings_practitioner_id_fkey"
            columns: ["practitioner_id"]
            isOneToOne: false
            referencedRelation: "practitioners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "practitioner_openings_series_id_fkey"
            columns: ["series_id"]
            isOneToOne: false
            referencedRelation: "opening_series"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "practitioner_openings_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "practitioner_openings_substitute_id_fkey"
            columns: ["substitute_id"]
            isOneToOne: false
            referencedRelation: "practitioners"
            referencedColumns: ["id"]
          },
        ]
      }
      v_patient_summary: {
        Row: {
          active_alerts_count: number | null
          active_allergies_count: number | null
          created_at: string | null
          date_of_birth: string | null
          email: string | null
          first_name: string | null
          gender: string | null
          id: string | null
          is_active: boolean | null
          last_name: string | null
          phone: string | null
          updated_at: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      broadcast_notification_to_tenant: {
        Args: {
          p_link?: string
          p_message: string
          p_metadata?: Json
          p_priority?: string
          p_tenant_id: string
          p_title: string
          p_type: string
        }
        Returns: number
      }
      cleanup_old_notifications: {
        Args: { p_days_old?: number }
        Returns: number
      }
      get_current_tenant_id: { Args: never; Returns: string }
      get_current_user_id: { Args: never; Returns: string }
      get_patient_alert_counts: {
        Args: { p_patient_id: string }
        Returns: {
          active_alerts: number
          active_allergies: number
        }[]
      }
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_project_access: { Args: { p_project_id: string }; Returns: boolean }
      has_project_permission: {
        Args: { p_permission_code: string; p_project_id: string }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: { _user_id: string }; Returns: boolean }
      is_platform_admin: { Args: never; Returns: boolean }
      is_tenant_admin: { Args: never; Returns: boolean }
      send_notification: {
        Args: {
          p_link?: string
          p_message: string
          p_metadata?: Json
          p_priority?: string
          p_tenant_id: string
          p_title: string
          p_type: string
          p_user_id: string
        }
        Returns: string
      }
    }
    Enums: {
      ai_system_status: "draft" | "active" | "suspended" | "decommissioned"
      antecedent_category:
        | "medical"
        | "cardiovascular"
        | "surgical"
        | "allergies"
        | "family"
        | "lifestyle"
      antecedent_severity: "low" | "medium" | "high" | "critical"
      app_role: "admin" | "moderator" | "user" | "viewer"
      approval_decision_type: "approve" | "reject"
      audit_actor_type: "user" | "service"
      budget_period: "monthly" | "quarterly" | "yearly"
      build_strategy: "dockerfile" | "buildkit" | "kaniko"
      catalog_dependency_relation: "requires" | "optional" | "conflicts"
      catalog_item_kind:
        | "template"
        | "helm_chart"
        | "kustomize"
        | "terraform"
        | "workflow"
        | "prompt"
      catalog_item_status: "draft" | "active" | "deprecated" | "archived"
      cicd_artifact_type:
        | "archive"
        | "dotenv"
        | "junit"
        | "coverage"
        | "sbom"
        | "container_scan"
        | "terraform_plan"
        | "helm_chart"
      cicd_environment_tier: "development" | "staging" | "production"
      cicd_pipeline_source:
        | "push"
        | "merge_request"
        | "schedule"
        | "web"
        | "api"
        | "parent_pipeline"
      cicd_pipeline_status:
        | "created"
        | "pending"
        | "running"
        | "success"
        | "failed"
        | "canceled"
        | "skipped"
        | "manual"
      compliance_evidence_status: "pending" | "valid" | "invalid" | "expired"
      container_registry_type:
        | "ecr"
        | "gar"
        | "acr"
        | "harbor"
        | "dockerhub"
        | "ghcr"
      cost_allocation_rule_type:
        | "tag_based"
        | "namespace"
        | "project_mapping"
        | "custom"
      data_contract_status: "draft" | "active" | "deprecated"
      drift_severity: "low" | "medium" | "high" | "critical"
      environment_build_status: "queued" | "running" | "succeeded" | "failed"
      event_outbox_status: "pending" | "sent" | "failed"
      gitlab_mode: "saas" | "self_managed"
      governance_incident_status: "open" | "investigating" | "resolved"
      governance_incident_type:
        | "bias"
        | "drift"
        | "fairness"
        | "privacy"
        | "security"
      iac_action: "plan" | "apply" | "destroy"
      iac_backend_type: "local" | "s3" | "gcs" | "azurerm" | "pg" | "tfc"
      incident_update_type: "info" | "mitigation" | "resolution"
      integration_type: "slack" | "teams" | "pagerduty" | "email" | "webhook"
      k8s_cluster_status: "ready" | "degraded" | "down"
      k8s_environment: "dev" | "staging" | "prod" | "sandbox"
      managed_resource_status: "desired" | "synced" | "drifted" | "failed"
      notification_channel: "inapp" | "email" | "webhook"
      object_store_type: "s3" | "gcs" | "azure" | "minio"
      observability_type:
        | "prometheus"
        | "grafana"
        | "loki"
        | "tempo"
        | "datadog"
        | "splunk"
      pipeline_node_type:
        | "ingestion"
        | "preprocess"
        | "train"
        | "evaluate"
        | "postprocess"
        | "deploy"
        | "notify"
      pipeline_status:
        | "pending"
        | "running"
        | "succeeded"
        | "failed"
        | "canceled"
      pipeline_trigger: "manual" | "schedule" | "api" | "cicd"
      policy_bundle_status: "active" | "deprecated"
      policy_enforcement_mode: "audit" | "enforce"
      privacy_classification:
        | "public"
        | "internal"
        | "confidential"
        | "restricted"
      quality_gate_status: "pass" | "warn" | "fail"
      quality_gate_type:
        | "tests"
        | "security"
        | "lint"
        | "coverage"
        | "sast"
        | "dast"
        | "license"
        | "iac_scan"
      resource_provider_type: "aws" | "gcp" | "azure" | "k8s" | "terraform"
      resource_relation_type: "depends_on" | "uses" | "owns" | "contains"
      template_instance_status: "created" | "applied" | "failed" | "deleted"
      webhook_delivery_status: "pending" | "sent" | "failed"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      ai_system_status: ["draft", "active", "suspended", "decommissioned"],
      antecedent_category: [
        "medical",
        "cardiovascular",
        "surgical",
        "allergies",
        "family",
        "lifestyle",
      ],
      antecedent_severity: ["low", "medium", "high", "critical"],
      app_role: ["admin", "moderator", "user", "viewer"],
      approval_decision_type: ["approve", "reject"],
      audit_actor_type: ["user", "service"],
      budget_period: ["monthly", "quarterly", "yearly"],
      build_strategy: ["dockerfile", "buildkit", "kaniko"],
      catalog_dependency_relation: ["requires", "optional", "conflicts"],
      catalog_item_kind: [
        "template",
        "helm_chart",
        "kustomize",
        "terraform",
        "workflow",
        "prompt",
      ],
      catalog_item_status: ["draft", "active", "deprecated", "archived"],
      cicd_artifact_type: [
        "archive",
        "dotenv",
        "junit",
        "coverage",
        "sbom",
        "container_scan",
        "terraform_plan",
        "helm_chart",
      ],
      cicd_environment_tier: ["development", "staging", "production"],
      cicd_pipeline_source: [
        "push",
        "merge_request",
        "schedule",
        "web",
        "api",
        "parent_pipeline",
      ],
      cicd_pipeline_status: [
        "created",
        "pending",
        "running",
        "success",
        "failed",
        "canceled",
        "skipped",
        "manual",
      ],
      compliance_evidence_status: ["pending", "valid", "invalid", "expired"],
      container_registry_type: [
        "ecr",
        "gar",
        "acr",
        "harbor",
        "dockerhub",
        "ghcr",
      ],
      cost_allocation_rule_type: [
        "tag_based",
        "namespace",
        "project_mapping",
        "custom",
      ],
      data_contract_status: ["draft", "active", "deprecated"],
      drift_severity: ["low", "medium", "high", "critical"],
      environment_build_status: ["queued", "running", "succeeded", "failed"],
      event_outbox_status: ["pending", "sent", "failed"],
      gitlab_mode: ["saas", "self_managed"],
      governance_incident_status: ["open", "investigating", "resolved"],
      governance_incident_type: [
        "bias",
        "drift",
        "fairness",
        "privacy",
        "security",
      ],
      iac_action: ["plan", "apply", "destroy"],
      iac_backend_type: ["local", "s3", "gcs", "azurerm", "pg", "tfc"],
      incident_update_type: ["info", "mitigation", "resolution"],
      integration_type: ["slack", "teams", "pagerduty", "email", "webhook"],
      k8s_cluster_status: ["ready", "degraded", "down"],
      k8s_environment: ["dev", "staging", "prod", "sandbox"],
      managed_resource_status: ["desired", "synced", "drifted", "failed"],
      notification_channel: ["inapp", "email", "webhook"],
      object_store_type: ["s3", "gcs", "azure", "minio"],
      observability_type: [
        "prometheus",
        "grafana",
        "loki",
        "tempo",
        "datadog",
        "splunk",
      ],
      pipeline_node_type: [
        "ingestion",
        "preprocess",
        "train",
        "evaluate",
        "postprocess",
        "deploy",
        "notify",
      ],
      pipeline_status: [
        "pending",
        "running",
        "succeeded",
        "failed",
        "canceled",
      ],
      pipeline_trigger: ["manual", "schedule", "api", "cicd"],
      policy_bundle_status: ["active", "deprecated"],
      policy_enforcement_mode: ["audit", "enforce"],
      privacy_classification: [
        "public",
        "internal",
        "confidential",
        "restricted",
      ],
      quality_gate_status: ["pass", "warn", "fail"],
      quality_gate_type: [
        "tests",
        "security",
        "lint",
        "coverage",
        "sast",
        "dast",
        "license",
        "iac_scan",
      ],
      resource_provider_type: ["aws", "gcp", "azure", "k8s", "terraform"],
      resource_relation_type: ["depends_on", "uses", "owns", "contains"],
      template_instance_status: ["created", "applied", "failed", "deleted"],
      webhook_delivery_status: ["pending", "sent", "failed"],
    },
  },
} as const
