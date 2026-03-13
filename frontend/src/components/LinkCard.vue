<script setup lang="ts">
import type {Link} from "@/stores/links"
import {reserved_keys} from "@/lib/constants"

let props = defineProps<{ link: Link }>()

function get_custom_attrs(link: Link): Array<{ key: string; value: unknown }> {
  let attrs: Array<{ key: string; value: unknown }> = []
  for (let key of Object.keys(link)) {
    if (!reserved_keys.has(key)) {
      attrs.push({key, value: link[key]})
    }
  }
  return attrs
}
</script>

<template>
  <v-card :href="props.link.url" target="_blank" hover height="100%" class="d-flex flex-column">
    <v-card-item>
      <template #prepend>
        <v-icon v-if="props.link.icon" :icon="String(props.link.icon)" size="large"/>
      </template>
      <v-card-title class="text-truncate">
        {{ props.link.title || props.link.url }}
      </v-card-title>
      <v-card-subtitle v-if="props.link.title" class="text-truncate">
        {{ props.link.url }}
      </v-card-subtitle>
    </v-card-item>

    <v-card-text v-if="props.link.description" class="flex-grow-1">
      {{ props.link.description }}
    </v-card-text>

    <v-card-text v-if="get_custom_attrs(props.link).length > 0" class="pt-0">
      <v-chip
          v-for="attr in get_custom_attrs(props.link)"
          :key="attr.key"
          size="small"
          class="mr-1 mb-1"
          label
      >
        {{ attr.key }}: {{ attr.value }}
      </v-chip>
    </v-card-text>
  </v-card>
</template>
