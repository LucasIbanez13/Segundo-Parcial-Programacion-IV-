CREATE TABLE `categorias` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`nombre` text NOT NULL,
	`activa` integer DEFAULT true NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `categorias_nombre_unico` ON `categorias` (lower("nombre"));--> statement-breakpoint
CREATE TABLE `productos` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`codigo` text NOT NULL,
	`descripcion` text NOT NULL,
	`categoria_id` integer NOT NULL,
	`precio` integer NOT NULL,
	`existencia` integer DEFAULT 0 NOT NULL,
	`stock_minimo` integer DEFAULT 0 NOT NULL,
	`activo` integer DEFAULT true NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`categoria_id`) REFERENCES `categorias`(`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "productos_precio_positivo" CHECK("productos"."precio" > 0),
	CONSTRAINT "productos_existencia_no_negativa" CHECK("productos"."existencia" >= 0),
	CONSTRAINT "productos_stock_minimo_no_negativo" CHECK("productos"."stock_minimo" >= 0)
);
--> statement-breakpoint
CREATE UNIQUE INDEX `productos_codigo_unico` ON `productos` (lower("codigo"));--> statement-breakpoint
CREATE INDEX `productos_categoria_idx` ON `productos` (`categoria_id`);--> statement-breakpoint
CREATE TABLE `movimientos_stock` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`producto_id` integer NOT NULL,
	`usuario_id` integer NOT NULL,
	`factura_id` integer,
	`tipo` text NOT NULL,
	`cantidad` integer NOT NULL,
	`existencia_resultante` integer NOT NULL,
	`motivo` text NOT NULL,
	`observacion` text,
	`fecha` integer NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`producto_id`) REFERENCES `productos`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`usuario_id`) REFERENCES `usuarios`(`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "movimientos_stock_tipo_valido" CHECK("movimientos_stock"."tipo" IN ('venta', 'anulacion', 'ingreso', 'egreso')),
	CONSTRAINT "movimientos_stock_cantidad_distinta_de_cero" CHECK("movimientos_stock"."cantidad" <> 0),
	CONSTRAINT "movimientos_stock_signo_segun_tipo" CHECK(("movimientos_stock"."tipo" IN ('venta', 'egreso') AND "movimientos_stock"."cantidad" < 0) OR ("movimientos_stock"."tipo" IN ('ingreso', 'anulacion') AND "movimientos_stock"."cantidad" > 0)),
	CONSTRAINT "movimientos_stock_existencia_no_negativa" CHECK("movimientos_stock"."existencia_resultante" >= 0)
);
--> statement-breakpoint
CREATE INDEX `movimientos_stock_producto_fecha_idx` ON `movimientos_stock` (`producto_id`,`fecha`);--> statement-breakpoint
CREATE INDEX `movimientos_stock_fecha_idx` ON `movimientos_stock` (`fecha`);--> statement-breakpoint
CREATE TABLE `numeradores` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`clave` text NOT NULL,
	`ultimo_numero` integer DEFAULT 0 NOT NULL,
	`created_at` integer NOT NULL,
	CONSTRAINT "numeradores_ultimo_numero_no_negativo" CHECK("numeradores"."ultimo_numero" >= 0)
);
--> statement-breakpoint
CREATE UNIQUE INDEX `numeradores_clave_unica` ON `numeradores` (`clave`);