import { http } from './http'
import type { Inicio, RespuestaAsistente } from '@/types/asistente'

export const asistenteApi = {
  inicio: () => http<Inicio>('/api/asistente/inicio'),

  /** Primer mensaje de una conversación. Si viene `acto`, el back no clasifica y usa ese. */
  enviar: (texto: string, acto?: string) =>
    http<RespuestaAsistente>('/api/asistente/mensajes', {
      method: 'POST',
      body: JSON.stringify({ texto, acto }),
    }),
}
