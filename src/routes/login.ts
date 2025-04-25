import { NextFunction, Response } from "express";
import { MyRequest } from "../types";
import ModelFactory from "../model-factory";
import * as bcrypt from "bcrypt"

export default (logic?: (req: MyRequest) => any) => {
    return async (req: MyRequest, res: Response, next: NextFunction) => {
        try {
            if (!logic) {
                if (!req.config?.auth?.collection)
                    throw new Error("no_auth_collection")

                if (!req.config?.auth?.username || !req.config?.auth?.password)
                    throw new Error("no_auth_username_password_field")

                const u = req.body[req.config.auth.username]
                const p = req.body[req.config.auth.password]

                if (!u || !p)
                    throw new Error("bad_input")

                const user = await ModelFactory.get(req.config.auth.collection).findOne({ [req.config.auth.username]: u })

                if (!user)
                    throw new Error("no_user")

                if (!bcrypt.compareSync(p, user[req.config.auth.password]))
                    throw new Error("wrong_password")

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