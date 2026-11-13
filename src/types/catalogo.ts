/** Facultad o condición de clausulas_template. */
export interface Clausula {
  codigo: string
  nombre: string
  tipo: 'facultad' | 'condicion'
  /** Para condiciones: sustitucion | vigencia | revocabilidad. Para facultades: inmuebles, bancario... */
  categoria: string
  aplicableA: string[]
}
