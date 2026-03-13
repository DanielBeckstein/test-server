import {Request, Response, NextFunction} from "express"
import {ParamsDictionary} from "express-serve-static-core"
import jwt from "jsonwebtoken"
import {ApiError} from "../error.js"
import {jwt_secret} from "../../config.js"

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
        req.user = jwt.verify(token, jwt_secret) as jwt.JwtPayload
        next()
    } catch {
        throw new ApiError(401, "Unauthorized")
    }
}
