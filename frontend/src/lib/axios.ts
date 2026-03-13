import axios from "axios"

export let api = axios.create({baseURL: import.meta.env.VITE_API_URL})

api.interceptors.request.use((config) => {
    let token = localStorage.getItem("token")
    if (token) config.headers.Authorization = "Bearer " + token
    return config
})
