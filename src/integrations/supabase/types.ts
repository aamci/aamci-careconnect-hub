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
      activity_event: {
        Row: {
          action: string
          actor_user_id: string | null
          created_at: string
          entity_id: string | null
          entity_name: string | null
          entity_type: string | null
          id: string
          payload: Json | null
          project_id: string | null
          tenant_id: string
        }
        Insert: {
          action: string
          actor_user_id?: string | null
          created_at?: string
          entity_id?: string | null
          entity_name?: string | null
          entity_type?: string | null
          id?: string
          payload?: Json | null
          project_id?: string | null
          tenant_id: string
        }
        Update: {
          action?: string
          actor_user_id?: string | null
          created_at?: string
          entity_id?: string | null
          entity_name?: string | null
          entity_type?: string | null
          id?: string
          payload?: Json | null
          project_id?: string | null
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "activity_event_actor_user_id_fkey"
            columns: ["actor_user_id"]
            isOneToOne: false
            referencedRelation: "user_account"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_event_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "project"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_event_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_setting: {
        Row: {
          description: string | null
          id: string
          key: string
          tenant_id: string
          updated_at: string
          updated_by: string | null
          value: Json
        }
        Insert: {
          description?: string | null
          id?: string
          key: string
          tenant_id: string
          updated_at?: string
          updated_by?: string | null
          value?: Json
        }
        Update: {
          description?: string | null
          id?: string
          key?: string
          tenant_id?: string
          updated_at?: string
          updated_by?: string | null
          value?: Json
        }
        Relationships: [
          {
            foreignKeyName: "admin_setting_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "admin_setting_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "user_account"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_system: {
        Row: {
          created_at: string
          deployment_context: string | null
          description: string | null
          id: string
          intended_purpose: string | null
          name: string
          owner_user_id: string | null
          project_id: string
          risk_class: Database["public"]["Enums"]["ai_risk_class"] | null
          status: Database["public"]["Enums"]["ai_system_status"] | null
          tenant_id: string
          updated_at: string
          users_affected: string | null
        }
        Insert: {
          created_at?: string
          deployment_context?: string | null
          description?: string | null
          id?: string
          intended_purpose?: string | null
          name: string
          owner_user_id?: string | null
          project_id: string
          risk_class?: Database["public"]["Enums"]["ai_risk_class"] | null
          status?: Database["public"]["Enums"]["ai_system_status"] | null
          tenant_id: string
          updated_at?: string
          users_affected?: string | null
        }
        Update: {
          created_at?: string
          deployment_context?: string | null
          description?: string | null
          id?: string
          intended_purpose?: string | null
          name?: string
          owner_user_id?: string | null
          project_id?: string
          risk_class?: Database["public"]["Enums"]["ai_risk_class"] | null
          status?: Database["public"]["Enums"]["ai_system_status"] | null
          tenant_id?: string
          updated_at?: string
          users_affected?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_system_owner_user_id_fkey"
            columns: ["owner_user_id"]
            isOneToOne: false
            referencedRelation: "user_account"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_system_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "project"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_system_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant"
            referencedColumns: ["id"]
          },
        ]
      }
      alert_history: {
        Row: {
          actions_executed: Json
          alert_rule_id: string
          condition_value: Json
          id: string
          model_version_id: string | null
          resolution_notes: string | null
          resolved_at: string | null
          resolved_by: string | null
          run_id: string | null
          tenant_id: string
          triggered_at: string
          workspace_id: string | null
        }
        Insert: {
          actions_executed?: Json
          alert_rule_id: string
          condition_value: Json
          id?: string
          model_version_id?: string | null
          resolution_notes?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          run_id?: string | null
          tenant_id: string
          triggered_at?: string
          workspace_id?: string | null
        }
        Update: {
          actions_executed?: Json
          alert_rule_id?: string
          condition_value?: Json
          id?: string
          model_version_id?: string | null
          resolution_notes?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          run_id?: string | null
          tenant_id?: string
          triggered_at?: string
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "alert_history_alert_rule_id_fkey"
            columns: ["alert_rule_id"]
            isOneToOne: false
            referencedRelation: "alert_rule"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alert_history_model_version_id_fkey"
            columns: ["model_version_id"]
            isOneToOne: false
            referencedRelation: "model_version"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alert_history_run_id_fkey"
            columns: ["run_id"]
            isOneToOne: false
            referencedRelation: "ml_run"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alert_history_run_id_fkey"
            columns: ["run_id"]
            isOneToOne: false
            referencedRelation: "run"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alert_history_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alert_history_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "ml_workspace"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alert_history_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspace"
            referencedColumns: ["id"]
          },
        ]
      }
      alert_rule: {
        Row: {
          actions: Json
          condition: Json
          cooldown_minutes: number
          created_at: string
          description: string | null
          enabled: boolean
          experiment_id: string | null
          id: string
          last_triggered_at: string | null
          name: string
          project_id: string | null
          tenant_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          actions?: Json
          condition: Json
          cooldown_minutes?: number
          created_at?: string
          description?: string | null
          enabled?: boolean
          experiment_id?: string | null
          id?: string
          last_triggered_at?: string | null
          name: string
          project_id?: string | null
          tenant_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          actions?: Json
          condition?: Json
          cooldown_minutes?: number
          created_at?: string
          description?: string | null
          enabled?: boolean
          experiment_id?: string | null
          id?: string
          last_triggered_at?: string | null
          name?: string
          project_id?: string | null
          tenant_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "alert_rule_experiment_id_fkey"
            columns: ["experiment_id"]
            isOneToOne: false
            referencedRelation: "experiment"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alert_rule_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "project"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alert_rule_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant"
            referencedColumns: ["id"]
          },
        ]
      }
      api_token: {
        Row: {
          created_at: string
          expires_at: string | null
          id: string
          last_used_at: string | null
          name: string
          revoked_at: string | null
          scopes: Json | null
          tenant_id: string
          token_hash: string
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          id?: string
          last_used_at?: string | null
          name: string
          revoked_at?: string | null
          scopes?: Json | null
          tenant_id: string
          token_hash: string
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          id?: string
          last_used_at?: string | null
          name?: string
          revoked_at?: string | null
          scopes?: Json | null
          tenant_id?: string
          token_hash?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "api_token_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "api_token_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_account"
            referencedColumns: ["id"]
          },
        ]
      }
      app: {
        Row: {
          cluster_id: string | null
          created_at: string
          created_by: string | null
          environment_build_id: string | null
          id: string
          name: string
          namespace: string | null
          project_id: string
          spec: Json | null
          status: string | null
          tenant_id: string
          type: Database["public"]["Enums"]["app_type"]
          updated_at: string
          updated_by: string | null
          url: string | null
        }
        Insert: {
          cluster_id?: string | null
          created_at?: string
          created_by?: string | null
          environment_build_id?: string | null
          id?: string
          name: string
          namespace?: string | null
          project_id: string
          spec?: Json | null
          status?: string | null
          tenant_id: string
          type?: Database["public"]["Enums"]["app_type"]
          updated_at?: string
          updated_by?: string | null
          url?: string | null
        }
        Update: {
          cluster_id?: string | null
          created_at?: string
          created_by?: string | null
          environment_build_id?: string | null
          id?: string
          name?: string
          namespace?: string | null
          project_id?: string
          spec?: Json | null
          status?: string | null
          tenant_id?: string
          type?: Database["public"]["Enums"]["app_type"]
          updated_at?: string
          updated_by?: string | null
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "app_cluster_id_fkey"
            columns: ["cluster_id"]
            isOneToOne: false
            referencedRelation: "k8s_cluster"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "app_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_account"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "app_environment_build_id_fkey"
            columns: ["environment_build_id"]
            isOneToOne: false
            referencedRelation: "environment_build"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "app_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "project"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "app_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "app_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "user_account"
            referencedColumns: ["id"]
          },
        ]
      }
      approval_decision: {
        Row: {
          approval_request_id: string
          approver_user_id: string
          comment: string | null
          decided_at: string | null
          decision: Database["public"]["Enums"]["approval_decision_type"]
          id: string
          tenant_id: string
        }
        Insert: {
          approval_request_id: string
          approver_user_id: string
          comment?: string | null
          decided_at?: string | null
          decision: Database["public"]["Enums"]["approval_decision_type"]
          id?: string
          tenant_id: string
        }
        Update: {
          approval_request_id?: string
          approver_user_id?: string
          comment?: string | null
          decided_at?: string | null
          decision?: Database["public"]["Enums"]["approval_decision_type"]
          id?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "approval_decision_approval_request_id_fkey"
            columns: ["approval_request_id"]
            isOneToOne: false
            referencedRelation: "approval_request"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "approval_decision_approver_user_id_fkey"
            columns: ["approver_user_id"]
            isOneToOne: false
            referencedRelation: "user_account"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "approval_decision_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant"
            referencedColumns: ["id"]
          },
        ]
      }
      approval_request: {
        Row: {
          created_at: string
          entity_id: string
          entity_type: string
          expires_at: string | null
          id: string
          project_id: string
          rationale: string | null
          requested_by: string | null
          required_approvers: Json | null
          status: Database["public"]["Enums"]["approval_status"]
          tenant_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          entity_id: string
          entity_type: string
          expires_at?: string | null
          id?: string
          project_id: string
          rationale?: string | null
          requested_by?: string | null
          required_approvers?: Json | null
          status?: Database["public"]["Enums"]["approval_status"]
          tenant_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          entity_id?: string
          entity_type?: string
          expires_at?: string | null
          id?: string
          project_id?: string
          rationale?: string | null
          requested_by?: string | null
          required_approvers?: Json | null
          status?: Database["public"]["Enums"]["approval_status"]
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "approval_request_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "project"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "approval_request_requested_by_fkey"
            columns: ["requested_by"]
            isOneToOne: false
            referencedRelation: "user_account"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "approval_request_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant"
            referencedColumns: ["id"]
          },
        ]
      }
      argocd_application: {
        Row: {
          app_project: string | null
          argocd_instance_id: string
          conditions: Json | null
          created_at: string
          destination_cluster: string | null
          destination_namespace: string | null
          health: Database["public"]["Enums"]["argocd_health_status"]
          helm_values: Json | null
          id: string
          kustomize: Json | null
          last_sync_at: string | null
          name: string
          project_id: string
          source_path: string | null
          source_repo: string | null
          source_target_revision: string | null
          status: Database["public"]["Enums"]["argocd_sync_status"]
          sync_policy: Json | null
          tenant_id: string
          updated_at: string
        }
        Insert: {
          app_project?: string | null
          argocd_instance_id: string
          conditions?: Json | null
          created_at?: string
          destination_cluster?: string | null
          destination_namespace?: string | null
          health?: Database["public"]["Enums"]["argocd_health_status"]
          helm_values?: Json | null
          id?: string
          kustomize?: Json | null
          last_sync_at?: string | null
          name: string
          project_id: string
          source_path?: string | null
          source_repo?: string | null
          source_target_revision?: string | null
          status?: Database["public"]["Enums"]["argocd_sync_status"]
          sync_policy?: Json | null
          tenant_id: string
          updated_at?: string
        }
        Update: {
          app_project?: string | null
          argocd_instance_id?: string
          conditions?: Json | null
          created_at?: string
          destination_cluster?: string | null
          destination_namespace?: string | null
          health?: Database["public"]["Enums"]["argocd_health_status"]
          helm_values?: Json | null
          id?: string
          kustomize?: Json | null
          last_sync_at?: string | null
          name?: string
          project_id?: string
          source_path?: string | null
          source_repo?: string | null
          source_target_revision?: string | null
          status?: Database["public"]["Enums"]["argocd_sync_status"]
          sync_policy?: Json | null
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "argocd_application_argocd_instance_id_fkey"
            columns: ["argocd_instance_id"]
            isOneToOne: false
            referencedRelation: "argocd_instance"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "argocd_application_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "project"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "argocd_application_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant"
            referencedColumns: ["id"]
          },
        ]
      }
      argocd_drift_finding: {
        Row: {
          application_id: string
          detected_at: string | null
          diff_summary: string | null
          diff_uri: string | null
          id: string
          resolved_at: string | null
          resolved_by: string | null
          resource_key: string | null
          severity: Database["public"]["Enums"]["drift_severity"]
          status: Database["public"]["Enums"]["drift_status"]
          tenant_id: string
        }
        Insert: {
          application_id: string
          detected_at?: string | null
          diff_summary?: string | null
          diff_uri?: string | null
          id?: string
          resolved_at?: string | null
          resolved_by?: string | null
          resource_key?: string | null
          severity?: Database["public"]["Enums"]["drift_severity"]
          status?: Database["public"]["Enums"]["drift_status"]
          tenant_id: string
        }
        Update: {
          application_id?: string
          detected_at?: string | null
          diff_summary?: string | null
          diff_uri?: string | null
          id?: string
          resolved_at?: string | null
          resolved_by?: string | null
          resource_key?: string | null
          severity?: Database["public"]["Enums"]["drift_severity"]
          status?: Database["public"]["Enums"]["drift_status"]
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "argocd_drift_finding_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "argocd_application"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "argocd_drift_finding_resolved_by_fkey"
            columns: ["resolved_by"]
            isOneToOne: false
            referencedRelation: "user_account"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "argocd_drift_finding_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant"
            referencedColumns: ["id"]
          },
        ]
      }
      argocd_event: {
        Row: {
          application_id: string
          id: string
          involved_object: Json | null
          message: string | null
          occurred_at: string | null
          reason: string | null
          tenant_id: string
          type: string | null
        }
        Insert: {
          application_id: string
          id?: string
          involved_object?: Json | null
          message?: string | null
          occurred_at?: string | null
          reason?: string | null
          tenant_id: string
          type?: string | null
        }
        Update: {
          application_id?: string
          id?: string
          involved_object?: Json | null
          message?: string | null
          occurred_at?: string | null
          reason?: string | null
          tenant_id?: string
          type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "argocd_event_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "argocd_application"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "argocd_event_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant"
            referencedColumns: ["id"]
          },
        ]
      }
      argocd_instance: {
        Row: {
          auth_secret_ref: string | null
          base_url: string | null
          cluster_id: string | null
          created_at: string
          id: string
          name: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          auth_secret_ref?: string | null
          base_url?: string | null
          cluster_id?: string | null
          created_at?: string
          id?: string
          name: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          auth_secret_ref?: string | null
          base_url?: string | null
          cluster_id?: string | null
          created_at?: string
          id?: string
          name?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "argocd_instance_auth_secret_ref_fkey"
            columns: ["auth_secret_ref"]
            isOneToOne: false
            referencedRelation: "secret_ref"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "argocd_instance_cluster_id_fkey"
            columns: ["cluster_id"]
            isOneToOne: false
            referencedRelation: "k8s_cluster"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "argocd_instance_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant"
            referencedColumns: ["id"]
          },
        ]
      }
      argocd_resource_status: {
        Row: {
          application_id: string
          group_name: string | null
          health_status: string | null
          hook: boolean | null
          id: string
          kind: string | null
          last_seen_at: string | null
          message: string | null
          name: string | null
          namespace: string | null
          requires_pruning: boolean | null
          sync_status: string | null
          tenant_id: string
        }
        Insert: {
          application_id: string
          group_name?: string | null
          health_status?: string | null
          hook?: boolean | null
          id?: string
          kind?: string | null
          last_seen_at?: string | null
          message?: string | null
          name?: string | null
          namespace?: string | null
          requires_pruning?: boolean | null
          sync_status?: string | null
          tenant_id: string
        }
        Update: {
          application_id?: string
          group_name?: string | null
          health_status?: string | null
          hook?: boolean | null
          id?: string
          kind?: string | null
          last_seen_at?: string | null
          message?: string | null
          name?: string | null
          namespace?: string | null
          requires_pruning?: boolean | null
          sync_status?: string | null
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "argocd_resource_status_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "argocd_application"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "argocd_resource_status_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant"
            referencedColumns: ["id"]
          },
        ]
      }
      argocd_sync_history: {
        Row: {
          application_id: string
          finished_at: string | null
          health_status: string | null
          id: string
          initiated_by: string | null
          message: string | null
          operation_phase: string | null
          resources: Json | null
          revision: string | null
          started_at: string | null
          sync_status: string | null
          tenant_id: string
        }
        Insert: {
          application_id: string
          finished_at?: string | null
          health_status?: string | null
          id?: string
          initiated_by?: string | null
          message?: string | null
          operation_phase?: string | null
          resources?: Json | null
          revision?: string | null
          started_at?: string | null
          sync_status?: string | null
          tenant_id: string
        }
        Update: {
          application_id?: string
          finished_at?: string | null
          health_status?: string | null
          id?: string
          initiated_by?: string | null
          message?: string | null
          operation_phase?: string | null
          resources?: Json | null
          revision?: string | null
          started_at?: string | null
          sync_status?: string | null
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "argocd_sync_history_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "argocd_application"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "argocd_sync_history_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant"
            referencedColumns: ["id"]
          },
        ]
      }
      artifact: {
        Row: {
          content_hash: string | null
          created_at: string
          created_by: string | null
          id: string
          kind: Database["public"]["Enums"]["artifact_kind"]
          metadata: Json | null
          mime_type: string | null
          name: string
          project_id: string
          run_id: string | null
          size_bytes: number | null
          tenant_id: string
          uri: string | null
        }
        Insert: {
          content_hash?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          kind?: Database["public"]["Enums"]["artifact_kind"]
          metadata?: Json | null
          mime_type?: string | null
          name: string
          project_id: string
          run_id?: string | null
          size_bytes?: number | null
          tenant_id: string
          uri?: string | null
        }
        Update: {
          content_hash?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          kind?: Database["public"]["Enums"]["artifact_kind"]
          metadata?: Json | null
          mime_type?: string | null
          name?: string
          project_id?: string
          run_id?: string | null
          size_bytes?: number | null
          tenant_id?: string
          uri?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "artifact_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_account"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "artifact_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "project"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "artifact_run_id_fkey"
            columns: ["run_id"]
            isOneToOne: false
            referencedRelation: "ml_run"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "artifact_run_id_fkey"
            columns: ["run_id"]
            isOneToOne: false
            referencedRelation: "run"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "artifact_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant"
            referencedColumns: ["id"]
          },
        ]
      }
      attachment: {
        Row: {
          artifact_id: string | null
          created_at: string
          created_by: string | null
          entity_id: string | null
          entity_type: string | null
          filename: string | null
          id: string
          mime_type: string | null
          project_id: string
          size_bytes: number | null
          storage_uri: string | null
          tenant_id: string
        }
        Insert: {
          artifact_id?: string | null
          created_at?: string
          created_by?: string | null
          entity_id?: string | null
          entity_type?: string | null
          filename?: string | null
          id?: string
          mime_type?: string | null
          project_id: string
          size_bytes?: number | null
          storage_uri?: string | null
          tenant_id: string
        }
        Update: {
          artifact_id?: string | null
          created_at?: string
          created_by?: string | null
          entity_id?: string | null
          entity_type?: string | null
          filename?: string | null
          id?: string
          mime_type?: string | null
          project_id?: string
          size_bytes?: number | null
          storage_uri?: string | null
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "attachment_artifact_id_fkey"
            columns: ["artifact_id"]
            isOneToOne: false
            referencedRelation: "artifact"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attachment_artifact_id_fkey"
            columns: ["artifact_id"]
            isOneToOne: false
            referencedRelation: "ml_artifact"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attachment_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_account"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attachment_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "project"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attachment_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_event: {
        Row: {
          action: string
          actor_id: string | null
          actor_type: Database["public"]["Enums"]["audit_actor_type"]
          created_at: string
          error_message: string | null
          id: string
          ip: string | null
          payload: Json | null
          resource_id: string | null
          resource_name: string | null
          resource_type: string | null
          status: string | null
          tenant_id: string
          user_agent: string | null
        }
        Insert: {
          action: string
          actor_id?: string | null
          actor_type: Database["public"]["Enums"]["audit_actor_type"]
          created_at?: string
          error_message?: string | null
          id?: string
          ip?: string | null
          payload?: Json | null
          resource_id?: string | null
          resource_name?: string | null
          resource_type?: string | null
          status?: string | null
          tenant_id: string
          user_agent?: string | null
        }
        Update: {
          action?: string
          actor_id?: string | null
          actor_type?: Database["public"]["Enums"]["audit_actor_type"]
          created_at?: string
          error_message?: string | null
          id?: string
          ip?: string | null
          payload?: Json | null
          resource_id?: string | null
          resource_name?: string | null
          resource_type?: string | null
          status?: string | null
          tenant_id?: string
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_event_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          id: string
          ip_address: string | null
          new_data: Json | null
          old_data: Json | null
          performed_at: string
          performed_by: string | null
          record_id: string | null
          table_name: string
          user_agent: string | null
        }
        Insert: {
          action: string
          id?: string
          ip_address?: string | null
          new_data?: Json | null
          old_data?: Json | null
          performed_at?: string
          performed_by?: string | null
          record_id?: string | null
          table_name: string
          user_agent?: string | null
        }
        Update: {
          action?: string
          id?: string
          ip_address?: string | null
          new_data?: Json | null
          old_data?: Json | null
          performed_at?: string
          performed_by?: string | null
          record_id?: string | null
          table_name?: string
          user_agent?: string | null
        }
        Relationships: []
      }
      billing_account: {
        Row: {
          config: Json | null
          created_at: string
          currency: string | null
          external_id: string | null
          id: string
          name: string
          provider: Database["public"]["Enums"]["cloud_provider"]
          tenant_id: string
          updated_at: string
        }
        Insert: {
          config?: Json | null
          created_at?: string
          currency?: string | null
          external_id?: string | null
          id?: string
          name: string
          provider: Database["public"]["Enums"]["cloud_provider"]
          tenant_id: string
          updated_at?: string
        }
        Update: {
          config?: Json | null
          created_at?: string
          currency?: string | null
          external_id?: string | null
          id?: string
          name?: string
          provider?: Database["public"]["Enums"]["cloud_provider"]
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "billing_account_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant"
            referencedColumns: ["id"]
          },
        ]
      }
      budget: {
        Row: {
          alert_channels: Json | null
          amount: number | null
          created_at: string
          currency: string | null
          id: string
          name: string
          period: Database["public"]["Enums"]["budget_period"]
          scope_id: string | null
          scope_type: string
          tenant_id: string
          threshold_percentages: Json | null
          updated_at: string
        }
        Insert: {
          alert_channels?: Json | null
          amount?: number | null
          created_at?: string
          currency?: string | null
          id?: string
          name: string
          period: Database["public"]["Enums"]["budget_period"]
          scope_id?: string | null
          scope_type: string
          tenant_id: string
          threshold_percentages?: Json | null
          updated_at?: string
        }
        Update: {
          alert_channels?: Json | null
          amount?: number | null
          created_at?: string
          currency?: string | null
          id?: string
          name?: string
          period?: Database["public"]["Enums"]["budget_period"]
          scope_id?: string | null
          scope_type?: string
          tenant_id?: string
          threshold_percentages?: Json | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "budget_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant"
            referencedColumns: ["id"]
          },
        ]
      }
      business_rule: {
        Row: {
          applies_to: Database["public"]["Enums"]["rule_applies_to"]
          created_at: string
          created_by: string | null
          enabled: boolean
          expression: Json
          id: string
          message: string | null
          name: string
          rule_type: Database["public"]["Enums"]["rule_type"]
          severity: Database["public"]["Enums"]["rule_severity"]
          tenant_id: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          applies_to: Database["public"]["Enums"]["rule_applies_to"]
          created_at?: string
          created_by?: string | null
          enabled?: boolean
          expression?: Json
          id?: string
          message?: string | null
          name: string
          rule_type: Database["public"]["Enums"]["rule_type"]
          severity?: Database["public"]["Enums"]["rule_severity"]
          tenant_id: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          applies_to?: Database["public"]["Enums"]["rule_applies_to"]
          created_at?: string
          created_by?: string | null
          enabled?: boolean
          expression?: Json
          id?: string
          message?: string | null
          name?: string
          rule_type?: Database["public"]["Enums"]["rule_type"]
          severity?: Database["public"]["Enums"]["rule_severity"]
          tenant_id?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "business_rule_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_account"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "business_rule_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "business_rule_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "user_account"
            referencedColumns: ["id"]
          },
        ]
      }
      carbon_record: {
        Row: {
          attribution: Json | null
          co2e_kg: number | null
          created_at: string
          end_time: string | null
          id: string
          kwh: number | null
          methodology: string | null
          provider: Database["public"]["Enums"]["cloud_provider"]
          region: string | null
          start_time: string | null
          tenant_id: string
        }
        Insert: {
          attribution?: Json | null
          co2e_kg?: number | null
          created_at?: string
          end_time?: string | null
          id?: string
          kwh?: number | null
          methodology?: string | null
          provider: Database["public"]["Enums"]["cloud_provider"]
          region?: string | null
          start_time?: string | null
          tenant_id: string
        }
        Update: {
          attribution?: Json | null
          co2e_kg?: number | null
          created_at?: string
          end_time?: string | null
          id?: string
          kwh?: number | null
          methodology?: string | null
          provider?: Database["public"]["Enums"]["cloud_provider"]
          region?: string | null
          start_time?: string | null
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "carbon_record_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant"
            referencedColumns: ["id"]
          },
        ]
      }
      catalog_item: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          kind: Database["public"]["Enums"]["catalog_item_kind"]
          name: string
          project_id: string | null
          spec: Json | null
          status: Database["public"]["Enums"]["catalog_item_status"] | null
          tags: Json | null
          tenant_id: string
          updated_at: string
          updated_by: string | null
          version: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          kind: Database["public"]["Enums"]["catalog_item_kind"]
          name: string
          project_id?: string | null
          spec?: Json | null
          status?: Database["public"]["Enums"]["catalog_item_status"] | null
          tags?: Json | null
          tenant_id: string
          updated_at?: string
          updated_by?: string | null
          version?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          kind?: Database["public"]["Enums"]["catalog_item_kind"]
          name?: string
          project_id?: string | null
          spec?: Json | null
          status?: Database["public"]["Enums"]["catalog_item_status"] | null
          tags?: Json | null
          tenant_id?: string
          updated_at?: string
          updated_by?: string | null
          version?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "catalog_item_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_account"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "catalog_item_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "project"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "catalog_item_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "catalog_item_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "user_account"
            referencedColumns: ["id"]
          },
        ]
      }
      catalog_item_dependency: {
        Row: {
          depends_on_item_id: string
          id: string
          item_id: string
          relation: Database["public"]["Enums"]["catalog_dependency_relation"]
          tenant_id: string
        }
        Insert: {
          depends_on_item_id: string
          id?: string
          item_id: string
          relation: Database["public"]["Enums"]["catalog_dependency_relation"]
          tenant_id: string
        }
        Update: {
          depends_on_item_id?: string
          id?: string
          item_id?: string
          relation?: Database["public"]["Enums"]["catalog_dependency_relation"]
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "catalog_item_dependency_depends_on_item_id_fkey"
            columns: ["depends_on_item_id"]
            isOneToOne: false
            referencedRelation: "catalog_item"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "catalog_item_dependency_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "catalog_item"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "catalog_item_dependency_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant"
            referencedColumns: ["id"]
          },
        ]
      }
      cicd_deployment: {
        Row: {
          change_log: string | null
          created_at: string
          deployable_ref: Json | null
          deployed_at: string | null
          environment_id: string
          id: string
          pipeline_id: string
          release_tag: string | null
          status: string | null
          tenant_id: string
        }
        Insert: {
          change_log?: string | null
          created_at?: string
          deployable_ref?: Json | null
          deployed_at?: string | null
          environment_id: string
          id?: string
          pipeline_id: string
          release_tag?: string | null
          status?: string | null
          tenant_id: string
        }
        Update: {
          change_log?: string | null
          created_at?: string
          deployable_ref?: Json | null
          deployed_at?: string | null
          environment_id?: string
          id?: string
          pipeline_id?: string
          release_tag?: string | null
          status?: string | null
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cicd_deployment_environment_id_fkey"
            columns: ["environment_id"]
            isOneToOne: false
            referencedRelation: "cicd_environment"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cicd_deployment_pipeline_id_fkey"
            columns: ["pipeline_id"]
            isOneToOne: false
            referencedRelation: "cicd_pipeline"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cicd_deployment_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant"
            referencedColumns: ["id"]
          },
        ]
      }
      cicd_environment: {
        Row: {
          created_at: string
          external_url: string | null
          id: string
          name: string
          project_id: string
          slug: string | null
          tenant_id: string
          tier: Database["public"]["Enums"]["cicd_environment_tier"] | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          external_url?: string | null
          id?: string
          name: string
          project_id: string
          slug?: string | null
          tenant_id: string
          tier?: Database["public"]["Enums"]["cicd_environment_tier"] | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          external_url?: string | null
          id?: string
          name?: string
          project_id?: string
          slug?: string | null
          tenant_id?: string
          tier?: Database["public"]["Enums"]["cicd_environment_tier"] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cicd_environment_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "project"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cicd_environment_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant"
            referencedColumns: ["id"]
          },
        ]
      }
      cicd_job: {
        Row: {
          allow_failure: boolean | null
          artifacts_expire_at: string | null
          created_at: string
          duration_sec: number | null
          exit_code: number | null
          failure_reason: string | null
          finished_at: string | null
          id: string
          image: string | null
          job_id_external: string | null
          log_url: string | null
          name: string
          pipeline_id: string
          retry_count: number | null
          runner_description: string | null
          runner_tags: Json | null
          script_summary: string | null
          stage_id: string | null
          started_at: string | null
          status: Database["public"]["Enums"]["cicd_job_status"]
          tenant_id: string
          when_run: string | null
        }
        Insert: {
          allow_failure?: boolean | null
          artifacts_expire_at?: string | null
          created_at?: string
          duration_sec?: number | null
          exit_code?: number | null
          failure_reason?: string | null
          finished_at?: string | null
          id?: string
          image?: string | null
          job_id_external?: string | null
          log_url?: string | null
          name: string
          pipeline_id: string
          retry_count?: number | null
          runner_description?: string | null
          runner_tags?: Json | null
          script_summary?: string | null
          stage_id?: string | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["cicd_job_status"]
          tenant_id: string
          when_run?: string | null
        }
        Update: {
          allow_failure?: boolean | null
          artifacts_expire_at?: string | null
          created_at?: string
          duration_sec?: number | null
          exit_code?: number | null
          failure_reason?: string | null
          finished_at?: string | null
          id?: string
          image?: string | null
          job_id_external?: string | null
          log_url?: string | null
          name?: string
          pipeline_id?: string
          retry_count?: number | null
          runner_description?: string | null
          runner_tags?: Json | null
          script_summary?: string | null
          stage_id?: string | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["cicd_job_status"]
          tenant_id?: string
          when_run?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cicd_job_pipeline_id_fkey"
            columns: ["pipeline_id"]
            isOneToOne: false
            referencedRelation: "cicd_pipeline"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cicd_job_stage_id_fkey"
            columns: ["stage_id"]
            isOneToOne: false
            referencedRelation: "cicd_stage"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cicd_job_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant"
            referencedColumns: ["id"]
          },
        ]
      }
      cicd_job_artifact: {
        Row: {
          checksum: string | null
          created_at: string
          id: string
          job_id: string
          name: string
          size_bytes: number | null
          tenant_id: string
          type: Database["public"]["Enums"]["cicd_artifact_type"] | null
          uri: string | null
        }
        Insert: {
          checksum?: string | null
          created_at?: string
          id?: string
          job_id: string
          name: string
          size_bytes?: number | null
          tenant_id: string
          type?: Database["public"]["Enums"]["cicd_artifact_type"] | null
          uri?: string | null
        }
        Update: {
          checksum?: string | null
          created_at?: string
          id?: string
          job_id?: string
          name?: string
          size_bytes?: number | null
          tenant_id?: string
          type?: Database["public"]["Enums"]["cicd_artifact_type"] | null
          uri?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cicd_job_artifact_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "cicd_job"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cicd_job_artifact_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant"
            referencedColumns: ["id"]
          },
        ]
      }
      cicd_pipeline: {
        Row: {
          coverage: number | null
          created_at: string
          detailed_status: string | null
          duration_sec: number | null
          finished_at: string | null
          gitlab_instance_id: string | null
          id: string
          mr_iid: number | null
          pipeline_id_external: string | null
          pipeline_iid: number | null
          project_id: string
          queued_duration_sec: number | null
          ref: string | null
          repo_full_name: string | null
          sha: string | null
          source: Database["public"]["Enums"]["cicd_pipeline_source"] | null
          started_at: string | null
          status: Database["public"]["Enums"]["cicd_pipeline_status"]
          tenant_id: string
          updated_at: string
          user_external_id: string | null
          variables: Json | null
          web_url: string | null
        }
        Insert: {
          coverage?: number | null
          created_at?: string
          detailed_status?: string | null
          duration_sec?: number | null
          finished_at?: string | null
          gitlab_instance_id?: string | null
          id?: string
          mr_iid?: number | null
          pipeline_id_external?: string | null
          pipeline_iid?: number | null
          project_id: string
          queued_duration_sec?: number | null
          ref?: string | null
          repo_full_name?: string | null
          sha?: string | null
          source?: Database["public"]["Enums"]["cicd_pipeline_source"] | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["cicd_pipeline_status"]
          tenant_id: string
          updated_at?: string
          user_external_id?: string | null
          variables?: Json | null
          web_url?: string | null
        }
        Update: {
          coverage?: number | null
          created_at?: string
          detailed_status?: string | null
          duration_sec?: number | null
          finished_at?: string | null
          gitlab_instance_id?: string | null
          id?: string
          mr_iid?: number | null
          pipeline_id_external?: string | null
          pipeline_iid?: number | null
          project_id?: string
          queued_duration_sec?: number | null
          ref?: string | null
          repo_full_name?: string | null
          sha?: string | null
          source?: Database["public"]["Enums"]["cicd_pipeline_source"] | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["cicd_pipeline_status"]
          tenant_id?: string
          updated_at?: string
          user_external_id?: string | null
          variables?: Json | null
          web_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cicd_pipeline_gitlab_instance_id_fkey"
            columns: ["gitlab_instance_id"]
            isOneToOne: false
            referencedRelation: "gitlab_instance"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cicd_pipeline_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "project"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cicd_pipeline_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant"
            referencedColumns: ["id"]
          },
        ]
      }
      cicd_pipeline_link: {
        Row: {
          created_at: string
          entity_id: string
          entity_type: string
          id: string
          pipeline_id: string
          tenant_id: string
        }
        Insert: {
          created_at?: string
          entity_id: string
          entity_type: string
          id?: string
          pipeline_id: string
          tenant_id: string
        }
        Update: {
          created_at?: string
          entity_id?: string
          entity_type?: string
          id?: string
          pipeline_id?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cicd_pipeline_link_pipeline_id_fkey"
            columns: ["pipeline_id"]
            isOneToOne: false
            referencedRelation: "cicd_pipeline"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cicd_pipeline_link_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant"
            referencedColumns: ["id"]
          },
        ]
      }
      cicd_quality_gate: {
        Row: {
          created_at: string
          gate_type: Database["public"]["Enums"]["quality_gate_type"]
          id: string
          metrics: Json | null
          pipeline_id: string
          report_artifact_id: string | null
          status: Database["public"]["Enums"]["quality_gate_status"]
          summary: string | null
          tenant_id: string
        }
        Insert: {
          created_at?: string
          gate_type: Database["public"]["Enums"]["quality_gate_type"]
          id?: string
          metrics?: Json | null
          pipeline_id: string
          report_artifact_id?: string | null
          status?: Database["public"]["Enums"]["quality_gate_status"]
          summary?: string | null
          tenant_id: string
        }
        Update: {
          created_at?: string
          gate_type?: Database["public"]["Enums"]["quality_gate_type"]
          id?: string
          metrics?: Json | null
          pipeline_id?: string
          report_artifact_id?: string | null
          status?: Database["public"]["Enums"]["quality_gate_status"]
          summary?: string | null
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cicd_quality_gate_pipeline_id_fkey"
            columns: ["pipeline_id"]
            isOneToOne: false
            referencedRelation: "cicd_pipeline"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cicd_quality_gate_report_artifact_id_fkey"
            columns: ["report_artifact_id"]
            isOneToOne: false
            referencedRelation: "cicd_job_artifact"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cicd_quality_gate_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant"
            referencedColumns: ["id"]
          },
        ]
      }
      cicd_stage: {
        Row: {
          duration_sec: number | null
          finished_at: string | null
          id: string
          name: string
          pipeline_id: string
          started_at: string | null
          status: string | null
          tenant_id: string
        }
        Insert: {
          duration_sec?: number | null
          finished_at?: string | null
          id?: string
          name: string
          pipeline_id: string
          started_at?: string | null
          status?: string | null
          tenant_id: string
        }
        Update: {
          duration_sec?: number | null
          finished_at?: string | null
          id?: string
          name?: string
          pipeline_id?: string
          started_at?: string | null
          status?: string | null
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cicd_stage_pipeline_id_fkey"
            columns: ["pipeline_id"]
            isOneToOne: false
            referencedRelation: "cicd_pipeline"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cicd_stage_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant"
            referencedColumns: ["id"]
          },
        ]
      }
      comment: {
        Row: {
          attachments: Json | null
          author_user_id: string
          body: string | null
          created_at: string
          deleted_at: string | null
          edited: boolean
          id: string
          mentions: Json | null
          tenant_id: string
          thread_id: string
          updated_at: string
        }
        Insert: {
          attachments?: Json | null
          author_user_id: string
          body?: string | null
          created_at?: string
          deleted_at?: string | null
          edited?: boolean
          id?: string
          mentions?: Json | null
          tenant_id: string
          thread_id: string
          updated_at?: string
        }
        Update: {
          attachments?: Json | null
          author_user_id?: string
          body?: string | null
          created_at?: string
          deleted_at?: string | null
          edited?: boolean
          id?: string
          mentions?: Json | null
          tenant_id?: string
          thread_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "comment_author_user_id_fkey"
            columns: ["author_user_id"]
            isOneToOne: false
            referencedRelation: "user_account"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comment_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comment_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "comment_thread"
            referencedColumns: ["id"]
          },
        ]
      }
      comment_thread: {
        Row: {
          created_at: string
          created_by: string | null
          entity_id: string
          entity_type: string
          id: string
          is_resolved: boolean
          project_id: string
          resolved_at: string | null
          resolved_by: string | null
          tenant_id: string
          title: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          entity_id: string
          entity_type: string
          id?: string
          is_resolved?: boolean
          project_id: string
          resolved_at?: string | null
          resolved_by?: string | null
          tenant_id: string
          title?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          entity_id?: string
          entity_type?: string
          id?: string
          is_resolved?: boolean
          project_id?: string
          resolved_at?: string | null
          resolved_by?: string | null
          tenant_id?: string
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "comment_thread_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_account"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comment_thread_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "project"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comment_thread_resolved_by_fkey"
            columns: ["resolved_by"]
            isOneToOne: false
            referencedRelation: "user_account"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comment_thread_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant"
            referencedColumns: ["id"]
          },
        ]
      }
      compliance_control: {
        Row: {
          control_code: string
          created_at: string
          description: string | null
          evidence_required: string | null
          framework: string
          id: string
          tenant_id: string
          title: string | null
        }
        Insert: {
          control_code: string
          created_at?: string
          description?: string | null
          evidence_required?: string | null
          framework: string
          id?: string
          tenant_id: string
          title?: string | null
        }
        Update: {
          control_code?: string
          created_at?: string
          description?: string | null
          evidence_required?: string | null
          framework?: string
          id?: string
          tenant_id?: string
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "compliance_control_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant"
            referencedColumns: ["id"]
          },
        ]
      }
      compliance_evidence: {
        Row: {
          artifact_id: string | null
          control_id: string
          created_at: string
          entity_id: string
          entity_type: string
          id: string
          notes: string | null
          status:
            | Database["public"]["Enums"]["compliance_evidence_status"]
            | null
          tenant_id: string
          validated_at: string | null
          validated_by: string | null
        }
        Insert: {
          artifact_id?: string | null
          control_id: string
          created_at?: string
          entity_id: string
          entity_type: string
          id?: string
          notes?: string | null
          status?:
            | Database["public"]["Enums"]["compliance_evidence_status"]
            | null
          tenant_id: string
          validated_at?: string | null
          validated_by?: string | null
        }
        Update: {
          artifact_id?: string | null
          control_id?: string
          created_at?: string
          entity_id?: string
          entity_type?: string
          id?: string
          notes?: string | null
          status?:
            | Database["public"]["Enums"]["compliance_evidence_status"]
            | null
          tenant_id?: string
          validated_at?: string | null
          validated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "compliance_evidence_artifact_id_fkey"
            columns: ["artifact_id"]
            isOneToOne: false
            referencedRelation: "artifact"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "compliance_evidence_artifact_id_fkey"
            columns: ["artifact_id"]
            isOneToOne: false
            referencedRelation: "ml_artifact"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "compliance_evidence_control_id_fkey"
            columns: ["control_id"]
            isOneToOne: false
            referencedRelation: "compliance_control"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "compliance_evidence_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "compliance_evidence_validated_by_fkey"
            columns: ["validated_by"]
            isOneToOne: false
            referencedRelation: "user_account"
            referencedColumns: ["id"]
          },
        ]
      }
      compute_profile: {
        Row: {
          affinity: Json | null
          cpu_limit: number | null
          cpu_request: number | null
          created_at: string
          ephemeral_storage_mb: number | null
          gpu_count: number | null
          gpu_type: string | null
          id: string
          mem_limit_mb: number | null
          mem_request_mb: number | null
          name: string
          node_selector: Json | null
          priority_class: string | null
          tenant_id: string
          tolerations: Json | null
          updated_at: string
        }
        Insert: {
          affinity?: Json | null
          cpu_limit?: number | null
          cpu_request?: number | null
          created_at?: string
          ephemeral_storage_mb?: number | null
          gpu_count?: number | null
          gpu_type?: string | null
          id?: string
          mem_limit_mb?: number | null
          mem_request_mb?: number | null
          name: string
          node_selector?: Json | null
          priority_class?: string | null
          tenant_id: string
          tolerations?: Json | null
          updated_at?: string
        }
        Update: {
          affinity?: Json | null
          cpu_limit?: number | null
          cpu_request?: number | null
          created_at?: string
          ephemeral_storage_mb?: number | null
          gpu_count?: number | null
          gpu_type?: string | null
          id?: string
          mem_limit_mb?: number | null
          mem_request_mb?: number | null
          name?: string
          node_selector?: Json | null
          priority_class?: string | null
          tenant_id?: string
          tolerations?: Json | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "compute_profile_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant"
            referencedColumns: ["id"]
          },
        ]
      }
      container_registry: {
        Row: {
          auth_secret_ref: string | null
          created_at: string
          endpoint: string | null
          id: string
          is_default: boolean
          name: string
          tenant_id: string
          trust_policy: Json | null
          type: Database["public"]["Enums"]["container_registry_type"]
          updated_at: string
        }
        Insert: {
          auth_secret_ref?: string | null
          created_at?: string
          endpoint?: string | null
          id?: string
          is_default?: boolean
          name: string
          tenant_id: string
          trust_policy?: Json | null
          type: Database["public"]["Enums"]["container_registry_type"]
          updated_at?: string
        }
        Update: {
          auth_secret_ref?: string | null
          created_at?: string
          endpoint?: string | null
          id?: string
          is_default?: boolean
          name?: string
          tenant_id?: string
          trust_policy?: Json | null
          type?: Database["public"]["Enums"]["container_registry_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "container_registry_auth_secret_ref_fkey"
            columns: ["auth_secret_ref"]
            isOneToOne: false
            referencedRelation: "secret_ref"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "container_registry_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant"
            referencedColumns: ["id"]
          },
        ]
      }
      cost_allocation_rule: {
        Row: {
          created_at: string
          enabled: boolean | null
          expression: Json | null
          id: string
          name: string
          rule_type: Database["public"]["Enums"]["cost_allocation_rule_type"]
          tenant_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          enabled?: boolean | null
          expression?: Json | null
          id?: string
          name: string
          rule_type: Database["public"]["Enums"]["cost_allocation_rule_type"]
          tenant_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          enabled?: boolean | null
          expression?: Json | null
          id?: string
          name?: string
          rule_type?: Database["public"]["Enums"]["cost_allocation_rule_type"]
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cost_allocation_rule_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant"
            referencedColumns: ["id"]
          },
        ]
      }
      cost_record: {
        Row: {
          billing_account_id: string
          cost_amount: number | null
          created_at: string
          currency: string | null
          deployment_id: string | null
          id: string
          pipeline_id: string | null
          project_id: string | null
          provider: Database["public"]["Enums"]["cloud_provider"]
          resource_external_id: string | null
          run_id: string | null
          service: string | null
          sku: string | null
          tags: Json | null
          tenant_id: string
          usage_end: string | null
          usage_quantity: number | null
          usage_start: string | null
          usage_unit: string | null
        }
        Insert: {
          billing_account_id: string
          cost_amount?: number | null
          created_at?: string
          currency?: string | null
          deployment_id?: string | null
          id?: string
          pipeline_id?: string | null
          project_id?: string | null
          provider: Database["public"]["Enums"]["cloud_provider"]
          resource_external_id?: string | null
          run_id?: string | null
          service?: string | null
          sku?: string | null
          tags?: Json | null
          tenant_id: string
          usage_end?: string | null
          usage_quantity?: number | null
          usage_start?: string | null
          usage_unit?: string | null
        }
        Update: {
          billing_account_id?: string
          cost_amount?: number | null
          created_at?: string
          currency?: string | null
          deployment_id?: string | null
          id?: string
          pipeline_id?: string | null
          project_id?: string | null
          provider?: Database["public"]["Enums"]["cloud_provider"]
          resource_external_id?: string | null
          run_id?: string | null
          service?: string | null
          sku?: string | null
          tags?: Json | null
          tenant_id?: string
          usage_end?: string | null
          usage_quantity?: number | null
          usage_start?: string | null
          usage_unit?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cost_record_billing_account_id_fkey"
            columns: ["billing_account_id"]
            isOneToOne: false
            referencedRelation: "billing_account"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cost_record_deployment_id_fkey"
            columns: ["deployment_id"]
            isOneToOne: false
            referencedRelation: "model_deployment"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cost_record_pipeline_id_fkey"
            columns: ["pipeline_id"]
            isOneToOne: false
            referencedRelation: "cicd_pipeline"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cost_record_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "project"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cost_record_run_id_fkey"
            columns: ["run_id"]
            isOneToOne: false
            referencedRelation: "ml_run"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cost_record_run_id_fkey"
            columns: ["run_id"]
            isOneToOne: false
            referencedRelation: "run"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cost_record_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant"
            referencedColumns: ["id"]
          },
        ]
      }
      dashboard: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          layout: Json | null
          name: string
          project_id: string
          tenant_id: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          layout?: Json | null
          name: string
          project_id: string
          tenant_id: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          layout?: Json | null
          name?: string
          project_id?: string
          tenant_id?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "dashboard_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_account"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dashboard_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "project"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dashboard_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dashboard_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "user_account"
            referencedColumns: ["id"]
          },
        ]
      }
      dashboard_widget: {
        Row: {
          config: Json | null
          dashboard_id: string
          id: string
          position: Json | null
          tenant_id: string
          type: string
        }
        Insert: {
          config?: Json | null
          dashboard_id: string
          id?: string
          position?: Json | null
          tenant_id: string
          type: string
        }
        Update: {
          config?: Json | null
          dashboard_id?: string
          id?: string
          position?: Json | null
          tenant_id?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "dashboard_widget_dashboard_id_fkey"
            columns: ["dashboard_id"]
            isOneToOne: false
            referencedRelation: "dashboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dashboard_widget_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant"
            referencedColumns: ["id"]
          },
        ]
      }
      data_connection: {
        Row: {
          config: Json | null
          created_at: string
          created_by: string | null
          id: string
          last_tested_at: string | null
          name: string
          secret_ref_id: string | null
          tenant_id: string
          test_query: string | null
          test_status: string | null
          type: string
          updated_at: string
        }
        Insert: {
          config?: Json | null
          created_at?: string
          created_by?: string | null
          id?: string
          last_tested_at?: string | null
          name: string
          secret_ref_id?: string | null
          tenant_id: string
          test_query?: string | null
          test_status?: string | null
          type: string
          updated_at?: string
        }
        Update: {
          config?: Json | null
          created_at?: string
          created_by?: string | null
          id?: string
          last_tested_at?: string | null
          name?: string
          secret_ref_id?: string | null
          tenant_id?: string
          test_query?: string | null
          test_status?: string | null
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "data_connection_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_account"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "data_connection_secret_ref_id_fkey"
            columns: ["secret_ref_id"]
            isOneToOne: false
            referencedRelation: "secret_ref"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "data_connection_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant"
            referencedColumns: ["id"]
          },
        ]
      }
      data_contract: {
        Row: {
          created_at: string
          id: string
          name: string
          owner_user_id: string | null
          privacy_classification:
            | Database["public"]["Enums"]["privacy_classification"]
            | null
          project_id: string
          retention_days: number | null
          schema: Json | null
          sla: Json | null
          status: Database["public"]["Enums"]["data_contract_status"] | null
          tenant_id: string
          updated_at: string
          version: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          owner_user_id?: string | null
          privacy_classification?:
            | Database["public"]["Enums"]["privacy_classification"]
            | null
          project_id: string
          retention_days?: number | null
          schema?: Json | null
          sla?: Json | null
          status?: Database["public"]["Enums"]["data_contract_status"] | null
          tenant_id: string
          updated_at?: string
          version?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          owner_user_id?: string | null
          privacy_classification?:
            | Database["public"]["Enums"]["privacy_classification"]
            | null
          project_id?: string
          retention_days?: number | null
          schema?: Json | null
          sla?: Json | null
          status?: Database["public"]["Enums"]["data_contract_status"] | null
          tenant_id?: string
          updated_at?: string
          version?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "data_contract_owner_user_id_fkey"
            columns: ["owner_user_id"]
            isOneToOne: false
            referencedRelation: "user_account"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "data_contract_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "project"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "data_contract_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant"
            referencedColumns: ["id"]
          },
        ]
      }
      data_contract_binding: {
        Row: {
          contract_id: string
          created_at: string
          entity_id: string
          entity_type: string
          id: string
          tenant_id: string
        }
        Insert: {
          contract_id: string
          created_at?: string
          entity_id: string
          entity_type: string
          id?: string
          tenant_id: string
        }
        Update: {
          contract_id?: string
          created_at?: string
          entity_id?: string
          entity_type?: string
          id?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "data_contract_binding_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "data_contract"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "data_contract_binding_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant"
            referencedColumns: ["id"]
          },
        ]
      }
      drift_event: {
        Row: {
          acknowledged_at: string | null
          acknowledged_by: string | null
          detected_at: string | null
          diff_uri: string | null
          id: string
          resolved_at: string | null
          resolved_by: string | null
          resource_id: string
          severity: Database["public"]["Enums"]["drift_severity"] | null
          status: Database["public"]["Enums"]["drift_status"] | null
          summary: string | null
          tenant_id: string
        }
        Insert: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          detected_at?: string | null
          diff_uri?: string | null
          id?: string
          resolved_at?: string | null
          resolved_by?: string | null
          resource_id: string
          severity?: Database["public"]["Enums"]["drift_severity"] | null
          status?: Database["public"]["Enums"]["drift_status"] | null
          summary?: string | null
          tenant_id: string
        }
        Update: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          detected_at?: string | null
          diff_uri?: string | null
          id?: string
          resolved_at?: string | null
          resolved_by?: string | null
          resource_id?: string
          severity?: Database["public"]["Enums"]["drift_severity"] | null
          status?: Database["public"]["Enums"]["drift_status"] | null
          summary?: string | null
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "drift_event_acknowledged_by_fkey"
            columns: ["acknowledged_by"]
            isOneToOne: false
            referencedRelation: "user_account"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "drift_event_resolved_by_fkey"
            columns: ["resolved_by"]
            isOneToOne: false
            referencedRelation: "user_account"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "drift_event_resource_id_fkey"
            columns: ["resource_id"]
            isOneToOne: false
            referencedRelation: "managed_resource"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "drift_event_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant"
            referencedColumns: ["id"]
          },
        ]
      }
      efficiency_kpi_snapshot: {
        Row: {
          co2e_kg: number | null
          cost_amount: number | null
          cpu_hours: number | null
          created_at: string
          date_key: string
          gpu_hours: number | null
          id: string
          mean_duration_sec: number | null
          project_id: string
          success_rate: number | null
          tenant_id: string
        }
        Insert: {
          co2e_kg?: number | null
          cost_amount?: number | null
          cpu_hours?: number | null
          created_at?: string
          date_key: string
          gpu_hours?: number | null
          id?: string
          mean_duration_sec?: number | null
          project_id: string
          success_rate?: number | null
          tenant_id: string
        }
        Update: {
          co2e_kg?: number | null
          cost_amount?: number | null
          cpu_hours?: number | null
          created_at?: string
          date_key?: string
          gpu_hours?: number | null
          id?: string
          mean_duration_sec?: number | null
          project_id?: string
          success_rate?: number | null
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "efficiency_kpi_snapshot_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "project"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "efficiency_kpi_snapshot_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant"
            referencedColumns: ["id"]
          },
        ]
      }
      environment: {
        Row: {
          base_image: string | null
          build_strategy: Database["public"]["Enums"]["build_strategy"] | null
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          is_default: boolean
          name: string
          project_id: string | null
          registry_id: string | null
          runtime_policy_id: string | null
          spec: Json | null
          status: Database["public"]["Enums"]["environment_status"]
          tenant_id: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          base_image?: string | null
          build_strategy?: Database["public"]["Enums"]["build_strategy"] | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_default?: boolean
          name: string
          project_id?: string | null
          registry_id?: string | null
          runtime_policy_id?: string | null
          spec?: Json | null
          status?: Database["public"]["Enums"]["environment_status"]
          tenant_id: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          base_image?: string | null
          build_strategy?: Database["public"]["Enums"]["build_strategy"] | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_default?: boolean
          name?: string
          project_id?: string | null
          registry_id?: string | null
          runtime_policy_id?: string | null
          spec?: Json | null
          status?: Database["public"]["Enums"]["environment_status"]
          tenant_id?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "environment_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_account"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "environment_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "project"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "environment_registry_id_fkey"
            columns: ["registry_id"]
            isOneToOne: false
            referencedRelation: "container_registry"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "environment_runtime_policy_id_fkey"
            columns: ["runtime_policy_id"]
            isOneToOne: false
            referencedRelation: "runtime_policy"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "environment_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "environment_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "user_account"
            referencedColumns: ["id"]
          },
        ]
      }
      environment_build: {
        Row: {
          build_log_uri: string | null
          created_at: string
          created_by: string | null
          duration_seconds: number | null
          environment_id: string
          failure_reason: string | null
          finished_at: string | null
          git_commit_sha: string | null
          id: string
          image_digest: string | null
          image_name: string | null
          image_tag: string | null
          sbom_uri: string | null
          started_at: string | null
          status: Database["public"]["Enums"]["environment_build_status"]
          tenant_id: string
          version: number
          vuln_report_uri: string | null
        }
        Insert: {
          build_log_uri?: string | null
          created_at?: string
          created_by?: string | null
          duration_seconds?: number | null
          environment_id: string
          failure_reason?: string | null
          finished_at?: string | null
          git_commit_sha?: string | null
          id?: string
          image_digest?: string | null
          image_name?: string | null
          image_tag?: string | null
          sbom_uri?: string | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["environment_build_status"]
          tenant_id: string
          version?: number
          vuln_report_uri?: string | null
        }
        Update: {
          build_log_uri?: string | null
          created_at?: string
          created_by?: string | null
          duration_seconds?: number | null
          environment_id?: string
          failure_reason?: string | null
          finished_at?: string | null
          git_commit_sha?: string | null
          id?: string
          image_digest?: string | null
          image_name?: string | null
          image_tag?: string | null
          sbom_uri?: string | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["environment_build_status"]
          tenant_id?: string
          version?: number
          vuln_report_uri?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "environment_build_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_account"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "environment_build_environment_id_fkey"
            columns: ["environment_id"]
            isOneToOne: false
            referencedRelation: "environment"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "environment_build_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant"
            referencedColumns: ["id"]
          },
        ]
      }
      event_outbox: {
        Row: {
          aggregate_id: string | null
          aggregate_type: string | null
          attempts: number
          created_at: string
          event_type: string
          id: string
          last_error: string | null
          max_attempts: number
          next_retry_at: string | null
          payload: Json
          sent_at: string | null
          status: Database["public"]["Enums"]["event_outbox_status"]
          tenant_id: string
        }
        Insert: {
          aggregate_id?: string | null
          aggregate_type?: string | null
          attempts?: number
          created_at?: string
          event_type: string
          id?: string
          last_error?: string | null
          max_attempts?: number
          next_retry_at?: string | null
          payload?: Json
          sent_at?: string | null
          status?: Database["public"]["Enums"]["event_outbox_status"]
          tenant_id: string
        }
        Update: {
          aggregate_id?: string | null
          aggregate_type?: string | null
          attempts?: number
          created_at?: string
          event_type?: string
          id?: string
          last_error?: string | null
          max_attempts?: number
          next_retry_at?: string | null
          payload?: Json
          sent_at?: string | null
          status?: Database["public"]["Enums"]["event_outbox_status"]
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_outbox_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant"
            referencedColumns: ["id"]
          },
        ]
      }
      execution_link: {
        Row: {
          created_at: string
          id: string
          project_id: string
          relation: string
          source_id: string
          source_type: string
          target_id: string
          target_type: string
          tenant_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          project_id: string
          relation: string
          source_id: string
          source_type: string
          target_id: string
          target_type: string
          tenant_id: string
        }
        Update: {
          created_at?: string
          id?: string
          project_id?: string
          relation?: string
          source_id?: string
          source_type?: string
          target_id?: string
          target_type?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "execution_link_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "project"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "execution_link_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant"
            referencedColumns: ["id"]
          },
        ]
      }
      experiment: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          name: string
          project_id: string
          tags: Json | null
          tenant_id: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          name: string
          project_id: string
          tags?: Json | null
          tenant_id: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          name?: string
          project_id?: string
          tags?: Json | null
          tenant_id?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "experiment_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_account"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "experiment_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "project"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "experiment_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "experiment_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "user_account"
            referencedColumns: ["id"]
          },
        ]
      }
      feature_flag: {
        Row: {
          created_at: string
          description: string | null
          enabled: boolean
          id: string
          key: string
          targeting: Json | null
          tenant_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          enabled?: boolean
          id?: string
          key: string
          targeting?: Json | null
          tenant_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          enabled?: boolean
          id?: string
          key?: string
          targeting?: Json | null
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "feature_flag_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant"
            referencedColumns: ["id"]
          },
        ]
      }
      git_provider: {
        Row: {
          app_installation_ref: Json | null
          auth_secret_ref: string | null
          base_url: string | null
          created_at: string
          id: string
          name: string
          tenant_id: string
          type: Database["public"]["Enums"]["git_provider_type"]
          updated_at: string
        }
        Insert: {
          app_installation_ref?: Json | null
          auth_secret_ref?: string | null
          base_url?: string | null
          created_at?: string
          id?: string
          name: string
          tenant_id: string
          type: Database["public"]["Enums"]["git_provider_type"]
          updated_at?: string
        }
        Update: {
          app_installation_ref?: Json | null
          auth_secret_ref?: string | null
          base_url?: string | null
          created_at?: string
          id?: string
          name?: string
          tenant_id?: string
          type?: Database["public"]["Enums"]["git_provider_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "git_provider_auth_secret_ref_fkey"
            columns: ["auth_secret_ref"]
            isOneToOne: false
            referencedRelation: "secret_ref"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "git_provider_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant"
            referencedColumns: ["id"]
          },
        ]
      }
      gitlab_instance: {
        Row: {
          api_version: string | null
          auth_secret_ref: string | null
          base_url: string | null
          created_at: string
          id: string
          mode: Database["public"]["Enums"]["gitlab_mode"]
          name: string
          tenant_id: string
          updated_at: string
          webhook_secret_ref: string | null
        }
        Insert: {
          api_version?: string | null
          auth_secret_ref?: string | null
          base_url?: string | null
          created_at?: string
          id?: string
          mode?: Database["public"]["Enums"]["gitlab_mode"]
          name: string
          tenant_id: string
          updated_at?: string
          webhook_secret_ref?: string | null
        }
        Update: {
          api_version?: string | null
          auth_secret_ref?: string | null
          base_url?: string | null
          created_at?: string
          id?: string
          mode?: Database["public"]["Enums"]["gitlab_mode"]
          name?: string
          tenant_id?: string
          updated_at?: string
          webhook_secret_ref?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "gitlab_instance_auth_secret_ref_fkey"
            columns: ["auth_secret_ref"]
            isOneToOne: false
            referencedRelation: "secret_ref"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gitlab_instance_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gitlab_instance_webhook_secret_ref_fkey"
            columns: ["webhook_secret_ref"]
            isOneToOne: false
            referencedRelation: "secret_ref"
            referencedColumns: ["id"]
          },
        ]
      }
      governance_incident: {
        Row: {
          ai_system_id: string
          closed_at: string | null
          description: string | null
          detected_at: string | null
          id: string
          model_deployment_id: string | null
          owner_user_id: string | null
          resolution: string | null
          severity: string | null
          status:
            | Database["public"]["Enums"]["governance_incident_status"]
            | null
          tenant_id: string
          type: Database["public"]["Enums"]["governance_incident_type"]
        }
        Insert: {
          ai_system_id: string
          closed_at?: string | null
          description?: string | null
          detected_at?: string | null
          id?: string
          model_deployment_id?: string | null
          owner_user_id?: string | null
          resolution?: string | null
          severity?: string | null
          status?:
            | Database["public"]["Enums"]["governance_incident_status"]
            | null
          tenant_id: string
          type: Database["public"]["Enums"]["governance_incident_type"]
        }
        Update: {
          ai_system_id?: string
          closed_at?: string | null
          description?: string | null
          detected_at?: string | null
          id?: string
          model_deployment_id?: string | null
          owner_user_id?: string | null
          resolution?: string | null
          severity?: string | null
          status?:
            | Database["public"]["Enums"]["governance_incident_status"]
            | null
          tenant_id?: string
          type?: Database["public"]["Enums"]["governance_incident_type"]
        }
        Relationships: [
          {
            foreignKeyName: "governance_incident_ai_system_id_fkey"
            columns: ["ai_system_id"]
            isOneToOne: false
            referencedRelation: "ai_system"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "governance_incident_model_deployment_id_fkey"
            columns: ["model_deployment_id"]
            isOneToOne: false
            referencedRelation: "model_deployment"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "governance_incident_owner_user_id_fkey"
            columns: ["owner_user_id"]
            isOneToOne: false
            referencedRelation: "user_account"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "governance_incident_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant"
            referencedColumns: ["id"]
          },
        ]
      }
      group: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant"
            referencedColumns: ["id"]
          },
        ]
      }
      group_member: {
        Row: {
          created_at: string
          group_id: string
          tenant_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          group_id: string
          tenant_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          group_id?: string
          tenant_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_member_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "group"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "group_member_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "group_member_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_account"
            referencedColumns: ["id"]
          },
        ]
      }
      iac_change_summary: {
        Row: {
          add_count: number | null
          change_count: number | null
          created_at: string
          destroy_count: number | null
          details_uri: string | null
          iac_run_id: string
          id: string
          summary: string | null
          tenant_id: string
        }
        Insert: {
          add_count?: number | null
          change_count?: number | null
          created_at?: string
          destroy_count?: number | null
          details_uri?: string | null
          iac_run_id: string
          id?: string
          summary?: string | null
          tenant_id: string
        }
        Update: {
          add_count?: number | null
          change_count?: number | null
          created_at?: string
          destroy_count?: number | null
          details_uri?: string | null
          iac_run_id?: string
          id?: string
          summary?: string | null
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "iac_change_summary_iac_run_id_fkey"
            columns: ["iac_run_id"]
            isOneToOne: false
            referencedRelation: "iac_run"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "iac_change_summary_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant"
            referencedColumns: ["id"]
          },
        ]
      }
      iac_run: {
        Row: {
          action: Database["public"]["Enums"]["iac_action"]
          created_at: string
          created_by: string | null
          ended_at: string | null
          error_message: string | null
          id: string
          lock_id: string | null
          plan_artifact_id: string | null
          project_id: string
          started_at: string | null
          state_uri: string | null
          status: Database["public"]["Enums"]["iac_run_status"] | null
          tenant_id: string
          trigger: string | null
          workspace_id: string
        }
        Insert: {
          action: Database["public"]["Enums"]["iac_action"]
          created_at?: string
          created_by?: string | null
          ended_at?: string | null
          error_message?: string | null
          id?: string
          lock_id?: string | null
          plan_artifact_id?: string | null
          project_id: string
          started_at?: string | null
          state_uri?: string | null
          status?: Database["public"]["Enums"]["iac_run_status"] | null
          tenant_id: string
          trigger?: string | null
          workspace_id: string
        }
        Update: {
          action?: Database["public"]["Enums"]["iac_action"]
          created_at?: string
          created_by?: string | null
          ended_at?: string | null
          error_message?: string | null
          id?: string
          lock_id?: string | null
          plan_artifact_id?: string | null
          project_id?: string
          started_at?: string | null
          state_uri?: string | null
          status?: Database["public"]["Enums"]["iac_run_status"] | null
          tenant_id?: string
          trigger?: string | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "iac_run_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_account"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "iac_run_plan_artifact_id_fkey"
            columns: ["plan_artifact_id"]
            isOneToOne: false
            referencedRelation: "cicd_job_artifact"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "iac_run_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "project"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "iac_run_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "iac_run_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "iac_workspace"
            referencedColumns: ["id"]
          },
        ]
      }
      iac_workspace: {
        Row: {
          backend_config: Json | null
          backend_type: Database["public"]["Enums"]["iac_backend_type"] | null
          created_at: string
          id: string
          name: string
          project_id: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          backend_config?: Json | null
          backend_type?: Database["public"]["Enums"]["iac_backend_type"] | null
          created_at?: string
          id?: string
          name: string
          project_id: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          backend_config?: Json | null
          backend_type?: Database["public"]["Enums"]["iac_backend_type"] | null
          created_at?: string
          id?: string
          name?: string
          project_id?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "iac_workspace_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "project"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "iac_workspace_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant"
            referencedColumns: ["id"]
          },
        ]
      }
      identity_provider: {
        Row: {
          client_id: string | null
          created_at: string
          enabled: boolean
          id: string
          issuer_url: string | null
          sso_metadata: Json | null
          tenant_id: string
          type: Database["public"]["Enums"]["idp_type"]
          updated_at: string
        }
        Insert: {
          client_id?: string | null
          created_at?: string
          enabled?: boolean
          id?: string
          issuer_url?: string | null
          sso_metadata?: Json | null
          tenant_id: string
          type: Database["public"]["Enums"]["idp_type"]
          updated_at?: string
        }
        Update: {
          client_id?: string | null
          created_at?: string
          enabled?: boolean
          id?: string
          issuer_url?: string | null
          sso_metadata?: Json | null
          tenant_id?: string
          type?: Database["public"]["Enums"]["idp_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "identity_provider_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant"
            referencedColumns: ["id"]
          },
        ]
      }
      incident: {
        Row: {
          created_at: string
          declared_at: string | null
          description: string | null
          detected_at: string | null
          id: string
          impact: string | null
          owner_user_id: string | null
          project_id: string
          related_entity: Json | null
          resolved_at: string | null
          root_cause: string | null
          severity: Database["public"]["Enums"]["incident_severity"] | null
          status: Database["public"]["Enums"]["incident_status"] | null
          tenant_id: string
          timeline_uri: string | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          declared_at?: string | null
          description?: string | null
          detected_at?: string | null
          id?: string
          impact?: string | null
          owner_user_id?: string | null
          project_id: string
          related_entity?: Json | null
          resolved_at?: string | null
          root_cause?: string | null
          severity?: Database["public"]["Enums"]["incident_severity"] | null
          status?: Database["public"]["Enums"]["incident_status"] | null
          tenant_id: string
          timeline_uri?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          declared_at?: string | null
          description?: string | null
          detected_at?: string | null
          id?: string
          impact?: string | null
          owner_user_id?: string | null
          project_id?: string
          related_entity?: Json | null
          resolved_at?: string | null
          root_cause?: string | null
          severity?: Database["public"]["Enums"]["incident_severity"] | null
          status?: Database["public"]["Enums"]["incident_status"] | null
          tenant_id?: string
          timeline_uri?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "incident_owner_user_id_fkey"
            columns: ["owner_user_id"]
            isOneToOne: false
            referencedRelation: "user_account"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "incident_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "project"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "incident_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant"
            referencedColumns: ["id"]
          },
        ]
      }
      incident_update: {
        Row: {
          author_user_id: string
          created_at: string
          id: string
          incident_id: string
          message: string | null
          status: Database["public"]["Enums"]["incident_update_type"] | null
          tenant_id: string
        }
        Insert: {
          author_user_id: string
          created_at?: string
          id?: string
          incident_id: string
          message?: string | null
          status?: Database["public"]["Enums"]["incident_update_type"] | null
          tenant_id: string
        }
        Update: {
          author_user_id?: string
          created_at?: string
          id?: string
          incident_id?: string
          message?: string | null
          status?: Database["public"]["Enums"]["incident_update_type"] | null
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "incident_update_author_user_id_fkey"
            columns: ["author_user_id"]
            isOneToOne: false
            referencedRelation: "user_account"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "incident_update_incident_id_fkey"
            columns: ["incident_id"]
            isOneToOne: false
            referencedRelation: "incident"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "incident_update_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant"
            referencedColumns: ["id"]
          },
        ]
      }
      integration_endpoint: {
        Row: {
          config: Json | null
          created_at: string
          enabled: boolean | null
          id: string
          name: string
          secret_ref_id: string | null
          tenant_id: string
          type: Database["public"]["Enums"]["integration_type"]
          updated_at: string
        }
        Insert: {
          config?: Json | null
          created_at?: string
          enabled?: boolean | null
          id?: string
          name: string
          secret_ref_id?: string | null
          tenant_id: string
          type: Database["public"]["Enums"]["integration_type"]
          updated_at?: string
        }
        Update: {
          config?: Json | null
          created_at?: string
          enabled?: boolean | null
          id?: string
          name?: string
          secret_ref_id?: string | null
          tenant_id?: string
          type?: Database["public"]["Enums"]["integration_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "integration_endpoint_secret_ref_id_fkey"
            columns: ["secret_ref_id"]
            isOneToOne: false
            referencedRelation: "secret_ref"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "integration_endpoint_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant"
            referencedColumns: ["id"]
          },
        ]
      }
      k8s_cluster: {
        Row: {
          api_server_url: string | null
          cluster_identity: Json | null
          created_at: string
          environment: Database["public"]["Enums"]["k8s_environment"]
          id: string
          labels: Json | null
          name: string
          network_profile: Json | null
          provider: Database["public"]["Enums"]["cloud_provider"]
          region: string | null
          status: Database["public"]["Enums"]["k8s_cluster_status"]
          tenant_id: string
          updated_at: string
          version: string | null
        }
        Insert: {
          api_server_url?: string | null
          cluster_identity?: Json | null
          created_at?: string
          environment?: Database["public"]["Enums"]["k8s_environment"]
          id?: string
          labels?: Json | null
          name: string
          network_profile?: Json | null
          provider: Database["public"]["Enums"]["cloud_provider"]
          region?: string | null
          status?: Database["public"]["Enums"]["k8s_cluster_status"]
          tenant_id: string
          updated_at?: string
          version?: string | null
        }
        Update: {
          api_server_url?: string | null
          cluster_identity?: Json | null
          created_at?: string
          environment?: Database["public"]["Enums"]["k8s_environment"]
          id?: string
          labels?: Json | null
          name?: string
          network_profile?: Json | null
          provider?: Database["public"]["Enums"]["cloud_provider"]
          region?: string | null
          status?: Database["public"]["Enums"]["k8s_cluster_status"]
          tenant_id?: string
          updated_at?: string
          version?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "k8s_cluster_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant"
            referencedColumns: ["id"]
          },
        ]
      }
      k8s_namespace_binding: {
        Row: {
          cluster_id: string
          created_at: string
          id: string
          limit_range: Json | null
          namespace: string
          network_policy_profile: string | null
          pod_security_profile: string | null
          project_id: string
          resource_quota: Json | null
          status: string | null
          tenant_id: string
          updated_at: string
        }
        Insert: {
          cluster_id: string
          created_at?: string
          id?: string
          limit_range?: Json | null
          namespace: string
          network_policy_profile?: string | null
          pod_security_profile?: string | null
          project_id: string
          resource_quota?: Json | null
          status?: string | null
          tenant_id: string
          updated_at?: string
        }
        Update: {
          cluster_id?: string
          created_at?: string
          id?: string
          limit_range?: Json | null
          namespace?: string
          network_policy_profile?: string | null
          pod_security_profile?: string | null
          project_id?: string
          resource_quota?: Json | null
          status?: string | null
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "k8s_namespace_binding_cluster_id_fkey"
            columns: ["cluster_id"]
            isOneToOne: false
            referencedRelation: "k8s_cluster"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "k8s_namespace_binding_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "project"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "k8s_namespace_binding_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant"
            referencedColumns: ["id"]
          },
        ]
      }
      kanban_board: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          project_id: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          project_id: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          project_id?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "kanban_board_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "project"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kanban_board_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant"
            referencedColumns: ["id"]
          },
        ]
      }
      kanban_column: {
        Row: {
          board_id: string
          id: string
          name: string
          position: number
          tenant_id: string
          wip_limit: number | null
        }
        Insert: {
          board_id: string
          id?: string
          name: string
          position?: number
          tenant_id: string
          wip_limit?: number | null
        }
        Update: {
          board_id?: string
          id?: string
          name?: string
          position?: number
          tenant_id?: string
          wip_limit?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "kanban_column_board_id_fkey"
            columns: ["board_id"]
            isOneToOne: false
            referencedRelation: "kanban_board"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kanban_column_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant"
            referencedColumns: ["id"]
          },
        ]
      }
      managed_resource: {
        Row: {
          created_at: string
          created_by: string | null
          desired_state: Json | null
          environment: string | null
          id: string
          last_reconciled_at: string | null
          observed_state: Json | null
          project_id: string
          provider: Database["public"]["Enums"]["resource_provider_type"]
          region: string | null
          resource_id_external: string | null
          resource_name: string
          resource_type: string
          status: Database["public"]["Enums"]["managed_resource_status"] | null
          tenant_id: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          desired_state?: Json | null
          environment?: string | null
          id?: string
          last_reconciled_at?: string | null
          observed_state?: Json | null
          project_id: string
          provider: Database["public"]["Enums"]["resource_provider_type"]
          region?: string | null
          resource_id_external?: string | null
          resource_name: string
          resource_type: string
          status?: Database["public"]["Enums"]["managed_resource_status"] | null
          tenant_id: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          desired_state?: Json | null
          environment?: string | null
          id?: string
          last_reconciled_at?: string | null
          observed_state?: Json | null
          project_id?: string
          provider?: Database["public"]["Enums"]["resource_provider_type"]
          region?: string | null
          resource_id_external?: string | null
          resource_name?: string
          resource_type?: string
          status?: Database["public"]["Enums"]["managed_resource_status"] | null
          tenant_id?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "managed_resource_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_account"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "managed_resource_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "project"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "managed_resource_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "managed_resource_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "user_account"
            referencedColumns: ["id"]
          },
        ]
      }
      metric_alert: {
        Row: {
          acknowledged: boolean
          acknowledged_at: string | null
          acknowledged_by: string | null
          alert_type: string
          created_at: string
          current_value: number | null
          id: string
          message: string | null
          metric_key: string
          run_id: string
          tenant_id: string
          threshold_value: number | null
        }
        Insert: {
          acknowledged?: boolean
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          alert_type: string
          created_at?: string
          current_value?: number | null
          id?: string
          message?: string | null
          metric_key: string
          run_id: string
          tenant_id: string
          threshold_value?: number | null
        }
        Update: {
          acknowledged?: boolean
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          alert_type?: string
          created_at?: string
          current_value?: number | null
          id?: string
          message?: string | null
          metric_key?: string
          run_id?: string
          tenant_id?: string
          threshold_value?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "metric_alert_acknowledged_by_fkey"
            columns: ["acknowledged_by"]
            isOneToOne: false
            referencedRelation: "user_account"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "metric_alert_run_id_fkey"
            columns: ["run_id"]
            isOneToOne: false
            referencedRelation: "ml_run"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "metric_alert_run_id_fkey"
            columns: ["run_id"]
            isOneToOne: false
            referencedRelation: "run"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "metric_alert_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant"
            referencedColumns: ["id"]
          },
        ]
      }
      metric_definition: {
        Row: {
          alert_threshold: number | null
          created_at: string
          description: string | null
          display_name: string | null
          goal_direction: string | null
          goal_value: number | null
          id: string
          key: string
          metadata: Json | null
          metric_type: string | null
          project_id: string
          tags: Json | null
          tenant_id: string
          unit: string | null
          updated_at: string
          warning_threshold: number | null
        }
        Insert: {
          alert_threshold?: number | null
          created_at?: string
          description?: string | null
          display_name?: string | null
          goal_direction?: string | null
          goal_value?: number | null
          id?: string
          key: string
          metadata?: Json | null
          metric_type?: string | null
          project_id: string
          tags?: Json | null
          tenant_id: string
          unit?: string | null
          updated_at?: string
          warning_threshold?: number | null
        }
        Update: {
          alert_threshold?: number | null
          created_at?: string
          description?: string | null
          display_name?: string | null
          goal_direction?: string | null
          goal_value?: number | null
          id?: string
          key?: string
          metadata?: Json | null
          metric_type?: string | null
          project_id?: string
          tags?: Json | null
          tenant_id?: string
          unit?: string | null
          updated_at?: string
          warning_threshold?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "metric_definition_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "project"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "metric_definition_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant"
            referencedColumns: ["id"]
          },
        ]
      }
      milestone: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          due_date: string | null
          id: string
          progress_percent: number | null
          project_id: string
          status: Database["public"]["Enums"]["milestone_status"]
          tenant_id: string
          title: string
          updated_at: string
          updated_by: string | null
          weight: number | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          progress_percent?: number | null
          project_id: string
          status?: Database["public"]["Enums"]["milestone_status"]
          tenant_id: string
          title: string
          updated_at?: string
          updated_by?: string | null
          weight?: number | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          progress_percent?: number | null
          project_id?: string
          status?: Database["public"]["Enums"]["milestone_status"]
          tenant_id?: string
          title?: string
          updated_at?: string
          updated_by?: string | null
          weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "milestone_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "project"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "milestone_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant"
            referencedColumns: ["id"]
          },
        ]
      }
      model: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          name: string
          project_id: string
          tags: Json | null
          tenant_id: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          name: string
          project_id: string
          tags?: Json | null
          tenant_id: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          name?: string
          project_id?: string
          tags?: Json | null
          tenant_id?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "model_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_account"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "model_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "project"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "model_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "model_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "user_account"
            referencedColumns: ["id"]
          },
        ]
      }
      model_card: {
        Row: {
          ai_system_id: string | null
          caveats: string | null
          created_at: string
          created_by: string | null
          ethical_considerations: string | null
          evaluation_data: string | null
          id: string
          limitations: string | null
          model_version_id: string
          performance: Json | null
          summary: string | null
          tenant_id: string
          training_data: string | null
          updated_at: string
          version: string | null
        }
        Insert: {
          ai_system_id?: string | null
          caveats?: string | null
          created_at?: string
          created_by?: string | null
          ethical_considerations?: string | null
          evaluation_data?: string | null
          id?: string
          limitations?: string | null
          model_version_id: string
          performance?: Json | null
          summary?: string | null
          tenant_id: string
          training_data?: string | null
          updated_at?: string
          version?: string | null
        }
        Update: {
          ai_system_id?: string | null
          caveats?: string | null
          created_at?: string
          created_by?: string | null
          ethical_considerations?: string | null
          evaluation_data?: string | null
          id?: string
          limitations?: string | null
          model_version_id?: string
          performance?: Json | null
          summary?: string | null
          tenant_id?: string
          training_data?: string | null
          updated_at?: string
          version?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "model_card_ai_system_id_fkey"
            columns: ["ai_system_id"]
            isOneToOne: false
            referencedRelation: "ai_system"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "model_card_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_account"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "model_card_model_version_id_fkey"
            columns: ["model_version_id"]
            isOneToOne: true
            referencedRelation: "model_version"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "model_card_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant"
            referencedColumns: ["id"]
          },
        ]
      }
      model_deployment: {
        Row: {
          auth_policy: Json | null
          cluster_id: string | null
          created_at: string
          created_by: string | null
          endpoint_url: string | null
          id: string
          model_version_id: string
          name: string
          namespace: string | null
          project_id: string
          resources: Json | null
          rollout_strategy:
            | Database["public"]["Enums"]["rollout_strategy"]
            | null
          scaling: Json | null
          status: Database["public"]["Enums"]["deployment_status"]
          status_message: string | null
          tenant_id: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          auth_policy?: Json | null
          cluster_id?: string | null
          created_at?: string
          created_by?: string | null
          endpoint_url?: string | null
          id?: string
          model_version_id: string
          name: string
          namespace?: string | null
          project_id: string
          resources?: Json | null
          rollout_strategy?:
            | Database["public"]["Enums"]["rollout_strategy"]
            | null
          scaling?: Json | null
          status?: Database["public"]["Enums"]["deployment_status"]
          status_message?: string | null
          tenant_id: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          auth_policy?: Json | null
          cluster_id?: string | null
          created_at?: string
          created_by?: string | null
          endpoint_url?: string | null
          id?: string
          model_version_id?: string
          name?: string
          namespace?: string | null
          project_id?: string
          resources?: Json | null
          rollout_strategy?:
            | Database["public"]["Enums"]["rollout_strategy"]
            | null
          scaling?: Json | null
          status?: Database["public"]["Enums"]["deployment_status"]
          status_message?: string | null
          tenant_id?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "model_deployment_cluster_id_fkey"
            columns: ["cluster_id"]
            isOneToOne: false
            referencedRelation: "k8s_cluster"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "model_deployment_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_account"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "model_deployment_model_version_id_fkey"
            columns: ["model_version_id"]
            isOneToOne: false
            referencedRelation: "model_version"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "model_deployment_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "project"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "model_deployment_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "model_deployment_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "user_account"
            referencedColumns: ["id"]
          },
        ]
      }
      model_version: {
        Row: {
          approval_required: boolean
          artifact_id: string | null
          created_at: string
          created_by: string | null
          id: string
          metrics_summary: Json | null
          model_id: string
          signature: Json | null
          source_run_id: string | null
          status: Database["public"]["Enums"]["model_version_status"]
          tenant_id: string
          version: number
        }
        Insert: {
          approval_required?: boolean
          artifact_id?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          metrics_summary?: Json | null
          model_id: string
          signature?: Json | null
          source_run_id?: string | null
          status?: Database["public"]["Enums"]["model_version_status"]
          tenant_id: string
          version?: number
        }
        Update: {
          approval_required?: boolean
          artifact_id?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          metrics_summary?: Json | null
          model_id?: string
          signature?: Json | null
          source_run_id?: string | null
          status?: Database["public"]["Enums"]["model_version_status"]
          tenant_id?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "model_version_artifact_id_fkey"
            columns: ["artifact_id"]
            isOneToOne: false
            referencedRelation: "artifact"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "model_version_artifact_id_fkey"
            columns: ["artifact_id"]
            isOneToOne: false
            referencedRelation: "ml_artifact"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "model_version_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_account"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "model_version_model_id_fkey"
            columns: ["model_id"]
            isOneToOne: false
            referencedRelation: "model"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "model_version_source_run_id_fkey"
            columns: ["source_run_id"]
            isOneToOne: false
            referencedRelation: "ml_run"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "model_version_source_run_id_fkey"
            columns: ["source_run_id"]
            isOneToOne: false
            referencedRelation: "run"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "model_version_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant"
            referencedColumns: ["id"]
          },
        ]
      }
      monitoring_plan: {
        Row: {
          active: boolean | null
          ai_system_id: string
          created_at: string
          id: string
          plan: Json | null
          tenant_id: string
          updated_at: string
        }
        Insert: {
          active?: boolean | null
          ai_system_id: string
          created_at?: string
          id?: string
          plan?: Json | null
          tenant_id: string
          updated_at?: string
        }
        Update: {
          active?: boolean | null
          ai_system_id?: string
          created_at?: string
          id?: string
          plan?: Json | null
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "monitoring_plan_ai_system_id_fkey"
            columns: ["ai_system_id"]
            isOneToOne: false
            referencedRelation: "ai_system"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "monitoring_plan_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant"
            referencedColumns: ["id"]
          },
        ]
      }
      notification: {
        Row: {
          action_url: string | null
          channel: Database["public"]["Enums"]["notification_channel"] | null
          created_at: string
          entity_id: string | null
          entity_type: string | null
          id: string
          message: string | null
          read: boolean
          read_at: string | null
          tenant_id: string
          title: string | null
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Insert: {
          action_url?: string | null
          channel?: Database["public"]["Enums"]["notification_channel"] | null
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          message?: string | null
          read?: boolean
          read_at?: string | null
          tenant_id: string
          title?: string | null
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Update: {
          action_url?: string | null
          channel?: Database["public"]["Enums"]["notification_channel"] | null
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          message?: string | null
          read?: boolean
          read_at?: string | null
          tenant_id?: string
          title?: string | null
          type?: Database["public"]["Enums"]["notification_type"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notification_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_account"
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
      object_store: {
        Row: {
          auth_secret_ref: string | null
          bucket: string | null
          created_at: string
          endpoint: string | null
          id: string
          is_default: boolean
          kms_key_ref: string | null
          name: string
          prefix: string | null
          retention_policy: Json | null
          tenant_id: string
          type: Database["public"]["Enums"]["object_store_type"]
          updated_at: string
        }
        Insert: {
          auth_secret_ref?: string | null
          bucket?: string | null
          created_at?: string
          endpoint?: string | null
          id?: string
          is_default?: boolean
          kms_key_ref?: string | null
          name: string
          prefix?: string | null
          retention_policy?: Json | null
          tenant_id: string
          type: Database["public"]["Enums"]["object_store_type"]
          updated_at?: string
        }
        Update: {
          auth_secret_ref?: string | null
          bucket?: string | null
          created_at?: string
          endpoint?: string | null
          id?: string
          is_default?: boolean
          kms_key_ref?: string | null
          name?: string
          prefix?: string | null
          retention_policy?: Json | null
          tenant_id?: string
          type?: Database["public"]["Enums"]["object_store_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "object_store_auth_secret_ref_fkey"
            columns: ["auth_secret_ref"]
            isOneToOne: false
            referencedRelation: "secret_ref"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "object_store_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant"
            referencedColumns: ["id"]
          },
        ]
      }
      observability_backend: {
        Row: {
          auth_secret_ref: string | null
          created_at: string
          default_labels: Json | null
          endpoint: string | null
          id: string
          kind: Database["public"]["Enums"]["observability_kind"]
          tenant_id: string
          type: Database["public"]["Enums"]["observability_type"]
          updated_at: string
        }
        Insert: {
          auth_secret_ref?: string | null
          created_at?: string
          default_labels?: Json | null
          endpoint?: string | null
          id?: string
          kind: Database["public"]["Enums"]["observability_kind"]
          tenant_id: string
          type: Database["public"]["Enums"]["observability_type"]
          updated_at?: string
        }
        Update: {
          auth_secret_ref?: string | null
          created_at?: string
          default_labels?: Json | null
          endpoint?: string | null
          id?: string
          kind?: Database["public"]["Enums"]["observability_kind"]
          tenant_id?: string
          type?: Database["public"]["Enums"]["observability_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "observability_backend_auth_secret_ref_fkey"
            columns: ["auth_secret_ref"]
            isOneToOne: false
            referencedRelation: "secret_ref"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "observability_backend_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant"
            referencedColumns: ["id"]
          },
        ]
      }
      observability_link: {
        Row: {
          backend_id: string
          created_at: string
          entity_id: string
          entity_type: string
          id: string
          query: Json | null
          tenant_id: string
          url: string | null
        }
        Insert: {
          backend_id: string
          created_at?: string
          entity_id: string
          entity_type: string
          id?: string
          query?: Json | null
          tenant_id: string
          url?: string | null
        }
        Update: {
          backend_id?: string
          created_at?: string
          entity_id?: string
          entity_type?: string
          id?: string
          query?: Json | null
          tenant_id?: string
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "observability_link_backend_id_fkey"
            columns: ["backend_id"]
            isOneToOne: false
            referencedRelation: "observability_backend"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "observability_link_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant"
            referencedColumns: ["id"]
          },
        ]
      }
      org: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "org_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant"
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
      permission: {
        Row: {
          category: Database["public"]["Enums"]["permission_category"]
          code: string
          description: string | null
        }
        Insert: {
          category: Database["public"]["Enums"]["permission_category"]
          code: string
          description?: string | null
        }
        Update: {
          category?: Database["public"]["Enums"]["permission_category"]
          code?: string
          description?: string | null
        }
        Relationships: []
      }
      pipeline_definition: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          project_id: string
          spec: Json | null
          tenant_id: string
          updated_at: string
          updated_by: string | null
          version: number | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          project_id: string
          spec?: Json | null
          tenant_id: string
          updated_at?: string
          updated_by?: string | null
          version?: number | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          project_id?: string
          spec?: Json | null
          tenant_id?: string
          updated_at?: string
          updated_by?: string | null
          version?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "pipeline_definition_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_account"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pipeline_definition_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "project"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pipeline_definition_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pipeline_definition_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "user_account"
            referencedColumns: ["id"]
          },
        ]
      }
      pipeline_edge: {
        Row: {
          condition_expr: string | null
          from_node_id: string
          id: string
          pipeline_definition_id: string
          tenant_id: string
          to_node_id: string
        }
        Insert: {
          condition_expr?: string | null
          from_node_id: string
          id?: string
          pipeline_definition_id: string
          tenant_id: string
          to_node_id: string
        }
        Update: {
          condition_expr?: string | null
          from_node_id?: string
          id?: string
          pipeline_definition_id?: string
          tenant_id?: string
          to_node_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pipeline_edge_from_node_id_fkey"
            columns: ["from_node_id"]
            isOneToOne: false
            referencedRelation: "pipeline_node"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pipeline_edge_pipeline_definition_id_fkey"
            columns: ["pipeline_definition_id"]
            isOneToOne: false
            referencedRelation: "pipeline_definition"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pipeline_edge_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pipeline_edge_to_node_id_fkey"
            columns: ["to_node_id"]
            isOneToOne: false
            referencedRelation: "pipeline_node"
            referencedColumns: ["id"]
          },
        ]
      }
      pipeline_node: {
        Row: {
          created_at: string
          id: string
          name: string
          node_key: string
          node_type: Database["public"]["Enums"]["pipeline_node_type"]
          pipeline_definition_id: string
          run_template: Json | null
          tenant_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          node_key: string
          node_type: Database["public"]["Enums"]["pipeline_node_type"]
          pipeline_definition_id: string
          run_template?: Json | null
          tenant_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          node_key?: string
          node_type?: Database["public"]["Enums"]["pipeline_node_type"]
          pipeline_definition_id?: string
          run_template?: Json | null
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pipeline_node_pipeline_definition_id_fkey"
            columns: ["pipeline_definition_id"]
            isOneToOne: false
            referencedRelation: "pipeline_definition"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pipeline_node_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant"
            referencedColumns: ["id"]
          },
        ]
      }
      pipeline_run: {
        Row: {
          created_at: string
          created_by: string | null
          ended_at: string | null
          id: string
          params: Json | null
          pipeline_definition_id: string
          project_id: string
          started_at: string | null
          status: Database["public"]["Enums"]["pipeline_status"]
          status_message: string | null
          tenant_id: string
          trigger: Database["public"]["Enums"]["pipeline_trigger"] | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          ended_at?: string | null
          id?: string
          params?: Json | null
          pipeline_definition_id: string
          project_id: string
          started_at?: string | null
          status?: Database["public"]["Enums"]["pipeline_status"]
          status_message?: string | null
          tenant_id: string
          trigger?: Database["public"]["Enums"]["pipeline_trigger"] | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          ended_at?: string | null
          id?: string
          params?: Json | null
          pipeline_definition_id?: string
          project_id?: string
          started_at?: string | null
          status?: Database["public"]["Enums"]["pipeline_status"]
          status_message?: string | null
          tenant_id?: string
          trigger?: Database["public"]["Enums"]["pipeline_trigger"] | null
        }
        Relationships: [
          {
            foreignKeyName: "pipeline_run_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_account"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pipeline_run_pipeline_definition_id_fkey"
            columns: ["pipeline_definition_id"]
            isOneToOne: false
            referencedRelation: "pipeline_definition"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pipeline_run_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "project"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pipeline_run_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant"
            referencedColumns: ["id"]
          },
        ]
      }
      pipeline_run_node: {
        Row: {
          attempts: number | null
          ended_at: string | null
          error_message: string | null
          id: string
          node_id: string
          pipeline_run_id: string
          run_id: string | null
          started_at: string | null
          status: Database["public"]["Enums"]["pipeline_status"]
          tenant_id: string
        }
        Insert: {
          attempts?: number | null
          ended_at?: string | null
          error_message?: string | null
          id?: string
          node_id: string
          pipeline_run_id: string
          run_id?: string | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["pipeline_status"]
          tenant_id: string
        }
        Update: {
          attempts?: number | null
          ended_at?: string | null
          error_message?: string | null
          id?: string
          node_id?: string
          pipeline_run_id?: string
          run_id?: string | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["pipeline_status"]
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pipeline_run_node_node_id_fkey"
            columns: ["node_id"]
            isOneToOne: false
            referencedRelation: "pipeline_node"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pipeline_run_node_pipeline_run_id_fkey"
            columns: ["pipeline_run_id"]
            isOneToOne: false
            referencedRelation: "pipeline_run"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pipeline_run_node_run_id_fkey"
            columns: ["run_id"]
            isOneToOne: false
            referencedRelation: "ml_run"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pipeline_run_node_run_id_fkey"
            columns: ["run_id"]
            isOneToOne: false
            referencedRelation: "run"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pipeline_run_node_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant"
            referencedColumns: ["id"]
          },
        ]
      }
      pipeline_schedule: {
        Row: {
          created_at: string
          cron: string | null
          default_params: Json | null
          enabled: boolean | null
          id: string
          name: string
          pipeline_definition_id: string
          project_id: string
          tenant_id: string
          timezone: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          cron?: string | null
          default_params?: Json | null
          enabled?: boolean | null
          id?: string
          name: string
          pipeline_definition_id: string
          project_id: string
          tenant_id: string
          timezone?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          cron?: string | null
          default_params?: Json | null
          enabled?: boolean | null
          id?: string
          name?: string
          pipeline_definition_id?: string
          project_id?: string
          tenant_id?: string
          timezone?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pipeline_schedule_pipeline_definition_id_fkey"
            columns: ["pipeline_definition_id"]
            isOneToOne: false
            referencedRelation: "pipeline_definition"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pipeline_schedule_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "project"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pipeline_schedule_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant"
            referencedColumns: ["id"]
          },
        ]
      }
      policy_assignment: {
        Row: {
          bundle_id: string
          created_at: string
          created_by: string | null
          enforcement_mode:
            | Database["public"]["Enums"]["policy_enforcement_mode"]
            | null
          id: string
          scope_id: string | null
          scope_type: string
          tenant_id: string
        }
        Insert: {
          bundle_id: string
          created_at?: string
          created_by?: string | null
          enforcement_mode?:
            | Database["public"]["Enums"]["policy_enforcement_mode"]
            | null
          id?: string
          scope_id?: string | null
          scope_type: string
          tenant_id: string
        }
        Update: {
          bundle_id?: string
          created_at?: string
          created_by?: string | null
          enforcement_mode?:
            | Database["public"]["Enums"]["policy_enforcement_mode"]
            | null
          id?: string
          scope_id?: string | null
          scope_type?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "policy_assignment_bundle_id_fkey"
            columns: ["bundle_id"]
            isOneToOne: false
            referencedRelation: "policy_bundle"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "policy_assignment_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_account"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "policy_assignment_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant"
            referencedColumns: ["id"]
          },
        ]
      }
      policy_bundle: {
        Row: {
          bundle_uri: string | null
          checksum: string | null
          created_at: string
          created_by: string | null
          id: string
          name: string
          source_ref: string | null
          source_repo: string | null
          status: Database["public"]["Enums"]["policy_bundle_status"] | null
          tenant_id: string
          version: string | null
        }
        Insert: {
          bundle_uri?: string | null
          checksum?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          name: string
          source_ref?: string | null
          source_repo?: string | null
          status?: Database["public"]["Enums"]["policy_bundle_status"] | null
          tenant_id: string
          version?: string | null
        }
        Update: {
          bundle_uri?: string | null
          checksum?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          name?: string
          source_ref?: string | null
          source_repo?: string | null
          status?: Database["public"]["Enums"]["policy_bundle_status"] | null
          tenant_id?: string
          version?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "policy_bundle_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_account"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "policy_bundle_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant"
            referencedColumns: ["id"]
          },
        ]
      }
      policy_decision_log: {
        Row: {
          allow: boolean | null
          bundle_id: string
          decision_point: string
          entity_id: string | null
          entity_type: string | null
          evaluated_at: string | null
          id: string
          input_hash: string | null
          reason: string | null
          result: Json | null
          tenant_id: string
        }
        Insert: {
          allow?: boolean | null
          bundle_id: string
          decision_point: string
          entity_id?: string | null
          entity_type?: string | null
          evaluated_at?: string | null
          id?: string
          input_hash?: string | null
          reason?: string | null
          result?: Json | null
          tenant_id: string
        }
        Update: {
          allow?: boolean | null
          bundle_id?: string
          decision_point?: string
          entity_id?: string | null
          entity_type?: string | null
          evaluated_at?: string | null
          id?: string
          input_hash?: string | null
          reason?: string | null
          result?: Json | null
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "policy_decision_log_bundle_id_fkey"
            columns: ["bundle_id"]
            isOneToOne: false
            referencedRelation: "policy_bundle"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "policy_decision_log_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant"
            referencedColumns: ["id"]
          },
        ]
      }
      principal_role_binding: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          principal_id: string
          principal_type: Database["public"]["Enums"]["principal_type"]
          role_id: string
          scope_id: string | null
          scope_type: Database["public"]["Enums"]["scope_type"]
          tenant_id: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          principal_id: string
          principal_type: Database["public"]["Enums"]["principal_type"]
          role_id: string
          scope_id?: string | null
          scope_type: Database["public"]["Enums"]["scope_type"]
          tenant_id: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          principal_id?: string
          principal_type?: Database["public"]["Enums"]["principal_type"]
          role_id?: string
          scope_id?: string | null
          scope_type?: Database["public"]["Enums"]["scope_type"]
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "principal_role_binding_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_account"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "principal_role_binding_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "role"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "principal_role_binding_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant"
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
      project: {
        Row: {
          archived_at: string | null
          created_at: string
          created_by: string | null
          criticality: Database["public"]["Enums"]["criticality"] | null
          default_k8s_namespace: string | null
          description: string | null
          id: string
          key: string
          lifecycle_status: Database["public"]["Enums"]["project_lifecycle"]
          metadata: Json | null
          name: string
          org_id: string | null
          tags: Json | null
          tenant_id: string
          updated_at: string
          updated_by: string | null
          visibility: Database["public"]["Enums"]["project_visibility"]
        }
        Insert: {
          archived_at?: string | null
          created_at?: string
          created_by?: string | null
          criticality?: Database["public"]["Enums"]["criticality"] | null
          default_k8s_namespace?: string | null
          description?: string | null
          id?: string
          key: string
          lifecycle_status?: Database["public"]["Enums"]["project_lifecycle"]
          metadata?: Json | null
          name: string
          org_id?: string | null
          tags?: Json | null
          tenant_id: string
          updated_at?: string
          updated_by?: string | null
          visibility?: Database["public"]["Enums"]["project_visibility"]
        }
        Update: {
          archived_at?: string | null
          created_at?: string
          created_by?: string | null
          criticality?: Database["public"]["Enums"]["criticality"] | null
          default_k8s_namespace?: string | null
          description?: string | null
          id?: string
          key?: string
          lifecycle_status?: Database["public"]["Enums"]["project_lifecycle"]
          metadata?: Json | null
          name?: string
          org_id?: string | null
          tags?: Json | null
          tenant_id?: string
          updated_at?: string
          updated_by?: string | null
          visibility?: Database["public"]["Enums"]["project_visibility"]
        }
        Relationships: [
          {
            foreignKeyName: "project_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "org"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant"
            referencedColumns: ["id"]
          },
        ]
      }
      project_progress_snapshot: {
        Row: {
          blockers: string | null
          created_at: string
          created_by: string | null
          date_key: string
          id: string
          kpis: Json | null
          next_steps: string | null
          progress_percent: number | null
          project_id: string
          risks: string | null
          status: Database["public"]["Enums"]["progress_status"]
          summary: string | null
          tenant_id: string
        }
        Insert: {
          blockers?: string | null
          created_at?: string
          created_by?: string | null
          date_key: string
          id?: string
          kpis?: Json | null
          next_steps?: string | null
          progress_percent?: number | null
          project_id: string
          risks?: string | null
          status?: Database["public"]["Enums"]["progress_status"]
          summary?: string | null
          tenant_id: string
        }
        Update: {
          blockers?: string | null
          created_at?: string
          created_by?: string | null
          date_key?: string
          id?: string
          kpis?: Json | null
          next_steps?: string | null
          progress_percent?: number | null
          project_id?: string
          risks?: string | null
          status?: Database["public"]["Enums"]["progress_status"]
          summary?: string | null
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_progress_snapshot_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "project"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_progress_snapshot_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant"
            referencedColumns: ["id"]
          },
        ]
      }
      quota_policy: {
        Row: {
          created_at: string
          enforced: boolean
          id: string
          limits: Json
          name: string
          scope_id: string | null
          scope_type: Database["public"]["Enums"]["scope_type"]
          tenant_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          enforced?: boolean
          id?: string
          limits?: Json
          name: string
          scope_id?: string | null
          scope_type?: Database["public"]["Enums"]["scope_type"]
          tenant_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          enforced?: boolean
          id?: string
          limits?: Json
          name?: string
          scope_id?: string | null
          scope_type?: Database["public"]["Enums"]["scope_type"]
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "quota_policy_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant"
            referencedColumns: ["id"]
          },
        ]
      }
      release: {
        Row: {
          changelog: string | null
          commit_sha: string | null
          created_at: string
          created_by: string | null
          git_ref: string | null
          id: string
          name: string
          project_id: string
          tenant_id: string
          version: string | null
        }
        Insert: {
          changelog?: string | null
          commit_sha?: string | null
          created_at?: string
          created_by?: string | null
          git_ref?: string | null
          id?: string
          name: string
          project_id: string
          tenant_id: string
          version?: string | null
        }
        Update: {
          changelog?: string | null
          commit_sha?: string | null
          created_at?: string
          created_by?: string | null
          git_ref?: string | null
          id?: string
          name?: string
          project_id?: string
          tenant_id?: string
          version?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "release_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_account"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "release_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "project"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "release_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant"
            referencedColumns: ["id"]
          },
        ]
      }
      release_link: {
        Row: {
          argocd_application_id: string | null
          cicd_pipeline_id: string | null
          created_at: string
          id: string
          model_deployment_id: string | null
          release_id: string
          tenant_id: string
        }
        Insert: {
          argocd_application_id?: string | null
          cicd_pipeline_id?: string | null
          created_at?: string
          id?: string
          model_deployment_id?: string | null
          release_id: string
          tenant_id: string
        }
        Update: {
          argocd_application_id?: string | null
          cicd_pipeline_id?: string | null
          created_at?: string
          id?: string
          model_deployment_id?: string | null
          release_id?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "release_link_argocd_application_id_fkey"
            columns: ["argocd_application_id"]
            isOneToOne: false
            referencedRelation: "argocd_application"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "release_link_cicd_pipeline_id_fkey"
            columns: ["cicd_pipeline_id"]
            isOneToOne: false
            referencedRelation: "cicd_pipeline"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "release_link_model_deployment_id_fkey"
            columns: ["model_deployment_id"]
            isOneToOne: false
            referencedRelation: "model_deployment"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "release_link_release_id_fkey"
            columns: ["release_id"]
            isOneToOne: false
            referencedRelation: "release"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "release_link_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant"
            referencedColumns: ["id"]
          },
        ]
      }
      repo_binding: {
        Row: {
          created_at: string
          default_branch: string | null
          id: string
          project_id: string
          provider_id: string
          repo_full_name: string
          tenant_id: string
          updated_at: string
          webhook_secret_ref: string | null
        }
        Insert: {
          created_at?: string
          default_branch?: string | null
          id?: string
          project_id: string
          provider_id: string
          repo_full_name: string
          tenant_id: string
          updated_at?: string
          webhook_secret_ref?: string | null
        }
        Update: {
          created_at?: string
          default_branch?: string | null
          id?: string
          project_id?: string
          provider_id?: string
          repo_full_name?: string
          tenant_id?: string
          updated_at?: string
          webhook_secret_ref?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "repo_binding_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "project"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "repo_binding_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "git_provider"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "repo_binding_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "repo_binding_webhook_secret_ref_fkey"
            columns: ["webhook_secret_ref"]
            isOneToOne: false
            referencedRelation: "secret_ref"
            referencedColumns: ["id"]
          },
        ]
      }
      resource_relation: {
        Row: {
          from_resource_id: string
          id: string
          relation: Database["public"]["Enums"]["resource_relation_type"]
          tenant_id: string
          to_resource_id: string
        }
        Insert: {
          from_resource_id: string
          id?: string
          relation: Database["public"]["Enums"]["resource_relation_type"]
          tenant_id: string
          to_resource_id: string
        }
        Update: {
          from_resource_id?: string
          id?: string
          relation?: Database["public"]["Enums"]["resource_relation_type"]
          tenant_id?: string
          to_resource_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "resource_relation_from_resource_id_fkey"
            columns: ["from_resource_id"]
            isOneToOne: false
            referencedRelation: "managed_resource"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "resource_relation_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "resource_relation_to_resource_id_fkey"
            columns: ["to_resource_id"]
            isOneToOne: false
            referencedRelation: "managed_resource"
            referencedColumns: ["id"]
          },
        ]
      }
      risk_assessment: {
        Row: {
          ai_system_id: string
          assessed_at: string | null
          assessor_user_id: string | null
          decision: string | null
          hazards: Json | null
          id: string
          methodology: string | null
          mitigations: Json | null
          next_review_at: string | null
          residual_risk: string | null
          tenant_id: string
        }
        Insert: {
          ai_system_id: string
          assessed_at?: string | null
          assessor_user_id?: string | null
          decision?: string | null
          hazards?: Json | null
          id?: string
          methodology?: string | null
          mitigations?: Json | null
          next_review_at?: string | null
          residual_risk?: string | null
          tenant_id: string
        }
        Update: {
          ai_system_id?: string
          assessed_at?: string | null
          assessor_user_id?: string | null
          decision?: string | null
          hazards?: Json | null
          id?: string
          methodology?: string | null
          mitigations?: Json | null
          next_review_at?: string | null
          residual_risk?: string | null
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "risk_assessment_ai_system_id_fkey"
            columns: ["ai_system_id"]
            isOneToOne: false
            referencedRelation: "ai_system"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "risk_assessment_assessor_user_id_fkey"
            columns: ["assessor_user_id"]
            isOneToOne: false
            referencedRelation: "user_account"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "risk_assessment_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant"
            referencedColumns: ["id"]
          },
        ]
      }
      role: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_system: boolean
          name: string
          scope: Database["public"]["Enums"]["scope_type"]
          tenant_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_system?: boolean
          name: string
          scope?: Database["public"]["Enums"]["scope_type"]
          tenant_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_system?: boolean
          name?: string
          scope?: Database["public"]["Enums"]["scope_type"]
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "role_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant"
            referencedColumns: ["id"]
          },
        ]
      }
      role_permission: {
        Row: {
          permission_code: string
          role_id: string
          tenant_id: string
        }
        Insert: {
          permission_code: string
          role_id: string
          tenant_id: string
        }
        Update: {
          permission_code?: string
          role_id?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "role_permission_permission_code_fkey"
            columns: ["permission_code"]
            isOneToOne: false
            referencedRelation: "permission"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "role_permission_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "role"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "role_permission_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant"
            referencedColumns: ["id"]
          },
        ]
      }
      run: {
        Row: {
          artifacts_root_uri: string | null
          cluster_id: string | null
          compute_profile_id: string | null
          created_at: string
          created_by: string | null
          duration_ms: number | null
          ended_at: string | null
          environment_build_id: string | null
          experiment_id: string | null
          id: string
          k8s_workload_ref: Json | null
          logs_uri: string | null
          metrics_summary: Json | null
          namespace: string | null
          params: Json | null
          parent_run_id: string | null
          project_id: string
          started_at: string | null
          status: Database["public"]["Enums"]["run_status"]
          status_message: string | null
          tenant_id: string
          trigger: Database["public"]["Enums"]["run_trigger"] | null
          type: Database["public"]["Enums"]["run_type"]
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          artifacts_root_uri?: string | null
          cluster_id?: string | null
          compute_profile_id?: string | null
          created_at?: string
          created_by?: string | null
          duration_ms?: number | null
          ended_at?: string | null
          environment_build_id?: string | null
          experiment_id?: string | null
          id?: string
          k8s_workload_ref?: Json | null
          logs_uri?: string | null
          metrics_summary?: Json | null
          namespace?: string | null
          params?: Json | null
          parent_run_id?: string | null
          project_id: string
          started_at?: string | null
          status?: Database["public"]["Enums"]["run_status"]
          status_message?: string | null
          tenant_id: string
          trigger?: Database["public"]["Enums"]["run_trigger"] | null
          type?: Database["public"]["Enums"]["run_type"]
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          artifacts_root_uri?: string | null
          cluster_id?: string | null
          compute_profile_id?: string | null
          created_at?: string
          created_by?: string | null
          duration_ms?: number | null
          ended_at?: string | null
          environment_build_id?: string | null
          experiment_id?: string | null
          id?: string
          k8s_workload_ref?: Json | null
          logs_uri?: string | null
          metrics_summary?: Json | null
          namespace?: string | null
          params?: Json | null
          parent_run_id?: string | null
          project_id?: string
          started_at?: string | null
          status?: Database["public"]["Enums"]["run_status"]
          status_message?: string | null
          tenant_id?: string
          trigger?: Database["public"]["Enums"]["run_trigger"] | null
          type?: Database["public"]["Enums"]["run_type"]
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "run_cluster_id_fkey"
            columns: ["cluster_id"]
            isOneToOne: false
            referencedRelation: "k8s_cluster"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "run_compute_profile_id_fkey"
            columns: ["compute_profile_id"]
            isOneToOne: false
            referencedRelation: "compute_profile"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "run_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_account"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "run_environment_build_id_fkey"
            columns: ["environment_build_id"]
            isOneToOne: false
            referencedRelation: "environment_build"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "run_experiment_id_fkey"
            columns: ["experiment_id"]
            isOneToOne: false
            referencedRelation: "experiment"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "run_parent_run_id_fkey"
            columns: ["parent_run_id"]
            isOneToOne: false
            referencedRelation: "ml_run"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "run_parent_run_id_fkey"
            columns: ["parent_run_id"]
            isOneToOne: false
            referencedRelation: "run"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "run_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "project"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "run_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "run_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "user_account"
            referencedColumns: ["id"]
          },
        ]
      }
      run_metric: {
        Row: {
          id: string
          logged_at: string | null
          name: string
          run_id: string
          step: number | null
          tenant_id: string
          unit: string | null
          value: number | null
        }
        Insert: {
          id?: string
          logged_at?: string | null
          name: string
          run_id: string
          step?: number | null
          tenant_id: string
          unit?: string | null
          value?: number | null
        }
        Update: {
          id?: string
          logged_at?: string | null
          name?: string
          run_id?: string
          step?: number | null
          tenant_id?: string
          unit?: string | null
          value?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "run_metric_run_id_fkey"
            columns: ["run_id"]
            isOneToOne: false
            referencedRelation: "ml_run"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "run_metric_run_id_fkey"
            columns: ["run_id"]
            isOneToOne: false
            referencedRelation: "run"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "run_metric_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant"
            referencedColumns: ["id"]
          },
        ]
      }
      run_param: {
        Row: {
          created_at: string
          id: string
          key: string
          run_id: string
          tenant_id: string
          value: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          key: string
          run_id: string
          tenant_id: string
          value?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          key?: string
          run_id?: string
          tenant_id?: string
          value?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "run_param_run_id_fkey"
            columns: ["run_id"]
            isOneToOne: false
            referencedRelation: "ml_run"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "run_param_run_id_fkey"
            columns: ["run_id"]
            isOneToOne: false
            referencedRelation: "run"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "run_param_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant"
            referencedColumns: ["id"]
          },
        ]
      }
      runtime_policy: {
        Row: {
          allowed_images: Json | null
          allowed_registries: Json | null
          created_at: string
          egress_rules: Json | null
          env_var_allowlist: Json | null
          id: string
          ingress_rules: Json | null
          name: string
          pod_security_profile: string | null
          secret_mount_policy: Json | null
          tenant_id: string
          updated_at: string
        }
        Insert: {
          allowed_images?: Json | null
          allowed_registries?: Json | null
          created_at?: string
          egress_rules?: Json | null
          env_var_allowlist?: Json | null
          id?: string
          ingress_rules?: Json | null
          name: string
          pod_security_profile?: string | null
          secret_mount_policy?: Json | null
          tenant_id: string
          updated_at?: string
        }
        Update: {
          allowed_images?: Json | null
          allowed_registries?: Json | null
          created_at?: string
          egress_rules?: Json | null
          env_var_allowlist?: Json | null
          id?: string
          ingress_rules?: Json | null
          name?: string
          pod_security_profile?: string | null
          secret_mount_policy?: Json | null
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "runtime_policy_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant"
            referencedColumns: ["id"]
          },
        ]
      }
      secret_ref: {
        Row: {
          backend: Database["public"]["Enums"]["secret_backend"]
          created_at: string
          id: string
          purpose: Database["public"]["Enums"]["secret_purpose"]
          ref: string
          rotation_hint: string | null
          tenant_id: string
          updated_at: string
        }
        Insert: {
          backend: Database["public"]["Enums"]["secret_backend"]
          created_at?: string
          id?: string
          purpose: Database["public"]["Enums"]["secret_purpose"]
          ref: string
          rotation_hint?: string | null
          tenant_id: string
          updated_at?: string
        }
        Update: {
          backend?: Database["public"]["Enums"]["secret_backend"]
          created_at?: string
          id?: string
          purpose?: Database["public"]["Enums"]["secret_purpose"]
          ref?: string
          rotation_hint?: string | null
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "secret_ref_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant"
            referencedColumns: ["id"]
          },
        ]
      }
      service_account: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          name: string
          status: Database["public"]["Enums"]["user_status"]
          tenant_id: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          name: string
          status?: Database["public"]["Enums"]["user_status"]
          tenant_id: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          name?: string
          status?: Database["public"]["Enums"]["user_status"]
          tenant_id?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "service_account_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_account"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_account_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_account_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "user_account"
            referencedColumns: ["id"]
          },
        ]
      }
      service_account_token: {
        Row: {
          created_at: string
          expires_at: string | null
          id: string
          last_used_at: string | null
          revoked_at: string | null
          scopes: Json | null
          service_account_id: string
          tenant_id: string
          token_hash: string
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          id?: string
          last_used_at?: string | null
          revoked_at?: string | null
          scopes?: Json | null
          service_account_id: string
          tenant_id: string
          token_hash: string
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          id?: string
          last_used_at?: string | null
          revoked_at?: string | null
          scopes?: Json | null
          service_account_id?: string
          tenant_id?: string
          token_hash?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_account_token_service_account_id_fkey"
            columns: ["service_account_id"]
            isOneToOne: false
            referencedRelation: "service_account"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_account_token_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant"
            referencedColumns: ["id"]
          },
        ]
      }
      sla_policy: {
        Row: {
          created_at: string
          id: string
          name: string
          scope_id: string | null
          scope_type: string
          targets: Json | null
          tenant_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          scope_id?: string | null
          scope_type: string
          targets?: Json | null
          tenant_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          scope_id?: string | null
          scope_type?: string
          targets?: Json | null
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sla_policy_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant"
            referencedColumns: ["id"]
          },
        ]
      }
      template_instance: {
        Row: {
          catalog_item_id: string
          created_at: string
          created_by: string | null
          id: string
          name: string
          params: Json | null
          project_id: string
          status: Database["public"]["Enums"]["template_instance_status"] | null
          tenant_id: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          catalog_item_id: string
          created_at?: string
          created_by?: string | null
          id?: string
          name: string
          params?: Json | null
          project_id: string
          status?:
            | Database["public"]["Enums"]["template_instance_status"]
            | null
          tenant_id: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          catalog_item_id?: string
          created_at?: string
          created_by?: string | null
          id?: string
          name?: string
          params?: Json | null
          project_id?: string
          status?:
            | Database["public"]["Enums"]["template_instance_status"]
            | null
          tenant_id?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "template_instance_catalog_item_id_fkey"
            columns: ["catalog_item_id"]
            isOneToOne: false
            referencedRelation: "catalog_item"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "template_instance_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_account"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "template_instance_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "project"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "template_instance_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "template_instance_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "user_account"
            referencedColumns: ["id"]
          },
        ]
      }
      tenant: {
        Row: {
          created_at: string
          id: string
          locale: string | null
          name: string
          slug: string
          status: Database["public"]["Enums"]["tenant_status"]
          tier: Database["public"]["Enums"]["tenant_tier"]
          timezone: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          locale?: string | null
          name: string
          slug: string
          status?: Database["public"]["Enums"]["tenant_status"]
          tier?: Database["public"]["Enums"]["tenant_tier"]
          timezone?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          locale?: string | null
          name?: string
          slug?: string
          status?: Database["public"]["Enums"]["tenant_status"]
          tier?: Database["public"]["Enums"]["tenant_tier"]
          timezone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      user_account: {
        Row: {
          created_at: string
          display_name: string | null
          email: string
          external_subject: string | null
          id: string
          last_login_at: string | null
          mfa_enabled: boolean
          status: Database["public"]["Enums"]["user_status"]
          tenant_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          email: string
          external_subject?: string | null
          id?: string
          last_login_at?: string | null
          mfa_enabled?: boolean
          status?: Database["public"]["Enums"]["user_status"]
          tenant_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          email?: string
          external_subject?: string | null
          id?: string
          last_login_at?: string | null
          mfa_enabled?: boolean
          status?: Database["public"]["Enums"]["user_status"]
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_account_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          assigned_at: string
          assigned_by: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          assigned_at?: string
          assigned_by?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          assigned_at?: string
          assigned_by?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      webhook_config: {
        Row: {
          created_at: string
          enabled: boolean
          events: string[]
          headers: Json | null
          id: string
          last_response_code: number | null
          last_triggered_at: string | null
          name: string
          retry_count: number
          retry_delay_seconds: number
          secret: string | null
          tenant_id: string
          updated_at: string
          url: string
          user_id: string
        }
        Insert: {
          created_at?: string
          enabled?: boolean
          events?: string[]
          headers?: Json | null
          id?: string
          last_response_code?: number | null
          last_triggered_at?: string | null
          name: string
          retry_count?: number
          retry_delay_seconds?: number
          secret?: string | null
          tenant_id: string
          updated_at?: string
          url: string
          user_id: string
        }
        Update: {
          created_at?: string
          enabled?: boolean
          events?: string[]
          headers?: Json | null
          id?: string
          last_response_code?: number | null
          last_triggered_at?: string | null
          name?: string
          retry_count?: number
          retry_delay_seconds?: number
          secret?: string | null
          tenant_id?: string
          updated_at?: string
          url?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "webhook_config_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant"
            referencedColumns: ["id"]
          },
        ]
      }
      webhook_delivery: {
        Row: {
          attempts: number | null
          created_at: string
          event_type: string
          id: string
          last_error: string | null
          payload: Json | null
          sent_at: string | null
          status: Database["public"]["Enums"]["webhook_delivery_status"] | null
          subscription_id: string
          tenant_id: string
          webhook_id: string | null
        }
        Insert: {
          attempts?: number | null
          created_at?: string
          event_type: string
          id?: string
          last_error?: string | null
          payload?: Json | null
          sent_at?: string | null
          status?: Database["public"]["Enums"]["webhook_delivery_status"] | null
          subscription_id: string
          tenant_id: string
          webhook_id?: string | null
        }
        Update: {
          attempts?: number | null
          created_at?: string
          event_type?: string
          id?: string
          last_error?: string | null
          payload?: Json | null
          sent_at?: string | null
          status?: Database["public"]["Enums"]["webhook_delivery_status"] | null
          subscription_id?: string
          tenant_id?: string
          webhook_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "webhook_delivery_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "webhook_subscription"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "webhook_delivery_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "webhook_delivery_webhook_id_fkey"
            columns: ["webhook_id"]
            isOneToOne: false
            referencedRelation: "webhook_config"
            referencedColumns: ["id"]
          },
        ]
      }
      webhook_subscription: {
        Row: {
          created_at: string
          enabled: boolean | null
          endpoint_id: string
          event_types: Json | null
          filter: Json | null
          id: string
          project_id: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          enabled?: boolean | null
          endpoint_id: string
          event_types?: Json | null
          filter?: Json | null
          id?: string
          project_id: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          enabled?: boolean | null
          endpoint_id?: string
          event_types?: Json | null
          filter?: Json | null
          id?: string
          project_id?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "webhook_subscription_endpoint_id_fkey"
            columns: ["endpoint_id"]
            isOneToOne: false
            referencedRelation: "integration_endpoint"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "webhook_subscription_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "project"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "webhook_subscription_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant"
            referencedColumns: ["id"]
          },
        ]
      }
      work_item: {
        Row: {
          assignee_user_id: string | null
          board_id: string | null
          closed_at: string | null
          column_id: string | null
          created_at: string
          created_by: string | null
          description: string | null
          due_date: string | null
          estimate_points: number | null
          external_refs: Json | null
          id: string
          labels: Json | null
          priority: Database["public"]["Enums"]["priority"] | null
          progress_percent: number | null
          project_id: string
          reporter_user_id: string | null
          severity: Database["public"]["Enums"]["severity"] | null
          status: Database["public"]["Enums"]["work_item_status"]
          tenant_id: string
          title: string
          type: Database["public"]["Enums"]["work_item_type"]
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          assignee_user_id?: string | null
          board_id?: string | null
          closed_at?: string | null
          column_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          estimate_points?: number | null
          external_refs?: Json | null
          id?: string
          labels?: Json | null
          priority?: Database["public"]["Enums"]["priority"] | null
          progress_percent?: number | null
          project_id: string
          reporter_user_id?: string | null
          severity?: Database["public"]["Enums"]["severity"] | null
          status?: Database["public"]["Enums"]["work_item_status"]
          tenant_id: string
          title: string
          type?: Database["public"]["Enums"]["work_item_type"]
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          assignee_user_id?: string | null
          board_id?: string | null
          closed_at?: string | null
          column_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          estimate_points?: number | null
          external_refs?: Json | null
          id?: string
          labels?: Json | null
          priority?: Database["public"]["Enums"]["priority"] | null
          progress_percent?: number | null
          project_id?: string
          reporter_user_id?: string | null
          severity?: Database["public"]["Enums"]["severity"] | null
          status?: Database["public"]["Enums"]["work_item_status"]
          tenant_id?: string
          title?: string
          type?: Database["public"]["Enums"]["work_item_type"]
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "work_item_board_id_fkey"
            columns: ["board_id"]
            isOneToOne: false
            referencedRelation: "kanban_board"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "work_item_column_id_fkey"
            columns: ["column_id"]
            isOneToOne: false
            referencedRelation: "kanban_column"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "work_item_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "project"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "work_item_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant"
            referencedColumns: ["id"]
          },
        ]
      }
      workspace: {
        Row: {
          auto_shutdown_minutes: number | null
          cluster_id: string
          compute_profile_id: string | null
          created_at: string
          description: string | null
          endpoint_url: string | null
          environment_id: string | null
          environment_vars: Json | null
          git_branch: string | null
          git_repo_url: string | null
          id: string
          idle_timeout_minutes: number | null
          image: string
          image_version: string | null
          internal_url: string | null
          last_activity_at: string | null
          metadata: Json | null
          name: string
          namespace: string | null
          pod_name: string | null
          ports: Json | null
          project_id: string
          resources_allocated: Json | null
          resources_used: Json | null
          size: string | null
          started_at: string | null
          status: string
          stopped_at: string | null
          tenant_id: string
          updated_at: string
          user_id: string
          volumes: Json | null
          workspace_type: string
        }
        Insert: {
          auto_shutdown_minutes?: number | null
          cluster_id: string
          compute_profile_id?: string | null
          created_at?: string
          description?: string | null
          endpoint_url?: string | null
          environment_id?: string | null
          environment_vars?: Json | null
          git_branch?: string | null
          git_repo_url?: string | null
          id?: string
          idle_timeout_minutes?: number | null
          image: string
          image_version?: string | null
          internal_url?: string | null
          last_activity_at?: string | null
          metadata?: Json | null
          name: string
          namespace?: string | null
          pod_name?: string | null
          ports?: Json | null
          project_id: string
          resources_allocated?: Json | null
          resources_used?: Json | null
          size?: string | null
          started_at?: string | null
          status?: string
          stopped_at?: string | null
          tenant_id: string
          updated_at?: string
          user_id: string
          volumes?: Json | null
          workspace_type?: string
        }
        Update: {
          auto_shutdown_minutes?: number | null
          cluster_id?: string
          compute_profile_id?: string | null
          created_at?: string
          description?: string | null
          endpoint_url?: string | null
          environment_id?: string | null
          environment_vars?: Json | null
          git_branch?: string | null
          git_repo_url?: string | null
          id?: string
          idle_timeout_minutes?: number | null
          image?: string
          image_version?: string | null
          internal_url?: string | null
          last_activity_at?: string | null
          metadata?: Json | null
          name?: string
          namespace?: string | null
          pod_name?: string | null
          ports?: Json | null
          project_id?: string
          resources_allocated?: Json | null
          resources_used?: Json | null
          size?: string | null
          started_at?: string | null
          status?: string
          stopped_at?: string | null
          tenant_id?: string
          updated_at?: string
          user_id?: string
          volumes?: Json | null
          workspace_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "workspace_cluster_id_fkey"
            columns: ["cluster_id"]
            isOneToOne: false
            referencedRelation: "k8s_cluster"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workspace_compute_profile_id_fkey"
            columns: ["compute_profile_id"]
            isOneToOne: false
            referencedRelation: "compute_profile"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workspace_environment_id_fkey"
            columns: ["environment_id"]
            isOneToOne: false
            referencedRelation: "environment"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workspace_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "project"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workspace_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workspace_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_account"
            referencedColumns: ["id"]
          },
        ]
      }
      workspace_session: {
        Row: {
          cluster_id: string | null
          created_at: string
          ended_at: string | null
          environment_build_id: string | null
          id: string
          ide: Database["public"]["Enums"]["workspace_ide"] | null
          k8s_pod_ref: Json | null
          namespace: string | null
          project_id: string
          started_at: string | null
          status: Database["public"]["Enums"]["workspace_session_status"]
          tenant_id: string
          url: string | null
          user_id: string
        }
        Insert: {
          cluster_id?: string | null
          created_at?: string
          ended_at?: string | null
          environment_build_id?: string | null
          id?: string
          ide?: Database["public"]["Enums"]["workspace_ide"] | null
          k8s_pod_ref?: Json | null
          namespace?: string | null
          project_id: string
          started_at?: string | null
          status?: Database["public"]["Enums"]["workspace_session_status"]
          tenant_id: string
          url?: string | null
          user_id: string
        }
        Update: {
          cluster_id?: string | null
          created_at?: string
          ended_at?: string | null
          environment_build_id?: string | null
          id?: string
          ide?: Database["public"]["Enums"]["workspace_ide"] | null
          k8s_pod_ref?: Json | null
          namespace?: string | null
          project_id?: string
          started_at?: string | null
          status?: Database["public"]["Enums"]["workspace_session_status"]
          tenant_id?: string
          url?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workspace_session_cluster_id_fkey"
            columns: ["cluster_id"]
            isOneToOne: false
            referencedRelation: "k8s_cluster"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workspace_session_environment_build_id_fkey"
            columns: ["environment_build_id"]
            isOneToOne: false
            referencedRelation: "environment_build"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workspace_session_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "project"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workspace_session_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workspace_session_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_account"
            referencedColumns: ["id"]
          },
        ]
      }
      workspace_session_log: {
        Row: {
          ended_at: string | null
          id: string
          ip_address: unknown
          last_heartbeat_at: string | null
          metadata: Json | null
          session_type: string | null
          started_at: string
          status: string | null
          token: string | null
          user_agent: string | null
          user_id: string
          workspace_id: string
        }
        Insert: {
          ended_at?: string | null
          id?: string
          ip_address?: unknown
          last_heartbeat_at?: string | null
          metadata?: Json | null
          session_type?: string | null
          started_at?: string
          status?: string | null
          token?: string | null
          user_agent?: string | null
          user_id: string
          workspace_id: string
        }
        Update: {
          ended_at?: string | null
          id?: string
          ip_address?: unknown
          last_heartbeat_at?: string | null
          metadata?: Json | null
          session_type?: string | null
          started_at?: string
          status?: string | null
          token?: string | null
          user_agent?: string | null
          user_id?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workspace_session_log_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_account"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workspace_session_log_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "ml_workspace"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workspace_session_log_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspace"
            referencedColumns: ["id"]
          },
        ]
      }
      workspace_template: {
        Row: {
          created_at: string
          default_compute_profile_id: string | null
          default_environment_vars: Json | null
          default_ports: Json | null
          default_size: string | null
          default_volumes: Json | null
          description: string | null
          id: string
          image: string
          image_version: string | null
          is_default: boolean
          is_public: boolean
          metadata: Json | null
          name: string
          tags: Json | null
          tenant_id: string
          updated_at: string
          workspace_type: string
        }
        Insert: {
          created_at?: string
          default_compute_profile_id?: string | null
          default_environment_vars?: Json | null
          default_ports?: Json | null
          default_size?: string | null
          default_volumes?: Json | null
          description?: string | null
          id?: string
          image: string
          image_version?: string | null
          is_default?: boolean
          is_public?: boolean
          metadata?: Json | null
          name: string
          tags?: Json | null
          tenant_id: string
          updated_at?: string
          workspace_type?: string
        }
        Update: {
          created_at?: string
          default_compute_profile_id?: string | null
          default_environment_vars?: Json | null
          default_ports?: Json | null
          default_size?: string | null
          default_volumes?: Json | null
          description?: string | null
          id?: string
          image?: string
          image_version?: string | null
          is_default?: boolean
          is_public?: boolean
          metadata?: Json | null
          name?: string
          tags?: Json | null
          tenant_id?: string
          updated_at?: string
          workspace_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "workspace_template_default_compute_profile_id_fkey"
            columns: ["default_compute_profile_id"]
            isOneToOne: false
            referencedRelation: "compute_profile"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workspace_template_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      ml_artifact: {
        Row: {
          artifact_type: string | null
          checksum: string | null
          checksum_algorithm: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          experiment_id: string | null
          id: string | null
          is_directory: boolean | null
          metadata: Json | null
          mime_type: string | null
          model_version_id: string | null
          name: string | null
          parent_id: string | null
          path: string | null
          run_id: string | null
          size_bytes: number | null
          storage_type: string | null
          storage_uri: string | null
          tags: string[] | null
          tenant_id: string | null
          updated_at: string | null
        }
        Insert: {
          artifact_type?: never
          checksum?: string | null
          checksum_algorithm?: never
          created_at?: string | null
          created_by?: string | null
          description?: never
          experiment_id?: never
          id?: string | null
          is_directory?: never
          metadata?: Json | null
          mime_type?: string | null
          model_version_id?: never
          name?: string | null
          parent_id?: never
          path?: string | null
          run_id?: string | null
          size_bytes?: number | null
          storage_type?: never
          storage_uri?: string | null
          tags?: never
          tenant_id?: string | null
          updated_at?: string | null
        }
        Update: {
          artifact_type?: never
          checksum?: string | null
          checksum_algorithm?: never
          created_at?: string | null
          created_by?: string | null
          description?: never
          experiment_id?: never
          id?: string | null
          is_directory?: never
          metadata?: Json | null
          mime_type?: string | null
          model_version_id?: never
          name?: string | null
          parent_id?: never
          path?: string | null
          run_id?: string | null
          size_bytes?: number | null
          storage_type?: never
          storage_uri?: string | null
          tags?: never
          tenant_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "artifact_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_account"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "artifact_run_id_fkey"
            columns: ["run_id"]
            isOneToOne: false
            referencedRelation: "ml_run"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "artifact_run_id_fkey"
            columns: ["run_id"]
            isOneToOne: false
            referencedRelation: "run"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "artifact_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant"
            referencedColumns: ["id"]
          },
        ]
      }
      ml_metric_alert: {
        Row: {
          acknowledged: boolean | null
          acknowledged_at: string | null
          acknowledged_by: string | null
          alert_type: string | null
          created_at: string | null
          current_value: number | null
          id: string | null
          message: string | null
          metric_key: string | null
          run_id: string | null
          tenant_id: string | null
          threshold_value: number | null
        }
        Insert: {
          acknowledged?: boolean | null
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          alert_type?: string | null
          created_at?: string | null
          current_value?: number | null
          id?: string | null
          message?: string | null
          metric_key?: string | null
          run_id?: string | null
          tenant_id?: string | null
          threshold_value?: number | null
        }
        Update: {
          acknowledged?: boolean | null
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          alert_type?: string | null
          created_at?: string | null
          current_value?: number | null
          id?: string | null
          message?: string | null
          metric_key?: string | null
          run_id?: string | null
          tenant_id?: string | null
          threshold_value?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "metric_alert_acknowledged_by_fkey"
            columns: ["acknowledged_by"]
            isOneToOne: false
            referencedRelation: "user_account"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "metric_alert_run_id_fkey"
            columns: ["run_id"]
            isOneToOne: false
            referencedRelation: "ml_run"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "metric_alert_run_id_fkey"
            columns: ["run_id"]
            isOneToOne: false
            referencedRelation: "run"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "metric_alert_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant"
            referencedColumns: ["id"]
          },
        ]
      }
      ml_metric_definition: {
        Row: {
          alert_threshold: number | null
          created_at: string | null
          description: string | null
          display_name: string | null
          goal_direction: string | null
          goal_value: number | null
          id: string | null
          key: string | null
          metadata: Json | null
          metric_type: string | null
          project_id: string | null
          tags: Json | null
          tenant_id: string | null
          unit: string | null
          updated_at: string | null
          warning_threshold: number | null
        }
        Insert: {
          alert_threshold?: number | null
          created_at?: string | null
          description?: string | null
          display_name?: string | null
          goal_direction?: string | null
          goal_value?: number | null
          id?: string | null
          key?: string | null
          metadata?: Json | null
          metric_type?: string | null
          project_id?: string | null
          tags?: Json | null
          tenant_id?: string | null
          unit?: string | null
          updated_at?: string | null
          warning_threshold?: number | null
        }
        Update: {
          alert_threshold?: number | null
          created_at?: string | null
          description?: string | null
          display_name?: string | null
          goal_direction?: string | null
          goal_value?: number | null
          id?: string | null
          key?: string | null
          metadata?: Json | null
          metric_type?: string | null
          project_id?: string | null
          tags?: Json | null
          tenant_id?: string | null
          unit?: string | null
          updated_at?: string | null
          warning_threshold?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "metric_definition_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "project"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "metric_definition_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant"
            referencedColumns: ["id"]
          },
        ]
      }
      ml_run: {
        Row: {
          artifact_uri: string | null
          created_at: string | null
          description: string | null
          duration_seconds: number | null
          end_time: string | null
          entry_point: string | null
          experiment_id: string | null
          id: string | null
          lifecycle_stage: string | null
          metadata: Json | null
          name: string | null
          params: Json | null
          parent_run_id: string | null
          project_id: string | null
          source: string | null
          source_name: string | null
          source_version: string | null
          start_time: string | null
          status: string | null
          tags: string[] | null
          tenant_id: string | null
          updated_at: string | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "run_created_by_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_account"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "run_experiment_id_fkey"
            columns: ["experiment_id"]
            isOneToOne: false
            referencedRelation: "experiment"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "run_parent_run_id_fkey"
            columns: ["parent_run_id"]
            isOneToOne: false
            referencedRelation: "ml_run"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "run_parent_run_id_fkey"
            columns: ["parent_run_id"]
            isOneToOne: false
            referencedRelation: "run"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "run_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "project"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "run_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant"
            referencedColumns: ["id"]
          },
        ]
      }
      ml_run_metric: {
        Row: {
          context: Json | null
          id: string | null
          is_nan: boolean | null
          key: string | null
          run_id: string | null
          step: number | null
          tenant_id: string | null
          timestamp: string | null
          value: number | null
        }
        Insert: {
          context?: never
          id?: string | null
          is_nan?: never
          key?: string | null
          run_id?: string | null
          step?: number | null
          tenant_id?: string | null
          timestamp?: string | null
          value?: number | null
        }
        Update: {
          context?: never
          id?: string | null
          is_nan?: never
          key?: string | null
          run_id?: string | null
          step?: number | null
          tenant_id?: string | null
          timestamp?: string | null
          value?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "run_metric_run_id_fkey"
            columns: ["run_id"]
            isOneToOne: false
            referencedRelation: "ml_run"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "run_metric_run_id_fkey"
            columns: ["run_id"]
            isOneToOne: false
            referencedRelation: "run"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "run_metric_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant"
            referencedColumns: ["id"]
          },
        ]
      }
      ml_run_param: {
        Row: {
          id: string | null
          key: string | null
          run_id: string | null
          value: string | null
        }
        Insert: {
          id?: string | null
          key?: string | null
          run_id?: string | null
          value?: string | null
        }
        Update: {
          id?: string | null
          key?: string | null
          run_id?: string | null
          value?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "run_param_run_id_fkey"
            columns: ["run_id"]
            isOneToOne: false
            referencedRelation: "ml_run"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "run_param_run_id_fkey"
            columns: ["run_id"]
            isOneToOne: false
            referencedRelation: "run"
            referencedColumns: ["id"]
          },
        ]
      }
      ml_workspace: {
        Row: {
          auto_shutdown_minutes: number | null
          cluster_id: string | null
          compute_profile_id: string | null
          created_at: string | null
          description: string | null
          endpoint_url: string | null
          environment_id: string | null
          environment_vars: Json | null
          git_branch: string | null
          git_repo_url: string | null
          id: string | null
          idle_timeout_minutes: number | null
          image: string | null
          image_version: string | null
          internal_url: string | null
          last_activity_at: string | null
          metadata: Json | null
          name: string | null
          namespace: string | null
          pod_name: string | null
          ports: Json | null
          project_id: string | null
          resources_allocated: Json | null
          resources_used: Json | null
          size: string | null
          started_at: string | null
          status: string | null
          stopped_at: string | null
          tenant_id: string | null
          updated_at: string | null
          user_id: string | null
          volumes: Json | null
          workspace_type: string | null
        }
        Insert: {
          auto_shutdown_minutes?: number | null
          cluster_id?: string | null
          compute_profile_id?: string | null
          created_at?: string | null
          description?: string | null
          endpoint_url?: string | null
          environment_id?: string | null
          environment_vars?: Json | null
          git_branch?: string | null
          git_repo_url?: string | null
          id?: string | null
          idle_timeout_minutes?: number | null
          image?: string | null
          image_version?: string | null
          internal_url?: string | null
          last_activity_at?: string | null
          metadata?: Json | null
          name?: string | null
          namespace?: string | null
          pod_name?: string | null
          ports?: Json | null
          project_id?: string | null
          resources_allocated?: Json | null
          resources_used?: Json | null
          size?: string | null
          started_at?: string | null
          status?: string | null
          stopped_at?: string | null
          tenant_id?: string | null
          updated_at?: string | null
          user_id?: string | null
          volumes?: Json | null
          workspace_type?: string | null
        }
        Update: {
          auto_shutdown_minutes?: number | null
          cluster_id?: string | null
          compute_profile_id?: string | null
          created_at?: string | null
          description?: string | null
          endpoint_url?: string | null
          environment_id?: string | null
          environment_vars?: Json | null
          git_branch?: string | null
          git_repo_url?: string | null
          id?: string | null
          idle_timeout_minutes?: number | null
          image?: string | null
          image_version?: string | null
          internal_url?: string | null
          last_activity_at?: string | null
          metadata?: Json | null
          name?: string | null
          namespace?: string | null
          pod_name?: string | null
          ports?: Json | null
          project_id?: string | null
          resources_allocated?: Json | null
          resources_used?: Json | null
          size?: string | null
          started_at?: string | null
          status?: string | null
          stopped_at?: string | null
          tenant_id?: string | null
          updated_at?: string | null
          user_id?: string | null
          volumes?: Json | null
          workspace_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workspace_cluster_id_fkey"
            columns: ["cluster_id"]
            isOneToOne: false
            referencedRelation: "k8s_cluster"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workspace_compute_profile_id_fkey"
            columns: ["compute_profile_id"]
            isOneToOne: false
            referencedRelation: "compute_profile"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workspace_environment_id_fkey"
            columns: ["environment_id"]
            isOneToOne: false
            referencedRelation: "environment"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workspace_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "project"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workspace_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workspace_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_account"
            referencedColumns: ["id"]
          },
        ]
      }
      ml_workspace_session: {
        Row: {
          ended_at: string | null
          id: string | null
          ip_address: unknown
          last_heartbeat_at: string | null
          metadata: Json | null
          session_type: string | null
          started_at: string | null
          status: string | null
          token: string | null
          user_agent: string | null
          user_id: string | null
          workspace_id: string | null
        }
        Insert: {
          ended_at?: string | null
          id?: string | null
          ip_address?: unknown
          last_heartbeat_at?: string | null
          metadata?: Json | null
          session_type?: string | null
          started_at?: string | null
          status?: string | null
          token?: string | null
          user_agent?: string | null
          user_id?: string | null
          workspace_id?: string | null
        }
        Update: {
          ended_at?: string | null
          id?: string | null
          ip_address?: unknown
          last_heartbeat_at?: string | null
          metadata?: Json | null
          session_type?: string | null
          started_at?: string | null
          status?: string | null
          token?: string | null
          user_agent?: string | null
          user_id?: string | null
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workspace_session_log_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_account"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workspace_session_log_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "ml_workspace"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workspace_session_log_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspace"
            referencedColumns: ["id"]
          },
        ]
      }
      ml_workspace_template: {
        Row: {
          created_at: string | null
          default_compute_profile_id: string | null
          default_environment_vars: Json | null
          default_ports: Json | null
          default_size: string | null
          default_volumes: Json | null
          description: string | null
          id: string | null
          image: string | null
          image_version: string | null
          is_default: boolean | null
          is_public: boolean | null
          metadata: Json | null
          name: string | null
          tags: Json | null
          tenant_id: string | null
          updated_at: string | null
          workspace_type: string | null
        }
        Insert: {
          created_at?: string | null
          default_compute_profile_id?: string | null
          default_environment_vars?: Json | null
          default_ports?: Json | null
          default_size?: string | null
          default_volumes?: Json | null
          description?: string | null
          id?: string | null
          image?: string | null
          image_version?: string | null
          is_default?: boolean | null
          is_public?: boolean | null
          metadata?: Json | null
          name?: string | null
          tags?: Json | null
          tenant_id?: string | null
          updated_at?: string | null
          workspace_type?: string | null
        }
        Update: {
          created_at?: string | null
          default_compute_profile_id?: string | null
          default_environment_vars?: Json | null
          default_ports?: Json | null
          default_size?: string | null
          default_volumes?: Json | null
          description?: string | null
          id?: string | null
          image?: string | null
          image_version?: string | null
          is_default?: boolean | null
          is_public?: boolean | null
          metadata?: Json | null
          name?: string | null
          tags?: Json | null
          tenant_id?: string | null
          updated_at?: string | null
          workspace_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workspace_template_default_compute_profile_id_fkey"
            columns: ["default_compute_profile_id"]
            isOneToOne: false
            referencedRelation: "compute_profile"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workspace_template_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant"
            referencedColumns: ["id"]
          },
        ]
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
      ai_risk_class: "unacceptable" | "high" | "limited" | "minimal"
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
      app_type: "streamlit" | "gradio" | "custom"
      approval_decision_type: "approve" | "reject"
      approval_status: "pending" | "approved" | "rejected" | "canceled"
      argocd_health_status:
        | "healthy"
        | "progressing"
        | "degraded"
        | "missing"
        | "suspended"
      argocd_sync_status:
        | "unknown"
        | "syncing"
        | "synced"
        | "outofsync"
        | "error"
      artifact_kind: "model" | "dataset" | "report" | "file" | "plot"
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
      cicd_job_status:
        | "created"
        | "pending"
        | "running"
        | "success"
        | "failed"
        | "canceled"
        | "skipped"
        | "manual"
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
      cloud_provider: "aws" | "gcp" | "azure" | "onprem"
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
      criticality: "low" | "medium" | "high"
      data_contract_status: "draft" | "active" | "deprecated"
      deployment_status:
        | "planned"
        | "syncing"
        | "healthy"
        | "degraded"
        | "failed"
        | "paused"
      drift_severity: "low" | "medium" | "high" | "critical"
      drift_status: "open" | "acknowledged" | "resolved"
      environment_build_status: "queued" | "running" | "succeeded" | "failed"
      environment_status: "active" | "deprecated" | "archived"
      event_outbox_status: "pending" | "sent" | "failed"
      git_provider_type: "gitlab" | "github" | "bitbucket"
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
      iac_run_status:
        | "queued"
        | "planning"
        | "applying"
        | "succeeded"
        | "failed"
        | "canceled"
      idp_type: "oidc" | "saml" | "ldap"
      incident_severity: "p1" | "p2" | "p3" | "p4"
      incident_status:
        | "open"
        | "investigating"
        | "mitigating"
        | "resolved"
        | "postmortem"
      incident_update_type: "info" | "mitigation" | "resolution"
      integration_type: "slack" | "teams" | "pagerduty" | "email" | "webhook"
      k8s_cluster_status: "ready" | "degraded" | "down"
      k8s_environment: "dev" | "staging" | "prod" | "sandbox"
      managed_resource_status: "desired" | "synced" | "drifted" | "failed"
      milestone_status: "planned" | "in_progress" | "done" | "canceled"
      model_version_status: "draft" | "approved" | "deprecated"
      notification_channel: "inapp" | "email" | "webhook"
      notification_type:
        | "mention"
        | "assignment"
        | "pipeline_failed"
        | "deploy_drift"
        | "approval"
        | "incident"
      object_store_type: "s3" | "gcs" | "azure" | "minio"
      observability_kind: "logs" | "metrics" | "traces"
      observability_type:
        | "prometheus"
        | "grafana"
        | "loki"
        | "tempo"
        | "datadog"
        | "splunk"
      permission_category:
        | "admin"
        | "project"
        | "security"
        | "mlops"
        | "cicd"
        | "gitops"
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
      principal_type: "user" | "group" | "service"
      priority: "low" | "medium" | "high" | "critical"
      privacy_classification:
        | "public"
        | "internal"
        | "confidential"
        | "restricted"
      progress_status: "green" | "amber" | "red"
      project_lifecycle: "initiating" | "active" | "paused" | "archived"
      project_visibility: "private" | "internal" | "public"
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
      rollout_strategy: "bluegreen" | "canary" | "rolling"
      rule_applies_to:
        | "project"
        | "run"
        | "deploy"
        | "env"
        | "registry"
        | "cicd"
        | "gitops"
        | "catalog"
      rule_severity: "info" | "warn" | "block"
      rule_type: "validation" | "approval" | "naming" | "quota" | "security"
      run_status: "queued" | "running" | "succeeded" | "failed" | "canceled"
      run_trigger: "manual" | "schedule" | "webhook" | "api" | "cicd"
      run_type: "job" | "workspace" | "pipeline_step" | "app" | "model_api"
      scope_type: "tenant" | "org" | "project"
      secret_backend: "vault" | "aws_sm" | "gcp_sm" | "azure_kv" | "k8s_secret"
      secret_purpose:
        | "db"
        | "git"
        | "objectstore"
        | "registry"
        | "oidc"
        | "gitlab"
        | "argocd"
        | "integrations"
      severity: "minor" | "major" | "critical"
      template_instance_status: "created" | "applied" | "failed" | "deleted"
      tenant_status: "active" | "suspended" | "deleted"
      tenant_tier: "free" | "pro" | "enterprise"
      user_status: "active" | "disabled"
      webhook_delivery_status: "pending" | "sent" | "failed"
      work_item_status: "open" | "in_progress" | "blocked" | "done" | "canceled"
      work_item_type: "task" | "bug" | "story" | "epic" | "change_request"
      workspace_ide: "vscode" | "jupyter" | "rstudio"
      workspace_session_status: "starting" | "running" | "stopped" | "failed"
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
      ai_risk_class: ["unacceptable", "high", "limited", "minimal"],
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
      app_type: ["streamlit", "gradio", "custom"],
      approval_decision_type: ["approve", "reject"],
      approval_status: ["pending", "approved", "rejected", "canceled"],
      argocd_health_status: [
        "healthy",
        "progressing",
        "degraded",
        "missing",
        "suspended",
      ],
      argocd_sync_status: [
        "unknown",
        "syncing",
        "synced",
        "outofsync",
        "error",
      ],
      artifact_kind: ["model", "dataset", "report", "file", "plot"],
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
      cicd_job_status: [
        "created",
        "pending",
        "running",
        "success",
        "failed",
        "canceled",
        "skipped",
        "manual",
      ],
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
      cloud_provider: ["aws", "gcp", "azure", "onprem"],
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
      criticality: ["low", "medium", "high"],
      data_contract_status: ["draft", "active", "deprecated"],
      deployment_status: [
        "planned",
        "syncing",
        "healthy",
        "degraded",
        "failed",
        "paused",
      ],
      drift_severity: ["low", "medium", "high", "critical"],
      drift_status: ["open", "acknowledged", "resolved"],
      environment_build_status: ["queued", "running", "succeeded", "failed"],
      environment_status: ["active", "deprecated", "archived"],
      event_outbox_status: ["pending", "sent", "failed"],
      git_provider_type: ["gitlab", "github", "bitbucket"],
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
      iac_run_status: [
        "queued",
        "planning",
        "applying",
        "succeeded",
        "failed",
        "canceled",
      ],
      idp_type: ["oidc", "saml", "ldap"],
      incident_severity: ["p1", "p2", "p3", "p4"],
      incident_status: [
        "open",
        "investigating",
        "mitigating",
        "resolved",
        "postmortem",
      ],
      incident_update_type: ["info", "mitigation", "resolution"],
      integration_type: ["slack", "teams", "pagerduty", "email", "webhook"],
      k8s_cluster_status: ["ready", "degraded", "down"],
      k8s_environment: ["dev", "staging", "prod", "sandbox"],
      managed_resource_status: ["desired", "synced", "drifted", "failed"],
      milestone_status: ["planned", "in_progress", "done", "canceled"],
      model_version_status: ["draft", "approved", "deprecated"],
      notification_channel: ["inapp", "email", "webhook"],
      notification_type: [
        "mention",
        "assignment",
        "pipeline_failed",
        "deploy_drift",
        "approval",
        "incident",
      ],
      object_store_type: ["s3", "gcs", "azure", "minio"],
      observability_kind: ["logs", "metrics", "traces"],
      observability_type: [
        "prometheus",
        "grafana",
        "loki",
        "tempo",
        "datadog",
        "splunk",
      ],
      permission_category: [
        "admin",
        "project",
        "security",
        "mlops",
        "cicd",
        "gitops",
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
      principal_type: ["user", "group", "service"],
      priority: ["low", "medium", "high", "critical"],
      privacy_classification: [
        "public",
        "internal",
        "confidential",
        "restricted",
      ],
      progress_status: ["green", "amber", "red"],
      project_lifecycle: ["initiating", "active", "paused", "archived"],
      project_visibility: ["private", "internal", "public"],
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
      rollout_strategy: ["bluegreen", "canary", "rolling"],
      rule_applies_to: [
        "project",
        "run",
        "deploy",
        "env",
        "registry",
        "cicd",
        "gitops",
        "catalog",
      ],
      rule_severity: ["info", "warn", "block"],
      rule_type: ["validation", "approval", "naming", "quota", "security"],
      run_status: ["queued", "running", "succeeded", "failed", "canceled"],
      run_trigger: ["manual", "schedule", "webhook", "api", "cicd"],
      run_type: ["job", "workspace", "pipeline_step", "app", "model_api"],
      scope_type: ["tenant", "org", "project"],
      secret_backend: ["vault", "aws_sm", "gcp_sm", "azure_kv", "k8s_secret"],
      secret_purpose: [
        "db",
        "git",
        "objectstore",
        "registry",
        "oidc",
        "gitlab",
        "argocd",
        "integrations",
      ],
      severity: ["minor", "major", "critical"],
      template_instance_status: ["created", "applied", "failed", "deleted"],
      tenant_status: ["active", "suspended", "deleted"],
      tenant_tier: ["free", "pro", "enterprise"],
      user_status: ["active", "disabled"],
      webhook_delivery_status: ["pending", "sent", "failed"],
      work_item_status: ["open", "in_progress", "blocked", "done", "canceled"],
      work_item_type: ["task", "bug", "story", "epic", "change_request"],
      workspace_ide: ["vscode", "jupyter", "rstudio"],
      workspace_session_status: ["starting", "running", "stopped", "failed"],
    },
  },
} as const
