import {init_indices} from "./elastic/client.js"
import {seed_admin} from "./middleware/auth/seed_admin.js"
import {create_app} from "./app.js"

let app = create_app()
let port = parseInt(process.env.PORT || "3001")

// Elasticsearch indices and seed data must exist before accepting requests
async function start() {
    await init_indices()
    await seed_admin()

    app.listen(port, () => {
        console.log("Server running on port " + port)
    })
}

start()
