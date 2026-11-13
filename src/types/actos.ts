// Contratos de /api/actos

/** Una parte (paso) de un acto, de la tabla actos_partes. Los campos de cada parte los define el front. */
export interface ParteActo {
  codigo: string // 'otorgantes', 'apoderados', 'facultades', 'condiciones', 'revision'...
  nombre: string
}
