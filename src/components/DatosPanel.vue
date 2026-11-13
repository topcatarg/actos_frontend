<script setup lang="ts">
// Columna derecha: los datos del trámite, por pestaña, para validarlos (solo lectura: se corrige desde el chat).
// Qué se muestra depende del BLOQUE de la pestaña, no del acto: el mismo bloque (ej. vehículo) se ve
// igual en un poder o en una compraventa.
import { computed } from 'vue'
import PanelPersonas from './datos/PanelPersonas.vue'
import PanelFacultades from './datos/PanelFacultades.vue'
import PanelCondiciones from './datos/PanelCondiciones.vue'
import PanelRevision from './datos/PanelRevision.vue'
import PanelBloque from './bloques/PanelBloque.vue'
import { BLOQUES } from '@/bloques'
import { useChatStore } from '@/stores/chat'
import { usePartesTramite } from '@/composables/usePartesTramite'
import { capitalizar } from '@/comun/campos'

const chat = useChatStore()
const { pasos, pasoActivo } = usePartesTramite()

const tramite = computed(() => chat.tramite)
const pendientes = computed(() => pasoActivo.value?.pendientes ?? [])

/** La primera pestaña de personas muestra también a las que todavía no tienen rol. */
const esPrimeraPersona = computed(() => pasos.value.find((p) => p.bloque === 'persona')?.codigo === pasoActivo.value?.codigo)

const ESTADO_TRAMITE = { en_curso: 'En curso', listo: 'Listo', confirmado: 'Confirmado' } as const

// Badges compactos como el HTML original: un resumen de cada pestaña
const badges = computed(() =>
  pasos.value
    .filter((p) => p.bloque !== 'revision')
    .map((p) => ({
      codigo: p.codigo,
      texto: p.completa ? `${p.nombre} ✓` : `${p.nombre} · ${p.pendientes.length} pend.`,
      ok: p.completa,
    })),
)

const VISTAS = ['persona', 'facultades', 'condiciones', 'revision']
const tieneVista = computed(() => !!pasoActivo.value && (VISTAS.includes(pasoActivo.value.bloque) || !!BLOQUES[pasoActivo.value.bloque]))
</script>

<template>
  <div class="form-panel">
    <div class="form-header">
      <div class="form-header-top" style="flex-direction: column; align-items: stretch; gap: 10px; margin-bottom: 0">
        <div class="datos-titulo-fila">
          <div class="form-title">{{ pasoActivo?.nombre ?? 'Datos del acto' }}</div>
          <span v-if="tramite" class="datos-chip" :class="`estado-${tramite.estadoTramite}`">
            {{ ESTADO_TRAMITE[tramite.estadoTramite] }}
          </span>
        </div>
        <div v-if="tramite" class="datos-chips">
          <span v-if="tramite.datos.tipoPoder?.valor" class="datos-chip datos-chip-neutro">
            {{ capitalizar(tramite.datos.tipoPoder.valor) }}
          </span>
          <span
            v-for="b in badges"
            :key="b.codigo"
            class="datos-chip datos-badge"
            :class="b.ok ? 'badge-ok' : 'badge-pendiente'"
            @click="chat.seleccionarParte(b.codigo)"
          >
            {{ b.texto }}
          </span>
        </div>
      </div>
    </div>

    <div class="form-content">
      <div v-if="!tramite" class="seccion expanded">
        <p class="datos-vacio">Los datos del acto van a aparecer acá a medida que avance la conversación.</p>
      </div>

      <template v-else-if="pasoActivo">
        <!-- Lo que hay que resolver en esta pestaña -->
        <div v-if="pendientes.length && pasoActivo.bloque !== 'revision'" class="datos-pendientes">
          <div class="datos-pendientes-titulo">Para validar en este paso</div>
          <ul>
            <li v-for="(p, i) in pendientes" :key="i">
              <span class="datos-chip" :class="`pend-${p.tipo}`">
                {{ p.tipo === 'falta' ? 'Falta' : p.tipo === 'confirmar' ? 'Confirmar' : 'Revisar' }}
              </span>
              <span>{{ p.etiqueta }}</span>
            </li>
          </ul>
        </div>

        <PanelPersonas
          v-if="pasoActivo.bloque === 'persona'"
          :datos="tramite.datos"
          :rol="pasoActivo.rol"
          :incluir-sin-rol="esPrimeraPersona"
          :pendientes="pendientes"
        />
        <PanelFacultades v-else-if="pasoActivo.bloque === 'facultades'" :datos="tramite.datos" :pendientes="pendientes" />
        <PanelCondiciones v-else-if="pasoActivo.bloque === 'condiciones'" :datos="tramite.datos" :pendientes="pendientes" />
        <PanelRevision
          v-else-if="pasoActivo.bloque === 'revision'"
          :datos="tramite.datos"
          :estado="tramite.estado"
          :pendientes="pendientes"
          :pasos="pasos"
        />
        <!-- Bloques de datos: su componente propio, o el genérico -->
        <component
          :is="BLOQUES[pasoActivo.bloque]!.componente ?? PanelBloque"
          v-else-if="BLOQUES[pasoActivo.bloque]"
          :key="pasoActivo.codigo"
          :def="BLOQUES[pasoActivo.bloque]!"
          :datos="tramite.datos"
          :pendientes="pendientes"
        />
        <div v-if="!tieneVista" class="seccion expanded">
          <p class="datos-vacio">Todavía no hay una vista para el bloque «{{ pasoActivo.bloque }}».</p>
        </div>
      </template>
    </div>

    <div class="datos-acciones">
      <!-- TODO: conectar cuando existan los endpoints de borrador y generación -->
      <button class="btn btn-secondary" :disabled="!tramite?.estado.puedeGuardarBorrador" title="Próximamente">
        Guardar borrador
      </button>
      <button class="btn btn-primary" :disabled="!tramite?.estado.listoParaGenerar" title="Próximamente">
        Generar documento
      </button>
    </div>
  </div>
