import { AuthRequest } from "../middleware/jwt"

export type MyAuthRequest = AuthRequest<{ id: string }>
