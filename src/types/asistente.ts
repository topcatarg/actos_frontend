// Contratos de /api/asistente
import type { RespuestaTramite } from './tramite'

export type TipoOpcion = 'acto' | 'consulta'

/** Fila de la tabla actos. */
export interface OpcionActo {
  codigo: string // 'poder', 'compraventa', 'consulta'...
  nombre: string
  descripcion: string
  ejemplo: string
  tipo: TipoOpcion
  habilitado: boolean
}

/** GET /api/asistente/inicio */
export interface Inicio {
  mensaje: string
  opciones: OpcionActo[]
}

/** Qué resolvió el back con el primer mensaje. */
export type TipoRespuestaAsistente = 'tramite' | 'ayuda' | 'aclaracion' | 'no_disponible'

/** POST /api/asistente/mensajes */
export interface RespuestaAsistente {
  tipo: TipoRespuestaAsistente
  mensaje: string
  /** Viene en ayuda y aclaracion. */
  opciones: OpcionActo[] | null
  acto: string | null
  /** Solo cuando tipo = 'tramite'. */
  tramite: RespuestaTramite | null
}
