// Datos propios del poder (espejo de actos_backend/Poderes/PoderExtraccion.cs).
// Lo común a cualquier acto (Dato, Pendiente, bloques) está en types/comun.ts.
import type { Dato, DatosActo, EstadoDatos } from './comun'

export type { Dato, Origen, Pendiente, TipoPendiente } from './comun'

export interface CandidatoPersona {
  pfId: number
  nombreCompleto: string
  dni: string | null
  coincidencias: number
}

export interface PersonaPoder {
  rol: Dato // otorgante | apoderado
  /** Siempre "nombres apellido" (lo arma el back). */
  nombreCompleto: Dato
  nombres: Dato
  /** Nunca se adivina: si no está claro, viene vacío y el asistente lo pregunta. */
  apellido: Dato
  dni: Dato
  cuil: Dato
  estadoCivil: Dato
  nacionalidad: Dato
  fechaNacimiento: Dato
  domicilio: Dato
  padre: Dato
  madre: Dato
  genero: Dato // M | F
  pfId: number | null
  personaNueva: boolean
  candidatos: CandidatoPersona[]
}

export interface Poder extends DatosActo {
  tipoPoder: Dato // general | especial | bancario | judicial | administrativo
  partes: PersonaPoder[]
  facultades: Dato[] // códigos de clausulas_template
  sustitucion: Dato
  vigencia: Dato
  fechaVigencia: Dato
  revocabilidad: Dato
}

export type EstadoPoder = EstadoDatos
