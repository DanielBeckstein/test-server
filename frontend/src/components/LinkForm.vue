<script setup lang="ts">
import { ref, watch } from "vue"
import type { Link } from "@/stores/links"
import type { VForm } from "vuetify/components"

let props = defineProps<{ link: Link | null }>()
let emit = defineEmits<{
  save: [body: Record<string, unknown>]
  cancel: []
}>()

interface Attr {
  key: string
  value: string
}

let form_ref = ref<InstanceType<typeof VForm>>()
let url = ref("")
let title = ref("")
let icon = ref("")
let description = ref("")
let attributes = ref<Attr[]>([])

let reserved_keys = new Set(["id", "url", "title", "icon", "category", "description", "position", "created_at", "updated_at"])

let rules = {
  required: (v: string) => !!v || "Required",
  url: (v: string) => /^https?:\/\/.+/.test(v) || "Must be a valid URL",
}

watch(() => props.link, (link) => {
  if (link) {
    url.value = String(link.url || "")
    title.value = String(link.title || "")
    icon.value = String(link.icon || "")
    description.value = String(link.description || "")
    attributes.value = []
    for (let key of Object.keys(link)) {
      if (!reserved_keys.has(key)) {
        attributes.value.push({ key, value: String(link[key]) })
      }
    }
  } else {
    url.value = ""
    title.value = ""
    icon.value = ""
    description.value = ""
    attributes.value = []
  }
}, { immediate: true })

function add_attr() {
  attributes.value.push({ key: "", value: "" })
}

function remove_attr(i: number) {
  attributes.value.splice(i, 1)
}

async function handle_save() {
  let { valid } = await form_ref.value!.validate()
  if (!valid) return

  let body: Record<string, unknown> = { url: url.value }
  if (title.value) body.title = title.value
  if (icon.value) body.icon = icon.value
  if (description.value) body.description = description.value

  for (let attr of attributes.value) {
    if (attr.key.trim()) {
      body[attr.key.trim()] = attr.value
    }
  }

  emit("save", body)
}
</script>

<template>
  <v-card :title="props.link ? 'Edit Link' : 'Add Link'">
    <v-card-text>
      <v-form ref="form_ref" @submit.prevent="handle_save">
        <v-text-field
          v-model="url"
          label="URL"
          :rules="[rules.required, rules.url]"
          class="mb-2"
        />
        <v-text-field v-model="title" label="Title" class="mb-2" />
        <v-text-field v-model="icon" label="Icon (e.g. mdi-github)" class="mb-2" />
        <v-textarea v-model="description" label="Description" rows="2" class="mb-2" />

        <h3 class="text-subtitle-1 font-weight-bold mb-2">Custom Attributes</h3>

        <v-row
          v-for="(attr, i) in attributes"
          :key="i"
          align="center"
          dense
        >
          <v-col cols="5">
            <v-text-field v-model="attr.key" label="Key" density="compact" hide-details />
          </v-col>
          <v-col cols="5">
            <v-text-field v-model="attr.value" label="Value" density="compact" hide-details />
          </v-col>
          <v-col cols="2" class="d-flex justify-center">
            <v-btn icon variant="text" color="error" size="small" @click="remove_attr(i)">
              <v-icon>mdi-minus-circle</v-icon>
            </v-btn>
          </v-col>
        </v-row>

        <v-btn
          variant="outlined"
          prepend-icon="mdi-plus"
          size="small"
          class="mt-2"
          @click="add_attr"
        >
          Add Attribute
        </v-btn>
      </v-form>
    </v-card-text>

    <v-card-actions>
      <v-spacer />
      <v-btn @click="emit('cancel')">Cancel</v-btn>
      <v-btn color="primary" @click="handle_save">Save</v-btn>
    </v-card-actions>
  </v-card>
</template>
