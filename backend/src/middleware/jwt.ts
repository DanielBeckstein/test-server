import {Request, Response, NextFunction} from "express"
import {ParamsDictionary} from "express-serve-static-core"
import jwt from "jsonwebtoken"
import {ApiError} from "./error"

let jwt_secret = process.env.JWT_SECRET || "dev_secret"

export interface AuthRequest<P = ParamsDictionary> extends Request<P> {
    user?: jwt.JwtPayload
}

export function auth_middleware(req: AuthRequest, _res: Response, next: NextFunction) {
    let header = req.headers.authorization
    if (!header || !header.startsWith("Bearer ")) {
        throw new ApiError(401, "Unauthorized")
    }

    let token = header.slice(7)

    try {
        let decoded = jwt.verify(token, jwt_secret) as jwt.JwtPayload
        req.user = decoded
        next()
    } catch {
        throw new ApiError(401, "Unauthorized")
    }
}
