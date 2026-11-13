<script setup lang="ts">
// Columna izquierda: logo, configuración de IA y, cuando ya hay un acto, el progreso y sus partes.
// Las partes vienen de la tabla actos_partes; su estado sale de los pendientes del trámite.
import { computed, ref, watch } from 'vue'
import ConfigIaModal from './ConfigIaModal.vue'
import { useModelosIa } from '@/queries/ia'
import { useInicio } from '@/queries/asistente'
import { usePartesTramite, type PasoTramite } from '@/composables/usePartesTramite'
import { useChatStore } from '@/stores/chat'

const chat = useChatStore()

const configAbierta = ref(false)
const modelos = useModelosIa()
const modeloEnUso = computed(() => {
  const d = modelos.data.value
  if (!d) return null
  return d.modelos.find((m) => m.modelo === d.enUso)?.nombre ?? d.enUso
})

// Nombre del acto ("Poder") a partir del catálogo que ya trajo el chat
const inicio = useInicio()
const nombreActo = computed(
  () => inicio.data.value?.opciones.find((o) => o.codigo === chat.acto)?.nombre ?? chat.acto,
)

const { partes, pasos } = usePartesTramite()

function estadoPaso(p: PasoTramite) {
  if (!chat.tramite) return 'Pendiente'
  if (p.completa) return 'Completo ✓'
  if (p.codigo === 'revision' && !p.pendientes.length) return 'Falta completar pasos'
  const n = p.pendientes.length
  return `${n} pendiente${n === 1 ? '' : 's'}`
}

const completos = computed(() => pasos.value.filter((p) => p.completa).length)
const faltan = computed(() => pasos.value.length - completos.value)
const porcentaje = computed(() => (pasos.value.length ? Math.round((completos.value / pasos.value.length) * 100) : 0))

const CIRCUNFERENCIA = 2 * Math.PI * 54
const offset = computed(() => CIRCUNFERENCIA * (1 - porcentaje.value / 100))

// Al llegar las partes de un acto nuevo, queda seleccionada la primera
watch(
  () => partes.data.value,
  (lista) => {
    if (lista?.length && !lista.some((p) => p.codigo === chat.parteActiva)) chat.seleccionarParte(lista[0]!.codigo)
  },
)
</script>

<template>
  <div class="sidebar">
    <div class="logo">
      <div class="logo-fila">
        <div>IA Notarial</div>
        <button class="config-ia" title="Configuración de IA" @click="configAbierta = true">⚙️</button>
      </div>
      <div style="font-size: 13px; font-weight: 400; opacity: 0.75">Tu aliado en cada Acto</div>
      <div v-if="modeloEnUso" class="modelo-en-uso" title="Modelo de IA en uso">🧠 {{ modeloEnUso }}</div>
    </div>

    <ConfigIaModal v-model:abierto="configAbierta" />

    <!-- Sin acto todavía no sabemos qué pasos mostrar -->
    <template v-if="chat.acto">
      <div class="progress-section">
        <div class="acto-actual">{{ nombreActo }}</div>
        <div class="progress-title">Progreso general</div>
        <div class="progress-circle">
          <svg width="120" height="120">
            <circle cx="60" cy="60" r="54" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="8" />
            <circle
              cx="60" cy="60" r="54" fill="none" stroke="white" stroke-width="8"
              :stroke-dasharray="CIRCUNFERENCIA" :stroke-dashoffset="offset" stroke-linecap="round"
            />
          </svg>
          <div class="progress-circle-text">{{ porcentaje }}%</div>
        </div>
        <div class="progress-stats">
          <div class="progress-stat">
            <div class="progress-stat-value">{{ completos }}</div>
            <div class="progress-stat-label">Completos</div>
          </div>
          <div class="progress-stat">
            <div class="progress-stat-value">{{ faltan }}</div>
            <div class="progress-stat-label">Faltan</div>
          </div>
        </div>
      </div>

      <div class="steps">
        <div v-if="partes.isLoading.value" class="aviso">Cargando pasos…</div>
        <div v-else-if="partes.error.value" class="aviso">⚠️ {{ partes.error.value.message }}</div>
        <div
          v-for="p in pasos"
          v-else
          :key="p.codigo"
          class="step"
          :class="{ active: p.codigo === chat.parteActiva, completa: p.completa }"
          @click="chat.seleccionarParte(p.codigo)"
        >
          <div class="step-number">{{ p.completa ? '✓' : p.numero }}</div>
          <div class="step-info">
            <div class="step-name">{{ p.nombre }}</div>
            <div class="step-status">{{ estadoPaso(p) }}</div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.logo-fila { display: flex; justify-content: space-between; align-items: center; }
.config-ia {
  background: rgba(255, 255, 255, 0.12); border: none; border-radius: 8px;
  width: 32px; height: 32px; cursor: pointer; font-size: 16px; transition: background 0.2s;
}
.config-ia:hover { background: rgba(255, 255, 255, 0.25); }
.modelo-en-uso { margin-top: 8px; font-size: 12px; font-weight: 400; opacity: 0.8; }
.acto-actual { font-size: 18px; font-weight: 700; margin-bottom: 12px; }
.aviso { font-size: 13px; opacity: 0.8; }
.progress-circle circle { transition: stroke-dashoffset 0.4s ease; }
.step.completa:not(.active) .step-number { background: rgba(134, 239, 172, 0.35); }
</style>
