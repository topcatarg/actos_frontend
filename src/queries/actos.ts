import { useQuery } from '@pinia/colada'
import { actosApi } from '@/api/actos'

/** Partes del acto; no consulta nada mientras no haya acto. */
export function usePartesActo(acto: () => string | null) {
  return useQuery({
    key: () => ['actos', acto() ?? '', 'partes'],
    query: () => actosApi.partes(acto()!),
    enabled: () => !!acto(),
    staleTime: Infinity, // cambia solo si se edita la tabla
  })
}
