import { useMutation, useQuery } from '@pinia/colada'
import { tramitesApi } from '@/api/tramites'
import { useChatStore } from '@/stores/chat'
import type { FiltroTramites } from '@/types/tramite'

export const tramitesKeys = {
  raiz: ['tramites'] as const,
  lista: (f: FiltroTramites) => ['tramites', 'lista', f.todos ? 'todos' : 'abiertos', f.tipo ?? ''] as const,
}

/**
 * Historial de trámites. Solo consulta mientras `enabled` es true (ej. con el modal abierto);
 * al volver a abrirlo se refresca, así que no hace falta invalidar después de cada mensaje.
 */
export function useTramites(filtro: () => FiltroTramites, enabled: () => boolean = () => true) {
  return useQuery({
    key: () => tramitesKeys.lista(filtro()),
    query: () => tramitesApi.listar(filtro()),
    enabled,
    staleTime: 0,
  })
}

/** Trae el trámite con su conversación y lo deja como conversación actual. */
export function useRetomarTramite() {
  const chat = useChatStore()
  return useMutation({
    mutation: (codigo: string) => tramitesApi.obtener(codigo),
    onSuccess: (t) => chat.cargarTramite(t),
  })
}
