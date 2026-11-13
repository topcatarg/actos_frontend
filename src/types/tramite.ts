// Contratos de /api/tramites.
import type { EstadoPoder, Poder } from './poder'

export type EstadoTramite = 'en_curso' | 'listo' | 'confirmado'

/** Respuesta de POST /api/tramites/{codigo}/mensajes (y de la creación). Por ahora el único acto es el poder. */
export interface RespuestaTramite {
  codigoTramite: string
  estadoTramite: EstadoTramite
  mensaje: string
  estado: EstadoPoder
  poder: Poder
  detalle: unknown
}
