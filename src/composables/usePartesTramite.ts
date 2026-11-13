import { computed } from 'vue'
import { usePartesActo } from '@/queries/actos'
import { useChatStore } from '@/stores/chat'
import { pendientesPorParte } from '@/tramite/pendientes'
import type { ParteActo } from '@/types/actos'
import type { Pendiente } from '@/types/comun'

export interface PasoTramite extends ParteActo {
  numero: number
  pendientes: Pendiente[]
  completa: boolean
}

/**
 * Pestañas del acto actual con sus pendientes. Lo usan el sidebar y el panel de datos.
 * Con trámite, solo las que el back marcó como activas (ej. "Vehículos" aparece si el poder es para un auto).
 */
export function usePartesTramite() {
  const chat = useChatStore()
  const partes = usePartesActo(() => chat.acto)

  const visibles = computed(() => {
    const todas = partes.data.value ?? []
    const activas = chat.tramite?.datos.partesActivas
    return activas?.length ? todas.filter((p) => activas.includes(p.codigo)) : todas
  })

  const porParte = computed(() =>
    chat.tramite
      ? pendientesPorParte(chat.tramite.estado, chat.tramite.datos, visibles.value)
      : new Map<string, Pendiente[]>(),
  )

  const pasos = computed<PasoTramite[]>(() =>
    visibles.value.map((p, i) => {
      const pendientes = porParte.value.get(p.codigo) ?? []
      const completa = !!chat.tramite && (p.bloque === 'revision' ? chat.tramite.estado.listoParaGenerar : pendientes.length === 0)
      return { ...p, numero: i + 1, pendientes, completa }
    }),
  )

  const pasoActivo = computed(() => pasos.value.find((p) => p.codigo === chat.parteActiva) ?? null)

  return { partes, pasos, pasoActivo }
}
