import { NextFunction, Response } from "express"
import { MyRequest } from "../types"
import { logError } from "../debug"

export default (emit: (error: any) => void) => {
    // HttpError
    return (err: Error | any, req: MyRequest, res: Response, next: NextFunction) => {
        logError(err)
        emit(err.message)

        const statusCode = err.status || err.statusCode || 500;

        if (req.config?.error === false) {
            res.status(statusCode).json({ error: false })
            return
        }

        if (!req.config?.error) {
            res.status(statusCode).json({ error: err.message })
            return
        }

        if (typeof req.config?.error === "string") {
            res.status(statusCode).json({ error: req.config?.error })
            return
        }

        res.status(statusCode).json({ error: req.config?.error[err] ?? req.config?.error[statusCode] ?? null })
    }
}