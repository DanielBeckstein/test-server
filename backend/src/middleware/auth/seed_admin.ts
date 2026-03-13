import bcrypt from "bcrypt"
import {client} from "../../elastic/client.js"

export async function seed_admin() {
    let result = await client.search({
        index: "users",
        body: {query: {match_all: {}}},
        size: 1,
    })

    if (result.hits.hits.length > 0) {
        console.log("Admin user already exists, skipping seed")
        return
    }

    let password_hash = await bcrypt.hash("admin123", 10)

    await client.index({
        index: "users",
        body: {
            username: "admin",
            password_hash,
        },
        refresh: true,
    })

    console.log("Seeded admin user")
}
