import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { OpcionActo, RespuestaAsistente } from '@/types/asistente'
import type { RespuestaTramite, TramiteDetalle } from '@/types/tramite'

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
  /** Modal del historial de trámites: lo abre el botón del header o el asistente (respuesta "historial"). */
  const historialAbierto = ref(false)

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
    if (r.tipo === 'historial') {
      agregar({ rol: 'asistente', texto: r.mensaje, tipo: 'texto' })
      historialAbierto.value = true
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

  /**
   * Retomar un trámite guardado (desde el historial): reemplaza la conversación actual por la guardada.
   * Lo que se pierde es solo lo que no estaba en un trámite (ej. una aclaración sin responder):
   * el trámite actual, si había, ya está en la base.
   */
  function cargarTramite(t: TramiteDetalle) {
    const mismoActo = acto.value === t.tipoTramite

    mensajes.value = t.mensajes.map((m) => ({ id: proximoId++, rol: m.rol, texto: m.texto, tipo: 'texto' as const }))
    codigoTramite.value = t.codigoTramite
    acto.value = t.tipoTramite

    const ultimaRespuesta = [...t.mensajes].reverse().find((m) => m.rol === 'asistente')
    tramite.value = {
      codigoTramite: t.codigoTramite,
      estadoTramite: t.estadoTramite,
      mensaje: ultimaRespuesta?.texto ?? '',
      estado: t.estado,
      datos: t.datos,
      detalle: null,
    }

    // Con otro acto, las pestañas cambian: el sidebar elige la primera cuando llegan.
    // Con el mismo acto, la pestaña que se estaba viendo sigue valiendo.
    if (!mismoActo) parteActiva.value = null
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
    mensajes, codigoTramite, acto, tramite, parteActiva, historialAbierto, hayTramite, ultimoMensaje,
    agregarUsuario, agregarError, mostrarAyuda, aplicarRespuestaAsistente, aplicarRespuestaTramite,
    cargarTramite, seleccionarParte, reset,
  }
})