</template>

<!-- Sin scoped: estilos compartidos por los paneles de datos (components/datos) -->
<style>
.datos-titulo-fila { display: flex; justify-content: space-between; align-items: center; gap: 8px; }
.datos-chips { display: flex; gap: 6px; flex-wrap: wrap; align-items: center; }
.datos-chip {
  display: inline-block; padding: 2px 10px; border-radius: 12px;
  font-size: 11px; font-weight: 600; white-space: nowrap;
}
.datos-chip-neutro { background: #e0e7ff; color: #3730a3; }
.datos-badge { cursor: pointer; }
.badge-ok { background: #dcfce7; color: #16a34a; }
.badge-pendiente { background: #fef9c3; color: #92400e; }
.estado-en_curso { background: #dbeafe; color: #2563eb; }
.estado-listo { background: #fef3c7; color: #92400e; }
.estado-confirmado { background: #dcfce7; color: #16a34a; }

.pend-falta { background: #fef3c7; color: #d97706; }
.pend-confirmar { background: #e0f2fe; color: #0369a1; }
.pend-inconsistente { background: #fee2e2; color: #dc2626; }

.datos-grid { grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); align-items: end; }
.datos-grid .field { grid-column: span 2; min-width: 0; }
.datos-grid .field.half { grid-column: span 1; }

.datos-campo-estado { display: flex; align-items: center; gap: 4px; flex-shrink: 0; }
.datos-grid .field-header { gap: 4px 6px; flex-wrap: wrap; }
.datos-grid .field-display { overflow-wrap: anywhere; }
.datos-confirmar { border-color: #38bdf8 !important; background: #f0f9ff !important; }
.datos-inconsistente { border-color: #f87171 !important; background: #fef2f2 !important; }
.datos-origen {
  flex-shrink: 0; font-size: 10px; font-weight: 600; padding: 1px 6px; border-radius: 8px;
  font-style: normal;
}
.origen-texto { background: #dbeafe; color: #1d4ed8; }
.origen-inferido { background: #fef3c7; color: #92400e; }
.origen-respuesta { background: #ede9fe; color: #6d28d9; }
.origen-confirmado { background: #dcfce7; color: #15803d; }
.origen-base { background: #ccfbf1; color: #0f766e; }
.origen-default { background: #f1f5f9; color: #64748b; }
.datos-detalle { font-size: 12px; color: #64748b; margin-top: 2px; }
.datos-vacio { color: #94a3b8; text-align: center; padding: 40px 20px; font-size: 14px; }
.datos-ok { font-size: 13px; color: #16a34a; font-weight: 600; }

.datos-pendientes {
  background: white; border-radius: 12px; padding: 12px 16px; margin-bottom: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1); border-left: 3px solid #f59e0b;
}
.datos-pendientes-titulo { font-size: 12px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.4px; margin-bottom: 8px; }
.datos-pendientes ul { list-style: none; display: flex; flex-direction: column; gap: 6px; font-size: 13px; color: #1e293b; }
.datos-pendientes li { display: flex; gap: 8px; align-items: center; }

.datos-persona { margin-bottom: 8px; }
.datos-persona-header {
  display: flex; justify-content: space-between; align-items: center; gap: 8px; flex-wrap: wrap;
  margin: 4px 2px 10px;
}
.datos-persona-header h3 { font-size: 15px; font-weight: 600; color: #1e293b; }
.datos-candidatos { list-style: none; display: flex; flex-direction: column; gap: 6px; margin-top: 8px; }
.datos-candidatos li {
  display: flex; justify-content: space-between; padding: 8px 12px; font-size: 13px;
  background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px;
}

.datos-categoria { margin-bottom: 14px; }
.datos-categoria-titulo { margin-bottom: 6px; color: #1e293b; }
.datos-facultad {
  display: flex; align-items: center; gap: 10px; padding: 8px 10px; border-radius: 8px;
  font-size: 13px; color: #94a3b8;
}
.datos-facultad.elegida { color: #1e293b; background: #f8fafc; }
.datos-tilde {
  width: 18px; height: 18px; border-radius: 4px; border: 2px solid #cbd5e1; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700;
}
.datos-facultad.elegida .datos-tilde { border-color: #16a34a; background: #16a34a; color: white; }
.datos-facultad-nombre { flex: 1; }

.datos-resumen { display: grid; grid-template-columns: auto 1fr; gap: 8px 12px; font-size: 13px; }
.datos-resumen dt { color: #64748b; font-weight: 600; }
.datos-resumen dd { color: #1e293b; }
.datos-resumen dd.empty { color: #94a3b8; }
.datos-pasos-pendientes { margin-top: 8px; padding-left: 18px; font-size: 13px; color: #1e293b; }

.datos-acciones {
  display: flex; justify-content: flex-end; gap: 8px; padding: 16px 20px;
  border-top: 1px solid #e2e8f0; background: white;
}
</style>
