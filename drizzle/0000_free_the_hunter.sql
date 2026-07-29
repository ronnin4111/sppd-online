CREATE TABLE `budget_accounts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`activity_name` text NOT NULL,
	`account_code` text DEFAULT '' NOT NULL,
	`active` integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
CREATE TABLE `destinations` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`trip_type` text DEFAULT 'dalam' NOT NULL,
	`transport_rate` real DEFAULT 0 NOT NULL,
	`active` integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
CREATE TABLE `employees` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`nip` text DEFAULT '' NOT NULL,
	`position` text DEFAULT '' NOT NULL,
	`rank` text DEFAULT '' NOT NULL,
	`work_unit` text DEFAULT '' NOT NULL,
	`daily_rate` real DEFAULT 0 NOT NULL,
	`active` integer DEFAULT 1 NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `expenses` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`participant_id` integer NOT NULL,
	`item_name` text NOT NULL,
	`volume` real DEFAULT 1 NOT NULL,
	`rate` real DEFAULT 0 NOT NULL,
	`amount` real DEFAULT 0 NOT NULL,
	`notes` text DEFAULT '' NOT NULL,
	`sort_order` integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
CREATE TABLE `trip_participants` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`trip_id` integer NOT NULL,
	`employee_id` integer NOT NULL,
	`spd_number` text DEFAULT '' NOT NULL,
	`sequence_no` integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
CREATE TABLE `settings` (
	`key` text PRIMARY KEY NOT NULL,
	`value` text DEFAULT '' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `signatories` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`role` text NOT NULL,
	`name` text NOT NULL,
	`nip` text DEFAULT '' NOT NULL,
	`rank` text DEFAULT '' NOT NULL,
	`region_line` text DEFAULT '' NOT NULL,
	`active` integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
CREATE TABLE `trips` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`trip_type` text DEFAULT 'dalam' NOT NULL,
	`destination_name` text NOT NULL,
	`purpose` text NOT NULL,
	`depart_date` text NOT NULL,
	`return_date` text NOT NULL,
	`spt_number` text DEFAULT '' NOT NULL,
	`spt_date` text NOT NULL,
	`letter_code` text DEFAULT 'DPKPP-G' NOT NULL,
	`signer_id` integer,
	`budget_account_id` integer,
	`status` text DEFAULT 'draft' NOT NULL,
	`notes` text DEFAULT '' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
