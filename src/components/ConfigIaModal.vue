<script setup lang="ts">
import { computed } from 'vue'
import { useModelosIa, usePruebasConexion, useProbarConexion, useSeleccionarModelo } from '@/queries/ia'

const abierto = defineModel<boolean>('abierto', { required: true })

const modelos = useModelosIa()
const pruebas = usePruebasConexion(() => abierto.value)
const seleccionar = useSeleccionarModelo()
const probar = useProbarConexion()

const enUso = computed(() => modelos.data.value?.enUso)
const ultima = computed(() => probar.data.value)

function nombreDe(modelo: string) {
  return modelos.data.value?.modelos.find((m) => m.modelo === modelo)?.nombre ?? modelo
}

function formatoFecha(iso: string) {
  return new Date(iso).toLocaleString('es-AR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

function segundos(ms: number) {
  return `${(ms / 1000).toFixed(1)} s`
}
</script>

<template>
  <Teleport to="body">
    <div v-if="abierto" class="modal-fondo" @click.self="abierto = false">
      <div class="modal" role="dialog" aria-labelledby="config-ia-titulo">
        <header class="modal-header">
          <h2 id="config-ia-titulo">⚙️ Configuración de IA</h2>
          <button class="cerrar" title="Cerrar" @click="abierto = false">✕</button>
        </header>

        <div class="modal-body">
          <!-- Modelo -->
          <section>
            <h3>Modelo</h3>
            <p v-if="modelos.isLoading.value" class="nota">Cargando modelos…</p>
            <p v-else-if="modelos.error.value" class="error">{{ modelos.error.value.message }}</p>
            <template v-else-if="modelos.data.value">
              <p v-if="!modelos.data.value.modelos.some((m) => m.enUso)" class="nota">
                Ningún modelo de la tabla está en uso: se usa el de la configuración ({{ modelos.data.value.porDefecto }}).
              </p>
              <label
                v-for="m in modelos.data.value.modelos"
                :key="m.modelo"
                class="modelo"
                :class="{ actual: m.modelo === enUso }"
              >
                <input
                  type="radio"
                  name="modelo-ia"
                  :value="m.modelo"
                  :checked="m.modelo === enUso"
                  :disabled="seleccionar.isLoading.value"
                  @change="seleccionar.mutate(m.modelo)"
                />
                <div>
                  <div class="modelo-nombre">{{ m.nombre }} <code>{{ m.modelo }}</code></div>
                  <div class="modelo-desc">{{ m.descripcion }}</div>
                </div>
              </label>
              <p v-if="seleccionar.error.value" class="error">{{ seleccionar.error.value.message }}</p>
            </template>
          </section>

          <!-- Prueba -->
          <section>
            <h3>Conexión</h3>
            <button class="btn btn-primary" :disabled="probar.isLoading.value || !enUso" @click="probar.mutate(undefined)">
              {{ probar.isLoading.value ? 'Probando…' : `Probar ${enUso ? nombreDe(enUso) : ''}` }}
            </button>

            <div v-if="probar.error.value" class="resultado mal">{{ probar.error.value.message }}</div>
            <div v-else-if="ultima && !probar.isLoading.value" class="resultado" :class="ultima.ok ? 'bien' : 'mal'">
              <strong>{{ ultima.ok ? '✓ Funciona' : '✗ Falló' }}</strong> · {{ nombreDe(ultima.modelo) }} ·
              {{ segundos(ultima.duracionMs) }}
              <div v-if="ultima.respuesta" class="respuesta">“{{ ultima.respuesta }}”</div>
              <div v-if="ultima.error">
                {{ ultima.error }}<template v-if="ultima.statusProveedor"> (HTTP {{ ultima.statusProveedor }})</template>
              </div>
              <details v-if="ultima.detalle">
                <summary>Detalle del proveedor</summary>
                <pre>{{ ultima.detalle }}</pre>
              </details>
            </div>
          </section>

          <!-- Historial -->
          <section>
            <h3>Últimas pruebas</h3>
            <p v-if="!pruebas.data.value?.length" class="nota">Todavía no hay pruebas registradas.</p>
            <div v-else class="tabla-scroll">
              <table class="historial">
                <tbody>
                  <tr v-for="p in pruebas.data.value" :key="p.id" :title="p.error ?? p.respuesta ?? ''">
                    <td>{{ p.ok ? '✅' : '❌' }}</td>
                    <td>{{ formatoFecha(p.fecha) }}</td>
                    <td>{{ nombreDe(p.modelo) }}</td>
                    <td class="num">{{ segundos(p.duracionMs) }}</td>
                    <td class="motivo">{{ p.ok ? '' : p.statusProveedor ? `HTTP ${p.statusProveedor}` : p.error }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
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
  background: white; border-radius: 14px; width: min(560px, 100%); max-height: 90vh;
  display: flex; flex-direction: column; box-shadow: 0 20px 50px rgba(0, 0, 0, 0.25);
}
.modal-header {
  display: flex; justify-content: space-between; align-items: center;
  padding: 16px 20px; border-bottom: 1px solid #e2e8f0;
}
.modal-header h2 { font-size: 17px; color: #1e293b; }
.cerrar { background: none; border: none; font-size: 18px; cursor: pointer; color: #64748b; }
.modal-body { padding: 16px 20px 20px; overflow-y: auto; display: flex; flex-direction: column; gap: 20px; }
h3 { font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; color: #64748b; margin-bottom: 10px; }

.modelo {
  display: flex; gap: 10px; align-items: flex-start; padding: 10px 12px; margin-bottom: 8px;
  border: 2px solid #e2e8f0; border-radius: 10px; cursor: pointer;
}
.modelo.actual { border-color: #3b82f6; background: #eff6ff; }
.modelo input { margin-top: 3px; }
.modelo-nombre { font-size: 14px; font-weight: 600; color: #1e293b; }
.modelo-nombre code { font-size: 11px; font-weight: 400; color: #64748b; margin-left: 4px; }
.modelo-desc { font-size: 12px; color: #64748b; }

.resultado { margin-top: 12px; padding: 10px 12px; border-radius: 8px; font-size: 13px; line-height: 1.5; }
.resultado.bien { background: #dcfce7; color: #166534; }
.resultado.mal { background: #fee2e2; color: #991b1b; }
.respuesta { font-style: italic; margin-top: 4px; }
details { margin-top: 6px; }
pre { white-space: pre-wrap; word-break: break-word; font-size: 11px; max-height: 160px; overflow: auto; margin-top: 4px; }

.tabla-scroll { overflow-x: auto; }
.historial { width: 100%; border-collapse: collapse; font-size: 12px; }
.historial td { padding: 6px 8px; border-bottom: 1px solid #f1f5f9; white-space: nowrap; }
.historial .num { text-align: right; }
.historial .motivo { color: #991b1b; white-space: normal; }

.nota { font-size: 13px; color: #64748b; }
.error { font-size: 13px; color: #dc2626; }
</style>
