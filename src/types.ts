
export interface Employee {
  id: string;
  name: string;
  folio: string;
}

export interface DayRecord {
  date: string;
  dayName: string;
  totalSales: number;
}

export interface EmployeeRecord {
  employeeId: string;
  sales: { [dayIndex: number]: number };
  cellPhones: { [dayIndex: number]: number };
}

export type ReportMode = 'full' | 'commissions' | 'days';
