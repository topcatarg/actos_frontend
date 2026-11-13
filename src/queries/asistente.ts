import { useQuery } from '@pinia/colada'
import { asistenteApi } from '@/api/asistente'

/** Bienvenida + catálogo de actos (tabla actos). Compartido entre el chat y el sidebar. */
export function useInicio() {
  return useQuery({
    key: ['asistente', 'inicio'],
    query: asistenteApi.inicio,
    staleTime: Infinity,
  })
}
