CREATE TABLE `usuarios` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`email` text NOT NULL,
	`nombre` text NOT NULL,
	`password_hash` text NOT NULL,
	`rol` text DEFAULT 'vendedor' NOT NULL,
	`activo` integer DEFAULT true NOT NULL,
	`created_at` integer NOT NULL,
	CONSTRAINT "usuarios_rol_valido" CHECK("usuarios"."rol" IN ('admin', 'vendedor')),
	CONSTRAINT "usuarios_email_normalizado" CHECK("usuarios"."email" = lower(trim("usuarios"."email")))
);
--> statement-breakpoint
CREATE UNIQUE INDEX `usuarios_email_unico` ON `usuarios` (`email`);