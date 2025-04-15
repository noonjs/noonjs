import { NextFunction, Response } from "express";
import { MyRequest } from "../types";
import ModelFactory from "../model-factory";
import { getTokens } from "../common";

export default async (req: MyRequest, res: Response, next: NextFunction): Promise<any> => {
    try {
        if (!req.config?.auth?.collection)
            throw new Error("no_auth_collection")

        const user = await ModelFactory.get(req.config.auth.collection).create(req.body)
        await user.save()

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