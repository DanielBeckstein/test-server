<script setup lang="ts">
import {ref} from "vue"
import {useRouter, useRoute} from "vue-router"
import {useAuthStore} from "@/stores/auth"
import type {VForm} from "vuetify/components"

let auth = useAuthStore()
let router = useRouter()
let route = useRoute()

let form_ref = ref<InstanceType<typeof VForm>>()
let username = ref("")
let password = ref("")
let error_msg = ref("")
let submitting = ref(false)

let rules = {
  required: (v: string) => !!v || "Required",
}

async function handle_submit() {
  let {valid} = await form_ref.value!.validate()
  if (!valid) return

  submitting.value = true
  error_msg.value = ""

  try {
    await auth.login(username.value, password.value)
    let redirect = (route.query.redirect as string) || "/admin"
    router.push(redirect)
  } catch (err: any) {
    let msg = err?.response?.data?.error
    error_msg.value = msg || "Login failed"
  }

  submitting.value = false
}
</script>

<template>
  <v-container class="fill-height" fluid>
    <v-row justify="center">
      <v-col cols="12" sm="8" md="4">
        <v-card title="Admin Login" class="pa-4">
          <v-card-text>
            <v-alert v-if="error_msg" type="error" class="mb-4" closable @click:close="error_msg = ''">
              {{ error_msg }}
            </v-alert>

            <v-form ref="form_ref" @submit.prevent="handle_submit">
              <v-text-field
                  v-model="username"
                  label="Username"
                  :rules="[rules.required]"
                  prepend-inner-icon="mdi-account"
                  class="mb-2"
              />
              <v-text-field
                  v-model="password"
                  label="Password"
                  type="password"
                  :rules="[rules.required]"
                  prepend-inner-icon="mdi-lock"
                  class="mb-4"
              />
              <v-btn
                  type="submit"
                  color="primary"
                  block
                  :loading="submitting"
              >
                Login
              </v-btn>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
