import {defineStore} from "pinia"
import {ref, computed} from "vue"
import {api} from "@/lib/axios"

// Auth state with localStorage persistence so sessions survive page reloads
export let useAuthStore = defineStore("auth", () => {
    let token = ref<string | null>(localStorage.getItem("token"))
    let is_authenticated = computed(() => !!token.value)

    async function login(username: string, password: string) {
        let {data} = await api.post<{ token: string }>("/auth/login", {username, password})
        token.value = data.token
        localStorage.setItem("token", data.token)
    }

    function logout() {
        token.value = null
        localStorage.removeItem("token")
    }

    return {token, is_authenticated, login, logout}
})
