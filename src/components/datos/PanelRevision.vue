<script setup lang="ts">
// Revisión final: un resumen de cada pestaña activa del acto y el estado general.
// Se arma recorriendo las pestañas por su bloque, así sirve para cualquier acto.
import { computed } from 'vue'
import CampoDato from './CampoDato.vue'
import SeccionDatos from './SeccionDatos.vue'
import { BLOQUES } from '@/bloques'
import { useClausulas } from '@/queries/catalogo'
import { capitalizar, formatoFecha } from '@/comun/campos'
import { personasDeRol, tieneValor } from '@/actos/poder'
import { pendienteDe } from '@/tramite/pendientes'
import type { PasoTramite } from '@/composables/usePartesTramite'
import type { EstadoDatos, Pendiente } from '@/types/comun'
import type { Poder } from '@/types/poder'

const props = defineProps<{
  datos: Poder
  estado: EstadoDatos
  /** Pendientes que cayeron en revisión (los que no tienen pestaña propia). */
  pendientes: Pendiente[]
  pasos: PasoTramite[]
}>()

const clausulas = useClausulas()

function resumenDe(paso: PasoTramite): string {
  const d = props.datos
  switch (paso.bloque) {
    case 'persona': {
      const primera = props.pasos.find((p) => p.bloque === 'persona')?.codigo === paso.codigo
      return personasDeRol(d, paso.rol, primera).map(({ persona }) => persona.nombreCompleto.valor ?? 'Sin nombre').join(', ')
    }
    case 'facultades':
      return d.facultades.map((f) => clausulas.nombre(f.valor)).join(', ')
    case 'condiciones':
      return [d.sustitucion, d.vigencia, d.revocabilidad]
        .filter(tieneValor)
        .map((x) => clausulas.nombre(x.valor))
        .concat(tieneValor(d.fechaVigencia) ? [`hasta ${formatoFecha(d.fechaVigencia.valor!)}`] : [])
        .join(' · ')
    default: {
      const def = BLOQUES[paso.bloque]
      if (!def) return ''
      if (d.bloquesDescartados?.includes(def.codigo)) return 'No aplica (en general)'
      // De cada instancia, los dos primeros campos con valor (ej. "AB123CD · 2015")
      return (d.bloques?.[def.codigo] ?? [])
        .map((inst) => def.campos.map((c) => inst[c.clave]?.valor).filter(Boolean).slice(0, 2).join(' · '))
        .filter(Boolean)
        .join(' / ')
    }
  }
}

const resumen = computed(() =>
  props.pasos.filter((p) => p.bloque !== 'revision').map((p) => ({ codigo: p.codigo, etiqueta: p.nombre, valor: resumenDe(p) })),
)

const pasosPendientes = computed(() => props.pasos.filter((p) => p.bloque !== 'revision' && !p.completa))
</script>

<template>
  <!-- Subtipo del acto: en el poder, el tipo de poder -->
  <SeccionDatos v-if="datos.tipoPoder" titulo="Tipo" :completo="tieneValor(datos.tipoPoder)">
    <div class="fields-grid datos-grid">
      <CampoDato
        :def="{ clave: 'tipoPoder', etiqueta: 'Tipo', obligatorio: true, formato: capitalizar }"
        :dato="datos.tipoPoder"
        :pendiente="pendienteDe(pendientes, 'tipoPoder')"
      />
    </div>
  </SeccionDatos>

  <SeccionDatos titulo="Resumen" :completo="estado.listoParaGenerar">
    <dl class="datos-resumen">
      <template v-for="r in resumen" :key="r.codigo">
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
