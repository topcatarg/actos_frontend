import { useMutation, useQuery, useQueryCache } from '@pinia/colada'
import { iaApi } from '@/api/ia'

export const iaKeys = {
  modelos: ['ia', 'modelos'] as const,
  pruebas: ['ia', 'pruebas'] as const,
}

export function useModelosIa() {
  return useQuery({ key: iaKeys.modelos, query: iaApi.modelos })
}

export function usePruebasConexion(enabled: () => boolean = () => true) {
  return useQuery({ key: iaKeys.pruebas, query: () => iaApi.pruebas(10), enabled })
}

export function useSeleccionarModelo() {
  const cache = useQueryCache()
  return useMutation({
    mutation: (modelo: string) => iaApi.seleccionar(modelo),
    // La respuesta ya trae el estado nuevo: lo pisamos en la cache sin refetch.
    onSuccess: (estado) => cache.setQueryData(iaKeys.modelos, estado),
  })
}

export function useProbarConexion() {
  const cache = useQueryCache()
  return useMutation({
    mutation: (modelo?: string) => iaApi.probar(modelo),
    onSettled: () => cache.invalidateQueries({ key: iaKeys.pruebas }),
  })
}
