import { useMutation } from '@pinia/colada'
import { asistenteApi } from '@/api/asistente'
import { tramitesApi } from '@/api/tramites'
import { useChatStore } from '@/stores/chat'
import type { RespuestaAsistente } from '@/types/asistente'
import type { RespuestaTramite } from '@/types/tramite'

export interface EnvioMensaje {
  texto: string
  /** Acto elegido de una aclaración: el back no clasifica. */
  acto?: string
  /** Lo que se muestra como mensaje del usuario (ej. "Poder" al tocar la opción). Default: texto. */
  etiqueta?: string
}

type Resultado =
  | { via: 'asistente'; respuesta: RespuestaAsistente }
  | { via: 'tramite'; respuesta: RespuestaTramite }

/**
 * Envía un mensaje al lugar que corresponde:
 * - sin trámite → /api/asistente/mensajes (el back clasifica y, si está claro, crea el trámite)
 * - con trámite → /api/tramites/{codigo}/mensajes
 */
export function useEnviarMensaje() {
  const chat = useChatStore()

  return useMutation({
    mutation: async (envio: EnvioMensaje): Promise<Resultado> => {
      if (chat.codigoTramite) {
        return { via: 'tramite', respuesta: await tramitesApi.enviarMensaje(chat.codigoTramite, envio.texto) }
      }
      return { via: 'asistente', respuesta: await asistenteApi.enviar(envio.texto, envio.acto) }
    },

    onMutate(envio) {
      chat.agregarUsuario(envio.etiqueta ?? envio.texto)
    },

    onSuccess(resultado, envio) {
      if (resultado.via === 'tramite') chat.aplicarRespuestaTramite(resultado.respuesta)
      else chat.aplicarRespuestaAsistente(resultado.respuesta, envio.texto)
    },

    onError(error) {
      chat.agregarError(`No pude procesar el mensaje: ${error.message}`)
    },
  })
}
