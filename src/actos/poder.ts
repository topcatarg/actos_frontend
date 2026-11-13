// Lo que el front sabe del poder: los campos de sus personas.
// Lo genérico (bloques, reparto de pendientes, formatos) está en bloques/, tramite/ y comun/.
import { capitalizar, formatoCuil, formatoDni, formatoFecha, formatoGenero, type DefCampo } from '@/comun/campos'
import type { Dato } from '@/types/comun'
import type { PersonaPoder, Poder } from '@/types/poder'

export type CampoPersona = Exclude<keyof PersonaPoder, 'pfId' | 'personaNueva' | 'candidatos' | 'rol'>

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

export const tieneValor = (d: Dato | null | undefined) => !!d?.valor && d.valor.trim() !== ''

/**
 * Personas de un rol, con su índice original (los pendientes vienen como partes[i]).
 * Las que todavía no tienen rol se muestran en la primera pestaña de personas.
 */
export function personasDeRol(datos: Poder, rol: string | null, incluirSinRol: boolean) {
  return datos.partes
    .map((persona, indice) => ({ persona, indice }))
    .filter(({ persona }) => (persona.rol.valor ? persona.rol.valor === rol : incluirSinRol))
}
