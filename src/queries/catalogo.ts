import { computed } from 'vue'
import { useQuery } from '@pinia/colada'
import { catalogoApi } from '@/api/catalogo'

/** Facultades y condiciones, con un índice código → nombre. */
export function useClausulas() {
  const query = useQuery({ key: ['catalogo', 'clausulas'], query: catalogoApi.clausulas, staleTime: Infinity })

  const nombres = computed(() => new Map((query.data.value ?? []).map((c) => [c.codigo, c.nombre])))
  const nombre = (codigo: string | null | undefined) => (codigo ? (nombres.value.get(codigo) ?? codigo) : '')

  return { ...query, nombre }
}
