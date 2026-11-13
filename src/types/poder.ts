// Forma del poder y de su estado tal como los devuelve el back (Poderes/PoderExtraccion.cs y MotorFaltantes.cs).

/** De dónde salió un dato. */
export type Origen = 'texto' | 'inferido' | 'respuesta' | 'confirmado' | 'base' | 'default'

export interface Dato {
  valor: string | null
  /** Pedazo literal del texto de donde salió. */
  fragmento: string | null
  inicio: number | null
  origen: Origen | null
}

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

export interface InmueblePoder {
  direccion: Dato
  localidad: Dato
  provincia: Dato
  matricula: Dato
  nomenclatura: Dato
  tipo: Dato
}

export interface Poder {
  tipoPoder: Dato // general | especial
  partes: PersonaPoder[]
  facultades: Dato[] // códigos de clausulas_template
  sustitucion: Dato
  vigencia: Dato
  fechaVigencia: Dato
  revocabilidad: Dato
  inmueble: InmueblePoder
  generacionConfirmada: boolean
  /** Poder especial sobre un inmueble: hay que pedir sus datos (lo calcula el back con el catálogo). */
  requiereInmueble: boolean
}

export type TipoPendiente = 'inconsistente' | 'confirmar' | 'falta'

export interface Pendiente {
  tipo: TipoPendiente
  /** estructura | roles | partes[i] | facultades | inmueble | condiciones | generar */
  grupo: string
  /** Ruta del dato: partes[1].dni, sustitucion, inmueble.direccion, facultades... */
  campo: string
  etiqueta: string
  detalle: string | null
}

export interface EstadoPoder {
  pendientes: Pendiente[]
  /** Lo que el asistente está preguntando ahora. */
  siguiente: Pendiente[]
  puedeGuardarBorrador: boolean
  listoParaGenerar: boolean
  generarDocumento: boolean
}
