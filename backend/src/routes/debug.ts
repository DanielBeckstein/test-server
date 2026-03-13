import {Router, Request, Response} from "express"
import {ApiError} from "../middleware/error.js"

let router = Router()

router.get("/trigger_test_error", async (_req: Request, _res: Response) => {
    throw new ApiError(418, "Test error triggered successfully")
})

export default router
