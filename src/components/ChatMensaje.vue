<script setup lang="ts">
import type { MensajeChat } from '@/stores/chat'
import type { OpcionActo } from '@/types/asistente'

defineProps<{
  mensaje: MensajeChat
  /** Solo el último mensaje deja elegir opciones; los viejos quedan como historial. */
  activo: boolean
}>()

const emit = defineEmits<{
  elegir: [opcion: OpcionActo, textoOriginal: string]
  usarEjemplo: [ejemplo: string]
}>()
</script>

<template>
  <div class="message" :class="mensaje.rol === 'usuario' ? 'user' : 'assistant'">
    <div class="message-avatar">{{ mensaje.rol === 'usuario' ? '👤' : mensaje.tipo === 'error' ? '⚠️' : '✨' }}</div>
    <div class="message-content">
      {{ mensaje.texto }}

      <!-- Aclaración: opciones para elegir y reenviar el pedido original con ese acto -->
      <div v-if="mensaje.tipo === 'aclaracion' && mensaje.opciones?.length" class="opciones">
        <button
          v-for="o in mensaje.opciones"
          :key="o.codigo"
          class="opcion"
          :disabled="!activo || !o.habilitado"
          :title="o.habilitado ? o.descripcion : 'Próximamente'"
          @click="emit('elegir', o, mensaje.textoOriginal ?? '')"
        >
          <strong>{{ o.nombre }}</strong>
          <span>{{ o.habilitado ? o.descripcion : 'Próximamente' }}</span>
        </button>
      </div>

      <!-- Ayuda: catálogo con ejemplos; tocar el ejemplo lo copia al input -->
      <ul v-if="mensaje.tipo === 'ayuda' && mensaje.opciones?.length" class="ayuda">
        <li v-for="o in mensaje.opciones" :key="o.codigo" :class="{ deshabilitada: !o.habilitado }">
          <div class="ayuda-titulo">
            <strong>{{ o.nombre }}</strong>
            <span v-if="!o.habilitado" class="proximamente">Próximamente</span>
          </div>
          <div class="ayuda-desc">{{ o.descripcion }}</div>
          <button
            v-if="o.ejemplo && o.habilitado"
            class="ejemplo"
            title="Usar este ejemplo"
            @click="emit('usarEjemplo', o.ejemplo)"
          >
            “{{ o.ejemplo }}”
          </button>
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.message.assistant .message-content:has(.ayuda),
.message.assistant .message-content:has(.opciones) { white-space: normal; }

.opciones { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 12px; }
.opcion {
  display: flex; flex-direction: column; align-items: flex-start; gap: 2px;
  padding: 10px 14px; background: white; border: 2px solid #e2e8f0; border-radius: 10px;
  cursor: pointer; font-family: inherit; text-align: left; transition: border-color 0.2s;
}
.opcion:hover:not(:disabled) { border-color: #3b82f6; }
.opcion:disabled { opacity: 0.5; cursor: not-allowed; }
.opcion strong { font-size: 14px; color: #1e293b; }
.opcion span { font-size: 12px; color: #64748b; }

.ayuda { list-style: none; margin-top: 12px; display: flex; flex-direction: column; gap: 10px; }
.ayuda li { background: white; border: 1px solid #e2e8f0; border-radius: 10px; padding: 10px 14px; }
.ayuda li.deshabilitada { opacity: 0.6; }
.ayuda-titulo { display: flex; align-items: center; gap: 8px; }
.ayuda-titulo strong { font-size: 14px; color: #1e293b; }
.proximamente { font-size: 11px; font-weight: 600; background: #fef3c7; color: #92400e; padding: 1px 8px; border-radius: 8px; }
.ayuda-desc { font-size: 12px; color: #64748b; margin-top: 2px; }
.ejemplo {
  margin-top: 6px; background: none; border: none; padding: 0; cursor: pointer;
  font-family: inherit; font-size: 13px; font-style: italic; color: #2563eb; text-align: left;
}
.ejemplo:hover { text-decoration: underline; }
</style>
