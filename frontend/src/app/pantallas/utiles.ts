/** El mensaje de un error para mostrarlo en pantalla, sin volcar el objeto entero. */
export function mensajeDe(error: unknown): string {
  if (error instanceof Error && error.message) return error.message;
  return typeof error === 'string' && error ? error : 'Error desconocido.';
}

/** El `codigo` estable de un error del framework (ErrorAutenticacion, ErrorAybar), si lo trae. */
export function codigoDe(error: unknown): string | null {
  const codigo = (error as { codigo?: unknown } | null)?.codigo;
  return typeof codigo === 'string' ? codigo : null;
}
