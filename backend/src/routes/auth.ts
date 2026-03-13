import {Router, Request, Response} from "express"
import {validate_user} from "../middleware/auth/validate_user.js"

let router = Router()

router.post("/login", async (req: Request, res: Response) => {
    let {username, password} = req.body
    let token = await validate_user(username, password)
    res.json({token})
})

export default router
