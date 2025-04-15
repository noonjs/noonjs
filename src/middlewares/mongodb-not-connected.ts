import { NextFunction, Response } from "express"
import { MyRequest } from "../types"
import mongoose from "mongoose"

export default (req: MyRequest, res: Response, next: NextFunction) => {
    const [_, first, ...params] = req.url.split("/")
    if (req.config?.collections[first] && mongoose.connection.readyState !== 1)
        next({ message: "mongodb_not_connected" })
    next()
}