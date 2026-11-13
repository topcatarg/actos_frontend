<script setup lang="ts">
import { nextTick, onMounted, ref, watch } from 'vue'
import { useInicio } from '@/queries/asistente'
import { useChatStore } from '@/stores/chat'
import { useEnviarMensaje } from '@/composables/useEnviarMensaje'
import ChatMensaje from './ChatMensaje.vue'
import type { OpcionActo } from '@/types/asistente'

const chat = useChatStore()

// Bienvenida + catálogo (tabla actos). El catálogo se usa para la ayuda.
const inicio = useInicio()

const { mutate: enviar, isLoading: enviando } = useEnviarMensaje()

const texto = ref('')
const input = ref<HTMLTextAreaElement>()
const lista = ref<HTMLElement>()

function enviarTexto() {
  const t = texto.value.trim()
  if (!t || enviando.value) return
  enviar({ texto: t })
  texto.value = ''
  ajustarAltura()
}

function onKeydown(e: KeyboardEvent) {
  // Enter envía; Shift+Enter hace salto de línea
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    enviarTexto()
  }
}

function elegirOpcion(opcion: OpcionActo, textoOriginal: string) {
  enviar({ texto: textoOriginal, acto: opcion.codigo, etiqueta: opcion.nombre })
}

async function usarEjemplo(ejemplo: string) {
  texto.value = ejemplo
  await nextTick()
  ajustarAltura()
  enfocarInput()
}

function mostrarAyuda() {
  const opciones = inicio.data.value?.opciones ?? []
  chat.mostrarAyuda(
    'Esto es lo que puedo hacer por ahora. Escribime el pedido con tus palabras, como en los ejemplos:',
    opciones,
  )
  enfocarInput()
}

function ajustarAltura() {
  const el = input.value
  if (!el) return
  el.style.height = 'auto'
  el.style.height = `${Math.min(el.scrollHeight, 200)}px`
}

/**
 * Devuelve el foco al input. Mientras se espera la respuesta el textarea está deshabilitado,
 * y el navegador le saca el foco: hay que devolverlo cuando se vuelve a habilitar.
 */
async function enfocarInput() {
  await nextTick()
  input.value?.focus()
}

function nuevaConversacion() {
  chat.reset()
  enfocarInput()
}

onMounted(enfocarInput)

// Terminó el envío (con respuesta o con error): el cursor vuelve al chat
watch(enviando, (ahora, antes) => {
  if (antes && !ahora) enfocarInput()
})

// Bajar al último mensaje cada vez que llega uno nuevo
watch(
  () => [chat.mensajes.length, enviando.value],
  async () => {
    await nextTick()
    lista.value?.scrollTo({ top: lista.value.scrollHeight, behavior: 'smooth' })
  },
)
</script>

<template>
  <div class="chat-panel">
    <div class="chat-header">
      <div class="chat-hero">
        <div class="chat-hero-icon" style="font-size: 44px; display: grid; place-items: center">🤖</div>
        <div class="chat-hero-text">
          <div class="chat-title">✨ Asistente Neo</div>
          <div class="chat-tagline">Tu copiloto para preparar actos notariales.</div>
          <div class="chat-subtitle">
            Describí el acto notarial y te ayudo a completarlo: detecto lo que falta y armo el borrador del acto.
          </div>
        </div>
      </div>
      <div class="chat-header-actions">
        <span v-if="chat.codigoTramite" class="tramite-actual">Trámite {{ chat.codigoTramite }}</span>
        <button class="btn btn-secondary" @click="nuevaConversacion">🔄 Nueva conversación</button>
      </div>
    </div>

    <div ref="lista" class="messages">
      <!-- Bienvenida -->
      <div v-if="inicio.isLoading.value" class="message assistant">
        <div class="message-avatar">✨</div>
        <div class="message-content message-loading"><span></span><span></span><span></span></div>
      </div>
      <div v-else-if="inicio.error.value" class="message assistant">
        <div class="message-avatar">⚠️</div>
        <div class="message-content">
          {{ inicio.error.value.message }}
          <div style="margin-top: 8px">
            <button class="btn btn-secondary" @click="inicio.refetch()">Reintentar</button>
          </div>
        </div>
      </div>
      <div v-else-if="inicio.data.value" class="message assistant">
        <div class="message-avatar">✨</div>
        <div class="message-content">{{ inicio.data.value.mensaje }}</div>
      </div>

      <!-- Conversación -->
      <ChatMensaje
        v-for="m in chat.mensajes"
        :key="m.id"
        :mensaje="m"
        :activo="m.id === chat.ultimoMensaje?.id && !enviando"
        @elegir="elegirOpcion"
        @usar-ejemplo="usarEjemplo"
      />

      <!-- Esperando respuesta -->
      <div v-if="enviando" class="message assistant">
        <div class="message-avatar">✨</div>
        <div class="message-content message-loading"><span></span><span></span><span></span></div>
      </div>
    </div>

    <div class="chat-input-container">
      <div class="chat-ayuda">
        <button class="link-ayuda" :disabled="!inicio.data.value" @click="mostrarAyuda">❓ ¿Qué puedo hacer?</button>
      </div>
      <div class="chat-input-wrapper">
        <textarea
          ref="input"
          v-model="texto"
          class="chat-input"
          placeholder="Escribí tu pedido..."
          rows="1"
          :disabled="enviando"
          @keydown="onKeydown"
          @input="ajustarAltura"
        />
        <button class="send-button" :disabled="enviando || !texto.trim()" @click="enviarTexto">➤</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.chat-header-actions { align-items: center; gap: 12px; }
.tramite-actual { font-size: 12px; color: #64748b; font-family: ui-monospace, monospace; }
.chat-ayuda { margin-bottom: 8px; }
.link-ayuda {
  background: none; border: none; padding: 0; cursor: pointer;
  font-family: inherit; font-size: 13px; color: #2563eb;
}
.link-ayuda:hover:not(:disabled) { text-decoration: underline; }
.link-ayuda:disabled { color: #94a3b8; cursor: default; }
.chat-input { resize: none; }
.send-button:disabled { opacity: 0.5; cursor: not-allowed; }
</style>
