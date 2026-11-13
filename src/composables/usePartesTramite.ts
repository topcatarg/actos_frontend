import { computed } from 'vue'
import { usePartesActo } from '@/queries/actos'
import { useChatStore } from '@/stores/chat'
import { pendientesPorParte } from '@/actos/poder'
import type { Pendiente } from '@/types/poder'

export interface PasoTramite {
  codigo: string
  nombre: string
  numero: number
  pendientes: Pendiente[]
  completa: boolean
}

/** Partes del acto actual con sus pendientes. Lo usan el sidebar y el panel de datos. */
export function usePartesTramite() {
  const chat = useChatStore()
  const partes = usePartesActo(() => chat.acto)

  const codigos = computed(() => (partes.data.value ?? []).map((p) => p.codigo))

  const porParte = computed(() =>
    chat.tramite
      ? pendientesPorParte(chat.tramite.estado, chat.tramite.poder, codigos.value)
      : new Map<string, Pendiente[]>(),
  )

  const pasos = computed<PasoTramite[]>(() =>
    (partes.data.value ?? []).map((p, i) => {
      const pendientes = porParte.value.get(p.codigo) ?? []
      const completa = !!chat.tramite && (p.codigo === 'revision' ? chat.tramite.estado.listoParaGenerar : pendientes.length === 0)
      return { ...p, numero: i + 1, pendientes, completa }
    }),
  )

  const pasoActivo = computed(() => pasos.value.find((p) => p.codigo === chat.parteActiva) ?? null)

  return { partes, pasos, pasoActivo }
}
