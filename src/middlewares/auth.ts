import { verify } from "jsonwebtoken"
import { MyRequest } from "../types";
import { Response, NextFunction } from "express";
import { logInfo } from "../debug";

export default (req: MyRequest, res: Response, next: NextFunction) => {
    try {
        if (!req.config?.auth) {
            next()
            return
        }

        const { authorization } = req.headers ?? {}

        if (authorization && req.config?.auth?.secret) {
            const decoded = verify(authorization.replace("Bearer", "").trim(), req.config?.auth?.secret);
            req.user = decoded;
            logInfo(`User: ${JSON.stringify(req.user)}`)
        }

        next()

    } catch (error: any) {
        if (error.name === "TokenExpiredError")
            next({ message: "token_expired" })
        else
            next(error)
    }
}