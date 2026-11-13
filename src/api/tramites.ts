import { http } from './http'
import type { FiltroTramites, RespuestaTramite, TramiteDetalle, TramiteResumen } from '@/types/tramite'

export const tramitesApi = {
  enviarMensaje: (codigo: string, texto: string) =>
    http<RespuestaTramite>(`/api/tramites/${encodeURIComponent(codigo)}/mensajes`, {
      method: 'POST',
      body: JSON.stringify({ texto }),
    }),

  /** Historial. Por defecto el back trae solo los abiertos. */
  listar: (filtro: FiltroTramites, limite = 50) => {
    const q = new URLSearchParams({ limite: String(limite) })
    if (filtro.todos) q.set('todos', 'true')
    if (filtro.tipo) q.set('tipo', filtro.tipo)
    return http<TramiteResumen[]>(`/api/tramites?${q}`)
  },

  /** El trámite con su conversación, para retomarlo. */
  obtener: (codigo: string) => http<TramiteDetalle>(`/api/tramites/${encodeURIComponent(codigo)}`),
}
