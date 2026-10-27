/** Placa peruana: tres letras o números, guion, tres más (ABC-123). Lógica pura, sin imports. */
const FORMATO = /^[A-Z0-9]{3}-?[A-Z0-9]{3}$/;

/** Mayúsculas, sin espacios, y guion tras el tercer carácter cuando hay seis. */
export function normalizarPlaca(texto: string): string {
  const limpia = texto.toUpperCase().replace(/[\s-]/g, '');
  return limpia.length === 6 ? `${limpia.slice(0, 3)}-${limpia.slice(3)}` : texto.toUpperCase().trim();
}

/** Vacía = a pie (válida). */
export function placaValida(texto: string): boolean {
  const t = texto.trim();
  return t === '' || FORMATO.test(t.toUpperCase().replace(/\s/g, ''));
}
