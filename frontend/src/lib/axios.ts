// Centralized API client — all requests go through this instance for consistent base URL and auth
import axios from "axios"

export let api = axios.create({baseURL: import.meta.env.VITE_API_URL})

// Automatically attach JWT from localStorage so callers don't need to handle auth
api.interceptors.request.use((config) => {
    let token = localStorage.getItem("token")
    if (token) config.headers.Authorization = "Bearer " + token
    return config
})
