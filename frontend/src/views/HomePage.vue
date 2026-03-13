<script setup lang="ts">
import {onMounted} from "vue"
import {useLinksStore} from "@/stores/links"
import LinkCard from "@/components/LinkCard.vue"

let store = useLinksStore()

onMounted(() => {
  store.fetch_links()
})
</script>

<template>
  <v-container>
    <v-progress-linear v-if="store.loading" indeterminate color="primary"/>

    <template v-if="!store.loading && store.links.length === 0">
      <v-alert type="info" class="mt-4">
        No links configured yet. An administrator can add links via the Admin panel.
      </v-alert>
    </template>

    <v-row>
      <v-col
          v-for="link in store.links"
          :key="link.id"
          cols="12"
          sm="6"
          md="4"
          lg="3"
      >
        <LinkCard :link="link"/>
      </v-col>
    </v-row>
  </v-container>
</template>
