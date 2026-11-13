import { http } from './http'
import type { RespuestaTramite } from '@/types/tramite'

export const tramitesApi = {
  enviarMensaje: (codigo: string, texto: string) =>
    http<RespuestaTramite>(`/api/tramites/${encodeURIComponent(codigo)}/mensajes`, {
      method: 'POST',
      body: JSON.stringify({ texto }),
    }),
}
