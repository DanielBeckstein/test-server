<script setup lang="ts">
import { ref, onMounted } from "vue"
import { useLinksStore, type Link } from "@/stores/links"
import LinkForm from "@/components/LinkForm.vue"

let store = useLinksStore()

let dialog = ref(false)
let dialog_delete = ref(false)
let editing_link = ref<Link | null>(null)
let deleting_id = ref<string | null>(null)

let headers = [
  { title: "URL", key: "url" },
  { title: "Title", key: "title" },
  { title: "Actions", key: "actions", sortable: false, align: "end" as const },
]

onMounted(() => {
  store.fetch_links()
})

function open_create() {
  editing_link.value = null
  dialog.value = true
}

function open_edit(link: Link) {
  editing_link.value = link
  dialog.value = true
}

function open_delete(link: Link) {
  deleting_id.value = link.id
  dialog_delete.value = true
}

async function handle_save(body: Record<string, unknown>) {
  if (editing_link.value) {
    await store.update_link(editing_link.value.id, body)
  } else {
    await store.create_link(body)
  }
  dialog.value = false
}

async function confirm_delete() {
  if (deleting_id.value) {
    await store.delete_link(deleting_id.value)
  }
  dialog_delete.value = false
}
</script>

<template>
  <v-container>
    <v-row class="mb-4" align="center">
      <v-col>
        <h1 class="text-h4">Manage Links</h1>
      </v-col>
      <v-col cols="auto">
        <v-btn color="primary" prepend-icon="mdi-plus" @click="open_create">
          Add Link
        </v-btn>
      </v-col>
    </v-row>

    <v-data-table
      :headers="headers"
      :items="store.links"
      :loading="store.loading"
      item-value="id"
      hide-default-footer
    >
      <template #item.actions="{ item }">
        <v-icon class="mr-2" @click="open_edit(item)">mdi-pencil</v-icon>
        <v-icon color="error" @click="open_delete(item)">mdi-delete</v-icon>
      </template>
    </v-data-table>

    <v-btn to="/" variant="outlined" prepend-icon="mdi-arrow-left" class="back-btn mt-4">
      Go back to the Link List
    </v-btn>

    <v-dialog v-model="dialog" max-width="640">
      <LinkForm
        :link="editing_link"
        @save="handle_save"
        @cancel="dialog = false"
      />
    </v-dialog>

    <v-dialog v-model="dialog_delete" max-width="400">
      <v-card title="Confirm Delete">
        <v-card-text>This action cannot be undone.</v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn @click="dialog_delete = false">Cancel</v-btn>
          <v-btn color="error" @click="confirm_delete">Delete</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<style scoped>
.back-btn {
  border-color: black;
}
</style>
