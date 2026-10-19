/**
 * La marca: el símbolo de public/favicon.svg dibujado con los tokens (fondo de marca y
 * texto sobre marca), así cambia con el tema en vez de quedarse con los colores del icono.
 * Al lado, el nombre del proyecto.
 */
export function Marca({ nombre }: { nombre: string }) {
  return (
    <span className="pl-marca">
      <svg className="pl-marca__simbolo" viewBox="0 0 32 32" aria-hidden="true" focusable="false">
        <rect width="32" height="32" rx="6" fill="currentColor" />
        <path className="pl-marca__letra" d="M9 24 16 8l7 16h-3.6l-1.4-3.4h-4L12.6 24Zm6-6.4h2.1L16 14.9Z" />
      </svg>
      {nombre}
    </span>
  )
}
