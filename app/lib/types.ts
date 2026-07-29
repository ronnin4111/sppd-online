export type Employee = { id: number; name: string; nip: string; position: string; rank: string; work_unit: string; daily_rate: number };
export type Destination = { id: number; name: string; trip_type: "dalam" | "luar"; transport_rate: number };
export type Account = { id: number; activity_name: string; account_code: string };
export type Signatory = { id: number; role: string; name: string; nip: string; rank: string; region_line: string };
export type Trip = {
  id: number; trip_type: "dalam" | "luar"; destination_name: string; purpose: string;
  depart_date: string; return_date: string; spt_number: string; spt_date: string;
  letter_code: string; status: "draft" | "final" | "printed"; participant_count: number;
  total_amount: number; created_at: string;
};
export type Dataset = {
  settings: Record<string, string>; employees: Employee[]; destinations: Destination[];
  accounts: Account[]; signatories: Signatory[]; trips: Trip[];
};
export type Expense = { id?: number; item_name: string; volume: number; rate: number; amount?: number; notes?: string };
export type Participant = Employee & { id: number; employee_id: number; spd_number: string; sequence_no: number; expenses: Expense[] };
export type Stopover = {
  enabled: boolean; arrival_place: string; arrival_date: string; departure_date: string;
  next_destination: string; official_position: string; official_name: string; official_nip: string;
  official_signature: string;
};
export type TripDetail = {
  trip: Trip & { notes: string; stopovers_json: string; stopovers: Stopover[]; activity_name: string; account_code: string; signer_role: string; signer_name: string; signer_nip: string; signer_rank: string; signer_region_line: string };
  participants: Participant[]; settings: Record<string, string>;
};
