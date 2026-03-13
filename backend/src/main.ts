import {init_indices} from "./elastic/client.js"
import {seed_admin} from "./seed.js"
import {create_app} from "./app.js"

let app = create_app()
let port = parseInt(process.env.PORT || "3001")

async function start() {
    await init_indices()
    await seed_admin()

    app.listen(port, () => {
        console.log("Server running on port " + port)
    })
}

start()
