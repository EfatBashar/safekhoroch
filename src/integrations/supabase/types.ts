export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      transactions: {
        Row: {
          id: string
          user_id: string
          type: string
          amount: number
          category: string | null
          description: string | null
          account: string | null
          transaction_date: string
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type?: string
          amount?: number
          category?: string | null
          description?: string | null
          account?: string | null
          transaction_date?: string
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: string
          amount?: number
          category?: string | null
          description?: string | null
          account?: string | null
          transaction_date?: string
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      app_settings: {
        Row: { key: string; updated_at: string; updated_by: string | null; value: Json }
        Insert: { key: string; updated_at?: string; updated_by?: string | null; value: Json }
        Update: { key?: string; updated_at?: string; updated_by?: string | null; value?: Json }
        Relationships: []
      }
      feedback: {
        Row: { created_at: string; email: string | null; id: string; message: string; status: string; user_id: string | null }
        Insert: { created_at?: string; email?: string | null; id?: string; message: string; status?: string; user_id?: string | null }
        Update: { created_at?: string; email?: string | null; id?: string; message?: string; status?: string; user_id?: string | null }
        Relationships: []
      }
      profiles: {
        Row: { created_at: string; email: string | null; full_name: string | null; id: string }
        Insert: { created_at?: string; email?: string | null; full_name?: string | null; id: string }
        Update: { created_at?: string; email?: string | null; full_name?: string | null; id?: string }
        Relationships: []
      }
      user_roles: {
        Row: { created_at: string; id: string; role: Database["public"]["Enums"]["app_role"]; user_id: string }
        Insert: { created_at?: string; id?: string; role: Database["public"]["Enums"]["app_role"]; user_id: string }
        Update: { created_at?: string; id?: string; role?: Database["public"]["Enums"]["app_role"]; user_id?: string }
        Relationships: []
      }
      loans: {
        Row: { id: string; user_id: string; name: string; type: string | null; principal: number; interest_rate: number | null; paid_amount: number; due_date: string | null; status: string; notes: string | null; metadata: Json; created_at: string; updated_at: string }
        Insert: { id?: string; user_id: string; name: string; type?: string | null; principal?: number; interest_rate?: number | null; paid_amount?: number; due_date?: string | null; status?: string; notes?: string | null; metadata?: Json; created_at?: string; updated_at?: string }
        Update: { id?: string; user_id?: string; name?: string; type?: string | null; principal?: number; interest_rate?: number | null; paid_amount?: number; due_date?: string | null; status?: string; notes?: string | null; metadata?: Json; created_at?: string; updated_at?: string }
        Relationships: []
      }
      savings: {
        Row: { id: string; user_id: string; name: string; target_amount: number; current_amount: number; target_date: string | null; notes: string | null; metadata: Json; created_at: string; updated_at: string }
        Insert: { id?: string; user_id: string; name: string; target_amount?: number; current_amount?: number; target_date?: string | null; notes?: string | null; metadata?: Json; created_at?: string; updated_at?: string }
        Update: { id?: string; user_id?: string; name?: string; target_amount?: number; current_amount?: number; target_date?: string | null; notes?: string | null; metadata?: Json; created_at?: string; updated_at?: string }
        Relationships: []
      }
      budgets: {
        Row: { id: string; user_id: string; category: string; limit_amount: number; spent_amount: number; period: string; start_date: string | null; end_date: string | null; metadata: Json; created_at: string; updated_at: string }
        Insert: { id?: string; user_id: string; category: string; limit_amount?: number; spent_amount?: number; period?: string; start_date?: string | null; end_date?: string | null; metadata?: Json; created_at?: string; updated_at?: string }
        Update: { id?: string; user_id?: string; category?: string; limit_amount?: number; spent_amount?: number; period?: string; start_date?: string | null; end_date?: string | null; metadata?: Json; created_at?: string; updated_at?: string }
        Relationships: []
      }
      dps: {
        Row: { id: string; user_id: string; name: string; monthly_amount: number; total_deposit: number; maturity_amount: number | null; start_date: string | null; maturity_date: string | null; installment_count: number; paid_installments: number; status: string; notes: string | null; metadata: Json; created_at: string; updated_at: string }
        Insert: { id?: string; user_id: string; name: string; monthly_amount?: number; total_deposit?: number; maturity_amount?: number | null; start_date?: string | null; maturity_date?: string | null; installment_count?: number; paid_installments?: number; status?: string; notes?: string | null; metadata?: Json; created_at?: string; updated_at?: string }
        Update: { id?: string; user_id?: string; name?: string; monthly_amount?: number; total_deposit?: number; maturity_amount?: number | null; start_date?: string | null; maturity_date?: string | null; installment_count?: number; paid_installments?: number; status?: string; notes?: string | null; metadata?: Json; created_at?: string; updated_at?: string }
        Relationships: []
      }
      bills: {
        Row: { id: string; user_id: string; title: string; category: string | null; amount: number; due_date: string | null; status: string; recurring: boolean; notes: string | null; metadata: Json; created_at: string; updated_at: string }
        Insert: { id?: string; user_id: string; title: string; category?: string | null; amount?: number; due_date?: string | null; status?: string; recurring?: boolean; notes?: string | null; metadata?: Json; created_at?: string; updated_at?: string }
        Update: { id?: string; user_id?: string; title?: string; category?: string | null; amount?: number; due_date?: string | null; status?: string; recurring?: boolean; notes?: string | null; metadata?: Json; created_at?: string; updated_at?: string }
        Relationships: []
      }
      market: {
        Row: { id: string; user_id: string; name: string; category: string | null; quantity: number; unit: string | null; price: number; total_amount: number; purchased_at: string; notes: string | null; metadata: Json; created_at: string; updated_at: string }
        Insert: { id?: string; user_id: string; name: string; category?: string | null; quantity?: number; unit?: string | null; price?: number; total_amount?: number; purchased_at?: string; notes?: string | null; metadata?: Json; created_at?: string; updated_at?: string }
        Update: { id?: string; user_id?: string; name?: string; category?: string | null; quantity?: number; unit?: string | null; price?: number; total_amount?: number; purchased_at?: string; notes?: string | null; metadata?: Json; created_at?: string; updated_at?: string }
        Relationships: []
      }
      medicine: {
        Row: { id: string; user_id: string; name: string; dosage: string | null; quantity: number | null; schedule: string | null; start_date: string | null; end_date: string | null; notes: string | null; metadata: Json; created_at: string; updated_at: string }
        Insert: { id?: string; user_id: string; name: string; dosage?: string | null; quantity?: number | null; schedule?: string | null; start_date?: string | null; end_date?: string | null; notes?: string | null; metadata?: Json; created_at?: string; updated_at?: string }
        Update: { id?: string; user_id?: string; name?: string; dosage?: string | null; quantity?: number | null; schedule?: string | null; start_date?: string | null; end_date?: string | null; notes?: string | null; metadata?: Json; created_at?: string; updated_at?: string }
        Relationships: []
      }
      family: {
        Row: { id: string; user_id: string; name: string; relation: string | null; phone: string | null; email: string | null; notes: string | null; metadata: Json; created_at: string; updated_at: string }
        Insert: { id?: string; user_id: string; name: string; relation?: string | null; phone?: string | null; email?: string | null; notes?: string | null; metadata?: Json; created_at?: string; updated_at?: string }
        Update: { id?: string; user_id?: string; name?: string; relation?: string | null; phone?: string | null; email?: string | null; notes?: string | null; metadata?: Json; created_at?: string; updated_at?: string }
        Relationships: []
      }
      tasks: {
        Row: { id: string; user_id: string; title: string; description: string | null; due_date: string | null; priority: string; completed: boolean; completed_at: string | null; metadata: Json; created_at: string; updated_at: string }
        Insert: { id?: string; user_id: string; title: string; description?: string | null; due_date?: string | null; priority?: string; completed?: boolean; completed_at?: string | null; metadata?: Json; created_at?: string; updated_at?: string }
        Update: { id?: string; user_id?: string; title?: string; description?: string | null; due_date?: string | null; priority?: string; completed?: boolean; completed_at?: string | null; metadata?: Json; created_at?: string; updated_at?: string }
        Relationships: []
      }
      notifications: {
        Row: { id: string; user_id: string; title: string; message: string; type: string; read: boolean; read_at: string | null; metadata: Json; created_at: string }
        Insert: { id?: string; user_id: string; title: string; message: string; type?: string; read?: boolean; read_at?: string | null; metadata?: Json; created_at?: string }
        Update: { id?: string; user_id?: string; title?: string; message?: string; type?: string; read?: boolean; read_at?: string | null; metadata?: Json; created_at?: string }
        Relationships: []
      }
    }
    Views: { [_ in never]: never }
    Functions: {
      has_role: {
        Args: { _role: Database["public"]["Enums"]["app_role"]; _user_id: string }
        Returns: boolean
      }
    }
    Enums: { app_role: "admin" | "user" | "premium" }
    CompositeTypes: { [_ in never]: never }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">
type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends { Row: infer R }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends { Row: infer R }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends { Insert: infer I }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends { Insert: infer I }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends { Update: infer U }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends { Update: infer U }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user", "premium"],
    },
  },
} as const
