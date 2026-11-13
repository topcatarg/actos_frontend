<script setup lang="ts">
// Historial de trámites: por defecto los abiertos, con su acto y estado. Al elegir uno se retoma
// la conversación donde quedó. No sabe nada de ningún acto en particular: sirve para cualquiera.
import { computed, reactive } from 'vue'
import { useInicio } from '@/queries/asistente'
import { useRetomarTramite, useTramites } from '@/queries/tramites'
import { useChatStore } from '@/stores/chat'
import type { FiltroTramites, TramiteResumen } from '@/types/tramite'

const abierto = defineModel<boolean>('abierto', { required: true })

const chat = useChatStore()

const filtro = reactive<FiltroTramites>({ todos: false, tipo: null })

const tramites = useTramites(() => ({ ...filtro }), () => abierto.value)
const retomar = useRetomarTramite()

// Los actos para el filtro salen del mismo catálogo del inicio (tabla actos)
const inicio = useInicio()
const actos = computed(() => (inicio.data.value?.opciones ?? []).filter((o) => o.tipo === 'acto'))

const ESTADO = { en_curso: 'En curso', listo: 'Listo', confirmado: 'Confirmado' } as const

async function elegir(t: TramiteResumen) {
  if (t.codigoTramite === chat.codigoTramite) {
    abierto.value = false
    return
  }
  try {
    await retomar.mutateAsync(t.codigoTramite)
    abierto.value = false
  } catch {
    // El error queda en retomar.error y se muestra en el modal
  }
}

function cuando(iso: string) {
  const fecha = new Date(iso)
  const hoy = new Date()
  const mismoDia = fecha.toDateString() === hoy.toDateString()
  return mismoDia
    ? `Hoy ${fecha.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}`
    : fecha.toLocaleString('es-AR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' })
}
</script>

<template>
  <Teleport to="body">
    <div v-if="abierto" class="modal-fondo" @click.self="abierto = false">
      <div class="modal" role="dialog" aria-labelledby="historial-titulo">
        <header class="modal-header">
          <h2 id="historial-titulo">📂 Trámites</h2>
          <button class="cerrar" title="Cerrar" @click="abierto = false">✕</button>
        </header>

        <div class="filtros">
          <div class="segmentado" role="group" aria-label="Qué trámites mostrar">
            <button :class="{ activo: !filtro.todos }" @click="filtro.todos = false">Abiertos</button>
            <button :class="{ activo: filtro.todos }" @click="filtro.todos = true">Todos</button>
          </div>
          <select v-model="filtro.tipo" aria-label="Acto">
            <option :value="null">Todos los actos</option>
            <option v-for="a in actos" :key="a.codigo" :value="a.codigo">{{ a.nombre }}</option>
          </select>
        </div>

        <div class="modal-body">
          <p v-if="retomar.error.value" class="error">No pude abrir el trámite: {{ retomar.error.value.message }}</p>

          <p v-if="tramites.isLoading.value && !tramites.data.value" class="nota">Cargando trámites…</p>
          <div v-else-if="tramites.error.value" class="error">
            {{ tramites.error.value.message }}
            <button class="btn btn-secondary" @click="tramites.refetch()">Reintentar</button>
          </div>
          <p v-else-if="!tramites.data.value?.length" class="nota">
            {{ filtro.todos ? 'Todavía no hay trámites.' : 'No hay trámites abiertos.' }}
            Escribí un pedido en el chat para empezar uno.
          </p>

          <ul v-else class="lista">
            <li v-for="t in tramites.data.value" :key="t.codigoTramite">
              <button
                class="tramite"
                :class="{ actual: t.codigoTramite === chat.codigoTramite }"
                :disabled="retomar.isLoading.value"
                @click="elegir(t)"
              >
                <div class="fila">
                  <span class="acto">{{ t.nombreActo }}</span>
                  <span class="datos-chip" :class="`estado-${t.estado}`">{{ ESTADO[t.estado] ?? t.estado }}</span>
                  <span class="cuando" :title="`Creado ${cuando(t.createdAt)}`">{{ cuando(t.updatedAt) }}</span>
                </div>
                <div v-if="t.descripcion" class="descripcion">{{ t.descripcion }}</div>
                <div class="pie">
                  <span class="codigo">{{ t.codigoTramite }}</span>
                  <span v-if="t.codigoTramite === chat.codigoTramite" class="marca">Es el actual</span>
                  <span v-else-if="retomar.isLoading.value" class="marca">…</span>
                </div>
              </button>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.modal-fondo {
  position: fixed; inset: 0; z-index: 1000;
  background: rgba(15, 23, 42, 0.45);
  display: flex; align-items: center; justify-content: center; padding: 20px;
}
.modal {
  background: white; border-radius: 14px; width: min(620px, 100%); max-height: 90vh;
  display: flex; flex-direction: column; box-shadow: 0 20px 50px rgba(0, 0, 0, 0.25);
}
.modal-header {
  display: flex; justify-content: space-between; align-items: center;
  padding: 16px 20px; border-bottom: 1px solid #e2e8f0;
}
.modal-header h2 { font-size: 17px; color: #1e293b; }
.cerrar { background: none; border: none; font-size: 18px; cursor: pointer; color: #64748b; }

.filtros {
  display: flex; gap: 10px; align-items: center; justify-content: space-between; flex-wrap: wrap;
  padding: 12px 20px; border-bottom: 1px solid #f1f5f9;
}
.segmentado { display: inline-flex; border: 1px solid #cbd5e1; border-radius: 8px; overflow: hidden; }
.segmentado button {
  background: white; border: none; padding: 6px 14px; font: inherit; font-size: 13px;
  color: #475569; cursor: pointer;
}
.segmentado button + button { border-left: 1px solid #cbd5e1; }
.segmentado button.activo { background: #2563eb; color: white; }
.filtros select {
  font: inherit; font-size: 13px; padding: 6px 10px; border: 1px solid #cbd5e1; border-radius: 8px;
  background: white; color: #1e293b;
}

.modal-body { padding: 12px 20px 20px; overflow-y: auto; }
.lista { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 8px; }

.tramite {
  width: 100%; text-align: left; font: inherit; cursor: pointer;
  background: white; border: 1px solid #e2e8f0; border-radius: 10px; padding: 10px 12px;
  display: flex; flex-direction: column; gap: 4px;
}
.tramite:hover:not(:disabled) { border-color: #93c5fd; background: #f8fafc; }
.tramite:focus-visible { outline: 2px solid #2563eb; outline-offset: 2px; }
.tramite:disabled { cursor: wait; opacity: 0.7; }
.tramite.actual { border-color: #3b82f6; background: #eff6ff; }

.fila { display: flex; align-items: center; gap: 8px; }
.acto { font-size: 14px; font-weight: 600; color: #1e293b; }
.cuando { margin-left: auto; font-size: 12px; color: #64748b; white-space: nowrap; }
.descripcion {
  font-size: 13px; color: #334155; line-height: 1.4;
  display: -webkit-box; -webkit-line-clamp: 2; line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
}
.pie { display: flex; align-items: center; gap: 8px; }
.codigo { font-size: 11px; color: #94a3b8; font-family: ui-monospace, monospace; }
.marca { margin-left: auto; font-size: 11px; font-weight: 600; color: #2563eb; }

.nota { font-size: 13px; color: #64748b; }
.error { font-size: 13px; color: #dc2626; display: flex; gap: 10px; align-items: center; margin-bottom: 8px; }
</style>
