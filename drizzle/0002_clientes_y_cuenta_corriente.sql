CREATE TABLE `clientes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`tipo_doc` text NOT NULL,
	`nro_doc` text NOT NULL,
	`nro_doc_normalizado` text NOT NULL,
	`nombre` text NOT NULL,
	`nombre_busqueda` text NOT NULL,
	`domicilio` text,
	`telefono` text,
	`email` text,
	`cuenta_corriente` integer DEFAULT false NOT NULL,
	`limite_credito` integer,
	`activo` integer DEFAULT true NOT NULL,
	`created_at` integer NOT NULL,
	CONSTRAINT "clientes_tipo_doc_valido" CHECK("clientes"."tipo_doc" IN ('DNI', 'CUIT')),
	CONSTRAINT "clientes_limite_positivo" CHECK("clientes"."limite_credito" IS NULL OR "clientes"."limite_credito" > 0)
);
--> statement-breakpoint
CREATE UNIQUE INDEX `clientes_nro_doc_unico` ON `clientes` (`nro_doc_normalizado`);--> statement-breakpoint
CREATE TABLE `pagos` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`punto_venta` integer NOT NULL,
	`numero` integer NOT NULL,
	`fecha` integer NOT NULL,
	`importe` integer NOT NULL,
	`medio` text NOT NULL,
	`observacion` text,
	`cliente_id` integer NOT NULL,
	`usuario_id` integer NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`cliente_id`) REFERENCES `clientes`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`usuario_id`) REFERENCES `usuarios`(`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "pagos_importe_positivo" CHECK("pagos"."importe" > 0),
	CONSTRAINT "pagos_medio_valido" CHECK("pagos"."medio" IN ('efectivo', 'transferencia', 'tarjeta_debito'))
);
--> statement-breakpoint
CREATE UNIQUE INDEX `pagos_recibo_unico` ON `pagos` (`punto_venta`,`numero`);--> statement-breakpoint
CREATE TABLE `movimientos_cuenta` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`tipo` text NOT NULL,
	`importe` integer NOT NULL,
	`fecha` integer NOT NULL,
	`descripcion` text NOT NULL,
	`cliente_id` integer NOT NULL,
	`factura_id` integer,
	`pago_id` integer,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`cliente_id`) REFERENCES `clientes`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`pago_id`) REFERENCES `pagos`(`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "movimientos_cuenta_tipo_valido" CHECK("movimientos_cuenta"."tipo" IN ('debito', 'credito')),
	CONSTRAINT "movimientos_cuenta_importe_positivo" CHECK("movimientos_cuenta"."importe" > 0)
);
--> statement-breakpoint
CREATE INDEX `movimientos_cuenta_cliente_fecha` ON `movimientos_cuenta` (`cliente_id`,`fecha`);