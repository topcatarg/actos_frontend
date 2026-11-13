import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { OpcionActo, RespuestaAsistente } from '@/types/asistente'
import type { RespuestaTramite } from '@/types/tramite'

export type TipoMensaje = 'texto' | 'ayuda' | 'aclaracion' | 'no_disponible' | 'error'

export interface MensajeChat {
  id: number
  rol: 'usuario' | 'asistente'
  texto: string
  tipo: TipoMensaje
  /** Opciones para elegir (aclaración) o para mostrar (ayuda). */
  opciones?: OpcionActo[]
  /** En una aclaración: el pedido original, para reenviarlo con el acto elegido. */
  textoOriginal?: string
}

/** Estado de la conversación actual. Las llamadas al back están en useEnviarMensaje. */
export const useChatStore = defineStore('chat', () => {
  const mensajes = ref<MensajeChat[]>([])
  const codigoTramite = ref<string | null>(null)
  const acto = ref<string | null>(null)
  /** Última respuesta del trámite (la va a usar el panel de datos). */
  const tramite = ref<RespuestaTramite | null>(null)
  /** Código de la parte (paso) que se está viendo: 'otorgantes', 'facultades'... */
  const parteActiva = ref<string | null>(null)

  let proximoId = 1

  const hayTramite = computed(() => codigoTramite.value !== null)
  const ultimoMensaje = computed(() => mensajes.value.at(-1))

  function agregar(m: Omit<MensajeChat, 'id'>) {
    mensajes.value.push({ id: proximoId++, ...m })
  }

  function agregarUsuario(texto: string) {
    agregar({ rol: 'usuario', texto, tipo: 'texto' })
  }

  function agregarError(texto: string) {
    agregar({ rol: 'asistente', texto, tipo: 'error' })
  }

  /** Ayuda armada en el front con las opciones del inicio (sin ir al back). */
  function mostrarAyuda(texto: string, opciones: OpcionActo[]) {
    agregar({ rol: 'asistente', texto, tipo: 'ayuda', opciones })
  }

  /** Respuesta al primer mensaje: puede crear el trámite o pedir aclaración. */
  function aplicarRespuestaAsistente(r: RespuestaAsistente, textoOriginal: string) {
    if (r.tipo === 'tramite' && r.tramite) {
      aplicarRespuestaTramite(r.tramite)
      acto.value = r.acto
      return
    }
    agregar({
      rol: 'asistente',
      texto: r.mensaje,
      tipo: r.tipo === 'ayuda' || r.tipo === 'aclaracion' || r.tipo === 'no_disponible' ? r.tipo : 'texto',
      opciones: r.opciones ?? undefined,
      textoOriginal: r.tipo === 'aclaracion' ? textoOriginal : undefined,
    })
  }

  function aplicarRespuestaTramite(r: RespuestaTramite) {
    codigoTramite.value = r.codigoTramite
    tramite.value = r
    agregar({ rol: 'asistente', texto: r.mensaje, tipo: 'texto' })
  }

  function seleccionarParte(codigo: string) {
    parteActiva.value = codigo
  }

  function reset() {
    mensajes.value = []
    codigoTramite.value = null
    acto.value = null
    tramite.value = null
    parteActiva.value = null
  }

  return {
    mensajes, codigoTramite, acto, tramite, parteActiva, hayTramite, ultimoMensaje,
    agregarUsuario, agregarError, mostrarAyuda, aplicarRespuestaAsistente, aplicarRespuestaTramite,
    seleccionarParte, reset,
  }
})
