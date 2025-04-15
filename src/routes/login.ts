import { NextFunction, Response } from "express";
import { MyRequest } from "../types";
import ModelFactory from "../model-factory";
import { getTokens } from "../common";
import * as bcrypt from "bcrypt"

export default async (req: MyRequest, res: Response, next: NextFunction) => {
    try {
        if (!req.config?.auth?.collection)
            throw new Error("no_auth_collection")

        const u = req.body[req.config.auth.username]
        const p = req.body[req.config.auth.password]

        if (!u || !p)
            throw new Error("bad_input")

        const user = await ModelFactory.get(req.config.auth.collection).findOne({ [req.config.auth.username]: u })

        if (!user)
            throw new Error("no_user")

        if (!bcrypt.compareSync(p, user[req.config.auth.password]))
            throw new Error("wrong_password")

        const { access, refresh } = getTokens(user, req.config)

        if (!access)
            throw new Error("no_access_generated")

        if (req.browser) {
            if (refresh)
                res.cookie('refresh', refresh, {
                    httpOnly: true,
                    sameSite: "none",
                    secure: true,
                    maxAge: req.config.auth.refresh
                });

            res.json({ access })
        }
        else {
            res.json({ access, refresh })
        }

    } catch (error) {
        next(error)
    }
}