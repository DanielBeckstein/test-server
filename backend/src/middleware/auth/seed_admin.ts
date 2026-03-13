import bcrypt from "bcrypt"
import {client} from "../../elastic/client.js"

// Creates a default admin user if no users exist yet (first-run bootstrap)
export async function seed_admin() {
    let result = await client.search({
        index: "users",
        body: {query: {match_all: {}}},
        size: 1,
    })

    // Only seed when the users index is completely empty
    if (result.hits.hits.length > 0) {
        console.log("Admin user already exists, skipping seed")
        return
    }

    // WARNING: hardcoded dev password — must be changed in production
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
