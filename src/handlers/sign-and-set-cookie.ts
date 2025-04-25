import { NextFunction, Response } from "express";
import { MyRequest } from "../types";
import { sign } from "jsonwebtoken";

export default async (req: MyRequest, res: Response, next: NextFunction) => {
    try {
        if (!res.locals.token)
            throw new Error("no_token_to_sign")

        if (!req.config?.auth)
            throw new Error("no_auth_config")

        if (!req.config?.auth?.secret)
            throw new Error("no_auth_secret")

        const { access: _access, refresh: _refresh } = res.locals.token

        const access = sign(_access, req.config.auth.secret, { expiresIn: req.config.auth.access })

        const refresh = _refresh && req.config.auth.refresh && sign(_refresh, req.config.auth.refreshsecret ?? req.config.auth.secret, { expiresIn: req.config.auth.refresh })

        if (req.browser) {
            if (refresh)
                res.cookie('refresh', refresh, {
                    httpOnly: true,
                    sameSite: "none",
                    secure: true,
                    maxAge: (req.config.auth.refresh ?? 0) * 1000 // maxAge in milliseconds
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