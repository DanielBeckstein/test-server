<script setup lang="ts">
import { useAuthStore } from "@/stores/auth"
import { useRouter } from "vue-router"

let auth = useAuthStore()
let router = useRouter()

function logout() {
  auth.logout()
  router.push("/")
}
</script>

<template>
  <v-app>
    <v-app-bar color="primary" density="comfortable">
      <v-app-bar-title>
        <router-link to="/" class="text-white text-decoration-none">
          Dev Tools - Link List
        </router-link>
      </v-app-bar-title>

      <template #append>
        <v-btn v-if="!auth.is_authenticated" to="/login" variant="outlined">
          Login
        </v-btn>
        <template v-else>
          <v-btn to="/admin" variant="outlined" class="admin-btn">Admin</v-btn>
          <v-btn variant="outlined" class="logout-btn" @click="logout">Logout</v-btn>
        </template>
      </template>
    </v-app-bar>

    <v-main>
      <router-view />
    </v-main>
  </v-app>
</template>

<style scoped>
.admin-btn {
  margin-right: 4em;
  border-color: white;
  color: white;
}
.logout-btn {
  margin-right: 1em;
}
</style>
