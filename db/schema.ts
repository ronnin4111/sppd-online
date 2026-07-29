import { sql } from "drizzle-orm";
import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const settings = sqliteTable("settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull().default(""),
});
export const employees = sqliteTable("employees", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  nip: text("nip").notNull().default(""),
  position: text("position").notNull().default(""),
  rank: text("rank").notNull().default(""),
  workUnit: text("work_unit").notNull().default(""),
  dailyRate: real("daily_rate").notNull().default(0),
  active: integer("active").notNull().default(1),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});
export const destinations = sqliteTable("destinations", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  tripType: text("trip_type").notNull().default("dalam"),
  transportRate: real("transport_rate").notNull().default(0),
  active: integer("active").notNull().default(1),
});
export const accounts = sqliteTable("budget_accounts", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  activityName: text("activity_name").notNull(),
  accountCode: text("account_code").notNull().default(""),
  active: integer("active").notNull().default(1),
});
export const signatories = sqliteTable("signatories", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  role: text("role").notNull(),
  name: text("name").notNull(),
  nip: text("nip").notNull().default(""),
  rank: text("rank").notNull().default(""),
  regionLine: text("region_line").notNull().default(""),
  active: integer("active").notNull().default(1),
});
export const trips = sqliteTable("trips", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  tripType: text("trip_type").notNull().default("dalam"),
  destinationName: text("destination_name").notNull(),
  purpose: text("purpose").notNull(),
  departDate: text("depart_date").notNull(),
  returnDate: text("return_date").notNull(),
  sptNumber: text("spt_number").notNull().default(""),
  sptDate: text("spt_date").notNull(),
  letterCode: text("letter_code").notNull().default("DPKPP-G"),
  signerId: integer("signer_id"),
  accountId: integer("budget_account_id"),
  status: text("status").notNull().default("draft"),
  notes: text("notes").notNull().default(""),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});
export const participants = sqliteTable("trip_participants", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  tripId: integer("trip_id").notNull(),
  employeeId: integer("employee_id").notNull(),
  spdNumber: text("spd_number").notNull().default(""),
  sequenceNo: integer("sequence_no").notNull().default(1),
});
export const expenses = sqliteTable("expenses", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  participantId: integer("participant_id").notNull(),
  itemName: text("item_name").notNull(),
  volume: real("volume").notNull().default(1),
  rate: real("rate").notNull().default(0),
  amount: real("amount").notNull().default(0),
  notes: text("notes").notNull().default(""),
  sortOrder: integer("sort_order").notNull().default(1),
});
