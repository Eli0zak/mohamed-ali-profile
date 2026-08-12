CREATE TABLE `career_submissions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`fullName` varchar(255) NOT NULL,
	`phoneNumber` varchar(64) NOT NULL,
	`email` varchar(320) NOT NULL,
	`field` varchar(128) NOT NULL,
	`yearsOfExperience` varchar(64) NOT NULL,
	`availability` varchar(64) NOT NULL,
	`trainingSectorExperience` int NOT NULL DEFAULT 0,
	`cvUrl` text NOT NULL,
	`cvFileName` varchar(255),
	`message` text,
	`status` enum('New','Reviewed','Shortlisted','Contacted','Archived') NOT NULL DEFAULT 'New',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `career_submissions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`openId` varchar(64) NOT NULL,
	`name` text,
	`email` varchar(320),
	`loginMethod` varchar(64),
	`role` enum('user','admin') NOT NULL DEFAULT 'user',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`lastSignedIn` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_openId_unique` UNIQUE(`openId`)
);
