import {createRouter, createWebHistory} from "vue-router"
import {useAuthStore} from "@/stores/auth"

let router = createRouter({
    history: createWebHistory(),
    routes: [
        {path: "/", component: () => import("@/views/HomePage.vue")},
        {path: "/login", component: () => import("@/views/LoginPage.vue")},
        {
            path: "/admin",
            component: () => import("@/views/AdminPage.vue"),
            meta: {requires_auth: true},
        },
    ],
})

router.beforeEach((to) => {
    let auth = useAuthStore()
    if (to.meta.requires_auth && !auth.is_authenticated) {
        return {path: "/login", query: {redirect: to.fullPath}}
    }
})

export default router
