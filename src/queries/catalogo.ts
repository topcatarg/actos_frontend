import { computed } from 'vue'
import { useQuery } from '@pinia/colada'
import { catalogoApi } from '@/api/catalogo'
import { useChatStore } from '@/stores/chat'

/** Facultades y condiciones del acto actual, con un índice código → nombre. */
export function useClausulas() {
  const chat = useChatStore()
  const query = useQuery({
    key: () => ['catalogo', 'clausulas', chat.acto ?? ''],
    query: () => catalogoApi.clausulas(chat.acto!),
    enabled: () => !!chat.acto,
    staleTime: Infinity,
  })

  const nombres = computed(() => new Map((query.data.value ?? []).map((c) => [c.codigo, c.nombre])))
  const nombre = (codigo: string | null | undefined) => (codigo ? (nombres.value.get(codigo) ?? codigo) : '')

  return { ...query, nombre }
}
