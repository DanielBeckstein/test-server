import express from "express"
import cors from "cors"
import { init_indices } from "./elastic/client"
import { seed_admin } from "./seed"
import auth_router from "./routes/auth"
import links_router from "./routes/links"
import { error_middleware } from "./middleware/error"

let app = express()
let port = parseInt(process.env.PORT || "3001")

app.use(cors())
app.use(express.json())

app.use("/api/auth", auth_router)
app.use("/api/links", links_router)

app.use(error_middleware)

async function start() {
  await init_indices()
  await seed_admin()

  app.listen(port, () => {
    console.log("Server running on port " + port)
  })
}

start()
