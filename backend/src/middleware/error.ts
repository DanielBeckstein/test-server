import {Request, Response, NextFunction} from "express"

export class ApiError extends Error {
    status_code: number

    constructor(status_code: number, message: string) {
        super(message)
        this.status_code = status_code
    }
}

export function error_middleware(err: Error, _req: Request, res: Response, _next: NextFunction) {
    if (err instanceof ApiError) {
        res.status(err.status_code).json({error: err.message})
        return
    }

    console.error(err)
    res.status(500).json({error: "Internal server error"})
}
