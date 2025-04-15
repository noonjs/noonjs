import { NextFunction, Response } from "express"
import { MyRequest } from "../types"

export default (req: MyRequest, _: Response, next: NextFunction) => {
    try {
        const { userAgent } = req.headers ?? {}
        req.browser = userAgent && /(Mozilla|Chrome|Safari|Opera|Edg|Firefox)/.test(userAgent as string)
    } catch (error) {
        // next(error)
    } finally {
        next()
    }
}