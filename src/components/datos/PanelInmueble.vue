<script setup lang="ts">
import CampoDato from './CampoDato.vue'
import SeccionDatos from './SeccionDatos.vue'
import { CAMPOS_INMUEBLE, pendienteDe } from '@/actos/poder'
import type { Pendiente, Poder } from '@/types/poder'

defineProps<{ poder: Poder; pendientes: Pendiente[] }>()
</script>

<template>
  <SeccionDatos titulo="Inmueble" :completo="!pendientes.some((p) => p.grupo === 'inmueble')">
    <div class="fields-grid datos-grid">
      <CampoDato
        v-for="c in CAMPOS_INMUEBLE"
        :key="c.clave"
        :def="c"
        :dato="poder.inmueble[c.clave]"
        :pendiente="pendienteDe(pendientes, `inmueble.${c.clave}`)"
      />
    </div>
  </SeccionDatos>
</template>
