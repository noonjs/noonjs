import { NextFunction, Response } from "express";
import { hasPermission } from "../common";
import { MyRequest } from "../types";

export default (req: MyRequest, res: Response, next: NextFunction) => {
    try {
        const [_, first, ...params] = req.url.split("/")
        const { permissions = ["*"] } = req.user ?? {}

        if (!req.config?.collections[first]) {
            next()
            return
        }

        if (!hasPermission(permissions, req.config?.collections[first].permissions, req.method.toLowerCase()))
            throw new Error("method_not_allowed")
        else
            next()

    } catch (error) {
        next(error)
    }
}