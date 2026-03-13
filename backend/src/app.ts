import express from "express"
import cors from "cors"
import auth_router from "./routes/auth.js"
import links_router from "./routes/links.js"
import {error_middleware} from "./middleware/error.js"

export function create_app() {
    let app = express()

    app.use(cors())
    app.use(express.json())

    app.use("/api/auth", auth_router)
    app.use("/api/links", links_router)

    app.use(error_middleware)

    return app
}
