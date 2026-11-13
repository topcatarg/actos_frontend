<script setup lang="ts">
import { computed } from 'vue'
import CampoDato from './CampoDato.vue'
import PanelInmueble from './PanelInmueble.vue'
import SeccionDatos from './SeccionDatos.vue'
import { useClausulas } from '@/queries/catalogo'
import { capitalizar, pendienteDe, personasDeRol, tieneValor, formatoFecha } from '@/actos/poder'
import type { PasoTramite } from '@/composables/usePartesTramite'
import type { EstadoPoder, Pendiente, Poder } from '@/types/poder'

const props = defineProps<{
  poder: Poder
  estado: EstadoPoder
  /** Pendientes que cayeron en revisión (estructura, generar, y lo que el acto no tenga como paso). */
  pendientes: Pendiente[]
  pasos: PasoTramite[]
}>()

const clausulas = useClausulas()

const nombres = (rol: 'otorgante' | 'apoderado') =>
  personasDeRol(props.poder, rol).map(({ persona }) => persona.nombreCompleto.valor ?? 'Sin nombre')

const resumen = computed(() => [
  { etiqueta: 'Otorgantes', valor: nombres('otorgante').join(', ') },
  { etiqueta: 'Apoderados', valor: nombres('apoderado').join(', ') },
  { etiqueta: 'Facultades', valor: props.poder.facultades.map((f) => clausulas.nombre(f.valor)).join(', ') },
  {
    etiqueta: 'Condiciones',
    valor: [props.poder.sustitucion, props.poder.vigencia, props.poder.revocabilidad]
      .filter(tieneValor)
      .map((d) => clausulas.nombre(d.valor))
      .concat(tieneValor(props.poder.fechaVigencia) ? [`hasta ${formatoFecha(props.poder.fechaVigencia.valor!)}`] : [])
      .join(' · '),
  },
])

// El inmueble se muestra acá solo si el acto no tiene un paso propio para él
const mostrarInmueble = computed(
  () => !props.pasos.some((p) => p.codigo === 'inmueble') && props.poder.requiereInmueble,
)

const pasosPendientes = computed(() => props.pasos.filter((p) => p.codigo !== 'revision' && !p.completa))
</script>

<template>
  <SeccionDatos titulo="Tipo de poder" :completo="tieneValor(poder.tipoPoder)">
    <div class="fields-grid datos-grid">
      <CampoDato
        :def="{ clave: 'tipoPoder', etiqueta: 'Tipo', obligatorio: true, formato: capitalizar }"
        :dato="poder.tipoPoder"
        :pendiente="pendienteDe(pendientes, 'tipoPoder')"
      />
    </div>
  </SeccionDatos>

  <PanelInmueble v-if="mostrarInmueble" :poder="poder" :pendientes="pendientes" />

  <SeccionDatos titulo="Resumen" :completo="estado.listoParaGenerar">
    <dl class="datos-resumen">
      <template v-for="r in resumen" :key="r.etiqueta">
        <dt>{{ r.etiqueta }}</dt>
        <dd :class="{ empty: !r.valor }">{{ r.valor || '—' }}</dd>
      </template>
    </dl>
  </SeccionDatos>

  <SeccionDatos titulo="Estado" :completo="estado.listoParaGenerar">
    <p v-if="estado.generarDocumento" class="datos-ok">✓ Confirmado: listo para generar el documento.</p>
    <p v-else-if="estado.listoParaGenerar" class="datos-ok">✓ Están todos los datos. Falta que confirmes la generación en el chat.</p>
    <template v-else>
      <p class="datos-detalle">Quedan {{ estado.pendientes.length }} pendientes.</p>
      <ul v-if="pasosPendientes.length" class="datos-pasos-pendientes">
        <li v-for="p in pasosPendientes" :key="p.codigo">
          <strong>{{ p.nombre }}</strong>: {{ p.pendientes.length }} pendiente{{ p.pendientes.length === 1 ? '' : 's' }}
        </li>
      </ul>
    </template>
  </SeccionDatos>
</template>
