import {Router, Request, Response} from "express"
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"
import {client} from "../elastic/client"
import {ApiError} from "../middleware/error"

let router = Router()
let jwt_secret = process.env.JWT_SECRET || "dev_secret"

router.post("/login", async (req: Request, res: Response) => {
    let {username, password} = req.body

    if (!username || !password) {
        throw new ApiError(400, "Username and password required")
    }

    let result = await client.search({
        index: "users",
        body: {
            query: {match: {username}},
        },
    })

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

    res.json({token})
})

export default router
