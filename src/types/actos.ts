// Contratos de /api/actos

/** Una pestaña de un acto (tabla actos_partes). */
export interface ParteActo {
  codigo: string // 'otorgantes', 'vehiculos', 'compradores'...
  nombre: string
  /**
   * Qué muestra: un bloque de datos (inmueble, vehiculo, cuenta_bancaria, expediente) o una vista
   * (persona, facultades, condiciones, revision). Es la referencia común con el back.
   */
  bloque: string
  /** En las pestañas de personas: el rol que muestran (otorgante, vendedor...). */
  rol: string | null
  condicion: string | null
}
