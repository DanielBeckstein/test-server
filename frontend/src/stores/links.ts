import {defineStore} from "pinia"
import {ref} from "vue"
import {api} from "@/lib/axios"

export interface Link {
    id: string
    url: string

    [key: string]: unknown
}

export let useLinksStore = defineStore("links", () => {
    let links = ref<Link[]>([])
    let loading = ref(false)

    async function fetch_links() {
        loading.value = true
        let {data} = await api.get<Link[]>("/links")
        links.value = data
        loading.value = false
    }

    async function create_link(body: Record<string, unknown>) {
        let {data} = await api.post<Link>("/links", body)
        links.value.push(data)
        return data
    }

    async function update_link(id: string, body: Record<string, unknown>) {
        let {data} = await api.put<Link>("/links/" + id, body)
        let idx = links.value.findIndex((l) => l.id === id)
        if (idx !== -1) links.value[idx] = data
        return data
    }

    async function delete_link(id: string) {
        await api.delete("/links/" + id)
        links.value = links.value.filter((l) => l.id !== id)
    }

    return {links, loading, fetch_links, create_link, update_link, delete_link}
})
