ALTER TABLE `broadcast_history` ADD `audienceType` enum('all','field','test') DEFAULT 'all' NOT NULL;--> statement-breakpoint
ALTER TABLE `broadcast_history` ADD `audienceField` varchar(128);