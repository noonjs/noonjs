import { NextFunction, Response } from "express";
import { MyRequest } from "../types";
import ModelFactory from "../model-factory";

export default (logic?: (req: MyRequest) => any) => {

    return async (req: MyRequest, res: Response, next: NextFunction): Promise<any> => {
        try {
            if (!logic) {

                if (!req.config?.auth?.collection)
                    throw new Error("no_auth_collection")

                const user = await ModelFactory.get(req.config.auth.collection).create(req.body)
                await user.save()

                const { _id, permissions } = user

                res.locals.token = {
                    access: { _id, permissions },
                    refresh: { _id }
                }
            } else {
                res.locals.token = await logic(req)
            }

            next()

        } catch (error) {
            next(error)
        }
    }
}