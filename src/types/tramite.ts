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
