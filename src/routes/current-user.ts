import { NextFunction, Response } from "express";
import { MyRequest } from "../types";
import { extract } from "../common";
import ModelFactory from "../model-factory";

export default (logic?: (req: MyRequest) => any) => {
    return async (req: MyRequest, res: Response, next: NextFunction) => {
        try {
            if (logic) {
                res.json(await logic(req))
                return
            }

            if (!req.config?.auth?.collection)
                throw new Error("no_auth_collection")

            if (!req.user)
                throw new Error("no_token")

            const { _id, permissions } = req.user

            if (!_id)
                throw new Error("no_id")

            let { project } = extract(permissions, req.config.collections[req.config.auth.collection].permissions, "get")

            if (project === true)
                project = []

            const user = await ModelFactory.get(req.config.auth.collection).findOne({ _id }, project)

            if (!user)
                throw new Error("no_user")

            res.json(user)

        } catch (error) {
            next(error)
        }
    }
}