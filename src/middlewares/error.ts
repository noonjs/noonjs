import { NextFunction, Response } from "express"
import { MyRequest } from "../types"
import { logError } from "../debug"

export default (emit: (error: any) => void) => {
    // HttpError
    return (err: Error | any, req: MyRequest, res: Response, next: NextFunction) => {
        logError(err)
        emit(err.message)

        if (req.config?.error === false) {
            res.status(500).json({ error: false })
            return
        }

        if (!req.config?.error) {
            res.status(500).json({ error: err.message })
            return
        }

        if (typeof req.config?.error === "string") {
            res.status(500).json({ error: req.config?.error })
            return
        }

        const statusCode = err.status || err.statusCode || 500; // Default to 500 if not provided

        res.status(statusCode).json({ error: req.config?.error[err] ?? req.config?.error[statusCode] ?? null })
    }
}