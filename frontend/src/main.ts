// App bootstrap — order matters: Pinia before Router since route guards use stores
import {createApp} from "vue"
import {createPinia} from "pinia"
import {vuetify} from "./plugins/vuetify"
import router from "./router"
import App from "./App.vue"

let app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(vuetify)
app.mount("#app")
