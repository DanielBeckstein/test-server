import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"
import {client} from "../../elastic/client.js"
import {ApiError} from "../error.js"
import {jwt_secret} from "../../config.js"

export async function validate_user(username: string, password: string): Promise<string> {
    if (!username || !password) {
        throw new ApiError(400, "Username and password required")
    }

    let result = await client.search({
        index: "users",
        body: {
            query: {match: {username}},
        },
    })

    // Use generic "Invalid credentials" to avoid leaking whether username exists
    let hit = result.hits.hits[0]
    if (!hit) {
        throw new ApiError(401, "Invalid credentials")
    }

    let user = hit._source as { username: string; password_hash: string }
    let valid = await bcrypt.compare(password, user.password_hash)

    if (!valid) {
        throw new ApiError(401, "Invalid credentials")
    }

    let token = jwt.sign({username: user.username, user_id: hit._id}, jwt_secret, {
        expiresIn: "24h",
    })

    return token
}
