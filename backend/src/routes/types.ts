import {AuthRequest} from "../middleware/auth/jwt.js"

export type MyAuthRequest = AuthRequest<{ id: string }>
