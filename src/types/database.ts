
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  
  "graphql_public": {
          Tables: {
            [_ in never]: never
          }
          Views: {
            [_ in never]: never
          }
          Functions: {
            "graphql":
{ Args: { "extensions"?: Json,"operationName"?: string,"query"?: string,"variables"?: Json }; Returns: Json
                           }
          }
          Enums: {
            [_ in never]: never
          }
          CompositeTypes: {
            [_ in never]: never
          }
        },"public": {
          Tables: {
            "achievements": {
                  Row: {
                    "created_at": string,"description": string,"icon": string,"id": string,"required_hours": number,"title": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"description": string,"icon"?: string,"id"?: string,"required_hours": number,"title": string
                  }
                  Update: {
                    "created_at"?: string,"description"?: string,"icon"?: string,"id"?: string,"required_hours"?: number,"title"?: string
                  }
                  Relationships: [
                    
                  ]
                },"certificates": {
                  Row: {
                    "certificate_url": string,"id": string,"issued_at": string,"project_id": string,"volunteer_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "certificate_url": string,"id"?: string,"issued_at"?: string,"project_id": string,"volunteer_id": string
                  }
                  Update: {
                    "certificate_url"?: string,"id"?: string,"issued_at"?: string,"project_id"?: string,"volunteer_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "certificates_project_id_fkey"
      columns: ["project_id"]
isOneToOne: false
      referencedRelation: "project_public_stats"
      referencedColumns: ["project_id"]
    },{
      foreignKeyName: "certificates_project_id_fkey"
      columns: ["project_id"]
isOneToOne: false
      referencedRelation: "projects"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "certificates_project_id_fkey"
      columns: ["project_id"]
isOneToOne: false
      referencedRelation: "public_volunteer_projects"
      referencedColumns: ["project_id"]
    },{
      foreignKeyName: "certificates_volunteer_id_fkey"
      columns: ["volunteer_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "certificates_volunteer_id_fkey"
      columns: ["volunteer_id"]
isOneToOne: false
      referencedRelation: "public_profiles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "certificates_volunteer_id_fkey"
      columns: ["volunteer_id"]
isOneToOne: false
      referencedRelation: "public_volunteer_profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"organization_members": {
                  Row: {
                    "joined_at": string,"organization_id": string,"role": Database["public"]['Enums']["org_role"],"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "joined_at"?: string,"organization_id": string,"role"?: Database["public"]['Enums']["org_role"],"user_id": string
                  }
                  Update: {
                    "joined_at"?: string,"organization_id"?: string,"role"?: Database["public"]['Enums']["org_role"],"user_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "organization_members_organization_id_fkey"
      columns: ["organization_id"]
isOneToOne: false
      referencedRelation: "organizations"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "organization_members_user_id_fkey"
      columns: ["user_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "organization_members_user_id_fkey"
      columns: ["user_id"]
isOneToOne: false
      referencedRelation: "public_profiles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "organization_members_user_id_fkey"
      columns: ["user_id"]
isOneToOne: false
      referencedRelation: "public_volunteer_profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"organizations": {
                  Row: {
                    "category": string | null,"city": string,"created_at": string,"id": string,"is_demo": boolean,"logo_url": string | null,"name": string,"slug": string,"status": string,"summary": string,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "category"?: string | null,"city"?: string,"created_at"?: string,"id"?: string,"is_demo"?: boolean,"logo_url"?: string | null,"name": string,"slug": string,"status"?: string,"summary"?: string,"updated_at"?: string
                  }
                  Update: {
                    "category"?: string | null,"city"?: string,"created_at"?: string,"id"?: string,"is_demo"?: boolean,"logo_url"?: string | null,"name"?: string,"slug"?: string,"status"?: string,"summary"?: string,"updated_at"?: string
                  }
                  Relationships: [
                    
                  ]
                },"profiles": {
                  Row: {
                    "avatar_url": string | null,"bio": string | null,"created_at": string,"full_name": string,"id": string,"onboarded_at": string | null,"phone": string | null,"role": Database["public"]['Enums']["user_role"],"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "avatar_url"?: string | null,"bio"?: string | null,"created_at"?: string,"full_name"?: string,"id": string,"onboarded_at"?: string | null,"phone"?: string | null,"role"?: Database["public"]['Enums']["user_role"],"updated_at"?: string
                  }
                  Update: {
                    "avatar_url"?: string | null,"bio"?: string | null,"created_at"?: string,"full_name"?: string,"id"?: string,"onboarded_at"?: string | null,"phone"?: string | null,"role"?: Database["public"]['Enums']["user_role"],"updated_at"?: string
                  }
                  Relationships: [
                    
                  ]
                },"project_applications": {
                  Row: {
                    "applied_at": string,"checkin_code": string | null,"id": string,"project_id": string,"status": Database["public"]['Enums']["application_status"],"updated_at": string,"volunteer_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "applied_at"?: string,"checkin_code"?: string | null,"id"?: string,"project_id": string,"status"?: Database["public"]['Enums']["application_status"],"updated_at"?: string,"volunteer_id": string
                  }
                  Update: {
                    "applied_at"?: string,"checkin_code"?: string | null,"id"?: string,"project_id"?: string,"status"?: Database["public"]['Enums']["application_status"],"updated_at"?: string,"volunteer_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "project_applications_project_id_fkey"
      columns: ["project_id"]
isOneToOne: false
      referencedRelation: "project_public_stats"
      referencedColumns: ["project_id"]
    },{
      foreignKeyName: "project_applications_project_id_fkey"
      columns: ["project_id"]
isOneToOne: false
      referencedRelation: "projects"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "project_applications_project_id_fkey"
      columns: ["project_id"]
isOneToOne: false
      referencedRelation: "public_volunteer_projects"
      referencedColumns: ["project_id"]
    },{
      foreignKeyName: "project_applications_volunteer_id_fkey"
      columns: ["volunteer_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "project_applications_volunteer_id_fkey"
      columns: ["volunteer_id"]
isOneToOne: false
      referencedRelation: "public_profiles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "project_applications_volunteer_id_fkey"
      columns: ["volunteer_id"]
isOneToOne: false
      referencedRelation: "public_volunteer_profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"project_whatsapp_groups": {
                  Row: {
                    "created_at": string,"project_id": string,"updated_at": string,"whatsapp_group_url": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"project_id": string,"updated_at"?: string,"whatsapp_group_url": string
                  }
                  Update: {
                    "created_at"?: string,"project_id"?: string,"updated_at"?: string,"whatsapp_group_url"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "project_whatsapp_groups_project_id_fkey"
      columns: ["project_id"]
isOneToOne: true
      referencedRelation: "project_public_stats"
      referencedColumns: ["project_id"]
    },{
      foreignKeyName: "project_whatsapp_groups_project_id_fkey"
      columns: ["project_id"]
isOneToOne: true
      referencedRelation: "projects"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "project_whatsapp_groups_project_id_fkey"
      columns: ["project_id"]
isOneToOne: true
      referencedRelation: "public_volunteer_projects"
      referencedColumns: ["project_id"]
    }
                  ]
                },"projects": {
                  Row: {
                    "address": string | null,"benefits": (string)[],"category": string,"city": string,"coordinator_id": string,"cover_url": string | null,"created_at": string,"description": string,"end_date": string,"format": Database["public"]['Enums']["project_format"],"id": string,"organization_id": string | null,"required_volunteers": number,"requirements": string | null,"start_date": string,"status": Database["public"]['Enums']["project_status"],"title": string,"updated_at": string,"volunteer_hours": number
                  }
                  ComputedFields: never
                  Insert: {
                    "address"?: string | null,"benefits"?: (string)[],"category": string,"city": string,"coordinator_id": string,"cover_url"?: string | null,"created_at"?: string,"description": string,"end_date": string,"format"?: Database["public"]['Enums']["project_format"],"id"?: string,"organization_id"?: string | null,"required_volunteers"?: number,"requirements"?: string | null,"start_date": string,"status"?: Database["public"]['Enums']["project_status"],"title": string,"updated_at"?: string,"volunteer_hours"?: number
                  }
                  Update: {
                    "address"?: string | null,"benefits"?: (string)[],"category"?: string,"city"?: string,"coordinator_id"?: string,"cover_url"?: string | null,"created_at"?: string,"description"?: string,"end_date"?: string,"format"?: Database["public"]['Enums']["project_format"],"id"?: string,"organization_id"?: string | null,"required_volunteers"?: number,"requirements"?: string | null,"start_date"?: string,"status"?: Database["public"]['Enums']["project_status"],"title"?: string,"updated_at"?: string,"volunteer_hours"?: number
                  }
                  Relationships: [
                    {
      foreignKeyName: "projects_coordinator_id_fkey"
      columns: ["coordinator_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "projects_coordinator_id_fkey"
      columns: ["coordinator_id"]
isOneToOne: false
      referencedRelation: "public_profiles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "projects_coordinator_id_fkey"
      columns: ["coordinator_id"]
isOneToOne: false
      referencedRelation: "public_volunteer_profiles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "projects_organization_id_fkey"
      columns: ["organization_id"]
isOneToOne: false
      referencedRelation: "organizations"
      referencedColumns: ["id"]
    }
                  ]
                },"volunteer_achievements": {
                  Row: {
                    "achievement_id": string,"awarded_at": string,"id": string,"volunteer_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "achievement_id": string,"awarded_at"?: string,"id"?: string,"volunteer_id": string
                  }
                  Update: {
                    "achievement_id"?: string,"awarded_at"?: string,"id"?: string,"volunteer_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "volunteer_achievements_achievement_id_fkey"
      columns: ["achievement_id"]
isOneToOne: false
      referencedRelation: "achievements"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "volunteer_achievements_volunteer_id_fkey"
      columns: ["volunteer_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "volunteer_achievements_volunteer_id_fkey"
      columns: ["volunteer_id"]
isOneToOne: false
      referencedRelation: "public_profiles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "volunteer_achievements_volunteer_id_fkey"
      columns: ["volunteer_id"]
isOneToOne: false
      referencedRelation: "public_volunteer_profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"volunteer_hours": {
                  Row: {
                    "confirmed_at": string | null,"confirmed_by": string | null,"created_at": string,"hours": number,"id": string,"project_id": string,"status": Database["public"]['Enums']["hour_status"],"updated_at": string,"volunteer_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "confirmed_at"?: string | null,"confirmed_by"?: string | null,"created_at"?: string,"hours": number,"id"?: string,"project_id": string,"status"?: Database["public"]['Enums']["hour_status"],"updated_at"?: string,"volunteer_id": string
                  }
                  Update: {
                    "confirmed_at"?: string | null,"confirmed_by"?: string | null,"created_at"?: string,"hours"?: number,"id"?: string,"project_id"?: string,"status"?: Database["public"]['Enums']["hour_status"],"updated_at"?: string,"volunteer_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "volunteer_hours_confirmed_by_fkey"
      columns: ["confirmed_by"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "volunteer_hours_confirmed_by_fkey"
      columns: ["confirmed_by"]
isOneToOne: false
      referencedRelation: "public_profiles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "volunteer_hours_confirmed_by_fkey"
      columns: ["confirmed_by"]
isOneToOne: false
      referencedRelation: "public_volunteer_profiles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "volunteer_hours_project_id_fkey"
      columns: ["project_id"]
isOneToOne: false
      referencedRelation: "project_public_stats"
      referencedColumns: ["project_id"]
    },{
      foreignKeyName: "volunteer_hours_project_id_fkey"
      columns: ["project_id"]
isOneToOne: false
      referencedRelation: "projects"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "volunteer_hours_project_id_fkey"
      columns: ["project_id"]
isOneToOne: false
      referencedRelation: "public_volunteer_projects"
      referencedColumns: ["project_id"]
    },{
      foreignKeyName: "volunteer_hours_volunteer_id_fkey"
      columns: ["volunteer_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "volunteer_hours_volunteer_id_fkey"
      columns: ["volunteer_id"]
isOneToOne: false
      referencedRelation: "public_profiles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "volunteer_hours_volunteer_id_fkey"
      columns: ["volunteer_id"]
isOneToOne: false
      referencedRelation: "public_volunteer_profiles"
      referencedColumns: ["id"]
    }
                  ]
                }
          }
          Views: {
            "platform_stats": {
                  Row: {
                    "confirmed_hours": number | null,"projects": number | null,"volunteers": number | null
                  }
                  ComputedFields: never
                  Relationships: [
                    
                  ]
                },"project_public_stats": {
                  Row: {
                    "available_places": number | null,"participant_count": number | null,"project_id": string
                  }
                  ComputedFields: never
                  Relationships: [
                    
                  ]
                },"public_profiles": {
                  Row: {
                    "avatar_url": string | null,"bio": string | null,"created_at": string,"full_name": string,"id": string,"role": Database["public"]['Enums']["user_role"]
                  }
                  ComputedFields: never
                  Insert: {
                           "avatar_url"?: string | null,"bio"?: string | null,"created_at"?: string | null,"full_name"?: string | null,"id"?: string | null,"role"?: Database["public"]['Enums']["user_role"] | null
                         }
                        Update: {
                           "avatar_url"?: string | null,"bio"?: string | null,"created_at"?: string | null,"full_name"?: string | null,"id"?: string | null,"role"?: Database["public"]['Enums']["user_role"] | null
                         }
                        Relationships: [
                    
                  ]
                },"public_volunteer_profiles": {
                  Row: {
                    "avatar_url": string | null,"bio": string | null,"completed_projects": number | null,"confirmed_hours": number | null,"created_at": string,"full_name": string,"id": string
                  }
                  ComputedFields: never
                  Insert: {
                           "avatar_url"?: string | null,"bio"?: string | null,"completed_projects"?: never,"confirmed_hours"?: never,"created_at"?: string | null,"full_name"?: string | null,"id"?: string | null
                         }
                        Update: {
                           "avatar_url"?: string | null,"bio"?: string | null,"completed_projects"?: never,"confirmed_hours"?: never,"created_at"?: string | null,"full_name"?: string | null,"id"?: string | null
                         }
                        Relationships: [
                    
                  ]
                },"public_volunteer_projects": {
                  Row: {
                    "category": string,"city": string,"cover_url": string | null,"end_date": string,"hours": number | null,"project_id": string,"start_date": string,"title": string,"volunteer_id": string
                  }
                  ComputedFields: never
                  Relationships: [
                    {
      foreignKeyName: "project_applications_volunteer_id_fkey"
      columns: ["volunteer_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "project_applications_volunteer_id_fkey"
      columns: ["volunteer_id"]
isOneToOne: false
      referencedRelation: "public_profiles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "project_applications_volunteer_id_fkey"
      columns: ["volunteer_id"]
isOneToOne: false
      referencedRelation: "public_volunteer_profiles"
      referencedColumns: ["id"]
    }
                  ]
                }
          }
          Functions: {
            "admin_delete_volunteer_user":
{ Args: { "target_user_id": string }; Returns: undefined
                           },
"admin_list_users":
{ Args: Record<PropertyKey, never>; Returns: {
              "avatar_url": string,"created_at": string,"email": string,"full_name": string,"id": string,"role": Database["public"]['Enums']["user_role"]
            }[]
                           },
"admin_set_user_role":
{ Args: { "new_role": Database["public"]['Enums']["user_role"],"target_user_id": string }; Returns: Database["public"]['Enums']["user_role"]
                           },
"apply_to_project":
{ Args: { "target": string }; Returns: {
              "applied_at": string,
"checkin_code": string | null,
"id": string,
"project_id": string,
"status": Database["public"]['Enums']["application_status"],
"updated_at": string,
"volunteer_id": string
            }
                          SetofOptions: {
        from: "*"
        to: "project_applications"
        isOneToOne: true
        isSetofReturn: false
      } },
"complete_onboarding":
{ Args: Record<PropertyKey, never>; Returns: string
                           },
"has_current_project_application":
{ Args: { "target_project_id": string }; Returns: boolean
                           },
"is_admin":
{ Args: { "user_id"?: string }; Returns: boolean
                           },
"is_coordinator":
{ Args: { "user_id"?: string }; Returns: boolean
                           },
"join_organization":
{ Args: { "target": string }; Returns: {
              "joined_at": string,
"organization_id": string,
"role": Database["public"]['Enums']["org_role"],
"user_id": string
            }
                          SetofOptions: {
        from: "*"
        to: "organization_members"
        isOneToOne: true
        isSetofReturn: false
      } },
"leave_organization":
{ Args: { "target": string }; Returns: number
                           },
"new_checkin_code":
{ Args: Record<PropertyKey, never>; Returns: string
                           },
"owns_project":
{ Args: { "target_project_id": string,"user_id"?: string }; Returns: boolean
                           },
"project_has_capacity":
{ Args: { "target_project_id": string }; Returns: boolean
                           },
"volunteer_feed":
{ Args: { "page_offset"?: number,"page_size"?: number,"scope"?: string }; Returns: {
              "address": string,"application_id": string,"application_status": Database["public"]['Enums']["application_status"],"available_places": number,"capacity": number,"category": string,"city": string,"cover_url": string,"end_date": string,"format": Database["public"]['Enums']["project_format"],"organization_id": string,"organization_logo_url": string,"organization_name": string,"project_id": string,"start_date": string,"title": string
            }[]
                           }
          }
          Enums: {
            "application_status": "pending"|"approved"|"rejected"|"attended"|"completed","hour_status": "pending"|"confirmed"|"rejected","org_role": "volunteer"|"coordinator"|"head","project_format": "online"|"offline","project_status": "draft"|"published"|"completed"|"cancelled","user_role": "volunteer"|"coordinator"|"admin"
          }
          CompositeTypes: {
            [_ in never]: never
          }
        }
}

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

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
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
  ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
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
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
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
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
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
    : never = never
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
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
    : never = never
> = PublicCompositeTypeNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never

export const Constants = {
  "graphql_public": {
          Enums: {
            
          }
        },"public": {
          Enums: {
            "application_status": ["pending", "approved", "rejected", "attended", "completed"],"hour_status": ["pending", "confirmed", "rejected"],"org_role": ["volunteer", "coordinator", "head"],"project_format": ["online", "offline"],"project_status": ["draft", "published", "completed", "cancelled"],"user_role": ["volunteer", "coordinator", "admin"]
          }
        }
} as const
