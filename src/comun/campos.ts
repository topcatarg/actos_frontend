// Definición de un campo para mostrar y formatos de valores. Común a personas y bloques de cualquier acto.

export interface DefCampo<K extends string = string> {
  clave: K
  etiqueta: string
  obligatorio: boolean
  /** Ocupa media fila. */
  mitad?: boolean
  formato?: (valor: string) => string
}

export function formatoFecha(v: string) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(v)
  return m ? `${m[3]}/${m[2]}/${m[1]}` : v
}

export function formatoGenero(v: string) {
  return v === 'M' ? 'Masculino' : v === 'F' ? 'Femenino' : v
}

export function formatoDni(v: string) {
  return /^\d{7,8}$/.test(v) ? Number(v).toLocaleString('es-AR') : v
}

export function formatoCuil(v: string) {
  return /^\d{11}$/.test(v) ? `${v.slice(0, 2)}-${v.slice(2, 10)}-${v.slice(10)}` : v
}

export function capitalizar(v: string) {
  return v ? v.charAt(0).toUpperCase() + v.slice(1) : v
}

export function humanizar(codigo: string) {
  return capitalizar(codigo.replace(/_/g, ' '))
}
