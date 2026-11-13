// Lo que el front sabe del poder: qué campos tiene cada parte y cómo se reparten los pendientes
// entre las partes (pasos) que vienen de la tabla actos_partes.
import type { Dato, EstadoPoder, Pendiente, PersonaPoder, Poder } from '@/types/poder'

export type CampoPersona = Exclude<keyof PersonaPoder, 'pfId' | 'personaNueva' | 'candidatos' | 'rol'>

export interface DefCampo<K extends string = string> {
  clave: K
  etiqueta: string
  obligatorio: boolean
  /** Ocupa media fila. */
  mitad?: boolean
  formato?: (valor: string) => string
}

/** Mismo orden y obligatoriedad que el HTML original (y que MotorFaltantes en el back). */
export const CAMPOS_PERSONA: DefCampo<CampoPersona>[] = [
  { clave: 'nombreCompleto', etiqueta: 'Nombre completo', obligatorio: true },
  { clave: 'nombres', etiqueta: 'Nombres', obligatorio: true, mitad: true },
  { clave: 'apellido', etiqueta: 'Apellido', obligatorio: true, mitad: true },
  { clave: 'genero', etiqueta: 'Género', obligatorio: true, mitad: true, formato: formatoGenero },
  { clave: 'dni', etiqueta: 'DNI', obligatorio: true, mitad: true, formato: formatoDni },
  { clave: 'cuil', etiqueta: 'CUIL', obligatorio: false, mitad: true, formato: formatoCuil },
  { clave: 'estadoCivil', etiqueta: 'Estado civil', obligatorio: true, mitad: true, formato: capitalizar },
  { clave: 'fechaNacimiento', etiqueta: 'Fecha de nacimiento', obligatorio: true, mitad: true, formato: formatoFecha },
  { clave: 'nacionalidad', etiqueta: 'Nacionalidad', obligatorio: true, mitad: true, formato: capitalizar },
  { clave: 'domicilio', etiqueta: 'Domicilio', obligatorio: true },
  { clave: 'padre', etiqueta: 'Padre', obligatorio: false },
  { clave: 'madre', etiqueta: 'Madre', obligatorio: false },
]

export const CAMPOS_INMUEBLE: DefCampo<keyof Poder['inmueble']>[] = [
  { clave: 'direccion', etiqueta: 'Dirección', obligatorio: true },
  { clave: 'localidad', etiqueta: 'Localidad', obligatorio: true, mitad: true },
  { clave: 'provincia', etiqueta: 'Provincia', obligatorio: true, mitad: true },
  { clave: 'tipo', etiqueta: 'Tipo', obligatorio: false, mitad: true, formato: capitalizar },
  { clave: 'matricula', etiqueta: 'Matrícula', obligatorio: false, mitad: true },
  { clave: 'nomenclatura', etiqueta: 'Nomenclatura catastral', obligatorio: false },
]

export type Rol = 'otorgante' | 'apoderado'

export const tieneValor = (d: Dato | null | undefined) => !!d?.valor && d.valor.trim() !== ''

/** Partes del poder de un rol, con su índice original (los pendientes vienen como partes[i]). Sin rol → con los otorgantes. */
export function personasDeRol(poder: Poder, rol: Rol) {
  return poder.partes
    .map((persona, indice) => ({ persona, indice }))
    .filter(({ persona }) => (persona.rol.valor ?? 'otorgante') === rol)
}

const RE_PARTE = /^partes\[(\d+)\]/

/**
 * A qué parte (paso) va un pendiente. `partes` son los códigos que trajo actos_partes:
 * si el acto no tiene un paso para algo (ej. inmueble), va a revisión.
 */
export function parteDePendiente(p: Pendiente, poder: Poder, partes: string[]): string {
  const destino = (codigo: string) => (partes.includes(codigo) ? codigo : 'revision')

  const m = RE_PARTE.exec(p.campo) ?? RE_PARTE.exec(p.grupo)
  if (m) {
    const rol = poder.partes[Number(m[1])]?.rol.valor
    return destino(rol === 'apoderado' ? 'apoderados' : 'otorgantes')
  }

  switch (p.grupo) {
    case 'facultades':
      return destino('facultades')
    case 'condiciones':
      return destino('condiciones')
    case 'inmueble':
      return destino('inmueble')
    case 'estructura':
      if (p.campo === 'partes.otorgante') return destino('otorgantes')
      if (p.campo === 'partes.apoderado') return destino('apoderados')
      return 'revision'
    default:
      return 'revision'
  }
}

/** Pendientes agrupados por código de parte. */
export function pendientesPorParte(estado: EstadoPoder, poder: Poder, partes: string[]) {
  const mapa = new Map<string, Pendiente[]>()
  for (const codigo of partes) mapa.set(codigo, [])
  for (const p of estado.pendientes) {
    const destino = parteDePendiente(p, poder, partes)
    mapa.set(destino, [...(mapa.get(destino) ?? []), p])
  }
  return mapa
}

/** El pendiente de un campo puntual (ej. "partes[0].dni"), el más grave si hay varios. */
export function pendienteDe(pendientes: Pendiente[], campo: string): Pendiente | undefined {
  const gravedad = { inconsistente: 0, confirmar: 1, falta: 2 } as const
  return pendientes.filter((p) => p.campo === campo).sort((a, b) => gravedad[a.tipo] - gravedad[b.tipo])[0]
}

// --- Formatos ---

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
