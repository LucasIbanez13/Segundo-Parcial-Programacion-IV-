// /clientes — listado con búsqueda y saldo de cada cliente (RF-C1). Búsqueda, estado y página en la URL.
import type { Metadata } from "next";
import { ListadoClientes, type ParametrosClientes } from "@/components/clientes/ListadoClientes";

export const metadata: Metadata = { title: "Clientes" };

export default async function PaginaClientes({ searchParams }: { searchParams: Promise<ParametrosClientes> }) {
  return <ListadoClientes parametros={await searchParams} />;
}
