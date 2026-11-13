<script setup lang="ts">
import { ref } from 'vue'

const props = withDefaults(defineProps<{ titulo: string; completo?: boolean; abierta?: boolean }>(), {
  completo: false,
  abierta: true,
})
const expandida = ref(props.abierta)
</script>

<template>
  <div class="seccion" :class="{ expanded: expandida }">
    <div class="seccion-header" @click="expandida = !expandida">
      <div class="seccion-header-left">
        <div class="seccion-status" :class="completo ? 'completo' : 'parcial'">{{ completo ? '✓' : '!' }}</div>
        <div class="seccion-title">{{ titulo }}</div>
        <slot name="extra" />
      </div>
      <div class="seccion-chevron">▼</div>
    </div>
    <div class="seccion-body">
      <div class="seccion-fields">
        <slot />
      </div>
    </div>
  </div>
</template>
