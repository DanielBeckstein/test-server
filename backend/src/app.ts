import express from "express"
import cors from "cors"
import auth_router from "./routes/auth.js"
import links_router from "./routes/links.js"
import debug_router from "./routes/debug.js"
import {error_middleware} from "./middleware/error.js"

export function create_app() {
    let app = express()

    app.use(cors())
    app.use(express.json())

    // --- Route registration ---
    app.use("/api/auth", auth_router)
    app.use("/api/links", links_router)
    app.use("/api/debug", debug_router)

    // Must be registered last to catch errors from all routes above
    app.use(error_middleware)

    return app
}
