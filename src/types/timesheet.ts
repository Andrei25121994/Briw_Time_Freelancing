export interface TimesheetEntry {
  id: string;
  user_id: string;
  date: string;
  start_time: string;
  end_time: string;
  break_time: number;
  hourly_rate: number;
  total_hours: number;
  total_amount: number;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface TimesheetFormData {
  date: string;
  start_time: string;
  end_time: string;
  break_time: number;
  hourly_rate: number;
  description: string;
}

export interface MonthlySummary {
  totalHours: number;
  totalAmount: number;
  daysWorked: number;
}
