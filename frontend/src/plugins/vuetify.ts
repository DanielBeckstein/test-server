// Vuetify plugin setup with Material Design Icons
import "vuetify/styles"
import "@mdi/font/css/materialdesignicons.css"
import {createVuetify} from "vuetify"

export let vuetify = createVuetify({
    theme: {
        defaultTheme: "light",
    },
})
