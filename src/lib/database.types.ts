export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      timesheet_entries: {
        Row: {
          id: string
          user_id: string
          date: string
          start_time: string
          end_time: string
          break_time: number
          hourly_rate: number
          total_hours: number
          total_amount: number
          description: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          date: string
          start_time: string
          end_time: string
          break_time?: number
          hourly_rate: number
          total_hours: number
          total_amount: number
          description?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          date?: string
          start_time?: string
          end_time?: string
          break_time?: number
          hourly_rate?: number
          total_hours?: number
          total_amount?: number
          description?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
