// Token de sesión firmado con HMAC-SHA256: "<usuarioId>.<expiraEnMs>.<firma>".
// Usa solo Web Crypto, así funciona igual en el proxy de Next.js (Edge) y en el servidor (Node).
// La firma impide fabricar o alterar la cookie; quién es el usuario y si sigue activo se resuelve
// después contra la base de datos en cada pedido (sección 10.5).

const codificador = new TextEncoder();

function obtenerSecreto(): string {
  const secreto = process.env.SESSION_SECRET;
  if (!secreto || secreto.length < 32) {
    throw new Error("Falta SESSION_SECRET (mínimo 32 caracteres) en las variables de entorno.");
  }
  return secreto;
}

let clavePromesa: Promise<CryptoKey> | null = null;

function obtenerClave(): Promise<CryptoKey> {
  clavePromesa ??= crypto.subtle.importKey(
    "raw",
    codificador.encode(obtenerSecreto()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
  return clavePromesa;
}

function aBase64Url(bytes: ArrayBuffer): string {
  let binario = "";
  for (const byte of new Uint8Array(bytes)) binario += String.fromCharCode(byte);
  return btoa(binario).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function deBase64Url(texto: string): Uint8Array<ArrayBuffer> | null {
  try {
    const binario = atob(texto.replace(/-/g, "+").replace(/_/g, "/"));
    return Uint8Array.from(binario, (caracter) => caracter.charCodeAt(0));
  } catch {
    return null;
  }
}

export async function firmarToken(usuarioId: number, expiraEn: Date): Promise<string> {
  const contenido = `${usuarioId}.${expiraEn.getTime()}`;
  const firma = await crypto.subtle.sign("HMAC", await obtenerClave(), codificador.encode(contenido));
  return `${contenido}.${aBase64Url(firma)}`;
}

// Devuelve el id del usuario si la firma es válida y no venció; si no, null.
export async function verificarToken(token: string | undefined | null): Promise<number | null> {
  if (!token) return null;

  const partes = token.split(".");
  if (partes.length !== 3) return null;
  const [idTexto, expiraTexto, firmaTexto] = partes;
  if (!/^[1-9]\d{0,9}$/.test(idTexto) || !/^\d{1,15}$/.test(expiraTexto)) return null;

  const firma = deBase64Url(firmaTexto);
  if (!firma) return null;

  // crypto.subtle.verify compara en tiempo constante.
  const valida = await crypto.subtle.verify(
    "HMAC",
    await obtenerClave(),
    firma,
    codificador.encode(`${idTexto}.${expiraTexto}`),
  );
  if (!valida || Number(expiraTexto) <= Date.now()) return null;

  return Number(idTexto);
}
