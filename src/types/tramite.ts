// Contratos de /api/tramites.
import type { EstadoDatos } from './comun'
import type { Poder } from './poder'

export type EstadoTramite = 'en_curso' | 'listo' | 'confirmado'

/**
 * Respuesta de POST /api/tramites/{codigo}/mensajes (y de la creación).
 * `datos` son los datos del acto; hoy el único implementado es el poder.
 */
export interface RespuestaTramite {
  codigoTramite: string
  estadoTramite: EstadoTramite
  mensaje: string
  estado: EstadoDatos
  datos: Poder
  detalle: unknown
}

/** Una fila de GET /api/tramites (historial). */
export interface TramiteResumen {
  codigoTramite: string
  /** Código del acto (tabla actos): 'poder', 'compraventa'... */
  tipoTramite: string
  nombreActo: string
  estado: EstadoTramite
  /** Primer mensaje del usuario, recortado. */
  descripcion: string | null
  cantidadMensajes: number
  createdAt: string
  updatedAt: string
}

export interface FiltroTramites {
  /** true = incluye los confirmados. */
  todos: boolean
  /** Código del acto, o null para todos. */
  tipo: string | null
}

/** Mensaje guardado en chat_mensajes. */
export interface MensajeGuardado {
  rol: 'usuario' | 'asistente'
  texto: string
  createdAt: string
}

/** GET /api/tramites/{codigo}: el trámite como está, para retomarlo. */
export interface TramiteDetalle {
  codigoTramite: string
  tipoTramite: string
  estadoTramite: EstadoTramite
  datos: Poder
  estado: EstadoDatos
  mensajes: MensajeGuardado[]
}
