import { NextFunction, Response } from "express";
import { MyRequest } from "../types";
import ModelFactory from "../model-factory";
import { verify } from "jsonwebtoken";

export default async (req: MyRequest, res: Response, next: NextFunction): Promise<any> => {
    try {
        if (!req.config?.auth?.collection)
            throw new Error("no_auth_collection")

        let _id = null

        const { refresh } = req.browser ? req.cookies : req.body

        if (refresh && req.config.auth && req.config.auth.refreshsecret) {
            const decoded = verify(refresh, req.config.auth.refreshsecret ?? req.config.auth.secret)
            if (decoded)
                _id = (decoded as { _id: string })._id
        }

        if (!_id)
            throw new Error("no_refresh_token")

        const user = await ModelFactory.get(req.config.auth.collection).findOne({ _id })

        const { permissions } = user

        res.locals.token = {
            access: { _id, permissions }
        }

        next()
    } catch (error) {
        next(error)
    }
}