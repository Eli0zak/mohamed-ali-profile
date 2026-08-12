CREATE TABLE `broadcast_history` (
	`id` int AUTO_INCREMENT NOT NULL,
	`jobTitle` varchar(255) NOT NULL,
	`jobDetails` text NOT NULL,
	`contactName` varchar(255),
	`contactEmail` varchar(320),
	`contactLinkedin` varchar(512),
	`otherInstructions` text,
	`recipientCount` int NOT NULL,
	`successCount` int NOT NULL,
	`failureCount` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `broadcast_history_id` PRIMARY KEY(`id`)
);
