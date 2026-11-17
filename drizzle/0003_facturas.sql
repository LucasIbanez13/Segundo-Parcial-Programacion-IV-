CREATE TABLE `factura_items` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`factura_id` integer NOT NULL,
	`producto_id` integer NOT NULL,
	`codigo` text NOT NULL,
	`descripcion` text NOT NULL,
	`cantidad` integer NOT NULL,
	`precio_unitario` integer NOT NULL,
	`subtotal` integer NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`factura_id`) REFERENCES `facturas`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`producto_id`) REFERENCES `productos`(`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "factura_items_cantidad_positiva" CHECK("factura_items"."cantidad" > 0),
	CONSTRAINT "factura_items_precio_positivo" CHECK("factura_items"."precio_unitario" > 0),
	CONSTRAINT "factura_items_subtotal" CHECK("factura_items"."subtotal" = "factura_items"."cantidad" * "factura_items"."precio_unitario")
);
--> statement-breakpoint
CREATE UNIQUE INDEX `factura_items_producto_unico` ON `factura_items` (`factura_id`,`producto_id`);--> statement-breakpoint
CREATE TABLE `facturas` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`punto_venta` integer NOT NULL,
	`numero` integer NOT NULL,
	`fecha` integer NOT NULL,
	`total` integer NOT NULL,
	`forma` text NOT NULL,
	`tarjeta_tipo` text,
	`tarjeta_marca` text,
	`tarjeta_ultimos4` text,
	`monto_recibido` integer,
	`estado` text DEFAULT 'emitida' NOT NULL,
	`motivo_anulacion` text,
	`anulada_en` integer,
	`anulada_por_id` integer,
	`cliente_id` integer,
	`usuario_id` integer NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`anulada_por_id`) REFERENCES `usuarios`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`cliente_id`) REFERENCES `clientes`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`usuario_id`) REFERENCES `usuarios`(`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "facturas_total_positivo" CHECK("facturas"."total" > 0),
	CONSTRAINT "facturas_forma_valida" CHECK("facturas"."forma" IN ('contado', 'tarjeta', 'cuenta_corriente')),
	CONSTRAINT "facturas_estado_valido" CHECK("facturas"."estado" IN ('emitida', 'anulada')),
	CONSTRAINT "facturas_cuenta_con_cliente" CHECK("facturas"."forma" <> 'cuenta_corriente' OR "facturas"."cliente_id" IS NOT NULL),
	CONSTRAINT "facturas_datos_tarjeta" CHECK(("facturas"."forma" = 'tarjeta' AND "facturas"."tarjeta_tipo" IN ('debito', 'credito') AND "facturas"."tarjeta_marca" IS NOT NULL AND "facturas"."tarjeta_ultimos4" GLOB '[0-9][0-9][0-9][0-9]')
        OR ("facturas"."forma" <> 'tarjeta' AND "facturas"."tarjeta_tipo" IS NULL AND "facturas"."tarjeta_marca" IS NULL AND "facturas"."tarjeta_ultimos4" IS NULL)),
	CONSTRAINT "facturas_monto_recibido" CHECK(("facturas"."forma" = 'contado' AND "facturas"."monto_recibido" >= "facturas"."total") OR ("facturas"."forma" <> 'contado' AND "facturas"."monto_recibido" IS NULL)),
	CONSTRAINT "facturas_anulacion_con_motivo" CHECK("facturas"."estado" = 'emitida' OR ("facturas"."motivo_anulacion" IS NOT NULL AND "facturas"."anulada_en" IS NOT NULL AND "facturas"."anulada_por_id" IS NOT NULL))
);
--> statement-breakpoint
CREATE INDEX `facturas_fecha_idx` ON `facturas` (`fecha`);--> statement-breakpoint
CREATE INDEX `facturas_cliente_idx` ON `facturas` (`cliente_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `facturas_numero_unico` ON `facturas` (`punto_venta`,`numero`);--> statement-breakpoint
ALTER TABLE `movimientos_cuenta` ALTER COLUMN "factura_id" TO "factura_id" integer REFERENCES facturas(id) ON DELETE no action ON UPDATE no action;