import { NextFunction, Response } from "express"
import { MyRequest } from "../types"

export default (req: MyRequest, _: Response, next: NextFunction) => {
    try {
        const userAgent = req.headers['user-agent'] ?? "";
        req.browser = /mozilla|chrome|safari|firefox|opera|msie|trident/i.test(userAgent.toLowerCase());
    } catch (error) {
        // next(error)
    } finally {
        next()
    }
}